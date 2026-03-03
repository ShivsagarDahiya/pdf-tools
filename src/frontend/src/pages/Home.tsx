import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAdminSettings } from "@/contexts/AdminSettingsContext";
import { useActor } from "@/hooks/useActor";
import { useToolUsage } from "@/hooks/useQueries";
import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Crown,
  Download,
  ExternalLink,
  FileText,
  Image,
  Megaphone,
  Settings2,
  ShoppingBag,
  Sparkles,
  Star,
  Wand2,
} from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";

interface Tool {
  name: string;
  path: string;
  description: string;
  svgIcon: React.ReactNode;
  color: string;
  bgColor: string;
  comingSoon?: boolean;
}

interface Category {
  label: string;
  tools: Tool[];
}

const CATEGORIES: Category[] = [
  {
    label: "Organize PDF",
    tools: [
      {
        name: "Merge PDF",
        path: "/merge",
        description: "Combine multiple PDFs into one document",
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
        color: "#E25C3B",
        bgColor: "#FFF0EC",
      },
      {
        name: "Split PDF",
        path: "/split",
        description: "Extract pages or split into multiple files",
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
            <path
              d="M7.5 10.5L5.5 14M12.5 10.5L14.5 14"
              stroke="#D64E4E"
              strokeWidth="1.3"
              strokeLinecap="round"
            />
          </svg>
        ),
        color: "#D64E4E",
        bgColor: "#FFF0F0",
      },
      {
        name: "Remove Pages",
        path: "/remove-pages",
        description: "Delete specific pages from a PDF",
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
            <path
              d="M12 3v4h4"
              stroke="#E25C3B"
              strokeWidth="1.4"
              strokeLinejoin="round"
            />
            <rect x="6" y="9.5" width="8" height="2" rx="0.5" fill="#E25C3B" />
            <path
              d="M8 13.5l4 0"
              stroke="#E25C3B"
              strokeWidth="1.2"
              strokeLinecap="round"
              opacity="0.5"
            />
          </svg>
        ),
        color: "#E25C3B",
        bgColor: "#FFF0EC",
      },
      {
        name: "Extract Pages",
        path: "/extract-pages",
        description: "Extract selected pages into a new PDF",
        svgIcon: (
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <title>Repair PDF</title>
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
              d="M12 3v4h4"
              stroke="#E25C3B"
              strokeWidth="1.4"
              strokeLinejoin="round"
            />
            <path
              d="M12.5 10.5l-1.5 1.5-3-3 1.5-1.5a2.12 2.12 0 013 3z"
              fill="#E25C3B"
              opacity="0.35"
              stroke="#E25C3B"
              strokeWidth="1.2"
            />
            <path
              d="M8 13l-1.5 1.5"
              stroke="#E25C3B"
              strokeWidth="1.4"
              strokeLinecap="round"
            />
            <path
              d="M9.5 14.5l-2 2"
              stroke="#E25C3B"
              strokeWidth="1.2"
              strokeLinecap="round"
              opacity="0.5"
            />
          </svg>
        ),
        color: "#E25C3B",
        bgColor: "#FFF0EC",
        comingSoon: true,
      },
      {
        name: "OCR PDF",
        path: "/ocr",
        description: "Convert scanned PDFs into searchable text",
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
              d="M5 7h5M5 9.5h7M5 12h4M5 14.5h6"
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
            <path
              d="M17.5 15.5l1.5 1.5"
              stroke="#3B8CE2"
              strokeWidth="1.4"
              strokeLinecap="round"
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
        description: "Capture and convert scans to PDF",
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
            <path
              d="M7.5 6V4.5A1.5 1.5 0 019 3h2a1.5 1.5 0 011.5 1.5V6"
              stroke="#2DBD6E"
              strokeWidth="1.3"
            />
            <circle cx="15.5" cy="9" r="0.8" fill="#2DBD6E" />
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
        description: "Turn images into a PDF document",
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
            <path
              d="M2 9l3-3 2 2 1.5-1.5 2 2"
              stroke="#3BE28A"
              strokeWidth="1.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle cx="5.5" cy="6" r="1" fill="#3BE28A" />
            <path
              d="M13 7l2 2 2-2M15 9V5"
              stroke="#3BE28A"
              strokeWidth="1.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M10 14h9"
              stroke="#3BE28A"
              strokeWidth="1"
              strokeLinecap="round"
              opacity="0.3"
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
            <path
              d="M12 15h4M12 13h2"
              stroke="#3BE28A"
              strokeWidth="1"
              strokeLinecap="round"
              opacity="0.5"
            />
          </svg>
        ),
        color: "#3BE28A",
        bgColor: "#EBFFF4",
      },
      {
        name: "Word to PDF",
        path: "/word-to-pdf",
        description: "Convert DOC and DOCX files to PDF",
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
            <path
              d="M13 7l2 2 2-2M15 9V5"
              stroke="#2B5CE2"
              strokeWidth="1.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
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
            <path
              d="M13 14h3M13 16h2"
              stroke="#2B5CE2"
              strokeWidth="1"
              strokeLinecap="round"
              opacity="0.5"
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
        description: "Convert PPT and PPTX to PDF slides",
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
            <path
              d="M7 14v3M4 17h6"
              stroke="#D94F34"
              strokeWidth="1.4"
              strokeLinecap="round"
            />
            <path
              d="M4 7.5h3a1.5 1.5 0 010 3H4V7.5z"
              fill="#D94F34"
              opacity="0.4"
            />
            <path
              d="M4 7.5h3a1.5 1.5 0 010 3H4V7.5z"
              stroke="#D94F34"
              strokeWidth="1.1"
            />
            <path
              d="M15 9l3 1.5L15 12"
              stroke="#D94F34"
              strokeWidth="1.4"
              strokeLinecap="round"
              strokeLinejoin="round"
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
        description: "Convert XLS and XLSX spreadsheets to PDF",
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
            <rect
              x="3"
              y="8"
              width="4"
              height="2.5"
              rx="0.3"
              fill="#1D6F42"
              opacity="0.25"
            />
            <path
              d="M15 9l2 2 2-2M17 11V7"
              stroke="#1D6F42"
              strokeWidth="1.4"
              strokeLinecap="round"
              strokeLinejoin="round"
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
        description: "Convert web pages and HTML files to PDF",
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
            <path
              d="M9 12l2-5"
              stroke="#E27A3B"
              strokeWidth="1.4"
              strokeLinecap="round"
            />
            <path
              d="M7 16.5h6"
              stroke="#E27A3B"
              strokeWidth="1.3"
              strokeLinecap="round"
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
        description: "Convert every page to a JPG image",
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
            <path
              d="M4 6h5M4 8.5h4M4 11h3"
              stroke="#3B7AE2"
              strokeWidth="1"
              strokeLinecap="round"
              opacity="0.5"
            />
            <path
              d="M13 7l2 2 2-2M15 9V5"
              stroke="#3B7AE2"
              strokeWidth="1.4"
              strokeLinecap="round"
              strokeLinejoin="round"
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
            <path
              d="M11 16l2.5-2.5 1.5 1.5 1-1 2 2"
              stroke="#3B7AE2"
              strokeWidth="1.1"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle cx="13.5" cy="13" r="0.8" fill="#3B7AE2" />
          </svg>
        ),
        color: "#3B7AE2",
        bgColor: "#EBF2FF",
      },
      {
        name: "PDF to Word",
        path: "/pdf-to-word",
        description: "Convert PDF to editable Word document",
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
            <path
              d="M4 6h5M4 8.5h4M4 11h3"
              stroke="#2B5CE2"
              strokeWidth="1"
              strokeLinecap="round"
              opacity="0.5"
            />
            <path
              d="M13 7l2 2 2-2M15 9V5"
              stroke="#2B5CE2"
              strokeWidth="1.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
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
            <text
              x="12.5"
              y="17"
              fontSize="5.5"
              fill="#2B5CE2"
              fontWeight="bold"
              fontFamily="sans-serif"
            >
              W
            </text>
          </svg>
        ),
        color: "#2B5CE2",
        bgColor: "#EBF0FF",
        comingSoon: true,
      },
      {
        name: "PDF to PowerPoint",
        path: "/pdf-to-pptx",
        description: "Convert PDF pages to editable slides",
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
            <path
              d="M4 6h5M4 8.5h4M4 11h3"
              stroke="#D94F34"
              strokeWidth="1"
              strokeLinecap="round"
              opacity="0.5"
            />
            <path
              d="M13 7l2 2 2-2M15 9V5"
              stroke="#D94F34"
              strokeWidth="1.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <rect
              x="11"
              y="11"
              width="7"
              height="7"
              rx="1"
              fill="#D94F34"
              opacity="0.15"
            />
            <rect
              x="11"
              y="11"
              width="7"
              height="7"
              rx="1"
              stroke="#D94F34"
              strokeWidth="1.3"
            />
            <path
              d="M13 13.5h1.5a1 1 0 010 2H13V13.5z"
              fill="#D94F34"
              opacity="0.5"
            />
            <path
              d="M13 13.5h1.5a1 1 0 010 2H13V13.5z"
              stroke="#D94F34"
              strokeWidth="1"
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
        description: "Extract tables from PDF to spreadsheet",
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
            <path
              d="M4 6h5M4 8.5h4M4 11h3"
              stroke="#1D6F42"
              strokeWidth="1"
              strokeLinecap="round"
              opacity="0.5"
            />
            <path
              d="M13 7l2 2 2-2M15 9V5"
              stroke="#1D6F42"
              strokeWidth="1.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <rect
              x="11"
              y="11"
              width="7"
              height="7"
              rx="1"
              fill="#1D6F42"
              opacity="0.15"
            />
            <rect
              x="11"
              y="11"
              width="7"
              height="7"
              rx="1"
              stroke="#1D6F42"
              strokeWidth="1.3"
            />
            <path
              d="M11 14.5h7M15 11v7"
              stroke="#1D6F42"
              strokeWidth="1"
              strokeLinecap="round"
              opacity="0.6"
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
        description: "Convert to ISO archival format",
        svgIcon: (
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <title>PDF to PDF/A</title>
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
            <path
              d="M4 6h5M4 8.5h4M4 11h3"
              stroke="#6B3BE2"
              strokeWidth="1"
              strokeLinecap="round"
              opacity="0.5"
            />
            <path
              d="M13 7l2 2 2-2M15 9V5"
              stroke="#6B3BE2"
              strokeWidth="1.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle cx="15" cy="15" r="3.5" fill="#6B3BE2" opacity="0.2" />
            <circle
              cx="15"
              cy="15"
              r="3.5"
              stroke="#6B3BE2"
              strokeWidth="1.3"
            />
            <path
              d="M13.5 15l1 1 2-2"
              stroke="#6B3BE2"
              strokeWidth="1.3"
              strokeLinecap="round"
              strokeLinejoin="round"
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
        name: "Advanced PDF Editor",
        path: "/edit-advanced",
        description:
          "Canva-like visual editor — drag & drop text, shapes, signatures",
        svgIcon: (
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <title>Advanced PDF Editor</title>
            <defs>
              <linearGradient
                id="adv-grad"
                x1="0"
                y1="0"
                x2="20"
                y2="20"
                gradientUnits="userSpaceOnUse"
              >
                <stop offset="0%" stopColor="#6366F1" />
                <stop offset="100%" stopColor="#3B82F6" />
              </linearGradient>
            </defs>
            <rect
              x="2"
              y="2"
              width="11"
              height="14"
              rx="1.5"
              fill="url(#adv-grad)"
              opacity="0.18"
            />
            <rect
              x="2"
              y="2"
              width="11"
              height="14"
              rx="1.5"
              stroke="url(#adv-grad)"
              strokeWidth="1.4"
            />
            <path
              d="M4.5 7h6M4.5 10h4"
              stroke="#6366F1"
              strokeWidth="1"
              strokeLinecap="round"
              opacity="0.6"
            />
            <circle cx="15" cy="14" r="3.5" fill="#3B82F6" opacity="0.15" />
            <circle
              cx="15"
              cy="14"
              r="3.5"
              stroke="#3B82F6"
              strokeWidth="1.3"
            />
            <path
              d="M13.8 14.9l.8.8 1.8-1.8"
              stroke="#3B82F6"
              strokeWidth="1.3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M11 6.5l1-3 5.5 5.5-3 1-3.5-3.5z"
              fill="#6366F1"
              opacity="0.3"
              stroke="#6366F1"
              strokeWidth="1.1"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        ),
        color: "#6366F1",
        bgColor: "#EEF2FF",
      },
      {
        name: "Edit PDF",
        path: "/edit",
        description: "Add text annotations and overlays",
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
              d="M12 3v4h4"
              stroke="#3B8CE2"
              strokeWidth="1.4"
              strokeLinejoin="round"
            />
            <path
              d="M13 10.5l-5 5H6v-2l5-5 2 2z"
              fill="#3B8CE2"
              opacity="0.3"
            />
            <path
              d="M13 10.5l-5 5H6v-2l5-5 2 2z"
              stroke="#3B8CE2"
              strokeWidth="1.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M11.5 12l2-2"
              stroke="#3B8CE2"
              strokeWidth="1.1"
              strokeLinecap="round"
            />
          </svg>
        ),
        color: "#3B8CE2",
        bgColor: "#EBF3FF",
      },
      {
        name: "Rotate PDF",
        path: "/rotate",
        description: "Rotate pages 90, 180, or 270 degrees",
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
        color: "#3B8CE2",
        bgColor: "#EBF3FF",
      },
      {
        name: "Add Page Numbers",
        path: "/page-numbers",
        description: "Insert customizable page numbers",
        svgIcon: (
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <title>Add Page Numbers</title>
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
              d="M12 3v4h4"
              stroke="#E2823B"
              strokeWidth="1.4"
              strokeLinejoin="round"
            />
            <path
              d="M6 8.5h5M6 11h7M6 13.5h4"
              stroke="#E2823B"
              strokeWidth="1"
              strokeLinecap="round"
              opacity="0.45"
            />
            <rect
              x="5"
              y="15"
              width="10"
              height="2"
              rx="0.5"
              fill="#E2823B"
              opacity="0.2"
            />
            <path
              d="M9 16h2"
              stroke="#E2823B"
              strokeWidth="1.2"
              strokeLinecap="round"
            />
            <circle
              cx="10"
              cy="16"
              r="2.5"
              fill="none"
              stroke="#E2823B"
              strokeWidth="1"
              opacity="0.5"
            />
          </svg>
        ),
        color: "#E2823B",
        bgColor: "#FFF8EC",
      },
      {
        name: "Watermark",
        path: "/watermark",
        description: "Add diagonal text watermark to all pages",
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
            <path
              d="M12 3v4h4"
              stroke="#9B3BE2"
              strokeWidth="1.4"
              strokeLinejoin="round"
            />
            <text
              x="5"
              y="15"
              fontSize="6.5"
              fill="#9B3BE2"
              opacity="0.5"
              fontFamily="sans-serif"
              transform="rotate(-25, 10, 12)"
            >
              DRAFT
            </text>
          </svg>
        ),
        color: "#9B3BE2",
        bgColor: "#F5EBFF",
      },
      {
        name: "Crop PDF",
        path: "/crop",
        description: "Trim edges with custom margins",
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
              d="M12 3v4h4"
              stroke="#9B3BE2"
              strokeWidth="1.4"
              strokeLinejoin="round"
            />
            <rect
              x="6"
              y="9"
              width="8"
              height="6"
              rx="0.5"
              fill="#9B3BE2"
              opacity="0.2"
              stroke="#9B3BE2"
              strokeWidth="1.2"
              strokeDasharray="2 1"
            />
            <rect
              x="5.5"
              y="8.5"
              width="2"
              height="2"
              rx="0.3"
              fill="#9B3BE2"
            />
            <rect
              x="12.5"
              y="8.5"
              width="2"
              height="2"
              rx="0.3"
              fill="#9B3BE2"
            />
            <rect x="5.5" y="14" width="2" height="2" rx="0.3" fill="#9B3BE2" />
            <rect
              x="12.5"
              y="14"
              width="2"
              height="2"
              rx="0.3"
              fill="#9B3BE2"
            />
          </svg>
        ),
        color: "#9B3BE2",
        bgColor: "#F5EBFF",
      },
    ],
  },
  {
    label: "PDF Security",
    tools: [
      {
        name: "Protect PDF",
        path: "/protect",
        description: "Encrypt your PDF with a password",
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
            <path
              d="M12 3v4h4"
              stroke="#2DBD6E"
              strokeWidth="1.4"
              strokeLinejoin="round"
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
            <circle cx="10" cy="13.75" r="1" fill="#2DBD6E" />
          </svg>
        ),
        color: "#2DBD6E",
        bgColor: "#EBFFF4",
      },
      {
        name: "Unlock PDF",
        path: "/unlock",
        description: "Remove password from a PDF you own",
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
            <path
              d="M12 3v4h4"
              stroke="#E2C43B"
              strokeWidth="1.4"
              strokeLinejoin="round"
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
            <path
              d="M8.5 11V9.5A1.5 1.5 0 0110 8c.6 0 1.15.35 1.38.85"
              stroke="#E2C43B"
              strokeWidth="1.3"
              strokeLinecap="round"
            />
            <circle cx="10" cy="13.75" r="1" fill="#E2C43B" />
          </svg>
        ),
        color: "#E2C43B",
        bgColor: "#FFFBEB",
      },
      {
        name: "Sign PDF",
        path: "/sign",
        description: "Draw and stamp your signature",
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
              d="M12 3v4h4"
              stroke="#2DBD6E"
              strokeWidth="1.4"
              strokeLinejoin="round"
            />
            <path
              d="M5.5 13.5c.8-1.5 1.3-2.5 1.8-2.5s1 1.5 1.5 1.5 1-2 1.5-2 1 2 1.5 1.5l.8-.8"
              stroke="#2DBD6E"
              strokeWidth="1.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M5 16h10"
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
        name: "Redact PDF",
        path: "/redact",
        description: "Permanently remove sensitive information",
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
            <path
              d="M12 3v4h4"
              stroke="#E23B3B"
              strokeWidth="1.4"
              strokeLinejoin="round"
            />
            <rect
              x="5"
              y="9.5"
              width="10"
              height="2.5"
              rx="0.4"
              fill="#E23B3B"
            />
            <path
              d="M5 14h7M5 16h5"
              stroke="#E23B3B"
              strokeWidth="1.1"
              strokeLinecap="round"
              opacity="0.35"
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
        description: "Compare two PDFs side-by-side",
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
            <path
              d="M3.5 6.5h3M3.5 8.5h4M3.5 10.5h2"
              stroke="#3B7AE2"
              strokeWidth="1"
              strokeLinecap="round"
              opacity="0.5"
            />
            <path
              d="M13.5 6.5h3M13.5 8.5h2M13.5 10.5h4"
              stroke="#3B7AE2"
              strokeWidth="1"
              strokeLinecap="round"
              opacity="0.6"
            />
            <path
              d="M9 9.5h2"
              stroke="#3B7AE2"
              strokeWidth="1.3"
              strokeLinecap="round"
            />
            <path
              d="M8.5 8.5l1 1-1 1M11.5 8.5l-1 1 1 1"
              stroke="#3B7AE2"
              strokeWidth="1"
              strokeLinecap="round"
              strokeLinejoin="round"
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
        description: "AI-powered translation preserving layout",
        svgIcon: (
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <title>Translate PDF</title>
            <circle cx="10" cy="10" r="8" fill="#7C3BE2" opacity="0.12" />
            <circle cx="10" cy="10" r="8" stroke="#7C3BE2" strokeWidth="1.4" />
            <ellipse
              cx="10"
              cy="10"
              rx="3"
              ry="8"
              stroke="#7C3BE2"
              strokeWidth="1.1"
            />
            <path
              d="M2 10h16"
              stroke="#7C3BE2"
              strokeWidth="1.1"
              strokeLinecap="round"
            />
            <path
              d="M4 6.5c1.5.8 3.5 1.5 6 1.5s4.5-.7 6-1.5M4 13.5c1.5-.8 3.5-1.5 6-1.5s4.5.7 6 1.5"
              stroke="#7C3BE2"
              strokeWidth="1"
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

function ToolCard({ tool, usageCount }: { tool: Tool; usageCount?: number }) {
  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.01 }}
      whileTap={{ scale: 0.97 }}
      transition={{ duration: 0.18 }}
    >
      <Link
        to={tool.path}
        className="group block bg-card border border-border rounded-xl tool-card-shadow transition-all duration-200 hover:border-primary/30 relative overflow-hidden"
      >
        {/* Subtle top gradient on hover */}
        <div
          className="absolute inset-x-0 top-0 h-1 rounded-t-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{
            background: `linear-gradient(90deg, ${tool.color}88, ${tool.color})`,
          }}
        />

        {/* ── Mobile compact card (3-col grid) ── */}
        <div className="sm:hidden flex flex-col items-center justify-center gap-1.5 p-3 min-h-[88px]">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: tool.bgColor }}
          >
            {tool.svgIcon}
          </div>
          <p className="text-[11px] font-ui font-medium text-foreground text-center leading-tight line-clamp-2 px-0.5">
            {tool.name}
          </p>
          {tool.comingSoon && (
            <span
              className="text-[9px] font-ui font-medium px-1 py-0.5 rounded"
              style={{
                backgroundColor: `${tool.color}15`,
                color: tool.color,
              }}
            >
              Plus
            </span>
          )}
        </div>

        {/* ── Desktop / sm+ full card ── */}
        <div className="hidden sm:flex items-start gap-4 p-5">
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110"
            style={{ backgroundColor: tool.bgColor }}
          >
            {tool.svgIcon}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <h3 className="font-display font-semibold text-sm text-foreground">
                {tool.name}
              </h3>
              {tool.comingSoon && (
                <Badge
                  variant="secondary"
                  className="text-xs py-0 h-4 font-ui"
                  style={{
                    backgroundColor: `${tool.color}12`,
                    color: tool.color,
                    border: `1px solid ${tool.color}25`,
                  }}
                >
                  Premium
                </Badge>
              )}
              {!tool.comingSoon &&
                usageCount !== undefined &&
                usageCount > 0 && (
                  <Badge
                    variant="secondary"
                    className="text-xs py-0 h-4 font-ui"
                  >
                    {usageCount.toLocaleString()}
                  </Badge>
                )}
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {tool.description}
            </p>
          </div>
          <ArrowRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-200 flex-shrink-0 mt-1" />
        </div>
      </Link>
    </motion.div>
  );
}

const IMAGE_TOOLS = [
  {
    name: "Compress Image",
    path: "/img-compress",
    description: "Reduce file size with adjustable quality. Batch support.",
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
        <path
          d="M2 10l4-4 3 3 3-3 5 5"
          stroke="#E25C3B"
          strokeWidth="1.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.5"
        />
        <circle cx="6" cy="6.5" r="1.2" fill="#E25C3B" opacity="0.6" />
        <path
          d="M10 18v-3M7.5 16.5L10 18.5l2.5-2"
          stroke="#E25C3B"
          strokeWidth="1.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M7 18.5h6"
          stroke="#E25C3B"
          strokeWidth="1.2"
          strokeLinecap="round"
          opacity="0.4"
        />
      </svg>
    ),
    color: "#E25C3B",
    bgColor: "#FFF0EC",
  },
  {
    name: "Resize Image",
    path: "/img-resize",
    description: "Change dimensions. Lock aspect ratio.",
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
          d="M1.5 6.5l3-3 2 2 1.5-1.5 2 2"
          stroke="#3B8CE2"
          strokeWidth="1.1"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="4.5" cy="5" r="0.9" fill="#3B8CE2" opacity="0.6" />
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
    description: "Drag crop handles. Preset ratios 1:1, 16:9, 4:3.",
    svgIcon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <title>Crop Image</title>
        <path
          d="M5 1.5v14h14"
          stroke="#2DBD6E"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <path
          d="M1.5 5H5M15 18.5V15"
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
        <rect x="4" y="4" width="2.5" height="2.5" rx="0.4" fill="#2DBD6E" />
        <rect x="13.5" y="4" width="2.5" height="2.5" rx="0.4" fill="#2DBD6E" />
        <rect x="4" y="13.5" width="2.5" height="2.5" rx="0.4" fill="#2DBD6E" />
        <rect
          x="13.5"
          y="13.5"
          width="2.5"
          height="2.5"
          rx="0.4"
          fill="#2DBD6E"
        />
      </svg>
    ),
    color: "#2DBD6E",
    bgColor: "#EBFFF4",
  },
  {
    name: "Convert Image",
    path: "/img-convert",
    description: "Convert between JPG, PNG, WEBP. Batch + ZIP.",
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
        <text
          x="3"
          y="8.5"
          fontSize="5"
          fill="#9B3BE2"
          fontWeight="bold"
          fontFamily="sans-serif"
        >
          JPG
        </text>
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
        <text
          x="12.3"
          y="16"
          fontSize="4.5"
          fill="#9B3BE2"
          fontWeight="bold"
          fontFamily="sans-serif"
        >
          PNG
        </text>
        <path
          d="M10 6.5l1.5 1-1.5 1"
          stroke="#9B3BE2"
          strokeWidth="1.3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M10 13.5L8.5 14.5l1.5 1"
          stroke="#9B3BE2"
          strokeWidth="1.3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
    color: "#9B3BE2",
    bgColor: "#F5EBFF",
  },
  {
    name: "Rotate & Flip",
    path: "/img-rotate",
    description: "Rotate 90°/180°/270° or flip horizontally/vertically.",
    svgIcon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <title>Rotate and Flip Image</title>
        <path
          d="M16 5A7 7 0 104.5 11.5"
          stroke="#3BE2D4"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <path
          d="M4.5 7V11.5H9"
          stroke="#3BE2D4"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
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
        <path
          d="M7.5 12.5l2.5-2.5 2 2 2-2"
          stroke="#3BE2D4"
          strokeWidth="1"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.5"
        />
      </svg>
    ),
    color: "#3BE2D4",
    bgColor: "#EBFDF9",
  },
  {
    name: "Watermark Image",
    path: "/img-watermark",
    description: "Add text watermarks with opacity and position control.",
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
        <path
          d="M2 9.5l4-4 3 3 3-3 5 5"
          stroke="#7C3BE2"
          strokeWidth="1.1"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.35"
        />
        <circle cx="5.5" cy="6.5" r="1" fill="#7C3BE2" opacity="0.4" />
        <text
          x="4"
          y="14"
          fontSize="6"
          fill="#7C3BE2"
          opacity="0.55"
          fontFamily="sans-serif"
          transform="rotate(-20, 10, 11)"
        >
          ©WM
        </text>
      </svg>
    ),
    color: "#7C3BE2",
    bgColor: "#F0EBFF",
  },
  {
    name: "Image to PDF",
    path: "/img-to-pdf",
    description: "Combine multiple images into a PDF.",
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
        <path
          d="M2 8l2.5-2.5 1.5 1.5 1-1 2 2"
          stroke="#E23B3B"
          strokeWidth="1.1"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="4.5" cy="5" r="0.9" fill="#E23B3B" opacity="0.7" />
        <path
          d="M12 8l2 2 2-2M14 10V6"
          stroke="#E23B3B"
          strokeWidth="1.4"
          strokeLinecap="round"
          strokeLinejoin="round"
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
        <path
          d="M12 14.5h4M12 16.5h2.5"
          stroke="#E23B3B"
          strokeWidth="1"
          strokeLinecap="round"
          opacity="0.5"
        />
      </svg>
    ),
    color: "#E23B3B",
    bgColor: "#FFF0F0",
  },
  {
    name: "Remove Background",
    path: "/img-remove-bg",
    description: "Canvas-based background removal. Plus feature.",
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
        <rect
          x="2"
          y="3"
          width="4"
          height="3.25"
          fill="#D94F34"
          opacity="0.12"
        />
        <rect
          x="6"
          y="3"
          width="4"
          height="3.25"
          fill="#D94F34"
          opacity="0.25"
        />
        <rect
          x="10"
          y="3"
          width="4"
          height="3.25"
          fill="#D94F34"
          opacity="0.12"
        />
        <rect
          x="14"
          y="3"
          width="4"
          height="3.25"
          fill="#D94F34"
          opacity="0.25"
        />
        <rect
          x="2"
          y="6.25"
          width="4"
          height="3.25"
          fill="#D94F34"
          opacity="0.25"
        />
        <circle
          cx="10"
          cy="12"
          r="4.5"
          fill="#D94F34"
          opacity="0.2"
          stroke="#D94F34"
          strokeWidth="1.3"
        />
        <path
          d="M8.5 12c0-.83.67-1.5 1.5-1.5s1.5.67 1.5 1.5-.67 1.5-1.5 1.5-1.5-.67-1.5-1.5z"
          fill="#D94F34"
          opacity="0.5"
        />
        <path
          d="M14 8l2-2M14 16l2 2"
          stroke="#D94F34"
          strokeWidth="1.3"
          strokeLinecap="round"
        />
      </svg>
    ),
    color: "#D94F34",
    bgColor: "#FFF3F0",
  },
  {
    name: "Image Editor",
    path: "/img-editor",
    description: "Brightness, contrast, blur, saturation, filters.",
    svgIcon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <title>Image Editor</title>
        <rect
          x="2"
          y="2.5"
          width="16"
          height="11"
          rx="1.5"
          fill="#3B6CE2"
          opacity="0.12"
        />
        <rect
          x="2"
          y="2.5"
          width="16"
          height="11"
          rx="1.5"
          stroke="#3B6CE2"
          strokeWidth="1.4"
        />
        <path
          d="M5 17h10"
          stroke="#3B6CE2"
          strokeWidth="1.4"
          strokeLinecap="round"
        />
        <path
          d="M6 10V5.5"
          stroke="#3B6CE2"
          strokeWidth="1.3"
          strokeLinecap="round"
        />
        <circle cx="6" cy="8" r="1.2" fill="#3B6CE2" />
        <path
          d="M10 10V4.5"
          stroke="#3B6CE2"
          strokeWidth="1.3"
          strokeLinecap="round"
        />
        <circle cx="10" cy="7" r="1.2" fill="#3B6CE2" opacity="0.7" />
        <path
          d="M14 10V6"
          stroke="#3B6CE2"
          strokeWidth="1.3"
          strokeLinecap="round"
        />
        <circle cx="14" cy="5" r="1.2" fill="#3B6CE2" opacity="0.5" />
      </svg>
    ),
    color: "#3B6CE2",
    bgColor: "#EBF0FF",
  },
];

interface Ad {
  id: bigint;
  title: string;
  imageUrl: string;
  linkUrl: string;
  coupon: string;
  isBoosted: boolean;
  clicks: bigint;
  isActive: boolean;
}

interface Product {
  id: bigint;
  title: string;
  description: string;
  category: string;
  price: bigint;
  isFree: boolean;
  tags: string[];
  downloadCount: bigint;
}

const SAMPLE_FEATURED: Product[] = [
  {
    id: BigInt(1),
    title: "Complete React Developer Course",
    description: "Master React 19 and TypeScript",
    category: "Education",
    price: BigInt(2999),
    isFree: false,
    tags: ["React"],
    downloadCount: BigInt(342),
  },
  {
    id: BigInt(2),
    title: "Business Plan Template Bundle",
    description: "Professional templates for startups",
    category: "Business",
    price: BigInt(0),
    isFree: true,
    tags: ["Business"],
    downloadCount: BigInt(1204),
  },
  {
    id: BigInt(3),
    title: "UI/UX Design System Kit",
    description: "500+ Figma components",
    category: "Design",
    price: BigInt(4999),
    isFree: false,
    tags: ["Design"],
    downloadCount: BigInt(876),
  },
  {
    id: BigInt(4),
    title: "Python Data Science MBA Project",
    description: "Ready-to-submit MBA project",
    category: "Education",
    price: BigInt(1499),
    isFree: false,
    tags: ["Python"],
    downloadCount: BigInt(523),
  },
  {
    id: BigInt(5),
    title: "Personal Finance Excel Tracker",
    description: "Track income and expenses",
    category: "Finance",
    price: BigInt(0),
    isFree: true,
    tags: ["Finance"],
    downloadCount: BigInt(2891),
  },
  {
    id: BigInt(6),
    title: "Node.js REST API Starter",
    description: "Production-ready boilerplate",
    category: "Technology",
    price: BigInt(1999),
    isFree: false,
    tags: ["Node.js"],
    downloadCount: BigInt(741),
  },
];

const PRODUCT_CATEGORY_COLORS: Record<string, string> = {
  Education: "#3B8CE2",
  Technology: "#2DBD6E",
  Business: "#E2A83B",
  Design: "#9B3BE2",
  Finance: "#E25C3B",
  Other: "#3BE2D4",
};

export function Home() {
  const { data: usageData } = useToolUsage();
  const { settings } = useAdminSettings();
  const { hiddenServices, sponsorPosts } = settings;
  const { actor, isFetching } = useActor();
  const [ads, setAds] = useState<Ad[]>([]);
  const [featuredProducts, setFeaturedProducts] =
    useState<Product[]>(SAMPLE_FEATURED);

  useEffect(() => {
    async function loadMarketplace() {
      if (!actor || isFetching) return;
      try {
        const [adsData, prodsData] = await Promise.all([
          typeof (actor as any).getActiveAds === "function"
            ? (actor as any).getActiveAds()
            : Promise.resolve([]),
          typeof (actor as any).getAllProducts === "function"
            ? (actor as any).getAllProducts()
            : Promise.resolve([]),
        ]);
        if (adsData) setAds(adsData);
        if (prodsData && prodsData.length > 0)
          setFeaturedProducts(prodsData.slice(0, 6));
      } catch {}
    }
    loadMarketplace();
  }, [actor, isFetching]);

  const handleAdClick = async (adId: bigint) => {
    if (!actor || typeof (actor as any).recordAdClick !== "function") return;
    try {
      await (actor as any).recordAdClick(adId);
    } catch {}
  };

  const usageMap = usageData
    ? Object.fromEntries(
        usageData.map(([name, count]) => [name, Number(count)]),
      )
    : {};

  const toolNameToKey: Record<string, string> = {
    "Merge PDF": "merge",
    "Split PDF": "split",
    "Organize PDF": "organize",
    "Compress PDF": "compress",
    "Optimize PDF": "optimize",
    "Rotate PDF": "rotate",
    Watermark: "watermark",
    "Add Page Numbers": "page-numbers",
    "PDF to JPG": "pdf-to-jpg",
    "JPG to PDF": "jpg-to-pdf",
    "Protect PDF": "protect",
    "Unlock PDF": "unlock",
    "Remove Pages": "remove-pages",
    "Extract Pages": "extract-pages",
    "Edit PDF": "edit",
    "Crop PDF": "crop",
    "Sign PDF": "sign",
  };

  const containerVariants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.06 } },
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  };

  const totalFreeTools = CATEGORIES.flatMap((c) => c.tools).filter(
    (t) => !t.comingSoon,
  ).length;

  return (
    <main>
      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-border">
        <div className="gradient-hero absolute inset-0 pointer-events-none" />
        <div className="container max-w-5xl py-20 md:py-28 text-center relative">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full text-sm font-ui font-medium mb-6">
              <FileText className="w-3.5 h-3.5" />
              100% browser-based — your files never leave your device
            </div>
            <h1 className="font-display font-bold text-4xl sm:text-5xl md:text-6xl text-foreground mb-4 leading-tight tracking-tight">
              Every tool you need
              <br />
              <span className="text-primary">to work with PDFs</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto mb-8 leading-relaxed">
              Merge, split, compress, convert, edit, and secure PDFs instantly
              in your browser. Powered by Gemini AI for smart optimizations.
            </p>
          </motion.div>

          {/* Quick stats */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="flex flex-wrap justify-center gap-8 text-sm text-muted-foreground"
          >
            {[
              ["30+", "PDF Tools"],
              [String(totalFreeTools), "Free Tools"],
              ["0", "Files Uploaded to Server"],
            ].map(([num, label]) => (
              <div key={label} className="text-center">
                <div className="font-display font-bold text-2xl text-foreground">
                  {num}
                </div>
                <div className="text-xs mt-0.5">{label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Tools Grid */}
      <section className="container max-w-5xl py-16">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-12"
        >
          {CATEGORIES.map((category) => {
            const visibleTools = category.tools.filter(
              (t) => !hiddenServices.includes(t.path),
            );
            if (visibleTools.length === 0) return null;
            return (
              <motion.div key={category.label} variants={itemVariants}>
                <h2 className="font-display font-bold text-lg text-foreground mb-4 flex items-center gap-2">
                  <span className="w-1 h-5 rounded-full bg-primary inline-block" />
                  {category.label}
                </h2>
                <div className="grid grid-cols-3 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-4">
                  {visibleTools.map((tool) => (
                    <ToolCard
                      key={tool.path}
                      tool={tool}
                      usageCount={usageMap[toolNameToKey[tool.name]]}
                    />
                  ))}
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </section>

      {/* Sponsor Posters Section */}
      {sponsorPosts.length > 0 && (
        <section className="border-t border-border bg-card/20">
          <div className="container max-w-5xl py-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              viewport={{ once: true }}
            >
              <h2 className="font-display font-bold text-lg text-foreground mb-6 flex items-center gap-2">
                <span className="w-1 h-5 rounded-full bg-primary inline-block" />
                Sponsors
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {sponsorPosts.map((post) =>
                  post.link ? (
                    <a
                      key={post.id}
                      href={post.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block group rounded-xl border border-border overflow-hidden bg-card shadow-card hover:shadow-card-hover transition-all duration-200 hover:border-primary/30"
                    >
                      <div className="overflow-hidden">
                        <img
                          src={post.imageUrl}
                          alt={post.caption || "Sponsor"}
                          className="w-full h-44 object-cover group-hover:scale-105 transition-transform duration-300"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='200'%3E%3Crect fill='%23f0f0f0' width='400' height='200'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' fill='%23999' font-size='14'%3ESponsor%3C/text%3E%3C/svg%3E";
                          }}
                        />
                      </div>
                      {post.caption && (
                        <div className="px-4 py-3">
                          <p className="font-ui text-sm text-foreground line-clamp-2">
                            {post.caption}
                          </p>
                        </div>
                      )}
                    </a>
                  ) : (
                    <div
                      key={post.id}
                      className="group rounded-xl border border-border overflow-hidden bg-card shadow-card hover:shadow-card-hover transition-all duration-200 hover:border-primary/30"
                    >
                      <div className="overflow-hidden">
                        <img
                          src={post.imageUrl}
                          alt={post.caption || "Sponsor"}
                          className="w-full h-44 object-cover group-hover:scale-105 transition-transform duration-300"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='200'%3E%3Crect fill='%23f0f0f0' width='400' height='200'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' fill='%23999' font-size='14'%3ESponsor%3C/text%3E%3C/svg%3E";
                          }}
                        />
                      </div>
                      {post.caption && (
                        <div className="px-4 py-3">
                          <p className="font-ui text-sm text-foreground line-clamp-2">
                            {post.caption}
                          </p>
                        </div>
                      )}
                    </div>
                  ),
                )}
              </div>
            </motion.div>
          </div>
        </section>
      )}

      {/* Image Tools Section */}
      <section className="border-t border-border bg-muted/20">
        <div className="container max-w-5xl py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            viewport={{ once: true }}
          >
            <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
              <h2 className="font-display font-bold text-lg text-foreground flex items-center gap-2">
                <span className="w-1 h-5 rounded-full bg-primary inline-block" />
                Image Tools
              </h2>
              <Link to="/img-compress">
                <Button
                  variant="outline"
                  size="sm"
                  className="font-ui text-xs gap-1.5"
                >
                  View all tools
                  <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </Link>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-4">
              {IMAGE_TOOLS.map((tool) => (
                <motion.div
                  key={tool.path}
                  whileHover={{ y: -4, scale: 1.01 }}
                  whileTap={{ scale: 0.97 }}
                  transition={{ duration: 0.18 }}
                >
                  <Link
                    to={tool.path}
                    className="group block bg-card border border-border rounded-xl tool-card-shadow transition-all duration-200 hover:border-primary/30 relative overflow-hidden"
                  >
                    <div
                      className="absolute inset-x-0 top-0 h-1 rounded-t-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      style={{
                        background: `linear-gradient(90deg, ${tool.color}88, ${tool.color})`,
                      }}
                    />
                    {/* Mobile compact (sm hidden) */}
                    <div className="sm:hidden flex flex-col items-center justify-center gap-1.5 p-3 min-h-[88px]">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: tool.bgColor }}
                      >
                        {tool.svgIcon}
                      </div>
                      <p className="text-[11px] font-ui font-medium text-foreground text-center leading-tight line-clamp-2 px-0.5">
                        {tool.name}
                      </p>
                    </div>
                    {/* Desktop full card */}
                    <div className="hidden sm:flex items-start gap-4 p-5">
                      <div
                        className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110"
                        style={{ backgroundColor: tool.bgColor }}
                      >
                        {tool.svgIcon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-display font-semibold text-sm text-foreground mb-1">
                          {tool.name}
                        </h3>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          {tool.description}
                        </p>
                      </div>
                      <ArrowRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-200 flex-shrink-0 mt-1" />
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* iLoveIMG Promo Section */}
      <section className="border-t border-border bg-card/30">
        <div className="container max-w-5xl py-14">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            viewport={{ once: true }}
          >
            <Card className="border-border shadow-card overflow-hidden">
              <div className="h-1 bg-gradient-to-r from-primary via-orange-400 to-amber-400" />
              <CardContent className="pt-8 pb-8">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 bg-primary/10">
                    <Wand2 className="w-7 h-7 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h2 className="font-display font-bold text-xl text-foreground">
                        PhoneBaba
                      </h2>
                      <Badge
                        variant="secondary"
                        className="font-ui text-xs"
                        style={{
                          backgroundColor: "#E25C3B12",
                          color: "#E25C3B",
                          border: "1px solid #E25C3B25",
                        }}
                      >
                        Sister Service
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Need to work with images too? PhoneBaba offers the same
                      easy PDF experience for images — compress, resize, crop,
                      convert, and enhance with AI.
                    </p>
                  </div>
                  <Link to="/img-compress" className="flex-shrink-0">
                    <Button
                      variant="outline"
                      className="font-ui gap-2 border-primary/30 hover:border-primary/60 hover:bg-primary/5"
                    >
                      <Image className="w-4 h-4" />
                      Explore PhoneBaba
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Ads Carousel */}
      {ads.length > 0 && (
        <section className="border-t border-border bg-amber-50/40">
          <div className="container max-w-5xl py-8">
            <div className="flex items-center gap-2 mb-4">
              <Megaphone className="w-4 h-4 text-amber-500" />
              <span className="font-ui font-semibold text-sm text-muted-foreground uppercase tracking-wider">
                Sponsored
              </span>
            </div>
            <div className="flex gap-4 overflow-x-auto pb-2">
              {ads.map((ad) => (
                <motion.a
                  key={ad.id.toString()}
                  href={ad.linkUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => handleAdClick(ad.id)}
                  whileHover={{ scale: 1.02 }}
                  className="flex-shrink-0 w-64 block rounded-xl overflow-hidden border border-amber-200 bg-white shadow-sm"
                >
                  {ad.imageUrl && (
                    <img
                      src={ad.imageUrl}
                      alt={ad.title}
                      className="w-full h-28 object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                  )}
                  <div className="p-3">
                    <Badge className="text-xs bg-amber-500 text-white border-0 mb-1.5 font-ui">
                      Sponsored
                    </Badge>
                    <p className="font-display font-semibold text-sm text-foreground line-clamp-2 mb-1">
                      {ad.title}
                    </p>
                    {ad.coupon && (
                      <span className="text-xs px-1.5 py-0.5 bg-amber-100 border border-amber-300 rounded font-ui font-semibold text-amber-800">
                        🎟 {ad.coupon}
                      </span>
                    )}
                  </div>
                </motion.a>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Featured Marketplace Products */}
      <section className="border-t border-border">
        <div className="container max-w-5xl py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            viewport={{ once: true }}
          >
            <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
              <h2 className="font-display font-bold text-lg text-foreground flex items-center gap-2">
                <span className="w-1 h-5 rounded-full bg-primary inline-block" />
                Creator Marketplace
              </h2>
              <Link to="/marketplace">
                <Button
                  variant="outline"
                  size="sm"
                  className="font-ui text-xs gap-1.5"
                >
                  Browse All Products
                  <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {featuredProducts.slice(0, 6).map((product) => {
                const color =
                  PRODUCT_CATEGORY_COLORS[product.category] || "#94a3b8";
                return (
                  <motion.div
                    key={product.id.toString()}
                    whileHover={{ y: -3 }}
                    transition={{ duration: 0.16 }}
                  >
                    <a href={`/product/${product.id.toString()}`}>
                      <Card className="h-full border-border hover:border-primary/30 transition-all duration-200">
                        <CardContent className="p-4 space-y-2">
                          <div className="flex items-center justify-between">
                            <Badge
                              className="text-xs font-ui"
                              style={{
                                backgroundColor: `${color}18`,
                                color,
                                border: `1px solid ${color}30`,
                              }}
                            >
                              {product.category}
                            </Badge>
                            <span
                              className={`text-sm font-bold font-display ${product.isFree ? "text-green-600" : "text-primary"}`}
                            >
                              {product.isFree
                                ? "Free"
                                : `$${(Number(product.price) / 100).toFixed(2)}`}
                            </span>
                          </div>
                          <h3 className="font-display font-semibold text-sm text-foreground line-clamp-2">
                            {product.title}
                          </h3>
                          <p className="text-xs text-muted-foreground font-ui line-clamp-2">
                            {product.description}
                          </p>
                          <div className="flex items-center gap-3 text-xs text-muted-foreground font-ui">
                            <span className="flex items-center gap-1">
                              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />{" "}
                              4.5
                            </span>
                            <span className="flex items-center gap-1">
                              <Download className="w-3 h-3" />
                              {Number(product.downloadCount).toLocaleString()}
                            </span>
                            <ExternalLink className="w-3 h-3 ml-auto" />
                          </div>
                        </CardContent>
                      </Card>
                    </a>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </div>
      </section>

      {/* AI Intelligence Tools Section */}
      <section className="border-t border-border bg-gradient-to-br from-purple-50/40 via-background to-indigo-50/30">
        <div className="container max-w-5xl py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            viewport={{ once: true }}
          >
            <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
              <h2 className="font-display font-bold text-lg text-foreground flex items-center gap-2">
                <span className="w-1 h-5 rounded-full bg-primary inline-block" />
                AI Intelligence Tools
              </h2>
              <Link to="/ai-summarize">
                <Button
                  variant="outline"
                  size="sm"
                  className="font-ui text-xs gap-1.5"
                >
                  Explore AI Tools
                  <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </Link>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-4">
              {[
                {
                  name: "PDF Summarizer",
                  desc: "AI-generated executive summaries",
                  path: "/ai-summarize",
                  color: "#7C3BE2",
                  bgColor: "#F3EEFF",
                  svgIcon: (
                    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                      <title>Summarize</title>
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
                      <path
                        d="M17 7l-1.5 2 1.5 2"
                        stroke="#7C3BE2"
                        strokeWidth="1.3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        opacity="0.5"
                      />
                    </svg>
                  ),
                },
                {
                  name: "Ask PDF",
                  desc: "Chat-style Q&A over documents",
                  path: "/ai-ask-pdf",
                  color: "#2563EB",
                  bgColor: "#EFF6FF",
                  svgIcon: (
                    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
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
                      <circle
                        cx="17"
                        cy="16"
                        r="4"
                        fill="#2563EB"
                        opacity="0.15"
                        stroke="#2563EB"
                        strokeWidth="1.3"
                      />
                      <path
                        d="M15.5 16a1.5 1.5 0 113 0c0 .83-.67 1.5-1.5 1.5v.5"
                        stroke="#2563EB"
                        strokeWidth="1.2"
                        strokeLinecap="round"
                      />
                    </svg>
                  ),
                },
                {
                  name: "Smart Translator",
                  desc: "Multi-language PDF conversion",
                  path: "/ai-smart-translate",
                  color: "#0891B2",
                  bgColor: "#ECFEFF",
                  svgIcon: (
                    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                      <title>Translate</title>
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
                        d="M2 11h18M11 2c-2 3-3.5 5.5-3.5 9s1.5 6 3.5 9M11 2c2 3 3.5 5.5 3.5 9s-1.5 6-3.5 9"
                        stroke="#0891B2"
                        strokeWidth="1.2"
                        strokeLinecap="round"
                      />
                    </svg>
                  ),
                },
                {
                  name: "Entity Recognition",
                  desc: "Auto text extraction & NER",
                  path: "/ai-extract-entities",
                  color: "#059669",
                  bgColor: "#ECFDF5",
                  svgIcon: (
                    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                      <title>Entity</title>
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
                  desc: "Extract tables to CSV",
                  path: "/ai-table-extractor",
                  color: "#D97706",
                  bgColor: "#FFFBEB",
                  svgIcon: (
                    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                      <title>Table</title>
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
                  desc: "Insights, suggestions & score",
                  path: "/ai-annotate",
                  color: "#7C3AED",
                  bgColor: "#F5F3FF",
                  svgIcon: (
                    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                      <title>Annotate</title>
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
                  desc: "Simplify, condense, or expand",
                  path: "/ai-rewrite",
                  color: "#E11D48",
                  bgColor: "#FFF1F2",
                  svgIcon: (
                    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                      <title>Rewrite</title>
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
              ].map((tool) => (
                <motion.div
                  key={tool.path}
                  whileHover={{ y: -4, scale: 1.01 }}
                  whileTap={{ scale: 0.97 }}
                  transition={{ duration: 0.18 }}
                >
                  <Link
                    to={tool.path}
                    className="group block bg-card border border-border rounded-xl tool-card-shadow transition-all duration-200 hover:border-primary/30 relative overflow-hidden"
                  >
                    <div
                      className="absolute inset-x-0 top-0 h-1 rounded-t-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      style={{
                        background: `linear-gradient(90deg, ${tool.color}88, ${tool.color})`,
                      }}
                    />
                    <div className="sm:hidden flex flex-col items-center justify-center gap-1.5 p-3 min-h-[88px]">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: tool.bgColor }}
                      >
                        {tool.svgIcon}
                      </div>
                      <p className="text-[11px] font-ui font-medium text-foreground text-center leading-tight line-clamp-2 px-0.5">
                        {tool.name}
                      </p>
                    </div>
                    <div className="hidden sm:flex items-start gap-4 p-5">
                      <div
                        className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110"
                        style={{ backgroundColor: tool.bgColor }}
                      >
                        {tool.svgIcon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-display font-semibold text-sm text-foreground mb-1">
                          {tool.name}
                        </h3>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          {tool.desc}
                        </p>
                      </div>
                      <ArrowRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-200 flex-shrink-0 mt-1" />
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Document Conversion Section */}
      <section className="border-t border-border">
        <div className="container max-w-5xl py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            viewport={{ once: true }}
          >
            <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
              <h2 className="font-display font-bold text-lg text-foreground flex items-center gap-2">
                <span className="w-1 h-5 rounded-full bg-primary inline-block" />
                Document Conversion
              </h2>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-4">
              {[
                {
                  name: "PDF to HTML",
                  desc: "Clean HTML with proper structure",
                  path: "/pdf-to-html",
                  color: "#F59E0B",
                  bgColor: "#FFFBEB",
                  svgIcon: (
                    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
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
                  desc: "Convert to .md with headings",
                  path: "/pdf-to-markdown",
                  color: "#6366F1",
                  bgColor: "#EEF2FF",
                  svgIcon: (
                    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
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
                        fontSize="9"
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
                  name: "Markdown to PDF",
                  desc: "Convert .md to clean PDF",
                  path: "/markdown-to-pdf",
                  color: "#10B981",
                  bgColor: "#ECFDF5",
                  svgIcon: (
                    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                      <title>Markdown to PDF</title>
                      <text
                        x="2"
                        y="14"
                        fontSize="9"
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
                },
                {
                  name: "PDF to RTF",
                  desc: "Rich Text Format output",
                  path: "/pdf-to-rtf",
                  color: "#8B5CF6",
                  bgColor: "#F5F3FF",
                  svgIcon: (
                    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
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
                        fontSize="7"
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
                  name: "RTF to PDF",
                  desc: "Convert RTF to PDF document",
                  path: "/rtf-to-pdf",
                  color: "#EC4899",
                  bgColor: "#FDF2F8",
                  svgIcon: (
                    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                      <title>RTF to PDF</title>
                      <text
                        x="1"
                        y="14"
                        fontSize="7"
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
                },
              ].map((tool) => (
                <motion.div
                  key={tool.path}
                  whileHover={{ y: -4, scale: 1.01 }}
                  whileTap={{ scale: 0.97 }}
                  transition={{ duration: 0.18 }}
                >
                  <Link
                    to={tool.path}
                    className="group block bg-card border border-border rounded-xl tool-card-shadow transition-all duration-200 hover:border-primary/30 relative overflow-hidden"
                  >
                    <div
                      className="absolute inset-x-0 top-0 h-1 rounded-t-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      style={{
                        background: `linear-gradient(90deg, ${tool.color}88, ${tool.color})`,
                      }}
                    />
                    <div className="sm:hidden flex flex-col items-center justify-center gap-1.5 p-3 min-h-[88px]">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: tool.bgColor }}
                      >
                        {tool.svgIcon}
                      </div>
                      <p className="text-[11px] font-ui font-medium text-foreground text-center leading-tight line-clamp-2 px-0.5">
                        {tool.name}
                      </p>
                    </div>
                    <div className="hidden sm:flex items-start gap-4 p-5">
                      <div
                        className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110"
                        style={{ backgroundColor: tool.bgColor }}
                      >
                        {tool.svgIcon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-display font-semibold text-sm text-foreground mb-1">
                          {tool.name}
                        </h3>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          {tool.desc}
                        </p>
                      </div>
                      <ArrowRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-200 flex-shrink-0 mt-1" />
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Utility Tools Section */}
      <section className="border-t border-border bg-muted/20">
        <div className="container max-w-5xl py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            viewport={{ once: true }}
          >
            <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
              <h2 className="font-display font-bold text-lg text-foreground flex items-center gap-2">
                <span className="w-1 h-5 rounded-full bg-primary inline-block" />
                Utility Tools
              </h2>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-4">
              {[
                {
                  name: "Word Counter",
                  desc: "Words, chars, sentences & frequency",
                  path: "/word-counter",
                  color: "#0EA5E9",
                  bgColor: "#F0F9FF",
                  svgIcon: (
                    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
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
                      <rect
                        x="14"
                        y="11"
                        width="6"
                        height="6"
                        rx="1"
                        fill="#0EA5E9"
                        opacity="0.2"
                      />
                      <text
                        x="15"
                        y="17"
                        fontSize="5"
                        fill="#0EA5E9"
                        fontWeight="bold"
                        fontFamily="monospace"
                      >
                        123
                      </text>
                    </svg>
                  ),
                },
              ].map((tool) => (
                <motion.div
                  key={tool.path}
                  whileHover={{ y: -4, scale: 1.01 }}
                  whileTap={{ scale: 0.97 }}
                  transition={{ duration: 0.18 }}
                >
                  <Link
                    to={tool.path}
                    className="group block bg-card border border-border rounded-xl tool-card-shadow transition-all duration-200 hover:border-primary/30 relative overflow-hidden"
                  >
                    <div
                      className="absolute inset-x-0 top-0 h-1 rounded-t-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      style={{
                        background: `linear-gradient(90deg, ${tool.color}88, ${tool.color})`,
                      }}
                    />
                    <div className="sm:hidden flex flex-col items-center justify-center gap-1.5 p-3 min-h-[88px]">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: tool.bgColor }}
                      >
                        {tool.svgIcon}
                      </div>
                      <p className="text-[11px] font-ui font-medium text-foreground text-center leading-tight line-clamp-2 px-0.5">
                        {tool.name}
                      </p>
                    </div>
                    <div className="hidden sm:flex items-start gap-4 p-5">
                      <div
                        className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110"
                        style={{ backgroundColor: tool.bgColor }}
                      >
                        {tool.svgIcon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-display font-semibold text-sm text-foreground mb-1">
                          {tool.name}
                        </h3>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          {tool.desc}
                        </p>
                      </div>
                      <ArrowRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-200 flex-shrink-0 mt-1" />
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Workflows & Platforms */}
      <section className="container max-w-5xl pb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          viewport={{ once: true }}
        >
          <h2 className="font-display font-bold text-lg text-foreground mb-6 flex items-center gap-2">
            <span className="w-1 h-5 rounded-full bg-primary inline-block" />
            Workflows &amp; Platforms
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                icon: Settings2,
                name: "Workflows",
                desc: "Automate and reuse tool combinations",
                path: "/workflows",
                color: "#3B8CE2",
              },
              {
                icon: Crown,
                name: "Premium Plan",
                desc: "Advanced features, larger files, no ads",
                path: "/premium",
                color: "#E27A3B",
              },
              {
                icon: Sparkles,
                name: "AI Tools",
                desc: "Gemini AI for translation, OCR, and optimization",
                path: "/translate",
                color: "#7C3BE2",
              },
              {
                icon: FileText,
                name: "Business",
                desc: "Team management and bulk automation",
                path: "/premium",
                color: "#2DBD6E",
              },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <Link key={item.name} to={item.path}>
                  <motion.div
                    whileHover={{ y: -3 }}
                    transition={{ duration: 0.18 }}
                  >
                    <Card className="border-border shadow-card hover:shadow-card-hover transition-all duration-200 h-full">
                      <CardContent className="pt-5">
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
                          style={{ backgroundColor: `${item.color}15` }}
                        >
                          <Icon
                            className="w-5 h-5"
                            style={{ color: item.color }}
                          />
                        </div>
                        <h3 className="font-display font-semibold text-sm text-foreground mb-1">
                          {item.name}
                        </h3>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          {item.desc}
                        </p>
                      </CardContent>
                    </Card>
                  </motion.div>
                </Link>
              );
            })}
          </div>
        </motion.div>
      </section>
    </main>
  );
}
