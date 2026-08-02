# AI Trip Planner

AI Trip Planner is a complete full-stack web application designed to generate, customize, and manage trips utilizing Google's Gemini AI. 

## Features

- **AI Itinerary Generation:** Give the AI a prompt about where you want to go, budget, and travel style, and it builds a detailed day-by-day itinerary.
- **Route Optimization:** Uses the Haversine formula to sort your daily activities by distance to minimize travel time.
- **Full Authentication:** Secured by Clerk.
- **Database:** Fully structured PostgreSQL database managed through Prisma ORM. 
- **Admin Dashboard:** Access control logic combined with live data queries to manage users and platform metrics.
- **Interactive UI:** Built using React, TailwindCSS, and Framer Motion for buttery-smooth animations and premium aesthetics.

## Tech Stack

- **Frontend:** React, Vite, TailwindCSS, framer-motion, lucide-react
- **Backend:** Node.js, Express, Socket.IO
- **Database:** PostgreSQL (via Prisma ORM)
- **AI Integration:** Google Gemini 2.5 Flash
- **Testing:** Vitest & Supertest
- **CI/CD:** GitHub Actions

## Setup Instructions

1. **Clone the repository**
2. **Setup environment variables**
   - Copy `.env.example` to `server/.env` and `client/.env` and populate keys (Clerk, Gemini, Postgres).
3. **Install Dependencies**
   - `npm install` inside both `client` and `server`.
4. **Database Setup**
   - Navigate to `server` and run `npx prisma db push` and `npx prisma generate`.
5. **Run the App**
   - In `server`: `npm run dev`
   - In `client`: `npm run dev`

## Recent Upgrades

This project was recently upgraded in a massive 6-phase sprint including:
1. Singleton Prisma Client & Full Postgres Migration
2. Backend Security (Zod, Helmet, Rate Limiting)
3. Advanced AI structured outputs & Haversine formula optimization
4. Real-time WebSockets setup via Socket.IO
5. Full frontend UI/UX refactoring for premium glassmorphism and responsiveness
6. DevOps integration with automated Vitest pipelines

## License
MIT
