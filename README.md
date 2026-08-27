# AI Trip Planner 🌍✈️

An intelligent, full-stack travel companion application designed to take the hassle out of trip planning. Powered by artificial intelligence, this platform generates customized itineraries, tracks expenses, manages bookings, and provides a seamless user experience with a beautiful, modern UI.

## 🚀 Technical Stack

### Core

- **Framework:** Next.js (App Router)
- **Library:** React 19
- **Language:** TypeScript
- **Styling:** Tailwind CSS, Framer Motion (Animations), Radix/Shadcn (UI Primitives)

### Backend & Database

- **Database:** PostgreSQL
- **ORM:** Drizzle ORM
- **Authentication:** Clerk
- **Payments:** Stripe
- **Email/Notifications:** Resend

### Data Processing & Utilities

- **Data Parsing:** PapaParse (CSV), SheetJS/xlsx (Excel)
- **Document Generation:** jsPDF (PDF Exports)
- **State Management:** Zustand
- **Analytics:** PostHog

---

## ✨ Features & Functionalities

- **AI-Powered Itinerary Generation:** Instantly create day-by-day travel plans based on preferences, budget, and travel style.
- **Multi-Destination Routing:** Seamlessly plan complex, multi-city trips with optimized travel routes and inter-city transport suggestions.
- **Progressive Web App (PWA):** Install the app on your mobile or desktop device and enjoy offline access to your itineraries.
- **Real-Time Collaboration:** Plan trips with friends and family using live, Google Docs-style cursors and synchronized updates via WebSockets.
- **Live Price Comparison & Booking:** Direct integration with booking platforms to compare live hotel, flight, and activity prices in real-time.
- **Multi-Currency Smart Budgeting:** Instantly toggle between global currencies with live exchange rates and receive AI-generated local financial tips.
- **Inclusive Travel Planning:** Customize your trips based on dietary requirements, accessibility needs (e.g., wheelchair access), and preferred pacing.
- **AI Photo Journal & Scrapbook:** Automatically compile your trip memories into a stunning, shareable photo journal.
- **Interactive Dashboards:** Dedicated experiences for both Users and Administrators.
- **Comprehensive Expense Tracking:** Log and monitor trip expenses by category.
- **Real-Time Interactive Maps:** Visualize your journey and activities on a dynamic map.
- **Premium UI/UX:** Built with glassmorphism, dynamic micro-animations, and fully responsive layouts.
- **Enterprise-Grade Admin Controls:** Manage massive user bases with high-performance batch processing capabilities.

---

## 🗺️ Working Flows

### 1. AI Trip Planner Working Flow

The core engine of the application simplifies travel planning:

1. **User Input:** The user provides trip details including Origin, Destination, Dates, Budget, Travel Style, and number of companions.
2. **AI Processing:** The backend leverages AI to construct a logical, day-by-day itinerary, injecting hidden gems, local tips, and best times to visit.
3. **Recommendations:** Simultaneously fetches optimized flight options, hotel accommodations, and top-rated restaurants.
4. **Interactive Output:** The user is presented with a visual timeline of activities. They can drag-and-drop activities, lock preferences, view interactive maps, and ultimately save the trip to their dashboard.

### 2. User Dashboard Working Flow

A centralized hub for the traveler:

1. **Overview:** A high-level summary showing upcoming trips, total countries visited, and a quick expense snapshot.
2. **Trip Management:** Users can view detailed breakdowns of saved trips, edit itineraries, and add collaborators.
3. **Expense Tracker:** A dedicated ledger to log costs (flights, food, activities) which automatically categorizes and visualizes spending against the set budget.
4. **Saved Places:** A wishlist of locations and destinations the user intends to visit in the future.

### 3. Admin Panel Working Flow (User Management)

A robust, secure portal for application administrators to manage the user base efficiently:

1. **Authentication & Authorization:** Secured via Clerk and Next.js middleware, restricting access exclusively to users with the 'admin' role.
2. **User List & Profiles:**
   - A data table displaying all users with real-time search, pagination, and role/status filters.
   - Clicking a user opens a detailed **Profile Modal** showcasing join dates, verification status, and their recent payment history.
3. **Bulk Actions & Audit Logs:** Admins can select multiple users to Suspend, Activate, Make Admin, or Delete. Every action is recorded in an immutable **Audit Log** for security and compliance.
4. **Bulk Import Module:**
   - Admins can drag and drop massive **CSV or Excel** files.
   - The system performs client-side validation (email formatting, required fields) and provides a preview table to edit or remove invalid rows.
   - Upon confirmation, it utilizes Drizzle ORM for high-performance batch inserts into PostgreSQL, completely bypassing rate limits.
   - Displays an **Import Summary Dashboard** detailing successful inserts and skipped duplicates.
5. **Bulk Export Module:**
   - Admins can filter the user database by Date Range, Role, and Status.
   - The filtered dataset can be instantly exported and downloaded as **CSV, Excel, or PDF** files.

## 🚨 Problem Statement

Planning a trip is often an overwhelming, fragmented process. Travelers typically need to juggle multiple tabs for flights, accommodations, itineraries, budgeting, and maps. There is a lack of an integrated platform that not only consolidates these tasks but also leverages AI to generate highly personalized, realistic travel plans tailored to individual preferences, budget constraints, and accessibility needs.

---

## 🏗️ Building a Modular AI System for Destination Insights

To provide accurate and engaging travel recommendations, the application integrates a Modular AI System. Instead of relying on a single monolithic prompt, the system breaks down the trip generation process into specialized modules:

- **Itinerary Module:** Focuses on day-to-day scheduling, pacing, and logistics.
- **Budget Module:** Estimates costs and provides local financial tips.
- **Recommendation Module:** Suggests hidden gems, top-rated restaurants, and activities based on user preferences.

By utilizing Google Generative AI and the AI SDK, this modular approach ensures responses are structured, consistent, and easy to parse into the dynamic UI.

---

## 👨‍💻 My Role as a Developer

As the lead full-stack developer on this project, I was responsible for the end-to-end architecture and implementation. My role involved:

- Designing and developing the Next.js frontend and server-side logic.
- Integrating third-party services (Clerk for authentication, Stripe for payments, PostHog for analytics).
- Architecting the PostgreSQL database schema using Drizzle ORM.
- Implementing the AI logic for generating and refining itineraries.
- Setting up WebSockets for real-time collaboration features.
- Ensuring a highly responsive, animated, and accessible UI.

---

## 🎯 Project Goals

1. **Seamless User Experience:** Create an intuitive, visually stunning interface that makes travel planning enjoyable.
2. **AI-Driven Personalization:** Provide highly accurate and tailored travel recommendations using advanced language models.
3. **All-in-One Platform:** Consolidate itineraries, budgeting, and collaboration into a single, cohesive application.
4. **Scalability & Performance:** Build a robust backend capable of handling complex AI data generation, real-time synchronization, and enterprise-grade admin features.

---

## 🛠️ My Approach

My development approach was rooted in agile methodology and component-driven design:

- **Foundation First:** Started by setting up the Next.js structure, Clerk authentication, and the database schema to ensure a solid foundation.
- **AI Integration:** Focused on prompt engineering and structuring AI responses to ensure consistent and reliable JSON outputs for the frontend.
- **Iterative UI/UX:** Built the interface using Tailwind CSS and Shadcn UI, layering Framer Motion animations iteratively to enhance the user experience without sacrificing performance.
- **Real-Time Collaboration:** Implemented Socket.io after the core features were stable to enable multiplayer planning capabilities.

---

## 🚧 Challenges Encountered

1. **AI Output Consistency:** Language models often produce unstructured or unpredictable text, which broke the UI when parsing JSON for the itinerary timeline.
2. **Real-Time State Synchronization:** Ensuring multiple users could edit the same itinerary simultaneously without overwriting each other's changes.
3. **Performance with Large Datasets:** Rendering interactive maps with numerous markers and handling large state objects for complex trips caused performance bottlenecks on the client side.

---

## 🔧 How I Fixed Challenges

1. **Structured Data Generation:** I utilized strict system prompts and the AI SDK's structured output capabilities to force the AI to return strictly validated JSON schemas. I also added fallback parsing logic and retry mechanisms.
2. **Optimistic UI & WebSockets:** For real-time sync, I implemented optimistic UI updates with Zustand and synchronized state across clients using Socket.io events, complete with conflict resolution for concurrent edits.
3. **Memoization & Lazy Loading:** To improve performance, I heavily utilized React's `useMemo` and `useCallback`, lazy-loaded heavy components (like maps and 3D globes), and optimized the rendering of large lists.

---

## 📐 System Design & Project Pipeline

1. **Client Layer:** Next.js (React 19) app handling UI/UX, state management (Zustand), and real-time socket connections.
2. **API Layer:** Next.js API routes acting as a proxy and orchestrator for AI generation, database queries, and third-party integrations.
3. **AI Layer:** Google Generative AI processing user inputs and returning structured travel data.
4. **Data Layer:** PostgreSQL database accessed via Drizzle ORM for storing users, trips, expenses, and admin logs.
5. **Real-Time Layer:** Node.js WebSocket server handling collaborative editing and live cursors.

---

## 📖 Guide for Developers

To extend or modify this project:

- **Adding AI Features:** Look into the API routes handling generation. The AI prompts are modularized. Ensure any new prompt enforces strict JSON output matching the expected TypeScript interfaces.
- **Database Changes:** Modify the schema, run `npm run db:generate`, and then `npm run db:push` to apply changes via Drizzle.
- **UI Components:** Reusable components are built using Radix/Shadcn. For new UI elements, follow the existing component patterns.
- **Real-Time Events:** To add new collaborative features, emit events from the client and handle them in `socket-server.js`, broadcasting to the specific trip room.

---

## 💻 Getting Started

First, install dependencies:

```bash
npm install
```

Set up your `.env.local` file with the required variables (Database URL, Clerk Keys, Stripe Keys, etc.).

Run the database migrations and push the schema:

```bash
npm run db:push
```

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 🐳 Docker Setup

This project is configured to run efficiently using Docker.

### 1. Build the Docker Image

```bash
docker build -t ai-trip-planner .
```

### 2. Run the Container

```bash
docker run -p 3000:3000 --env-file .env.local ai-trip-planner
```

Your application will be available at [http://localhost:3000](http://localhost:3000). Ensure your `.env.local` file contains all necessary environment variables for the application to function correctly.

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!
