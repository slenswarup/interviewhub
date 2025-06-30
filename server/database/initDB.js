import { query } from '../config/database.js';

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
      INSERT INTO companies (name, industry, website) VALUES
      ('Google', 'Technology', 'https://google.com'),
      ('Microsoft', 'Technology', 'https://microsoft.com'),
      ('Amazon', 'E-commerce/Cloud', 'https://amazon.com'),
      ('Meta', 'Social Media', 'https://meta.com'),
      ('Apple', 'Technology', 'https://apple.com'),
      ('Netflix', 'Entertainment', 'https://netflix.com'),
      ('Uber', 'Transportation', 'https://uber.com'),
      ('Airbnb', 'Travel', 'https://airbnb.com'),
      ('Spotify', 'Music Streaming', 'https://spotify.com'),
      ('Adobe', 'Software', 'https://adobe.com')
      ON CONFLICT (name) DO NOTHING
    `);

    console.log('✅ Sample data inserted successfully');
    return true;
  } catch (error) {
    console.error('❌ Sample data insertion failed:', error);
    throw error;
  }
};