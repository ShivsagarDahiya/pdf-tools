import { useActor } from "@/hooks/useActor";
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
  toolControlFreeMaxMB?: number;
  toolControlPlusMaxMB?: number;
  toolControlGlobalWatermark?: boolean;
  toolControlWatermarkText?: string;
  toolControlDisabledTools?: string[];
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
  toolControlFreeMaxMB: 5,
  toolControlPlusMaxMB: 200,
  toolControlGlobalWatermark: true,
  toolControlWatermarkText: "Processed by PDFTools",
  toolControlDisabledTools: [],
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

/** Safely call saveAdminSettingsJson on the actor if the method exists */
function trySaveToBackend(actor: unknown, json: string): void {
  if (!actor) return;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const actorAny = actor as any;
  if (typeof actorAny.saveAdminSettingsJson !== "function") return;
  // Fire-and-forget — silently ignore errors (user may not be admin)
  actorAny.saveAdminSettingsJson(json).catch(() => {
    // Intentionally swallowed
  });
}

interface AdminSettingsContextValue {
  settings: AdminSettings;
  updateSettings: (partial: Partial<AdminSettings>) => void;
  resetSettings: () => void;
  isLoading: boolean;
}

const AdminSettingsContext = createContext<AdminSettingsContextValue | null>(
  null,
);

export function AdminSettingsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { actor, isFetching } = useActor();
  const [isLoading, setIsLoading] = useState(true);

  const [settings, setSettings] = useState<AdminSettings>(() => {
    // Fast initial render from localStorage cache
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Strip old caffeine.ai attribution if present
        if (
          typeof parsed.footerCopyright === "string" &&
          parsed.footerCopyright.toLowerCase().includes("caffeine")
        ) {
          parsed.footerCopyright = "";
        }
        return { ...DEFAULT_SETTINGS, ...parsed };
      }
    } catch {
      // ignore
    }
    return DEFAULT_SETTINGS;
  });

  // Load settings from backend when actor becomes available
  useEffect(() => {
    if (!actor || isFetching) return;

    const fetchSettings = async () => {
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const actorAny = actor as any;
        // Guard: method may not exist if IDL is stale
        if (typeof actorAny.getAdminSettingsJson !== "function") {
          return;
        }
        const json = await actorAny.getAdminSettingsJson();
        if (json && json !== "{}") {
          const parsed = JSON.parse(json);
          // Strip old caffeine.ai attribution if present
          if (
            typeof parsed.footerCopyright === "string" &&
            parsed.footerCopyright.toLowerCase().includes("caffeine")
          ) {
            parsed.footerCopyright = "";
          }
          const merged = { ...DEFAULT_SETTINGS, ...parsed };
          setSettings(merged);
          // Update localStorage cache with server data
          try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
          } catch {
            // ignore
          }
        }
      } catch {
        // Backend fetch failed — silently fall back to localStorage/defaults
      } finally {
        setIsLoading(false);
      }
    };

    fetchSettings();
  }, [actor, isFetching]);

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

  const updateSettings = useCallback(
    (partial: Partial<AdminSettings>) => {
      // Compute next settings synchronously so we have the value for the
      // backend call without relying on async state reads.
      let newSettings: AdminSettings = DEFAULT_SETTINGS;

      setSettings((prev) => {
        newSettings = { ...prev, ...partial };

        // Update localStorage cache immediately inside the updater so the
        // cache is always in sync before the re-render.
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(newSettings));
        } catch {
          // ignore
        }

        return newSettings;
      });

      // Persist to backend OUTSIDE the state updater so any errors are
      // properly caught and never bubble up through React's error boundary.
      if (actor && !isFetching) {
        // Use setTimeout(0) to ensure the state update has been committed
        // and localStorage holds the latest value.
        setTimeout(() => {
          const latestJson =
            localStorage.getItem(STORAGE_KEY) || JSON.stringify(newSettings);
          trySaveToBackend(actor, latestJson);
        }, 0);
      }
    },
    [actor, isFetching],
  );

  const resetSettings = useCallback(() => {
    setSettings(DEFAULT_SETTINGS);

    // Clear localStorage cache
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }

    // Reset on backend (fire-and-forget; safe guard inside trySaveToBackend)
    if (actor && !isFetching) {
      trySaveToBackend(actor, "{}");
    }
  }, [actor, isFetching]);

  const value = useMemo(
    () => ({ settings, updateSettings, resetSettings, isLoading }),
    [settings, updateSettings, resetSettings, isLoading],
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
