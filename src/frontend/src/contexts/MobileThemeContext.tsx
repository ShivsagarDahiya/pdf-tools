import { createContext, useContext, useEffect, useState } from "react";

export type MobileTheme = "dark" | "light";
export const ACCENT_PRESETS = [
  "#FF6B00",
  "#EF4444",
  "#3B82F6",
  "#10B981",
  "#8B5CF6",
];

interface MobileThemeContextValue {
  theme: MobileTheme;
  setTheme: (t: MobileTheme) => void;
  accentColor: string;
  setAccentColor: (c: string) => void;
}

const MobileThemeContext = createContext<MobileThemeContextValue>({
  theme: "dark",
  setTheme: () => {},
  accentColor: "#FF6B00",
  setAccentColor: () => {},
});

export function MobileThemeProvider({
  children,
}: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<MobileTheme>(() => {
    try {
      return (localStorage.getItem("mobile-theme") as MobileTheme) || "dark";
    } catch {
      return "dark";
    }
  });

  const [accentColor, setAccentColorState] = useState<string>(() => {
    try {
      return localStorage.getItem("mobile-accent") || "#FF6B00";
    } catch {
      return "#FF6B00";
    }
  });

  const setTheme = (t: MobileTheme) => {
    setThemeState(t);
    try {
      localStorage.setItem("mobile-theme", t);
    } catch {}
  };

  const setAccentColor = (c: string) => {
    setAccentColorState(c);
    try {
      localStorage.setItem("mobile-accent", c);
    } catch {}
  };

  // Sync to document for any global CSS hooks
  useEffect(() => {
    document.documentElement.setAttribute("data-mobile-theme", theme);
  }, [theme]);

  return (
    <MobileThemeContext.Provider
      value={{ theme, setTheme, accentColor, setAccentColor }}
    >
      {children}
    </MobileThemeContext.Provider>
  );
}

export function useMobileTheme() {
  return useContext(MobileThemeContext);
}
