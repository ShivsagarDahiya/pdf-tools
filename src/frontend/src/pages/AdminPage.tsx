import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import type { FooterLink, SponsorPost } from "@/contexts/AdminSettingsContext";
import { useAdminSettings } from "@/contexts/AdminSettingsContext";
import { useActor } from "@/hooks/useActor";
import { useInternetIdentity } from "@/hooks/useInternetIdentity";
import {
  useAllUserHistories,
  useAssignUserRole,
  useGetUserProfile,
} from "@/hooks/useQueries";
import type { Principal } from "@icp-sdk/core/principal";
import {
  Check,
  Link2,
  LogIn,
  Megaphone,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { motion } from "motion/react";
import type React from "react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { UserRole } from "../backend.d";

// ── Colored SVG Icon Components ───────────────────────────────────────────────
function SvgEye({
  color = "#3B8CE2",
  size = 14,
}: { color?: string; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function SvgEyeOff({
  color = "#94a3b8",
  size = 14,
}: { color?: string; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
}

function SvgPalette({
  color = "#9B3BE2",
  size = 14,
}: { color?: string; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="13.5" cy="6.5" r=".5" fill={color} />
      <circle cx="17.5" cy="10.5" r=".5" fill={color} />
      <circle cx="8.5" cy="7.5" r=".5" fill={color} />
      <circle cx="6.5" cy="12.5" r=".5" fill={color} />
      <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z" />
    </svg>
  );
}

function SvgHeader({
  color = "#2DBD6E",
  size = 14,
}: { color?: string; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="3" y="3" width="18" height="5" rx="1" fill={`${color}22`} />
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <line x1="3" y1="8" x2="21" y2="8" />
    </svg>
  );
}

function SvgFooter({
  color = "#3BE2D4",
  size = 14,
}: { color?: string; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <line x1="3" y1="16" x2="21" y2="16" />
      <rect x="3" y="16" width="18" height="5" rx="1" fill={`${color}22`} />
    </svg>
  );
}

function SvgUsers({
  color = "#E2A83B",
  size = 14,
}: { color?: string; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function SvgCrown({
  color = "#E2C93B",
  size = 14,
}: { color?: string; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M2 4l3 12h14l3-12-6 7-4-7-4 7-6-7z" fill={`${color}22`} />
      <path d="M2 4l3 12h14l3-12-6 7-4-7-4 7-6-7z" />
      <line x1="5" y1="20" x2="19" y2="20" />
    </svg>
  );
}

function SvgBarChart({
  color = "#E25C3B",
  size = 14,
}: { color?: string; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect
        x="3"
        y="12"
        width="4"
        height="9"
        rx="1"
        fill={`${color}33`}
        stroke={color}
      />
      <rect
        x="10"
        y="7"
        width="4"
        height="14"
        rx="1"
        fill={`${color}33`}
        stroke={color}
      />
      <rect
        x="17"
        y="3"
        width="4"
        height="18"
        rx="1"
        fill={`${color}44`}
        stroke={color}
      />
    </svg>
  );
}

function SvgZap({
  color = "#8BE23B",
  size = 14,
}: { color?: string; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <polygon
        points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"
        fill={`${color}33`}
        stroke={color}
      />
    </svg>
  );
}

function SvgSettings({
  color = "#3B8CE2",
  size = 14,
}: { color?: string; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  );
}

function SvgShield({
  color = "#E25C3B",
  size = 28,
}: { color?: string; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path
        d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"
        fill={`${color}22`}
        stroke={color}
      />
      <polyline points="9 12 11 14 15 10" stroke={color} />
    </svg>
  );
}

function SvgSettingsLarge({
  color = "#E25C3B",
  size = 20,
}: { color?: string; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="3" fill={`${color}22`} />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  );
}

// Category-colored tool icons
function SvgMerge({
  color = "#3B8CE2",
  size = 16,
}: { color?: string; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M8 6H5a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h3" />
      <path d="M16 6h3a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-3" />
      <line x1="12" y1="2" x2="12" y2="22" />
      <polyline points="9 9 12 6 15 9" />
      <polyline points="9 15 12 18 15 15" />
    </svg>
  );
}

function SvgScissors({
  color = "#3B8CE2",
  size = 16,
}: { color?: string; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="6" cy="6" r="3" />
      <circle cx="6" cy="18" r="3" />
      <line x1="20" y1="4" x2="8.12" y2="15.88" />
      <line x1="14.47" y1="14.48" x2="20" y2="20" />
      <line x1="8.12" y1="8.12" x2="12" y2="12" />
    </svg>
  );
}

function SvgTrash({
  color = "#3B8CE2",
  size = 16,
}: { color?: string; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
    </svg>
  );
}

function SvgFileMinus({
  color = "#3B8CE2",
  size = 16,
}: { color?: string; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="9" y1="15" x2="15" y2="15" />
    </svg>
  );
}

function SvgGrid({
  color = "#3B8CE2",
  size = 16,
}: { color?: string; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="3" y="3" width="7" height="7" fill={`${color}22`} />
      <rect x="14" y="3" width="7" height="7" fill={`${color}22`} />
      <rect x="14" y="14" width="7" height="7" fill={`${color}22`} />
      <rect x="3" y="14" width="7" height="7" fill={`${color}22`} />
    </svg>
  );
}

function SvgMinimize({
  color = "#2DBD6E",
  size = 16,
}: { color?: string; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <polyline points="4 14 10 14 10 20" />
      <polyline points="20 10 14 10 14 4" />
      <line x1="10" y1="14" x2="3" y2="21" />
      <line x1="21" y1="3" x2="14" y2="10" />
    </svg>
  );
}

function SvgZapSmall({
  color = "#2DBD6E",
  size = 16,
}: { color?: string; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <polygon
        points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"
        fill={`${color}22`}
        stroke={color}
      />
    </svg>
  );
}

function SvgWrench({
  color = "#2DBD6E",
  size = 16,
}: { color?: string; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
    </svg>
  );
}

function SvgScan({
  color = "#2DBD6E",
  size = 16,
}: { color?: string; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M3 7V5a2 2 0 0 1 2-2h2" />
      <path d="M17 3h2a2 2 0 0 1 2 2v2" />
      <path d="M21 17v2a2 2 0 0 1-2 2h-2" />
      <path d="M7 21H5a2 2 0 0 1-2-2v-2" />
      <line x1="3" y1="12" x2="21" y2="12" />
    </svg>
  );
}

function SvgCamera({
  color = "#2DBD6E",
  size = 16,
}: { color?: string; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
      <circle cx="12" cy="13" r="4" fill={`${color}22`} />
    </svg>
  );
}

function SvgImage({
  color = "#E2A83B",
  size = 16,
}: { color?: string; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="3" y="3" width="18" height="18" rx="2" fill={`${color}22`} />
      <circle cx="8.5" cy="8.5" r="1.5" fill={color} />
      <polyline points="21 15 16 10 5 21" />
    </svg>
  );
}

function SvgFileText({
  color = "#E2A83B",
  size = 16,
}: { color?: string; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path
        d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"
        fill={`${color}11`}
      />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
    </svg>
  );
}

function SvgPresentation({
  color = "#E2A83B",
  size = 16,
}: { color?: string; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M2 3h20" />
      <path d="M21 3v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V3" />
      <path d="M7 21l5-5 5 5" />
    </svg>
  );
}

function SvgSheet({
  color = "#E2A83B",
  size = 16,
}: { color?: string; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="3" y="3" width="18" height="18" rx="2" fill={`${color}11`} />
      <line x1="3" y1="9" x2="21" y2="9" />
      <line x1="3" y1="15" x2="21" y2="15" />
      <line x1="9" y1="3" x2="9" y2="21" />
      <line x1="15" y1="3" x2="15" y2="21" />
    </svg>
  );
}

function SvgGlobe({
  color = "#E2A83B",
  size = 16,
}: { color?: string; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="10" fill={`${color}11`} />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  );
}

function SvgFileImage({
  color = "#9B3BE2",
  size = 16,
}: { color?: string; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path
        d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"
        fill={`${color}11`}
      />
      <polyline points="14 2 14 8 20 8" />
      <circle cx="10" cy="13" r="2" fill={`${color}33`} />
      <path d="m20 17-1.296-1.296a2.41 2.41 0 0 0-3.408 0L9 22" />
    </svg>
  );
}

function SvgFileOutput({
  color = "#9B3BE2",
  size = 16,
}: { color?: string; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1-2-1z" />
      <path d="M14 8H8" />
      <path d="M16 12H8" />
      <path d="M13 16H8" />
    </svg>
  );
}

function SvgTableProps({
  color = "#9B3BE2",
  size = 16,
}: { color?: string; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="2" y="2" width="20" height="20" rx="2" fill={`${color}11`} />
      <line x1="2" y1="7" x2="22" y2="7" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <line x1="2" y1="17" x2="22" y2="17" />
      <line x1="7" y1="7" x2="7" y2="22" />
    </svg>
  );
}

function SvgPenLine({
  color = "#3BE2D4",
  size = 16,
}: { color?: string; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M18 2l4 4-14 14H4v-4L18 2z" fill={`${color}22`} />
      <line x1="4" y1="20" x2="20" y2="20" />
    </svg>
  );
}

function SvgRotate({
  color = "#3BE2D4",
  size = 16,
}: { color?: string; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <polyline points="23 4 23 10 17 10" />
      <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
    </svg>
  );
}

function SvgHash({
  color = "#3BE2D4",
  size = 16,
}: { color?: string; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <line x1="4" y1="9" x2="20" y2="9" />
      <line x1="4" y1="15" x2="20" y2="15" />
      <line x1="10" y1="3" x2="8" y2="21" />
      <line x1="16" y1="3" x2="14" y2="21" />
    </svg>
  );
}

function SvgStamp({
  color = "#3BE2D4",
  size = 16,
}: { color?: string; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M5 22h14" />
      <path d="M5 7v3a5 5 0 0 0 5 5h4a5 5 0 0 0 5-5V7" />
      <rect x="7" y="2" width="10" height="5" rx="2" fill={`${color}22`} />
    </svg>
  );
}

function SvgCrop({
  color = "#3BE2D4",
  size = 16,
}: { color?: string; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M6 2v14a2 2 0 0 0 2 2h14" />
      <path d="M18 22V8a2 2 0 0 0-2-2H2" />
    </svg>
  );
}

function SvgLock({
  color = "#E25C3B",
  size = 16,
}: { color?: string; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="3" y="11" width="18" height="11" rx="2" fill={`${color}22`} />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

function SvgUnlock({
  color = "#E25C3B",
  size = 16,
}: { color?: string; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="3" y="11" width="18" height="11" rx="2" fill={`${color}22`} />
      <path d="M7 11V7a5 5 0 0 1 9.9-1" />
    </svg>
  );
}

function SvgPenSquare({
  color = "#E25C3B",
  size = 16,
}: { color?: string; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path
        d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"
        fill={`${color}22`}
      />
    </svg>
  );
}

function SvgEyeOffRed({
  color = "#E25C3B",
  size = 16,
}: { color?: string; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
}

function SvgGitCompare({
  color = "#E25C3B",
  size = 16,
}: { color?: string; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="18" cy="18" r="3" fill={`${color}22`} />
      <circle cx="6" cy="6" r="3" fill={`${color}22`} />
      <path d="M13 6h3a2 2 0 0 1 2 2v7" />
      <path d="M11 18H8a2 2 0 0 1-2-2V9" />
    </svg>
  );
}

function SvgLanguages({
  color = "#E23B9B",
  size = 16,
}: { color?: string; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="m5 8 6 6" />
      <path d="m4 14 6-6 2-3" />
      <path d="M2 5h12" />
      <path d="M7 2h1" />
      <path d="m22 22-5-10-5 10" />
      <path d="M14 18h6" />
    </svg>
  );
}

// Image tool SVG icons with amber color
function SvgCompress({
  color = "#E2A83B",
  size = 16,
}: { color?: string; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <polyline points="4 14 10 14 10 20" />
      <polyline points="20 10 14 10 14 4" />
      <line x1="10" y1="14" x2="3" y2="21" />
      <line x1="21" y1="3" x2="14" y2="10" />
    </svg>
  );
}

function SvgResize({
  color = "#3B8CE2",
  size = 16,
}: { color?: string; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <polyline points="15 3 21 3 21 9" />
      <polyline points="9 21 3 21 3 15" />
      <line x1="21" y1="3" x2="14" y2="10" />
      <line x1="3" y1="21" x2="10" y2="14" />
    </svg>
  );
}

function SvgCropImg({
  color = "#2DBD6E",
  size = 16,
}: { color?: string; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M6 2v14a2 2 0 0 0 2 2h14" />
      <path d="M18 22V8a2 2 0 0 0-2-2H2" />
    </svg>
  );
}

function SvgConvert({
  color = "#9B3BE2",
  size = 16,
}: { color?: string; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <polyline points="17 1 21 5 17 9" />
      <path d="M3 11V9a4 4 0 0 1 4-4h14" />
      <polyline points="7 23 3 19 7 15" />
      <path d="M21 13v2a4 4 0 0 1-4 4H3" />
    </svg>
  );
}

function SvgRotateImg({
  color = "#E25C3B",
  size = 16,
}: { color?: string; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <polyline points="23 4 23 10 17 10" />
      <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
    </svg>
  );
}

function SvgWatermark({
  color = "#3BE2D4",
  size = 16,
}: { color?: string; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M5 22h14" />
      <path d="M5 7v3a5 5 0 0 0 5 5h4a5 5 0 0 0 5-5V7" />
      <rect x="7" y="2" width="10" height="5" rx="2" fill={`${color}22`} />
    </svg>
  );
}

function SvgImgToPdf({
  color = "#E23B9B",
  size = 16,
}: { color?: string; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="3" y="3" width="10" height="10" rx="2" fill={`${color}22`} />
      <path d="M17 2H11a2 2 0 0 0-2 2" />
      <path d="M21 7v13a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2v-4" />
      <path d="M14 2h3l4 4v1" />
    </svg>
  );
}

function SvgRemoveBg({
  color = "#8BE23B",
  size = 16,
}: { color?: string; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path
        d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"
        fill={`${color}22`}
      />
      <line x1="4" y1="22" x2="4" y2="15" />
    </svg>
  );
}

function SvgEditor({
  color = "#E2C93B",
  size = 16,
}: { color?: string; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="3" fill={`${color}22`} />
      <path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83" />
    </svg>
  );
}

// Map category names to colors
const CATEGORY_COLORS: Record<string, string> = {
  "Organize PDF": "#3B8CE2",
  "Optimize PDF": "#2DBD6E",
  "Convert to PDF": "#E2A83B",
  "Convert from PDF": "#9B3BE2",
  "Edit PDF": "#3BE2D4",
  "PDF Security": "#E25C3B",
  "PDF Intelligence": "#E23B9B",
};

// Map tool paths to their SVG icon components
type SvgIconComponent = ({
  color,
  size,
}: { color?: string; size?: number }) => React.ReactElement;

const TOOL_SVG_ICONS: Record<string, SvgIconComponent> = {
  "/merge": SvgMerge,
  "/split": SvgScissors,
  "/remove-pages": SvgTrash,
  "/extract-pages": SvgFileMinus,
  "/organize": SvgGrid,
  "/compress": SvgMinimize,
  "/optimize": SvgZapSmall,
  "/repair": SvgWrench,
  "/ocr": SvgScan,
  "/scan-to-pdf": SvgCamera,
  "/jpg-to-pdf": SvgImage,
  "/word-to-pdf": SvgFileText,
  "/pptx-to-pdf": SvgPresentation,
  "/excel-to-pdf": SvgSheet,
  "/html-to-pdf": SvgGlobe,
  "/pdf-to-jpg": SvgFileImage,
  "/pdf-to-word": SvgFileOutput,
  "/pdf-to-pptx": SvgPresentation,
  "/pdf-to-excel": SvgTableProps,
  "/pdf-to-pdfa": SvgFileText,
  "/edit": SvgPenLine,
  "/rotate": SvgRotate,
  "/page-numbers": SvgHash,
  "/watermark": SvgStamp,
  "/crop": SvgCrop,
  "/protect": SvgLock,
  "/unlock": SvgUnlock,
  "/sign": SvgPenSquare,
  "/redact": SvgEyeOffRed,
  "/compare": SvgGitCompare,
  "/translate": SvgLanguages,
};

const IMG_TOOL_SVG_ICONS: Record<string, SvgIconComponent> = {
  "Compress Image": SvgCompress,
  "Resize Image": SvgResize,
  "Crop Image": SvgCropImg,
  "Convert Image": SvgConvert,
  "Rotate Image": SvgRotateImg,
  "Watermark Image": SvgWatermark,
  "Image to PDF": SvgImgToPdf,
  "Remove Background": SvgRemoveBg,
  "Image Editor": SvgEditor,
};

const IMG_TOOL_COLORS: Record<string, string> = {
  "Compress Image": "#E2A83B",
  "Resize Image": "#3B8CE2",
  "Crop Image": "#2DBD6E",
  "Convert Image": "#9B3BE2",
  "Rotate Image": "#E25C3B",
  "Watermark Image": "#3BE2D4",
  "Image to PDF": "#E23B9B",
  "Remove Background": "#8BE23B",
  "Image Editor": "#E2C93B",
};

// ── Tool list (mirrors Home.tsx CATEGORIES) ──────────────────────────────────
interface Tool {
  name: string;
  path: string;
  category: string;
}

const ALL_TOOLS: Tool[] = [
  // Organize
  { name: "Merge PDF", path: "/merge", category: "Organize PDF" },
  { name: "Split PDF", path: "/split", category: "Organize PDF" },
  { name: "Remove Pages", path: "/remove-pages", category: "Organize PDF" },
  { name: "Extract Pages", path: "/extract-pages", category: "Organize PDF" },
  { name: "Organize PDF", path: "/organize", category: "Organize PDF" },
  // Optimize
  { name: "Compress PDF", path: "/compress", category: "Optimize PDF" },
  { name: "Optimize PDF", path: "/optimize", category: "Optimize PDF" },
  { name: "Repair PDF", path: "/repair", category: "Optimize PDF" },
  { name: "OCR PDF", path: "/ocr", category: "Optimize PDF" },
  { name: "Scan to PDF", path: "/scan-to-pdf", category: "Optimize PDF" },
  // Convert to
  { name: "JPG to PDF", path: "/jpg-to-pdf", category: "Convert to PDF" },
  { name: "Word to PDF", path: "/word-to-pdf", category: "Convert to PDF" },
  {
    name: "PowerPoint to PDF",
    path: "/pptx-to-pdf",
    category: "Convert to PDF",
  },
  { name: "Excel to PDF", path: "/excel-to-pdf", category: "Convert to PDF" },
  { name: "HTML to PDF", path: "/html-to-pdf", category: "Convert to PDF" },
  // Convert from
  { name: "PDF to JPG", path: "/pdf-to-jpg", category: "Convert from PDF" },
  { name: "PDF to Word", path: "/pdf-to-word", category: "Convert from PDF" },
  {
    name: "PDF to PowerPoint",
    path: "/pdf-to-pptx",
    category: "Convert from PDF",
  },
  { name: "PDF to Excel", path: "/pdf-to-excel", category: "Convert from PDF" },
  { name: "PDF to PDF/A", path: "/pdf-to-pdfa", category: "Convert from PDF" },
  // Edit
  { name: "Edit PDF", path: "/edit", category: "Edit PDF" },
  { name: "Rotate PDF", path: "/rotate", category: "Edit PDF" },
  { name: "Add Page Numbers", path: "/page-numbers", category: "Edit PDF" },
  { name: "Watermark", path: "/watermark", category: "Edit PDF" },
  { name: "Crop PDF", path: "/crop", category: "Edit PDF" },
  // Security
  { name: "Protect PDF", path: "/protect", category: "PDF Security" },
  { name: "Unlock PDF", path: "/unlock", category: "PDF Security" },
  { name: "Sign PDF", path: "/sign", category: "PDF Security" },
  { name: "Redact PDF", path: "/redact", category: "PDF Security" },
  { name: "Compare PDF", path: "/compare", category: "PDF Security" },
  // Intelligence
  { name: "Translate PDF", path: "/translate", category: "PDF Intelligence" },
];

// ── Admin Login Gate ─────────────────────────────────────────────────────────
function AdminLoginGate({ onSuccess }: { onSuccess: () => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (email === "shivsagardahayat99@gmail.com" && password === "12345678") {
      onSuccess();
    } else {
      setError("Invalid email or password.");
    }
  };

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-sm"
      >
        <Card className="border-border shadow-card">
          <CardHeader className="text-center pb-4">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
              <SvgShield color="#E25C3B" size={28} />
            </div>
            <CardTitle className="font-display text-xl">Admin Login</CardTitle>
            <CardDescription className="font-ui text-sm">
              Enter your admin credentials to continue
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="admin-email" className="font-ui text-sm">
                  Email
                </Label>
                <Input
                  id="admin-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@example.com"
                  autoComplete="email"
                  className="font-ui"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="admin-password" className="font-ui text-sm">
                  Password
                </Label>
                <Input
                  id="admin-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className="font-ui"
                />
              </div>
              {error && (
                <p className="text-sm text-destructive font-ui">{error}</p>
              )}
              <Button type="submit" className="w-full font-ui gap-2">
                <LogIn className="w-4 h-4" />
                Sign In
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

// ── Services Tab ─────────────────────────────────────────────────────────────
function ServicesTab() {
  const { settings, updateSettings } = useAdminSettings();
  const { hiddenServices } = settings;

  const categories = [...new Set(ALL_TOOLS.map((t) => t.category))];

  const toggleService = (path: string) => {
    if (hiddenServices.includes(path)) {
      updateSettings({
        hiddenServices: hiddenServices.filter((p) => p !== path),
      });
    } else {
      updateSettings({ hiddenServices: [...hiddenServices, path] });
    }
  };

  const toggleAll = () => {
    if (hiddenServices.length === ALL_TOOLS.length) {
      updateSettings({ hiddenServices: [] });
    } else {
      updateSettings({ hiddenServices: ALL_TOOLS.map((t) => t.path) });
    }
  };

  const reset = () => updateSettings({ hiddenServices: [] });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-display font-semibold text-foreground">
            Service Visibility
          </h3>
          <p className="text-sm text-muted-foreground font-ui mt-0.5">
            {hiddenServices.length === 0
              ? "All tools are visible"
              : `${hiddenServices.length} tool${hiddenServices.length !== 1 ? "s" : ""} hidden`}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={toggleAll}
            className="font-ui text-xs"
          >
            {hiddenServices.length === ALL_TOOLS.length
              ? "Show All"
              : "Hide All"}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={reset}
            className="font-ui text-xs"
          >
            Reset
          </Button>
        </div>
      </div>

      <div className="space-y-6">
        {categories.map((cat) => {
          const tools = ALL_TOOLS.filter((t) => t.category === cat);
          const catColor = CATEGORY_COLORS[cat] || "#3B8CE2";
          return (
            <div key={cat}>
              <h4 className="font-ui font-semibold text-sm text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
                <span
                  className="inline-block w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: catColor }}
                />
                {cat}
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {tools.map((tool) => {
                  const isHidden = hiddenServices.includes(tool.path);
                  const ToolIcon = TOOL_SVG_ICONS[tool.path];
                  const iconColor = catColor;
                  return (
                    <button
                      type="button"
                      key={tool.path}
                      className={`flex items-center gap-3 p-3 rounded-lg border transition-all cursor-pointer w-full text-left ${
                        isHidden
                          ? "border-border bg-muted/30 opacity-50"
                          : "border-border bg-card hover:border-primary/30"
                      }`}
                      onClick={() => toggleService(tool.path)}
                    >
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: `${iconColor}18` }}
                      >
                        {ToolIcon ? (
                          <ToolIcon color={iconColor} size={16} />
                        ) : (
                          <SvgFileText color={iconColor} size={16} />
                        )}
                      </div>
                      <span className="font-ui text-sm text-foreground flex-1">
                        {tool.name}
                      </span>
                      {isHidden ? (
                        <SvgEyeOff color="#94a3b8" size={14} />
                      ) : (
                        <SvgEye color={iconColor} size={14} />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Theme Tab ─────────────────────────────────────────────────────────────────
function ThemeTab() {
  const { settings, updateSettings } = useAdminSettings();
  const [localColor, setLocalColor] = useState(settings.themeColor);

  const applyColor = () => {
    updateSettings({ themeColor: localColor });
    toast.success("Theme color updated");
  };

  const PRESET_COLORS = [
    "#E25C3B",
    "#3B8CE2",
    "#2DBD6E",
    "#9B3BE2",
    "#E2A83B",
    "#E23B3B",
    "#3BE2D4",
    "#E23B9B",
  ];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-display font-semibold text-foreground mb-1">
          Theme Customization
        </h3>
        <p className="text-sm text-muted-foreground font-ui">
          Customize the primary color and appearance mode
        </p>
      </div>

      <Card className="border-border">
        <CardHeader className="pb-3">
          <CardTitle className="font-display text-base flex items-center gap-2">
            <SvgPalette color="#9B3BE2" size={16} />
            Primary Color
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {PRESET_COLORS.map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => setLocalColor(color)}
                className="w-8 h-8 rounded-full border-2 transition-all hover:scale-110"
                style={{
                  backgroundColor: color,
                  borderColor: localColor === color ? "#000" : "transparent",
                }}
                title={color}
              />
            ))}
          </div>

          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-lg border border-border flex-shrink-0"
              style={{ backgroundColor: localColor }}
            />
            <Input
              type="color"
              value={localColor}
              onChange={(e) => setLocalColor(e.target.value)}
              className="w-20 h-10 p-1 cursor-pointer"
            />
            <Input
              type="text"
              value={localColor}
              onChange={(e) => setLocalColor(e.target.value)}
              placeholder="#E25C3B"
              className="font-ui flex-1"
            />
          </div>

          <div
            className="p-4 rounded-lg text-white text-sm font-ui"
            style={{ backgroundColor: localColor }}
          >
            <div className="font-semibold mb-1">Preview: Primary Color</div>
            <div className="opacity-80 text-xs">
              Buttons, links, and accents will use this color
            </div>
          </div>

          <Button onClick={applyColor} className="font-ui gap-2">
            <Check className="w-4 h-4" />
            Apply Color
          </Button>
        </CardContent>
      </Card>

      <Card className="border-border">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <Label className="font-ui font-semibold text-foreground">
                Dark Mode
              </Label>
              <p className="text-xs text-muted-foreground font-ui mt-0.5">
                Toggle between light and dark appearance
              </p>
            </div>
            <Switch
              checked={settings.darkMode}
              onCheckedChange={(checked) => {
                updateSettings({ darkMode: checked });
                toast.success(
                  checked ? "Dark mode enabled" : "Light mode enabled",
                );
              }}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ── Header Tab ────────────────────────────────────────────────────────────────
function HeaderTab() {
  const { settings, updateSettings } = useAdminSettings();
  const [logoText, setLogoText] = useState(settings.headerLogoText);
  const [logoUrl, setLogoUrl] = useState(settings.headerLogoUrl);

  const save = () => {
    updateSettings({ headerLogoText: logoText, headerLogoUrl: logoUrl });
    toast.success("Header settings saved");
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-display font-semibold text-foreground mb-1">
          Header Settings
        </h3>
        <p className="text-sm text-muted-foreground font-ui">
          Customize the site logo and header branding
        </p>
      </div>

      <Card className="border-border">
        <CardHeader className="pb-3">
          <CardTitle className="font-display text-base">Logo Preview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 p-4 bg-card border border-border rounded-lg">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center overflow-hidden">
              {logoUrl ? (
                <img
                  src={logoUrl}
                  alt="Logo"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
              ) : (
                <SvgFileText color="#ffffff" size={16} />
              )}
            </div>
            <span className="font-display font-bold text-foreground text-lg tracking-tight">
              {logoText || "PDFTools"}
            </span>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="logo-text" className="font-ui font-medium">
            Logo Text
          </Label>
          <Input
            id="logo-text"
            value={logoText}
            onChange={(e) => setLogoText(e.target.value)}
            placeholder="PDFTools"
            className="font-ui"
          />
          <p className="text-xs text-muted-foreground font-ui">
            The brand name shown next to the logo icon
          </p>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="logo-url" className="font-ui font-medium">
            Custom Logo Image URL
          </Label>
          <Input
            id="logo-url"
            value={logoUrl}
            onChange={(e) => setLogoUrl(e.target.value)}
            placeholder="https://example.com/logo.png"
            className="font-ui"
          />
          <p className="text-xs text-muted-foreground font-ui">
            Optional. If set, replaces the default icon with your image.
          </p>
        </div>

        <Button onClick={save} className="font-ui gap-2">
          <Check className="w-4 h-4" />
          Save Header Settings
        </Button>
      </div>
    </div>
  );
}

// ── Footer Tab ────────────────────────────────────────────────────────────────
function FooterTab() {
  const { settings, updateSettings } = useAdminSettings();
  const [brandName, setBrandName] = useState(settings.footerBrandName);
  const [copyright, setCopyright] = useState(settings.footerCopyright);
  const [links, setLinks] = useState<FooterLink[]>(settings.footerLinks);
  const [newLabel, setNewLabel] = useState("");
  const [newUrl, setNewUrl] = useState("");

  const save = () => {
    updateSettings({
      footerBrandName: brandName,
      footerCopyright: copyright,
      footerLinks: links,
    });
    toast.success("Footer settings saved");
  };

  const addLink = () => {
    if (!newLabel.trim() || !newUrl.trim()) return;
    setLinks((prev) => [
      ...prev,
      { label: newLabel.trim(), url: newUrl.trim() },
    ]);
    setNewLabel("");
    setNewUrl("");
  };

  const removeLink = (idx: number) => {
    setLinks((prev) => prev.filter((_, i) => i !== idx));
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-display font-semibold text-foreground mb-1">
          Footer Settings
        </h3>
        <p className="text-sm text-muted-foreground font-ui">
          Customize footer branding and navigation links
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="footer-brand" className="font-ui font-medium">
            Brand Name
          </Label>
          <Input
            id="footer-brand"
            value={brandName}
            onChange={(e) => setBrandName(e.target.value)}
            placeholder="PDFTools"
            className="font-ui"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="footer-copyright" className="font-ui font-medium">
            Copyright Text
          </Label>
          <Input
            id="footer-copyright"
            value={copyright}
            onChange={(e) => setCopyright(e.target.value)}
            placeholder="Leave blank for default"
            className="font-ui"
          />
          <p className="text-xs text-muted-foreground font-ui">
            Leave blank to hide the copyright section.
          </p>
        </div>

        <Separator />

        <div>
          <Label className="font-ui font-medium mb-3 block">Footer Links</Label>
          <div className="space-y-2 mb-3">
            {links.map((link, idx) => (
              <div
                key={`${link.url}-${link.label}`}
                className="flex items-center gap-2 p-2.5 bg-muted/40 rounded-lg border border-border"
              >
                <Link2 className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                <span className="font-ui text-sm flex-1 truncate">
                  {link.label}
                </span>
                <span className="font-ui text-xs text-muted-foreground truncate max-w-[120px]">
                  {link.url}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="w-7 h-7 text-muted-foreground hover:text-destructive"
                  onClick={() => removeLink(idx)}
                >
                  <X className="w-3.5 h-3.5" />
                </Button>
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            <Input
              value={newLabel}
              onChange={(e) => setNewLabel(e.target.value)}
              placeholder="Link label"
              className="font-ui"
            />
            <Input
              value={newUrl}
              onChange={(e) => setNewUrl(e.target.value)}
              placeholder="/path"
              className="font-ui"
            />
            <Button
              variant="outline"
              onClick={addLink}
              className="font-ui shrink-0"
            >
              Add
            </Button>
          </div>
        </div>

        <Button onClick={save} className="font-ui gap-2">
          <Check className="w-4 h-4" />
          Save Footer Settings
        </Button>
      </div>
    </div>
  );
}

// ── User Row Component ────────────────────────────────────────────────────────
function UserRow({ principal }: { principal: Principal }) {
  const { data: profile } = useGetUserProfile(principal);
  const { mutate: assignRole, isPending } = useAssignUserRole();

  const principalStr = principal.toString();
  const displayName = profile?.displayName || "Unknown User";
  const initials = displayName.slice(0, 2).toUpperCase();

  const handleMakeAdmin = () => {
    assignRole(
      { principal, role: UserRole.admin },
      {
        onSuccess: () => toast.success(`${displayName} is now an admin`),
        onError: () => toast.error("Failed to update role"),
      },
    );
  };

  const handleRemoveAdmin = () => {
    assignRole(
      { principal, role: UserRole.user },
      {
        onSuccess: () => toast.success(`${displayName} is now a regular user`),
        onError: () => toast.error("Failed to update role"),
      },
    );
  };

  return (
    <tr className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
      <td className="py-3 px-4">
        <div className="flex items-center gap-3">
          <Avatar className="w-8 h-8">
            <AvatarImage src={profile?.profilePicUrl} alt={displayName} />
            <AvatarFallback className="text-xs font-ui bg-primary/10 text-primary">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="font-ui text-sm font-medium text-foreground">
              {displayName}
            </div>
            <div className="font-ui text-xs text-muted-foreground font-mono">
              {principalStr.slice(0, 20)}…
            </div>
          </div>
        </div>
      </td>
      <td className="py-3 px-4">
        <span className="font-mono text-xs text-muted-foreground">
          {principalStr.slice(0, 12)}…
        </span>
      </td>
      <td className="py-3 px-4">
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={handleMakeAdmin}
            disabled={isPending}
            className="font-ui text-xs gap-1.5 h-7"
          >
            <SvgShield color="#E25C3B" size={14} />
            Make Admin
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={handleRemoveAdmin}
            disabled={isPending}
            className="font-ui text-xs gap-1.5 h-7 text-muted-foreground hover:text-foreground"
          >
            <SvgUsers color="#94a3b8" size={14} />
            Set User
          </Button>
        </div>
      </td>
    </tr>
  );
}

// ── Users Tab ─────────────────────────────────────────────────────────────────
function UsersTab() {
  const { data: allHistories, isLoading } = useAllUserHistories();

  const principals: Principal[] = allHistories
    ? allHistories.map(([p]) => p)
    : [];

  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-display font-semibold text-foreground mb-1">
          User Management
        </h3>
        <p className="text-sm text-muted-foreground font-ui">
          Manage user roles. Users who have used the app will appear here.
        </p>
      </div>

      {isLoading ? (
        <div className="py-8 text-center text-muted-foreground font-ui text-sm">
          Loading users…
        </div>
      ) : principals.length === 0 ? (
        <div className="py-12 text-center">
          <SvgUsers color="#94a3b8" size={32} />
          <div className="mt-2" />
          <p className="text-muted-foreground font-ui text-sm">
            No users yet. Users who interact with the app will appear here.
          </p>
        </div>
      ) : (
        <div className="border border-border rounded-lg overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-muted/50 border-b border-border">
                <th className="text-left py-2.5 px-4 font-ui text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  User
                </th>
                <th className="text-left py-2.5 px-4 font-ui text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Principal ID
                </th>
                <th className="text-left py-2.5 px-4 font-ui text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {principals.map((p) => (
                <UserRow key={p.toString()} principal={p} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ── Sponsors Tab ──────────────────────────────────────────────────────────────
function SponsorsTab() {
  const { settings, updateSettings } = useAdminSettings();
  const { sponsorPosts } = settings;
  const [imageUrl, setImageUrl] = useState("");
  const [caption, setCaption] = useState("");
  const [link, setLink] = useState("");

  const addPost = () => {
    if (!imageUrl.trim()) {
      toast.error("Please provide an image URL");
      return;
    }
    const newPost: SponsorPost = {
      id: `sponsor-${Date.now()}`,
      imageUrl: imageUrl.trim(),
      caption: caption.trim(),
      link: link.trim(),
      createdAt: Date.now(),
    };
    updateSettings({ sponsorPosts: [...sponsorPosts, newPost] });
    setImageUrl("");
    setCaption("");
    setLink("");
    toast.success("Sponsor post added");
  };

  const deletePost = (id: string) => {
    updateSettings({ sponsorPosts: sponsorPosts.filter((p) => p.id !== id) });
    toast.success("Sponsor post removed");
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-display font-semibold text-foreground mb-1">
          Sponsor Posters
        </h3>
        <p className="text-sm text-muted-foreground font-ui">
          Upload sponsor posters that will appear on the home page
        </p>
      </div>

      <Card className="border-border">
        <CardHeader className="pb-3">
          <CardTitle className="font-display text-base flex items-center gap-2">
            <Upload className="w-4 h-4 text-primary" />
            Add New Sponsor Post
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="sponsor-image" className="font-ui font-medium">
              Image URL *
            </Label>
            <Input
              id="sponsor-image"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://example.com/sponsor-banner.jpg"
              className="font-ui"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="sponsor-caption" className="font-ui font-medium">
              Caption
            </Label>
            <Input
              id="sponsor-caption"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Sponsor description or tagline"
              className="font-ui"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="sponsor-link" className="font-ui font-medium">
              Link URL
            </Label>
            <Input
              id="sponsor-link"
              value={link}
              onChange={(e) => setLink(e.target.value)}
              placeholder="https://sponsor-website.com"
              className="font-ui"
            />
          </div>

          {imageUrl && (
            <div className="border border-border rounded-lg overflow-hidden">
              <img
                src={imageUrl}
                alt="Preview"
                className="w-full h-32 object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='200'%3E%3Crect fill='%23f0f0f0' width='400' height='200'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' fill='%23999' font-size='14'%3EInvalid Image URL%3C/text%3E%3C/svg%3E";
                }}
              />
              {caption && (
                <p className="text-sm font-ui text-muted-foreground px-3 py-2">
                  {caption}
                </p>
              )}
            </div>
          )}

          <Button onClick={addPost} className="font-ui gap-2">
            <Upload className="w-4 h-4" />
            Add Sponsor Post
          </Button>
        </CardContent>
      </Card>

      {sponsorPosts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {sponsorPosts.map((post) => (
            <Card key={post.id} className="border-border overflow-hidden">
              <div className="relative">
                <img
                  src={post.imageUrl}
                  alt={post.caption || "Sponsor"}
                  className="w-full h-40 object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='200'%3E%3Crect fill='%23f0f0f0' width='400' height='200'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' fill='%23999' font-size='14'%3EImage not found%3C/text%3E%3C/svg%3E";
                  }}
                />
                <Badge className="absolute top-2 left-2 bg-primary/80 font-ui text-xs">
                  Sponsor
                </Badge>
              </div>
              <CardContent className="pt-3">
                {post.caption && (
                  <p className="font-ui text-sm text-foreground mb-1 line-clamp-2">
                    {post.caption}
                  </p>
                )}
                {post.link && (
                  <a
                    href={post.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-ui text-xs text-primary hover:underline block truncate mb-2"
                  >
                    {post.link}
                  </a>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => deletePost(post.id)}
                  className="font-ui text-xs gap-1.5 text-destructive border-destructive/30 hover:bg-destructive/5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Remove
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="py-12 text-center">
          <SvgCrown color="#94a3b8" size={32} />
          <div className="mt-2" />
          <p className="text-muted-foreground font-ui text-sm">
            No sponsor posts yet. Add your first one above.
          </p>
        </div>
      )}
    </div>
  );
}

// ── Analytics Tab ─────────────────────────────────────────────────────────────
function AnalyticsTab() {
  const { data: allHistories, isLoading } = useAllUserHistories();

  const totalUsers = allHistories ? allHistories.length : 0;

  const toolUsageCounts: Record<string, number> = {};
  if (allHistories) {
    for (const [, entries] of allHistories) {
      for (const entry of entries) {
        const tool = entry.toolName || "unknown";
        toolUsageCounts[tool] = (toolUsageCounts[tool] || 0) + 1;
      }
    }
  }
  const topTools = Object.entries(toolUsageCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);
  const maxCount = topTools.length > 0 ? topTools[0][1] : 1;
  const totalOps = Object.values(toolUsageCounts).reduce((a, b) => a + b, 0);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-display font-semibold text-foreground mb-1">
          System Analytics
        </h3>
        <p className="text-sm text-muted-foreground font-ui">
          Overview of users, operations, and tool usage
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          {
            label: "Total Users",
            value: isLoading ? "…" : String(totalUsers),
            color: "#3B8CE2",
            icon: <SvgUsers color="#3B8CE2" size={20} />,
          },
          {
            label: "Total Operations",
            value: isLoading ? "…" : String(totalOps),
            color: "#2DBD6E",
            icon: <SvgZapSmall color="#2DBD6E" size={20} />,
          },
          {
            label: "Tools Used",
            value: isLoading
              ? "…"
              : String(Object.keys(toolUsageCounts).length),
            color: "#9B3BE2",
            icon: <SvgSettings color="#9B3BE2" size={20} />,
          },
        ].map((stat) => (
          <Card key={stat.label} className="border-border">
            <CardContent className="pt-5">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-ui text-muted-foreground uppercase tracking-wider">
                  {stat.label}
                </p>
                {stat.icon}
              </div>
              <p
                className="font-display font-bold text-3xl"
                style={{ color: stat.color }}
              >
                {stat.value}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-border">
        <CardHeader className="pb-3">
          <CardTitle className="font-display text-base flex items-center gap-2">
            <SvgBarChart color="#E25C3B" size={16} />
            Top 5 Most Used Tools
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-sm text-muted-foreground font-ui">Loading…</p>
          ) : topTools.length === 0 ? (
            <p className="text-sm text-muted-foreground font-ui text-center py-6">
              No tool usage data yet
            </p>
          ) : (
            <div className="space-y-3">
              {topTools.map(([tool, count]) => (
                <div key={tool} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-ui text-foreground capitalize">
                      {tool}
                    </span>
                    <span className="font-bold text-primary font-ui">
                      {count} ops
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-primary transition-all duration-500"
                      style={{ width: `${(count / maxCount) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ── Subscriptions Tab ─────────────────────────────────────────────────────────
function SubscriptionsTab() {
  const DEMO_SUBS = [
    {
      user: "alice@example.com",
      plan: "Plus Monthly",
      status: "Active",
      start: "2025-12-01",
      amount: "$9.99",
    },
    {
      user: "bob@example.com",
      plan: "Plus Yearly",
      status: "Active",
      start: "2025-10-15",
      amount: "$79.99",
    },
    {
      user: "carol@example.com",
      plan: "Plus Monthly",
      status: "Cancelled",
      start: "2025-11-01",
      amount: "$9.99",
    },
    {
      user: "dave@example.com",
      plan: "Plus Yearly",
      status: "Active",
      start: "2026-01-01",
      amount: "$79.99",
    },
  ];
  const activeSubs = DEMO_SUBS.filter((s) => s.status === "Active").length;
  const mrr =
    DEMO_SUBS.filter((s) => s.status === "Active" && s.plan.includes("Monthly"))
      .length *
      9.99 +
    DEMO_SUBS.filter((s) => s.status === "Active" && s.plan.includes("Yearly"))
      .length *
      (79.99 / 12);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-display font-semibold text-foreground mb-1">
          Subscription Management
        </h3>
        <p className="text-sm text-muted-foreground font-ui">
          Subscription data synced via Stripe webhooks (demo data shown)
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Card className="border-border">
          <CardContent className="pt-5">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-ui text-muted-foreground uppercase tracking-wider">
                Monthly Recurring Revenue
              </p>
              <SvgZapSmall color="#8BE23B" size={18} />
            </div>
            <p className="font-display font-bold text-3xl text-primary">
              ${mrr.toFixed(2)}
            </p>
            <p className="text-xs text-muted-foreground font-ui mt-1">
              MRR (demo)
            </p>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardContent className="pt-5">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-ui text-muted-foreground uppercase tracking-wider">
                Active Subscriptions
              </p>
              <SvgUsers color="#2DBD6E" size={18} />
            </div>
            <p className="font-display font-bold text-3xl text-green-500">
              {activeSubs}
            </p>
            <p className="text-xs text-muted-foreground font-ui mt-1">
              of {DEMO_SUBS.length} total
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="border border-border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-muted/50 border-b border-border">
              {["User", "Plan", "Status", "Start Date", "Amount"].map((h) => (
                <th
                  key={h}
                  className="text-left py-2.5 px-4 font-ui text-xs font-semibold text-muted-foreground uppercase tracking-wider"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {DEMO_SUBS.map((sub) => (
              <tr
                key={sub.user}
                className="border-b border-border last:border-0 hover:bg-muted/20"
              >
                <td className="py-3 px-4 font-ui text-sm text-foreground">
                  {sub.user}
                </td>
                <td className="py-3 px-4 font-ui text-sm text-muted-foreground">
                  {sub.plan}
                </td>
                <td className="py-3 px-4">
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-ui font-medium ${
                      sub.status === "Active"
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-600"
                    }`}
                  >
                    {sub.status}
                  </span>
                </td>
                <td className="py-3 px-4 font-ui text-sm text-muted-foreground">
                  {sub.start}
                </td>
                <td className="py-3 px-4 font-ui text-sm font-medium text-foreground">
                  {sub.amount}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Tool Control Tab ──────────────────────────────────────────────────────────
const IMG_TOOLS_LIST = [
  "Compress Image",
  "Resize Image",
  "Crop Image",
  "Convert Image",
  "Rotate Image",
  "Watermark Image",
  "Image to PDF",
  "Remove Background",
  "Image Editor",
];

function ToolControlTab() {
  const { settings, updateSettings } = useAdminSettings();

  const [freeMaxMB, setFreeMaxMB] = useState<number>(
    settings.toolControlFreeMaxMB ?? 5,
  );
  const [plusMaxMB, setPlusMaxMB] = useState<number>(
    settings.toolControlPlusMaxMB ?? 200,
  );
  const [globalWatermark, setGlobalWatermark] = useState<boolean>(
    settings.toolControlGlobalWatermark ?? true,
  );
  const [watermarkText, setWatermarkText] = useState<string>(
    settings.toolControlWatermarkText ?? "Processed by PDFTools",
  );
  const [disabledTools, setDisabledTools] = useState<string[]>(
    settings.toolControlDisabledTools ?? [],
  );

  const toggleTool = (tool: string) => {
    setDisabledTools((prev) =>
      prev.includes(tool) ? prev.filter((t) => t !== tool) : [...prev, tool],
    );
  };

  const handleSave = () => {
    updateSettings({
      toolControlFreeMaxMB: freeMaxMB,
      toolControlPlusMaxMB: plusMaxMB,
      toolControlGlobalWatermark: globalWatermark,
      toolControlWatermarkText: watermarkText,
      toolControlDisabledTools: disabledTools,
    });
    toast.success("Tool control settings saved");
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-display font-semibold text-foreground mb-1">
          Tool Control
        </h3>
        <p className="text-sm text-muted-foreground font-ui">
          Configure file size limits, watermarks, and per-tool availability
        </p>
      </div>

      <Card className="border-border">
        <CardHeader className="pb-3">
          <CardTitle className="font-display text-base flex items-center gap-2">
            <SvgSettings color="#3B8CE2" size={16} />
            File Size Limits
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="free-max" className="font-ui font-medium text-sm">
                Free Plan Max (MB)
              </Label>
              <Input
                id="free-max"
                type="number"
                min={1}
                max={50}
                value={freeMaxMB}
                onChange={(e) => setFreeMaxMB(Number(e.target.value))}
                className="font-ui"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="plus-max" className="font-ui font-medium text-sm">
                Plus Plan Max (MB)
              </Label>
              <Input
                id="plus-max"
                type="number"
                min={10}
                max={500}
                value={plusMaxMB}
                onChange={(e) => setPlusMaxMB(Number(e.target.value))}
                className="font-ui"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border">
        <CardHeader className="pb-3">
          <CardTitle className="font-display text-base flex items-center gap-2">
            <SvgStamp color="#3BE2D4" size={16} />
            Watermark Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="font-ui font-medium text-sm">
                Global Watermark (Free users)
              </Label>
              <p className="text-xs text-muted-foreground font-ui mt-0.5">
                Adds watermark to all free-plan outputs
              </p>
            </div>
            <Switch
              checked={globalWatermark}
              onCheckedChange={setGlobalWatermark}
            />
          </div>
          {globalWatermark && (
            <div className="space-y-1.5">
              <Label className="font-ui font-medium text-sm">
                Watermark Text
              </Label>
              <Input
                value={watermarkText}
                onChange={(e) => setWatermarkText(e.target.value)}
                placeholder="Processed by PDFTools"
                className="font-ui"
              />
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border-border">
        <CardHeader className="pb-3">
          <CardTitle className="font-display text-base flex items-center gap-2">
            <SvgEye color="#3B8CE2" size={16} />
            Image Tool Availability
          </CardTitle>
          <CardDescription className="font-ui text-sm">
            Toggle individual image tools on or off
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {IMG_TOOLS_LIST.map((tool) => {
              const isDisabled = disabledTools.includes(tool);
              const ToolIcon = IMG_TOOL_SVG_ICONS[tool];
              const toolColor = IMG_TOOL_COLORS[tool] || "#E2A83B";
              return (
                <button
                  type="button"
                  key={tool}
                  onClick={() => toggleTool(tool)}
                  className={`flex items-center gap-3 p-3 rounded-lg border transition-all cursor-pointer w-full text-left ${
                    isDisabled
                      ? "border-border bg-muted/30 opacity-50"
                      : "border-border bg-card hover:border-primary/30"
                  }`}
                >
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: `${toolColor}18` }}
                  >
                    {ToolIcon ? (
                      <ToolIcon color={toolColor} size={16} />
                    ) : (
                      <SvgImage color={toolColor} size={16} />
                    )}
                  </div>
                  <span className="font-ui text-sm text-foreground flex-1">
                    {tool}
                  </span>
                  {isDisabled ? (
                    <SvgEyeOff color="#94a3b8" size={14} />
                  ) : (
                    <SvgEye color={toolColor} size={14} />
                  )}
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Button onClick={handleSave} className="font-ui gap-2">
        <Check className="w-4 h-4" />
        Save Tool Control Settings
      </Button>
    </div>
  );
}

// ── Broadcast Tab ─────────────────────────────────────────────────────────────
function BroadcastTab() {
  const { actor } = useActor();
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [platformStats, setPlatformStats] = useState<{
    totalUsers: number;
    totalCreators: number;
    totalProducts: number;
    totalAds: number;
    totalTips: number;
    totalComments: number;
  } | null>(null);

  useEffect(() => {
    async function loadStats() {
      if (!actor) return;
      try {
        if (typeof (actor as any).getPlatformStats === "function") {
          const stats = await (actor as any).getPlatformStats();
          if (stats) {
            setPlatformStats({
              totalUsers: Number(stats.totalUsers || 0),
              totalCreators: Number(stats.totalCreators || 0),
              totalProducts: Number(stats.totalProducts || 0),
              totalAds: Number(stats.totalAds || 0),
              totalTips: Number(stats.totalTips || 0),
              totalComments: Number(stats.totalComments || 0),
            });
          }
        }
      } catch {}
    }
    loadStats();
  }, [actor]);

  const handleBroadcast = async () => {
    if (!title.trim() || !message.trim()) {
      toast.error("Please fill in both title and message");
      return;
    }
    setIsSending(true);
    try {
      if (actor && typeof (actor as any).broadcastNotification === "function") {
        await (actor as any).broadcastNotification(
          title.trim(),
          message.trim(),
        );
        toast.success("Broadcast sent to all users!");
        setTitle("");
        setMessage("");
      } else {
        toast.error("Broadcast not available");
      }
    } catch {
      toast.error("Failed to send broadcast");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-display font-semibold text-foreground mb-1">
          Broadcast & Platform Stats
        </h3>
        <p className="text-sm text-muted-foreground font-ui">
          Send notifications to all users and view platform statistics
        </p>
      </div>

      {platformStats && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[
            {
              label: "Total Users",
              value: platformStats.totalUsers,
              color: "#3B8CE2",
            },
            {
              label: "Creators",
              value: platformStats.totalCreators,
              color: "#2DBD6E",
            },
            {
              label: "Products",
              value: platformStats.totalProducts,
              color: "#E2A83B",
            },
            {
              label: "Active Ads",
              value: platformStats.totalAds,
              color: "#E25C3B",
            },
            {
              label: "Tips Sent",
              value: platformStats.totalTips,
              color: "#9B3BE2",
            },
            {
              label: "Comments",
              value: platformStats.totalComments,
              color: "#3BE2D4",
            },
          ].map((stat) => (
            <Card key={stat.label} className="border-border">
              <CardContent className="p-3">
                <p
                  className="font-display font-bold text-xl"
                  style={{ color: stat.color }}
                >
                  {stat.value.toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground font-ui">
                  {stat.label}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Card className="border-border">
        <CardHeader className="pb-3">
          <CardTitle className="font-display text-base flex items-center gap-2">
            <Megaphone className="w-4 h-4 text-primary" />
            Send Broadcast Notification
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label className="font-ui font-medium text-sm">Title</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Important announcement"
              className="font-ui"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="font-ui font-medium text-sm">Message</Label>
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Your message to all users..."
              className="font-ui text-sm"
              rows={4}
            />
          </div>
          <Button
            onClick={handleBroadcast}
            disabled={!title.trim() || !message.trim() || isSending}
            className="font-ui gap-2"
          >
            {isSending ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Megaphone className="w-4 h-4" />
            )}
            Broadcast to All Users
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

// ── Tab definitions with colored SVG icons ────────────────────────────────────
const ADMIN_TABS = [
  {
    value: "services",
    label: "Services",
    icon: <SvgEye color="#3B8CE2" size={14} />,
  },
  {
    value: "theme",
    label: "Theme",
    icon: <SvgPalette color="#9B3BE2" size={14} />,
  },
  {
    value: "header",
    label: "Header",
    icon: <SvgHeader color="#2DBD6E" size={14} />,
  },
  {
    value: "footer",
    label: "Footer",
    icon: <SvgFooter color="#3BE2D4" size={14} />,
  },
  {
    value: "users",
    label: "Users",
    icon: <SvgUsers color="#E2A83B" size={14} />,
  },
  {
    value: "sponsors",
    label: "Sponsors",
    icon: <SvgCrown color="#E2C93B" size={14} />,
  },
  {
    value: "analytics",
    label: "Analytics",
    icon: <SvgBarChart color="#E25C3B" size={14} />,
  },
  {
    value: "subscriptions",
    label: "Subs",
    icon: <SvgZap color="#8BE23B" size={14} />,
  },
  {
    value: "toolcontrol",
    label: "Tools",
    icon: <SvgSettings color="#3B8CE2" size={14} />,
  },
  {
    value: "broadcast",
    label: "Broadcast",
    icon: <Megaphone className="w-3.5 h-3.5" style={{ color: "#E23B9B" }} />,
  },
] as const;

// ── Main Admin Dashboard ──────────────────────────────────────────────────────
export function AdminPage() {
  const [adminAuthenticated, setAdminAuthenticated] = useState(false);
  const { isInitializing } = useInternetIdentity();

  if (isInitializing) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center space-y-2">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-muted-foreground font-ui">Loading…</p>
        </div>
      </div>
    );
  }

  if (!adminAuthenticated) {
    return <AdminLoginGate onSuccess={() => setAdminAuthenticated(true)} />;
  }

  return (
    <main className="container max-w-5xl py-8">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {/* Page header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <SvgSettingsLarge color="#E25C3B" size={20} />
            </div>
            <div>
              <h1 className="font-display font-bold text-2xl text-foreground">
                Admin Dashboard
              </h1>
              <p className="text-sm text-muted-foreground font-ui">
                Manage site settings, users, and content
              </p>
            </div>
          </div>
        </div>

        {/* Dashboard tabs */}
        <Tabs defaultValue="services" className="space-y-6">
          <TabsList className="grid grid-cols-3 sm:grid-cols-10 h-auto gap-1 bg-muted p-1 rounded-xl">
            {ADMIN_TABS.map((tab) => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className="font-ui text-xs flex items-center gap-1.5 data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-lg py-2"
              >
                {tab.icon}
                <span className="hidden sm:inline">{tab.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="services">
            <Card className="border-border">
              <CardContent className="pt-6">
                <ServicesTab />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="theme">
            <Card className="border-border">
              <CardContent className="pt-6">
                <ThemeTab />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="header">
            <Card className="border-border">
              <CardContent className="pt-6">
                <HeaderTab />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="footer">
            <Card className="border-border">
              <CardContent className="pt-6">
                <FooterTab />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users">
            <Card className="border-border">
              <CardContent className="pt-6">
                <UsersTab />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sponsors">
            <Card className="border-border">
              <CardContent className="pt-6">
                <SponsorsTab />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics">
            <Card className="border-border">
              <CardContent className="pt-6">
                <AnalyticsTab />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="subscriptions">
            <Card className="border-border">
              <CardContent className="pt-6">
                <SubscriptionsTab />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="toolcontrol">
            <Card className="border-border">
              <CardContent className="pt-6">
                <ToolControlTab />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="broadcast">
            <Card className="border-border">
              <CardContent className="pt-6">
                <BroadcastTab />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </main>
  );
}
