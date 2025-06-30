import express from 'express';
import { body, validationResult } from 'express-validator';
import { query } from '../config/database.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get all companies
router.get('/', async (req, res) => {
  try {
    const { search } = req.query;
    
    let queryText = 'SELECT * FROM companies';
    const params = [];

    if (search) {
      queryText += ' WHERE name ILIKE $1 OR industry ILIKE $1';
      params.push(`%${search}%`);
    }

    queryText += ' ORDER BY name';

    const result = await query(queryText, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Get companies error:', error);
    res.status(500).json({ error: 'Failed to fetch companies' });
  }
});

// Get company by ID with experience count and experiences
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Get company details with experience count
    const companyResult = await query(`
      SELECT 
        c.*,
        COUNT(ie.id) as experience_count
      FROM companies c
      LEFT JOIN interview_experiences ie ON c.id = ie.company_id
      WHERE c.id = $1
      GROUP BY c.id
    `, [id]);

    if (companyResult.rows.length === 0) {
      return res.status(404).json({ error: 'Company not found' });
    }

    const company = companyResult.rows[0];

    // Get all experiences for this company with user and company details
    const experiencesResult = await query(`
      SELECT 
        ie.*,
        u.full_name as user_name,
        u.year_of_passing,
        u.branch,
        c.name as company_name,
        c.logo_url as company_logo,
        c.website as company_website,
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
      WHERE ie.company_id = $1
      ORDER BY ie.created_at DESC
    `, [id]);

    // Transform experiences to match expected format
    const experiences = experiencesResult.rows.map((exp) => ({
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
        website: exp.company_website,
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

    // Return company with experiences
    res.json({
      ...company,
      experiences
    });
  } catch (error) {
    console.error('Get company error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch company',
      details: process.env.NODE_ENV !== 'production' ? error.message : undefined
    });
  }
});

// Create new company (protected route)
router.post('/', authenticateToken, [
  body('name').trim().notEmpty().withMessage('Company name is required'),
  body('industry').notEmpty().withMessage('Industry is required'),
  body('website').optional().isURL().withMessage('Please enter a valid website URL'),
  body('logo_url').optional().isURL().withMessage('Please enter a valid logo URL'),
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
      name,
      industry,
      website,
      logo_url
    } = req.body;

    console.log('Creating new company:', req.body);

    // Check if company already exists
    const existingCompany = await query('SELECT id FROM companies WHERE name ILIKE $1', [name]);
    if (existingCompany.rows.length > 0) {
      return res.status(400).json({ error: 'Company with this name already exists' });
    }

    // Create company
    const result = await query(`
      INSERT INTO companies (name, industry, website, logo_url)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `, [name, industry, website, logo_url]);

    const company = result.rows[0];
    console.log('Company created successfully:', company);

    res.status(201).json({
      message: 'Company created successfully',
      company
    });
  } catch (error) {
    console.error('Create company error:', error);
    res.status(500).json({ 
      error: 'Failed to create company',
      details: process.env.NODE_ENV !== 'production' ? error.message : undefined
    });
  }
});

export default router;
