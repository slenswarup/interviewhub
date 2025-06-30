import express from 'express';
import { query } from '../config/database.js';

const router = express.Router();

// Get website analytics (for developer only)
router.get('/website-stats', async (req, res) => {
  try {
    // Get total page views
    const totalViewsResult = await query('SELECT COUNT(*) as total_views FROM website_analytics');
    const totalViews = parseInt(totalViewsResult.rows[0].total_views);

    // Get unique visitors
    const uniqueVisitorsResult = await query('SELECT COUNT(DISTINCT ip_address) as unique_visitors FROM website_analytics');
    const uniqueVisitors = parseInt(uniqueVisitorsResult.rows[0].unique_visitors);

    // Get views by day (last 30 days)
    const viewsByDayResult = await query(`
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as views
      FROM website_analytics
      WHERE created_at >= NOW() - INTERVAL '30 days'
      GROUP BY DATE(created_at)
      ORDER BY date DESC
    `);

    // Get top pages
    const topPagesResult = await query(`
      SELECT 
        page_url,
        COUNT(*) as views
      FROM website_analytics
      GROUP BY page_url
      ORDER BY views DESC
      LIMIT 10
    `);

    // Get referrers
    const referrersResult = await query(`
      SELECT 
        CASE 
          WHEN referrer = '' OR referrer IS NULL THEN 'Direct'
          ELSE referrer
        END as referrer,
        COUNT(*) as views
      FROM website_analytics
      GROUP BY referrer
      ORDER BY views DESC
      LIMIT 10
    `);

    // Get user agents (browsers)
    const userAgentsResult = await query(`
      SELECT 
        CASE 
          WHEN user_agent ILIKE '%chrome%' THEN 'Chrome'
          WHEN user_agent ILIKE '%firefox%' THEN 'Firefox'
          WHEN user_agent ILIKE '%safari%' THEN 'Safari'
          WHEN user_agent ILIKE '%edge%' THEN 'Edge'
          ELSE 'Other'
        END as browser,
        COUNT(*) as views
      FROM website_analytics
      WHERE user_agent IS NOT NULL AND user_agent != ''
      GROUP BY browser
      ORDER BY views DESC
    `);

    res.json({
      totalViews,
      uniqueVisitors,
      viewsByDay: viewsByDayResult.rows,
      topPages: topPagesResult.rows,
      referrers: referrersResult.rows,
      browsers: userAgentsResult.rows
    });
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch analytics',
      details: process.env.NODE_ENV !== 'production' ? error.message : undefined
    });
  }
});

// Get experience analytics
router.get('/experience-stats', async (req, res) => {
  try {
    // Get total experiences
    const totalExperiencesResult = await query('SELECT COUNT(*) as total FROM interview_experiences');
    const totalExperiences = parseInt(totalExperiencesResult.rows[0].total);

    // Get experiences by result
    const experiencesByResultResult = await query(`
      SELECT 
        result,
        COUNT(*) as count
      FROM interview_experiences
      GROUP BY result
      ORDER BY count DESC
    `);

    // Get experiences by company
    const experiencesByCompanyResult = await query(`
      SELECT 
        c.name as company_name,
        COUNT(*) as count
      FROM interview_experiences ie
      JOIN companies c ON ie.company_id = c.id
      GROUP BY c.name
      ORDER BY count DESC
      LIMIT 10
    `);

    // Get total views, votes, comments
    const totalViewsResult = await query('SELECT COUNT(*) as total FROM interview_views');
    const totalVotesResult = await query('SELECT COUNT(*) as total FROM interview_votes');
    const totalCommentsResult = await query('SELECT COUNT(*) as total FROM interview_comments');

    res.json({
      totalExperiences,
      totalViews: parseInt(totalViewsResult.rows[0].total),
      totalVotes: parseInt(totalVotesResult.rows[0].total),
      totalComments: parseInt(totalCommentsResult.rows[0].total),
      experiencesByResult: experiencesByResultResult.rows,
      experiencesByCompany: experiencesByCompanyResult.rows
    });
  } catch (error) {
    console.error('Experience analytics error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch experience analytics',
      details: process.env.NODE_ENV !== 'production' ? error.message : undefined
    });
  }
});

export default router;