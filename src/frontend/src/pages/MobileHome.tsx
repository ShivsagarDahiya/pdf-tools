import { useMobileTheme } from "@/contexts/MobileThemeContext";
import { Link } from "@tanstack/react-router";
import {
  ArrowLeft,
  FolderOpen,
  Grid3X3,
  Image,
  Pencil,
  Shield,
  Sparkles,
  Wrench,
  Zap,
} from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useMemo, useRef, useState } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface MobileTool {
  name: string;
  path: string;
  color: string;
  category: string;
  svgIcon: React.ReactNode;
  pngIcon?: string;
  comingSoon?: boolean;
}

interface MobileCategory {
  id: string;
  label: string;
  icon: React.ReactNode;
  color: string;
}

// ─── Categories ───────────────────────────────────────────────────────────────

const MOBILE_CATEGORIES: MobileCategory[] = [
  {
    id: "all",
    label: "All Tools",
    icon: <Grid3X3 className="w-4 h-4" />,
    color: "#6366f1",
  },
  {
    id: "organize",
    label: "Organize PDF",
    icon: <FolderOpen className="w-4 h-4" />,
    color: "#E25C3B",
  },
  {
    id: "optimize",
    label: "Optimize",
    icon: <Zap className="w-4 h-4" />,
    color: "#2DBD6E",
  },
  {
    id: "convert-to",
    label: "Convert to PDF",
    icon: (
      <svg
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
        className="w-4 h-4"
      >
        <title>Convert to PDF</title>
        <path
          d="M3 8h10M9 4l4 4-4 4"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
    color: "#3BE28A",
  },
  {
    id: "convert-from",
    label: "From PDF",
    icon: <ArrowLeft className="w-4 h-4" />,
    color: "#3B7AE2",
  },
  {
    id: "edit",
    label: "Edit PDF",
    icon: <Pencil className="w-4 h-4" />,
    color: "#3B8CE2",
  },
  {
    id: "security",
    label: "Security",
    icon: <Shield className="w-4 h-4" />,
    color: "#2DBD6E",
  },
  {
    id: "image",
    label: "Image Tools",
    icon: <Image className="w-4 h-4" />,
    color: "#9B3BE2",
  },
  {
    id: "ai",
    label: "AI Tools",
    icon: <Sparkles className="w-4 h-4" />,
    color: "#7C3BE2",
  },
  {
    id: "utility",
    label: "Utility",
    icon: <Wrench className="w-4 h-4" />,
    color: "#0EA5E9",
  },
];

// ─── All Tools Data ────────────────────────────────────────────────────────────

const ALL_MOBILE_TOOLS: MobileTool[] = [
  // ORGANIZE
  {
    name: "Merge PDF",
    path: "/merge",
    color: "#E25C3B",
    category: "organize",
    pngIcon: "/assets/generated/tool-merge-pdf-transparent.dim_64x64.png",
    svgIcon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <title>Merge PDF</title>
        <rect
          x="2"
          y="3"
          width="6"
          height="8"
          rx="1"
          fill="#E25C3B"
          opacity="0.25"
        />
        <rect
          x="2"
          y="3"
          width="6"
          height="8"
          rx="1"
          stroke="#E25C3B"
          strokeWidth="1.4"
        />
        <rect
          x="12"
          y="3"
          width="6"
          height="8"
          rx="1"
          fill="#E25C3B"
          opacity="0.25"
        />
        <rect
          x="12"
          y="3"
          width="6"
          height="8"
          rx="1"
          stroke="#E25C3B"
          strokeWidth="1.4"
        />
        <path
          d="M5 11v3h10v-3"
          stroke="#E25C3B"
          strokeWidth="1.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M10 14v3"
          stroke="#E25C3B"
          strokeWidth="1.4"
          strokeLinecap="round"
        />
        <path
          d="M8 16l2 2 2-2"
          stroke="#E25C3B"
          strokeWidth="1.3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    name: "Split PDF",
    path: "/split",
    color: "#D64E4E",
    category: "organize",
    pngIcon: "/assets/generated/tool-split-pdf-transparent.dim_64x64.png",
    svgIcon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <title>Split PDF</title>
        <rect
          x="3"
          y="2"
          width="14"
          height="10"
          rx="1"
          fill="#D64E4E"
          opacity="0.2"
        />
        <rect
          x="3"
          y="2"
          width="14"
          height="10"
          rx="1"
          stroke="#D64E4E"
          strokeWidth="1.4"
        />
        <path
          d="M3 7h14"
          stroke="#D64E4E"
          strokeWidth="1"
          strokeDasharray="2.5 1.5"
        />
        <rect
          x="3"
          y="14"
          width="6"
          height="5"
          rx="1"
          fill="#D64E4E"
          opacity="0.3"
        />
        <rect
          x="3"
          y="14"
          width="6"
          height="5"
          rx="1"
          stroke="#D64E4E"
          strokeWidth="1.3"
        />
        <rect
          x="11"
          y="14"
          width="6"
          height="5"
          rx="1"
          fill="#D64E4E"
          opacity="0.3"
        />
        <rect
          x="11"
          y="14"
          width="6"
          height="5"
          rx="1"
          stroke="#D64E4E"
          strokeWidth="1.3"
        />
      </svg>
    ),
  },
  {
    name: "Remove Pages",
    path: "/remove-pages",
    color: "#E25C3B",
    category: "organize",
    pngIcon: "/assets/generated/tool-remove-pages-transparent.dim_64x64.png",
    svgIcon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <title>Remove Pages</title>
        <path
          d="M4 3h8l4 4v10a1 1 0 01-1 1H4a1 1 0 01-1-1V4a1 1 0 011-1z"
          fill="#E25C3B"
          opacity="0.15"
        />
        <path
          d="M4 3h8l4 4v10a1 1 0 01-1 1H4a1 1 0 01-1-1V4a1 1 0 011-1z"
          stroke="#E25C3B"
          strokeWidth="1.4"
        />
        <rect x="6" y="9.5" width="8" height="2" rx="0.5" fill="#E25C3B" />
      </svg>
    ),
  },
  {
    name: "Extract Pages",
    path: "/extract-pages",
    color: "#E2823B",
    category: "organize",
    comingSoon: true,
    pngIcon: "/assets/generated/tool-extract-pages-transparent.dim_64x64.png",
    svgIcon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <title>Extract Pages</title>
        <path
          d="M4 3h8l4 4v10a1 1 0 01-1 1H4a1 1 0 01-1-1V4a1 1 0 011-1z"
          fill="#E2823B"
          opacity="0.15"
        />
        <path
          d="M4 3h8l4 4v10a1 1 0 01-1 1H4a1 1 0 01-1-1V4a1 1 0 011-1z"
          stroke="#E2823B"
          strokeWidth="1.4"
        />
        <path
          d="M7 12l3-3 3 3M10 9v6"
          stroke="#E2823B"
          strokeWidth="1.3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    name: "Organize PDF",
    path: "/organize",
    color: "#3B8CE2",
    category: "organize",
    pngIcon: "/assets/generated/tool-organize-pdf-transparent.dim_64x64.png",
    svgIcon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <title>Organize PDF</title>
        <rect
          x="2"
          y="3"
          width="16"
          height="4"
          rx="1"
          fill="#3B8CE2"
          opacity="0.2"
        />
        <rect
          x="2"
          y="3"
          width="16"
          height="4"
          rx="1"
          stroke="#3B8CE2"
          strokeWidth="1.4"
        />
        <rect
          x="2"
          y="9"
          width="16"
          height="4"
          rx="1"
          fill="#3B8CE2"
          opacity="0.15"
        />
        <rect
          x="2"
          y="9"
          width="16"
          height="4"
          rx="1"
          stroke="#3B8CE2"
          strokeWidth="1.3"
        />
        <rect
          x="2"
          y="15"
          width="16"
          height="3"
          rx="1"
          fill="#3B8CE2"
          opacity="0.1"
        />
        <rect
          x="2"
          y="15"
          width="16"
          height="3"
          rx="1"
          stroke="#3B8CE2"
          strokeWidth="1.2"
        />
      </svg>
    ),
  },
  {
    name: "OCR PDF",
    path: "/ocr",
    color: "#3B8CE2",
    category: "organize",
    comingSoon: true,
    pngIcon: "/assets/generated/tool-ocr-pdf-transparent.dim_64x64.png",
    svgIcon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <title>OCR PDF</title>
        <rect
          x="2"
          y="3"
          width="11"
          height="14"
          rx="1"
          fill="#3B8CE2"
          opacity="0.12"
        />
        <rect
          x="2"
          y="3"
          width="11"
          height="14"
          rx="1"
          stroke="#3B8CE2"
          strokeWidth="1.4"
        />
        <path
          d="M5 7h5M5 9.5h7M5 12h4"
          stroke="#3B8CE2"
          strokeWidth="1.1"
          strokeLinecap="round"
          opacity="0.6"
        />
        <circle
          cx="15"
          cy="13"
          r="3.5"
          fill="#3B8CE2"
          opacity="0.2"
          stroke="#3B8CE2"
          strokeWidth="1.3"
        />
      </svg>
    ),
  },
  {
    name: "Scan to PDF",
    path: "/scan-to-pdf",
    color: "#2DBD6E",
    category: "organize",
    comingSoon: true,
    pngIcon: "/assets/generated/tool-scan-to-pdf-transparent.dim_64x64.png",
    svgIcon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <title>Scan to PDF</title>
        <rect
          x="2"
          y="6"
          width="16"
          height="11"
          rx="1.5"
          fill="#2DBD6E"
          opacity="0.15"
        />
        <rect
          x="2"
          y="6"
          width="16"
          height="11"
          rx="1.5"
          stroke="#2DBD6E"
          strokeWidth="1.4"
        />
        <circle cx="10" cy="12" r="3" fill="#2DBD6E" opacity="0.25" />
        <circle cx="10" cy="12" r="3" stroke="#2DBD6E" strokeWidth="1.3" />
        <circle cx="10" cy="12" r="1.2" fill="#2DBD6E" />
      </svg>
    ),
  },
  // OPTIMIZE
  {
    name: "Compress PDF",
    path: "/compress",
    color: "#E25C3B",
    category: "optimize",
    pngIcon: "/assets/generated/tool-compress-pdf-transparent.dim_64x64.png",
    svgIcon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <title>Compress PDF</title>
        <path
          d="M4 3h8l4 4v10a1 1 0 01-1 1H4a1 1 0 01-1-1V4a1 1 0 011-1z"
          fill="#E25C3B"
          opacity="0.15"
        />
        <path
          d="M4 3h8l4 4v10a1 1 0 01-1 1H4a1 1 0 01-1-1V4a1 1 0 011-1z"
          stroke="#E25C3B"
          strokeWidth="1.4"
        />
        <path
          d="M7 12l3-3 3 3"
          stroke="#E25C3B"
          strokeWidth="1.3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M10 9v6"
          stroke="#E25C3B"
          strokeWidth="1.3"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    name: "Optimize PDF",
    path: "/optimize",
    color: "#2DBD6E",
    category: "optimize",
    pngIcon: "/assets/generated/tool-optimize-pdf-transparent.dim_64x64.png",
    svgIcon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <title>Optimize PDF</title>
        <path
          d="M4 3h8l4 4v10a1 1 0 01-1 1H4a1 1 0 01-1-1V4a1 1 0 011-1z"
          fill="#2DBD6E"
          opacity="0.12"
        />
        <path
          d="M4 3h8l4 4v10a1 1 0 01-1 1H4a1 1 0 01-1-1V4a1 1 0 011-1z"
          stroke="#2DBD6E"
          strokeWidth="1.4"
        />
      </svg>
    ),
  },
  {
    name: "Repair PDF",
    path: "/repair",
    color: "#E27A3B",
    category: "optimize",
    pngIcon: "/assets/generated/tool-repair-pdf-transparent.dim_64x64.png",
    svgIcon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <title>Repair PDF</title>
        <path
          d="M4 3h8l4 4v10a1 1 0 01-1 1H4a1 1 0 01-1-1V4a1 1 0 011-1z"
          fill="#E27A3B"
          opacity="0.12"
        />
        <path
          d="M4 3h8l4 4v10a1 1 0 01-1 1H4a1 1 0 01-1-1V4a1 1 0 011-1z"
          stroke="#E27A3B"
          strokeWidth="1.4"
        />
      </svg>
    ),
  },
  // CONVERT TO PDF
  {
    name: "JPG to PDF",
    path: "/jpg-to-pdf",
    color: "#3BE28A",
    category: "convert-to",
    pngIcon: "/assets/generated/tool-jpg-to-pdf-transparent.dim_64x64.png",
    svgIcon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <title>JPG to PDF</title>
        <rect
          x="2"
          y="3"
          width="9"
          height="9"
          rx="1"
          fill="#3BE28A"
          opacity="0.2"
        />
        <rect
          x="2"
          y="3"
          width="9"
          height="9"
          rx="1"
          stroke="#3BE28A"
          strokeWidth="1.4"
        />
        <rect
          x="10"
          y="11"
          width="8"
          height="7"
          rx="1"
          fill="#3BE28A"
          opacity="0.15"
        />
        <rect
          x="10"
          y="11"
          width="8"
          height="7"
          rx="1"
          stroke="#3BE28A"
          strokeWidth="1.3"
        />
      </svg>
    ),
  },
  {
    name: "Word to PDF",
    path: "/word-to-pdf",
    color: "#2B5CE2",
    category: "convert-to",
    comingSoon: true,
    pngIcon: "/assets/generated/tool-word-to-pdf-transparent.dim_64x64.png",
    svgIcon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <title>Word to PDF</title>
        <rect
          x="2"
          y="2"
          width="9"
          height="13"
          rx="1"
          fill="#2B5CE2"
          opacity="0.15"
        />
        <rect
          x="2"
          y="2"
          width="9"
          height="13"
          rx="1"
          stroke="#2B5CE2"
          strokeWidth="1.4"
        />
        <text
          x="3.5"
          y="11"
          fontSize="7"
          fill="#2B5CE2"
          fontWeight="bold"
          fontFamily="sans-serif"
        >
          W
        </text>
        <rect
          x="11"
          y="11"
          width="7"
          height="7"
          rx="1"
          fill="#2B5CE2"
          opacity="0.15"
        />
        <rect
          x="11"
          y="11"
          width="7"
          height="7"
          rx="1"
          stroke="#2B5CE2"
          strokeWidth="1.3"
        />
      </svg>
    ),
  },
  {
    name: "PowerPoint to PDF",
    path: "/pptx-to-pdf",
    color: "#D94F34",
    category: "convert-to",
    comingSoon: true,
    pngIcon: "/assets/generated/tool-ppt-to-pdf-transparent.dim_64x64.png",
    svgIcon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <title>PowerPoint to PDF</title>
        <rect
          x="1"
          y="4"
          width="13"
          height="10"
          rx="1"
          fill="#D94F34"
          opacity="0.15"
        />
        <rect
          x="1"
          y="4"
          width="13"
          height="10"
          rx="1"
          stroke="#D94F34"
          strokeWidth="1.4"
        />
        <rect
          x="13"
          y="11"
          width="6"
          height="6"
          rx="1"
          fill="#D94F34"
          opacity="0.2"
        />
        <rect
          x="13"
          y="11"
          width="6"
          height="6"
          rx="1"
          stroke="#D94F34"
          strokeWidth="1.2"
        />
      </svg>
    ),
  },
  {
    name: "Excel to PDF",
    path: "/excel-to-pdf",
    color: "#1D6F42",
    category: "convert-to",
    comingSoon: true,
    pngIcon: "/assets/generated/tool-excel-to-pdf-transparent.dim_64x64.png",
    svgIcon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <title>Excel to PDF</title>
        <rect
          x="2"
          y="3"
          width="11"
          height="13"
          rx="1"
          fill="#1D6F42"
          opacity="0.12"
        />
        <rect
          x="2"
          y="3"
          width="11"
          height="13"
          rx="1"
          stroke="#1D6F42"
          strokeWidth="1.4"
        />
        <path
          d="M2 7.5h11M2 11h11M7.5 3v13"
          stroke="#1D6F42"
          strokeWidth="1"
          strokeLinecap="round"
          opacity="0.5"
        />
      </svg>
    ),
  },
  {
    name: "HTML to PDF",
    path: "/html-to-pdf",
    color: "#E27A3B",
    category: "convert-to",
    comingSoon: true,
    pngIcon: "/assets/generated/tool-html-to-pdf-transparent.dim_64x64.png",
    svgIcon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <title>HTML to PDF</title>
        <rect
          x="2"
          y="3"
          width="16"
          height="12"
          rx="1.5"
          fill="#E27A3B"
          opacity="0.12"
        />
        <rect
          x="2"
          y="3"
          width="16"
          height="12"
          rx="1.5"
          stroke="#E27A3B"
          strokeWidth="1.4"
        />
        <path
          d="M6.5 7L4 9.5 6.5 12M13.5 7L16 9.5 13.5 12"
          stroke="#E27A3B"
          strokeWidth="1.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  // CONVERT FROM PDF
  {
    name: "PDF to JPG",
    path: "/pdf-to-jpg",
    color: "#3B7AE2",
    category: "convert-from",
    pngIcon: "/assets/generated/tool-pdf-to-jpg-transparent.dim_64x64.png",
    svgIcon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <title>PDF to JPG</title>
        <rect
          x="2"
          y="2"
          width="9"
          height="12"
          rx="1"
          fill="#3B7AE2"
          opacity="0.15"
        />
        <rect
          x="2"
          y="2"
          width="9"
          height="12"
          rx="1"
          stroke="#3B7AE2"
          strokeWidth="1.4"
        />
        <rect
          x="11"
          y="11"
          width="7"
          height="7"
          rx="1"
          fill="#3B7AE2"
          opacity="0.2"
        />
        <rect
          x="11"
          y="11"
          width="7"
          height="7"
          rx="1"
          stroke="#3B7AE2"
          strokeWidth="1.3"
        />
      </svg>
    ),
  },
  {
    name: "PDF to Word",
    path: "/pdf-to-word",
    color: "#2B5CE2",
    category: "convert-from",
    comingSoon: true,
    pngIcon: "/assets/generated/tool-pdf-to-word-transparent.dim_64x64.png",
    svgIcon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <title>PDF to Word</title>
        <rect
          x="2"
          y="2"
          width="9"
          height="12"
          rx="1"
          fill="#2B5CE2"
          opacity="0.15"
        />
        <rect
          x="2"
          y="2"
          width="9"
          height="12"
          rx="1"
          stroke="#2B5CE2"
          strokeWidth="1.4"
        />
        <rect
          x="11"
          y="9"
          width="7"
          height="7"
          rx="1"
          fill="#2B5CE2"
          opacity="0.12"
        />
        <rect
          x="11"
          y="9"
          width="7"
          height="7"
          rx="1"
          stroke="#2B5CE2"
          strokeWidth="1.2"
        />
      </svg>
    ),
  },
  {
    name: "PDF to PowerPoint",
    path: "/pdf-to-pptx",
    color: "#D94F34",
    category: "convert-from",
    comingSoon: true,
    pngIcon: "/assets/generated/tool-pdf-to-ppt-transparent.dim_64x64.png",
    svgIcon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <title>PDF to PowerPoint</title>
        <rect
          x="2"
          y="2"
          width="9"
          height="12"
          rx="1"
          fill="#D94F34"
          opacity="0.15"
        />
        <rect
          x="2"
          y="2"
          width="9"
          height="12"
          rx="1"
          stroke="#D94F34"
          strokeWidth="1.4"
        />
        <rect
          x="11"
          y="9"
          width="7"
          height="7"
          rx="1"
          fill="#D94F34"
          opacity="0.12"
        />
        <rect
          x="11"
          y="9"
          width="7"
          height="7"
          rx="1"
          stroke="#D94F34"
          strokeWidth="1.2"
        />
      </svg>
    ),
  },
  {
    name: "PDF to Excel",
    path: "/pdf-to-excel",
    color: "#1D6F42",
    category: "convert-from",
    comingSoon: true,
    pngIcon: "/assets/generated/tool-pdf-to-excel-transparent.dim_64x64.png",
    svgIcon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <title>PDF to Excel</title>
        <rect
          x="2"
          y="2"
          width="9"
          height="12"
          rx="1"
          fill="#1D6F42"
          opacity="0.15"
        />
        <rect
          x="2"
          y="2"
          width="9"
          height="12"
          rx="1"
          stroke="#1D6F42"
          strokeWidth="1.4"
        />
        <rect
          x="11"
          y="9"
          width="7"
          height="7"
          rx="1"
          fill="#1D6F42"
          opacity="0.12"
        />
        <rect
          x="11"
          y="9"
          width="7"
          height="7"
          rx="1"
          stroke="#1D6F42"
          strokeWidth="1.2"
        />
      </svg>
    ),
  },
  {
    name: "PDF to PDF/A",
    path: "/pdf-to-pdfa",
    color: "#6B3BE2",
    category: "convert-from",
    comingSoon: true,
    pngIcon: "/assets/generated/tool-pdf-to-pdfa-transparent.dim_64x64.png",
    svgIcon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <title>PDF/A</title>
        <rect
          x="2"
          y="2"
          width="9"
          height="12"
          rx="1"
          fill="#6B3BE2"
          opacity="0.15"
        />
        <rect
          x="2"
          y="2"
          width="9"
          height="12"
          rx="1"
          stroke="#6B3BE2"
          strokeWidth="1.4"
        />
        <text
          x="12"
          y="16"
          fontSize="5"
          fill="#6B3BE2"
          fontWeight="bold"
          fontFamily="sans-serif"
        >
          /A
        </text>
      </svg>
    ),
  },
  {
    name: "PDF to HTML",
    path: "/pdf-to-html",
    color: "#F59E0B",
    category: "convert-from",
    pngIcon: "/assets/generated/tool-pdf-to-html-transparent.dim_64x64.png",
    svgIcon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <title>PDF to HTML</title>
        <rect
          x="2"
          y="3"
          width="9"
          height="12"
          rx="1"
          fill="#F59E0B"
          opacity="0.15"
          stroke="#F59E0B"
          strokeWidth="1.4"
        />
        <path
          d="M13.5 9L11 11.5 13.5 14M17.5 9L20 11.5 17.5 14"
          stroke="#F59E0B"
          strokeWidth="1.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    name: "PDF to Markdown",
    path: "/pdf-to-markdown",
    color: "#6366F1",
    category: "convert-from",
    pngIcon: "/assets/generated/tool-pdf-to-markdown-transparent.dim_64x64.png",
    svgIcon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <title>PDF to Markdown</title>
        <rect
          x="2"
          y="3"
          width="9"
          height="12"
          rx="1"
          fill="#6366F1"
          opacity="0.15"
          stroke="#6366F1"
          strokeWidth="1.4"
        />
        <text
          x="12"
          y="15"
          fontSize="6"
          fill="#6366F1"
          fontWeight="bold"
          fontFamily="monospace"
        >
          MD
        </text>
      </svg>
    ),
  },
  {
    name: "PDF to RTF",
    path: "/pdf-to-rtf",
    color: "#8B5CF6",
    category: "convert-from",
    pngIcon: "/assets/generated/tool-pdf-to-rtf-transparent.dim_64x64.png",
    svgIcon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <title>PDF to RTF</title>
        <rect
          x="2"
          y="3"
          width="9"
          height="12"
          rx="1"
          fill="#8B5CF6"
          opacity="0.15"
          stroke="#8B5CF6"
          strokeWidth="1.4"
        />
        <text
          x="12"
          y="15"
          fontSize="5"
          fill="#8B5CF6"
          fontWeight="bold"
          fontFamily="monospace"
        >
          RTF
        </text>
      </svg>
    ),
  },
  {
    name: "Markdown to PDF",
    path: "/markdown-to-pdf",
    color: "#10B981",
    category: "convert-from",
    pngIcon: "/assets/generated/tool-markdown-to-pdf-transparent.dim_64x64.png",
    svgIcon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <title>Markdown to PDF</title>
        <text
          x="1"
          y="12"
          fontSize="6"
          fill="#10B981"
          fontWeight="bold"
          fontFamily="monospace"
        >
          MD
        </text>
        <path
          d="M12 4v10M9 11l3 3 3-3"
          stroke="#10B981"
          strokeWidth="1.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    name: "RTF to PDF",
    path: "/rtf-to-pdf",
    color: "#EC4899",
    category: "convert-from",
    pngIcon: "/assets/generated/tool-rtf-to-pdf-transparent.dim_64x64.png",
    svgIcon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <title>RTF to PDF</title>
        <text
          x="1"
          y="12"
          fontSize="5"
          fill="#EC4899"
          fontWeight="bold"
          fontFamily="monospace"
        >
          RTF
        </text>
        <path
          d="M12 4v10M9 11l3 3 3-3"
          stroke="#EC4899"
          strokeWidth="1.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  // EDIT PDF
  {
    name: "Edit PDF",
    path: "/edit",
    color: "#3B8CE2",
    category: "edit",
    pngIcon: "/assets/generated/tool-edit-pdf-transparent.dim_64x64.png",
    svgIcon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <title>Edit PDF</title>
        <path
          d="M4 3h8l4 4v10a1 1 0 01-1 1H4a1 1 0 01-1-1V4a1 1 0 011-1z"
          fill="#3B8CE2"
          opacity="0.15"
        />
        <path
          d="M4 3h8l4 4v10a1 1 0 01-1 1H4a1 1 0 01-1-1V4a1 1 0 011-1z"
          stroke="#3B8CE2"
          strokeWidth="1.4"
        />
        <path
          d="M13 10.5l-5 5H6v-2l5-5 2 2z"
          fill="#3B8CE2"
          opacity="0.3"
          stroke="#3B8CE2"
          strokeWidth="1.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    name: "Advanced Edit",
    path: "/edit-advanced",
    color: "#6366f1",
    category: "edit",
    pngIcon: "/assets/generated/tool-advanced-edit-transparent.dim_64x64.png",
    svgIcon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <title>Advanced Edit</title>
        <path
          d="M4 3h8l4 4v10a1 1 0 01-1 1H4a1 1 0 01-1-1V4a1 1 0 011-1z"
          fill="#6366f1"
          opacity="0.15"
        />
        <path
          d="M4 3h8l4 4v10a1 1 0 01-1 1H4a1 1 0 01-1-1V4a1 1 0 011-1z"
          stroke="#6366f1"
          strokeWidth="1.4"
        />
        <circle
          cx="12"
          cy="13"
          r="2.5"
          fill="#6366f1"
          opacity="0.3"
          stroke="#6366f1"
          strokeWidth="1.2"
        />
        <path
          d="M14 11l2-2"
          stroke="#6366f1"
          strokeWidth="1.2"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    name: "Rotate PDF",
    path: "/rotate",
    color: "#3B8CE2",
    category: "edit",
    pngIcon: "/assets/generated/tool-rotate-pdf-transparent.dim_64x64.png",
    svgIcon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <title>Rotate PDF</title>
        <path
          d="M15.5 5A7 7 0 103 11"
          stroke="#3B8CE2"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <path
          d="M3 6.5V11H7.5"
          stroke="#3B8CE2"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <rect
          x="7"
          y="9"
          width="8"
          height="8"
          rx="1"
          fill="#3B8CE2"
          opacity="0.2"
        />
        <rect
          x="7"
          y="9"
          width="8"
          height="8"
          rx="1"
          stroke="#3B8CE2"
          strokeWidth="1.2"
        />
      </svg>
    ),
  },
  {
    name: "Add Page Numbers",
    path: "/page-numbers",
    color: "#E2823B",
    category: "edit",
    pngIcon: "/assets/generated/tool-page-numbers-transparent.dim_64x64.png",
    svgIcon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <title>Page Numbers</title>
        <path
          d="M4 3h8l4 4v10a1 1 0 01-1 1H4a1 1 0 01-1-1V4a1 1 0 011-1z"
          fill="#E2823B"
          opacity="0.15"
        />
        <path
          d="M4 3h8l4 4v10a1 1 0 01-1 1H4a1 1 0 01-1-1V4a1 1 0 011-1z"
          stroke="#E2823B"
          strokeWidth="1.4"
        />
        <text
          x="8"
          y="14"
          fontSize="6"
          fill="#E2823B"
          fontWeight="bold"
          fontFamily="sans-serif"
        >
          1
        </text>
      </svg>
    ),
  },
  {
    name: "Watermark",
    path: "/watermark",
    color: "#9B3BE2",
    category: "edit",
    pngIcon: "/assets/generated/tool-watermark-pdf-transparent.dim_64x64.png",
    svgIcon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <title>Watermark</title>
        <path
          d="M4 3h8l4 4v10a1 1 0 01-1 1H4a1 1 0 01-1-1V4a1 1 0 011-1z"
          fill="#9B3BE2"
          opacity="0.15"
        />
        <path
          d="M4 3h8l4 4v10a1 1 0 01-1 1H4a1 1 0 01-1-1V4a1 1 0 011-1z"
          stroke="#9B3BE2"
          strokeWidth="1.4"
        />
        <text
          x="6"
          y="14"
          fontSize="5"
          fill="#9B3BE2"
          opacity="0.7"
          fontFamily="sans-serif"
        >
          WM
        </text>
      </svg>
    ),
  },
  {
    name: "Crop PDF",
    path: "/crop",
    color: "#9B3BE2",
    category: "edit",
    pngIcon: "/assets/generated/tool-crop-pdf-transparent.dim_64x64.png",
    svgIcon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <title>Crop PDF</title>
        <path
          d="M4 3h8l4 4v10a1 1 0 01-1 1H4a1 1 0 01-1-1V4a1 1 0 011-1z"
          fill="#9B3BE2"
          opacity="0.12"
        />
        <path
          d="M4 3h8l4 4v10a1 1 0 01-1 1H4a1 1 0 01-1-1V4a1 1 0 011-1z"
          stroke="#9B3BE2"
          strokeWidth="1.4"
        />
        <path
          d="M6 8h8M8 6v8"
          stroke="#9B3BE2"
          strokeWidth="1.1"
          strokeLinecap="round"
          strokeDasharray="1.5 1"
        />
      </svg>
    ),
  },
  // SECURITY
  {
    name: "Protect PDF",
    path: "/protect",
    color: "#2DBD6E",
    category: "security",
    pngIcon: "/assets/generated/tool-protect-pdf-transparent.dim_64x64.png",
    svgIcon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <title>Protect PDF</title>
        <path
          d="M4 3h8l4 4v10a1 1 0 01-1 1H4a1 1 0 01-1-1V4a1 1 0 011-1z"
          fill="#2DBD6E"
          opacity="0.12"
        />
        <path
          d="M4 3h8l4 4v10a1 1 0 01-1 1H4a1 1 0 01-1-1V4a1 1 0 011-1z"
          stroke="#2DBD6E"
          strokeWidth="1.4"
        />
        <rect
          x="6.5"
          y="11"
          width="7"
          height="5.5"
          rx="1"
          fill="#2DBD6E"
          opacity="0.25"
        />
        <rect
          x="6.5"
          y="11"
          width="7"
          height="5.5"
          rx="1"
          stroke="#2DBD6E"
          strokeWidth="1.3"
        />
        <path
          d="M8.5 11V9.5a1.5 1.5 0 013 0V11"
          stroke="#2DBD6E"
          strokeWidth="1.3"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    name: "Unlock PDF",
    path: "/unlock",
    color: "#E2C43B",
    category: "security",
    pngIcon: "/assets/generated/tool-unlock-pdf-transparent.dim_64x64.png",
    svgIcon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <title>Unlock PDF</title>
        <path
          d="M4 3h8l4 4v10a1 1 0 01-1 1H4a1 1 0 01-1-1V4a1 1 0 011-1z"
          fill="#E2C43B"
          opacity="0.12"
        />
        <path
          d="M4 3h8l4 4v10a1 1 0 01-1 1H4a1 1 0 01-1-1V4a1 1 0 011-1z"
          stroke="#E2C43B"
          strokeWidth="1.4"
        />
        <rect
          x="6.5"
          y="11"
          width="7"
          height="5.5"
          rx="1"
          fill="#E2C43B"
          opacity="0.25"
        />
        <rect
          x="6.5"
          y="11"
          width="7"
          height="5.5"
          rx="1"
          stroke="#E2C43B"
          strokeWidth="1.3"
        />
      </svg>
    ),
  },
  {
    name: "Sign PDF",
    path: "/sign",
    color: "#2DBD6E",
    category: "security",
    pngIcon: "/assets/generated/tool-sign-pdf-transparent.dim_64x64.png",
    svgIcon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <title>Sign PDF</title>
        <path
          d="M4 3h8l4 4v10a1 1 0 01-1 1H4a1 1 0 01-1-1V4a1 1 0 011-1z"
          fill="#2DBD6E"
          opacity="0.12"
        />
        <path
          d="M4 3h8l4 4v10a1 1 0 01-1 1H4a1 1 0 01-1-1V4a1 1 0 011-1z"
          stroke="#2DBD6E"
          strokeWidth="1.4"
        />
        <path
          d="M5.5 13.5c.8-1.5 1.3-2.5 1.8-2.5s1 1.5 1.5 1.5 1-2 1.5-2 1 2 1.5 1.5l.8-.8"
          stroke="#2DBD6E"
          strokeWidth="1.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    name: "Redact PDF",
    path: "/redact",
    color: "#E23B3B",
    category: "security",
    comingSoon: true,
    pngIcon: "/assets/generated/tool-redact-pdf-transparent.dim_64x64.png",
    svgIcon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <title>Redact PDF</title>
        <path
          d="M4 3h8l4 4v10a1 1 0 01-1 1H4a1 1 0 01-1-1V4a1 1 0 011-1z"
          fill="#E23B3B"
          opacity="0.12"
        />
        <path
          d="M4 3h8l4 4v10a1 1 0 01-1 1H4a1 1 0 01-1-1V4a1 1 0 011-1z"
          stroke="#E23B3B"
          strokeWidth="1.4"
        />
        <rect x="5" y="9.5" width="10" height="2.5" rx="0.4" fill="#E23B3B" />
      </svg>
    ),
  },
  {
    name: "Compare PDF",
    path: "/compare",
    color: "#3B7AE2",
    category: "security",
    comingSoon: true,
    pngIcon: "/assets/generated/tool-compare-pdf-transparent.dim_64x64.png",
    svgIcon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <title>Compare PDF</title>
        <rect
          x="1.5"
          y="3"
          width="7"
          height="11"
          rx="1"
          fill="#3B7AE2"
          opacity="0.15"
        />
        <rect
          x="1.5"
          y="3"
          width="7"
          height="11"
          rx="1"
          stroke="#3B7AE2"
          strokeWidth="1.4"
        />
        <rect
          x="11.5"
          y="3"
          width="7"
          height="11"
          rx="1"
          fill="#3B7AE2"
          opacity="0.25"
        />
        <rect
          x="11.5"
          y="3"
          width="7"
          height="11"
          rx="1"
          stroke="#3B7AE2"
          strokeWidth="1.4"
        />
      </svg>
    ),
  },
  {
    name: "Translate PDF",
    path: "/translate",
    color: "#7C3BE2",
    category: "security",
    comingSoon: true,
    pngIcon: "/assets/generated/tool-translate-pdf-transparent.dim_64x64.png",
    svgIcon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <title>Translate PDF</title>
        <circle cx="10" cy="10" r="8" fill="#7C3BE2" opacity="0.12" />
        <circle cx="10" cy="10" r="8" stroke="#7C3BE2" strokeWidth="1.4" />
        <path
          d="M2 10h16"
          stroke="#7C3BE2"
          strokeWidth="1.1"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  // IMAGE TOOLS
  {
    name: "Compress Image",
    path: "/img-compress",
    color: "#E25C3B",
    category: "image",
    pngIcon: "/assets/generated/tool-compress-image-transparent.dim_64x64.png",
    svgIcon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <title>Compress Image</title>
        <rect
          x="2"
          y="3"
          width="16"
          height="12"
          rx="1.5"
          fill="#E25C3B"
          opacity="0.15"
        />
        <rect
          x="2"
          y="3"
          width="16"
          height="12"
          rx="1.5"
          stroke="#E25C3B"
          strokeWidth="1.4"
        />
        <circle cx="6" cy="6.5" r="1.2" fill="#E25C3B" opacity="0.6" />
      </svg>
    ),
  },
  {
    name: "Resize Image",
    path: "/img-resize",
    color: "#3B8CE2",
    category: "image",
    pngIcon: "/assets/generated/tool-resize-image-transparent.dim_64x64.png",
    svgIcon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <title>Resize Image</title>
        <rect
          x="1.5"
          y="2.5"
          width="10"
          height="9"
          rx="1"
          fill="#3B8CE2"
          opacity="0.15"
        />
        <rect
          x="1.5"
          y="2.5"
          width="10"
          height="9"
          rx="1"
          stroke="#3B8CE2"
          strokeWidth="1.4"
        />
        <path
          d="M14 8v9M14 17H5M14 8l2.5 2.5M5 17l-2.5-2.5"
          stroke="#3B8CE2"
          strokeWidth="1.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    name: "Crop Image",
    path: "/img-crop",
    color: "#2DBD6E",
    category: "image",
    pngIcon: "/assets/generated/tool-crop-image-transparent.dim_64x64.png",
    svgIcon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <title>Crop Image</title>
        <path
          d="M5 1.5v14h14"
          stroke="#2DBD6E"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <rect
          x="5"
          y="5"
          width="10"
          height="10"
          rx="0.5"
          fill="#2DBD6E"
          opacity="0.15"
          stroke="#2DBD6E"
          strokeWidth="1.2"
          strokeDasharray="2 1.5"
        />
      </svg>
    ),
  },
  {
    name: "Convert Image",
    path: "/img-convert",
    color: "#9B3BE2",
    category: "image",
    pngIcon: "/assets/generated/tool-convert-image-transparent.dim_64x64.png",
    svgIcon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <title>Convert Image</title>
        <rect
          x="1.5"
          y="2.5"
          width="7.5"
          height="7.5"
          rx="1"
          fill="#9B3BE2"
          opacity="0.2"
        />
        <rect
          x="1.5"
          y="2.5"
          width="7.5"
          height="7.5"
          rx="1"
          stroke="#9B3BE2"
          strokeWidth="1.4"
        />
        <rect
          x="11"
          y="10"
          width="7.5"
          height="7.5"
          rx="1"
          fill="#9B3BE2"
          opacity="0.2"
        />
        <rect
          x="11"
          y="10"
          width="7.5"
          height="7.5"
          rx="1"
          stroke="#9B3BE2"
          strokeWidth="1.4"
        />
      </svg>
    ),
  },
  {
    name: "Rotate & Flip",
    path: "/img-rotate",
    color: "#3BE2D4",
    category: "image",
    pngIcon: "/assets/generated/tool-rotate-image-transparent.dim_64x64.png",
    svgIcon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <title>Rotate Image</title>
        <path
          d="M16 5A7 7 0 104.5 11.5"
          stroke="#3BE2D4"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <rect
          x="7.5"
          y="9.5"
          width="7"
          height="7"
          rx="1"
          fill="#3BE2D4"
          opacity="0.2"
        />
        <rect
          x="7.5"
          y="9.5"
          width="7"
          height="7"
          rx="1"
          stroke="#3BE2D4"
          strokeWidth="1.3"
        />
      </svg>
    ),
  },
  {
    name: "Watermark Image",
    path: "/img-watermark",
    color: "#7C3BE2",
    category: "image",
    pngIcon: "/assets/generated/tool-watermark-image-transparent.dim_64x64.png",
    svgIcon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <title>Watermark Image</title>
        <rect
          x="2"
          y="3"
          width="16"
          height="12"
          rx="1.5"
          fill="#7C3BE2"
          opacity="0.12"
        />
        <rect
          x="2"
          y="3"
          width="16"
          height="12"
          rx="1.5"
          stroke="#7C3BE2"
          strokeWidth="1.4"
        />
        <text
          x="5"
          y="12"
          fontSize="5"
          fill="#7C3BE2"
          opacity="0.7"
          fontFamily="sans-serif"
        >
          WM
        </text>
      </svg>
    ),
  },
  {
    name: "Image to PDF",
    path: "/img-to-pdf",
    color: "#E23B3B",
    category: "image",
    pngIcon: "/assets/generated/tool-img-to-pdf-transparent.dim_64x64.png",
    svgIcon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <title>Image to PDF</title>
        <rect
          x="2"
          y="2.5"
          width="8"
          height="9"
          rx="1"
          fill="#E23B3B"
          opacity="0.2"
        />
        <rect
          x="2"
          y="2.5"
          width="8"
          height="9"
          rx="1"
          stroke="#E23B3B"
          strokeWidth="1.4"
        />
        <rect
          x="10"
          y="11"
          width="8"
          height="7"
          rx="1"
          fill="#E23B3B"
          opacity="0.15"
        />
        <rect
          x="10"
          y="11"
          width="8"
          height="7"
          rx="1"
          stroke="#E23B3B"
          strokeWidth="1.3"
        />
      </svg>
    ),
  },
  {
    name: "Remove Background",
    path: "/img-remove-bg",
    color: "#D94F34",
    category: "image",
    pngIcon: "/assets/generated/tool-remove-bg-transparent.dim_64x64.png",
    svgIcon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <title>Remove Background</title>
        <rect
          x="2"
          y="3"
          width="16"
          height="13"
          rx="1.5"
          fill="none"
          stroke="#D94F34"
          strokeWidth="1.4"
        />
        <path
          d="M5 14l3-4 2.5 3 2-2.5 3.5 3.5"
          stroke="#D94F34"
          strokeWidth="1.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.6"
        />
      </svg>
    ),
  },
  {
    name: "Image Editor",
    path: "/img-editor",
    color: "#3B7AE2",
    category: "image",
    pngIcon: "/assets/generated/tool-image-editor-transparent.dim_64x64.png",
    svgIcon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <title>Image Editor</title>
        <rect
          x="2"
          y="3"
          width="16"
          height="12"
          rx="1.5"
          fill="#3B7AE2"
          opacity="0.15"
        />
        <rect
          x="2"
          y="3"
          width="16"
          height="12"
          rx="1.5"
          stroke="#3B7AE2"
          strokeWidth="1.4"
        />
        <circle cx="7" cy="7" r="2" fill="#3B7AE2" opacity="0.4" />
      </svg>
    ),
  },
  {
    name: "PNG to SVG",
    path: "/img-to-svg",
    color: "#7C3BE2",
    category: "image",
    pngIcon: "/assets/generated/tool-png-to-svg-transparent.dim_64x64.png",
    svgIcon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <title>PNG to SVG</title>
        <rect
          x="2"
          y="3"
          width="16"
          height="12"
          rx="1.5"
          fill="#7C3BE2"
          opacity="0.12"
        />
        <rect
          x="2"
          y="3"
          width="16"
          height="12"
          rx="1.5"
          stroke="#7C3BE2"
          strokeWidth="1.4"
        />
        <path
          d="M6 9c0 0 1-2 4-2s4 2 4 2"
          stroke="#7C3BE2"
          strokeWidth="1.3"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  // AI TOOLS
  {
    name: "PDF Summarizer",
    path: "/ai-summarize",
    color: "#7C3BE2",
    category: "ai",
    pngIcon: "/assets/generated/tool-ai-summarize-transparent.dim_64x64.png",
    svgIcon: (
      <svg width="20" height="20" viewBox="0 0 22 22" fill="none">
        <title>PDF Summarizer</title>
        <circle
          cx="11"
          cy="11"
          r="9"
          fill="#7C3BE2"
          opacity="0.15"
          stroke="#7C3BE2"
          strokeWidth="1.4"
        />
        <path
          d="M7 8h8M7 11h6M7 14h4"
          stroke="#7C3BE2"
          strokeWidth="1.4"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    name: "Ask PDF",
    path: "/ai-ask-pdf",
    color: "#2563EB",
    category: "ai",
    pngIcon: "/assets/generated/tool-ask-pdf-transparent.dim_64x64.png",
    svgIcon: (
      <svg width="20" height="20" viewBox="0 0 22 22" fill="none">
        <title>Ask PDF</title>
        <rect
          x="2"
          y="3"
          width="14"
          height="12"
          rx="2"
          fill="#2563EB"
          opacity="0.12"
          stroke="#2563EB"
          strokeWidth="1.4"
        />
        <path
          d="M2 15l3-2"
          stroke="#2563EB"
          strokeWidth="1.4"
          strokeLinecap="round"
        />
        <path
          d="M7 8h6M7 11h4"
          stroke="#2563EB"
          strokeWidth="1.2"
          strokeLinecap="round"
          opacity="0.6"
        />
      </svg>
    ),
  },
  {
    name: "Smart Translator",
    path: "/ai-smart-translate",
    color: "#0891B2",
    category: "ai",
    pngIcon: "/assets/generated/tool-smart-translate-transparent.dim_64x64.png",
    svgIcon: (
      <svg width="20" height="20" viewBox="0 0 22 22" fill="none">
        <title>Smart Translator</title>
        <circle
          cx="11"
          cy="11"
          r="9"
          fill="#0891B2"
          opacity="0.12"
          stroke="#0891B2"
          strokeWidth="1.4"
        />
        <path
          d="M2 11h18M11 2c-2 3-3.5 5.5-3.5 9s1.5 6 3.5 9"
          stroke="#0891B2"
          strokeWidth="1.2"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    name: "Entity Recognition",
    path: "/ai-extract-entities",
    color: "#059669",
    category: "ai",
    pngIcon:
      "/assets/generated/tool-entity-recognition-transparent.dim_64x64.png",
    svgIcon: (
      <svg width="20" height="20" viewBox="0 0 22 22" fill="none">
        <title>Entity Recognition</title>
        <rect
          x="3"
          y="3"
          width="7"
          height="7"
          rx="1.5"
          fill="#059669"
          opacity="0.2"
          stroke="#059669"
          strokeWidth="1.4"
        />
        <rect
          x="12"
          y="3"
          width="7"
          height="7"
          rx="1.5"
          fill="#059669"
          opacity="0.12"
          stroke="#059669"
          strokeWidth="1.3"
        />
        <rect
          x="3"
          y="12"
          width="7"
          height="7"
          rx="1.5"
          fill="#059669"
          opacity="0.12"
          stroke="#059669"
          strokeWidth="1.3"
        />
        <rect
          x="12"
          y="12"
          width="7"
          height="7"
          rx="1.5"
          fill="#059669"
          opacity="0.08"
          stroke="#059669"
          strokeWidth="1.2"
        />
      </svg>
    ),
  },
  {
    name: "Table Extractor",
    path: "/ai-table-extractor",
    color: "#D97706",
    category: "ai",
    pngIcon: "/assets/generated/tool-table-extractor-transparent.dim_64x64.png",
    svgIcon: (
      <svg width="20" height="20" viewBox="0 0 22 22" fill="none">
        <title>Table Extractor</title>
        <rect
          x="2"
          y="3"
          width="18"
          height="16"
          rx="2"
          fill="#D97706"
          opacity="0.1"
          stroke="#D97706"
          strokeWidth="1.4"
        />
        <path
          d="M2 8h18M2 13h18M8 8v11M14 8v11"
          stroke="#D97706"
          strokeWidth="1.1"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    name: "AI Annotate",
    path: "/ai-annotate",
    color: "#7C3AED",
    category: "ai",
    pngIcon: "/assets/generated/tool-ai-annotate-transparent.dim_64x64.png",
    svgIcon: (
      <svg width="20" height="20" viewBox="0 0 22 22" fill="none">
        <title>AI Annotate</title>
        <path
          d="M4 3h10l5 5v11a1 1 0 01-1 1H4a1 1 0 01-1-1V4a1 1 0 011-1z"
          fill="#7C3AED"
          opacity="0.12"
          stroke="#7C3AED"
          strokeWidth="1.4"
        />
        <path
          d="M13 10l-4.5 4.5L6.5 16l1.5-2L12.5 9l.5 1z"
          fill="#7C3AED"
          opacity="0.3"
          stroke="#7C3AED"
          strokeWidth="1.2"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    name: "AI Rewriter",
    path: "/ai-rewrite",
    color: "#E11D48",
    category: "ai",
    pngIcon: "/assets/generated/tool-ai-rewriter-transparent.dim_64x64.png",
    svgIcon: (
      <svg width="20" height="20" viewBox="0 0 22 22" fill="none">
        <title>AI Rewriter</title>
        <path
          d="M5 5c3-2 8-2 11 1s2 8-1 11"
          stroke="#E11D48"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <path
          d="M17 14v4M15 16h4"
          stroke="#E11D48"
          strokeWidth="1.4"
          strokeLinecap="round"
        />
        <path
          d="M4 8l-1 4 4-1"
          stroke="#E11D48"
          strokeWidth="1.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  // UTILITY
  {
    name: "Word Counter",
    path: "/word-counter",
    color: "#0EA5E9",
    category: "utility",
    svgIcon: (
      <svg width="20" height="20" viewBox="0 0 22 22" fill="none">
        <title>Word Counter</title>
        <rect
          x="2"
          y="3"
          width="18"
          height="16"
          rx="2"
          fill="#0EA5E9"
          opacity="0.1"
          stroke="#0EA5E9"
          strokeWidth="1.4"
        />
        <path
          d="M5 7h5M5 10h8M5 13h6M5 16h4"
          stroke="#0EA5E9"
          strokeWidth="1.2"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
];

// ─── Banner Slides ─────────────────────────────────────────────────────────────

const BANNER_SLIDES = [
  {
    id: "pdf",
    gradient: "linear-gradient(135deg, #0a0a0a 0%, #1a0800 50%, #FF6B00 150%)",
    title: "PDF Tools Platform",
    subtitle: "30+ PDF tools at your fingertips",
    accentColor: "#FF6B00",
    icon: (
      <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
        <title>PDF</title>
        <rect
          x="8"
          y="4"
          width="32"
          height="42"
          rx="3"
          fill="#FF6B00"
          opacity="0.18"
        />
        <rect
          x="8"
          y="4"
          width="32"
          height="42"
          rx="3"
          stroke="#FF6B00"
          strokeWidth="2"
        />
        <path
          d="M26 4v12h14"
          stroke="#FF6B00"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <text
          x="14"
          y="34"
          fontSize="10"
          fill="#FF6B00"
          fontWeight="bold"
          fontFamily="sans-serif"
        >
          PDF
        </text>
        <circle
          cx="46"
          cy="46"
          r="12"
          fill="#FF6B00"
          opacity="0.2"
          stroke="#FF6B00"
          strokeWidth="1.5"
        />
        <path
          d="M42 46h8M46 42v8"
          stroke="#FF6B00"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    id: "image",
    gradient: "linear-gradient(135deg, #0a0a0a 0%, #0d0824 50%, #8B5CF6 150%)",
    title: "Image Tools Suite",
    subtitle: "Compress, resize, edit & convert",
    accentColor: "#8B5CF6",
    icon: (
      <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
        <title>Image</title>
        <rect
          x="6"
          y="12"
          width="52"
          height="38"
          rx="4"
          fill="#8B5CF6"
          opacity="0.15"
          stroke="#8B5CF6"
          strokeWidth="2"
        />
        <circle
          cx="20"
          cy="26"
          r="6"
          fill="#8B5CF6"
          opacity="0.4"
          stroke="#8B5CF6"
          strokeWidth="1.5"
        />
        <path
          d="M6 38l14-10 10 8 10-14 18 16"
          stroke="#8B5CF6"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    id: "ai",
    gradient: "linear-gradient(135deg, #0a0a0a 0%, #041318 50%, #06B6D4 150%)",
    title: "AI-Powered Tools",
    subtitle: "Summarize, translate & analyze",
    accentColor: "#06B6D4",
    icon: (
      <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
        <title>AI</title>
        <circle
          cx="32"
          cy="32"
          r="22"
          fill="#06B6D4"
          opacity="0.1"
          stroke="#06B6D4"
          strokeWidth="2"
        />
        <path
          d="M22 32h20M32 18v28"
          stroke="#06B6D4"
          strokeWidth="2"
          strokeLinecap="round"
          opacity="0.5"
        />
        <path
          d="M24 20l16 24M40 20L24 44"
          stroke="#06B6D4"
          strokeWidth="1.5"
          strokeLinecap="round"
          opacity="0.4"
        />
        <circle
          cx="32"
          cy="32"
          r="6"
          fill="#06B6D4"
          opacity="0.3"
          stroke="#06B6D4"
          strokeWidth="1.5"
        />
        <path d="M46 18l2-4 2 4-4-2z" fill="#06B6D4" />
        <path d="M16 44l1.5-3 1.5 3-3-1.5z" fill="#06B6D4" opacity="0.7" />
      </svg>
    ),
  },
];

// ─── Quick Action Pills ────────────────────────────────────────────────────────

const QUICK_ACTIONS = [
  { label: "Merge PDF", path: "/merge", color: "#E25C3B" },
  { label: "Compress", path: "/compress", color: "#FF6B00" },
  { label: "JPG→PDF", path: "/jpg-to-pdf", color: "#3BE28A" },
  { label: "Compress Img", path: "/img-compress", color: "#3B7AE2" },
  { label: "Protect PDF", path: "/protect", color: "#2DBD6E" },
  { label: "Adv. Edit", path: "/edit-advanced", color: "#6366f1" },
];

// ─── Component ────────────────────────────────────────────────────────────────

export function MobileHome() {
  const { theme, accentColor } = useMobileTheme();
  const isDark = theme === "dark";

  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [bannerSlide, setBannerSlide] = useState(0);
  const bannerTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Auto-advance banner
  useEffect(() => {
    bannerTimerRef.current = setInterval(() => {
      setBannerSlide((prev) => (prev + 1) % BANNER_SLIDES.length);
    }, 3500);
    return () => {
      if (bannerTimerRef.current) clearInterval(bannerTimerRef.current);
    };
  }, []);

  // Listen for search changes from the mobile header
  useEffect(() => {
    function handleSearchChange() {
      const query =
        (window as Window & { __mobileSearchQuery?: string })
          .__mobileSearchQuery ?? "";
      setSearchQuery(query);
    }
    window.addEventListener("mobileSearchChange", handleSearchChange);
    return () =>
      window.removeEventListener("mobileSearchChange", handleSearchChange);
  }, []);

  const filteredTools = useMemo(() => {
    return ALL_MOBILE_TOOLS.filter((tool) => {
      const matchesSearch =
        searchQuery.trim() === "" ||
        tool.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory =
        activeCategory === "all" || tool.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, activeCategory]);

  const activeCat = MOBILE_CATEGORIES.find((c) => c.id === activeCategory);
  const sectionLabel = activeCat?.label ?? "All Tools";

  // Theme-aware colors
  const pageBg = isDark ? "#0a0a0a" : "#f0f0f0";
  const cardBg = isDark ? "#111111" : "#ffffff";
  const cardBorder = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)";
  const textPrimary = isDark ? "#ffffff" : "#111111";
  const textSecondary = isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.5)";
  const chipInactive = isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)";
  const chipInactiveText = isDark
    ? "rgba(200,195,230,0.75)"
    : "rgba(60,60,80,0.75)";

  return (
    <div
      className="md:hidden"
      style={{
        background: pageBg,
        minHeight: "100svh",
        paddingBottom: "96px",
        transition: "background 0.3s",
      }}
    >
      {/* ── Banner Carousel ────────────────────────────────────────────────── */}
      <div className="px-4 pt-3 pb-2">
        <div
          className="relative overflow-hidden rounded-2xl"
          style={{ height: "180px" }}
        >
          {/* Slides */}
          <div
            className="flex h-full transition-transform duration-500 ease-out"
            style={{ transform: `translateX(-${bannerSlide * 100}%)` }}
          >
            {BANNER_SLIDES.map((slide) => (
              <div
                key={slide.id}
                className="flex-shrink-0 w-full h-full relative flex items-center justify-between px-5"
                style={{
                  background: isDark
                    ? slide.gradient
                    : slide.gradient.replace("#0a0a0a", "#1a1a1a"),
                }}
              >
                {/* Glow overlay */}
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background: `radial-gradient(ellipse at 80% 50%, ${slide.accentColor}30 0%, transparent 65%)`,
                  }}
                />
                <div className="relative z-10 flex-1">
                  <div
                    className="text-xs font-bold uppercase tracking-widest mb-1"
                    style={{ color: slide.accentColor }}
                  >
                    PDF Tools
                  </div>
                  <h2
                    className="text-xl font-bold leading-tight mb-1"
                    style={{ color: "#ffffff" }}
                  >
                    {slide.title}
                  </h2>
                  <p
                    className="text-sm"
                    style={{ color: "rgba(255,255,255,0.65)" }}
                  >
                    {slide.subtitle}
                  </p>
                  {/* Orange accent line */}
                  <div
                    className="mt-3 h-0.5 w-12 rounded-full"
                    style={{ background: slide.accentColor }}
                  />
                </div>
                <div className="relative z-10 opacity-80 flex-shrink-0">
                  {slide.icon}
                </div>
              </div>
            ))}
          </div>

          {/* Dot indicators */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-20">
            {BANNER_SLIDES.map((slide, idx) => (
              <button
                key={slide.id}
                type="button"
                onClick={() => setBannerSlide(idx)}
                aria-label={`Go to slide ${idx + 1}`}
                className="transition-all duration-300"
                style={{
                  width: bannerSlide === idx ? "20px" : "6px",
                  height: "6px",
                  borderRadius: "3px",
                  background:
                    bannerSlide === idx
                      ? slide.accentColor
                      : "rgba(255,255,255,0.35)",
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* ── Welcome Stats Card ─────────────────────────────────────────────── */}
      <div className="px-4 pb-3">
        <div
          className="flex items-center justify-between px-4 py-3 rounded-2xl"
          style={{
            background: isDark ? "rgba(255,255,255,0.04)" : cardBg,
            border: `1px solid ${cardBorder}`,
            boxShadow: isDark ? "none" : "0 1px 8px rgba(0,0,0,0.06)",
          }}
        >
          <div>
            <p className="text-sm font-bold" style={{ color: textPrimary }}>
              Welcome to PDF Tools
            </p>
            <p className="text-xs mt-0.5" style={{ color: textSecondary }}>
              Your complete document toolkit
            </p>
          </div>
          <div
            className="px-3 py-1 rounded-full text-xs font-bold"
            style={{
              background: `${accentColor}22`,
              color: accentColor,
              border: `1px solid ${accentColor}40`,
            }}
          >
            60+ Tools
          </div>
        </div>
      </div>

      {/* ── Quick Actions ──────────────────────────────────────────────────── */}
      <div
        className="flex gap-2 px-4 pb-3 overflow-x-auto"
        style={{ WebkitOverflowScrolling: "touch", scrollbarWidth: "none" }}
      >
        {QUICK_ACTIONS.map((action) => (
          <Link
            key={action.path}
            to={action.path}
            className="flex items-center gap-1.5 flex-shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold transition-all duration-150 active:scale-95"
            style={{
              background: isDark ? `${action.color}18` : `${action.color}12`,
              color: action.color,
              border: `1px solid ${action.color}35`,
              whiteSpace: "nowrap",
            }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full flex-shrink-0"
              style={{ background: action.color }}
            />
            {action.label}
          </Link>
        ))}
      </div>

      {/* ── Category Carousel ─────────────────────────────────────────────── */}
      <div
        className="flex gap-2 px-4 pb-3 overflow-x-auto"
        style={{ WebkitOverflowScrolling: "touch", scrollbarWidth: "none" }}
      >
        {MOBILE_CATEGORIES.map((cat) => {
          const isActive = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => setActiveCategory(cat.id)}
              className="flex items-center gap-1.5 flex-shrink-0 rounded-full px-3.5 py-2 text-sm font-semibold transition-all duration-150 active:scale-95"
              style={
                isActive
                  ? {
                      background: `linear-gradient(135deg, ${cat.color}cc, ${cat.color}99)`,
                      color: "#fff",
                      boxShadow: `0 0 16px ${cat.color}55, 0 2px 8px rgba(0,0,0,0.4)`,
                      border: `1px solid ${cat.color}80`,
                      minHeight: "36px",
                    }
                  : {
                      background: chipInactive,
                      color: chipInactiveText,
                      border: `1px solid ${cardBorder}`,
                      minHeight: "36px",
                    }
              }
              data-ocid="mobile.tab"
            >
              <span
                style={
                  isActive
                    ? { color: "#fff" }
                    : { color: cat.color, opacity: 0.8 }
                }
              >
                {cat.icon}
              </span>
              <span className="whitespace-nowrap">{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* ── Section Header ────────────────────────────────────────────────── */}
      <div className="px-4 pt-1 pb-2 flex items-center gap-2">
        <span
          className="w-1 h-4 rounded-full inline-block flex-shrink-0"
          style={{
            background: activeCat?.color ?? accentColor,
            boxShadow: `0 0 8px ${activeCat?.color ?? accentColor}80`,
          }}
        />
        <span
          className="text-sm font-semibold tracking-wide"
          style={{ color: textSecondary }}
        >
          {sectionLabel}
          <span className="ml-1.5 opacity-50 text-xs">
            ({filteredTools.length})
          </span>
        </span>
      </div>

      {/* ── Tools Grid ────────────────────────────────────────────────────── */}
      {filteredTools.length === 0 ? (
        <div
          data-ocid="mobile.empty_state"
          className="flex flex-col items-center justify-center py-16 px-8"
        >
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
            style={{
              background: isDark
                ? "rgba(255,255,255,0.06)"
                : "rgba(0,0,0,0.04)",
              border: `1px solid ${cardBorder}`,
            }}
          >
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
              <title>No results</title>
              <circle
                cx="12"
                cy="12"
                r="9"
                stroke={textSecondary}
                strokeWidth="1.8"
              />
              <path
                d="M19 19l4.5 4.5"
                stroke={textSecondary}
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            </svg>
          </div>
          <p
            className="text-base font-semibold"
            style={{ color: textSecondary }}
          >
            No tools found
          </p>
          <p
            className="text-sm mt-1"
            style={{ color: textSecondary, opacity: 0.6 }}
          >
            Try a different search or category
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 px-4 pb-4">
          {filteredTools.map((tool, idx) => (
            <MobileToolCard
              key={tool.path}
              tool={tool}
              index={idx}
              isDark={isDark}
              accentColor={accentColor}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Individual Tool Card ─────────────────────────────────────────────────────

function MobileToolCard({
  tool,
  index,
  isDark,
  accentColor: _accent,
}: { tool: MobileTool; index: number; isDark: boolean; accentColor: string }) {
  const cardBg = isDark
    ? "linear-gradient(145deg, rgba(18,12,36,0.97) 0%, rgba(12,8,24,0.99) 100%)"
    : "linear-gradient(145deg, #ffffff 0%, #fafafa 100%)";
  const textColor = isDark ? "rgba(225,220,245,0.9)" : "#111111";

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: Math.min(index * 0.02, 0.35) }}
      whileTap={{ scale: 0.94 }}
    >
      <Link
        to={tool.path}
        data-ocid={`mobile.item.${index + 1}`}
        className="block relative overflow-hidden rounded-2xl"
        style={{
          background: cardBg,
          border: `1px solid ${tool.color}${isDark ? "28" : "20"}`,
          boxShadow: isDark
            ? `0 2px 20px ${tool.color}14`
            : `0 2px 12px rgba(0,0,0,0.06), 0 1px 4px ${tool.color}15`,
          minHeight: "100px",
        }}
      >
        {/* Glow blob — only in dark mode */}
        {isDark && (
          <div
            className="absolute top-0 left-1/2 -translate-x-1/2 w-20 h-10 rounded-full blur-xl pointer-events-none"
            style={{ background: tool.color, opacity: 0.18 }}
          />
        )}

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center justify-center gap-2 py-4 px-3">
          {/* Icon container — bigger in 2-col */}
          <div
            className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{
              background: isDark
                ? `linear-gradient(135deg, ${tool.color}30, ${tool.color}16)`
                : `${tool.color}12`,
              border: `1px solid ${tool.color}${isDark ? "35" : "25"}`,
              boxShadow: isDark ? `0 4px 16px ${tool.color}30` : "none",
            }}
          >
            {/* PNG realistic icon or fallback SVG */}
            {tool.pngIcon ? (
              <img
                src={tool.pngIcon}
                alt={tool.name}
                className="w-10 h-10 object-contain"
                style={{ filter: "drop-shadow(0 2px 6px rgba(0,0,0,0.25))" }}
              />
            ) : (
              <span style={{ transform: "scale(1.3)", display: "inline-flex" }}>
                {tool.svgIcon}
              </span>
            )}
          </div>

          {/* Tool name */}
          <p
            className="text-sm font-semibold text-center leading-tight line-clamp-2 px-0.5"
            style={{ color: textColor }}
          >
            {tool.name}
          </p>

          {/* Coming soon badge */}
          {tool.comingSoon && (
            <span
              className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full"
              style={{
                background: isDark
                  ? "rgba(255,255,255,0.08)"
                  : "rgba(0,0,0,0.06)",
                color: isDark ? "rgba(200,195,230,0.5)" : "rgba(80,80,100,0.5)",
              }}
            >
              Soon
            </span>
          )}
        </div>

        {/* Bottom accent line */}
        <div
          className="absolute inset-x-0 bottom-0 h-[2px] pointer-events-none"
          style={{
            background: `linear-gradient(90deg, transparent, ${tool.color}, transparent)`,
            opacity: isDark ? 0.6 : 0.4,
          }}
        />
      </Link>
    </motion.div>
  );
}
