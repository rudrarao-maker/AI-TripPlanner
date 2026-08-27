import { create } from "zustand";

type Theme = "dark" | "light" | "system";

interface ThemeStore {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

export const useThemeStore = create<ThemeStore>((set) => ({
  theme: "system",
  setTheme: (theme) => {
    set({ theme });
    if (typeof window !== "undefined") {
      const root = window.document.documentElement;
      root.classList.remove("dark", "light");

      if (theme === "system") {
        const systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
        root.classList.add(systemDark ? "dark" : "light");
      } else {
        root.classList.add(theme);
      }
    }
  },
}));
