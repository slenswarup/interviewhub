export interface User {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  year_of_passing?: number;
  branch?: string;
  current_company?: string;
  verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface Company {
  id: string;
  name: string;
  logo_url?: string;
  website?: string;
  industry?: string;
  created_at: string;
}

export interface InterviewExperience {
  id: string;
  user_id: string;
  company_id: string;
  position: string;
  experience_level: 'fresher' | 'experienced';
  experience_years?: number;
  interview_date: string;
  result: 'selected' | 'rejected' | 'pending';
  overall_rating: number;
  difficulty_level: number;
  interview_process: string;
  preparation_time: string;
  advice: string;
  salary_offered?: string;
  created_at: string;
  updated_at: string;
  user: User;
  company: Company;
  rounds: InterviewRound[];
  votes: InterviewVote[];
  comments: InterviewComment[];
  _count: {
    votes: number;
    comments: number;
    views: number;
  };
}

export interface InterviewRound {
  id: string;
  experience_id: string;
  round_number: number;
  round_type: 'technical' | 'hr' | 'managerial' | 'group_discussion' | 'aptitude' | 'coding';
  round_name: string;
  duration: string;
  description: string;
  difficulty: number;
  result: 'passed' | 'failed' | 'pending';
  created_at: string;
  coding_questions: CodingQuestion[];
}

export interface CodingQuestion {
  id: string;
  round_id: string;
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  topics: string[];
  platform_links: PlatformLink[];
  solution_approach?: string;
  time_complexity?: string;
  space_complexity?: string;
  created_at: string;
}

export interface PlatformLink {
  id: string;
  question_id: string;
  platform: 'leetcode' | 'gfg' | 'codechef' | 'codeforces' | 'hackerrank' | 'interviewbit' | 'other';
  url: string;
  problem_id?: string;
  created_at: string;
}

export interface InterviewVote {
  id: string;
  experience_id: string;
  user_id: string;
  vote_type: 'upvote' | 'downvote';
  created_at: string;
}

export interface InterviewComment {
  id: string;
  experience_id: string;
  user_id: string;
  content: string;
  created_at: string;
  user: User;
}

export interface InterviewView {
  id: string;
  experience_id: string;
  user_id?: string;
  ip_address: string;
  created_at: string;
}

export interface OTPVerification {
  id: string;
  email: string;
  otp_code: string;
  expires_at: string;
  verified: boolean;
  created_at: string;
}