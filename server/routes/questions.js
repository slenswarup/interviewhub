import express from 'express';
import { query } from '../config/database.js';

const router = express.Router();

// Get all coding questions with company and round details
router.get('/', async (req, res) => {
  try {
    const { search, difficulty, topic, platform } = req.query;
    
    console.log('Fetching questions with filters:', { search, difficulty, topic, platform });

    let queryText = `
      SELECT 
        cq.*,
        ir.round_name,
        ir.round_type,
        ie.position,
        c.name as company_name,
        c.logo_url as company_logo,
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
      JOIN interview_rounds ir ON cq.round_id = ir.id
      JOIN interview_experiences ie ON ir.experience_id = ie.id
      JOIN companies c ON ie.company_id = c.id
      LEFT JOIN platform_links pl ON cq.id = pl.question_id
      WHERE 1=1
    `;

    const params = [];
    let paramCount = 0;

    if (search) {
      paramCount++;
      queryText += ` AND (cq.title ILIKE $${paramCount} OR cq.description ILIKE $${paramCount} OR c.name ILIKE $${paramCount})`;
      params.push(`%${search}%`);
    }

    if (difficulty && difficulty !== 'all') {
      paramCount++;
      queryText += ` AND cq.difficulty = $${paramCount}`;
      params.push(difficulty);
    }

    if (topic && topic !== 'all') {
      paramCount++;
      queryText += ` AND $${paramCount} = ANY(cq.topics)`;
      params.push(topic);
    }

    if (platform && platform !== 'all') {
      paramCount++;
      queryText += ` AND EXISTS (
        SELECT 1 FROM platform_links pl2 
        WHERE pl2.question_id = cq.id AND pl2.platform = $${paramCount}
      )`;
      params.push(platform);
    }

    queryText += `
      GROUP BY cq.id, ir.round_name, ir.round_type, ie.position, c.name, c.logo_url
      ORDER BY cq.created_at DESC
    `;

    console.log('Executing query:', queryText);
    console.log('With params:', params);

    const result = await query(queryText, params);
    
    console.log(`Found ${result.rows.length} questions from database`);

    res.json(result.rows);
  } catch (error) {
    console.error('Get questions error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch questions',
      details: process.env.NODE_ENV !== 'production' ? error.message : undefined
    });
  }
});

// Get question by ID with full details
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await query(`
      SELECT 
        cq.*,
        ir.round_name,
        ir.round_type,
        ie.position,
        c.name as company_name,
        c.logo_url as company_logo,
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
      JOIN interview_rounds ir ON cq.round_id = ir.id
      JOIN interview_experiences ie ON ir.experience_id = ie.id
      JOIN companies c ON ie.company_id = c.id
      LEFT JOIN platform_links pl ON cq.id = pl.question_id
      WHERE cq.id = $1
      GROUP BY cq.id, ir.round_name, ir.round_type, ie.position, c.name, c.logo_url
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Question not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get question error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch question',
      details: process.env.NODE_ENV !== 'production' ? error.message : undefined
    });
  }
});

export default router;
