import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { OfflineBanner } from './components/layout/OfflineBanner';
import { AnimatedRoutes } from './AnimatedRoutes';
import { useEffect } from 'react';
import { useThemeStore } from './store/themeStore';

function App() {
  const { theme, setTheme } = useThemeStore();

  // Initialize theme
  useEffect(() => {
    setTheme(theme);
  }, [theme, setTheme]);

  return (
    <BrowserRouter>
      <OfflineBanner />
      <AnimatedRoutes />
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
