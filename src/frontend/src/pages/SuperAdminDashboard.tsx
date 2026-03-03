import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Link } from "@tanstack/react-router";
import {
  Activity,
  AlertTriangle,
  Archive,
  BarChart3,
  Bell,
  ChevronDown,
  ChevronRight,
  Crown,
  Database,
  DollarSign,
  FileText,
  HardDrive,
  Home,
  Lock,
  LogOut,
  Megaphone,
  Menu,
  MessageSquare,
  Package,
  RefreshCw,
  Settings,
  Shield,
  Sliders,
  Star,
  Trash2,
  TrendingUp,
  User,
  UserCheck,
  UserMinus,
  UserPlus,
  Users,
  X,
  Zap,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";

const USERS_DATA = [
  {
    id: 1,
    name: "Rahul Mehta",
    email: "rahul@example.com",
    role: "free",
    status: "Active",
    joined: "Jan 5, 2026",
    avatar: "RM",
    color: "#3B8CE2",
  },
  {
    id: 2,
    name: "Sneha Gupta",
    email: "sneha@design.co",
    role: "creator",
    status: "Active",
    joined: "Jan 12, 2026",
    avatar: "SG",
    color: "#E25C3B",
  },
  {
    id: 3,
    name: "Carlos Diaz",
    email: "carlos@techbiz.io",
    role: "plus",
    status: "Active",
    joined: "Jan 18, 2026",
    avatar: "CD",
    color: "#2DBD6E",
  },
  {
    id: 4,
    name: "Yuki Tanaka",
    email: "yuki@studio.jp",
    role: "creator",
    status: "Suspended",
    joined: "Jan 22, 2026",
    avatar: "YT",
    color: "#9B3BE2",
  },
  {
    id: 5,
    name: "Aisha Okafor",
    email: "aisha@marketing.ng",
    role: "free",
    status: "Active",
    joined: "Feb 1, 2026",
    avatar: "AO",
    color: "#E2A83B",
  },
  {
    id: 6,
    name: "Dmitri Volkov",
    email: "dmitri@dev.ru",
    role: "plus",
    status: "Active",
    joined: "Feb 5, 2026",
    avatar: "DV",
    color: "#3B8CE2",
  },
  {
    id: 7,
    name: "Fatima Al-Hassan",
    email: "fatima@edu.sa",
    role: "creator",
    status: "Active",
    joined: "Feb 9, 2026",
    avatar: "FA",
    color: "#E25C3B",
  },
  {
    id: 8,
    name: "James Wilson",
    email: "james@finance.uk",
    role: "free",
    status: "Suspended",
    joined: "Feb 14, 2026",
    avatar: "JW",
    color: "#2DBD6E",
  },
  {
    id: 9,
    name: "Priya Patel",
    email: "priya@startup.in",
    role: "plus",
    status: "Active",
    joined: "Feb 19, 2026",
    avatar: "PP",
    color: "#9B3BE2",
  },
  {
    id: 10,
    name: "Luis Torres",
    email: "luis@agency.mx",
    role: "creator",
    status: "Active",
    joined: "Feb 24, 2026",
    avatar: "LT",
    color: "#E2A83B",
  },
];

const ADS_DATA = [
  {
    id: 1,
    title: "PhoneBaba Pro — 50% Off",
    business: "PhoneBaba Inc.",
    status: "Active",
    clicks: 2840,
    created: "Feb 15, 2026",
  },
  {
    id: 2,
    title: "Learn React in 30 Days",
    business: "CodeCamp Ltd.",
    status: "Pending",
    clicks: 0,
    created: "Feb 24, 2026",
  },
  {
    id: 3,
    title: "MBA Finance Template",
    business: "EduPro Systems",
    status: "Active",
    clicks: 1205,
    created: "Feb 10, 2026",
  },
  {
    id: 4,
    title: "Premium UI Kit Bundle",
    business: "DesignHub Co.",
    status: "Rejected",
    clicks: 0,
    created: "Feb 20, 2026",
  },
  {
    id: 5,
    title: "Cloud Storage 2TB Deal",
    business: "StoragePro Ltd.",
    status: "Pending",
    clicks: 0,
    created: "Feb 28, 2026",
  },
];

const PRODUCTS_DATA = [
  {
    id: 1,
    title: "React 19 Dashboard Kit",
    creator: "Alex Rivera",
    category: "Technology",
    price: "$29",
    status: "Approved",
  },
  {
    id: 2,
    title: "MBA Finance Report Pack",
    creator: "Priya Patel",
    category: "Business",
    price: "$15",
    status: "Pending",
  },
  {
    id: 3,
    title: "Python ML Starter",
    creator: "Carlos Diaz",
    category: "Technology",
    price: "$49",
    status: "Approved",
  },
  {
    id: 4,
    title: "Resume & CV Bundle",
    creator: "Fatima Al-Hassan",
    category: "Education",
    price: "$19",
    status: "Pending",
  },
  {
    id: 5,
    title: "Digital Marketing Guide",
    creator: "Luis Torres",
    category: "Business",
    price: "$35",
    status: "Approved",
  },
];

const FEATURE_TOGGLES = [
  { id: "marketplace", label: "Marketplace", enabled: true },
  { id: "creator_tips", label: "Creator Tips", enabled: true },
  { id: "video_calls", label: "Video Calls", enabled: false },
  { id: "ai_translate", label: "AI Translate PDF", enabled: true },
  { id: "advanced_ocr", label: "Advanced OCR", enabled: false },
  { id: "img_remove_bg", label: "Remove Background", enabled: true },
  { id: "sponsor_ads", label: "Sponsor Ads", enabled: true },
  { id: "qr_sharing", label: "QR Sharing", enabled: true },
];

const REVENUE_MONTHS = [
  3800, 4200, 3950, 5100, 5800, 6200, 7400, 8100, 7800, 8900, 9400, 10200,
];
const MONTH_LABELS = [
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
  "Jan",
  "Feb",
];

type SidebarItemId =
  | "overview"
  | "all-users"
  | "normal-users"
  | "creators"
  | "business-owners"
  | "suspension"
  | "reports"
  | "ads-management"
  | "product-management"
  | "revenue"
  | "subscriptions"
  | "feature-toggle"
  | "notifications"
  | "system-settings"
  | "logs"
  | "chat"
  | "backup";

interface SidebarItem {
  icon: React.ElementType;
  label: string;
  id: SidebarItemId;
  badge?: string;
  children?: { label: string; id: SidebarItemId; count: string }[];
}

const SIDEBAR_ITEMS: SidebarItem[] = [
  { icon: BarChart3, label: "Overview", id: "overview" },
  {
    icon: Users,
    label: "All Users",
    id: "all-users",
    children: [
      { label: "Normal Users", id: "normal-users", count: "1,847" },
      { label: "Creators", id: "creators", count: "342" },
      { label: "Business Owners", id: "business-owners", count: "89" },
    ],
  },
  { icon: UserMinus, label: "User Suspension", id: "suspension" },
  {
    icon: AlertTriangle,
    label: "Reports & Complaints",
    id: "reports",
    badge: "12",
  },
  { icon: Megaphone, label: "Ads Management", id: "ads-management" },
  { icon: Package, label: "Product Management", id: "product-management" },
  { icon: DollarSign, label: "Revenue Reports", id: "revenue" },
  { icon: Crown, label: "Subscription Control", id: "subscriptions" },
  { icon: Sliders, label: "Feature Toggle", id: "feature-toggle" },
  { icon: Bell, label: "Notifications Manager", id: "notifications" },
  { icon: Settings, label: "System Settings", id: "system-settings" },
  { icon: Lock, label: "Logs & Security", id: "logs" },
  { icon: MessageSquare, label: "Chat with Users", id: "chat" },
  { icon: Archive, label: "Backup & Restore", id: "backup" },
];

export function SuperAdminDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeSection, setActiveSection] = useState<SidebarItemId>("overview");
  const [expandedItems, setExpandedItems] = useState<Set<string>>(
    new Set(["all-users"]),
  );
  const [suspendedUsers, setSuspendedUsers] = useState<Set<number>>(
    new Set([4, 8]),
  );
  const [featureToggles, setFeatureToggles] = useState<Record<string, boolean>>(
    Object.fromEntries(FEATURE_TOGGLES.map((f) => [f.id, f.enabled])),
  );
  const [warningUserId, setWarningUserId] = useState<number | null>(null);
  const [warningText, setWarningText] = useState("");
  const [broadcastMsg, setBroadcastMsg] = useState("");
  const [broadcastOpen, setBroadcastOpen] = useState(false);
  const [adStatuses, setAdStatuses] = useState<Record<number, string>>(
    Object.fromEntries(ADS_DATA.map((a) => [a.id, a.status])),
  );
  const [productStatuses, setProductStatuses] = useState<
    Record<number, string>
  >(Object.fromEntries(PRODUCTS_DATA.map((p) => [p.id, p.status])));

  const maxRevenue = Math.max(...REVENUE_MONTHS);

  const toggleExpand = (id: string) => {
    setExpandedItems((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSuspend = (userId: number) => {
    setSuspendedUsers((prev) => {
      const next = new Set(prev);
      const wasSuspended = next.has(userId);
      if (wasSuspended) {
        next.delete(userId);
        toast.success("User activated successfully");
      } else {
        next.add(userId);
        toast.success("User suspended");
      }
      return next;
    });
  };

  const handleSendWarning = (userId: number) => {
    if (!warningText.trim()) return;
    toast.success(`Warning sent to user #${userId}`);
    setWarningUserId(null);
    setWarningText("");
  };

  const handleBroadcast = () => {
    if (!broadcastMsg.trim()) return;
    toast.success("Broadcast notification sent to all users!");
    setBroadcastMsg("");
    setBroadcastOpen(false);
  };

  const handleApproveAd = (id: number) => {
    setAdStatuses((prev) => ({ ...prev, [id]: "Active" }));
    toast.success("Ad approved and is now live");
  };

  const handleRejectAd = (id: number) => {
    setAdStatuses((prev) => ({ ...prev, [id]: "Rejected" }));
    toast.error("Ad rejected");
  };

  const handleApproveProduct = (id: number) => {
    setProductStatuses((prev) => ({ ...prev, [id]: "Approved" }));
    toast.success("Product approved");
  };

  const handleRejectProduct = (id: number) => {
    setProductStatuses((prev) => ({ ...prev, [id]: "Rejected" }));
    toast.error("Product rejected");
  };

  return (
    <div className="min-h-screen bg-gray-950 flex">
      {/* Desktop Sidebar */}
      <motion.aside
        animate={{ width: sidebarOpen ? 256 : 72 }}
        transition={{ duration: 0.25, ease: "easeInOut" }}
        className="hidden md:flex flex-col bg-gray-900 border-r border-gray-800 z-10 overflow-hidden"
        style={{ minHeight: "100vh", flexShrink: 0 }}
      >
        {/* Logo area */}
        <div className="flex items-center gap-3 px-4 py-5 border-b border-gray-800">
          <button
            type="button"
            onClick={() => setSidebarOpen((v) => !v)}
            className="w-8 h-8 rounded-lg bg-gray-800 hover:bg-gray-700 flex items-center justify-center transition-colors flex-shrink-0"
          >
            <Menu className="w-4 h-4 text-gray-400" />
          </button>
          <AnimatePresence>
            {sidebarOpen && (
              <motion.div
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ duration: 0.15 }}
              >
                <p className="font-bold text-white text-sm whitespace-nowrap">
                  Super Admin
                </p>
                <p className="text-xs text-gray-500 whitespace-nowrap">
                  Control Panel
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <nav className="flex-1 py-3 px-2 space-y-0.5 overflow-y-auto">
          {SIDEBAR_ITEMS.map((item) => (
            <div key={item.id}>
              <button
                type="button"
                onClick={() => {
                  if (item.children) {
                    toggleExpand(item.id);
                  } else {
                    setActiveSection(item.id);
                  }
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-left group ${
                  activeSection === item.id
                    ? "bg-indigo-600 text-white"
                    : "text-gray-400 hover:bg-gray-800 hover:text-white"
                }`}
              >
                <item.icon className="w-4 h-4 flex-shrink-0" />
                <AnimatePresence>
                  {sidebarOpen && (
                    <motion.div
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -8 }}
                      transition={{ duration: 0.15 }}
                      className="flex items-center gap-2 flex-1 min-w-0"
                    >
                      <span className="text-sm font-medium whitespace-nowrap overflow-hidden flex-1">
                        {item.label}
                      </span>
                      {item.badge && (
                        <span className="flex-shrink-0 bg-red-600 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold leading-none">
                          {item.badge}
                        </span>
                      )}
                      {item.children &&
                        (expandedItems.has(item.id) ? (
                          <ChevronDown className="w-3.5 h-3.5 flex-shrink-0" />
                        ) : (
                          <ChevronRight className="w-3.5 h-3.5 flex-shrink-0" />
                        ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </button>

              {/* Children submenu */}
              {item.children && sidebarOpen && expandedItems.has(item.id) && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="ml-4 mt-0.5 space-y-0.5"
                >
                  {item.children.map((child) => (
                    <button
                      type="button"
                      key={child.id}
                      onClick={() => setActiveSection(child.id)}
                      className={`w-full flex items-center justify-between gap-2 pl-4 pr-3 py-2 rounded-lg text-left transition-all text-xs ${
                        activeSection === child.id
                          ? "bg-indigo-500/20 text-indigo-400"
                          : "text-gray-500 hover:bg-gray-800 hover:text-gray-300"
                      }`}
                    >
                      <span className="font-medium">{child.label}</span>
                      <span className="text-gray-600 text-xs">
                        {child.count}
                      </span>
                    </button>
                  ))}
                </motion.div>
              )}
            </div>
          ))}
        </nav>

        <div className="p-2 border-t border-gray-800">
          <Link
            to="/"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-red-500 hover:bg-red-900/20 transition-all"
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

      {/* Mobile sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 z-40 md:hidden"
              onClick={() => setSidebarOpen(false)}
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ duration: 0.25 }}
              className="fixed left-0 top-0 bottom-0 w-64 bg-gray-900 shadow-2xl z-50 md:hidden flex flex-col"
            >
              <div className="flex items-center justify-between px-4 py-5 border-b border-gray-800">
                <div>
                  <p className="font-bold text-white">Super Admin</p>
                  <p className="text-xs text-gray-500">Control Panel</p>
                </div>
                <button
                  type="button"
                  onClick={() => setSidebarOpen(false)}
                  className="w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center"
                >
                  <X className="w-4 h-4 text-gray-400" />
                </button>
              </div>
              <nav className="flex-1 py-3 px-2 space-y-0.5 overflow-y-auto">
                {SIDEBAR_ITEMS.map((item) => (
                  <button
                    type="button"
                    key={item.id}
                    onClick={() => {
                      if (!item.children) {
                        setActiveSection(item.id);
                        setSidebarOpen(false);
                      } else toggleExpand(item.id);
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-left ${
                      activeSection === item.id
                        ? "bg-indigo-600 text-white"
                        : "text-gray-400 hover:bg-gray-800 hover:text-white"
                    }`}
                  >
                    <item.icon className="w-4 h-4 flex-shrink-0" />
                    <span className="text-sm font-medium">{item.label}</span>
                    {item.badge && (
                      <span className="ml-auto bg-red-600 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                        {item.badge}
                      </span>
                    )}
                  </button>
                ))}
              </nav>
              <div className="p-2 border-t border-gray-800">
                <Link
                  to="/"
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-red-500 hover:bg-red-900/20"
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
      <div className="flex-1 flex flex-col min-w-0">
        {/* Dark header */}
        <div className="bg-gray-900 border-b border-gray-800 px-4 md:px-6 py-3 flex items-center gap-3 sticky top-0 z-10">
          <button
            type="button"
            onClick={() => setSidebarOpen((v) => !v)}
            className="w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center md:hidden"
          >
            <Menu className="w-4 h-4 text-gray-400" />
          </button>
          <div>
            <h1 className="font-bold text-white text-sm">
              Super Admin Control Panel
            </h1>
            <p className="text-xs text-gray-500">
              Platform-wide management & analytics
            </p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <Badge className="bg-indigo-600 text-white border-0 text-xs">
              <Shield className="w-3 h-3 mr-1" />
              Super Admin
            </Badge>
            <Dialog open={broadcastOpen} onOpenChange={setBroadcastOpen}>
              <DialogTrigger asChild>
                <button
                  type="button"
                  className="w-9 h-9 rounded-xl bg-gray-800 flex items-center justify-center hover:bg-gray-700 transition-colors relative"
                >
                  <Bell className="w-4 h-4 text-gray-400" />
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
                </button>
              </DialogTrigger>
              <DialogContent className="bg-gray-900 border-gray-800">
                <DialogHeader>
                  <DialogTitle className="text-white">
                    Broadcast Notification
                  </DialogTitle>
                </DialogHeader>
                <div className="py-2">
                  <p className="text-xs text-gray-400 mb-3">
                    Send a notification to all platform users
                  </p>
                  <Textarea
                    value={broadcastMsg}
                    onChange={(e) => setBroadcastMsg(e.target.value)}
                    placeholder="Enter your broadcast message..."
                    className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
                    rows={4}
                  />
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    className="border-gray-700 text-gray-400"
                    onClick={() => setBroadcastOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    className="bg-indigo-600 hover:bg-indigo-700 text-white"
                    onClick={handleBroadcast}
                  >
                    <Bell className="w-4 h-4 mr-2" />
                    Broadcast
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            <Link to="/">
              <button
                type="button"
                className="w-9 h-9 rounded-xl bg-gray-800 flex items-center justify-center hover:bg-gray-700 transition-colors"
              >
                <Home className="w-4 h-4 text-gray-400" />
              </button>
            </Link>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 max-w-7xl">
          {/* Dashboard Widgets */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4"
          >
            {[
              {
                label: "Total Users",
                value: "2,278",
                icon: Users,
                color: "text-blue-400",
                bg: "bg-blue-900/30",
                change: "+142 this month",
              },
              {
                label: "Active Users",
                value: "1,943",
                icon: UserCheck,
                color: "text-green-400",
                bg: "bg-green-900/30",
                change: "85% activity rate",
              },
              {
                label: "Suspended",
                value: "47",
                icon: UserMinus,
                color: "text-red-400",
                bg: "bg-red-900/30",
                change: "2.1% of users",
              },
              {
                label: "Total Revenue",
                value: "$48,320",
                icon: DollarSign,
                color: "text-emerald-400",
                bg: "bg-emerald-900/30",
                change: "+$8,240 this month",
              },
              {
                label: "Ads Revenue",
                value: "$12,840",
                icon: Megaphone,
                color: "text-amber-400",
                bg: "bg-amber-900/30",
                change: "+$2,100 this month",
              },
              {
                label: "Creator Earnings",
                value: "$28,900",
                icon: Star,
                color: "text-violet-400",
                bg: "bg-violet-900/30",
                change: "Paid to creators",
              },
              {
                label: "Platform Comm.",
                value: "15%",
                icon: TrendingUp,
                color: "text-cyan-400",
                bg: "bg-cyan-900/30",
                change: "Of all transactions",
              },
              {
                label: "System Health",
                value: "99.8%",
                icon: Activity,
                color: "text-green-400",
                bg: "bg-green-900/30",
                change: "Uptime this month",
              },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.05 + i * 0.04 }}
              >
                <Card className="bg-gray-800 border-gray-700 shadow-none">
                  <CardContent className="p-4">
                    <div
                      className={`w-9 h-9 rounded-xl ${stat.bg} flex items-center justify-center mb-2`}
                    >
                      <stat.icon className={`w-4 h-4 ${stat.color}`} />
                    </div>
                    <p className={`text-xl font-bold ${stat.color}`}>
                      {stat.value}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">{stat.label}</p>
                    <p className="text-xs text-gray-600 mt-1">{stat.change}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>

          {/* Revenue Chart */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-bold text-white flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-emerald-400" />
                  Monthly Revenue (Last 12 Months)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-end gap-1.5 h-36">
                  {REVENUE_MONTHS.map((val, i) => (
                    <div
                      key={MONTH_LABELS[i]}
                      className="flex-1 flex flex-col items-center gap-1"
                    >
                      <div
                        className="w-full rounded-t-md bg-gradient-to-t from-indigo-600 to-indigo-400"
                        style={{ height: `${(val / maxRevenue) * 100}%` }}
                      />
                      <span className="text-[10px] text-gray-600">
                        {MONTH_LABELS[i]}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* User Management Table */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.25 }}
          >
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-bold text-white flex items-center gap-2">
                    <Users className="w-4 h-4 text-blue-400" />
                    User Management
                  </CardTitle>
                  <Badge className="bg-gray-700 text-gray-300 border-0 text-xs">
                    {USERS_DATA.length} users
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-gray-700">
                        {[
                          "User",
                          "Email",
                          "Role",
                          "Status",
                          "Joined",
                          "Actions",
                        ].map((h) => (
                          <th
                            key={h}
                            className="text-left py-2.5 px-3 text-gray-500 font-medium uppercase tracking-wider whitespace-nowrap"
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {USERS_DATA.map((user) => {
                        const isSuspended = suspendedUsers.has(user.id);
                        return (
                          <tr
                            key={user.id}
                            className="border-b border-gray-700/50 last:border-0 hover:bg-gray-750/30"
                          >
                            <td className="py-3 px-3">
                              <div className="flex items-center gap-2">
                                <Avatar className="w-6 h-6">
                                  <AvatarFallback
                                    className="text-white text-[10px] font-bold"
                                    style={{ backgroundColor: user.color }}
                                  >
                                    {user.avatar}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="font-medium text-gray-200 whitespace-nowrap">
                                  {user.name}
                                </span>
                              </div>
                            </td>
                            <td className="py-3 px-3 text-gray-400 hidden lg:table-cell">
                              {user.email}
                            </td>
                            <td className="py-3 px-3">
                              <Badge
                                className={`text-xs border-0 whitespace-nowrap ${
                                  user.role === "creator"
                                    ? "bg-violet-900/40 text-violet-400"
                                    : user.role === "plus"
                                      ? "bg-amber-900/40 text-amber-400"
                                      : user.role === "admin"
                                        ? "bg-red-900/40 text-red-400"
                                        : "bg-gray-700 text-gray-400"
                                }`}
                              >
                                {user.role}
                              </Badge>
                            </td>
                            <td className="py-3 px-3">
                              <Badge
                                className={`text-xs border-0 ${
                                  isSuspended
                                    ? "bg-red-900/40 text-red-400"
                                    : "bg-green-900/40 text-green-400"
                                }`}
                              >
                                {isSuspended ? "Suspended" : "Active"}
                              </Badge>
                            </td>
                            <td className="py-3 px-3 text-gray-500 hidden sm:table-cell whitespace-nowrap">
                              {user.joined}
                            </td>
                            <td className="py-3 px-3">
                              <div className="flex items-center gap-1 flex-wrap">
                                <button
                                  type="button"
                                  onClick={() => toggleSuspend(user.id)}
                                  className={`px-2 py-1 rounded text-xs font-medium transition-colors whitespace-nowrap ${
                                    isSuspended
                                      ? "bg-green-900/30 text-green-400 hover:bg-green-900/50"
                                      : "bg-amber-900/30 text-amber-400 hover:bg-amber-900/50"
                                  }`}
                                >
                                  {isSuspended ? "Activate" : "Suspend"}
                                </button>

                                <Dialog
                                  open={warningUserId === user.id}
                                  onOpenChange={(o) => {
                                    if (!o) setWarningUserId(null);
                                  }}
                                >
                                  <DialogTrigger asChild>
                                    <button
                                      type="button"
                                      onClick={() => setWarningUserId(user.id)}
                                      className="px-2 py-1 rounded text-xs font-medium bg-orange-900/30 text-orange-400 hover:bg-orange-900/50 transition-colors"
                                    >
                                      Warn
                                    </button>
                                  </DialogTrigger>
                                  <DialogContent className="bg-gray-900 border-gray-800 max-w-sm">
                                    <DialogHeader>
                                      <DialogTitle className="text-white flex items-center gap-2">
                                        <AlertTriangle className="w-4 h-4 text-amber-400" />
                                        Send Warning
                                      </DialogTitle>
                                    </DialogHeader>
                                    <p className="text-xs text-gray-400">
                                      Sending warning to:{" "}
                                      <span className="text-white font-medium">
                                        {user.name}
                                      </span>
                                    </p>
                                    <Textarea
                                      value={warningText}
                                      onChange={(e) =>
                                        setWarningText(e.target.value)
                                      }
                                      placeholder="Enter warning message..."
                                      className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 mt-2"
                                      rows={3}
                                    />
                                    <DialogFooter>
                                      <Button
                                        variant="outline"
                                        className="border-gray-700 text-gray-400"
                                        onClick={() => setWarningUserId(null)}
                                      >
                                        Cancel
                                      </Button>
                                      <Button
                                        className="bg-amber-600 hover:bg-amber-700 text-white"
                                        onClick={() =>
                                          handleSendWarning(user.id)
                                        }
                                      >
                                        Send Warning
                                      </Button>
                                    </DialogFooter>
                                  </DialogContent>
                                </Dialog>

                                <button
                                  type="button"
                                  onClick={() =>
                                    toast.error(`User ${user.name} deleted`)
                                  }
                                  className="p-1 rounded text-red-500 hover:bg-red-900/30 transition-colors"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Ads Moderation Table */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
          >
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-bold text-white flex items-center gap-2">
                  <Megaphone className="w-4 h-4 text-amber-400" />
                  Ads Moderation
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-gray-700">
                        {[
                          "Ad Title",
                          "Business",
                          "Status",
                          "Clicks",
                          "Created",
                          "Actions",
                        ].map((h) => (
                          <th
                            key={h}
                            className="text-left py-2.5 px-3 text-gray-500 font-medium uppercase tracking-wider whitespace-nowrap"
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {ADS_DATA.map((ad) => {
                        const status = adStatuses[ad.id];
                        return (
                          <tr
                            key={ad.id}
                            className="border-b border-gray-700/50 last:border-0 hover:bg-gray-750/30"
                          >
                            <td className="py-3 px-3 font-medium text-gray-200">
                              {ad.title}
                            </td>
                            <td className="py-3 px-3 text-gray-400">
                              {ad.business}
                            </td>
                            <td className="py-3 px-3">
                              <Badge
                                className={`text-xs border-0 ${
                                  status === "Active"
                                    ? "bg-green-900/40 text-green-400"
                                    : status === "Pending"
                                      ? "bg-amber-900/40 text-amber-400"
                                      : "bg-red-900/40 text-red-400"
                                }`}
                              >
                                {status}
                              </Badge>
                            </td>
                            <td className="py-3 px-3 text-gray-400">
                              {ad.clicks.toLocaleString()}
                            </td>
                            <td className="py-3 px-3 text-gray-500 hidden sm:table-cell whitespace-nowrap">
                              {ad.created}
                            </td>
                            <td className="py-3 px-3">
                              <div className="flex items-center gap-1">
                                {status === "Pending" && (
                                  <>
                                    <button
                                      type="button"
                                      onClick={() => handleApproveAd(ad.id)}
                                      className="px-2 py-1 rounded text-xs font-medium bg-green-900/30 text-green-400 hover:bg-green-900/50 transition-colors whitespace-nowrap"
                                    >
                                      Approve
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleRejectAd(ad.id)}
                                      className="px-2 py-1 rounded text-xs font-medium bg-red-900/30 text-red-400 hover:bg-red-900/50 transition-colors whitespace-nowrap"
                                    >
                                      Reject
                                    </button>
                                  </>
                                )}
                                <button
                                  type="button"
                                  onClick={() =>
                                    toast.error(`Ad "${ad.title}" deleted`)
                                  }
                                  className="p-1 rounded text-red-500 hover:bg-red-900/30 transition-colors"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Product Approval Table */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.35 }}
          >
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-bold text-white flex items-center gap-2">
                  <Package className="w-4 h-4 text-violet-400" />
                  Product Approval Queue
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-gray-700">
                        {[
                          "Product",
                          "Creator",
                          "Category",
                          "Price",
                          "Status",
                          "Actions",
                        ].map((h) => (
                          <th
                            key={h}
                            className="text-left py-2.5 px-3 text-gray-500 font-medium uppercase tracking-wider whitespace-nowrap"
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {PRODUCTS_DATA.map((prod) => {
                        const status = productStatuses[prod.id];
                        return (
                          <tr
                            key={prod.id}
                            className="border-b border-gray-700/50 last:border-0 hover:bg-gray-750/30"
                          >
                            <td className="py-3 px-3 font-medium text-gray-200">
                              {prod.title}
                            </td>
                            <td className="py-3 px-3 text-gray-400">
                              {prod.creator}
                            </td>
                            <td className="py-3 px-3">
                              <Badge className="bg-gray-700 text-gray-300 border-0 text-xs">
                                {prod.category}
                              </Badge>
                            </td>
                            <td className="py-3 px-3 font-bold text-emerald-400">
                              {prod.price}
                            </td>
                            <td className="py-3 px-3">
                              <Badge
                                className={`text-xs border-0 ${
                                  status === "Approved"
                                    ? "bg-green-900/40 text-green-400"
                                    : status === "Pending"
                                      ? "bg-amber-900/40 text-amber-400"
                                      : "bg-red-900/40 text-red-400"
                                }`}
                              >
                                {status}
                              </Badge>
                            </td>
                            <td className="py-3 px-3">
                              <div className="flex items-center gap-1">
                                {status === "Pending" && (
                                  <>
                                    <button
                                      type="button"
                                      onClick={() =>
                                        handleApproveProduct(prod.id)
                                      }
                                      className="px-2 py-1 rounded text-xs font-medium bg-green-900/30 text-green-400 hover:bg-green-900/50 transition-colors whitespace-nowrap"
                                    >
                                      Approve
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() =>
                                        handleRejectProduct(prod.id)
                                      }
                                      className="px-2 py-1 rounded text-xs font-medium bg-red-900/30 text-red-400 hover:bg-red-900/50 transition-colors whitespace-nowrap"
                                    >
                                      Reject
                                    </button>
                                  </>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Feature Toggle Section */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.4 }}
          >
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-bold text-white flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-cyan-400" />
                    Feature Toggle (v17 → v18)
                  </CardTitle>
                  <Badge className="bg-indigo-900/40 text-indigo-400 border-0 text-xs">
                    Platform v18
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {FEATURE_TOGGLES.map((feature) => (
                    <div
                      key={feature.id}
                      className="flex items-center justify-between p-3 rounded-xl bg-gray-900/50 border border-gray-700"
                    >
                      <div className="flex items-center gap-2">
                        <Zap
                          className={`w-4 h-4 ${featureToggles[feature.id] ? "text-cyan-400" : "text-gray-600"}`}
                        />
                        <span className="text-sm text-gray-300">
                          {feature.label}
                        </span>
                      </div>
                      <Switch
                        checked={featureToggles[feature.id]}
                        onCheckedChange={(v) => {
                          setFeatureToggles((prev) => ({
                            ...prev,
                            [feature.id]: v,
                          }));
                          toast.success(
                            `${feature.label} ${v ? "enabled" : "disabled"}`,
                          );
                        }}
                        className="data-[state=checked]:bg-cyan-500"
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* System Info Cards */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.45 }}
            className="grid grid-cols-1 sm:grid-cols-3 gap-4"
          >
            {[
              {
                icon: HardDrive,
                label: "Storage Usage",
                value: "42.3 GB",
                sub: "of 100 GB used (42%)",
                color: "text-blue-400",
                bg: "bg-blue-900/30",
                pct: 42,
                barColor: "bg-blue-500",
              },
              {
                icon: Activity,
                label: "API Calls Today",
                value: "84,291",
                sub: "peak: 3,200 req/min",
                color: "text-emerald-400",
                bg: "bg-emerald-900/30",
                pct: 68,
                barColor: "bg-emerald-500",
              },
              {
                icon: RefreshCw,
                label: "Last Backup",
                value: "2h ago",
                sub: "Next: in 4 hours",
                color: "text-amber-400",
                bg: "bg-amber-900/30",
                pct: 100,
                barColor: "bg-amber-500",
              },
            ].map((item) => (
              <Card key={item.label} className="bg-gray-800 border-gray-700">
                <CardContent className="p-4">
                  <div
                    className={`w-9 h-9 rounded-xl ${item.bg} flex items-center justify-center mb-2`}
                  >
                    <item.icon className={`w-4 h-4 ${item.color}`} />
                  </div>
                  <p className={`text-xl font-bold ${item.color}`}>
                    {item.value}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">{item.label}</p>
                  <div className="w-full bg-gray-700 rounded-full h-1.5 mt-2">
                    <div
                      className={`${item.barColor} h-1.5 rounded-full`}
                      style={{ width: `${item.pct}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-600 mt-1">{item.sub}</p>
                </CardContent>
              </Card>
            ))}
          </motion.div>

          {/* Footer */}
          <div className="flex items-center justify-between py-4 border-t border-gray-800 text-xs text-gray-600">
            <div className="flex items-center gap-2">
              <Shield className="w-3.5 h-3.5" />
              <span>Super Admin — Full platform access</span>
            </div>
            <div className="flex items-center gap-4">
              <Link
                to="/admin"
                className="hover:text-gray-400 transition-colors"
              >
                Legacy Admin
              </Link>
              <Link to="/" className="hover:text-gray-400 transition-colors">
                Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
