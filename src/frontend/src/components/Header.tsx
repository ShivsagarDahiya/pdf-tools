import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAdminSettings } from "@/contexts/AdminSettingsContext";
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
  Menu,
  Settings,
  ShoppingBag,
  User,
} from "lucide-react";
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
      <div className="md:hidden flex items-center justify-between h-14 px-4">
        {/* Left: user avatar / login */}
        {isAuthBusy ? (
          <div className="w-8 h-8 flex items-center justify-center">
            <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
          </div>
        ) : identity ? (
          <Link
            to="/profile"
            className="w-9 h-9 rounded-full bg-primary flex items-center justify-center overflow-hidden flex-shrink-0 ring-2 ring-primary/20"
          >
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
          </Link>
        ) : (
          <button
            type="button"
            onClick={login}
            className="w-9 h-9 rounded-full bg-muted flex items-center justify-center flex-shrink-0 border border-border"
            aria-label="Login"
          >
            <User className="w-4 h-4 text-muted-foreground" />
          </button>
        )}

        {/* Center: Logo */}
        <Link
          to="/"
          className="flex items-center gap-2 hover:opacity-80 transition-opacity"
        >
          <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center overflow-hidden">
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
              <FileText className="w-3.5 h-3.5 text-white" />
            )}
          </div>
          {renderLogoText()}
        </Link>

        {/* Right: Menu icon */}
        <button
          type="button"
          onClick={onMenuClick}
          className="w-9 h-9 flex items-center justify-center rounded-xl text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
          aria-label="Open tools menu"
        >
          <Menu className="w-5 h-5" />
        </button>
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
