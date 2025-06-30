import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://interviewhub_user:qvR9LcglfuZVYJLfu0uZrz8okATnQXAK@dpg-d1gkaoemcj7s73ct2ai0-a.oregon-postgres.render.com/interviewhub_db',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

export const connectDB = async () => {
  try {
    const client = await pool.connect();
    console.log('PostgreSQL connected successfully');
    client.release();
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  }
};

export const query = (text, params) => pool.query(text, params);

export default pool;