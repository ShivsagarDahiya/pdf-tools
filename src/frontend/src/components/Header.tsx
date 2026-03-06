import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAdminSettings } from "@/contexts/AdminSettingsContext";
import { useMobileTheme } from "@/contexts/MobileThemeContext";
import { usePlatformRole } from "@/contexts/PlatformRoleContext";
import { useActor } from "@/hooks/useActor";
import { useInternetIdentity } from "@/hooks/useInternetIdentity";
import { useGetProfile, useIsAdmin } from "@/hooks/useQueries";
import { Link } from "@tanstack/react-router";
import {
  Bell,
  FileText,
  Loader2,
  LogIn,
  LogOut,
  Moon,
  Settings,
  ShoppingBag,
  SlidersHorizontal,
  Sun,
  User,
} from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";

const ROLE_BADGE: Record<string, { label: string; color: string; bg: string }> =
  {
    creator: { label: "Creator", color: "#3B8CE2", bg: "#EBF3FF" },
    plus: { label: "Plus", color: "#E2A83B", bg: "#FFFBEB" },
    admin: { label: "Admin", color: "#E25C3B", bg: "#FFF0EC" },
  };

function NotificationBell() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    async function loadCount() {
      if (!actor || isFetching || !identity) return;
      try {
        if (typeof (actor as any).getUnreadNotificationCount === "function") {
          const count = await (actor as any).getUnreadNotificationCount();
          setUnreadCount(Number(count || 0));
        }
      } catch {}
    }
    loadCount();
    const interval = setInterval(loadCount, 30000);
    return () => clearInterval(interval);
  }, [actor, isFetching, identity]);

  if (!identity) return null;

  return (
    <Link
      to="/notifications"
      className="relative flex items-center justify-center w-8 h-8 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
      aria-label="Notifications"
    >
      <Bell className="w-4 h-4" />
      {unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-primary text-primary-foreground text-[9px] font-bold font-ui flex items-center justify-center">
          {unreadCount > 9 ? "9+" : unreadCount}
        </span>
      )}
    </Link>
  );
}

interface HeaderProps {
  onMenuClick?: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const { login, clear, identity, isLoggingIn, isInitializing } =
    useInternetIdentity();
  const { data: profile } = useGetProfile();
  const { data: isAdmin } = useIsAdmin();
  const { settings } = useAdminSettings();
  const { headerLogoText, headerLogoUrl } = settings;
  const { platformRole } = usePlatformRole();
  const { theme, setTheme } = useMobileTheme();

  const principalStr = identity?.getPrincipal().toString();
  const displayLabel = profile?.displayName
    ? profile.displayName
    : principalStr
      ? `${principalStr.slice(0, 12)}…`
      : "??";
  const initials = profile?.displayName
    ? profile.displayName
        .split(" ")
        .map((w: string) => w[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : principalStr
      ? principalStr.slice(0, 2).toUpperCase()
      : "??";

  const isAuthBusy = isLoggingIn || isInitializing;

  const roleBadge = platformRole !== "free" ? ROLE_BADGE[platformRole] : null;

  // Split logo text: "PDFTools" → ["PDF", "Tools"], otherwise show plain
  const renderLogoText = () => {
    const text = headerLogoText || "PDFTools";
    if (text === "PDFTools") {
      return (
        <span className="font-display font-bold text-foreground text-lg tracking-tight">
          PDF<span className="text-primary">Tools</span>
        </span>
      );
    }
    return (
      <span className="font-display font-bold text-foreground text-lg tracking-tight">
        {text}
      </span>
    );
  };

  return (
    <header className="sticky top-0 z-40 bg-card/95 backdrop-blur-sm border-b border-border">
      {/* ── MOBILE HEADER (hidden md+) ─────────────────────────────────── */}
      <div
        className="md:hidden flex items-center justify-between h-14 px-4 relative"
        style={{
          background:
            "linear-gradient(180deg, rgba(14,10,32,0.97) 0%, rgba(9,7,22,0.98) 100%)",
          backdropFilter: "blur(24px) saturate(200%)",
        }}
      >
        {/* Subtle top shimmer */}
        <div
          className="absolute inset-x-0 top-0 h-px"
          style={{
            background:
              "linear-gradient(90deg, transparent, rgba(99,102,241,0.5), rgba(139,92,246,0.6), rgba(59,130,246,0.5), transparent)",
          }}
        />

        {/* Left: user avatar / login */}
        {isAuthBusy ? (
          <div className="w-9 h-9 flex items-center justify-center">
            <Loader2 className="w-4 h-4 animate-spin text-violet-400" />
          </div>
        ) : identity ? (
          <Link to="/profile" className="relative flex-shrink-0">
            {/* Gradient ring — thicker + outer glow */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 400, damping: 20 }}
              className="w-9 h-9 rounded-full p-[2.5px]"
              style={{
                background:
                  "linear-gradient(135deg, #6366f1, #8b5cf6, #a855f7, #ec4899)",
                boxShadow:
                  "0 0 0 3px rgba(139,92,246,0.12), 0 0 16px rgba(139,92,246,0.4)",
              }}
            >
              <div className="w-full h-full rounded-full overflow-hidden bg-[#0d0b1e]">
                {profile?.profilePicUrl ? (
                  <img
                    src={profile.profilePicUrl}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-600 to-violet-700">
                    <span className="text-white text-xs font-bold font-ui">
                      {initials}
                    </span>
                  </div>
                )}
              </div>
            </motion.div>
          </Link>
        ) : (
          <button
            type="button"
            onClick={login}
            className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
            style={{
              border: "1px solid rgba(139,92,246,0.3)",
              background: "rgba(139,92,246,0.1)",
              boxShadow: "0 0 12px rgba(139,92,246,0.2)",
            }}
            aria-label="Login"
          >
            <User className="w-4 h-4 text-violet-400" />
          </button>
        )}

        {/* Center: Search bar */}
        <div className="flex-1 mx-3">
          <input
            type="search"
            placeholder="Search tools…"
            className="w-full rounded-full px-4 py-1.5 text-sm outline-none transition-all duration-150"
            style={{
              background: "rgba(255,255,255,0.10)",
              border: "1px solid rgba(255,255,255,0.18)",
              color: "#fff",
              lineHeight: "1.4",
              WebkitAppearance: "none",
            }}
            onChange={(e) => {
              (
                window as Window & { __mobileSearchQuery?: string }
              ).__mobileSearchQuery = e.target.value;
              window.dispatchEvent(new Event("mobileSearchChange"));
            }}
            aria-label="Search tools"
            data-ocid="mobile.search_input"
          />
        </div>

        {/* Right: Theme toggle + Filter icon */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          {/* Dark/Light theme toggle — mobile only */}
          <button
            type="button"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="md:hidden flex items-center justify-center w-8 h-8 rounded-xl transition-all duration-150 active:scale-95"
            style={{
              background:
                theme === "dark"
                  ? "rgba(255,200,50,0.12)"
                  : "rgba(100,100,255,0.12)",
              border:
                theme === "dark"
                  ? "1px solid rgba(255,200,50,0.2)"
                  : "1px solid rgba(100,100,255,0.2)",
            }}
            aria-label={
              theme === "dark" ? "Switch to light mode" : "Switch to dark mode"
            }
            data-ocid="mobile.toggle"
          >
            {theme === "dark" ? (
              <Sun className="w-4 h-4" style={{ color: "#FCD34D" }} />
            ) : (
              <Moon className="w-4 h-4" style={{ color: "#818CF8" }} />
            )}
          </button>

          <button
            type="button"
            onClick={onMenuClick}
            className="flex items-center justify-center w-9 h-9 rounded-xl transition-all duration-150 active:scale-95"
            style={{
              background: "rgba(255,255,255,0.08)",
              border: "1px solid rgba(255,255,255,0.12)",
              boxShadow: "0 0 10px rgba(99,102,241,0.15)",
            }}
            aria-label="Open tools menu"
            data-ocid="mobile.open_modal_button"
          >
            <SlidersHorizontal className="w-4 h-4 text-violet-300" />
          </button>
        </div>

        {/* Rainbow bottom border — slightly thicker */}
        <div
          className="absolute inset-x-0 bottom-0 h-[2px]"
          style={{
            background:
              "linear-gradient(90deg, #06b6d4, #6366f1, #a855f7, #ec4899, #f59e0b, #10b981)",
            opacity: 0.85,
          }}
        />
      </div>

      {/* ── DESKTOP HEADER (hidden on mobile) ─────────────────────────── */}
      <div className="hidden md:flex container max-w-5xl items-center justify-between h-14">
        {/* Logo */}
        <Link
          to="/"
          className="flex items-center gap-2 hover:opacity-80 transition-opacity"
        >
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center overflow-hidden">
            {headerLogoUrl ? (
              <img
                src={headerLogoUrl}
                alt="Logo"
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
            ) : (
              <FileText className="w-4 h-4 text-white" />
            )}
          </div>
          {renderLogoText()}
        </Link>

        {/* Desktop nav */}
        <nav className="flex items-center gap-1 text-sm font-ui">
          <Link
            to="/"
            className="px-3 py-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
          >
            All Tools
          </Link>
          <Link
            to="/marketplace"
            className="px-3 py-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors flex items-center gap-1.5"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            Marketplace
          </Link>
          <Link
            to="/compress"
            className="px-3 py-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
          >
            Compress
          </Link>
          <Link
            to="/history"
            className="px-3 py-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
          >
            History
          </Link>
          <Link
            to="/premium"
            className="px-3 py-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
          >
            Premium
          </Link>
          {identity && (
            <Link
              to="/creator-dashboard"
              className="px-3 py-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            >
              Creator
            </Link>
          )}
          {isAdmin && (
            <Link
              to="/admin"
              className="px-3 py-1.5 rounded-md text-primary hover:text-primary hover:bg-primary/10 transition-colors flex items-center gap-1.5 font-medium"
            >
              <Settings className="w-3.5 h-3.5" />
              Admin
            </Link>
          )}
        </nav>

        {/* Auth + Notifications */}
        <div className="flex items-center gap-2">
          <NotificationBell />

          {isAuthBusy ? (
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground font-ui px-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Loading…</span>
            </div>
          ) : identity ? (
            <div className="flex items-center gap-2">
              <Link
                to="/profile"
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted/50 border border-border hover:bg-accent transition-colors"
              >
                <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center overflow-hidden flex-shrink-0">
                  {profile?.profilePicUrl ? (
                    <img
                      src={profile.profilePicUrl}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-primary-foreground text-xs font-bold font-ui">
                      {initials}
                    </span>
                  )}
                </div>
                <span className="text-xs text-muted-foreground font-ui max-w-[80px] truncate">
                  {displayLabel}
                </span>
                {roleBadge && (
                  <Badge
                    className="font-ui text-[10px] h-4 px-1 border-0"
                    style={{
                      backgroundColor: roleBadge.bg,
                      color: roleBadge.color,
                    }}
                  >
                    {roleBadge.label}
                  </Badge>
                )}
              </Link>
              <Button
                variant="ghost"
                size="sm"
                onClick={clear}
                className="font-ui text-muted-foreground hover:text-foreground"
                title="Log out"
              >
                <LogOut className="w-4 h-4 mr-1" />
                Logout
              </Button>
            </div>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={login}
              className="font-ui text-sm gap-1.5"
            >
              <LogIn className="w-3.5 h-3.5" />
              Login
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
