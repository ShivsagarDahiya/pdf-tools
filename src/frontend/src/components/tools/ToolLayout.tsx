import { Link } from "@tanstack/react-router";
import { ChevronRight, Home } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { motion } from "motion/react";
import { type ReactNode, useEffect, useMemo } from "react";

interface ToolLayoutProps {
  toolName: string;
  toolPath: string;
  description: string;
  icon: LucideIcon;
  iconColor: string;
  children: ReactNode;
}

// Deterministic pseudo-random number from a seed (no Math.random in render)
function seededRand(seed: number): number {
  const x = Math.sin(seed + 1) * 10000;
  return x - Math.floor(x);
}

interface StarData {
  id: number;
  top: string;
  left: string;
  size: string;
  animDuration: string;
  animDelay: string;
  opacity: string;
}

function generateStars(count: number): StarData[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    top: `${(seededRand(i * 3) * 100).toFixed(2)}%`,
    left: `${(seededRand(i * 3 + 1) * 100).toFixed(2)}%`,
    size: `${(seededRand(i * 3 + 2) * 1.5 + 0.5).toFixed(2)}px`,
    animDuration: `${(seededRand(i * 7 + 5) * 3 + 2).toFixed(2)}s`,
    animDelay: `${(seededRand(i * 7 + 6) * 4).toFixed(2)}s`,
    opacity: `${(seededRand(i * 11 + 3) * 0.6 + 0.3).toFixed(2)}`,
  }));
}

const GALAXY_STYLES_ID = "galaxy-header-keyframes";

function injectGalaxyStyles() {
  if (document.getElementById(GALAXY_STYLES_ID)) return;
  const style = document.createElement("style");
  style.id = GALAXY_STYLES_ID;
  style.textContent = `
    @keyframes starTwinkle {
      0%, 100% { opacity: var(--star-opacity, 0.6); transform: scale(1); }
      50% { opacity: 0.1; transform: scale(0.6); }
    }
    @keyframes galaxyDrift1 {
      0% { transform: translate(0, 0); }
      33% { transform: translate(8px, -6px); }
      66% { transform: translate(-6px, 4px); }
      100% { transform: translate(0, 0); }
    }
    @keyframes galaxyDrift2 {
      0% { transform: translate(0, 0); }
      33% { transform: translate(-10px, 5px); }
      66% { transform: translate(7px, -8px); }
      100% { transform: translate(0, 0); }
    }
    @keyframes galaxyDrift3 {
      0% { transform: translate(0, 0); }
      50% { transform: translate(6px, 10px); }
      100% { transform: translate(0, 0); }
    }
    .star-dot {
      position: absolute;
      border-radius: 50%;
      background: white;
      animation: starTwinkle var(--dur, 3s) var(--delay, 0s) ease-in-out infinite;
    }
    .galaxy-drift-1 {
      animation: galaxyDrift1 28s ease-in-out infinite;
    }
    .galaxy-drift-2 {
      animation: galaxyDrift2 35s ease-in-out infinite;
    }
    .galaxy-drift-3 {
      animation: galaxyDrift3 22s ease-in-out infinite;
    }
  `;
  document.head.appendChild(style);
}

export function ToolLayout({
  toolName,
  toolPath: _toolPath,
  description,
  icon: Icon,
  iconColor,
  children,
}: ToolLayoutProps) {
  useEffect(() => {
    injectGalaxyStyles();
  }, []);

  // Generate star data once (stable across renders)
  const stars = useMemo(() => generateStars(72), []);
  // Split stars into drift groups for parallax clusters
  const driftGroup1 = useMemo(() => stars.slice(0, 18), [stars]);
  const driftGroup2 = useMemo(() => stars.slice(18, 36), [stars]);
  const driftGroup3 = useMemo(() => stars.slice(36, 54), [stars]);
  const staticStars = useMemo(() => stars.slice(54), [stars]);

  return (
    <main className="min-h-screen bg-background">
      {/* Galaxy Header Section */}
      <div
        className="relative overflow-hidden"
        style={{
          background:
            "linear-gradient(135deg, #04041a 0%, #080820 40%, #06061e 70%, #030312 100%)",
        }}
      >
        {/* Nebula glow blobs */}
        <div
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none"
        >
          {/* Purple nebula — top-left */}
          <div
            className="absolute rounded-full"
            style={{
              top: "-20%",
              left: "-10%",
              width: "55%",
              height: "180%",
              background:
                "radial-gradient(ellipse at center, rgba(107,33,168,0.22) 0%, transparent 65%)",
            }}
          />
          {/* Cyan nebula — bottom-right */}
          <div
            className="absolute rounded-full"
            style={{
              bottom: "-30%",
              right: "-5%",
              width: "50%",
              height: "200%",
              background:
                "radial-gradient(ellipse at center, rgba(14,116,144,0.18) 0%, transparent 60%)",
            }}
          />
          {/* Indigo nebula — center-top */}
          <div
            className="absolute rounded-full"
            style={{
              top: "-40%",
              left: "30%",
              width: "40%",
              height: "150%",
              background:
                "radial-gradient(ellipse at center, rgba(67,56,202,0.15) 0%, transparent 60%)",
            }}
          />
          {/* Rose accent — bottom-left */}
          <div
            className="absolute rounded-full"
            style={{
              bottom: "-20%",
              left: "10%",
              width: "30%",
              height: "120%",
              background:
                "radial-gradient(ellipse at center, rgba(157,23,77,0.10) 0%, transparent 60%)",
            }}
          />
        </div>

        {/* Drifting star clusters */}
        <div
          aria-hidden="true"
          className="galaxy-drift-1 absolute inset-0 pointer-events-none"
        >
          {driftGroup1.map((star) => (
            <div
              key={star.id}
              className="star-dot"
              style={
                {
                  top: star.top,
                  left: star.left,
                  width: star.size,
                  height: star.size,
                  "--star-opacity": star.opacity,
                  "--dur": star.animDuration,
                  "--delay": star.animDelay,
                } as React.CSSProperties
              }
            />
          ))}
        </div>
        <div
          aria-hidden="true"
          className="galaxy-drift-2 absolute inset-0 pointer-events-none"
        >
          {driftGroup2.map((star) => (
            <div
              key={star.id}
              className="star-dot"
              style={
                {
                  top: star.top,
                  left: star.left,
                  width: star.size,
                  height: star.size,
                  "--star-opacity": star.opacity,
                  "--dur": star.animDuration,
                  "--delay": star.animDelay,
                } as React.CSSProperties
              }
            />
          ))}
        </div>
        <div
          aria-hidden="true"
          className="galaxy-drift-3 absolute inset-0 pointer-events-none"
        >
          {driftGroup3.map((star) => (
            <div
              key={star.id}
              className="star-dot"
              style={
                {
                  top: star.top,
                  left: star.left,
                  width: star.size,
                  height: star.size,
                  "--star-opacity": star.opacity,
                  "--dur": star.animDuration,
                  "--delay": star.animDelay,
                } as React.CSSProperties
              }
            />
          ))}
        </div>
        {/* Static background stars */}
        <div
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none"
        >
          {staticStars.map((star) => (
            <div
              key={star.id}
              className="star-dot"
              style={
                {
                  top: star.top,
                  left: star.left,
                  width: star.size,
                  height: star.size,
                  "--star-opacity": star.opacity,
                  "--dur": star.animDuration,
                  "--delay": star.animDelay,
                } as React.CSSProperties
              }
            />
          ))}
        </div>

        {/* Content */}
        <div className="relative z-10">
          {/* Breadcrumb */}
          <div className="border-b border-white/10">
            <div className="container max-w-4xl py-3">
              <nav
                aria-label="Breadcrumb"
                className="flex items-center gap-1 text-sm"
              >
                <Link
                  to="/"
                  className="flex items-center gap-1 text-white/60 hover:text-white transition-colors"
                >
                  <Home className="w-3.5 h-3.5" />
                  <span>Home</span>
                </Link>
                <ChevronRight className="w-3.5 h-3.5 text-white/40" />
                <span className="text-white font-medium">{toolName}</span>
              </nav>
            </div>
          </div>

          {/* Tool title area */}
          <div className="container max-w-4xl py-12 pb-14">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="flex items-start gap-5"
            >
              {/* Icon box with glow */}
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0 relative"
                style={{
                  backgroundColor: `${iconColor}22`,
                  border: `1px solid ${iconColor}40`,
                  boxShadow: `0 0 24px ${iconColor}35, 0 0 48px ${iconColor}18`,
                }}
              >
                <Icon className="w-8 h-8" style={{ color: iconColor }} />
              </div>
              <div>
                <h1 className="font-display text-3xl font-bold text-white mb-2 drop-shadow-sm">
                  {toolName}
                </h1>
                <p className="text-white/70 text-base leading-relaxed">
                  {description}
                </p>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Bottom fade to page background */}
        <div
          aria-hidden="true"
          className="absolute bottom-0 left-0 right-0 h-8 pointer-events-none"
          style={{
            background:
              "linear-gradient(to bottom, transparent, var(--background, #ffffff))",
          }}
        />
      </div>

      {/* Tool content area */}
      <div className="container max-w-4xl py-10">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
        >
          {children}
        </motion.div>
      </div>
    </main>
  );
}
