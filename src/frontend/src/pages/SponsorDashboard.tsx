import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useActor } from "@/hooks/useActor";
import { useInternetIdentity } from "@/hooks/useInternetIdentity";
import { Link } from "@tanstack/react-router";
import {
  BarChart3,
  Bell,
  Check,
  CreditCard,
  ExternalLink,
  Loader2,
  LogIn,
  LogOut,
  MapPin,
  Megaphone,
  Menu,
  MousePointerClick,
  Package,
  Percent,
  Plus,
  Settings,
  ShoppingBag,
  Star,
  Tag,
  ThumbsUp,
  Trash2,
  TrendingUp,
  User,
  X,
  Zap,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface Ad {
  id: bigint;
  title: string;
  imageUrl: string;
  linkUrl: string;
  coupon: string;
  isBoosted: boolean;
  clicks: bigint;
  sponsorPrincipal: string;
  isActive: boolean;
}

const EMPTY_AD = {
  title: "",
  imageUrl: "",
  linkUrl: "",
  coupon: "",
  isBoosted: false,
  ctaText: "",
  targetCity: "",
  targetAge: "",
  targetTime: "",
  budget: "",
};

const SIDEBAR_ITEMS = [
  { icon: BarChart3, label: "Dashboard", id: "dashboard" },
  { icon: Plus, label: "Create New Ad", id: "create-ad" },
  { icon: Megaphone, label: "My Ads", id: "my-ads" },
  { icon: Zap, label: "Boost Ads", id: "boost-ads" },
  { icon: Tag, label: "Coupons & Offers", id: "coupons" },
  { icon: Package, label: "Products", id: "products" },
  { icon: TrendingUp, label: "Analytics", id: "analytics" },
  { icon: CreditCard, label: "Annual Subscription Plan", id: "subscription" },
  { icon: ShoppingBag, label: "Billing", id: "billing" },
  { icon: Settings, label: "Settings", id: "settings" },
];

const CLICKS_PER_DAY = [420, 380, 510, 640, 590, 720, 810];
const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const ENGAGEMENT_DATA = [820, 940, 1100, 980, 1240, 1380, 1500];
const MAX_ENGAGEMENT = 1500;
const AGE_DEMOGRAPHICS = [
  { label: "18–24", pct: 35, color: "bg-violet-500" },
  { label: "25–34", pct: 42, color: "bg-blue-500" },
  { label: "35–44", pct: 18, color: "bg-cyan-500" },
  { label: "45+", pct: 5, color: "bg-slate-400" },
];
const CITY_HEATMAP = [
  { city: "Mumbai", clicks: 2100 },
  { city: "Delhi", clicks: 1840 },
  { city: "Bangalore", clicks: 1620 },
  { city: "Hyderabad", clicks: 980 },
  { city: "Chennai", clicks: 760 },
  { city: "Kolkata", clicks: 540 },
  { city: "Pune", clicks: 490 },
  { city: "Ahmedabad", clicks: 340 },
];
const STATIC_PRODUCTS = [
  {
    id: 1,
    name: "PhoneBaba Pro Subscription",
    price: "$49.99",
    stock: "Unlimited",
    discount: "20%",
    sales: 234,
  },
  {
    id: 2,
    name: "PDF Tools Premium Pack",
    price: "$29.99",
    stock: "Unlimited",
    discount: "—",
    sales: 189,
  },
  {
    id: 3,
    name: "Business Analytics Bundle",
    price: "$79.99",
    stock: "Unlimited",
    discount: "15%",
    sales: 92,
  },
  {
    id: 4,
    name: "Creator Starter Kit",
    price: "$19.99",
    stock: "Unlimited",
    discount: "—",
    sales: 411,
  },
];

export function SponsorDashboard() {
  const { actor, isFetching } = useActor();
  const { identity, login } = useInternetIdentity();
  const [ads, setAds] = useState<Ad[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newAd, setNewAd] = useState({ ...EMPTY_AD });
  const [isCreatingAd, setIsCreatingAd] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeSection, setActiveSection] = useState("dashboard");

  useEffect(() => {
    async function load() {
      if (!actor || isFetching || !identity) return;
      setIsLoading(true);
      try {
        if (typeof (actor as any).getAdsBySponsor === "function") {
          const adsData = await (actor as any).getAdsBySponsor(
            identity.getPrincipal().toString(),
          );
          setAds(adsData || []);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, [actor, isFetching, identity]);

  const handleCreateAd = async () => {
    if (!actor || !identity || !newAd.title.trim() || !newAd.linkUrl.trim())
      return;
    setIsCreatingAd(true);
    try {
      if (typeof (actor as any).createAd === "function") {
        await (actor as any).createAd(
          newAd.title.trim(),
          newAd.imageUrl.trim(),
          newAd.linkUrl.trim(),
          newAd.coupon.trim(),
          newAd.isBoosted,
        );
        toast.success("Ad created and now live!");
        setNewAd({ ...EMPTY_AD });
        if (typeof (actor as any).getAdsBySponsor === "function") {
          const adsData = await (actor as any).getAdsBySponsor(
            identity.getPrincipal().toString(),
          );
          setAds(adsData || []);
        }
      }
    } catch {
      toast.error("Failed to create ad");
    } finally {
      setIsCreatingAd(false);
    }
  };

  const handleDeleteAd = async (id: bigint) => {
    if (!actor) return;
    try {
      if (typeof (actor as any).deleteAd === "function") {
        await (actor as any).deleteAd(id);
        setAds((prev) => prev.filter((a) => a.id !== id));
        toast.success("Ad deleted");
      }
    } catch {
      toast.error("Failed to delete ad");
    }
  };

  const maxClicks = Math.max(...CLICKS_PER_DAY);

  if (!identity) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-sm border-border">
          <CardHeader className="text-center">
            <div className="w-14 h-14 rounded-2xl bg-amber-100 flex items-center justify-center mx-auto mb-3">
              <User className="w-7 h-7 text-amber-600" />
            </div>
            <CardTitle className="font-display">Sign In Required</CardTitle>
            <CardDescription className="font-ui">
              Please sign in to access the Sponsor Dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full font-ui gap-2" onClick={login}>
              <LogIn className="w-4 h-4" />
              Sign In
            </Button>
          </CardContent>
        </Card>
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-amber-50/20 to-orange-50/20 flex">
      {/* Desktop Sidebar */}
      <motion.aside
        animate={{ width: sidebarOpen ? 256 : 72 }}
        transition={{ duration: 0.25, ease: "easeInOut" }}
        className="hidden md:flex flex-col bg-white border-r border-slate-200 shadow-sm z-10 overflow-hidden"
        style={{ minHeight: "100vh", flexShrink: 0 }}
      >
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
                className="font-bold text-slate-800 text-sm whitespace-nowrap"
              >
                Sponsor Dashboard
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
          {SIDEBAR_ITEMS.map((item) => (
            <button
              type="button"
              key={item.id}
              onClick={() => setActiveSection(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-left ${
                activeSection === item.id
                  ? "bg-amber-500 text-white shadow-sm"
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
            </button>
          ))}
          {sidebarOpen && (
            <Link
              to="/upgrade"
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-600 hover:bg-amber-50 hover:text-amber-700 transition-all"
            >
              <CreditCard className="w-4 h-4 flex-shrink-0" />
              <span className="text-sm font-medium">Annual Plan</span>
            </Link>
          )}
        </nav>

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

      {/* Mobile Sidebar */}
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
                <span className="font-bold text-slate-800">
                  Sponsor Dashboard
                </span>
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
                  <button
                    type="button"
                    key={item.id}
                    onClick={() => {
                      setActiveSection(item.id);
                      setSidebarOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-left ${
                      activeSection === item.id
                        ? "bg-amber-500 text-white"
                        : "text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    <item.icon className="w-4 h-4 flex-shrink-0" />
                    <span className="text-sm font-medium">{item.label}</span>
                  </button>
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
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-md border-b border-slate-200 px-4 md:px-6 py-3 flex items-center gap-3 sticky top-0 z-10">
          <button
            type="button"
            onClick={() => setSidebarOpen((v) => !v)}
            className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center md:hidden"
          >
            <Menu className="w-4 h-4 text-slate-600" />
          </button>
          <div>
            <h1 className="font-bold text-slate-900 text-sm">
              Business Owner / Sponsor Dashboard
            </h1>
            <p className="text-xs text-slate-500">
              Manage your ad campaigns and analytics
            </p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <Badge className="font-ui text-xs bg-amber-100 text-amber-700 border-amber-200">
              <Megaphone className="w-3 h-3 mr-1" />
              Sponsor
            </Badge>
            <button
              type="button"
              className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center hover:bg-slate-200"
            >
              <Bell className="w-4 h-4 text-slate-600" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 max-w-6xl">
          {/* Top Stats */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3"
          >
            {[
              {
                label: "Total Clicks",
                value: "8,432",
                icon: MousePointerClick,
                color: "text-blue-600",
                bg: "bg-blue-50",
              },
              {
                label: "Impressions",
                value: "124K",
                icon: TrendingUp,
                color: "text-violet-600",
                bg: "bg-violet-50",
              },
              {
                label: "CTR",
                value: "6.8%",
                icon: Percent,
                color: "text-green-600",
                bg: "bg-green-50",
              },
              {
                label: "Likes",
                value: "3,201",
                icon: ThumbsUp,
                color: "text-pink-600",
                bg: "bg-pink-50",
              },
              {
                label: "Comments",
                value: "456",
                icon: Bell,
                color: "text-cyan-600",
                bg: "bg-cyan-50",
              },
              {
                label: "Avg Rating",
                value: "4.2★",
                icon: Star,
                color: "text-amber-600",
                bg: "bg-amber-50",
              },
              {
                label: "Conversion",
                value: "2.4%",
                icon: Zap,
                color: "text-emerald-600",
                bg: "bg-emerald-50",
              },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.05 + i * 0.04 }}
              >
                <Card className="border-0 shadow-sm bg-white/80">
                  <CardContent className="p-3">
                    <div
                      className={`w-7 h-7 rounded-lg ${stat.bg} flex items-center justify-center mb-1.5`}
                    >
                      <stat.icon className={`w-3.5 h-3.5 ${stat.color}`} />
                    </div>
                    <p className="text-base font-bold text-slate-900 leading-tight">
                      {stat.value}
                    </p>
                    <p className="text-[10px] text-slate-500 mt-0.5 leading-tight">
                      {stat.label}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>

          {/* Analytics Charts */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            {/* Clicks per Day */}
            <Card className="border-0 shadow-sm bg-white/80">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-bold text-slate-900">
                  Clicks per Day (This Week)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-end gap-2 h-28">
                  {CLICKS_PER_DAY.map((val, i) => (
                    <div
                      key={DAY_LABELS[i]}
                      className="flex-1 flex flex-col items-center gap-1"
                    >
                      <div
                        className="w-full rounded-t-md bg-gradient-to-t from-amber-500 to-amber-300"
                        style={{ height: `${(val / maxClicks) * 100}%` }}
                      />
                      <span className="text-[10px] text-slate-400">
                        {DAY_LABELS[i]}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Engagement Graph */}
            <Card className="border-0 shadow-sm bg-white/80">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-bold text-slate-900">
                  Engagement Trend
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative h-28">
                  <svg
                    viewBox="0 0 280 100"
                    className="w-full h-full"
                    preserveAspectRatio="none"
                    aria-label="Engagement trend chart"
                    role="img"
                  >
                    <title>Engagement Trend</title>
                    <defs>
                      <linearGradient id="engGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop
                          offset="0%"
                          stopColor="#F59E0B"
                          stopOpacity="0.4"
                        />
                        <stop
                          offset="100%"
                          stopColor="#F59E0B"
                          stopOpacity="0"
                        />
                      </linearGradient>
                    </defs>
                    <polyline
                      points={ENGAGEMENT_DATA.map(
                        (v, i) =>
                          `${(i / (ENGAGEMENT_DATA.length - 1)) * 280},${100 - (v / MAX_ENGAGEMENT) * 90}`,
                      ).join(" ")}
                      fill="none"
                      stroke="#F59E0B"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <polygon
                      points={[
                        ...ENGAGEMENT_DATA.map(
                          (v, i) =>
                            `${(i / (ENGAGEMENT_DATA.length - 1)) * 280},${100 - (v / MAX_ENGAGEMENT) * 90}`,
                        ),
                        "280,100",
                        "0,100",
                      ].join(" ")}
                      fill="url(#engGrad)"
                    />
                  </svg>
                  <div className="absolute bottom-0 left-0 right-0 flex justify-between px-1">
                    {DAY_LABELS.map((d) => (
                      <span key={d} className="text-[10px] text-slate-400">
                        {d}
                      </span>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Age Demographics + Location Heatmap */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.25 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            {/* Age Demographics */}
            <Card className="border-0 shadow-sm bg-white/80">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-bold text-slate-900">
                  Age Demographics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {AGE_DEMOGRAPHICS.map((seg) => (
                  <div key={seg.label} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-700 font-medium">
                        {seg.label}
                      </span>
                      <span className="font-bold text-slate-900">
                        {seg.pct}%
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2.5">
                      <div
                        className={`${seg.color} h-2.5 rounded-full`}
                        style={{ width: `${seg.pct}%` }}
                      />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Location Heatmap */}
            <Card className="border-0 shadow-sm bg-white/80">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-red-500" />
                  Top Cities by Clicks
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2">
                  {CITY_HEATMAP.map((city) => {
                    const maxC = CITY_HEATMAP[0].clicks;
                    const intensity = city.clicks / maxC;
                    return (
                      <div
                        key={city.city}
                        className="rounded-lg p-2.5 flex items-center justify-between"
                        style={{
                          backgroundColor: `rgba(245, 158, 11, ${0.08 + intensity * 0.35})`,
                          borderLeft: `3px solid rgba(245, 158, 11, ${0.3 + intensity * 0.7})`,
                        }}
                      >
                        <span className="text-xs font-medium text-slate-800">
                          {city.city}
                        </span>
                        <span className="text-xs font-bold text-amber-700">
                          {city.clicks.toLocaleString()}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Ad Creation Form (existing logic, enhanced styling) */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
          >
            <Card className="border-0 shadow-sm bg-white/80">
              <CardHeader>
                <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Plus className="w-4 h-4 text-amber-500" />
                  Create New Ad Campaign
                </CardTitle>
                <CardDescription className="text-sm text-slate-500">
                  Ads appear on the Marketplace and Home pages as sponsored
                  content
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="font-ui text-sm">Ad Title *</Label>
                    <Input
                      value={newAd.title}
                      onChange={(e) =>
                        setNewAd((a) => ({ ...a, title: e.target.value }))
                      }
                      placeholder="50% off on PhoneBaba Pro"
                      className="font-ui"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="font-ui text-sm">Destination URL *</Label>
                    <Input
                      value={newAd.linkUrl}
                      onChange={(e) =>
                        setNewAd((a) => ({ ...a, linkUrl: e.target.value }))
                      }
                      placeholder="https://yoursite.com/offer"
                      className="font-ui"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="font-ui text-sm">Banner Image URL</Label>
                    <Input
                      value={newAd.imageUrl}
                      onChange={(e) =>
                        setNewAd((a) => ({ ...a, imageUrl: e.target.value }))
                      }
                      placeholder="https://... (optional)"
                      className="font-ui"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="font-ui text-sm">CTA Button Text</Label>
                    <Input
                      value={newAd.ctaText}
                      onChange={(e) =>
                        setNewAd((a) => ({ ...a, ctaText: e.target.value }))
                      }
                      placeholder="Get Offer Now"
                      className="font-ui"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="font-ui text-sm">
                      Coupon Code (optional)
                    </Label>
                    <Input
                      value={newAd.coupon}
                      onChange={(e) =>
                        setNewAd((a) => ({ ...a, coupon: e.target.value }))
                      }
                      placeholder="SAVE50"
                      className="font-ui"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="font-ui text-sm">Budget ($)</Label>
                    <Input
                      type="number"
                      value={newAd.budget}
                      onChange={(e) =>
                        setNewAd((a) => ({ ...a, budget: e.target.value }))
                      }
                      placeholder="500"
                      className="font-ui"
                    />
                  </div>
                </div>

                {/* Target Filters */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-slate-50 rounded-xl">
                  <div className="space-y-1.5">
                    <Label className="font-ui text-xs text-slate-500">
                      Target City
                    </Label>
                    <Input
                      value={newAd.targetCity}
                      onChange={(e) =>
                        setNewAd((a) => ({ ...a, targetCity: e.target.value }))
                      }
                      placeholder="Mumbai, Delhi..."
                      className="font-ui text-sm h-8"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="font-ui text-xs text-slate-500">
                      Target Age Range
                    </Label>
                    <Input
                      value={newAd.targetAge}
                      onChange={(e) =>
                        setNewAd((a) => ({ ...a, targetAge: e.target.value }))
                      }
                      placeholder="18-35"
                      className="font-ui text-sm h-8"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="font-ui text-xs text-slate-500">
                      Target Time
                    </Label>
                    <Input
                      value={newAd.targetTime}
                      onChange={(e) =>
                        setNewAd((a) => ({ ...a, targetTime: e.target.value }))
                      }
                      placeholder="9am–6pm IST"
                      className="font-ui text-sm h-8"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Checkbox
                    id="isBoosted"
                    checked={newAd.isBoosted}
                    onCheckedChange={(v) =>
                      setNewAd((a) => ({ ...a, isBoosted: !!v }))
                    }
                  />
                  <Label htmlFor="isBoosted" className="font-ui text-sm">
                    Boost this ad (appears first in all carousels)
                  </Label>
                </div>

                <Button
                  onClick={handleCreateAd}
                  disabled={
                    !newAd.title.trim() || !newAd.linkUrl.trim() || isCreatingAd
                  }
                  className="font-ui gap-2 bg-amber-500 hover:bg-amber-600 text-white border-0"
                >
                  {isCreatingAd ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Check className="w-4 h-4" />
                  )}
                  Launch Ad Campaign
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          {/* Products Table */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.35 }}
          >
            <Card className="border-0 shadow-sm bg-white/80">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Package className="w-4 h-4 text-amber-500" />
                  Product Listings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-slate-100">
                        <th className="text-left py-2 px-3 text-slate-400 font-medium uppercase tracking-wider">
                          Product
                        </th>
                        <th className="text-left py-2 px-3 text-slate-400 font-medium uppercase tracking-wider">
                          Price
                        </th>
                        <th className="text-left py-2 px-3 text-slate-400 font-medium uppercase tracking-wider hidden sm:table-cell">
                          Stock
                        </th>
                        <th className="text-left py-2 px-3 text-slate-400 font-medium uppercase tracking-wider">
                          Discount
                        </th>
                        <th className="text-left py-2 px-3 text-slate-400 font-medium uppercase tracking-wider">
                          Sales
                        </th>
                        <th className="text-right py-2 px-3 text-slate-400 font-medium uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {STATIC_PRODUCTS.map((prod) => (
                        <tr
                          key={prod.id}
                          className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50"
                        >
                          <td className="py-2.5 px-3 font-medium text-slate-800">
                            {prod.name}
                          </td>
                          <td className="py-2.5 px-3 font-bold text-emerald-600">
                            {prod.price}
                          </td>
                          <td className="py-2.5 px-3 text-slate-500 hidden sm:table-cell">
                            {prod.stock}
                          </td>
                          <td className="py-2.5 px-3">
                            {prod.discount !== "—" ? (
                              <Badge className="bg-green-100 text-green-700 border-0 text-xs">
                                {prod.discount}
                              </Badge>
                            ) : (
                              <span className="text-slate-400">—</span>
                            )}
                          </td>
                          <td className="py-2.5 px-3 text-slate-600">
                            {prod.sales}
                          </td>
                          <td className="py-2.5 px-3 text-right">
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-xs h-6 px-2"
                            >
                              Analytics
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Existing Ads List */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.4 }}
          >
            <h2 className="font-bold text-slate-900 text-base mb-4 flex items-center gap-2">
              <Megaphone className="w-4 h-4 text-amber-500" />
              My Campaigns
            </h2>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            ) : ads.length === 0 ? (
              <div className="py-12 text-center border border-dashed border-slate-200 rounded-xl bg-white/50">
                <Megaphone className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                <p className="font-semibold text-slate-500">No ads yet</p>
                <p className="text-sm text-slate-400 mt-1">
                  Create your first ad campaign above
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {ads.map((ad) => (
                  <Card
                    key={ad.id.toString()}
                    className="border-0 shadow-sm bg-white/80"
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        {ad.imageUrl && (
                          <img
                            src={ad.imageUrl}
                            alt={ad.title}
                            className="w-16 h-12 object-cover rounded-lg flex-shrink-0 border border-slate-200"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display =
                                "none";
                            }}
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <h3 className="font-semibold text-sm text-slate-900">
                              {ad.title}
                            </h3>
                            <Badge
                              className={`text-xs border-0 ${ad.isActive ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-600"}`}
                            >
                              {ad.isActive ? "Active" : "Inactive"}
                            </Badge>
                            {ad.isBoosted && (
                              <Badge className="text-xs bg-amber-100 text-amber-700 border-0">
                                Boosted
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-4 text-xs text-slate-400">
                            <span className="flex items-center gap-1">
                              <MousePointerClick className="w-3 h-3" />
                              {Number(ad.clicks).toLocaleString()} clicks
                            </span>
                            {ad.coupon && (
                              <span className="px-1.5 py-0.5 bg-amber-100 text-amber-700 rounded text-xs font-semibold">
                                🎟 {ad.coupon}
                              </span>
                            )}
                            <a
                              href={ad.linkUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1 hover:text-slate-900 transition-colors truncate max-w-[120px]"
                            >
                              <ExternalLink className="w-3 h-3 flex-shrink-0" />
                              {ad.linkUrl}
                            </a>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 text-xs text-red-500 hover:text-red-600 flex-shrink-0"
                          onClick={() => handleDeleteAd(ad.id)}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </motion.div>

          <div className="pb-6 flex items-center justify-between text-sm text-slate-500">
            <Link
              to="/marketplace"
              className="hover:text-slate-900 transition-colors"
            >
              ← Marketplace
            </Link>
            <Link
              to="/upgrade"
              className="text-amber-600 hover:text-amber-700 font-medium transition-colors"
            >
              Upgrade Plan →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
