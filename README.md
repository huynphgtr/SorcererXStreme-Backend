# SorcererXStreme — Backend API

Backend API cho ứng dụng SorcererXStreme — Express + TypeScript + Prisma (Postgres). Tích hợp AI (Gemini / RAG), JWT auth, và hệ thống VIP/limits.

## Tech stack
- Node.js, Express, TypeScript
- PostgreSQL + Prisma
- JWT authentication
- AI integration (services/*)
- Zod validators for input schemas

## Project layout
- src/server.ts — entry
- src/app.ts — app + middleware registration
- src/routes/*.ts — route definitions
- src/controllers/*.ts — request handlers
- src/services/*.ts — business logic / AI / VIP
- src/middlewares/*.ts — auth, error handlers, VIP-check
- src/validators/*.ts — zod validators
- src/types/*.ts — app types (including vip.types.ts)
- prisma/schema.prisma — database schema

## Important endpoints (protected routes require Authorization: Bearer <token>)
Auth
- POST /api/auth/register
- POST /api/auth/login

Profile
- GET  /api/profile
- PUT  /api/profile  (zod validated)

Chat
- POST /api/chat
  - Free users: 10 messages/day (see src/types/vip.types.ts)
  - VIP users: unlimited (-1)

Tarot
- POST /api/tarot/overview
  - Expect payload:
    {
      "domain": "tarot",
      "feature_type": "tarot_overview",
      "user_context": { name, gender, birth_date, birth_time, birth_place },
      "partner_context": null | { ... },
      "data": { "cards_drawn": [ { "name"|"card_name", "is_upright", "position"? } ] }
    }
  - Controller normalizes cards and calls shared handler (current handler logs/echos payload for testing).

- POST /api/tarot/question
  - Expect payload:
    {
      "domain": "tarot",
      "feature_type": "tarot_question",
      "user_context": {...},
      "partner_context": null | {...},
      "data": { "question": "text", "cards_drawn": [ { "card_name"|"name", "is_upright", "position"? } ] }
    }

Astrology
- POST /api/astrology/overview (or /api/astrology)
  - Expect payload:
    {
      "domain": "astrology",
      "feature_type": "overall",
      "user_context": { name, gender, birth_date, birth_time, birth_place },
      "partner_context": null | { ... }
    }

Partner management
- POST /api/partner     — add partner
- PUT  /api/partner/:id — update
- DELETE /api/partner/:id — remove

VIP / Limits
- Defined in src/types/vip.types.ts
  - FREE: chatMessagesPerDay = 10, chatHistoryDays = 3
  - VIP: -1 = unlimited

## Environment variables
Copy .env.example → .env and fill values:
- DATABASE_URL (Postgres)
- JWT_SECRET
- PORT
- FRONTEND_URL
- GEMINI_API_KEY (if used)
- other email / payment vars as required

## Run locally
1. Install:
   npm install
2. Setup .env
3. Prisma:
   npx prisma generate
   npx prisma migrate dev
4. Start dev server:
   npm run dev

## Quick testing (Postman / curl)
- Add header: Content-Type: application/json and Authorization: Bearer <TOKEN> for protected routes.
- Tarot overview example (POST /api/tarot/overview):
  {
    "domain":"tarot","feature_type":"tarot_overview",
    "user_context":{ "name":"Nguyễn A", "gender":"female", "birth_date":"20-10-1995", "birth_time":"14:30", "birth_place":"Hanoi" },
    "partner_context": null,
    "data": { "cards_drawn":[ { "name":"The Lovers","is_upright":true,"position":"past" }, ... ] }
  }

- Tarot question example (POST /api/tarot/question):
  {
    "domain":"tarot","feature_type":"tarot_question",
    "user_context":{...}, "partner_context":{...},
    "data":{"question":"Tình cảm trong tương lai?","cards_drawn":[{"card_name":"The Fool","is_upright":true}]}
  }

## Notes
- Some controllers currently echo/log payload for easier testing.
- Ensure auth middleware runs before VIP/check middlewares to provide req.user.id.
- Use enums exactly as defined in Prisma (e.g., Gender = male | femal | other).
