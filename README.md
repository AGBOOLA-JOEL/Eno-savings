# Savings App

A full-stack mobile-first savings tracking application built with Next.js 15, featuring user authentication, admin dashboard, and beautiful data visualizations.

## Features

- 🔐 **Authentication**: Google OAuth with NextAuth.js
- 👥 **User Roles**: Admin and User roles with different dashboards
- 📊 **Data Visualization**: Beautiful charts showing savings progress
- 📱 **Mobile-First**: Responsive design optimized for mobile devices
- 🎯 **Goal Tracking**: Set and track savings goals with progress indicators
- 🏆 **Leaderboard**: Compare savings with other users
- 🔒 **Secure**: Protected API routes and role-based access control

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Authentication**: NextAuth.js with Google provider
- **Database**: PostgreSQL with Prisma ORM
- **UI**: shadcn/ui components with Tailwind CSS
- **Charts**: Recharts for data visualization
- **TypeScript**: Full type safety

## Getting Started

### Prerequisites

- Node.js 18+ 
- PostgreSQL database
- Google OAuth credentials

### Installation

1. Clone the repository:
\`\`\`bash
git clone <repository-url>
cd savings-app
\`\`\`

2. Install dependencies:
\`\`\`bash
npm install
\`\`\`

3. Set up environment variables:
\`\`\`bash
cp .env.example .env
\`\`\`

Fill in your database URL, NextAuth secret, and Google OAuth credentials.

4. Set up the database:
\`\`\`bash
npx prisma db push
\`\`\`

5. Run the development server:
\`\`\`bash
npm run dev
\`\`\`

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Database Setup

The app uses Prisma with PostgreSQL. After setting up your database URL in `.env`, run:

\`\`\`bash
npx prisma db push
npx prisma studio  # Optional: to view your database
\`\`\`

### Creating an Admin User

After signing up through Google OAuth, you'll need to manually promote a user to admin in the database:

\`\`\`sql
UPDATE "User" SET role = 'ADMIN' WHERE email = 'your-email@example.com';
\`\`\`

## Project Structure

\`\`\`
src/
├── app/
│   ├── api/                 # API routes
│   ├── dashboard/           # Dashboard pages
│   ├── login/              # Authentication pages
│   └── signup/             # User onboarding
├── components/
│   ├── dashboard/          # Dashboard components
│   └── ui/                 # shadcn/ui components
├── lib/                    # Utilities and configurations
└── types/                  # TypeScript type definitions
\`\`\`

## Features Overview

### User Dashboard
- View total savings and goal progress
- Interactive charts showing savings growth
- Savings history with transaction details
- Goal tracking with progress indicators

### Admin Dashboard
- Manage all users and their savings
- Add savings entries for any user
- View comprehensive statistics
- Recent transactions overview

### Authentication
- Google OAuth integration
- Profile completion flow
- Role-based access control
- Secure session management

## API Routes

- `POST /api/user/complete-profile` - Complete user profile after signup
- `POST /api/admin/savings` - Add savings entry (admin only)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.
