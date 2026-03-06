import { useMobileTheme } from "@/contexts/MobileThemeContext";
import { useRouter } from "@tanstack/react-router";
import { ChevronDown, ChevronRight, Search, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useMemo, useRef, useState } from "react";

interface SidebarTool {
  name: string;
  path: string;
  svgIcon: React.ReactNode;
  color: string;
  bgColor: string;
  comingSoon?: boolean;
}

interface SidebarCategory {
  label: string;
  tools: SidebarTool[];
}

// ─── PDF tool data (mirrors Home.tsx CATEGORIES) ───────────────────────────

const PDF_CATEGORIES: SidebarCategory[] = [
  {
    label: "Organize PDF",
    tools: [
      {
        name: "Merge PDF",
        path: "/merge",
        svgIcon: (
          <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
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
        color: "#E25C3B",
        bgColor: "#FFF0EC",
      },
      {
        name: "Split PDF",
        path: "/split",
        svgIcon: (
          <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
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
        color: "#D64E4E",
        bgColor: "#FFF0F0",
      },
      {
        name: "Remove Pages",
        path: "/remove-pages",
        svgIcon: (
          <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
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
        color: "#E25C3B",
        bgColor: "#FFF0EC",
      },
      {
        name: "Extract Pages",
        path: "/extract-pages",
        svgIcon: (
          <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
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
        color: "#E2823B",
        bgColor: "#FFF8EC",
        comingSoon: true,
      },
      {
        name: "Organize PDF",
        path: "/organize",
        svgIcon: (
          <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
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
        color: "#3B8CE2",
        bgColor: "#EBF3FF",
      },
      {
        name: "OCR PDF",
        path: "/ocr",
        svgIcon: (
          <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
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
        color: "#3B8CE2",
        bgColor: "#EBF3FF",
        comingSoon: true,
      },
      {
        name: "Scan to PDF",
        path: "/scan-to-pdf",
        svgIcon: (
          <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
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
        color: "#2DBD6E",
        bgColor: "#EBFFF4",
        comingSoon: true,
      },
    ],
  },
  {
    label: "Convert to PDF",
    tools: [
      {
        name: "JPG to PDF",
        path: "/jpg-to-pdf",
        svgIcon: (
          <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
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
        color: "#3BE28A",
        bgColor: "#EBFFF4",
      },
      {
        name: "Word to PDF",
        path: "/word-to-pdf",
        svgIcon: (
          <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
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
        color: "#2B5CE2",
        bgColor: "#EBF0FF",
        comingSoon: true,
      },
      {
        name: "PowerPoint to PDF",
        path: "/pptx-to-pdf",
        svgIcon: (
          <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
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
          </svg>
        ),
        color: "#D94F34",
        bgColor: "#FFF0EC",
        comingSoon: true,
      },
      {
        name: "Excel to PDF",
        path: "/excel-to-pdf",
        svgIcon: (
          <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
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
        color: "#1D6F42",
        bgColor: "#EBFFF4",
        comingSoon: true,
      },
      {
        name: "HTML to PDF",
        path: "/html-to-pdf",
        svgIcon: (
          <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
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
        color: "#E27A3B",
        bgColor: "#FFF5EC",
        comingSoon: true,
      },
    ],
  },
  {
    label: "Convert from PDF",
    tools: [
      {
        name: "PDF to JPG",
        path: "/pdf-to-jpg",
        svgIcon: (
          <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
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
        color: "#3B7AE2",
        bgColor: "#EBF2FF",
      },
      {
        name: "PDF to Word",
        path: "/pdf-to-word",
        svgIcon: (
          <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
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
          </svg>
        ),
        color: "#2B5CE2",
        bgColor: "#EBF0FF",
        comingSoon: true,
      },
      {
        name: "PDF to PowerPoint",
        path: "/pdf-to-pptx",
        svgIcon: (
          <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
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
          </svg>
        ),
        color: "#D94F34",
        bgColor: "#FFF0EC",
        comingSoon: true,
      },
      {
        name: "PDF to Excel",
        path: "/pdf-to-excel",
        svgIcon: (
          <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
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
          </svg>
        ),
        color: "#1D6F42",
        bgColor: "#EBFFF4",
        comingSoon: true,
      },
      {
        name: "PDF to PDF/A",
        path: "/pdf-to-pdfa",
        svgIcon: (
          <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
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
          </svg>
        ),
        color: "#6B3BE2",
        bgColor: "#F5EBFF",
        comingSoon: true,
      },
    ],
  },
  {
    label: "Edit PDF",
    tools: [
      {
        name: "Edit PDF",
        path: "/edit",
        svgIcon: (
          <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
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
        color: "#3B8CE2",
        bgColor: "#EBF3FF",
      },
      {
        name: "Rotate PDF",
        path: "/rotate",
        svgIcon: (
          <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
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
        color: "#3B8CE2",
        bgColor: "#EBF3FF",
      },
      {
        name: "Add Page Numbers",
        path: "/page-numbers",
        svgIcon: (
          <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
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
          </svg>
        ),
        color: "#E2823B",
        bgColor: "#FFF8EC",
      },
      {
        name: "Watermark",
        path: "/watermark",
        svgIcon: (
          <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
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
          </svg>
        ),
        color: "#9B3BE2",
        bgColor: "#F5EBFF",
      },
      {
        name: "Crop PDF",
        path: "/crop",
        svgIcon: (
          <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
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
          </svg>
        ),
        color: "#9B3BE2",
        bgColor: "#F5EBFF",
      },
      {
        name: "Compress PDF",
        path: "/compress",
        svgIcon: (
          <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
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
        color: "#E25C3B",
        bgColor: "#FFF0EC",
      },
      {
        name: "Optimize PDF",
        path: "/optimize",
        svgIcon: (
          <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
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
        color: "#2DBD6E",
        bgColor: "#EBFFF4",
      },
      {
        name: "Repair PDF",
        path: "/repair",
        svgIcon: (
          <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
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
        color: "#E27A3B",
        bgColor: "#FFF5EC",
      },
    ],
  },
  {
    label: "PDF Security",
    tools: [
      {
        name: "Protect PDF",
        path: "/protect",
        svgIcon: (
          <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
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
        color: "#2DBD6E",
        bgColor: "#EBFFF4",
      },
      {
        name: "Unlock PDF",
        path: "/unlock",
        svgIcon: (
          <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
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
        color: "#E2C43B",
        bgColor: "#FFFBEB",
      },
      {
        name: "Sign PDF",
        path: "/sign",
        svgIcon: (
          <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
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
        color: "#2DBD6E",
        bgColor: "#EBFFF4",
      },
      {
        name: "Redact PDF",
        path: "/redact",
        svgIcon: (
          <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
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
            <rect
              x="5"
              y="9.5"
              width="10"
              height="2.5"
              rx="0.4"
              fill="#E23B3B"
            />
          </svg>
        ),
        color: "#E23B3B",
        bgColor: "#FFF0F0",
        comingSoon: true,
      },
      {
        name: "Compare PDF",
        path: "/compare",
        svgIcon: (
          <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
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
        color: "#3B7AE2",
        bgColor: "#EBF2FF",
        comingSoon: true,
      },
    ],
  },
  {
    label: "PDF Intelligence",
    tools: [
      {
        name: "Translate PDF",
        path: "/translate",
        svgIcon: (
          <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
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
        color: "#7C3BE2",
        bgColor: "#F5EBFF",
        comingSoon: true,
      },
    ],
  },
];

const IMAGE_CATEGORY: SidebarCategory = {
  label: "Image Tools",
  tools: [
    {
      name: "Compress Image",
      path: "/img-compress",
      svgIcon: (
        <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
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
      color: "#E25C3B",
      bgColor: "#FFF0EC",
    },
    {
      name: "Resize Image",
      path: "/img-resize",
      svgIcon: (
        <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
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
      color: "#3B8CE2",
      bgColor: "#EBF3FF",
    },
    {
      name: "Crop Image",
      path: "/img-crop",
      svgIcon: (
        <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
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
      color: "#2DBD6E",
      bgColor: "#EBFFF4",
    },
    {
      name: "Convert Image",
      path: "/img-convert",
      svgIcon: (
        <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
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
      color: "#9B3BE2",
      bgColor: "#F5EBFF",
    },
    {
      name: "Rotate & Flip",
      path: "/img-rotate",
      svgIcon: (
        <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
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
      color: "#3BE2D4",
      bgColor: "#EBFDF9",
    },
    {
      name: "Watermark Image",
      path: "/img-watermark",
      svgIcon: (
        <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
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
        </svg>
      ),
      color: "#7C3BE2",
      bgColor: "#F0EBFF",
    },
    {
      name: "Image to PDF",
      path: "/img-to-pdf",
      svgIcon: (
        <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
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
      color: "#E23B3B",
      bgColor: "#FFF0F0",
    },
    {
      name: "Remove Background",
      path: "/img-remove-bg",
      svgIcon: (
        <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
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
        </svg>
      ),
      color: "#D94F34",
      bgColor: "#FFF0EC",
    },
    {
      name: "Image Editor",
      path: "/img-editor",
      svgIcon: (
        <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
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
      color: "#3B7AE2",
      bgColor: "#EBF2FF",
    },
    {
      name: "PNG/JPG to SVG",
      path: "/img-to-svg",
      svgIcon: (
        <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
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
      color: "#7C3BE2",
      bgColor: "#F5EBFF",
    },
  ],
};

const AI_CATEGORY: SidebarCategory = {
  label: "AI Tools",
  tools: [
    {
      name: "PDF Summarizer",
      path: "/ai-summarize",
      svgIcon: (
        <svg width="18" height="18" viewBox="0 0 22 22" fill="none">
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
      color: "#7C3BE2",
      bgColor: "#F3EEFF",
    },
    {
      name: "Ask PDF",
      path: "/ai-ask-pdf",
      svgIcon: (
        <svg width="18" height="18" viewBox="0 0 22 22" fill="none">
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
      color: "#2563EB",
      bgColor: "#EFF6FF",
    },
    {
      name: "Smart Translator",
      path: "/ai-smart-translate",
      svgIcon: (
        <svg width="18" height="18" viewBox="0 0 22 22" fill="none">
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
      color: "#0891B2",
      bgColor: "#ECFEFF",
    },
    {
      name: "Entity Recognition",
      path: "/ai-extract-entities",
      svgIcon: (
        <svg width="18" height="18" viewBox="0 0 22 22" fill="none">
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
      color: "#059669",
      bgColor: "#ECFDF5",
    },
    {
      name: "Table Extractor",
      path: "/ai-table-extractor",
      svgIcon: (
        <svg width="18" height="18" viewBox="0 0 22 22" fill="none">
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
      color: "#D97706",
      bgColor: "#FFFBEB",
    },
    {
      name: "AI Annotate",
      path: "/ai-annotate",
      svgIcon: (
        <svg width="18" height="18" viewBox="0 0 22 22" fill="none">
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
      color: "#7C3AED",
      bgColor: "#F5F3FF",
    },
    {
      name: "AI Rewriter",
      path: "/ai-rewrite",
      svgIcon: (
        <svg width="18" height="18" viewBox="0 0 22 22" fill="none">
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
      color: "#E11D48",
      bgColor: "#FFF1F2",
    },
  ],
};

const CONVERSION_CATEGORY: SidebarCategory = {
  label: "Document Conversion",
  tools: [
    {
      name: "PDF to HTML",
      path: "/pdf-to-html",
      svgIcon: (
        <svg width="18" height="18" viewBox="0 0 22 22" fill="none">
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
      color: "#F59E0B",
      bgColor: "#FFFBEB",
    },
    {
      name: "PDF to Markdown",
      path: "/pdf-to-markdown",
      svgIcon: (
        <svg width="18" height="18" viewBox="0 0 22 22" fill="none">
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
            x="13"
            y="15"
            fontSize="8"
            fill="#6366F1"
            fontWeight="bold"
            fontFamily="monospace"
          >
            MD
          </text>
        </svg>
      ),
      color: "#6366F1",
      bgColor: "#EEF2FF",
    },
    {
      name: "Markdown to PDF",
      path: "/markdown-to-pdf",
      svgIcon: (
        <svg width="18" height="18" viewBox="0 0 22 22" fill="none">
          <title>Markdown to PDF</title>
          <text
            x="2"
            y="13"
            fontSize="7"
            fill="#10B981"
            fontWeight="bold"
            fontFamily="monospace"
          >
            MD
          </text>
          <path
            d="M12 5v10M9 12l3 3 3-3"
            stroke="#10B981"
            strokeWidth="1.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ),
      color: "#10B981",
      bgColor: "#ECFDF5",
    },
    {
      name: "PDF to RTF",
      path: "/pdf-to-rtf",
      svgIcon: (
        <svg width="18" height="18" viewBox="0 0 22 22" fill="none">
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
            x="13"
            y="15"
            fontSize="6"
            fill="#8B5CF6"
            fontWeight="bold"
            fontFamily="monospace"
          >
            RTF
          </text>
        </svg>
      ),
      color: "#8B5CF6",
      bgColor: "#F5F3FF",
    },
    {
      name: "RTF to PDF",
      path: "/rtf-to-pdf",
      svgIcon: (
        <svg width="18" height="18" viewBox="0 0 22 22" fill="none">
          <title>RTF to PDF</title>
          <text
            x="1"
            y="13"
            fontSize="6"
            fill="#EC4899"
            fontWeight="bold"
            fontFamily="monospace"
          >
            RTF
          </text>
          <path
            d="M12 5v10M9 12l3 3 3-3"
            stroke="#EC4899"
            strokeWidth="1.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ),
      color: "#EC4899",
      bgColor: "#FDF2F8",
    },
  ],
};

const UTILITY_CATEGORY: SidebarCategory = {
  label: "Utility Tools",
  tools: [
    {
      name: "Word Counter",
      path: "/word-counter",
      svgIcon: (
        <svg width="18" height="18" viewBox="0 0 22 22" fill="none">
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
      color: "#0EA5E9",
      bgColor: "#F0F9FF",
    },
  ],
};

const ALL_CATEGORIES: SidebarCategory[] = [
  ...PDF_CATEGORIES,
  IMAGE_CATEGORY,
  AI_CATEGORY,
  CONVERSION_CATEGORY,
  UTILITY_CATEGORY,
];

// ─── Component ────────────────────────────────────────────────────────────────

interface MobileSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MobileSidebar({ isOpen, onClose }: MobileSidebarProps) {
  const [search, setSearch] = useState("");
  const [openCategories, setOpenCategories] = useState<Set<string>>(
    new Set(["Organize PDF"]),
  );
  const searchRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const { theme, accentColor } = useMobileTheme();
  const isDark = theme === "dark";

  // Focus search when opens
  useEffect(() => {
    if (isOpen && searchRef.current) {
      setTimeout(() => searchRef.current?.focus(), 200);
    }
  }, [isOpen]);

  // Reset search when closed
  useEffect(() => {
    if (!isOpen) setSearch("");
  }, [isOpen]);

  // Prevent body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const filteredCategories = useMemo(() => {
    if (!search.trim()) return ALL_CATEGORIES;
    const q = search.toLowerCase();
    return ALL_CATEGORIES.map((cat) => ({
      ...cat,
      tools: cat.tools.filter((t) => t.name.toLowerCase().includes(q)),
    })).filter((cat) => cat.tools.length > 0);
  }, [search]);

  function toggleCategory(label: string) {
    setOpenCategories((prev) => {
      const next = new Set(prev);
      if (next.has(label)) next.delete(label);
      else next.add(label);
      return next;
    });
  }

  function handleNavigate(path: string) {
    onClose();
    router.navigate({ to: path });
  }

  // Theme-aware styles
  const drawerBg = isDark
    ? "linear-gradient(180deg, rgba(12,9,28,0.98) 0%, rgba(9,6,20,0.99) 100%)"
    : "#ffffff";
  const drawerBorder = isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.08)";
  const headerBg = isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)";
  const headerBorder = isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.07)";
  const inputBg = isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)";
  const inputBorder = isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)";
  const inputColor = isDark ? "white" : "#111111";
  const catTextColor = isDark ? "rgba(100,116,139,0.7)" : "rgba(80,80,100,0.6)";
  const toolTextColor = isDark ? "rgba(220,215,240,0.9)" : "#222222";
  const closeBtnBg = isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)";
  const closeBtnColor = isDark
    ? "rgba(148,163,184,0.8)"
    : "rgba(80,80,100,0.7)";

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            className="md:hidden fixed inset-0 z-50"
            style={{
              background: "rgba(0,0,0,0.65)",
              backdropFilter: "blur(4px)",
            }}
            onClick={onClose}
          />

          {/* Drawer */}
          <motion.div
            key="drawer"
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="md:hidden fixed inset-y-0 left-0 z-50 w-[85vw] max-w-[320px] flex flex-col"
            style={{
              background: drawerBg,
              borderRight: `1px solid ${drawerBorder}`,
              boxShadow: "4px 0 40px rgba(0,0,0,0.6)",
            }}
          >
            {/* Header with search */}
            <div
              className="flex items-center gap-3 px-4 pt-4 pb-3"
              style={{
                background: headerBg,
                borderBottom: `1px solid ${headerBorder}`,
              }}
            >
              <div className="flex-1">
                <div className="relative">
                  <Search
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
                    style={{ color: catTextColor }}
                  />
                  <input
                    ref={searchRef}
                    type="search"
                    placeholder="Search tools…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-sm rounded-xl outline-none transition-all"
                    style={{
                      background: inputBg,
                      border: `1px solid ${inputBorder}`,
                      color: inputColor,
                    }}
                    data-ocid="sidebar.search_input"
                  />
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="w-8 h-8 flex items-center justify-center rounded-xl flex-shrink-0 transition-colors active:scale-90"
                style={{
                  background: closeBtnBg,
                  color: closeBtnColor,
                }}
                aria-label="Close tools menu"
                data-ocid="sidebar.close_button"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Tool list */}
            <div className="flex-1 overflow-y-auto py-2 overscroll-contain">
              {filteredCategories.map((category) => {
                const isOpen_ = search.trim()
                  ? true
                  : openCategories.has(category.label);

                // Get the first tool color for accent line
                const catAccentColor = category.tools[0]?.color ?? accentColor;

                return (
                  <div key={category.label} className="mb-1">
                    {/* Category header with colored left accent */}
                    <button
                      type="button"
                      onClick={() => toggleCategory(category.label)}
                      className="w-full flex items-center justify-between px-4 py-2.5 text-left transition-colors"
                      style={{
                        borderLeft: `2px solid ${catAccentColor}60`,
                      }}
                    >
                      <span
                        className="font-ui font-semibold text-[10px] uppercase tracking-widest"
                        style={{ color: catTextColor }}
                      >
                        {category.label}
                      </span>
                      {!search.trim() && (
                        <span style={{ color: catTextColor }}>
                          {isOpen_ ? (
                            <ChevronDown className="w-3.5 h-3.5" />
                          ) : (
                            <ChevronRight className="w-3.5 h-3.5" />
                          )}
                        </span>
                      )}
                    </button>

                    {/* Tools */}
                    <AnimatePresence initial={false}>
                      {isOpen_ && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.18 }}
                          className="overflow-hidden"
                        >
                          {category.tools.map((tool) => (
                            <button
                              key={tool.path}
                              type="button"
                              onClick={() => handleNavigate(tool.path)}
                              className="w-full flex items-center gap-3 px-4 py-2.5 transition-colors active:scale-[0.98]"
                              style={{
                                borderLeft: "2px solid transparent",
                              }}
                              onMouseEnter={(e) => {
                                (
                                  e.currentTarget as HTMLButtonElement
                                ).style.background = isDark
                                  ? "rgba(255,255,255,0.05)"
                                  : "rgba(0,0,0,0.04)";
                                (
                                  e.currentTarget as HTMLButtonElement
                                ).style.borderLeft =
                                  `2px solid ${tool.color}40`;
                              }}
                              onMouseLeave={(e) => {
                                (
                                  e.currentTarget as HTMLButtonElement
                                ).style.background = "transparent";
                                (
                                  e.currentTarget as HTMLButtonElement
                                ).style.borderLeft = "2px solid transparent";
                              }}
                            >
                              {/* Icon with tint bg */}
                              <div
                                className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                                style={{
                                  background: `${tool.color}${isDark ? "22" : "15"}`,
                                  border: `1px solid ${tool.color}20`,
                                }}
                              >
                                {tool.svgIcon}
                              </div>
                              <span
                                className="flex-1 text-left text-sm font-ui truncate"
                                style={{ color: toolTextColor }}
                              >
                                {tool.name}
                              </span>
                              {tool.comingSoon && (
                                <span
                                  className="text-[9px] font-ui font-semibold px-1.5 py-0.5 rounded-full flex-shrink-0"
                                  style={{
                                    background: `${tool.color}18`,
                                    color: tool.color,
                                    border: `1px solid ${tool.color}25`,
                                  }}
                                >
                                  Plus
                                </span>
                              )}
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}

              {filteredCategories.length === 0 && (
                <div
                  className="px-4 py-8 text-center text-sm font-ui"
                  style={{ color: catTextColor }}
                >
                  No tools found for &ldquo;{search}&rdquo;
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
