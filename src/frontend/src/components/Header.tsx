import { Button } from "@/components/ui/button";
import { useAdminSettings } from "@/contexts/AdminSettingsContext";
import { useInternetIdentity } from "@/hooks/useInternetIdentity";
import { useGetProfile, useIsAdmin } from "@/hooks/useQueries";
import { Link } from "@tanstack/react-router";
import {
  FileText,
  Loader2,
  LogIn,
  LogOut,
  Menu,
  Settings,
  User,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { login, clear, identity, isLoggingIn, isInitializing } =
    useInternetIdentity();
  const { data: profile } = useGetProfile();
  const { data: isAdmin } = useIsAdmin();
  const { settings } = useAdminSettings();
  const { headerLogoText, headerLogoUrl } = settings;

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
    <header className="sticky top-0 z-50 bg-card/95 backdrop-blur-sm border-b border-border">
      <div className="container max-w-5xl flex items-center justify-between h-14">
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
        <nav className="hidden md:flex items-center gap-1 text-sm font-ui">
          <Link
            to="/"
            className="px-3 py-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
          >
            All Tools
          </Link>
          <Link
            to="/merge"
            className="px-3 py-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
          >
            Merge
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

        {/* Auth + Mobile toggle */}
        <div className="flex items-center gap-2">
          {/* Auth section */}
          {isAuthBusy ? (
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground font-ui px-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="hidden sm:inline">Loading…</span>
            </div>
          ) : identity ? (
            <div className="hidden md:flex items-center gap-2">
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
              className="hidden md:flex font-ui text-sm gap-1.5"
            >
              <LogIn className="w-3.5 h-3.5" />
              Login
            </Button>
          )}

          {/* Mobile menu toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            {menuOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </Button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden border-t border-border md:hidden"
          >
            <nav className="container py-4 flex flex-col gap-1 font-ui text-sm">
              {[
                ["All Tools", "/"],
                ["Merge PDF", "/merge"],
                ["Split PDF", "/split"],
                ["Compress PDF", "/compress"],
                ["Optimize PDF", "/optimize"],
                ["Rotate PDF", "/rotate"],
                ["Watermark", "/watermark"],
                ["Sign PDF", "/sign"],
                ["Edit PDF", "/edit"],
                ["PDF to JPG", "/pdf-to-jpg"],
                ["JPG to PDF", "/jpg-to-pdf"],
                ["Protect PDF", "/protect"],
                ["Unlock PDF", "/unlock"],
                ["History", "/history"],
                ["Premium", "/premium"],
                ...(identity ? [["Profile", "/profile"]] : []),
                ...(isAdmin ? [["Admin", "/admin"]] : []),
              ].map(([label, path]) => (
                <Link
                  key={path}
                  to={path as string}
                  className={`px-3 py-2 rounded-md transition-colors flex items-center gap-2 ${
                    label === "Admin"
                      ? "text-primary hover:bg-primary/10 font-medium"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent"
                  }`}
                  onClick={() => setMenuOpen(false)}
                >
                  {label === "Admin" && <Settings className="w-4 h-4" />}
                  {label}
                </Link>
              ))}

              {/* Mobile auth */}
              <div className="mt-2 pt-2 border-t border-border">
                {isAuthBusy ? (
                  <div className="flex items-center gap-2 px-3 py-2 text-muted-foreground">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Loading…
                  </div>
                ) : identity ? (
                  <>
                    <Link
                      to="/profile"
                      className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-accent transition-colors"
                      onClick={() => setMenuOpen(false)}
                    >
                      <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center overflow-hidden flex-shrink-0">
                        {profile?.profilePicUrl ? (
                          <img
                            src={profile.profilePicUrl}
                            alt="Profile"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <User className="w-3 h-3 text-primary-foreground" />
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground truncate max-w-[200px]">
                        {displayLabel}
                      </span>
                    </Link>
                    <button
                      type="button"
                      onClick={() => {
                        clear();
                        setMenuOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors flex items-center gap-2"
                    >
                      <LogOut className="w-4 h-4" />
                      Logout
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      login();
                      setMenuOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors flex items-center gap-2"
                  >
                    <LogIn className="w-4 h-4" />
                    Login
                  </button>
                )}
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
