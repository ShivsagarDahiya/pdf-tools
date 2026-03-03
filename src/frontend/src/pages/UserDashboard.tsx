import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { usePlatformRole } from "@/contexts/PlatformRoleContext";
import { Link } from "@tanstack/react-router";
import {
  BarChart3,
  Bell,
  Bookmark,
  Crown,
  Download,
  ExternalLink,
  FileText,
  Heart,
  History,
  Home,
  LogOut,
  Mail,
  Menu,
  QrCode,
  Search,
  Settings,
  Share2,
  ShoppingBag,
  Star,
  TrendingUp,
  UserCheck,
  Users,
  X,
  Zap,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

interface ImgHistoryEntry {
  tool: string;
  file: string;
  output: string;
  date: string;
}

function getUserPlan(): "free" | "plus" {
  return (localStorage.getItem("userPlan") as "free" | "plus") || "free";
}

function getDailyUsage(): number {
  const today = new Date().toDateString();
  const savedDate = localStorage.getItem("dailyUsageDate");
  if (savedDate !== today) {
    localStorage.setItem("dailyUsageDate", today);
    localStorage.setItem("dailyUsage", "0");
    return 0;
  }
  return Number.parseInt(localStorage.getItem("dailyUsage") || "0");
}

function getImgHistory(): ImgHistoryEntry[] {
  try {
    return JSON.parse(localStorage.getItem("imgHistory") || "[]");
  } catch {
    return [];
  }
}

function downloadCSV(history: ImgHistoryEntry[]) {
  const header = "Tool,Input File,Output File,Date";
  const rows = history.map(
    (h) => `"${h.tool}","${h.file}","${h.output}","${h.date}"`,
  );
  const csv = [header, ...rows].join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "processing_history.csv";
  a.click();
  URL.revokeObjectURL(url);
}

const ROLE_BADGE_CONFIG: Record<
  string,
  { label: string; color: string; bg: string }
> = {
  creator: { label: "Creator", color: "#3B8CE2", bg: "#EBF3FF" },
  plus: { label: "Plus", color: "#E2A83B", bg: "#FFFBEB" },
  admin: { label: "Admin", color: "#E25C3B", bg: "#FFF0EC" },
};

const SIDEBAR_ITEMS = [
  { icon: Home, label: "Dashboard Overview", path: "/dashboard", active: true },
  { icon: ShoppingBag, label: "Explore Projects", path: "/marketplace" },
  { icon: Download, label: "My Downloads", path: "/dashboard" },
  { icon: Bookmark, label: "Saved Items", path: "/dashboard" },
  { icon: UserCheck, label: "Following Creators", path: "/marketplace" },
  { icon: Mail, label: "Messages", path: "/notifications" },
  { icon: FileText, label: "My Storage (PDF/Image)", path: "/dashboard" },
  { icon: Crown, label: "Premium Upgrade", path: "/upgrade" },
  { icon: Settings, label: "Settings", path: "/profile" },
];

const STATIC_PROJECTS = [
  {
    id: 1,
    title: "Full-Stack React Dashboard Template",
    creator: "Alex Rivera",
    avatar: "AR",
    rating: 4.8,
    downloads: 2340,
    category: "Technology",
    liked: false,
    starred: false,
  },
  {
    id: 2,
    title: "MBA Finance Project Report",
    creator: "Priya Sharma",
    avatar: "PS",
    rating: 4.6,
    downloads: 1820,
    category: "Business",
    liked: true,
    starred: false,
  },
  {
    id: 3,
    title: "UX Design Portfolio Kit",
    creator: "Jordan Lee",
    avatar: "JL",
    rating: 4.9,
    downloads: 3100,
    category: "Design",
    liked: false,
    starred: true,
  },
];

const RECOMMENDED_PROJECTS = [
  {
    id: 4,
    title: "Python ML Starter Pack",
    creator: "Sam Patel",
    avatar: "SP",
    rating: 4.7,
    downloads: 1500,
    category: "Technology",
    following: false,
  },
  {
    id: 5,
    title: "Digital Marketing Playbook",
    creator: "Maria Chen",
    avatar: "MC",
    rating: 4.5,
    downloads: 980,
    category: "Business",
    following: false,
  },
  {
    id: 6,
    title: "Resume & CV Premium Bundle",
    creator: "David Kim",
    avatar: "DK",
    rating: 4.8,
    downloads: 4200,
    category: "Education",
    following: true,
  },
];

const TRENDING_CREATORS = [
  {
    id: 1,
    name: "Alex Rivera",
    category: "Full-Stack Dev",
    followers: 8400,
    avatar: "AR",
    color: "#3B8CE2",
  },
  {
    id: 2,
    name: "Priya Sharma",
    category: "MBA & Finance",
    followers: 5200,
    avatar: "PS",
    color: "#E25C3B",
  },
  {
    id: 3,
    name: "Jordan Lee",
    category: "UI/UX Design",
    followers: 12100,
    avatar: "JL",
    color: "#2DBD6E",
  },
  {
    id: 4,
    name: "Maria Chen",
    category: "Digital Marketing",
    followers: 3800,
    avatar: "MC",
    color: "#9B3BE2",
  },
];

const ADS_BANNERS = [
  {
    id: 1,
    title: "Upgrade to Plus — Unlimited Everything",
    subtitle: "Remove watermarks, unlimited batch processing, priority support",
    cta: "Get Plus for $9.99/mo",
    gradient: "from-violet-600 via-purple-600 to-indigo-600",
    path: "/upgrade",
  },
  {
    id: 2,
    title: "PhoneBaba Image Tools",
    subtitle: "Professional image editing, compression, and conversion suite",
    cta: "Explore Tools →",
    gradient: "from-cyan-500 via-blue-500 to-indigo-500",
    path: "/",
  },
];

export function UserDashboard() {
  const plan = getUserPlan();
  const dailyUsage = getDailyUsage();
  const dailyLimit = plan === "plus" ? Number.POSITIVE_INFINITY : 20;
  const history = getImgHistory();
  const { platformRole } = usePlatformRole();
  const roleBadge =
    platformRole !== "free" ? ROLE_BADGE_CONFIG[platformRole] : null;

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [likedProjects, setLikedProjects] = useState<Set<number>>(new Set([2]));
  const [starredProjects, setStarredProjects] = useState<Set<number>>(
    new Set([3]),
  );
  const [followingCreators, setFollowingCreators] = useState<Set<number>>(
    new Set([3]),
  );
  const [followingRecommended, setFollowingRecommended] = useState<Set<number>>(
    new Set([3]),
  );
  const [showQrModal, setShowQrModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const toolCounts: Record<string, number> = {};
  for (const h of history) {
    toolCounts[h.tool] = (toolCounts[h.tool] || 0) + 1;
  }
  const topTools = Object.entries(toolCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const toggleLike = (id: number) => {
    setLikedProjects((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleStar = (id: number) => {
    setStarredProjects((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleFollow = (id: number) => {
    setFollowingCreators((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleRecommendedFollow = (id: number) => {
    setFollowingRecommended((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-violet-50/20 flex">
      {/* Desktop Sidebar */}
      <AnimatePresence initial={false}>
        <motion.aside
          animate={{ width: sidebarOpen ? 256 : 72 }}
          transition={{ duration: 0.25, ease: "easeInOut" }}
          className="hidden md:flex flex-col bg-white border-r border-slate-200 shadow-sm relative z-10 overflow-hidden"
          style={{ minHeight: "100vh", flexShrink: 0 }}
        >
          {/* Sidebar Header */}
          <div className="flex items-center gap-3 px-4 py-5 border-b border-slate-100">
            <button
              type="button"
              onClick={() => setSidebarOpen((v) => !v)}
              className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors flex-shrink-0"
            >
              <Menu className="w-4 h-4 text-slate-600" />
            </button>
            <AnimatePresence>
              {sidebarOpen && (
                <motion.div
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -8 }}
                  transition={{ duration: 0.15 }}
                  className="font-bold text-slate-800 text-sm whitespace-nowrap overflow-hidden"
                >
                  User Dashboard
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Nav Items */}
          <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
            {SIDEBAR_ITEMS.map((item) => (
              <Link
                key={item.label}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group relative ${
                  item.active
                    ? "bg-violet-600 text-white shadow-sm"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                <item.icon className="w-4 h-4 flex-shrink-0" />
                <AnimatePresence>
                  {sidebarOpen && (
                    <motion.span
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -8 }}
                      transition={{ duration: 0.15 }}
                      className="text-sm font-medium whitespace-nowrap overflow-hidden"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </Link>
            ))}
          </nav>

          {/* Logout */}
          <div className="p-2 border-t border-slate-100">
            <Link
              to="/"
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-red-500 hover:bg-red-50 transition-all"
            >
              <LogOut className="w-4 h-4 flex-shrink-0" />
              <AnimatePresence>
                {sidebarOpen && (
                  <motion.span
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -8 }}
                    transition={{ duration: 0.15 }}
                    className="text-sm font-medium whitespace-nowrap"
                  >
                    Logout
                  </motion.span>
                )}
              </AnimatePresence>
            </Link>
          </div>
        </motion.aside>
      </AnimatePresence>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 z-40 md:hidden"
              onClick={() => setSidebarOpen(false)}
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ duration: 0.25 }}
              className="fixed left-0 top-0 bottom-0 w-64 bg-white shadow-2xl z-50 md:hidden flex flex-col"
            >
              <div className="flex items-center justify-between px-4 py-5 border-b border-slate-100">
                <span className="font-bold text-slate-800">User Dashboard</span>
                <button
                  type="button"
                  onClick={() => setSidebarOpen(false)}
                  className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center"
                >
                  <X className="w-4 h-4 text-slate-600" />
                </button>
              </div>
              <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
                {SIDEBAR_ITEMS.map((item) => (
                  <Link
                    key={item.label}
                    to={item.path}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
                      item.active
                        ? "bg-violet-600 text-white"
                        : "text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    <item.icon className="w-4 h-4 flex-shrink-0" />
                    <span className="text-sm font-medium">{item.label}</span>
                  </Link>
                ))}
              </nav>
              <div className="p-2 border-t border-slate-100">
                <Link
                  to="/"
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-red-500 hover:bg-red-50"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="text-sm font-medium">Logout</span>
                </Link>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header Bar */}
        <div className="bg-white/80 backdrop-blur-md border-b border-slate-200 px-4 md:px-6 py-3 flex items-center gap-3 sticky top-0 z-10">
          <button
            type="button"
            onClick={() => setSidebarOpen((v) => !v)}
            className="md:hidden w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center"
          >
            <Menu className="w-4 h-4 text-slate-600" />
          </button>

          {/* Search */}
          <div className="flex-1 max-w-md relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search tools, projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-100 rounded-xl text-sm border-0 outline-none focus:ring-2 focus:ring-violet-500/30 transition-all"
            />
          </div>

          <div className="flex items-center gap-2 ml-auto">
            <button
              type="button"
              className="relative w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition-colors"
            >
              <Bell className="w-4 h-4 text-slate-600" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
            </button>
            <div className="flex items-center gap-2">
              <Avatar className="w-8 h-8">
                <AvatarImage
                  src={localStorage.getItem("userProfilePic") || ""}
                />
                <AvatarFallback className="bg-violet-100 text-violet-700 text-xs font-bold">
                  U
                </AvatarFallback>
              </Avatar>
              {roleBadge && (
                <Badge
                  className="font-ui text-xs border-0 hidden sm:inline-flex"
                  style={{
                    backgroundColor: roleBadge.bg,
                    color: roleBadge.color,
                  }}
                >
                  {roleBadge.label}
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-4 md:p-6 space-y-6 max-w-6xl">
            {/* Page Title */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <h1 className="text-2xl font-bold text-slate-900">
                Welcome back! 👋
              </h1>
              <p className="text-slate-500 text-sm mt-1">
                Here's what's happening with your account today.
              </p>
            </motion.div>

            {/* Stats Row */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.05 }}
              className="grid grid-cols-2 lg:grid-cols-4 gap-4"
            >
              {[
                {
                  label: "Total Downloads",
                  value: "142",
                  icon: Download,
                  color: "text-blue-600",
                  bg: "bg-blue-50",
                  trend: "+12 this week",
                },
                {
                  label: "Followed Creators",
                  value: "28",
                  icon: UserCheck,
                  color: "text-violet-600",
                  bg: "bg-violet-50",
                  trend: "+3 this month",
                },
                {
                  label: "Saved Items",
                  value: "67",
                  icon: Bookmark,
                  color: "text-amber-600",
                  bg: "bg-amber-50",
                  trend: "5 new today",
                },
                {
                  label: "Notifications",
                  value: "5",
                  icon: Bell,
                  color: "text-red-500",
                  bg: "bg-red-50",
                  trend: "3 unread",
                },
              ].map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.1 + i * 0.05 }}
                >
                  <Card className="border-0 shadow-sm bg-white/80 backdrop-blur-sm">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div
                          className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center`}
                        >
                          <stat.icon className={`w-5 h-5 ${stat.color}`} />
                        </div>
                        <TrendingUp className="w-4 h-4 text-green-500" />
                      </div>
                      <p className="text-2xl font-bold text-slate-900">
                        {stat.value}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {stat.label}
                      </p>
                      <p className="text-xs text-green-600 mt-1 font-medium">
                        {stat.trend}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>

            {/* Ads Banners */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="grid grid-cols-1 sm:grid-cols-2 gap-4"
            >
              {ADS_BANNERS.map((ad) => (
                <div
                  key={ad.id}
                  className={`bg-gradient-to-r ${ad.gradient} rounded-2xl p-5 text-white relative overflow-hidden`}
                >
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(255,255,255,0.15),transparent_60%)]" />
                  <div className="relative z-10">
                    <p className="font-bold text-base mb-1">{ad.title}</p>
                    <p className="text-white/80 text-xs mb-4">{ad.subtitle}</p>
                    <Link to={ad.path}>
                      <Button
                        size="sm"
                        className="bg-white/20 hover:bg-white/30 text-white border border-white/30 backdrop-blur-sm font-medium text-xs h-8"
                      >
                        {ad.cta}
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </motion.div>

            {/* Recently Viewed Projects */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.25 }}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <History className="w-4 h-4 text-violet-600" />
                  Recently Viewed Projects
                </h2>
                <Link
                  to="/marketplace"
                  className="text-violet-600 text-xs font-medium hover:underline flex items-center gap-1"
                >
                  View all <ExternalLink className="w-3 h-3" />
                </Link>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {STATIC_PROJECTS.map((project, i) => (
                  <motion.div
                    key={project.id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.3 + i * 0.05 }}
                  >
                    <Card className="border-0 shadow-sm bg-white/80 backdrop-blur-sm hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3 mb-3">
                          <Avatar className="w-9 h-9 flex-shrink-0">
                            <AvatarFallback className="bg-gradient-to-br from-violet-500 to-indigo-600 text-white text-xs font-bold">
                              {project.avatar}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-slate-900 line-clamp-2 leading-snug">
                              {project.title}
                            </p>
                            <p className="text-xs text-slate-500 mt-0.5">
                              by {project.creator}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-1">
                            <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                            <span className="text-xs font-medium text-slate-700">
                              {project.rating}
                            </span>
                          </div>
                          <div className="flex items-center gap-1 text-xs text-slate-500">
                            <Download className="w-3 h-3" />
                            {project.downloads.toLocaleString()}
                          </div>
                          <Badge
                            variant="secondary"
                            className="text-xs px-2 py-0"
                          >
                            {project.category}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => toggleLike(project.id)}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                              likedProjects.has(project.id)
                                ? "bg-red-50 text-red-600"
                                : "bg-slate-100 text-slate-600 hover:bg-red-50 hover:text-red-600"
                            }`}
                          >
                            <Heart
                              className={`w-3.5 h-3.5 ${likedProjects.has(project.id) ? "fill-red-500" : ""}`}
                            />
                            Like
                          </button>
                          <button
                            type="button"
                            onClick={() => toggleStar(project.id)}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                              starredProjects.has(project.id)
                                ? "bg-amber-50 text-amber-600"
                                : "bg-slate-100 text-slate-600 hover:bg-amber-50 hover:text-amber-600"
                            }`}
                          >
                            <Star
                              className={`w-3.5 h-3.5 ${starredProjects.has(project.id) ? "fill-amber-400" : ""}`}
                            />
                            Star
                          </button>
                          <button
                            type="button"
                            className="ml-auto p-1.5 rounded-lg bg-slate-100 hover:bg-blue-50 text-slate-600 hover:text-blue-600 transition-all"
                          >
                            <Share2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Recommended Projects */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.3 }}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-violet-600" />
                  Recommended Projects
                </h2>
                <Link
                  to="/marketplace"
                  className="text-violet-600 text-xs font-medium hover:underline flex items-center gap-1"
                >
                  Browse all <ExternalLink className="w-3 h-3" />
                </Link>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {RECOMMENDED_PROJECTS.map((project, i) => (
                  <motion.div
                    key={project.id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.35 + i * 0.05 }}
                  >
                    <Card className="border-0 shadow-sm bg-white/80 backdrop-blur-sm hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3 mb-3">
                          <Avatar className="w-9 h-9 flex-shrink-0">
                            <AvatarFallback className="bg-gradient-to-br from-cyan-500 to-blue-600 text-white text-xs font-bold">
                              {project.avatar}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-semibold text-slate-900 line-clamp-2 leading-snug">
                              {project.title}
                            </p>
                            <p className="text-xs text-slate-500 mt-0.5">
                              by {project.creator}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-1">
                            <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                            <span className="text-xs font-medium text-slate-700">
                              {project.rating}
                            </span>
                          </div>
                          <Badge
                            variant="secondary"
                            className="text-xs px-2 py-0"
                          >
                            {project.category}
                          </Badge>
                        </div>
                        <button
                          type="button"
                          onClick={() => toggleRecommendedFollow(project.id)}
                          className={`w-full py-2 rounded-lg text-xs font-semibold transition-all ${
                            followingRecommended.has(project.id)
                              ? "bg-violet-600 text-white"
                              : "bg-slate-100 text-slate-700 hover:bg-violet-50 hover:text-violet-700"
                          }`}
                        >
                          {followingRecommended.has(project.id)
                            ? "Following ✓"
                            : "+ Follow Creator"}
                        </button>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Trending Creators */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.35 }}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Users className="w-4 h-4 text-violet-600" />
                  Trending Creators
                </h2>
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {TRENDING_CREATORS.map((creator, i) => (
                  <motion.div
                    key={creator.id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.4 + i * 0.05 }}
                  >
                    <Card className="border-0 shadow-sm bg-white/80 backdrop-blur-sm text-center hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <Avatar className="w-12 h-12 mx-auto mb-2">
                          <AvatarFallback
                            className="text-white text-sm font-bold"
                            style={{ backgroundColor: creator.color }}
                          >
                            {creator.avatar}
                          </AvatarFallback>
                        </Avatar>
                        <p className="text-sm font-semibold text-slate-900 leading-tight">
                          {creator.name}
                        </p>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {creator.category}
                        </p>
                        <p className="text-xs font-medium text-slate-600 mt-1">
                          {creator.followers.toLocaleString()} followers
                        </p>
                        <button
                          type="button"
                          onClick={() => toggleFollow(creator.id)}
                          className={`w-full mt-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                            followingCreators.has(creator.id)
                              ? "bg-violet-600 text-white"
                              : "bg-slate-100 text-slate-700 hover:bg-violet-50 hover:text-violet-700"
                          }`}
                        >
                          {followingCreators.has(creator.id)
                            ? "Following"
                            : "Follow"}
                        </button>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Share / QR Section */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.4 }}
            >
              <Card className="border-0 shadow-sm bg-gradient-to-r from-indigo-50 to-violet-50 border border-violet-100">
                <CardContent className="p-5 flex items-center justify-between flex-wrap gap-4">
                  <div>
                    <h3 className="font-bold text-slate-900 mb-1">
                      Share Your Profile
                    </h3>
                    <p className="text-xs text-slate-500">
                      Share via social media or generate a QR code
                    </p>
                  </div>
                  <div className="flex items-center gap-3 flex-wrap">
                    <a
                      href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.origin)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Button
                        size="sm"
                        variant="outline"
                        className="gap-2 text-xs bg-white border-slate-200"
                      >
                        <Share2 className="w-3.5 h-3.5" />
                        Share
                      </Button>
                    </a>
                    <Dialog open={showQrModal} onOpenChange={setShowQrModal}>
                      <DialogTrigger asChild>
                        <Button
                          size="sm"
                          className="gap-2 text-xs bg-violet-600 hover:bg-violet-700 text-white"
                        >
                          <QrCode className="w-3.5 h-3.5" />
                          Generate QR Code
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-sm">
                        <DialogHeader>
                          <DialogTitle>Your QR Code</DialogTitle>
                        </DialogHeader>
                        <div className="flex flex-col items-center py-6">
                          <div className="w-48 h-48 bg-slate-100 rounded-xl flex items-center justify-center border-2 border-dashed border-slate-300 mb-4">
                            <div className="text-center">
                              <QrCode className="w-16 h-16 text-slate-400 mx-auto mb-2" />
                              <p className="text-xs text-slate-400">
                                QR for {window.location.origin}
                              </p>
                            </div>
                          </div>
                          <p className="text-sm text-slate-600 text-center">
                            Scan to visit your profile and shared tools
                          </p>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* My Usage Section (existing localStorage data) */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.45 }}
              className="space-y-4"
            >
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-violet-600" />
                My Usage
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Plan Card */}
                <Card
                  className={`border-0 shadow-sm ${plan === "plus" ? "bg-amber-50" : "bg-white/80"}`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center ${plan === "plus" ? "bg-amber-100" : "bg-slate-100"}`}
                      >
                        <Crown
                          className={`w-4 h-4 ${plan === "plus" ? "text-amber-500" : "text-slate-500"}`}
                        />
                      </div>
                      <Badge
                        className={`text-xs ${plan === "plus" ? "bg-amber-500 text-white border-0" : ""}`}
                        variant={plan === "free" ? "secondary" : "default"}
                      >
                        {plan === "plus" ? "Plus" : "Free"}
                      </Badge>
                    </div>
                    <p className="font-bold text-xl text-slate-900">
                      {plan === "plus" ? "Plus Plan" : "Free Plan"}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {plan === "plus"
                        ? "All features unlocked"
                        : "Limited to 20 ops/day"}
                    </p>
                    {plan === "free" && (
                      <Link to="/upgrade" className="block mt-3">
                        <Button
                          size="sm"
                          variant="outline"
                          className="w-full text-xs border-amber-300 text-amber-600 hover:bg-amber-50"
                        >
                          Upgrade $9.99/mo
                        </Button>
                      </Link>
                    )}
                  </CardContent>
                </Card>

                {/* Daily Usage */}
                <Card className="border-0 shadow-sm bg-white/80">
                  <CardContent className="p-4">
                    <div className="w-9 h-9 rounded-xl bg-blue-100 flex items-center justify-center mb-2">
                      <Zap className="w-4 h-4 text-blue-500" />
                    </div>
                    <p className="font-bold text-xl text-slate-900">
                      {dailyUsage}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {plan === "plus"
                        ? "Unlimited today"
                        : `of ${dailyLimit} today`}
                    </p>
                    {plan === "free" && (
                      <Progress
                        value={(dailyUsage / dailyLimit) * 100}
                        className="h-1.5 mt-2"
                      />
                    )}
                  </CardContent>
                </Card>

                {/* Total Operations */}
                <Card className="border-0 shadow-sm bg-white/80">
                  <CardContent className="p-4">
                    <div className="w-9 h-9 rounded-xl bg-green-100 flex items-center justify-center mb-2">
                      <BarChart3 className="w-4 h-4 text-green-500" />
                    </div>
                    <p className="font-bold text-xl text-slate-900">
                      {history.length}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Total operations
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Top Tools */}
              {topTools.length > 0 && (
                <Card className="border-0 shadow-sm bg-white/80">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-bold text-slate-900">
                      Most Used Tools
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {topTools.map(([tool, count]) => (
                      <div key={tool} className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-700">{tool}</span>
                          <span className="font-bold text-violet-600">
                            {count}
                          </span>
                        </div>
                        <Progress
                          value={(count / topTools[0][1]) * 100}
                          className="h-1.5"
                        />
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* History Table */}
              <Card className="border-0 shadow-sm bg-white/80">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <History className="w-4 h-4 text-violet-600" />
                      Processing History
                    </CardTitle>
                    {history.length > 0 && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs gap-1.5"
                        onClick={() => downloadCSV(history)}
                      >
                        <Download className="w-3.5 h-3.5" />
                        Export CSV
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {history.length === 0 ? (
                    <div className="py-8 text-center">
                      <History className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                      <p className="text-slate-500 text-sm">
                        No processing history yet.
                      </p>
                      <Link to="/img-compress">
                        <Button
                          variant="outline"
                          className="mt-3 text-xs"
                          size="sm"
                        >
                          Try Compress Image
                        </Button>
                      </Link>
                    </div>
                  ) : (
                    <div className="overflow-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-slate-100">
                            <th className="text-left py-2 px-3 text-xs text-slate-400 uppercase tracking-wider font-medium">
                              Tool
                            </th>
                            <th className="text-left py-2 px-3 text-xs text-slate-400 uppercase tracking-wider font-medium">
                              File
                            </th>
                            <th className="text-left py-2 px-3 text-xs text-slate-400 uppercase tracking-wider font-medium hidden sm:table-cell">
                              Date
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {history
                            .slice()
                            .reverse()
                            .map((h, i) => (
                              <tr
                                key={`${h.tool}-${h.date}-${i}`}
                                className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50"
                              >
                                <td className="py-2 px-3">
                                  <Badge
                                    variant="secondary"
                                    className="text-xs"
                                  >
                                    {h.tool}
                                  </Badge>
                                </td>
                                <td className="py-2 px-3 text-xs text-slate-700 max-w-[140px] truncate">
                                  {h.file}
                                </td>
                                <td className="py-2 px-3 text-xs text-slate-400 hidden sm:table-cell">
                                  {h.date}
                                </td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            <Separator />

            <div className="flex items-center justify-between text-sm text-slate-500 pb-6">
              <Link
                to="/profile"
                className="flex items-center gap-2 hover:text-slate-900 transition-colors"
              >
                <Settings className="w-4 h-4" />
                Manage Profile
              </Link>
              <Link to="/" className="hover:text-slate-900 transition-colors">
                Back to Home →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
