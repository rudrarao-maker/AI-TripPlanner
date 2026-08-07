import { create } from "zustand";

type Theme = "dark" | "light" | "system";

interface ThemeStore {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

export const useThemeStore = create<ThemeStore>((set) => ({
  theme: "light",
  setTheme: (theme) => {
    // Force light mode always
    set({ theme: "light" });
    if (typeof window !== "undefined") {
      const root = window.document.documentElement;
      root.classList.remove("dark");
      root.classList.add("light");
    }
  },
}));
