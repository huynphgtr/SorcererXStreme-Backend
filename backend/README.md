# SorcererXStreme Backend API

Backend API cho ứng dụng huyền thuật SorcererXStreme, được xây dựng với Express.js và TypeScript.

## Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Language:** TypeScript
- **Database:** PostgreSQL + Prisma ORM
- **Authentication:** JWT (JsonWebToken)
- **AI Integration:** Google Gemini AI
- **Password Hashing:** bcryptjs

## Project Structure

```
backend/
├── src/
│   ├── server.ts                 # Entry point
│   ├── app.ts                    # Express app configuration
│   ├── routes/                   # API route definitions
│   │   ├── auth.routes.ts
│   │   ├── profile.routes.ts
│   │   ├── chat.routes.ts
│   │   ├── tarot.routes.ts
│   │   ├── astrology.routes.ts
│   │   ├── fortune.routes.ts
│   │   └── numerology.routes.ts
│   ├── controllers/              # Request handlers
│   │   ├── auth.controller.ts
│   │   ├── profile.controller.ts
│   │   ├── chat.controller.ts
│   │   ├── tarot.controller.ts
│   │   ├── astrology.controller.ts
│   │   ├── fortune.controller.ts
│   │   └── numerology.controller.ts
│   ├── services/                 # Business logic & integrations
│   │   ├── gemini.service.ts
│   │   ├── jwt.service.ts
│   │   ├── ai-prompts.service.ts
│   │   ├── tarot-prompts.service.ts
│   │   └── breakup-utils.service.ts
│   ├── middlewares/              # Express middlewares
│   │   ├── auth.middleware.ts
│   │   └── error.middleware.ts
│   ├── lib/                      # Utilities
│   │   └── utils.ts
│   └── types/                    # TypeScript types
│       └── index.ts
├── prisma/
│   ├── schema.prisma             # Database schema
│   └── migrations/               # Database migrations
├── package.json
├── tsconfig.json
├── .env.example
└── README.md
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login

### Profile
- `GET /api/profile` - Get user profile (protected)
- `PUT /api/profile` - Update user profile (protected)

### Chat
- `POST /api/chat` - Send message to AI (protected)
- `GET /api/chat/history` - Get chat history (protected)

### Tarot
- `POST /api/tarot/reading` - Get tarot reading (protected)

### Astrology
- `POST /api/astrology` - Get astrology analysis (protected)

### Fortune
- `POST /api/fortune` - Get fortune reading (protected)

### Numerology
- `POST /api/numerology` - Get numerology analysis (protected)

### Health Check
- `GET /health` - Check server status

## Setup Instructions

### Prerequisites
- Node.js (v18 or higher)
- PostgreSQL database
- npm or yarn

### Installation

1. Install dependencies:
```bash
cd backend
npm install
```

2. Setup environment variables:
```bash
cp .env.example .env
```

Edit `.env` file with your credentials:
```
DATABASE_URL="postgresql://user:password@localhost:5432/sorcererxstreme"
JWT_SECRET="your-super-secret-jwt-key-here-change-in-production"
GEMINI_API_KEY="your-gemini-api-key-here"
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

3. Setup database:
```bash
npx prisma generate
npx prisma migrate dev
```

4. Run development server:
```bash
npm run dev
```

Server will start on `http://localhost:5000`

### Production Build

```bash
npm run build
npm start
```

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `JWT_SECRET` | Secret key for JWT signing | Yes |
| `GEMINI_API_KEY` | Google Gemini API key | Yes |
| `PORT` | Server port (default: 5000) | No |
| `NODE_ENV` | Environment (development/production) | No |
| `FRONTEND_URL` | Frontend URL for CORS | No |

## Database Schema

### User
- id, email, passwordHash
- name, birthDate, birthTime
- Relations: Partner, Breakup, ChatMessage, TarotReading

### Partner
- id, userId, name
- birthDate, birthTime, birthPlace
- relationship, startDate

### Breakup
- id, userId, partnerName
- breakupDate, autoDeleteDate
- weeklyCheckDone

### ChatMessage
- id, userId, content
- role (user/assistant)
- type, createdAt

### TarotReading
- id, userId, question
- cardsDrawn, interpretation
- createdAt

## Authentication Flow

1. User registers via `/api/auth/register`
2. User logs in via `/api/auth/login` and receives JWT token
3. Frontend stores token and sends it in Authorization header: `Bearer <token>`
4. Protected routes use `authMiddleware` to verify token
5. User ID is extracted from token and attached to request

## AWS Deployment Ready

This backend is ready to be deployed on:
- AWS EC2
- AWS ECS (Docker)
- AWS Lambda (with adjustments)
- AWS Elastic Beanstalk

For AWS RDS PostgreSQL, update `DATABASE_URL` in environment variables.

## Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build TypeScript to JavaScript
- `npm start` - Start production server
- `npm run prisma:generate` - Generate Prisma client
- `npm run prisma:migrate` - Run database migrations
- `npm run prisma:studio` - Open Prisma Studio (database GUI)
