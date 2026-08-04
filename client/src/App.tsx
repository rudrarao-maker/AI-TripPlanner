import { BrowserRouter } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { OfflineBanner } from "./components/layout/OfflineBanner";
import { AnimatedRoutes } from "./AnimatedRoutes";
import { useEffect, useRef } from "react";
import { useUser } from "@clerk/clerk-react";
import { useThemeStore } from "./store/themeStore";
import posthog from "./lib/posthog";

function App() {
  const { theme, setTheme } = useThemeStore();
  const { user, isLoaded } = useUser();
  const identifiedUserId = useRef<string | null>(null);

  // Initialize theme
  useEffect(() => {
    setTheme(theme);
  }, [theme, setTheme]);

  useEffect(() => {
    if (!isLoaded) return;

    if (!user) {
      if (identifiedUserId.current) {
        posthog.reset();
        identifiedUserId.current = null;
      }
      return;
    }

    if (identifiedUserId.current === user.id) return;

    if (identifiedUserId.current) {
      posthog.reset();
    }

    posthog.identify(user.id, {
      email: user.primaryEmailAddress?.emailAddress,
      name: user.fullName ?? user.firstName,
      avatar: user.imageUrl,
    });
    identifiedUserId.current = user.id;
  }, [isLoaded, user]);

  return (
    <BrowserRouter>
      <OfflineBanner />
      <AnimatedRoutes />
      <Toaster
        position="top-center"
        toastOptions={{
          className: "glass text-foreground",
          duration: 3000,
        }}
      />
    </BrowserRouter>
  );
}

export default App;
