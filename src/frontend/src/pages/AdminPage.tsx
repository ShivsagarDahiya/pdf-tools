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
import type { FooterLink, SponsorPost } from "@/contexts/AdminSettingsContext";
import { useAdminSettings } from "@/contexts/AdminSettingsContext";
import { useInternetIdentity } from "@/hooks/useInternetIdentity";
import {
  useAllUserHistories,
  useAssignUserRole,
  useGetUserProfile,
} from "@/hooks/useQueries";
import type { Principal } from "@icp-sdk/core/principal";
import { Principal as PrincipalClass } from "@icp-sdk/core/principal";
import {
  Camera,
  Check,
  Crop,
  Crown,
  Eye,
  EyeOff,
  FileImage,
  FileMinus,
  FileOutput,
  FileText,
  GitCompare,
  Globe,
  Hash,
  Image,
  Languages,
  LayoutGrid,
  Link2,
  Lock,
  LogIn,
  Merge,
  Minimize2,
  Palette,
  PenLine,
  PenSquare,
  Presentation,
  RotateCw,
  ScanText,
  Scissors,
  Settings,
  Sheet,
  ShieldCheck,
  Stamp,
  TableProperties,
  Trash2,
  Unlock,
  Upload,
  UserCog,
  Users,
  Wand2,
  Wrench,
  X,
  Zap,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { UserRole } from "../backend.d";

// ── Tool list (mirrors Home.tsx CATEGORIES) ──────────────────────────────────
interface Tool {
  name: string;
  path: string;
  category: string;
  icon: LucideIcon;
}

const ALL_TOOLS: Tool[] = [
  // Organize
  { name: "Merge PDF", path: "/merge", category: "Organize PDF", icon: Merge },
  {
    name: "Split PDF",
    path: "/split",
    category: "Organize PDF",
    icon: Scissors,
  },
  {
    name: "Remove Pages",
    path: "/remove-pages",
    category: "Organize PDF",
    icon: Trash2,
  },
  {
    name: "Extract Pages",
    path: "/extract-pages",
    category: "Organize PDF",
    icon: FileMinus,
  },
  {
    name: "Organize PDF",
    path: "/organize",
    category: "Organize PDF",
    icon: LayoutGrid,
  },
  // Optimize
  {
    name: "Compress PDF",
    path: "/compress",
    category: "Optimize PDF",
    icon: Minimize2,
  },
  {
    name: "Optimize PDF",
    path: "/optimize",
    category: "Optimize PDF",
    icon: Zap,
  },
  {
    name: "Repair PDF",
    path: "/repair",
    category: "Optimize PDF",
    icon: Wrench,
  },
  { name: "OCR PDF", path: "/ocr", category: "Optimize PDF", icon: ScanText },
  {
    name: "Scan to PDF",
    path: "/scan-to-pdf",
    category: "Optimize PDF",
    icon: Camera,
  },
  // Convert to
  {
    name: "JPG to PDF",
    path: "/jpg-to-pdf",
    category: "Convert to PDF",
    icon: Image,
  },
  {
    name: "Word to PDF",
    path: "/word-to-pdf",
    category: "Convert to PDF",
    icon: FileText,
  },
  {
    name: "PowerPoint to PDF",
    path: "/pptx-to-pdf",
    category: "Convert to PDF",
    icon: Presentation,
  },
  {
    name: "Excel to PDF",
    path: "/excel-to-pdf",
    category: "Convert to PDF",
    icon: Sheet,
  },
  {
    name: "HTML to PDF",
    path: "/html-to-pdf",
    category: "Convert to PDF",
    icon: Globe,
  },
  // Convert from
  {
    name: "PDF to JPG",
    path: "/pdf-to-jpg",
    category: "Convert from PDF",
    icon: FileImage,
  },
  {
    name: "PDF to Word",
    path: "/pdf-to-word",
    category: "Convert from PDF",
    icon: FileOutput,
  },
  {
    name: "PDF to PowerPoint",
    path: "/pdf-to-pptx",
    category: "Convert from PDF",
    icon: Presentation,
  },
  {
    name: "PDF to Excel",
    path: "/pdf-to-excel",
    category: "Convert from PDF",
    icon: TableProperties,
  },
  {
    name: "PDF to PDF/A",
    path: "/pdf-to-pdfa",
    category: "Convert from PDF",
    icon: FileText,
  },
  // Edit
  { name: "Edit PDF", path: "/edit", category: "Edit PDF", icon: PenLine },
  { name: "Rotate PDF", path: "/rotate", category: "Edit PDF", icon: RotateCw },
  {
    name: "Add Page Numbers",
    path: "/page-numbers",
    category: "Edit PDF",
    icon: Hash,
  },
  { name: "Watermark", path: "/watermark", category: "Edit PDF", icon: Stamp },
  { name: "Crop PDF", path: "/crop", category: "Edit PDF", icon: Crop },
  // Security
  {
    name: "Protect PDF",
    path: "/protect",
    category: "PDF Security",
    icon: Lock,
  },
  {
    name: "Unlock PDF",
    path: "/unlock",
    category: "PDF Security",
    icon: Unlock,
  },
  {
    name: "Sign PDF",
    path: "/sign",
    category: "PDF Security",
    icon: PenSquare,
  },
  {
    name: "Redact PDF",
    path: "/redact",
    category: "PDF Security",
    icon: EyeOff,
  },
  {
    name: "Compare PDF",
    path: "/compare",
    category: "PDF Security",
    icon: GitCompare,
  },
  // Intelligence
  {
    name: "Translate PDF",
    path: "/translate",
    category: "PDF Intelligence",
    icon: Languages,
  },
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
              <ShieldCheck className="w-7 h-7 text-primary" />
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
          return (
            <div key={cat}>
              <h4 className="font-ui font-semibold text-sm text-muted-foreground uppercase tracking-wider mb-3">
                {cat}
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {tools.map((tool) => {
                  const Icon = tool.icon;
                  const isHidden = hiddenServices.includes(tool.path);
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
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Icon className="w-4 h-4 text-primary" />
                      </div>
                      <span className="font-ui text-sm text-foreground flex-1">
                        {tool.name}
                      </span>
                      {isHidden ? (
                        <EyeOff className="w-4 h-4 text-muted-foreground" />
                      ) : (
                        <Eye className="w-4 h-4 text-primary" />
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
    "#E25C3B", // coral-red (default)
    "#3B8CE2", // blue
    "#2DBD6E", // green
    "#9B3BE2", // purple
    "#E2A83B", // amber
    "#E23B3B", // red
    "#3BE2D4", // teal
    "#E23B9B", // pink
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
            <Palette className="w-4 h-4 text-primary" />
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

          {/* Live preview */}
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
                <FileText className="w-4 h-4 text-white" />
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
            Leave blank to use the default "© {new Date().getFullYear()}. Built
            with ❤ using caffeine.ai"
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
            <ShieldCheck className="w-3.5 h-3.5" />
            Make Admin
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={handleRemoveAdmin}
            disabled={isPending}
            className="font-ui text-xs gap-1.5 h-7 text-muted-foreground hover:text-foreground"
          >
            <UserCog className="w-3.5 h-3.5" />
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
          <Users className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
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
          <Wand2 className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-muted-foreground font-ui text-sm">
            No sponsor posts yet. Add your first one above.
          </p>
        </div>
      )}
    </div>
  );
}

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
              <Settings className="w-5 h-5 text-primary" />
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
          <TabsList className="grid grid-cols-3 sm:grid-cols-6 h-auto gap-1 bg-muted p-1 rounded-xl">
            {[
              { value: "services", icon: Eye, label: "Services" },
              { value: "theme", icon: Palette, label: "Theme" },
              { value: "header", icon: FileText, label: "Header" },
              { value: "footer", icon: FileText, label: "Footer" },
              { value: "users", icon: Users, label: "Users" },
              { value: "sponsors", icon: Crown, label: "Sponsors" },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  className="font-ui text-xs flex items-center gap-1.5 data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-lg py-2"
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </TabsTrigger>
              );
            })}
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
        </Tabs>
      </motion.div>
    </main>
  );
}
