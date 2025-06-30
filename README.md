# InterviewHub IIITA

A platform for IIITA students to share and explore interview experiences.

## Features

- 🔐 Email-based authentication with OTP verification
- 📝 Share detailed interview experiences
- 🔍 Search and filter experiences
- 💬 Comment and vote on experiences
- 🏢 Company profiles and statistics
- 📱 Responsive design

## Tech Stack

### Frontend
- React 18 with TypeScript
- Tailwind CSS for styling
- React Router for navigation
- Axios for API calls
- Lucide React for icons

### Backend
- Node.js with Express
- PostgreSQL database
- JWT authentication
- Nodemailer for email sending
- bcryptjs for password hashing

## Deployment on Render

### Prerequisites

1. Create accounts on:
   - [Render](https://render.com)
   - [Brevo](https://brevo.com) (for email sending)

### Environment Variables

Set up the following environment variables in Render:

#### Backend Service
- `DATABASE_URL` - Automatically provided by Render PostgreSQL
- `JWT_SECRET` - Generate a strong random string
- `BREVO_SMTP_USER` - Your Brevo SMTP username
- `BREVO_SMTP_PASS` - Your Brevo SMTP password
- `FROM_EMAIL` - Email address for sending notifications
- `FRONTEND_URL` - URL of your frontend deployment
- `NODE_ENV` - Set to "production"

#### Frontend Service
- `VITE_API_URL` - URL of your backend API

### Database Setup

1. The PostgreSQL database will be automatically created by Render
2. Run the schema from `server/database/schema.sql` to set up tables
3. You can use a database client or run SQL commands through Render's dashboard

### Deployment Steps

1. **Fork/Clone this repository**

2. **Connect to Render:**
   - Go to Render dashboard
   - Create new PostgreSQL database
   - Create new Web Service for backend
   - Create new Static Site for frontend

3. **Configure Services:**
   - Use the provided `render.yaml` for automatic configuration
   - Or manually configure each service with the settings above

4. **Set Environment Variables:**
   - Configure all required environment variables in Render dashboard

5. **Deploy:**
   - Render will automatically deploy when you push to your repository

### Email Configuration

1. Sign up for Brevo (formerly Sendinblue)
2. Get your SMTP credentials from Brevo dashboard
3. Add the credentials to your Render environment variables

### Database Schema

The database schema is automatically created when the server starts. It includes:

- Users with IIITA email validation
- Companies and interview experiences
- Interview rounds and coding questions
- Comments, votes, and views tracking
- OTP verification system

## Local Development

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd interview-hub
   ```

2. **Install dependencies:**
   ```bash
   npm install
   cd server && npm install
   ```

3. **Set up environment variables:**
   ```bash
   cp .env.example .env
   # Fill in your environment variables
   ```

4. **Start development servers:**
   ```bash
   # Frontend (in root directory)
   npm run dev

   # Backend (in server directory)
   cd server && npm run dev
   ```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/send-otp` - Send OTP for verification
- `POST /api/auth/verify-otp` - Verify OTP
- `GET /api/auth/me` - Get current user

### Experiences
- `GET /api/experiences` - Get all experiences with filters
- `GET /api/experiences/:id` - Get single experience with details

### Companies
- `GET /api/companies` - Get all companies
- `GET /api/companies/:id` - Get company details

### Users
- `GET /api/users/profile` - Get user profile

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is licensed under the MIT License.