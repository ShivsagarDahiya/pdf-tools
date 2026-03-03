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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useActor } from "@/hooks/useActor";
import { useInternetIdentity } from "@/hooks/useInternetIdentity";
import { Link, useParams } from "@tanstack/react-router";
import {
  ArrowLeft,
  Copy,
  Download,
  ExternalLink,
  Github,
  Globe,
  Link2,
  Loader2,
  Mail,
  QrCode,
  ShoppingBag,
  Star,
  UserCheck,
  UserPlus,
  Users,
  Zap,
} from "lucide-react";
import { motion } from "motion/react";
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

const CATEGORY_COLORS: Record<string, string> = {
  Education: "#3B8CE2",
  Technology: "#2DBD6E",
  Business: "#E2A83B",
  Design: "#9B3BE2",
  Finance: "#E25C3B",
  Other: "#3BE2D4",
};

export function CreatorProfile() {
  const { principalId } = useParams({ strict: false }) as {
    principalId: string;
  };
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();
  const [creator, setCreator] = useState<CreatorProfile | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [followers, setFollowers] = useState(0);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [avgRating, setAvgRating] = useState(4);
  const [tipAmount, setTipAmount] = useState("");
  const [tipMessage, setTipMessage] = useState("");
  const [isTipping, setIsTipping] = useState(false);
  const [tipOpen, setTipOpen] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState("");
  const [qrOpen, setQrOpen] = useState(false);

  const profileUrl = typeof window !== "undefined" ? window.location.href : "";

  useEffect(() => {
    async function load() {
      if (!actor || isFetching || !principalId) return;
      setIsLoading(true);
      try {
        const [creatorData, prods, followerList, avgR] = await Promise.all([
          typeof (actor as any).getCreatorProfile === "function"
            ? (actor as any).getCreatorProfile(principalId)
            : Promise.resolve(null),
          typeof (actor as any).getProductsByCreator === "function"
            ? (actor as any).getProductsByCreator(principalId)
            : Promise.resolve([]),
          typeof (actor as any).getFollowers === "function"
            ? (actor as any).getFollowers(principalId)
            : Promise.resolve([]),
          typeof (actor as any).getAverageRating === "function"
            ? (actor as any).getAverageRating(`creator:${principalId}`)
            : Promise.resolve(BigInt(4)),
        ]);

        setCreator(creatorData || null);
        setProducts(prods || []);
        setFollowers((followerList || []).length);
        setAvgRating(Number(avgR || 4));

        if (identity && typeof (actor as any).isFollowing === "function") {
          const following = await (actor as any).isFollowing(principalId);
          setIsFollowing(following || false);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, [actor, isFetching, principalId, identity]);

  const handleFollow = async () => {
    if (!identity) {
      toast.error("Please sign in to follow");
      return;
    }
    if (!actor) return;
    try {
      if (isFollowing) {
        if (typeof (actor as any).unfollow === "function") {
          await (actor as any).unfollow(principalId);
          setIsFollowing(false);
          setFollowers((f) => Math.max(0, f - 1));
        }
      } else {
        if (typeof (actor as any).follow === "function") {
          await (actor as any).follow(principalId);
          setIsFollowing(true);
          setFollowers((f) => f + 1);
        }
      }
    } catch {
      toast.error("Failed to update follow");
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(profileUrl);
    toast.success("Link copied!");
  };

  const handleQrCode = () => {
    // Use Google Charts API for QR code generation (no package needed)
    const encoded = encodeURIComponent(profileUrl);
    const qrUrl = `https://chart.googleapis.com/chart?chs=256x256&cht=qr&chl=${encoded}&choe=UTF-8`;
    setQrDataUrl(qrUrl);
    setQrOpen(true);
  };

  const handleTip = async () => {
    if (!identity) {
      toast.error("Please sign in to send a tip");
      return;
    }
    if (!actor) return;
    const amount = Number.parseFloat(tipAmount);
    if (Number.isNaN(amount) || amount <= 0) {
      toast.error("Enter a valid amount");
      return;
    }
    setIsTipping(true);
    try {
      if (typeof (actor as any).recordTip === "function") {
        await (actor as any).recordTip(
          principalId,
          BigInt(Math.round(amount * 100)),
          tipMessage,
        );
        toast.success(`Tip of $${amount.toFixed(2)} sent! 🎉`);
        setTipOpen(false);
        setTipAmount("");
        setTipMessage("");
      }
    } catch {
      toast.error("Failed to send tip");
    } finally {
      setIsTipping(false);
    }
  };

  if (isLoading) {
    return (
      <main className="min-h-screen bg-background">
        <div className="container max-w-5xl py-8 space-y-6">
          <Skeleton className="h-6 w-32" />
          <div className="flex gap-6">
            <Skeleton className="w-24 h-24 rounded-full" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (!creator) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="font-display font-semibold text-xl text-foreground mb-4">
            Creator not found
          </p>
          <Link to="/marketplace">
            <Button>Browse Marketplace</Button>
          </Link>
        </div>
      </main>
    );
  }

  const categoryColor = CATEGORY_COLORS[creator.category] || "#3BE2D4";
  const totalDownloads = products.reduce(
    (sum, p) => sum + Number(p.downloadCount),
    0,
  );

  return (
    <main className="min-h-screen bg-background">
      {/* Breadcrumb */}
      <div className="border-b border-border bg-card/50">
        <div className="container max-w-5xl py-3">
          <nav className="flex items-center gap-1 text-sm text-muted-foreground font-ui">
            <Link
              to="/marketplace"
              className="hover:text-foreground flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Marketplace
            </Link>
            <span className="mx-1">/</span>
            <span className="text-foreground truncate max-w-[200px]">
              {creator.displayName}
            </span>
          </nav>
        </div>
      </div>

      <div className="container max-w-5xl py-8">
        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-8"
        >
          <div className="flex flex-col sm:flex-row gap-6 items-start">
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              <div className="w-24 h-24 rounded-2xl overflow-hidden border-2 border-border bg-gradient-to-br from-primary/20 to-accent/30">
                {creator.profilePicUrl ? (
                  <img
                    src={creator.profilePicUrl}
                    alt={creator.displayName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-3xl font-bold font-display text-primary">
                    {creator.displayName.slice(0, 2).toUpperCase()}
                  </div>
                )}
              </div>
              <div
                className="absolute -bottom-2 -right-2 w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-bold font-ui"
                style={{ backgroundColor: categoryColor }}
              >
                ✓
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-3 mb-2">
                <h1 className="font-display font-bold text-2xl text-foreground">
                  {creator.displayName}
                </h1>
                <Badge
                  className="font-ui text-xs"
                  style={{
                    backgroundColor: `${categoryColor}18`,
                    color: categoryColor,
                    border: `1px solid ${categoryColor}30`,
                  }}
                >
                  {creator.profileType || "Creator"}
                </Badge>
                <Badge variant="secondary" className="font-ui text-xs">
                  {creator.category}
                </Badge>
              </div>

              <p className="text-muted-foreground font-ui mb-4 leading-relaxed">
                {creator.bio || "No bio yet."}
              </p>

              <div className="flex flex-wrap items-center gap-4 text-sm mb-4">
                <div className="flex items-center gap-1.5 text-muted-foreground font-ui">
                  <Users className="w-4 h-4" />
                  <span className="font-semibold text-foreground">
                    {followers}
                  </span>{" "}
                  followers
                </div>
                <div className="flex items-center gap-1.5 text-muted-foreground font-ui">
                  <ShoppingBag className="w-4 h-4" />
                  <span className="font-semibold text-foreground">
                    {products.length}
                  </span>{" "}
                  products
                </div>
                <div className="flex items-center gap-1.5 text-muted-foreground font-ui">
                  <Download className="w-4 h-4" />
                  <span className="font-semibold text-foreground">
                    {totalDownloads.toLocaleString()}
                  </span>{" "}
                  downloads
                </div>
                <div className="flex items-center gap-1.5 font-ui">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <span className="font-semibold text-foreground">
                    {avgRating.toFixed(1)}
                  </span>
                </div>
              </div>

              {/* Social Links */}
              <div className="flex flex-wrap items-center gap-2">
                {creator.githubUrl && (
                  <a
                    href={creator.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <Github className="w-5 h-5" />
                  </a>
                )}
                {creator.websiteUrl && (
                  <a
                    href={creator.websiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <Globe className="w-5 h-5" />
                  </a>
                )}
                {creator.contactEmail && (
                  <a
                    href={`mailto:${creator.contactEmail}`}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <Mail className="w-5 h-5" />
                  </a>
                )}
                {(creator.socialLinks || []).map((link) => (
                  <a
                    key={link}
                    href={link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <Link2 className="w-5 h-5" />
                  </a>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-2 flex-shrink-0">
              <Button
                variant={isFollowing ? "outline" : "default"}
                onClick={handleFollow}
                className="font-ui gap-2 min-w-[140px]"
              >
                {isFollowing ? (
                  <>
                    <UserCheck className="w-4 h-4" />
                    Following
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" />
                    Follow
                  </>
                )}
              </Button>

              <Dialog open={tipOpen} onOpenChange={setTipOpen}>
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    className="font-ui gap-2 text-amber-600 border-amber-200 hover:bg-amber-50"
                  >
                    <Zap className="w-4 h-4" />
                    Thank Creator
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle className="font-display">
                      Send a Tip to {creator.displayName}
                    </DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <Label className="font-ui">Amount ($)</Label>
                      <Input
                        type="number"
                        value={tipAmount}
                        onChange={(e) => setTipAmount(e.target.value)}
                        placeholder="5.00"
                        min="0.50"
                        step="0.50"
                        className="font-ui"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="font-ui">Message (optional)</Label>
                      <Textarea
                        value={tipMessage}
                        onChange={(e) => setTipMessage(e.target.value)}
                        placeholder="Love your work!"
                        className="font-ui text-sm"
                        rows={2}
                      />
                    </div>
                    <Button
                      className="w-full font-ui gap-2"
                      onClick={handleTip}
                      disabled={isTipping}
                    >
                      {isTipping ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Zap className="w-4 h-4" />
                      )}
                      Send Tip
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>

              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCopyLink}
                  className="font-ui gap-1 text-xs flex-1"
                >
                  <Copy className="w-3.5 h-3.5" />
                  Copy Link
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleQrCode}
                  className="font-ui gap-1 text-xs flex-1"
                >
                  <QrCode className="w-3.5 h-3.5" />
                  QR Code
                </Button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Tabs */}
        <Tabs defaultValue="products">
          <TabsList className="font-ui mb-6">
            <TabsTrigger value="products">
              Products ({products.length})
            </TabsTrigger>
            <TabsTrigger value="about">About</TabsTrigger>
          </TabsList>

          <TabsContent value="products">
            {products.length === 0 ? (
              <div className="py-12 text-center">
                <ShoppingBag className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
                <p className="font-display font-semibold text-muted-foreground">
                  No products yet
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {products.map((product) => {
                  const color = CATEGORY_COLORS[product.category] || "#94a3b8";
                  return (
                    <motion.div
                      key={product.id.toString()}
                      whileHover={{ y: -3 }}
                      transition={{ duration: 0.16 }}
                    >
                      <a href={`/product/${product.id.toString()}`}>
                        <Card className="h-full border-border hover:border-primary/30 transition-all">
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
                            <div className="flex items-center gap-2 text-xs text-muted-foreground font-ui">
                              <Download className="w-3 h-3" />
                              {Number(product.downloadCount).toLocaleString()}
                              <ExternalLink className="w-3 h-3 ml-auto" />
                            </div>
                          </CardContent>
                        </Card>
                      </a>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </TabsContent>

          <TabsContent value="about">
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="font-display text-lg">
                  About {creator.displayName}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-muted-foreground font-ui leading-relaxed">
                    {creator.bio || "No bio provided."}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="font-ui font-semibold text-muted-foreground text-xs uppercase tracking-wider mb-1">
                      Category
                    </p>
                    <p className="font-ui text-foreground">
                      {creator.category}
                    </p>
                  </div>
                  <div>
                    <p className="font-ui font-semibold text-muted-foreground text-xs uppercase tracking-wider mb-1">
                      Type
                    </p>
                    <p className="font-ui text-foreground">
                      {creator.profileType || "Creator"}
                    </p>
                  </div>
                  {creator.contactEmail && (
                    <div>
                      <p className="font-ui font-semibold text-muted-foreground text-xs uppercase tracking-wider mb-1">
                        Email
                      </p>
                      <a
                        href={`mailto:${creator.contactEmail}`}
                        className="font-ui text-primary hover:underline"
                      >
                        {creator.contactEmail}
                      </a>
                    </div>
                  )}
                  {creator.websiteUrl && (
                    <div>
                      <p className="font-ui font-semibold text-muted-foreground text-xs uppercase tracking-wider mb-1">
                        Website
                      </p>
                      <a
                        href={creator.websiteUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-ui text-primary hover:underline truncate block"
                      >
                        {creator.websiteUrl}
                      </a>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* QR Code Dialog */}
      <Dialog open={qrOpen} onOpenChange={setQrOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-display">Share Profile</DialogTitle>
          </DialogHeader>
          <div className="text-center space-y-4">
            {qrDataUrl && (
              <img
                src={qrDataUrl}
                alt="QR Code"
                className="mx-auto w-48 h-48"
              />
            )}
            <p className="text-xs text-muted-foreground font-ui break-all">
              {profileUrl}
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyLink}
              className="font-ui gap-2"
            >
              <Copy className="w-3.5 h-3.5" />
              Copy Link
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </main>
  );
}
