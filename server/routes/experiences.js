import express from 'express';
import { body, validationResult } from 'express-validator';
import { query } from '../config/database.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Track page view
const trackView = async (experienceId, userId, ipAddress) => {
  try {
    // Check if this user/IP has already viewed this experience today
    const existingView = await query(`
      SELECT id FROM interview_views 
      WHERE experience_id = $1 AND ip_address = $2 
      AND created_at > NOW() - INTERVAL '24 hours'
    `, [experienceId, ipAddress]);

    if (existingView.rows.length === 0) {
      await query(`
        INSERT INTO interview_views (experience_id, user_id, ip_address)
        VALUES ($1, $2, $3)
      `, [experienceId, userId, ipAddress]);
    }
  } catch (error) {
    console.error('Error tracking view:', error);
  }
};

// Track website analytics
const trackWebsiteAnalytics = async (req, userId = null) => {
  try {
    const ipAddress = req.ip || req.connection.remoteAddress || req.socket.remoteAddress;
    const userAgent = req.get('User-Agent') || '';
    const pageUrl = req.originalUrl;
    const referrer = req.get('Referer') || '';
    const sessionId = req.sessionID || '';

    await query(`
      INSERT INTO website_analytics (user_id, ip_address, user_agent, page_url, referrer, session_id)
      VALUES ($1, $2, $3, $4, $5, $6)
    `, [userId, ipAddress, userAgent, pageUrl, referrer, sessionId]);
  } catch (error) {
    console.error('Error tracking website analytics:', error);
  }
};

// Get all experiences with filters
router.get('/', async (req, res) => {
  try {
    const { search, result, company, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    // Track website analytics
    await trackWebsiteAnalytics(req, req.user?.id);

    console.log('Fetching experiences with filters:', { search, result, company, page, limit });

    let queryText = `
      SELECT 
        ie.*,
        CASE 
          WHEN ie.is_anonymous = true THEN 'Anonymous'
          ELSE u.full_name
        END as user_name,
        u.year_of_passing,
        u.branch,
        c.name as company_name,
        c.logo_url as company_logo,
        c.industry as company_industry,
        COALESCE(vote_counts.upvote_count, 0) as vote_count,
        COALESCE(comment_counts.comment_count, 0) as comment_count,
        COALESCE(view_counts.view_count, 0) as view_count
      FROM interview_experiences ie
      JOIN users u ON ie.user_id = u.id
      JOIN companies c ON ie.company_id = c.id
      LEFT JOIN (
        SELECT experience_id, COUNT(*) as upvote_count
        FROM interview_votes 
        WHERE vote_type = 'upvote'
        GROUP BY experience_id
      ) vote_counts ON ie.id = vote_counts.experience_id
      LEFT JOIN (
        SELECT experience_id, COUNT(*) as comment_count
        FROM interview_comments
        GROUP BY experience_id
      ) comment_counts ON ie.id = comment_counts.experience_id
      LEFT JOIN (
        SELECT experience_id, COUNT(*) as view_count
        FROM interview_views
        GROUP BY experience_id
      ) view_counts ON ie.id = view_counts.experience_id
      WHERE 1=1
    `;

    const params = [];
    let paramCount = 0;

    if (search) {
      paramCount++;
      queryText += ` AND (c.name ILIKE $${paramCount} OR ie.position ILIKE $${paramCount} OR u.full_name ILIKE $${paramCount})`;
      params.push(`%${search}%`);
    }

    if (result && result !== 'all') {
      paramCount++;
      queryText += ` AND ie.result = $${paramCount}`;
      params.push(result);
    }

    if (company) {
      paramCount++;
      queryText += ` AND c.name ILIKE $${paramCount}`;
      params.push(`%${company}%`);
    }

    queryText += `
      ORDER BY ie.created_at DESC
      LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}
    `;

    params.push(limit, offset);

    console.log('Executing query:', queryText);
    console.log('With params:', params);

    const result_data = await query(queryText, params);

    console.log(`Found ${result_data.rows.length} experiences from database`);

    // Transform the data to match the expected format
    const experiencesWithCounts = result_data.rows.map((exp) => ({
      ...exp,
      user: {
        id: exp.user_id,
        full_name: exp.user_name || 'Anonymous',
        year_of_passing: exp.year_of_passing,
        branch: exp.branch,
        email: '',
        verified: true,
        created_at: exp.created_at,
        updated_at: exp.updated_at
      },
      company: {
        id: exp.company_id,
        name: exp.company_name || 'Unknown Company',
        logo_url: exp.company_logo,
        industry: exp.company_industry,
        created_at: exp.created_at
      },
      _count: {
        votes: parseInt(exp.vote_count) || 0,
        comments: parseInt(exp.comment_count) || 0,
        views: parseInt(exp.view_count) || 0,
      },
      rounds: [],
    }));

    console.log('Processed experiences:', experiencesWithCounts);

    res.json({
      experiences: experiencesWithCounts,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        hasMore: result_data.rows.length === parseInt(limit),
        total: result_data.rows.length
      }
    });
  } catch (error) {
    console.error('Get experiences error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch experiences',
      details: process.env.NODE_ENV !== 'production' ? error.message : undefined
    });
  }
});

// Get single experience with full details
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const ipAddress = req.ip || req.connection.remoteAddress || req.socket.remoteAddress;

    console.log('Fetching experience details for ID:', id);

    // Track view
    await trackView(id, req.user?.id, ipAddress);

    // Get experience with user and company details
    const experienceResult = await query(`
      SELECT 
        ie.*,
        CASE 
          WHEN ie.is_anonymous = true THEN 'Anonymous'
          ELSE u.full_name
        END as user_name,
        u.year_of_passing,
        u.branch,
        c.name as company_name,
        c.logo_url as company_logo,
        c.website as company_website,
        c.industry as company_industry
      FROM interview_experiences ie
      JOIN users u ON ie.user_id = u.id
      JOIN companies c ON ie.company_id = c.id
      WHERE ie.id = $1
    `, [id]);

    if (experienceResult.rows.length === 0) {
      return res.status(404).json({ error: 'Experience not found' });
    }

    const experience = experienceResult.rows[0];

    // Get rounds with coding questions
    const roundsResult = await query(`
      SELECT 
        ir.*,
        COALESCE(
          json_agg(
            CASE WHEN cq.id IS NOT NULL THEN
              json_build_object(
                'id', cq.id,
                'title', cq.title,
                'description', cq.description,
                'difficulty', cq.difficulty,
                'topics', cq.topics,
                'solution_approach', cq.solution_approach,
                'time_complexity', cq.time_complexity,
                'space_complexity', cq.space_complexity,
                'platform_links', COALESCE(cq.platform_links, '[]'::json)
              )
            END ORDER BY cq.created_at
          ) FILTER (WHERE cq.id IS NOT NULL), 
          '[]'::json
        ) as coding_questions
      FROM interview_rounds ir
      LEFT JOIN (
        SELECT 
          cq.*,
          COALESCE(
            json_agg(
              CASE WHEN pl.id IS NOT NULL THEN
                json_build_object(
                  'id', pl.id,
                  'platform', pl.platform,
                  'url', pl.url,
                  'problem_id', pl.problem_id
                )
              END ORDER BY pl.created_at
            ) FILTER (WHERE pl.id IS NOT NULL),
            '[]'::json
          ) as platform_links
        FROM coding_questions cq
        LEFT JOIN platform_links pl ON cq.id = pl.question_id
        GROUP BY cq.id, cq.round_id, cq.title, cq.description, cq.difficulty, cq.topics, cq.solution_approach, cq.time_complexity, cq.space_complexity, cq.created_at
      ) cq ON ir.id = cq.round_id
      WHERE ir.experience_id = $1
      GROUP BY ir.id, ir.experience_id, ir.round_number, ir.round_type, ir.round_name, ir.duration, ir.description, ir.difficulty, ir.result, ir.created_at
      ORDER BY ir.round_number
    `, [id]);

    // Get comments
    const commentsResult = await query(`
      SELECT 
        ic.*,
        CASE 
          WHEN ie.is_anonymous = true THEN 'Anonymous'
          ELSE u.full_name
        END as user_name
      FROM interview_comments ic
      JOIN users u ON ic.user_id = u.id
      JOIN interview_experiences ie ON ic.experience_id = ie.id
      WHERE ic.experience_id = $1
      ORDER BY ic.created_at DESC
    `, [id]);

    // Get vote counts
    const votesResult = await query(`
      SELECT 
        vote_type,
        COUNT(*) as count
      FROM interview_votes
      WHERE experience_id = $1
      GROUP BY vote_type
    `, [id]);

    const votes = votesResult.rows.reduce((acc, row) => {
      acc[row.vote_type] = parseInt(row.count);
      return acc;
    }, { upvote: 0, downvote: 0 });

    res.json({
      ...experience,
      rounds: roundsResult.rows,
      comments: commentsResult.rows,
      votes
    });
  } catch (error) {
    console.error('Get experience error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch experience',
      details: process.env.NODE_ENV !== 'production' ? error.message : undefined
    });
  }
});

// Create new experience (protected route - no email verification required)
router.post('/', authenticateToken, [
  body('company_id').notEmpty().withMessage('Company ID is required'),
  body('position').notEmpty().withMessage('Position is required'),
  body('interview_date').isISO8601().withMessage('Valid interview date is required'),
  body('result').isIn(['selected', 'rejected', 'pending']).withMessage('Valid result is required'),
  body('overall_rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('difficulty_level').isInt({ min: 1, max: 5 }).withMessage('Difficulty must be between 1 and 5'),
  body('interview_process').notEmpty().withMessage('Interview process description is required'),
  body('advice').notEmpty().withMessage('Advice is required'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: errors.array()[0].msg,
        errors: errors.array() 
      });
    }

    const {
      company_id,
      position,
      experience_level = 'fresher',
      experience_years = 0,
      interview_date,
      result,
      overall_rating,
      difficulty_level,
      interview_process,
      preparation_time,
      advice,
      salary_offered,
      is_anonymous = false,
      rounds = []
    } = req.body;

    console.log('Creating new experience for user:', req.user.id);
    console.log('Request body:', req.body);

    // Verify company exists
    const companyCheck = await query('SELECT id FROM companies WHERE id = $1', [company_id]);
    if (companyCheck.rows.length === 0) {
      return res.status(400).json({ error: 'Invalid company ID' });
    }

    // Start transaction
    await query('BEGIN');

    try {
      // Create experience
      const experienceResult = await query(`
        INSERT INTO interview_experiences (
          user_id, company_id, position, experience_level, experience_years,
          interview_date, result, overall_rating, difficulty_level,
          interview_process, preparation_time, advice, salary_offered, is_anonymous
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
        RETURNING *
      `, [
        req.user.id, company_id, position, experience_level, experience_years,
        interview_date, result, overall_rating, difficulty_level,
        interview_process, preparation_time, advice, salary_offered, is_anonymous
      ]);

      const experience = experienceResult.rows[0];
      console.log('Experience created:', experience);

      // Create rounds if provided
      for (const round of rounds) {
        console.log('Creating round:', round);
        
        const roundResult = await query(`
          INSERT INTO interview_rounds (
            experience_id, round_number, round_type, round_name,
            duration, description, difficulty, result
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
          RETURNING *
        `, [
          experience.id, round.round_number, round.round_type, round.round_name,
          round.duration, round.description, round.difficulty, round.result
        ]);

        const roundId = roundResult.rows[0].id;
        console.log('Round created:', roundResult.rows[0]);

        // Create coding questions for this round
        for (const question of round.coding_questions || []) {
          console.log('Creating coding question:', question);
          
          const questionResult = await query(`
            INSERT INTO coding_questions (
              round_id, title, description, difficulty, topics,
              solution_approach, time_complexity, space_complexity
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING *
          `, [
            roundId, question.title, question.description, question.difficulty,
            question.topics, question.solution_approach, question.time_complexity,
            question.space_complexity
          ]);

          const questionId = questionResult.rows[0].id;
          console.log('Coding question created:', questionResult.rows[0]);

          // Create platform links for this question
          for (const link of question.platform_links || []) {
            console.log('Creating platform link:', link);
            
            await query(`
              INSERT INTO platform_links (question_id, platform, url, problem_id)
              VALUES ($1, $2, $3, $4)
            `, [questionId, link.platform, link.url, link.problem_id]);
          }
        }
      }

      await query('COMMIT');

      console.log('Experience created successfully:', experience.id);

      res.status(201).json({
        message: 'Experience created successfully',
        experience
      });
    } catch (error) {
      await query('ROLLBACK');
      throw error;
    }
  } catch (error) {
    console.error('Create experience error:', error);
    res.status(500).json({ 
      error: 'Failed to create experience',
      details: process.env.NODE_ENV !== 'production' ? error.message : undefined
    });
  }
});

// Vote on experience
router.post('/:id/vote', authenticateToken, [
  body('vote_type').isIn(['upvote', 'downvote']).withMessage('Valid vote type is required'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: errors.array()[0].msg,
        errors: errors.array() 
      });
    }

    const { id } = req.params;
    const { vote_type } = req.body;

    // Check if experience exists
    const experienceCheck = await query('SELECT id FROM interview_experiences WHERE id = $1', [id]);
    if (experienceCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Experience not found' });
    }

    // Check if user has already voted
    const existingVote = await query(
      'SELECT id, vote_type FROM interview_votes WHERE experience_id = $1 AND user_id = $2',
      [id, req.user.id]
    );

    if (existingVote.rows.length > 0) {
      const currentVote = existingVote.rows[0];
      
      if (currentVote.vote_type === vote_type) {
        // Remove vote if same type
        await query('DELETE FROM interview_votes WHERE id = $1', [currentVote.id]);
        return res.json({ message: 'Vote removed' });
      } else {
        // Update vote if different type
        await query(
          'UPDATE interview_votes SET vote_type = $1 WHERE id = $2',
          [vote_type, currentVote.id]
        );
        return res.json({ message: 'Vote updated' });
      }
    } else {
      // Create new vote
      await query(
        'INSERT INTO interview_votes (experience_id, user_id, vote_type) VALUES ($1, $2, $3)',
        [id, req.user.id, vote_type]
      );
      return res.json({ message: 'Vote added' });
    }
  } catch (error) {
    console.error('Vote error:', error);
    res.status(500).json({ 
      error: 'Failed to process vote',
      details: process.env.NODE_ENV !== 'production' ? error.message : undefined
    });
  }
});

// Comment on experience
router.post('/:id/comment', authenticateToken, [
  body('content').trim().notEmpty().withMessage('Comment content is required'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: errors.array()[0].msg,
        errors: errors.array() 
      });
    }

    const { id } = req.params;
    const { content } = req.body;

    // Check if experience exists
    const experienceCheck = await query('SELECT id FROM interview_experiences WHERE id = $1', [id]);
    if (experienceCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Experience not found' });
    }

    // Create comment
    const commentResult = await query(`
      INSERT INTO interview_comments (experience_id, user_id, content)
      VALUES ($1, $2, $3)
      RETURNING *
    `, [id, req.user.id, content]);

    const comment = commentResult.rows[0];

    // Get user details for response
    const userResult = await query('SELECT full_name FROM users WHERE id = $1', [req.user.id]);
    const user = userResult.rows[0];

    res.status(201).json({
      message: 'Comment added successfully',
      comment: {
        ...comment,
        user_name: user.full_name
      }
    });
  } catch (error) {
    console.error('Comment error:', error);
    res.status(500).json({ 
      error: 'Failed to add comment',
      details: process.env.NODE_ENV !== 'production' ? error.message : undefined
    });
  }
});

export default router;