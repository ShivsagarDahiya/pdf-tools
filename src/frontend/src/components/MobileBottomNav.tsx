import { useMobileTheme } from "@/contexts/MobileThemeContext";
import { Link, useLocation } from "@tanstack/react-router";
import { Camera, History, Home, Settings, Wrench } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";

interface MobileBottomNavProps {
  onToolsClick: () => void;
  onScannerClick: () => void;
}

// Per-tab color identities
const TAB_COLORS = {
  home: {
    glow: "rgba(6,182,212,0.7)",
    glowSoft: "rgba(6,182,212,0.2)",
    gradient: "linear-gradient(135deg, #06b6d4, #3b82f6)",
    text: "#22d3ee",
    bg: "rgba(6,182,212,0.12)",
    shadow: "0 0 16px rgba(6,182,212,0.5)",
    dot: "#22d3ee",
  },
  history: {
    glow: "rgba(139,92,246,0.7)",
    glowSoft: "rgba(139,92,246,0.2)",
    gradient: "linear-gradient(135deg, #8b5cf6, #6366f1)",
    text: "#a78bfa",
    bg: "rgba(139,92,246,0.12)",
    shadow: "0 0 16px rgba(139,92,246,0.5)",
    dot: "#a78bfa",
  },
  scanner: {
    glow: "rgba(236,72,153,0.7)",
    glowSoft: "rgba(236,72,153,0.2)",
    gradient: "linear-gradient(135deg, #f472b6, #ec4899, #f97316)",
    text: "#f472b6",
    bg: "rgba(236,72,153,0.15)",
    shadow:
      "0 4px 20px rgba(236,72,153,0.7), 0 0 40px rgba(236,72,153,0.3), 0 0 0 1px rgba(236,72,153,0.2)",
    dot: "#f472b6",
  },
  tools: {
    glow: "rgba(16,185,129,0.7)",
    glowSoft: "rgba(16,185,129,0.2)",
    gradient: "linear-gradient(135deg, #10b981, #06b6d4)",
    text: "#34d399",
    bg: "rgba(16,185,129,0.12)",
    shadow: "0 0 16px rgba(16,185,129,0.5)",
    dot: "#34d399",
  },
  settings: {
    glow: "rgba(245,158,11,0.7)",
    glowSoft: "rgba(245,158,11,0.2)",
    gradient: "linear-gradient(135deg, #f59e0b, #ef4444)",
    text: "#fbbf24",
    bg: "rgba(245,158,11,0.12)",
    shadow: "0 0 16px rgba(245,158,11,0.5)",
    dot: "#fbbf24",
  },
};

interface TabIconProps {
  isActive: boolean;
  colors: (typeof TAB_COLORS)[keyof typeof TAB_COLORS];
  icon: React.ReactNode;
  label: string;
}

function TabIcon({ isActive, colors, icon, label }: TabIconProps) {
  return (
    <motion.div
      whileTap={{ scale: 0.75 }}
      transition={{ type: "spring", stiffness: 600, damping: 22 }}
      className="flex flex-col items-center gap-[3px] relative"
    >
      <div className="relative flex items-center justify-center w-[34px] h-[34px]">
        {/* Shared spring-physics indicator */}
        {isActive && (
          <motion.div
            layoutId="tab-indicator"
            className="absolute inset-0 rounded-full"
            style={{ background: colors.bg }}
            transition={{ type: "spring", stiffness: 500, damping: 32 }}
          />
        )}
        {/* Icon with glow when active */}
        <div
          className="relative z-10 transition-all duration-200"
          style={{
            filter: isActive ? `drop-shadow(0 0 6px ${colors.glow})` : "none",
          }}
        >
          {icon}
        </div>
      </div>
      {/* Dot indicator below icon */}
      <AnimatePresence>
        {isActive && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 500, damping: 25 }}
            className="w-1 h-1 rounded-full"
            style={{ background: colors.dot }}
          />
        )}
      </AnimatePresence>
      {/* Label fades in when active */}
      <AnimatePresence>
        {isActive && (
          <motion.span
            initial={{ opacity: 0, y: 2 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 2 }}
            transition={{ duration: 0.18 }}
            className="text-[9px] font-semibold leading-none"
            style={{
              color: colors.text,
              textShadow: `0 0 10px ${colors.glow}`,
              letterSpacing: "0.02em",
            }}
          >
            {label}
          </motion.span>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export function MobileBottomNav({
  onToolsClick,
  onScannerClick,
}: MobileBottomNavProps) {
  const location = useLocation();
  const pathname = location.pathname;
  const { theme, accentColor } = useMobileTheme();
  const isDark = theme === "dark";

  const isHome = pathname === "/";
  const isHistory = pathname === "/history";
  const isSettings = pathname === "/profile";

  // Theme-aware scanner gradient always uses accent orange
  const scannerGradient = `linear-gradient(135deg, ${accentColor}, ${accentColor}CC)`;

  // Theme-aware pill bg
  const pillBg = isDark ? "rgba(10, 8, 24, 0.92)" : "rgba(255, 255, 255, 0.95)";
  const pillShadow = isDark
    ? "0 8px 32px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.06)"
    : "0 4px 24px rgba(0,0,0,0.12), 0 0 0 1px rgba(0,0,0,0.06)";
  const shimmerBg = isDark
    ? "linear-gradient(90deg, transparent, rgba(139,92,246,0.3), rgba(99,102,241,0.4), rgba(59,130,246,0.3), transparent)"
    : `linear-gradient(90deg, transparent, ${accentColor}40, ${accentColor}60, ${accentColor}40, transparent)`;

  // Override active colors with accent
  const activeTabColors = {
    ...TAB_COLORS,
    home: {
      ...TAB_COLORS.home,
      text: isDark ? TAB_COLORS.home.text : "#0891B2",
      bg: isDark ? TAB_COLORS.home.bg : "rgba(6,182,212,0.1)",
    },
    history: {
      ...TAB_COLORS.history,
      text: isDark ? TAB_COLORS.history.text : "#7C3AED",
      bg: isDark ? TAB_COLORS.history.bg : "rgba(124,58,237,0.1)",
    },
    settings: {
      ...TAB_COLORS.settings,
      text: isDark ? TAB_COLORS.settings.text : "#D97706",
      bg: isDark ? TAB_COLORS.settings.bg : "rgba(217,119,6,0.1)",
    },
    tools: {
      ...TAB_COLORS.tools,
      text: isDark ? TAB_COLORS.tools.text : "#059669",
      bg: isDark ? TAB_COLORS.tools.bg : "rgba(5,150,105,0.1)",
    },
  };

  const inactiveIconColor = isDark
    ? "rgba(100,116,139,0.5)"
    : "rgba(100,116,139,0.6)";

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-50"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 8px)" }}
    >
      {/* Floating pill container */}
      <div className="mx-4 mb-3">
        <div
          className="relative h-[62px] rounded-3xl flex items-center justify-around px-2"
          style={{
            background: pillBg,
            backdropFilter: "blur(32px) saturate(200%)",
            boxShadow: pillShadow,
          }}
        >
          {/* Inner shimmer top line */}
          <div
            className="absolute inset-x-4 top-0 h-px rounded-full"
            style={{ background: shimmerBg }}
          />

          {/* HOME */}
          <Link
            to="/"
            className="flex flex-col items-center justify-center min-w-[52px] py-1"
            aria-label="Home"
            data-ocid="nav.home.link"
          >
            <TabIcon
              isActive={isHome}
              colors={activeTabColors.home}
              label="Home"
              icon={
                <Home
                  className="w-5 h-5 transition-all duration-200"
                  strokeWidth={isHome ? 2.5 : 1.5}
                  style={{
                    color: isHome
                      ? activeTabColors.home.text
                      : inactiveIconColor,
                  }}
                />
              }
            />
          </Link>

          {/* HISTORY */}
          <Link
            to="/history"
            className="flex flex-col items-center justify-center min-w-[52px] py-1"
            aria-label="History"
            data-ocid="nav.history.link"
          >
            <TabIcon
              isActive={isHistory}
              colors={activeTabColors.history}
              label="History"
              icon={
                <History
                  className="w-5 h-5 transition-all duration-200"
                  strokeWidth={isHistory ? 2.5 : 1.5}
                  style={{
                    color: isHistory
                      ? activeTabColors.history.text
                      : inactiveIconColor,
                  }}
                />
              }
            />
          </Link>

          {/* SCANNER — hero center button */}
          <button
            type="button"
            onClick={onScannerClick}
            className="flex flex-col items-center justify-center min-w-[52px] py-1"
            aria-label="Scan document"
            data-ocid="nav.scanner.button"
            style={{ marginTop: "-28px" }}
          >
            <motion.div
              whileTap={{ scale: 0.88 }}
              transition={{ type: "spring", stiffness: 500, damping: 18 }}
              className="flex flex-col items-center gap-1.5"
            >
              <div className="relative">
                {/* Pulse ring 1 */}
                <motion.div
                  className="absolute rounded-full"
                  style={{
                    inset: "-6px",
                    background: scannerGradient,
                    opacity: 0,
                  }}
                  animate={{
                    opacity: [0, 0.35, 0],
                    scale: [0.85, 1.2, 0.85],
                  }}
                  transition={{
                    repeat: Number.POSITIVE_INFINITY,
                    duration: 2.2,
                    ease: "easeInOut",
                  }}
                />
                {/* Pulse ring 2 — offset delay */}
                <motion.div
                  className="absolute rounded-full"
                  style={{
                    inset: "-10px",
                    background: scannerGradient,
                    opacity: 0,
                  }}
                  animate={{
                    opacity: [0, 0.18, 0],
                    scale: [0.8, 1.35, 0.8],
                  }}
                  transition={{
                    repeat: Number.POSITIVE_INFINITY,
                    duration: 2.2,
                    ease: "easeInOut",
                    delay: 0.5,
                  }}
                />
                {/* Main button */}
                <div
                  className="relative w-[52px] h-[52px] rounded-[18px] flex items-center justify-center"
                  style={{
                    background: scannerGradient,
                    boxShadow: `0 4px 20px ${accentColor}70, 0 0 40px ${accentColor}30, 0 0 0 1px ${accentColor}20`,
                  }}
                >
                  <Camera
                    className="w-6 h-6 text-white"
                    strokeWidth={2}
                    style={{ filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.4))" }}
                  />
                </div>
              </div>
              <span
                className="text-[9px] font-semibold leading-none"
                style={{
                  color: accentColor,
                  textShadow: `0 0 8px ${accentColor}99`,
                  letterSpacing: "0.03em",
                }}
              >
                Scan
              </span>
            </motion.div>
          </button>

          {/* TOOLS */}
          <button
            type="button"
            onClick={onToolsClick}
            className="flex flex-col items-center justify-center min-w-[52px] py-1"
            aria-label="All tools"
            data-ocid="nav.tools.button"
          >
            <TabIcon
              isActive={false}
              colors={activeTabColors.tools}
              label="Tools"
              icon={
                <Wrench
                  className="w-5 h-5 transition-all duration-200"
                  strokeWidth={1.5}
                  style={{ color: inactiveIconColor }}
                />
              }
            />
          </button>

          {/* SETTINGS */}
          <Link
            to="/profile"
            className="flex flex-col items-center justify-center min-w-[52px] py-1"
            aria-label="Settings"
            data-ocid="nav.settings.link"
          >
            <TabIcon
              isActive={isSettings}
              colors={activeTabColors.settings}
              label="Settings"
              icon={
                <Settings
                  className="w-5 h-5 transition-all duration-200"
                  strokeWidth={isSettings ? 2.5 : 1.5}
                  style={{
                    color: isSettings
                      ? activeTabColors.settings.text
                      : inactiveIconColor,
                  }}
                />
              }
            />
          </Link>
        </div>
      </div>
    </nav>
  );
}
