import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Link } from "@tanstack/react-router";
import {
  Check,
  ChevronRight,
  Crown,
  Home,
  Shield,
  Sparkles,
  X,
  Zap,
} from "lucide-react";
import { motion } from "motion/react";

const COMPARISON_ROWS = [
  { feature: "Merge, Split, Compress PDF", free: true, premium: true },
  { feature: "Rotate, Watermark, Add Page Numbers", free: true, premium: true },
  { feature: "PDF to JPG / JPG to PDF", free: true, premium: true },
  { feature: "Protect & Unlock PDF", free: true, premium: true },
  { feature: "Remove & Extract Pages", free: true, premium: true },
  { feature: "Sign & Edit PDF", free: true, premium: true },
  { feature: "Crop PDF", free: true, premium: true },
  { feature: "File size up to 15 MB", free: true, premium: false },
  { feature: "File size up to 500 MB", free: false, premium: true },
  { feature: "Batch processing (multiple files)", free: false, premium: true },
  { feature: "Custom Workflows", free: false, premium: true },
  { feature: "OCR PDF (text recognition)", free: false, premium: true },
  { feature: "Scan to PDF (camera)", free: false, premium: true },
  { feature: "Word / Excel / PowerPoint to PDF", free: false, premium: true },
  { feature: "PDF to Word / Excel / PowerPoint", free: false, premium: true },
  { feature: "PDF to PDF/A (archive format)", free: false, premium: true },
  { feature: "Repair PDF", free: false, premium: true },
  { feature: "Redact PDF (permanent removal)", free: false, premium: true },
  { feature: "Compare PDF", free: false, premium: true },
  { feature: "AI Translate PDF (100+ languages)", free: false, premium: true },
  { feature: "AI Optimization Suggestions", free: false, premium: true },
  { feature: "No ads", free: false, premium: true },
  { feature: "Priority processing", free: false, premium: true },
  { feature: "Desktop app (offline)", free: false, premium: true },
];

const PREMIUM_HIGHLIGHTS = [
  {
    icon: Zap,
    title: "2x Faster Processing",
    desc: "Priority servers process your files immediately, no queue.",
  },
  {
    icon: Shield,
    title: "Enhanced Security",
    desc: "Files encrypted in transit and automatically deleted after 2 hours.",
  },
  {
    icon: Sparkles,
    title: "AI-Powered Tools",
    desc: "Translate, OCR, and optimize with Gemini AI integration.",
  },
  {
    icon: Crown,
    title: "30+ Premium Tools",
    desc: "Unlock every tool including Word, Excel, and PowerPoint conversion.",
  },
];

export function PremiumPage() {
  return (
    <main className="min-h-screen bg-background">
      {/* Breadcrumb */}
      <div className="border-b border-border bg-card/50">
        <div className="container max-w-5xl py-3">
          <nav
            aria-label="Breadcrumb"
            className="flex items-center gap-1 text-sm text-muted-foreground"
          >
            <Link
              to="/"
              className="flex items-center gap-1 hover:text-foreground transition-colors"
            >
              <Home className="w-3.5 h-3.5" />
              <span>Home</span>
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-foreground font-medium">Premium</span>
          </nav>
        </div>
      </div>

      <div className="container max-w-5xl py-14">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="text-center mb-14"
        >
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full text-sm font-ui font-medium mb-6">
            <Crown className="w-3.5 h-3.5" />
            Unlock all 30+ tools
          </div>
          <h1 className="font-display font-bold text-4xl text-foreground mb-4">
            PDF Tools Premium
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Get access to every tool, unlimited file sizes, AI-powered features,
            and batch processing for one simple price.
          </p>
        </motion.div>

        {/* Pricing cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="grid sm:grid-cols-2 gap-6 mb-14 max-w-2xl mx-auto"
        >
          {/* Free */}
          <Card className="border-border shadow-card">
            <CardHeader className="pb-4">
              <CardTitle className="font-display">Free</CardTitle>
              <div className="flex items-baseline gap-1">
                <span className="font-display font-bold text-3xl text-foreground">
                  $0
                </span>
                <span className="text-muted-foreground text-sm">/month</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Essential tools, always free
              </p>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                "11 core PDF tools",
                "Up to 15 MB per file",
                "100% browser-based processing",
                "Processing history",
              ].map((feat) => (
                <div key={feat} className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-success flex-shrink-0" />
                  <span className="text-sm text-foreground">{feat}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Premium */}
          <Card className="border-primary/30 shadow-card relative overflow-hidden">
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-primary via-orange-400 to-primary" />
            <CardHeader className="pb-4">
              <div className="flex items-center gap-2">
                <CardTitle className="font-display">Premium</CardTitle>
                <Badge className="font-ui text-xs bg-primary/10 text-primary border-primary/20">
                  Most Popular
                </Badge>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="font-display font-bold text-3xl text-foreground">
                  $6.99
                </span>
                <span className="text-muted-foreground text-sm">/month</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Billed annually ($83.88/year)
              </p>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                "All 30+ PDF tools unlocked",
                "Up to 500 MB per file",
                "AI-powered OCR and Translation",
                "Batch processing",
                "Custom workflows",
                "Desktop & mobile apps",
                "Priority processing",
                "No ads",
              ].map((feat) => (
                <div key={feat} className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-primary flex-shrink-0" />
                  <span className="text-sm text-foreground">{feat}</span>
                </div>
              ))}
              <Button
                size="lg"
                className="w-full mt-4 bg-primary hover:bg-primary/90 text-primary-foreground font-ui font-semibold"
              >
                <Crown className="mr-2 w-4 h-4" />
                Upgrade to Premium
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Highlights */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="mb-14"
        >
          <h2 className="font-display font-bold text-xl text-foreground mb-6 flex items-center gap-2">
            <span className="w-1 h-5 rounded-full bg-primary inline-block" />
            Why Upgrade
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {PREMIUM_HIGHLIGHTS.map((h) => {
              const Icon = h.icon;
              return (
                <Card key={h.title} className="border-border shadow-card">
                  <CardContent className="pt-5">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-3">
                      <Icon className="w-5 h-5 text-primary" />
                    </div>
                    <h3 className="font-display font-semibold text-sm text-foreground mb-1.5">
                      {h.title}
                    </h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {h.desc}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </motion.div>

        {/* Full comparison table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
        >
          <h2 className="font-display font-bold text-xl text-foreground mb-6 flex items-center gap-2">
            <span className="w-1 h-5 rounded-full bg-primary inline-block" />
            Full Feature Comparison
          </h2>
          <Card className="border-border shadow-card overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40">
                  <TableHead className="font-display font-semibold text-foreground">
                    Feature
                  </TableHead>
                  <TableHead className="text-center font-display font-semibold text-foreground">
                    Free
                  </TableHead>
                  <TableHead className="text-center font-display font-semibold text-primary">
                    Premium
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {COMPARISON_ROWS.map((row) => (
                  <TableRow key={row.feature} className="hover:bg-muted/20">
                    <TableCell className="font-ui text-sm text-foreground py-3">
                      {row.feature}
                    </TableCell>
                    <TableCell className="text-center py-3">
                      {row.free ? (
                        <Check className="w-4 h-4 text-success mx-auto" />
                      ) : (
                        <X className="w-4 h-4 text-muted-foreground mx-auto" />
                      )}
                    </TableCell>
                    <TableCell className="text-center py-3">
                      {row.premium ? (
                        <Check className="w-4 h-4 text-primary mx-auto" />
                      ) : (
                        <X className="w-4 h-4 text-muted-foreground mx-auto" />
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>

          <div className="text-center mt-8">
            <Button
              size="lg"
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-ui font-semibold px-10"
            >
              <Crown className="mr-2 w-4 h-4" />
              Get Premium — $6.99/month
            </Button>
            <p className="text-xs text-muted-foreground mt-2">
              Cancel anytime. No hidden fees.
            </p>
          </div>
        </motion.div>
      </div>
    </main>
  );
}
