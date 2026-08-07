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

## 🤝 Contributing
Contributions, issues, and feature requests are welcome!
