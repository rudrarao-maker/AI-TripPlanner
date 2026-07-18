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
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/explore" element={<ExplorePage />} />
          <Route path="/plan" element={<TripPlannerPage />} />
          <Route path="/login" element={<PlaceholderPage title="Login" />} />
          <Route path="/register" element={<PlaceholderPage title="Sign Up" />} />
          <Route path="/dashboard" element={<DashboardHome />} />
          <Route path="/expenses" element={<ExpenseTrackerPage />} />
          <Route path="/journal" element={<TravelJournalPage />} />
          <Route path="/admin" element={<AdminDashboard />} />
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
