import type React from "react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export interface FooterLink {
  label: string;
  url: string;
}

export interface SponsorPost {
  id: string;
  imageUrl: string;
  caption: string;
  link: string;
  createdAt: number;
}

export interface AdminSettings {
  hiddenServices: string[];
  themeColor: string;
  darkMode: boolean;
  headerLogoText: string;
  headerLogoUrl: string;
  footerBrandName: string;
  footerLinks: FooterLink[];
  footerCopyright: string;
  sponsorPosts: SponsorPost[];
}

const DEFAULT_SETTINGS: AdminSettings = {
  hiddenServices: [],
  themeColor: "#E25C3B",
  darkMode: false,
  headerLogoText: "PDFTools",
  headerLogoUrl: "",
  footerBrandName: "PDFTools",
  footerLinks: [
    { label: "Merge PDF", url: "/merge" },
    { label: "Split PDF", url: "/split" },
    { label: "Compress PDF", url: "/compress" },
    { label: "Protect PDF", url: "/protect" },
  ],
  footerCopyright: "",
  sponsorPosts: [],
};

const STORAGE_KEY = "pdf-tools-admin-settings";

function hexToOklchApprox(hex: string): string {
  // Parse hex to RGB
  const r = Number.parseInt(hex.slice(1, 3), 16) / 255;
  const g = Number.parseInt(hex.slice(3, 5), 16) / 255;
  const b = Number.parseInt(hex.slice(5, 7), 16) / 255;

  // Convert to linear sRGB
  const toLinear = (c: number) =>
    c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  const rL = toLinear(r);
  const gL = toLinear(g);
  const bL = toLinear(b);

  // sRGB to XYZ (D65)
  const x = 0.4124 * rL + 0.3576 * gL + 0.1805 * bL;
  const y = 0.2126 * rL + 0.7152 * gL + 0.0722 * bL;
  const z = 0.0193 * rL + 0.1192 * gL + 0.9505 * bL;

  // XYZ to OKLab
  const lc = Math.cbrt(0.8189330101 * x + 0.3618667424 * y - 0.1288597137 * z);
  const mc = Math.cbrt(0.0329845436 * x + 0.9293118715 * y + 0.0361456387 * z);
  const sc = Math.cbrt(0.0482003018 * x + 0.2643662691 * y + 0.633851707 * z);

  const L = 0.2104542553 * lc + 0.793617785 * mc - 0.0040720468 * sc;
  const a = 1.9779984951 * lc - 2.428592205 * mc + 0.4505937099 * sc;
  const bOk = 0.0259040371 * lc + 0.7827717662 * mc - 0.808675766 * sc;

  const C = Math.sqrt(a * a + bOk * bOk);
  const H = ((Math.atan2(bOk, a) * 180) / Math.PI + 360) % 360;

  return `${L.toFixed(4)} ${C.toFixed(4)} ${H.toFixed(2)}`;
}

interface AdminSettingsContextValue {
  settings: AdminSettings;
  updateSettings: (partial: Partial<AdminSettings>) => void;
  resetSettings: () => void;
}

const AdminSettingsContext = createContext<AdminSettingsContextValue | null>(
  null,
);

export function AdminSettingsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [settings, setSettings] = useState<AdminSettings>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
      }
    } catch {
      // ignore
    }
    return DEFAULT_SETTINGS;
  });

  // Persist to localStorage whenever settings change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch {
      // ignore
    }
  }, [settings]);

  // Apply dark mode class on <html>
  useEffect(() => {
    const root = document.documentElement;
    if (settings.darkMode) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [settings.darkMode]);

  // Apply theme color as CSS variable override
  useEffect(() => {
    try {
      const oklch = hexToOklchApprox(settings.themeColor);
      document.documentElement.style.setProperty("--primary", oklch);
      document.documentElement.style.setProperty("--ring", oklch);
      document.documentElement.style.setProperty("--brand", oklch);
    } catch {
      // ignore invalid color
    }
  }, [settings.themeColor]);

  const updateSettings = useCallback((partial: Partial<AdminSettings>) => {
    setSettings((prev) => ({ ...prev, ...partial }));
  }, []);

  const resetSettings = useCallback(() => {
    setSettings(DEFAULT_SETTINGS);
  }, []);

  const value = useMemo(
    () => ({ settings, updateSettings, resetSettings }),
    [settings, updateSettings, resetSettings],
  );

  return (
    <AdminSettingsContext.Provider value={value}>
      {children}
    </AdminSettingsContext.Provider>
  );
}

export function useAdminSettings(): AdminSettingsContextValue {
  const ctx = useContext(AdminSettingsContext);
  if (!ctx) {
    throw new Error(
      "useAdminSettings must be used within AdminSettingsProvider",
    );
  }
  return ctx;
}
