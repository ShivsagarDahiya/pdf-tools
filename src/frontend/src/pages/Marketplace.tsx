import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useActor } from "@/hooks/useActor";
import { useInternetIdentity } from "@/hooks/useInternetIdentity";
import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Download,
  ExternalLink,
  Megaphone,
  Search,
  ShoppingBag,
  Star,
} from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";

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

const CATEGORIES = [
  "All",
  "Education",
  "Technology",
  "Business",
  "Design",
  "Finance",
  "Other",
];

const CATEGORY_COLORS: Record<string, string> = {
  Education: "#3B8CE2",
  Technology: "#2DBD6E",
  Business: "#E2A83B",
  Design: "#9B3BE2",
  Finance: "#E25C3B",
  Other: "#3BE2D4",
};

// Sample products for first-load experience
const SAMPLE_PRODUCTS: Product[] = [
  {
    id: BigInt(1),
    title: "Complete React Developer Course",
    description:
      "Master React 19, TypeScript, and modern web development patterns with 12 hours of video content.",
    category: "Education",
    price: BigInt(2999),
    isFree: false,
    tags: ["React", "TypeScript", "Web Dev"],
    fileUrl: "",
    paymentLink: "#",
    creatorPrincipal: "sample-1",
    downloadCount: BigInt(342),
    createdAt: BigInt(Date.now()),
  },
  {
    id: BigInt(2),
    title: "Business Plan Template Bundle",
    description:
      "Professional business plan templates for startups. Includes financial projections, market analysis, and pitch deck.",
    category: "Business",
    price: BigInt(0),
    isFree: true,
    tags: ["Business", "Templates", "Startup"],
    fileUrl: "#",
    paymentLink: "",
    creatorPrincipal: "sample-2",
    downloadCount: BigInt(1204),
    createdAt: BigInt(Date.now()),
  },
  {
    id: BigInt(3),
    title: "UI/UX Design System Kit",
    description:
      "Comprehensive Figma design system with 500+ components, color tokens, and typography guidelines.",
    category: "Design",
    price: BigInt(4999),
    isFree: false,
    tags: ["Figma", "UI", "Design System"],
    fileUrl: "",
    paymentLink: "#",
    creatorPrincipal: "sample-3",
    downloadCount: BigInt(876),
    createdAt: BigInt(Date.now()),
  },
  {
    id: BigInt(4),
    title: "Python Data Science MBA Project",
    description:
      "Complete MBA data science project with Python code, dataset, and research paper. Ready to submit.",
    category: "Education",
    price: BigInt(1499),
    isFree: false,
    tags: ["Python", "MBA", "Data Science"],
    fileUrl: "",
    paymentLink: "#",
    creatorPrincipal: "sample-4",
    downloadCount: BigInt(523),
    createdAt: BigInt(Date.now()),
  },
  {
    id: BigInt(5),
    title: "Personal Finance Excel Tracker",
    description:
      "Advanced Excel spreadsheet for tracking income, expenses, investments, and financial goals automatically.",
    category: "Finance",
    price: BigInt(0),
    isFree: true,
    tags: ["Excel", "Finance", "Budgeting"],
    fileUrl: "#",
    paymentLink: "",
    creatorPrincipal: "sample-5",
    downloadCount: BigInt(2891),
    createdAt: BigInt(Date.now()),
  },
  {
    id: BigInt(6),
    title: "Node.js REST API GitHub Starter",
    description:
      "Production-ready Node.js REST API boilerplate with JWT auth, Prisma ORM, and complete test coverage.",
    category: "Technology",
    price: BigInt(1999),
    isFree: false,
    tags: ["Node.js", "API", "GitHub"],
    fileUrl: "",
    paymentLink: "#",
    creatorPrincipal: "sample-6",
    downloadCount: BigInt(741),
    createdAt: BigInt(Date.now()),
  },
];

function AdCard({ ad, onClick }: { ad: Ad; onClick: () => void }) {
  return (
    <motion.a
      href={ad.linkUrl}
      target="_blank"
      rel="noopener noreferrer"
      onClick={onClick}
      whileHover={{ scale: 1.01 }}
      className="flex-shrink-0 w-64 block relative rounded-xl overflow-hidden border border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 shadow-sm cursor-pointer"
    >
      {ad.imageUrl && (
        <img
          src={ad.imageUrl}
          alt={ad.title}
          className="w-full h-32 object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = "none";
          }}
        />
      )}
      <div className="p-3">
        <div className="flex items-start justify-between gap-2">
          <div>
            <Badge className="text-xs bg-amber-500 text-white border-0 mb-1.5 font-ui">
              <Megaphone className="w-2.5 h-2.5 mr-1" />
              Sponsored
            </Badge>
            <p className="font-display font-semibold text-sm text-foreground line-clamp-2">
              {ad.title}
            </p>
          </div>
          <ExternalLink className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0 mt-1" />
        </div>
        {ad.coupon && (
          <div className="mt-2 px-2 py-1 bg-amber-100 border border-amber-300 rounded-md text-xs font-ui font-semibold text-amber-800">
            🎟 {ad.coupon}
          </div>
        )}
      </div>
    </motion.a>
  );
}

function ProductCard({ product }: { product: Product }) {
  const categoryColor = CATEGORY_COLORS[product.category] || "#94a3b8";
  const priceDisplay = product.isFree
    ? "Free"
    : `$${(Number(product.price) / 100).toFixed(2)}`;

  return (
    <motion.div whileHover={{ y: -4 }} transition={{ duration: 0.18 }}>
      <a href={`/product/${product.id.toString()}`}>
        <Card className="h-full border-border hover:border-primary/30 transition-all duration-200 overflow-hidden group">
          <div
            className="h-1.5 w-full"
            style={{ backgroundColor: categoryColor }}
          />
          <CardContent className="p-5">
            <div className="flex items-start justify-between gap-3 mb-3">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: `${categoryColor}18` }}
              >
                <ShoppingBag
                  className="w-5 h-5"
                  style={{ color: categoryColor }}
                />
              </div>
              <Badge
                className="text-xs font-ui flex-shrink-0"
                style={{
                  backgroundColor: `${categoryColor}18`,
                  color: categoryColor,
                  border: `1px solid ${categoryColor}30`,
                }}
              >
                {product.category}
              </Badge>
            </div>

            <h3 className="font-display font-semibold text-sm text-foreground mb-1.5 line-clamp-2 group-hover:text-primary transition-colors">
              {product.title}
            </h3>
            <p className="text-xs text-muted-foreground line-clamp-2 mb-3 font-ui">
              {product.description}
            </p>

            <div className="flex flex-wrap gap-1 mb-3">
              {product.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="text-xs px-1.5 py-0.5 rounded-md bg-muted text-muted-foreground font-ui"
                >
                  {tag}
                </span>
              ))}
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 text-xs text-muted-foreground font-ui">
                <span className="flex items-center gap-1">
                  <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                  4.5
                </span>
                <span className="flex items-center gap-1">
                  <Download className="w-3 h-3" />
                  {Number(product.downloadCount).toLocaleString()}
                </span>
              </div>
              <span
                className={`text-sm font-display font-bold ${product.isFree ? "text-green-600" : "text-primary"}`}
              >
                {priceDisplay}
              </span>
            </div>
          </CardContent>
        </Card>
      </a>
    </motion.div>
  );
}

export function Marketplace() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();
  const [products, setProducts] = useState<Product[]>([]);
  const [ads, setAds] = useState<Ad[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [priceFilter, setPriceFilter] = useState("all");

  useEffect(() => {
    async function load() {
      if (!actor || isFetching) return;
      setIsLoading(true);
      try {
        const [prods, adsData] = await Promise.all([
          typeof (actor as any).getAllProducts === "function"
            ? ((actor as any).getAllProducts() as Promise<Product[]>)
            : Promise.resolve([]),
          typeof (actor as any).getActiveAds === "function"
            ? ((actor as any).getActiveAds() as Promise<Ad[]>)
            : Promise.resolve([]),
        ]);
        setProducts(prods.length > 0 ? prods : SAMPLE_PRODUCTS);
        setAds(adsData || []);
      } catch {
        setProducts(SAMPLE_PRODUCTS);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, [actor, isFetching]);

  const handleAdClick = async (adId: bigint) => {
    if (!actor || typeof (actor as any).recordAdClick !== "function") return;
    try {
      await (actor as any).recordAdClick(adId);
    } catch {}
  };

  const filtered = products.filter((p) => {
    const matchSearch =
      !search ||
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase()) ||
      p.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()));
    const matchCat = category === "All" || p.category === category;
    const matchPrice =
      priceFilter === "all" ||
      (priceFilter === "free" && p.isFree) ||
      (priceFilter === "paid" && !p.isFree);
    return matchSearch && matchCat && matchPrice;
  });

  return (
    <main className="min-h-screen bg-background">
      {/* Hero */}
      <section className="bg-gradient-to-br from-card to-accent/20 border-b border-border py-10">
        <div className="container max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="text-center max-w-2xl mx-auto mb-8"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-ui font-semibold mb-4">
              <ShoppingBag className="w-3.5 h-3.5" />
              Creator Marketplace
            </div>
            <h1 className="font-display font-bold text-4xl text-foreground mb-3">
              Discover Digital Products
            </h1>
            <p className="text-muted-foreground font-ui text-lg">
              Resumes, projects, templates, code repositories — created by
              talented creators worldwide
            </p>
          </motion.div>

          {/* Search & Filters */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="flex flex-col sm:flex-row gap-3 max-w-3xl mx-auto"
          >
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search products, tags, creators..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 font-ui"
              />
            </div>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="w-full sm:w-44 font-ui">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat} className="font-ui">
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={priceFilter} onValueChange={setPriceFilter}>
              <SelectTrigger className="w-full sm:w-32 font-ui">
                <SelectValue placeholder="Price" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all" className="font-ui">
                  All prices
                </SelectItem>
                <SelectItem value="free" className="font-ui">
                  Free
                </SelectItem>
                <SelectItem value="paid" className="font-ui">
                  Paid
                </SelectItem>
              </SelectContent>
            </Select>
          </motion.div>
        </div>
      </section>

      <div className="container max-w-6xl py-8">
        {/* Ads Carousel */}
        {ads.length > 0 && (
          <section className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Megaphone className="w-4 h-4 text-amber-500" />
              <h2 className="font-display font-semibold text-sm text-muted-foreground uppercase tracking-wider">
                Sponsored
              </h2>
            </div>
            <div className="flex gap-4 overflow-x-auto pb-3 scrollbar-hide">
              {ads.map((ad) => (
                <AdCard
                  key={ad.id.toString()}
                  ad={ad}
                  onClick={() => handleAdClick(ad.id)}
                />
              ))}
            </div>
          </section>
        )}

        {/* Products Grid */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display font-bold text-xl text-foreground">
            {category === "All" ? "All Products" : category}{" "}
            <span className="text-muted-foreground font-ui text-base font-normal">
              ({filtered.length})
            </span>
          </h2>
          {identity && (
            <Link to="/creator-dashboard">
              <Button variant="outline" size="sm" className="font-ui gap-2">
                Sell Your Product
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          )}
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: skeleton loader
              <Card key={i} className="h-52">
                <CardContent className="p-5 space-y-3">
                  <Skeleton className="h-10 w-10 rounded-lg" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-2/3" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-20 text-center">
            <ShoppingBag className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
            <p className="font-display font-semibold text-lg text-muted-foreground mb-2">
              No products found
            </p>
            <p className="text-sm text-muted-foreground font-ui mb-6">
              Try adjusting your search or filters
            </p>
            <Button
              variant="outline"
              onClick={() => {
                setSearch("");
                setCategory("All");
                setPriceFilter("all");
              }}
              className="font-ui"
            >
              Clear filters
            </Button>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
          >
            {filtered.map((product) => (
              <ProductCard key={product.id.toString()} product={product} />
            ))}
          </motion.div>
        )}

        {/* Become a creator CTA */}
        {!identity && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            className="mt-12 rounded-2xl bg-gradient-to-r from-primary/10 to-accent/20 border border-border p-8 text-center"
          >
            <h2 className="font-display font-bold text-2xl text-foreground mb-2">
              Ready to sell your work?
            </h2>
            <p className="text-muted-foreground font-ui mb-6">
              Join thousands of creators selling resumes, projects, and
              templates
            </p>
            <Link to="/creator-dashboard">
              <Button className="font-ui gap-2">
                Start Selling
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </motion.div>
        )}
      </div>
    </main>
  );
}
