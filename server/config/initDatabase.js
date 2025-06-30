import { query } from './database.js';

export const createDatabaseSchema = async () => {
  try {
    console.log('🔄 Creating database schema...');

    // Enable UUID extension
    await query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');

    // Users table
    await query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        full_name VARCHAR(255) NOT NULL,
        avatar_url TEXT,
        year_of_passing INTEGER,
        branch VARCHAR(100),
        current_company VARCHAR(255),
        verified BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `);

    // Companies table
    await query(`
      CREATE TABLE IF NOT EXISTS companies (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        name VARCHAR(255) UNIQUE NOT NULL,
        logo_url TEXT,
        website TEXT,
        industry VARCHAR(100),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `);

    // Interview experiences table
    await query(`
      CREATE TABLE IF NOT EXISTS interview_experiences (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
        position VARCHAR(255) NOT NULL,
        experience_level VARCHAR(20) CHECK (experience_level IN ('fresher', 'experienced')) DEFAULT 'fresher',
        experience_years INTEGER,
        interview_date DATE NOT NULL,
        result VARCHAR(20) CHECK (result IN ('selected', 'rejected', 'pending')) DEFAULT 'pending',
        overall_rating INTEGER CHECK (overall_rating >= 1 AND overall_rating <= 5) DEFAULT 3,
        difficulty_level INTEGER CHECK (difficulty_level >= 1 AND difficulty_level <= 5) DEFAULT 3,
        interview_process TEXT NOT NULL,
        preparation_time VARCHAR(100),
        advice TEXT NOT NULL,
        salary_offered VARCHAR(100),
        is_anonymous BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `);

    // Interview rounds table
    await query(`
      CREATE TABLE IF NOT EXISTS interview_rounds (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        experience_id UUID NOT NULL REFERENCES interview_experiences(id) ON DELETE CASCADE,
        round_number INTEGER NOT NULL,
        round_type VARCHAR(50) CHECK (round_type IN ('technical', 'hr', 'managerial', 'group_discussion', 'aptitude', 'coding')) DEFAULT 'technical',
        round_name VARCHAR(255) NOT NULL,
        duration VARCHAR(50),
        description TEXT NOT NULL,
        difficulty INTEGER CHECK (difficulty >= 1 AND difficulty <= 5) DEFAULT 3,
        result VARCHAR(20) CHECK (result IN ('passed', 'failed', 'pending')) DEFAULT 'pending',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `);

    // Coding questions table
    await query(`
      CREATE TABLE IF NOT EXISTS coding_questions (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        round_id UUID NOT NULL REFERENCES interview_rounds(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        difficulty VARCHAR(20) CHECK (difficulty IN ('easy', 'medium', 'hard')) DEFAULT 'medium',
        topics TEXT[] DEFAULT '{}',
        solution_approach TEXT,
        time_complexity VARCHAR(100),
        space_complexity VARCHAR(100),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `);

    // Platform links table
    await query(`
      CREATE TABLE IF NOT EXISTS platform_links (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        question_id UUID NOT NULL REFERENCES coding_questions(id) ON DELETE CASCADE,
        platform VARCHAR(50) CHECK (platform IN ('leetcode', 'gfg', 'codechef', 'codeforces', 'hackerrank', 'interviewbit', 'other')) NOT NULL,
        url TEXT NOT NULL,
        problem_id VARCHAR(100),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `);

    // Interview votes table
    await query(`
      CREATE TABLE IF NOT EXISTS interview_votes (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        experience_id UUID NOT NULL REFERENCES interview_experiences(id) ON DELETE CASCADE,
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        vote_type VARCHAR(20) CHECK (vote_type IN ('upvote', 'downvote')) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE(experience_id, user_id)
      )
    `);

    // Interview comments table
    await query(`
      CREATE TABLE IF NOT EXISTS interview_comments (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        experience_id UUID NOT NULL REFERENCES interview_experiences(id) ON DELETE CASCADE,
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        content TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `);

    // Interview views table
    await query(`
      CREATE TABLE IF NOT EXISTS interview_views (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        experience_id UUID NOT NULL REFERENCES interview_experiences(id) ON DELETE CASCADE,
        user_id UUID REFERENCES users(id) ON DELETE SET NULL,
        ip_address INET NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `);

    // OTP verifications table
    await query(`
      CREATE TABLE IF NOT EXISTS otp_verifications (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        email VARCHAR(255) NOT NULL,
        otp_code VARCHAR(6) NOT NULL,
        expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
        verified BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `);

    // Website analytics table for developer tracking
    await query(`
      CREATE TABLE IF NOT EXISTS website_analytics (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID REFERENCES users(id) ON DELETE SET NULL,
        ip_address INET NOT NULL,
        user_agent TEXT,
        page_url TEXT NOT NULL,
        referrer TEXT,
        session_id VARCHAR(255),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `);

    // Create indexes for better performance
    await query('CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)');
    await query('CREATE INDEX IF NOT EXISTS idx_interview_experiences_user_id ON interview_experiences(user_id)');
    await query('CREATE INDEX IF NOT EXISTS idx_interview_experiences_company_id ON interview_experiences(company_id)');
    await query('CREATE INDEX IF NOT EXISTS idx_interview_rounds_experience_id ON interview_rounds(experience_id)');
    await query('CREATE INDEX IF NOT EXISTS idx_coding_questions_round_id ON coding_questions(round_id)');
    await query('CREATE INDEX IF NOT EXISTS idx_platform_links_question_id ON platform_links(question_id)');
    await query('CREATE INDEX IF NOT EXISTS idx_interview_votes_experience_id ON interview_votes(experience_id)');
    await query('CREATE INDEX IF NOT EXISTS idx_interview_comments_experience_id ON interview_comments(experience_id)');
    await query('CREATE INDEX IF NOT EXISTS idx_interview_views_experience_id ON interview_views(experience_id)');
    await query('CREATE INDEX IF NOT EXISTS idx_otp_verifications_email ON otp_verifications(email)');
    await query('CREATE INDEX IF NOT EXISTS idx_website_analytics_created_at ON website_analytics(created_at)');
    await query('CREATE INDEX IF NOT EXISTS idx_website_analytics_ip_address ON website_analytics(ip_address)');

    console.log('✅ Database schema created successfully');
    return true;
  } catch (error) {
    console.error('❌ Database schema creation failed:', error);
    throw error;
  }
};

export const insertSampleData = async () => {
  try {
    console.log('🔄 Inserting sample data...');

    // Insert sample companies
    await query(`
      INSERT INTO companies (name, industry, website, logo_url) VALUES
      ('Google', 'Technology', 'https://google.com', 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Google_2015_logo.svg/272px-Google_2015_logo.svg.png'),
      ('Microsoft', 'Technology', 'https://microsoft.com', 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/Microsoft_logo.svg/512px-Microsoft_logo.svg.png'),
      ('Amazon', 'E-commerce/Cloud', 'https://amazon.com', 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/Amazon_logo.svg/603px-Amazon_logo.svg.png'),
      ('Meta', 'Social Media', 'https://meta.com', 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/Meta_Platforms_Inc._logo.svg/512px-Meta_Platforms_Inc._logo.svg.png'),
      ('Apple', 'Technology', 'https://apple.com', 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fa/Apple_logo_black.svg/488px-Apple_logo_black.svg.png'),
      ('Netflix', 'Entertainment', 'https://netflix.com', 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/08/Netflix_2015_logo.svg/512px-Netflix_2015_logo.svg.png'),
      ('Uber', 'Transportation', 'https://uber.com', 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/58/Uber_logo_2018.svg/512px-Uber_logo_2018.svg.png'),
      ('Airbnb', 'Travel', 'https://airbnb.com', 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/69/Airbnb_Logo_Bélo.svg/512px-Airbnb_Logo_Bélo.svg.png'),
      ('Spotify', 'Music Streaming', 'https://spotify.com', 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/19/Spotify_logo_without_text.svg/512px-Spotify_logo_without_text.svg.png'),
      ('Adobe', 'Software', 'https://adobe.com', 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/Adobe_Systems_logo_and_wordmark.svg/512px-Adobe_Systems_logo_and_wordmark.svg.png'),
      ('Flipkart', 'E-commerce', 'https://flipkart.com', 'https://logos-world.net/wp-content/uploads/2020/11/Flipkart-Logo.png')
      ON CONFLICT (name) DO NOTHING
    `);

    // Insert sample users
    await query(`
      INSERT INTO users (email, password_hash, full_name, year_of_passing, branch, verified) VALUES
      ('john.doe@iiita.ac.in', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6hsxq/3Haa', 'John Doe', 2024, 'Computer Science', true),
      ('jane.smith@iiita.ac.in', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6hsxq/3Haa', 'Jane Smith', 2023, 'Information Technology', true),
      ('alex.johnson@iiita.ac.in', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6hsxq/3Haa', 'Alex Johnson', 2024, 'Computer Science', true),
      ('priya.sharma@iiita.ac.in', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6hsxq/3Haa', 'Priya Sharma', 2023, 'Information Technology', true)
      ON CONFLICT (email) DO NOTHING
    `);

    console.log('✅ Sample data inserted successfully');
    return true;
  } catch (error) {
    console.error('❌ Sample data insertion failed:', error);
    throw error;
  }
};

export const initializeDatabase = async () => {
  try {
    console.log('🔄 Initializing database schema...');
    
    // Create database schema programmatically
    await createDatabaseSchema();
    
    // Insert sample data
    await insertSampleData();
    
    console.log('✅ Database schema initialized successfully');
    
    // Verify tables exist
    const tablesResult = await query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `);
    
    const tableNames = tablesResult.rows.map(row => row.table_name);
    console.log('📋 Created tables:', tableNames.join(', '));
    
    return true;
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    throw error;
  }
};

export const checkDatabaseHealth = async () => {
  try {
    // Check if all required tables exist
    const requiredTables = [
      'users',
      'companies', 
      'interview_experiences',
      'interview_rounds',
      'coding_questions',
      'platform_links',
      'interview_votes',
      'interview_comments',
      'interview_views',
      'otp_verifications',
      'website_analytics'
    ];
    
    const tablesResult = await query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      AND table_name = ANY($1)
    `, [requiredTables]);
    
    const existingTables = tablesResult.rows.map(row => row.table_name);
    const missingTables = requiredTables.filter(table => !existingTables.includes(table));
    
    if (missingTables.length > 0) {
      console.log('⚠️  Missing tables detected:', missingTables.join(', '));
      return false;
    }
    
    console.log('✅ Database health check passed');
    return true;
  } catch (error) {
    console.error('❌ Database health check failed:', error);
    return false;
  }
};