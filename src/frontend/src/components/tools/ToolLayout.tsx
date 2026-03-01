import { Link } from "@tanstack/react-router";
import { ChevronRight, Home } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { motion } from "motion/react";
import type { ReactNode } from "react";

interface ToolLayoutProps {
  toolName: string;
  toolPath: string;
  description: string;
  icon: LucideIcon;
  iconColor: string;
  children: ReactNode;
}

export function ToolLayout({
  toolName,
  toolPath: _toolPath,
  description,
  icon: Icon,
  iconColor,
  children,
}: ToolLayoutProps) {
  return (
    <main className="min-h-screen bg-background">
      {/* Breadcrumb */}
      <div className="border-b border-border bg-card/50">
        <div className="container max-w-4xl py-3">
          <nav
            aria-label="Breadcrumb"
            className="flex items-center gap-1 text-sm text-muted-foreground"
          >
            <Link
              to="/"
              className="flex items-center gap-1 hover:text-foreground transition-colors"
            >
              <Home className="w-3.5 h-3.5" />
              <span>Home</span>
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-foreground font-medium">{toolName}</span>
          </nav>
        </div>
      </div>

      <div className="container max-w-4xl py-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex items-start gap-4 mb-10"
        >
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: `${iconColor}18` }}
          >
            <Icon className="w-7 h-7" style={{ color: iconColor }} />
          </div>
          <div>
            <h1 className="font-display text-3xl font-bold text-foreground mb-1">
              {toolName}
            </h1>
            <p className="text-muted-foreground text-base">{description}</p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          {children}
        </motion.div>
      </div>
    </main>
  );
}
