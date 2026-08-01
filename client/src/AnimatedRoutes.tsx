import { Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";

import { MainLayout } from "./components/layout/MainLayout";
import { LandingPage } from "./pages/LandingPage";
import { ExplorePage } from "./pages/ExplorePage";
import { ItineraryDetailsPage } from "./pages/ItineraryDetailsPage";
import { ExpenseTrackerPage } from "./pages/ExpenseTrackerPage";
import { DashboardHome } from "./pages/dashboard/DashboardHome";
import { BookingsPage } from "./pages/dashboard/BookingsPage";
import { SecuritySettings } from "./pages/dashboard/SecuritySettings";
import { TripPlannerPage } from "./pages/TripPlannerPage";
import { TravelJournalPage } from "./pages/TravelJournalPage";
import { AdminDashboard } from "./pages/admin/AdminDashboard";
import { FlightSearchPage } from "./pages/FlightSearchPage";
import { HotelSearchPage } from "./pages/HotelSearchPage";
import { AboutPage } from "./pages/AboutPage";
import { BlogPage } from "./pages/BlogPage";
import { LegalPage } from "./pages/LegalPage";
import { LoginPage } from "./pages/auth/LoginPage";
import { RegisterPage } from "./pages/auth/RegisterPage";
import { ForgotPasswordPage } from "./pages/auth/ForgotPasswordPage";
import { ProtectedRoute } from "./components/layout/ProtectedRoute";
import { PageTransition } from "./components/layout/PageTransition";

import { MyTripsPage } from "./pages/MyTripsPage";

// New Pages
import { DestinationsPage } from "./pages/DestinationsPage";
import { RestaurantsPage } from "./pages/RestaurantsPage";
import { ThingsToDoPage } from "./pages/ThingsToDoPage";
import { TravelGuidesPage } from "./pages/TravelGuidesPage";
import { ContactPage } from "./pages/ContactPage";
import { WishlistPage } from "./pages/WishlistPage";

// Placeholder for missing pages
const PlaceholderPage = ({ title }: { title: string }) => (
  <div className="flex h-[calc(100vh-200px)] flex-col items-center justify-center p-8 text-center">
    <h1 className="text-4xl font-bold mb-4">{title}</h1>
    <p className="text-muted-foreground">
      This page is currently under development.
    </p>
  </div>
);

export function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route element={<MainLayout />}>
          <Route
            path="/"
            element={
              <PageTransition>
                <LandingPage />
              </PageTransition>
            }
          />
          <Route
            path="/explore"
            element={
              <PageTransition>
                <ExplorePage />
              </PageTransition>
            }
          />
          <Route
            path="/itinerary/:id"
            element={
              <PageTransition>
                <ItineraryDetailsPage />
              </PageTransition>
            }
          />
          <Route
            path="/plan"
            element={
              <PageTransition>
                <TripPlannerPage />
              </PageTransition>
            }
          />

          <Route
            path="/flights"
            element={
              <PageTransition>
                <FlightSearchPage />
              </PageTransition>
            }
          />
          <Route
            path="/hotels"
            element={
              <PageTransition>
                <HotelSearchPage />
              </PageTransition>
            }
          />
          <Route
            path="/about"
            element={
              <PageTransition>
                <AboutPage />
              </PageTransition>
            }
          />
          <Route
            path="/blog"
            element={
              <PageTransition>
                <BlogPage />
              </PageTransition>
            }
          />
          <Route
            path="/privacy"
            element={
              <PageTransition>
                <LegalPage type="privacy" />
              </PageTransition>
            }
          />
          <Route
            path="/terms"
            element={
              <PageTransition>
                <LegalPage type="terms" />
              </PageTransition>
            }
          />
          <Route
            path="/cookies"
            element={
              <PageTransition>
                <LegalPage type="cookies" />
              </PageTransition>
            }
          />
          <Route
            path="/login/*"
            element={
              <PageTransition>
                <LoginPage />
              </PageTransition>
            }
          />
          <Route
            path="/register/*"
            element={
              <PageTransition>
                <RegisterPage />
              </PageTransition>
            }
          />
          <Route
            path="/forgot-password"
            element={
              <PageTransition>
                <ForgotPasswordPage />
              </PageTransition>
            }
          />

          {/* New Public Routes */}
          <Route
            path="/destinations"
            element={
              <PageTransition>
                <DestinationsPage />
              </PageTransition>
            }
          />
          <Route
            path="/restaurants"
            element={
              <PageTransition>
                <RestaurantsPage />
              </PageTransition>
            }
          />
          <Route
            path="/things-to-do"
            element={
              <PageTransition>
                <ThingsToDoPage />
              </PageTransition>
            }
          />
          <Route
            path="/travel-guides"
            element={
              <PageTransition>
                <TravelGuidesPage />
              </PageTransition>
            }
          />
          <Route
            path="/contact"
            element={
              <PageTransition>
                <ContactPage />
              </PageTransition>
            }
          />

          {/* Protected User Routes */}
          <Route element={<ProtectedRoute />}>
            <Route
              path="/dashboard"
              element={
                <PageTransition>
                  <DashboardHome />
                </PageTransition>
              }
            />
            <Route
              path="/bookings"
              element={
                <PageTransition>
                  <BookingsPage />
                </PageTransition>
              }
            />
            <Route
              path="/security"
              element={
                <PageTransition>
                  <SecuritySettings />
                </PageTransition>
              }
            />
            <Route
              path="/expenses"
              element={
                <PageTransition>
                  <ExpenseTrackerPage />
                </PageTransition>
              }
            />
            <Route
              path="/journal"
              element={
                <PageTransition>
                  <TravelJournalPage />
                </PageTransition>
              }
            />
            <Route
              path="/wishlist"
              element={
                <PageTransition>
                  <WishlistPage />
                </PageTransition>
              }
            />
            <Route
              path="/my-trips"
              element={
                <PageTransition>
                  <MyTripsPage />
                </PageTransition>
              }
            />
          </Route>

          {/* Protected Admin Routes */}
          <Route element={<ProtectedRoute adminOnly />}>
            <Route
              path="/admin"
              element={
                <PageTransition>
                  <AdminDashboard />
                </PageTransition>
              }
            />
          </Route>

          <Route
            path="*"
            element={
              <PageTransition>
                <PlaceholderPage title="404 - Page Not Found" />
              </PageTransition>
            }
          />
        </Route>
      </Routes>
    </AnimatePresence>
  );
}
