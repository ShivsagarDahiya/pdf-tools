import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Link } from "@tanstack/react-router";
import {
  Check,
  Crown,
  ImageIcon,
  Infinity as InfinityIcon,
  Shield,
  Sparkles,
  Zap,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";

function getUserPlan(): "free" | "plus" {
  return (localStorage.getItem("userPlan") as "free" | "plus") || "free";
}

const PLUS_FEATURES = [
  { icon: ImageIcon, text: "Max file size: 200MB (vs 5MB free)" },
  { icon: InfinityIcon, text: "Unlimited batch processing" },
  { icon: Shield, text: "No watermarks on output" },
  { icon: Sparkles, text: "Background removal tool" },
  { icon: Zap, text: "Priority processing" },
  { icon: Crown, text: "Cloud storage history" },
];

const FREE_FEATURES = [
  "Max file size: 5MB",
  "Max 10 files per batch",
  "Limited compression control",
  "No background removal",
  "Watermark added to output",
  "Daily usage limit (20 ops)",
];

export function UpgradePage() {
  const currentPlan = getUserPlan();
  const [billing, setBilling] = useState<"monthly" | "yearly">("yearly");

  const handleGetPlus = () => {
    toast.info(
      "Stripe integration coming soon — contact admin to upgrade manually",
      { duration: 5000 },
    );
  };

  return (
    <main className="min-h-screen bg-background">
      <div className="border-b border-border bg-card/50">
        <div className="container max-w-4xl py-3">
          <nav className="flex items-center gap-1 text-sm text-muted-foreground">
            <Link to="/" className="hover:text-foreground transition-colors">
              Home
            </Link>
            <span className="mx-1">/</span>
            <span className="text-foreground font-medium">Upgrade to Plus</span>
          </nav>
        </div>
      </div>

      <div className="container max-w-4xl py-14">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-100 text-amber-700 text-sm font-ui font-medium mb-6">
            <Crown className="w-4 h-4" />
            Unlock the full experience
          </div>
          <h1 className="font-display font-bold text-4xl sm:text-5xl text-foreground mb-4">
            Upgrade to <span className="text-amber-500">Plus</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            Remove all limitations. Process larger files, unlimited batches, no
            watermarks, and unlock AI-powered background removal.
          </p>

          {currentPlan === "plus" && (
            <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-100 text-green-700 text-sm font-ui">
              <Check className="w-4 h-4" />
              You're already on the Plus plan!
            </div>
          )}
        </motion.div>

        {/* Billing Toggle */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex justify-center mb-10"
        >
          <div className="inline-flex items-center bg-muted rounded-full p-1 gap-1">
            <button
              type="button"
              onClick={() => setBilling("monthly")}
              className={`px-5 py-2 rounded-full text-sm font-ui font-medium transition-all ${
                billing === "monthly"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Monthly
            </button>
            <button
              type="button"
              onClick={() => setBilling("yearly")}
              className={`px-5 py-2 rounded-full text-sm font-ui font-medium transition-all flex items-center gap-2 ${
                billing === "yearly"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Yearly
              <Badge className="bg-green-100 text-green-700 text-xs font-ui py-0 h-4 border-0">
                Save 33%
              </Badge>
            </button>
          </div>
        </motion.div>

        {/* Plan Cards */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-14"
        >
          {/* Free Plan */}
          <Card
            className={`border-border relative overflow-hidden ${currentPlan === "free" ? "ring-2 ring-border" : ""}`}
          >
            {currentPlan === "free" && (
              <div className="absolute top-4 right-4">
                <Badge variant="secondary" className="font-ui text-xs">
                  Current Plan
                </Badge>
              </div>
            )}
            <CardHeader className="pb-4">
              <div className="mb-4">
                <h2 className="font-display font-bold text-2xl text-foreground">
                  Free
                </h2>
                <div className="flex items-baseline gap-1 mt-2">
                  <span className="font-display font-bold text-4xl text-foreground">
                    $0
                  </span>
                  <span className="text-muted-foreground font-ui text-sm">
                    / forever
                  </span>
                </div>
              </div>
              <p className="text-sm text-muted-foreground font-ui">
                Basic image processing for personal use
              </p>
            </CardHeader>
            <CardContent className="space-y-3">
              {FREE_FEATURES.map((f) => (
                <div key={f} className="flex items-start gap-3">
                  <div className="w-4 h-4 rounded-full bg-muted flex items-center justify-center flex-shrink-0 mt-0.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground" />
                  </div>
                  <span className="text-sm text-muted-foreground font-ui">
                    {f}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Plus Plan */}
          <Card className="border-amber-300 relative overflow-hidden shadow-lg">
            <div className="h-1 bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500" />
            {billing === "yearly" && (
              <div className="absolute top-4 right-4">
                <Badge className="bg-green-100 text-green-700 font-ui text-xs border-0">
                  Best Value
                </Badge>
              </div>
            )}
            <CardHeader className="pb-4">
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-1">
                  <Crown className="w-5 h-5 text-amber-500" />
                  <h2 className="font-display font-bold text-2xl text-foreground">
                    Plus
                  </h2>
                </div>
                <div className="flex items-baseline gap-1 mt-2">
                  <span className="font-display font-bold text-4xl text-foreground">
                    {billing === "monthly" ? "$9.99" : "$6.67"}
                  </span>
                  <span className="text-muted-foreground font-ui text-sm">
                    / month
                  </span>
                </div>
                {billing === "yearly" && (
                  <p className="text-xs text-muted-foreground font-ui mt-1">
                    Billed as $79.99/year
                  </p>
                )}
              </div>
              <p className="text-sm text-muted-foreground font-ui">
                Professional tools for serious image work
              </p>
            </CardHeader>
            <CardContent className="space-y-3">
              {PLUS_FEATURES.map(({ text }) => (
                <div key={text} className="flex items-start gap-3">
                  <div className="w-4 h-4 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="w-2.5 h-2.5 text-amber-600" />
                  </div>
                  <span className="text-sm text-foreground font-ui">
                    {text}
                  </span>
                </div>
              ))}
              <Separator className="my-2" />
              <div className="flex items-start gap-3">
                <div className="w-4 h-4 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Check className="w-2.5 h-2.5 text-amber-600" />
                </div>
                <span className="text-sm text-foreground font-ui">No ads</span>
              </div>

              <Button
                onClick={handleGetPlus}
                disabled={currentPlan === "plus"}
                className="w-full mt-4 bg-amber-500 hover:bg-amber-600 text-white font-ui gap-2"
                size="lg"
              >
                <Crown className="w-4 h-4" />
                {currentPlan === "plus" ? "Current Plan" : "Get Plus"}
              </Button>
              <p className="text-xs text-muted-foreground text-center font-ui">
                Cancel anytime · Instant access · Secure payment
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Feature comparison */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="mb-14"
        >
          <h2 className="font-display font-bold text-xl text-foreground text-center mb-8">
            Why upgrade?
          </h2>
          <div className="grid sm:grid-cols-3 gap-6">
            {[
              {
                icon: ImageIcon,
                color: "#E25C3B",
                bgColor: "#FFF0EC",
                title: "40× Larger Files",
                desc: "Process files up to 200MB — 40 times larger than the 5MB free limit.",
              },
              {
                icon: InfinityIcon,
                color: "#3B8CE2",
                bgColor: "#EBF3FF",
                title: "Unlimited Batches",
                desc: "Process as many files as you need in a single batch. No daily limits.",
              },
              {
                icon: Sparkles,
                color: "#7C3BE2",
                bgColor: "#F5EBFF",
                title: "AI Background Removal",
                desc: "Automatically detect and remove backgrounds from photos with one click.",
              },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <Card key={item.title} className="border-border text-center">
                  <CardContent className="pt-8 pb-6">
                    <div
                      className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4"
                      style={{ backgroundColor: item.bgColor }}
                    >
                      <Icon className="w-6 h-6" style={{ color: item.color }} />
                    </div>
                    <h3 className="font-display font-semibold text-foreground mb-2">
                      {item.title}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {item.desc}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <Button
            onClick={handleGetPlus}
            size="lg"
            className="bg-amber-500 hover:bg-amber-600 text-white font-ui gap-2 px-8"
            disabled={currentPlan === "plus"}
          >
            <Crown className="w-5 h-5" />
            {currentPlan === "plus"
              ? "You're on Plus!"
              : `Get Plus — ${billing === "monthly" ? "$9.99/mo" : "$79.99/yr"}`}
          </Button>
          <p className="text-xs text-muted-foreground mt-3 font-ui">
            Stripe integration coming soon. Contact admin to upgrade.
          </p>
        </motion.div>
      </div>
    </main>
  );
}
