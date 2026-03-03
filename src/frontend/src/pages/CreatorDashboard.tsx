import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useInternetIdentity } from "@/hooks/useInternetIdentity";
import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  BarChart3,
  Bell,
  Briefcase,
  Check,
  CreditCard,
  DollarSign,
  Download,
  GitPullRequest,
  Github,
  Loader2,
  LogIn,
  LogOut,
  Menu,
  MessageSquare,
  Plus,
  QrCode,
  Settings,
  ShoppingBag,
  Star,
  Trash2,
  TrendingUp,
  User,
  Users,
  Video,
  X,
  Zap,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface CreatorProfile {
  displayName: string;
  bio: string;
  category: string;
  profileType: string;
  socialLinks: string[];
  githubUrl: string;
  contactEmail: string;
  websiteUrl: string;
  profilePicUrl: string;
  createdAt: bigint;
}

interface Product {
  id: bigint;
  title: string;
  description: string;
  category: string;
  price: bigint;
  isFree: boolean;
  tags: string[];
  fileUrl: string;
  paymentLink: string;
  creatorPrincipal: string;
  downloadCount: bigint;
  createdAt: bigint;
}

interface Tip {
  id: bigint;
  fromPrincipal: string;
  toPrincipal: string;
  amount: bigint;
  message: string;
  createdAt: bigint;
}

const CATEGORIES = [
  "Education",
  "Technology",
  "Business",
  "Design",
  "Finance",
  "Other",
];
const PROFILE_TYPES = ["Project Seller", "Service Creator"];

const EMPTY_PROFILE: CreatorProfile = {
  displayName: "",
  bio: "",
  category: "Technology",
  profileType: "Project Seller",
  socialLinks: [],
  githubUrl: "",
  contactEmail: "",
  websiteUrl: "",
  profilePicUrl: "",
  createdAt: BigInt(0),
};

const EMPTY_PRODUCT = {
  title: "",
  description: "",
  category: "Technology",
  price: "",
  isFree: true,
  tags: "",
  fileUrl: "",
  paymentLink: "",
};

function serializeProducts(products: Product[]): string {
  return JSON.stringify(
    products.map((p) => ({
      ...p,
      id: p.id.toString(),
      price: p.price.toString(),
      downloadCount: p.downloadCount.toString(),
      createdAt: p.createdAt.toString(),
    })),
  );
}

function deserializeProducts(raw: string): Product[] {
  try {
    const arr = JSON.parse(raw) as Array<Record<string, unknown>>;
    return arr.map((p) => ({
      id: BigInt(p.id as string),
      title: p.title as string,
      description: p.description as string,
      category: p.category as string,
      price: BigInt(p.price as string),
      isFree: p.isFree as boolean,
      tags: p.tags as string[],
      fileUrl: p.fileUrl as string,
      paymentLink: p.paymentLink as string,
      creatorPrincipal: p.creatorPrincipal as string,
      downloadCount: BigInt(p.downloadCount as string),
      createdAt: BigInt(p.createdAt as string),
    }));
  } catch {
    return [];
  }
}

function serializeProfile(profile: CreatorProfile): string {
  return JSON.stringify({
    ...profile,
    createdAt: profile.createdAt.toString(),
  });
}

function deserializeProfile(raw: string): CreatorProfile {
  try {
    const p = JSON.parse(raw) as Record<string, unknown>;
    return {
      displayName: (p.displayName as string) || "",
      bio: (p.bio as string) || "",
      category: (p.category as string) || "Technology",
      profileType: (p.profileType as string) || "Project Seller",
      socialLinks: (p.socialLinks as string[]) || [],
      githubUrl: (p.githubUrl as string) || "",
      contactEmail: (p.contactEmail as string) || "",
      websiteUrl: (p.websiteUrl as string) || "",
      profilePicUrl: (p.profilePicUrl as string) || "",
      createdAt: BigInt((p.createdAt as string) || "0"),
    };
  } catch {
    return { ...EMPTY_PROFILE };
  }
}

const SIDEBAR_ITEMS = [
  { icon: BarChart3, label: "Overview", id: "overview" },
  { icon: ShoppingBag, label: "My Services", id: "products" },
  { icon: Plus, label: "Add New Service", id: "add-service" },
  { icon: TrendingUp, label: "Sales Analytics", id: "analytics" },
  { icon: Users, label: "Followers", id: "followers" },
  { icon: Star, label: "Reviews & Ratings", id: "reviews" },
  { icon: Github, label: "GitHub Projects", id: "github" },
  { icon: DollarSign, label: "Earnings", id: "earnings" },
  { icon: CreditCard, label: "Payout Settings", id: "payout" },
  { icon: MessageSquare, label: "Messages", id: "messages" },
  { icon: Video, label: "Video Call Requests", id: "video-calls" },
  { icon: QrCode, label: "QR Share Profile", id: "qr-share" },
  { icon: Settings, label: "Business Profile Settings", id: "profile" },
];

// Static demo data
const STATIC_ORDERS = [
  {
    id: 1,
    buyer: "Rahul Mehta",
    product: "React Dashboard Kit",
    price: "$29",
    date: "Feb 28, 2026",
    status: "Completed",
  },
  {
    id: 2,
    buyer: "Sneha Gupta",
    product: "MBA Finance Report",
    price: "$15",
    date: "Feb 26, 2026",
    status: "Completed",
  },
  {
    id: 3,
    buyer: "Carlos Diaz",
    product: "Python ML Pack",
    price: "$49",
    date: "Feb 24, 2026",
    status: "Processing",
  },
  {
    id: 4,
    buyer: "Yuki Tanaka",
    product: "UX Design Kit",
    price: "$39",
    date: "Feb 22, 2026",
    status: "Completed",
  },
  {
    id: 5,
    buyer: "Aisha Okafor",
    product: "Resume Bundle",
    price: "$19",
    date: "Feb 20, 2026",
    status: "Refunded",
  },
];

const STATIC_REVIEWS = [
  {
    id: 1,
    reviewer: "Rahul M.",
    avatar: "RM",
    rating: 5,
    comment:
      "Outstanding quality! The React dashboard template saved me weeks of work. Clean code, great documentation.",
    date: "Feb 28",
    color: "#3B8CE2",
  },
  {
    id: 2,
    reviewer: "Sneha G.",
    avatar: "SG",
    rating: 4,
    comment:
      "Very detailed MBA report. Would have loved a few more charts but overall excellent value for money.",
    date: "Feb 26",
    color: "#E25C3B",
  },
  {
    id: 3,
    reviewer: "Carlos D.",
    avatar: "CD",
    rating: 5,
    comment:
      "The ML starter pack is exactly what I needed. Clear explanations and working code examples.",
    date: "Feb 24",
    color: "#2DBD6E",
  },
];

const STATIC_TIPS = [
  {
    id: 1,
    from: "anon-user-4821",
    amount: "$10",
    message: "Great work, keep it up!",
    date: "Feb 28",
  },
  {
    id: 2,
    from: "anon-user-1203",
    amount: "$25",
    message: "Your React kit saved my project deadline!",
    date: "Feb 25",
  },
  {
    id: 3,
    from: "anon-user-7764",
    amount: "$5",
    message: "Thanks for the free content!",
    date: "Feb 22",
  },
  {
    id: 4,
    from: "anon-user-9901",
    amount: "$50",
    message: "Absolutely worth every penny",
    date: "Feb 19",
  },
  {
    id: 5,
    from: "anon-user-3345",
    amount: "$15",
    message: "Love your tutorials",
    date: "Feb 15",
  },
];

const MONTHLY_SALES = [12, 18, 24, 34, 28, 40, 34];
const MONTHS = ["Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb"];
const FOLLOWERS_GROWTH = [800, 920, 1050, 1100, 1160, 1210, 1240];

export function CreatorDashboard() {
  const { identity, login } = useInternetIdentity();
  const [isCreator, setIsCreator] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [profile, setProfile] = useState<CreatorProfile>(EMPTY_PROFILE);
  const [products, setProducts] = useState<Product[]>([]);
  const [tips] = useState<Tip[]>([]);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [newProduct, setNewProduct] = useState({ ...EMPTY_PRODUCT });
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [platformRole, setPlatformRole] = useState("free");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeSection, setActiveSection] = useState("overview");

  const principalId = identity?.getPrincipal().toString();

  useEffect(() => {
    if (!identity) {
      setIsLoading(false);
      return;
    }
    const pid = identity.getPrincipal().toString();

    const storedRole = localStorage.getItem(`platform_role_${pid}`) ?? "free";
    setPlatformRole(storedRole);

    const creatorRole = localStorage.getItem(`creator_role_${pid}`);
    const creatorActive = creatorRole === "creator";
    setIsCreator(creatorActive);

    if (creatorActive) {
      const rawProfile = localStorage.getItem(`creator_profile_${pid}`);
      if (rawProfile) {
        setProfile(deserializeProfile(rawProfile));
      }
      const rawProducts = localStorage.getItem(`creator_products_${pid}`);
      if (rawProducts) {
        setProducts(deserializeProducts(rawProducts));
      }
    }
    setIsLoading(false);
  }, [identity]);

  const handleClaimCreator = () => {
    if (!identity) return;
    const pid = identity.getPrincipal().toString();
    localStorage.setItem(`creator_role_${pid}`, "creator");
    localStorage.setItem(`platform_role_${pid}`, "creator");
    setPlatformRole("creator");
    setIsCreator(true);
    toast.success("Welcome! You're now a creator.");
  };

  const handleSaveProfile = () => {
    if (!identity) return;
    setIsSavingProfile(true);
    const pid = identity.getPrincipal().toString();
    const toSave: CreatorProfile = {
      ...profile,
      createdAt: profile.createdAt || BigInt(Date.now()),
    };
    localStorage.setItem(`creator_profile_${pid}`, serializeProfile(toSave));
    setProfile(toSave);
    setTimeout(() => {
      setIsSavingProfile(false);
      toast.success("Profile saved!");
    }, 400);
  };

  const handleAddProduct = () => {
    if (!identity || !newProduct.title.trim()) return;
    setIsAddingProduct(true);
    const pid = identity.getPrincipal().toString();
    const price = newProduct.isFree
      ? BigInt(0)
      : BigInt(Math.round(Number.parseFloat(newProduct.price || "0") * 100));
    const tags = newProduct.tags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    const product: Product = {
      id: BigInt(Date.now()),
      title: newProduct.title.trim(),
      description: newProduct.description.trim(),
      category: newProduct.category,
      price,
      isFree: newProduct.isFree,
      tags,
      fileUrl: newProduct.fileUrl.trim(),
      paymentLink: newProduct.paymentLink.trim(),
      creatorPrincipal: pid,
      downloadCount: BigInt(0),
      createdAt: BigInt(Date.now()),
    };

    const updatedProducts = [...products, product];
    setProducts(updatedProducts);
    localStorage.setItem(
      `creator_products_${pid}`,
      serializeProducts(updatedProducts),
    );
    setNewProduct({ ...EMPTY_PRODUCT });
    setTimeout(() => {
      setIsAddingProduct(false);
      toast.success("Product created!");
    }, 300);
  };

  const handleDeleteProduct = (id: bigint) => {
    if (!identity) return;
    const pid = identity.getPrincipal().toString();
    const updatedProducts = products.filter((p) => p.id !== id);
    setProducts(updatedProducts);
    localStorage.setItem(
      `creator_products_${pid}`,
      serializeProducts(updatedProducts),
    );
    toast.success("Product deleted");
  };

  const totalDownloads = products.reduce(
    (sum, p) => sum + Number(p.downloadCount),
    0,
  );
  const totalTips = tips.reduce((sum, t) => sum + Number(t.amount), 0) / 100;
  const maxSales = Math.max(...MONTHLY_SALES);
  const maxFollowers = Math.max(...FOLLOWERS_GROWTH);

  if (!identity) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-sm border-border">
          <CardHeader className="text-center">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
              <User className="w-7 h-7 text-primary" />
            </div>
            <CardTitle className="font-display">Sign In Required</CardTitle>
            <CardDescription className="font-ui">
              Please sign in to access your Creator Dashboard
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

  if (isLoading) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </main>
    );
  }

  if (!isCreator) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-lg"
        >
          <Card className="border-border">
            <CardHeader className="text-center pb-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/30 flex items-center justify-center mx-auto mb-4">
                <ShoppingBag className="w-8 h-8 text-primary" />
              </div>
              <CardTitle className="font-display text-2xl">
                Become a Creator
              </CardTitle>
              <CardDescription className="font-ui">
                Start selling your projects, resumes, templates, and more to a
                global audience
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                {[
                  {
                    icon: ShoppingBag,
                    label: "Sell products",
                    color: "#E25C3B",
                  },
                  { icon: Users, label: "Build followers", color: "#3B8CE2" },
                  { icon: Zap, label: "Receive tips", color: "#E2A83B" },
                  {
                    icon: BarChart3,
                    label: "Track analytics",
                    color: "#2DBD6E",
                  },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 border border-border"
                  >
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: `${item.color}18` }}
                    >
                      <item.icon
                        className="w-4 h-4"
                        style={{ color: item.color }}
                      />
                    </div>
                    <span className="font-ui text-sm text-foreground">
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>
              <Button
                className="w-full font-ui gap-2"
                onClick={handleClaimCreator}
              >
                <Check className="w-4 h-4" />
                Start as Creator — It's Free
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </main>
    );
  }

  const getTabValue = () => {
    if (activeSection === "products" || activeSection === "add-service")
      return "products";
    if (activeSection === "profile") return "profile";
    if (activeSection === "earnings") return "earnings";
    return "products";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/20 to-teal-50/20 flex">
      {/* Desktop Sidebar */}
      <motion.aside
        animate={{ width: sidebarOpen ? 256 : 72 }}
        transition={{ duration: 0.25, ease: "easeInOut" }}
        className="hidden md:flex flex-col bg-white border-r border-slate-200 shadow-sm relative z-10 overflow-hidden"
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
                Creator Dashboard
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
                  ? "bg-emerald-600 text-white shadow-sm"
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
                <span className="font-bold text-slate-800">
                  Creator Dashboard
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
                        ? "bg-emerald-600 text-white"
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
              Creator Dashboard
            </h1>
            <p className="text-xs text-slate-500">
              Manage your products and profile
            </p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <Badge
              className="font-ui text-xs"
              style={{
                backgroundColor:
                  platformRole === "admin" ? "#E25C3B18" : "#3B8CE218",
                color: platformRole === "admin" ? "#E25C3B" : "#3B8CE2",
                border: `1px solid ${platformRole === "admin" ? "#E25C3B30" : "#3B8CE230"}`,
              }}
            >
              {platformRole.charAt(0).toUpperCase() + platformRole.slice(1)}
            </Badge>
            <button
              type="button"
              className="relative w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition-colors"
            >
              <Bell className="w-4 h-4 text-slate-600" />
            </button>
            {principalId && (
              <a href={`/creator/${principalId}`}>
                <Button
                  variant="outline"
                  size="sm"
                  className="font-ui gap-1.5 text-xs"
                >
                  View Profile <ArrowRight className="w-3 h-3" />
                </Button>
              </a>
            )}
          </div>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 max-w-6xl">
          {/* Top Stat Cards */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-4"
          >
            {[
              {
                label: "Total Revenue",
                value: "$2,840",
                icon: DollarSign,
                color: "text-emerald-600",
                bg: "bg-emerald-50",
                sub: "+$340 this month",
              },
              {
                label: "Monthly Sales",
                value: "34",
                icon: ShoppingBag,
                color: "text-blue-600",
                bg: "bg-blue-50",
                sub: "+8 vs last month",
              },
              {
                label: "Avg Rating",
                value: "4.7★",
                icon: Star,
                color: "text-amber-600",
                bg: "bg-amber-50",
                sub: "Based on 47 reviews",
              },
              {
                label: "Followers",
                value: "1,240",
                icon: Users,
                color: "text-violet-600",
                bg: "bg-violet-50",
                sub: "+30 this week",
              },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.05 + i * 0.05 }}
              >
                <Card className="border-0 shadow-sm bg-white/80">
                  <CardContent className="p-4">
                    <div
                      className={`w-9 h-9 rounded-xl ${stat.bg} flex items-center justify-center mb-2`}
                    >
                      <stat.icon className={`w-4 h-4 ${stat.color}`} />
                    </div>
                    <p className="text-xl font-bold text-slate-900">
                      {stat.value}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {stat.label}
                    </p>
                    <p className="text-xs text-emerald-600 mt-1 font-medium">
                      {stat.sub}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>

          {/* Charts Row */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            {/* Monthly Sales Bar Chart */}
            <Card className="border-0 shadow-sm bg-white/80">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-bold text-slate-900">
                  Monthly Sales
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-end gap-1.5 h-32">
                  {MONTHLY_SALES.map((val, i) => (
                    <div
                      key={MONTHS[i]}
                      className="flex-1 flex flex-col items-center gap-1"
                    >
                      <div
                        className="w-full rounded-t-md bg-gradient-to-t from-emerald-600 to-emerald-400 transition-all"
                        style={{ height: `${(val / maxSales) * 100}%` }}
                      />
                      <span className="text-[10px] text-slate-400">
                        {MONTHS[i]}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Followers Growth Line Chart */}
            <Card className="border-0 shadow-sm bg-white/80">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-bold text-slate-900">
                  Followers Growth
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative h-32">
                  <svg
                    viewBox="0 0 280 100"
                    className="w-full h-full"
                    preserveAspectRatio="none"
                    aria-label="Followers growth chart"
                    role="img"
                  >
                    <title>Followers Growth</title>
                    <defs>
                      <linearGradient
                        id="followerGrad"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="0%"
                          stopColor="#8B5CF6"
                          stopOpacity="0.3"
                        />
                        <stop
                          offset="100%"
                          stopColor="#8B5CF6"
                          stopOpacity="0"
                        />
                      </linearGradient>
                    </defs>
                    <polyline
                      points={FOLLOWERS_GROWTH.map(
                        (v, i) =>
                          `${(i / (FOLLOWERS_GROWTH.length - 1)) * 280},${100 - (v / maxFollowers) * 90}`,
                      ).join(" ")}
                      fill="none"
                      stroke="#8B5CF6"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <polygon
                      points={[
                        ...FOLLOWERS_GROWTH.map(
                          (v, i) =>
                            `${(i / (FOLLOWERS_GROWTH.length - 1)) * 280},${100 - (v / maxFollowers) * 90}`,
                        ),
                        "280,100",
                        "0,100",
                      ].join(" ")}
                      fill="url(#followerGrad)"
                    />
                  </svg>
                  <div className="absolute bottom-0 left-0 right-0 flex justify-between px-1">
                    {MONTHS.map((m) => (
                      <span key={m} className="text-[10px] text-slate-400">
                        {m}
                      </span>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Tips Received */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.25 }}
          >
            <Card className="border-0 shadow-sm bg-white/80">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Zap className="w-4 h-4 text-amber-500" />
                    Tips Received ("Thank as money") — Total $340
                  </CardTitle>
                  <Badge className="bg-amber-100 text-amber-700 border-0 text-xs">
                    8 tips
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {STATIC_TIPS.map((tip) => (
                    <div
                      key={tip.id}
                      className="flex items-center justify-between py-1.5 border-b border-slate-50 last:border-0"
                    >
                      <div>
                        <p className="text-xs font-medium text-slate-700">
                          {tip.from}
                        </p>
                        <p className="text-xs text-slate-400">{tip.message}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-emerald-600">
                          {tip.amount}
                        </p>
                        <p className="text-[10px] text-slate-400">{tip.date}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Recent Orders */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
          >
            <Card className="border-0 shadow-sm bg-white/80">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-bold text-slate-900">
                  Recent Orders
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-slate-100">
                        <th className="text-left py-2 px-3 text-slate-400 font-medium uppercase tracking-wider">
                          Buyer
                        </th>
                        <th className="text-left py-2 px-3 text-slate-400 font-medium uppercase tracking-wider">
                          Product
                        </th>
                        <th className="text-left py-2 px-3 text-slate-400 font-medium uppercase tracking-wider">
                          Price
                        </th>
                        <th className="text-left py-2 px-3 text-slate-400 font-medium uppercase tracking-wider hidden sm:table-cell">
                          Date
                        </th>
                        <th className="text-left py-2 px-3 text-slate-400 font-medium uppercase tracking-wider">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {STATIC_ORDERS.map((order) => (
                        <tr
                          key={order.id}
                          className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50"
                        >
                          <td className="py-2.5 px-3 font-medium text-slate-800">
                            {order.buyer}
                          </td>
                          <td className="py-2.5 px-3 text-slate-600">
                            {order.product}
                          </td>
                          <td className="py-2.5 px-3 font-bold text-emerald-600">
                            {order.price}
                          </td>
                          <td className="py-2.5 px-3 text-slate-400 hidden sm:table-cell">
                            {order.date}
                          </td>
                          <td className="py-2.5 px-3">
                            <Badge
                              className={`text-xs border-0 ${
                                order.status === "Completed"
                                  ? "bg-green-100 text-green-700"
                                  : order.status === "Processing"
                                    ? "bg-blue-100 text-blue-700"
                                    : "bg-red-100 text-red-600"
                              }`}
                            >
                              {order.status}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Recent Reviews */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.35 }}
          >
            <Card className="border-0 shadow-sm bg-white/80">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-bold text-slate-900">
                  Recent Reviews
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {STATIC_REVIEWS.map((review) => (
                    <div
                      key={review.id}
                      className="p-3 rounded-xl bg-slate-50 border border-slate-100"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <Avatar className="w-7 h-7">
                          <AvatarFallback
                            className="text-white text-xs font-bold"
                            style={{ backgroundColor: review.color }}
                          >
                            {review.avatar}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-xs font-semibold text-slate-800">
                            {review.reviewer}
                          </p>
                          <div className="flex items-center gap-0.5">
                            {Array.from({ length: review.rating }, (_, i) => (
                              <Star
                                key={`${review.id}-star-${review.rating - i}`}
                                className="w-2.5 h-2.5 text-amber-400 fill-amber-400"
                              />
                            ))}
                          </div>
                        </div>
                        <span className="ml-auto text-[10px] text-slate-400">
                          {review.date}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 line-clamp-3">
                        {review.comment}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Existing Tabs — Product Management, Profile, Earnings */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.4 }}
          >
            <Tabs
              value={getTabValue()}
              onValueChange={(v) =>
                setActiveSection(v === "products" ? "products" : v)
              }
            >
              <TabsList className="font-ui mb-6">
                <TabsTrigger value="products">Products</TabsTrigger>
                <TabsTrigger value="profile">Edit Profile</TabsTrigger>
                <TabsTrigger value="earnings">Earnings</TabsTrigger>
              </TabsList>

              {/* Products Tab */}
              <TabsContent value="products" className="space-y-6">
                <Card className="border-border">
                  <CardHeader>
                    <CardTitle className="font-display text-base flex items-center gap-2">
                      <Plus className="w-4 h-4 text-primary" />
                      Add New Product
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label className="font-ui text-sm">Title *</Label>
                        <Input
                          value={newProduct.title}
                          onChange={(e) =>
                            setNewProduct((p) => ({
                              ...p,
                              title: e.target.value,
                            }))
                          }
                          placeholder="My Awesome Project"
                          className="font-ui"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="font-ui text-sm">Category</Label>
                        <Select
                          value={newProduct.category}
                          onValueChange={(v) =>
                            setNewProduct((p) => ({ ...p, category: v }))
                          }
                        >
                          <SelectTrigger className="font-ui">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {CATEGORIES.map((c) => (
                              <SelectItem key={c} value={c} className="font-ui">
                                {c}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label className="font-ui text-sm">Description</Label>
                      <Textarea
                        value={newProduct.description}
                        onChange={(e) =>
                          setNewProduct((p) => ({
                            ...p,
                            description: e.target.value,
                          }))
                        }
                        placeholder="Describe your product..."
                        className="font-ui text-sm"
                        rows={3}
                      />
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <Checkbox
                          id="isFree"
                          checked={newProduct.isFree}
                          onCheckedChange={(v) =>
                            setNewProduct((p) => ({ ...p, isFree: !!v }))
                          }
                        />
                        <Label htmlFor="isFree" className="font-ui text-sm">
                          Free product
                        </Label>
                      </div>
                      {!newProduct.isFree && (
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground font-ui text-sm">
                            $
                          </span>
                          <Input
                            type="number"
                            value={newProduct.price}
                            onChange={(e) =>
                              setNewProduct((p) => ({
                                ...p,
                                price: e.target.value,
                              }))
                            }
                            placeholder="9.99"
                            className="font-ui w-24"
                            min="0"
                            step="0.01"
                          />
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label className="font-ui text-sm">
                          {newProduct.isFree ? "File URL" : "Payment Link"}
                        </Label>
                        <Input
                          value={
                            newProduct.isFree
                              ? newProduct.fileUrl
                              : newProduct.paymentLink
                          }
                          onChange={(e) =>
                            setNewProduct((p) =>
                              newProduct.isFree
                                ? { ...p, fileUrl: e.target.value }
                                : { ...p, paymentLink: e.target.value },
                            )
                          }
                          placeholder={
                            newProduct.isFree
                              ? "https://..."
                              : "https://buy.stripe.com/..."
                          }
                          className="font-ui"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="font-ui text-sm">
                          Tags (comma separated)
                        </Label>
                        <Input
                          value={newProduct.tags}
                          onChange={(e) =>
                            setNewProduct((p) => ({
                              ...p,
                              tags: e.target.value,
                            }))
                          }
                          placeholder="React, TypeScript, Web Dev"
                          className="font-ui"
                        />
                      </div>
                    </div>

                    <Button
                      onClick={handleAddProduct}
                      disabled={!newProduct.title.trim() || isAddingProduct}
                      className="font-ui gap-2"
                    >
                      {isAddingProduct ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Plus className="w-4 h-4" />
                      )}
                      Add Product
                    </Button>
                  </CardContent>
                </Card>

                {products.length === 0 ? (
                  <div className="py-12 text-center">
                    <ShoppingBag className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
                    <p className="font-display font-semibold text-muted-foreground">
                      No products yet
                    </p>
                    <p className="text-sm text-muted-foreground font-ui mt-1">
                      Add your first product above
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {products.map((product) => (
                      <Card
                        key={product.id.toString()}
                        className="border-border"
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap mb-1">
                                <h3 className="font-display font-semibold text-sm text-foreground">
                                  {product.title}
                                </h3>
                                <Badge
                                  variant="secondary"
                                  className="font-ui text-xs"
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
                              <p className="text-xs text-muted-foreground font-ui line-clamp-1">
                                {product.description}
                              </p>
                              <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground font-ui">
                                <span className="flex items-center gap-1">
                                  <Download className="w-3 h-3" />
                                  {Number(
                                    product.downloadCount,
                                  ).toLocaleString()}
                                </span>
                                {product.tags.slice(0, 3).map((tag) => (
                                  <Badge
                                    key={tag}
                                    variant="outline"
                                    className="font-ui text-xs h-4"
                                  >
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                            <div className="flex gap-2 flex-shrink-0">
                              <a href={`/product/${product.id.toString()}`}>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="font-ui h-8 text-xs"
                                >
                                  View
                                </Button>
                              </a>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="font-ui h-8 text-xs text-destructive hover:text-destructive"
                                onClick={() => handleDeleteProduct(product.id)}
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>

              {/* Profile Tab */}
              <TabsContent value="profile">
                <Card className="border-border">
                  <CardHeader>
                    <CardTitle className="font-display text-base">
                      Creator Profile
                    </CardTitle>
                    <CardDescription className="font-ui text-sm">
                      This information will be shown on your public profile
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label className="font-ui text-sm">
                          Display Name *
                        </Label>
                        <Input
                          value={profile.displayName}
                          onChange={(e) =>
                            setProfile((p) => ({
                              ...p,
                              displayName: e.target.value,
                            }))
                          }
                          placeholder="Your name"
                          className="font-ui"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="font-ui text-sm">
                          Profile Picture URL
                        </Label>
                        <Input
                          value={profile.profilePicUrl}
                          onChange={(e) =>
                            setProfile((p) => ({
                              ...p,
                              profilePicUrl: e.target.value,
                            }))
                          }
                          placeholder="https://..."
                          className="font-ui"
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="font-ui text-sm">Bio</Label>
                      <Textarea
                        value={profile.bio}
                        onChange={(e) =>
                          setProfile((p) => ({ ...p, bio: e.target.value }))
                        }
                        placeholder="Tell the world about yourself..."
                        className="font-ui text-sm"
                        rows={3}
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label className="font-ui text-sm">Category</Label>
                        <Select
                          value={profile.category}
                          onValueChange={(v) =>
                            setProfile((p) => ({ ...p, category: v }))
                          }
                        >
                          <SelectTrigger className="font-ui">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {CATEGORIES.map((c) => (
                              <SelectItem key={c} value={c} className="font-ui">
                                {c}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1.5">
                        <Label className="font-ui text-sm">Profile Type</Label>
                        <Select
                          value={profile.profileType}
                          onValueChange={(v) =>
                            setProfile((p) => ({ ...p, profileType: v }))
                          }
                        >
                          <SelectTrigger className="font-ui">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {PROFILE_TYPES.map((t) => (
                              <SelectItem key={t} value={t} className="font-ui">
                                {t}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <Separator />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label className="font-ui text-sm">GitHub URL</Label>
                        <Input
                          value={profile.githubUrl}
                          onChange={(e) =>
                            setProfile((p) => ({
                              ...p,
                              githubUrl: e.target.value,
                            }))
                          }
                          placeholder="https://github.com/..."
                          className="font-ui"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="font-ui text-sm">Website URL</Label>
                        <Input
                          value={profile.websiteUrl}
                          onChange={(e) =>
                            setProfile((p) => ({
                              ...p,
                              websiteUrl: e.target.value,
                            }))
                          }
                          placeholder="https://yoursite.com"
                          className="font-ui"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="font-ui text-sm">Contact Email</Label>
                        <Input
                          type="email"
                          value={profile.contactEmail}
                          onChange={(e) =>
                            setProfile((p) => ({
                              ...p,
                              contactEmail: e.target.value,
                            }))
                          }
                          placeholder="you@example.com"
                          className="font-ui"
                        />
                      </div>
                    </div>
                    <Button
                      onClick={handleSaveProfile}
                      disabled={!profile.displayName.trim() || isSavingProfile}
                      className="font-ui gap-2"
                    >
                      {isSavingProfile ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Check className="w-4 h-4" />
                      )}
                      Save Profile
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Earnings Tab */}
              <TabsContent value="earnings" className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <Card className="border-border">
                    <CardContent className="pt-6">
                      <p className="font-display font-bold text-2xl text-foreground">
                        ${totalTips.toFixed(2)}
                      </p>
                      <p className="text-xs text-muted-foreground font-ui mt-1">
                        Total tips received
                      </p>
                    </CardContent>
                  </Card>
                  <Card className="border-border">
                    <CardContent className="pt-6">
                      <p className="font-display font-bold text-2xl text-foreground">
                        {tips.length}
                      </p>
                      <p className="text-xs text-muted-foreground font-ui mt-1">
                        Tips sent to you
                      </p>
                    </CardContent>
                  </Card>
                  <Card className="border-border">
                    <CardContent className="pt-6">
                      <p className="font-display font-bold text-2xl text-foreground">
                        {totalDownloads.toLocaleString()}
                      </p>
                      <p className="text-xs text-muted-foreground font-ui mt-1">
                        Total downloads
                      </p>
                    </CardContent>
                  </Card>
                </div>
                {tips.length > 0 && (
                  <Card className="border-border">
                    <CardHeader>
                      <CardTitle className="font-display text-base flex items-center gap-2">
                        <Zap className="w-4 h-4 text-amber-500" />
                        Recent Tips
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {tips.slice(0, 10).map((tip) => (
                          <div
                            key={tip.id.toString()}
                            className="flex items-center justify-between py-2 border-b border-border last:border-0"
                          >
                            <div>
                              <p className="font-ui text-sm text-foreground">
                                {tip.fromPrincipal.slice(0, 12)}…
                              </p>
                              {tip.message && (
                                <p className="text-xs text-muted-foreground font-ui">
                                  {tip.message}
                                </p>
                              )}
                            </div>
                            <span className="font-display font-bold text-green-600 text-sm">
                              +${(Number(tip.amount) / 100).toFixed(2)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            </Tabs>
          </motion.div>

          <div className="pb-6">
            <Separator className="mb-4" />
            <div className="flex items-center gap-4 text-xs text-slate-500">
              <Link
                to="/marketplace"
                className="flex items-center gap-1.5 hover:text-slate-900 transition-colors"
              >
                <Briefcase className="w-3.5 h-3.5" />
                Marketplace
              </Link>
              <Link
                to="/notifications"
                className="flex items-center gap-1.5 hover:text-slate-900 transition-colors"
              >
                <Bell className="w-3.5 h-3.5" />
                Notifications
              </Link>
              <Link
                to="/"
                className="flex items-center gap-1.5 hover:text-slate-900 transition-colors"
              >
                <GitPullRequest className="w-3.5 h-3.5" />
                Back to Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
