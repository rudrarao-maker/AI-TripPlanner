import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { MainLayout } from './components/layout/MainLayout';
import { LandingPage } from './pages/LandingPage';
import { ExplorePage } from './pages/ExplorePage';
import { ExpenseTrackerPage } from './pages/ExpenseTrackerPage';
import { DashboardHome } from './pages/dashboard/DashboardHome';
import { TripPlannerPage } from './pages/TripPlannerPage';
import { TravelJournalPage } from './pages/TravelJournalPage';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { FlightSearchPage } from './pages/FlightSearchPage';
import { HotelSearchPage } from './pages/HotelSearchPage';
import { AboutPage } from './pages/AboutPage';
import { BlogPage } from './pages/BlogPage';
import { LegalPage } from './pages/LegalPage';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';

import { ProtectedRoute } from './components/layout/ProtectedRoute';
import { OfflineBanner } from './components/layout/OfflineBanner';
import { useEffect } from 'react';
import { useThemeStore } from './store/themeStore';

// Placeholder for missing pages
const PlaceholderPage = ({ title }: { title: string }) => (
  <div className="flex h-[calc(100vh-200px)] flex-col items-center justify-center p-8 text-center">
    <h1 className="text-4xl font-bold mb-4">{title}</h1>
    <p className="text-muted-foreground">This page is currently under development.</p>
  </div>
);

function App() {
  const { theme, setTheme } = useThemeStore();

  // Initialize theme
  useEffect(() => {
    setTheme(theme);
  }, [theme, setTheme]);

  return (
    <BrowserRouter>
      <OfflineBanner />
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/explore" element={<ExplorePage />} />
          <Route path="/plan" element={<TripPlannerPage />} />
          <Route path="/flights" element={<FlightSearchPage />} />
          <Route path="/hotels" element={<HotelSearchPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/blog" element={<BlogPage />} />
          <Route path="/privacy" element={<LegalPage type="privacy" />} />
          <Route path="/terms" element={<LegalPage type="terms" />} />
          <Route path="/cookies" element={<LegalPage type="cookies" />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          
          {/* Protected User Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<DashboardHome />} />
            <Route path="/expenses" element={<ExpenseTrackerPage />} />
            <Route path="/journal" element={<TravelJournalPage />} />
          </Route>

          {/* Protected Admin Routes */}
          <Route element={<ProtectedRoute adminOnly />}>
            <Route path="/admin" element={<AdminDashboard />} />
          </Route>

          <Route path="*" element={<PlaceholderPage title="404 - Page Not Found" />} />
        </Route>
      </Routes>
      <Toaster 
        position="top-center"
        toastOptions={{
          className: 'glass text-foreground',
          duration: 3000,
        }}
      />
    </BrowserRouter>
  );
}

export default App;
