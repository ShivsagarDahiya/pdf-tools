import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import { ArrowRight, Crown } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { motion } from "motion/react";
import { ToolLayout } from "./ToolLayout";

interface ComingSoonToolProps {
  toolName: string;
  toolPath: string;
  description: string;
  icon: LucideIcon;
  iconColor: string;
  note?: string;
}

export function ComingSoonTool({
  toolName,
  toolPath,
  description,
  icon,
  iconColor,
  note,
}: ComingSoonToolProps) {
  return (
    <ToolLayout
      toolName={toolName}
      toolPath={toolPath}
      description={description}
      icon={icon}
      iconColor={iconColor}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col items-center justify-center py-16 px-4 text-center"
      >
        {/* Decorative background */}
        <div className="relative w-28 h-28 mb-8" aria-hidden="true">
          <div
            className="absolute inset-0 rounded-3xl opacity-10 blur-2xl"
            style={{ backgroundColor: iconColor }}
          />
          <div
            className="relative w-28 h-28 rounded-3xl flex items-center justify-center"
            style={{ backgroundColor: `${iconColor}15` }}
          >
            {(() => {
              const Icon = icon;
              return (
                <Icon className="w-14 h-14" style={{ color: iconColor }} />
              );
            })()}
          </div>
        </div>

        <Badge
          className="mb-4 font-ui text-xs px-3 py-1 gap-1.5"
          style={{
            backgroundColor: `${iconColor}15`,
            color: iconColor,
            border: `1px solid ${iconColor}30`,
          }}
        >
          <Crown className="w-3 h-3" />
          Coming Soon — Premium Feature
        </Badge>

        <h2 className="font-display font-bold text-2xl text-foreground mb-3">
          {toolName} is on the way
        </h2>

        <p className="text-muted-foreground max-w-md leading-relaxed mb-3">
          {description}
        </p>

        {note && (
          <p className="text-sm text-muted-foreground/80 max-w-sm leading-relaxed mb-8 italic">
            {note}
          </p>
        )}

        <div className="flex flex-wrap gap-3 justify-center mt-4">
          <Link to="/premium">
            <Button
              size="lg"
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-ui font-semibold"
            >
              View Premium Plan
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </Link>
          <Link to="/">
            <Button variant="outline" size="lg" className="font-ui">
              Browse Available Tools
            </Button>
          </Link>
        </div>

        <div className="mt-10 grid grid-cols-3 gap-6 text-center max-w-xs">
          {["Server-side processing", "Premium quality", "Secure pipeline"].map(
            (feat) => (
              <div key={feat} className="space-y-1">
                <div
                  className="w-8 h-8 rounded-full mx-auto flex items-center justify-center"
                  style={{ backgroundColor: `${iconColor}12` }}
                >
                  <Crown className="w-4 h-4" style={{ color: iconColor }} />
                </div>
                <p className="text-xs text-muted-foreground font-ui">{feat}</p>
              </div>
            ),
          )}
        </div>
      </motion.div>
    </ToolLayout>
  );
}
