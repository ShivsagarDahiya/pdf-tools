import { Link, useLocation } from "@tanstack/react-router";
import { Camera, History, Home, Settings, Wrench } from "lucide-react";
import { motion } from "motion/react";

interface MobileBottomNavProps {
  onToolsClick: () => void;
  onScannerClick: () => void;
}

export function MobileBottomNav({
  onToolsClick,
  onScannerClick,
}: MobileBottomNavProps) {
  const location = useLocation();
  const pathname = location.pathname;

  const isHome = pathname === "/";
  const isHistory = pathname === "/history";
  const isSettings = pathname === "/profile";

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-md border-t border-border safe-area-inset-bottom">
      <div className="flex items-center justify-around h-16 px-1">
        {/* Home */}
        <Link
          to="/"
          className="flex flex-col items-center justify-center gap-1 min-w-[56px] py-1"
          aria-label="Home"
        >
          <motion.div
            whileTap={{ scale: 0.85 }}
            className={`flex flex-col items-center gap-0.5 ${isHome ? "text-primary" : "text-muted-foreground"}`}
          >
            <div
              className={`p-1.5 rounded-xl transition-colors ${isHome ? "bg-primary/10" : ""}`}
            >
              <Home
                className={`w-5 h-5 ${isHome ? "text-primary" : "text-muted-foreground"}`}
                strokeWidth={isHome ? 2.5 : 1.8}
              />
            </div>
            <span
              className={`text-[10px] font-ui font-medium ${isHome ? "text-primary" : "text-muted-foreground"}`}
            >
              Home
            </span>
          </motion.div>
        </Link>

        {/* History */}
        <Link
          to="/history"
          className="flex flex-col items-center justify-center gap-1 min-w-[56px] py-1"
          aria-label="History"
        >
          <motion.div
            whileTap={{ scale: 0.85 }}
            className={`flex flex-col items-center gap-0.5 ${isHistory ? "text-primary" : "text-muted-foreground"}`}
          >
            <div
              className={`p-1.5 rounded-xl transition-colors ${isHistory ? "bg-primary/10" : ""}`}
            >
              <History
                className={`w-5 h-5 ${isHistory ? "text-primary" : "text-muted-foreground"}`}
                strokeWidth={isHistory ? 2.5 : 1.8}
              />
            </div>
            <span
              className={`text-[10px] font-ui font-medium ${isHistory ? "text-primary" : "text-muted-foreground"}`}
            >
              History
            </span>
          </motion.div>
        </Link>

        {/* Scanner (centered, prominent) */}
        <button
          type="button"
          onClick={onScannerClick}
          className="flex flex-col items-center justify-center gap-1 min-w-[56px] py-1 -mt-4"
          aria-label="Scan document"
        >
          <motion.div
            whileTap={{ scale: 0.9 }}
            className="flex flex-col items-center gap-0.5"
          >
            <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/40 mb-0.5">
              <Camera className="w-6 h-6 text-white" strokeWidth={2} />
            </div>
            <span className="text-[10px] font-ui font-medium text-muted-foreground">
              Scan
            </span>
          </motion.div>
        </button>

        {/* Tools */}
        <button
          type="button"
          onClick={onToolsClick}
          className="flex flex-col items-center justify-center gap-1 min-w-[56px] py-1"
          aria-label="All tools"
        >
          <motion.div
            whileTap={{ scale: 0.85 }}
            className="flex flex-col items-center gap-0.5 text-muted-foreground"
          >
            <div className="p-1.5 rounded-xl transition-colors">
              <Wrench
                className="w-5 h-5 text-muted-foreground"
                strokeWidth={1.8}
              />
            </div>
            <span className="text-[10px] font-ui font-medium text-muted-foreground">
              Tools
            </span>
          </motion.div>
        </button>

        {/* Settings */}
        <Link
          to="/profile"
          className="flex flex-col items-center justify-center gap-1 min-w-[56px] py-1"
          aria-label="Settings"
        >
          <motion.div
            whileTap={{ scale: 0.85 }}
            className={`flex flex-col items-center gap-0.5 ${isSettings ? "text-primary" : "text-muted-foreground"}`}
          >
            <div
              className={`p-1.5 rounded-xl transition-colors ${isSettings ? "bg-primary/10" : ""}`}
            >
              <Settings
                className={`w-5 h-5 ${isSettings ? "text-primary" : "text-muted-foreground"}`}
                strokeWidth={isSettings ? 2.5 : 1.8}
              />
            </div>
            <span
              className={`text-[10px] font-ui font-medium ${isSettings ? "text-primary" : "text-muted-foreground"}`}
            >
              Settings
            </span>
          </motion.div>
        </Link>
      </div>
    </nav>
  );
}
