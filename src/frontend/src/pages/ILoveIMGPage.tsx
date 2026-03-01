import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "@tanstack/react-router";
import {
  ChevronRight,
  Home,
  Image,
  Maximize2,
  ScanLine,
  Sparkles,
  Wand2,
  ZoomIn,
} from "lucide-react";
import { motion } from "motion/react";

const IMAGE_TOOLS = [
  {
    name: "Compress Image",
    description:
      "Reduce image file size by up to 80% without visible quality loss.",
    icon: ScanLine,
    color: "#E25C3B",
    bgColor: "#FFF0EC",
  },
  {
    name: "Resize Image",
    description:
      "Change image dimensions to exact pixels, percentages, or preset sizes.",
    icon: Maximize2,
    color: "#3B8CE2",
    bgColor: "#EBF3FF",
  },
  {
    name: "Crop Image",
    description:
      "Crop to any aspect ratio, custom size, or freeform selection.",
    icon: ZoomIn,
    color: "#2DBD6E",
    bgColor: "#EBFFF4",
  },
  {
    name: "Convert Image",
    description: "Convert between JPG, PNG, WebP, GIF, SVG, TIFF, and more.",
    icon: Image,
    color: "#9B3BE2",
    bgColor: "#F5EBFF",
  },
  {
    name: "AI Enhance",
    description:
      "Upscale and enhance image quality using AI — up to 4× resolution.",
    icon: Sparkles,
    color: "#E27A3B",
    bgColor: "#FFF5EC",
  },
  {
    name: "Remove Background",
    description: "Automatically remove the background from photos with AI.",
    icon: Wand2,
    color: "#D94F34",
    bgColor: "#FFF0EC",
  },
];

export function ILoveIMGPage() {
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
            <span className="text-foreground font-medium">PhoneBaba</span>
          </nav>
        </div>
      </div>

      <div className="container max-w-5xl py-14">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="text-center mb-14"
        >
          <Badge
            className="mb-5 font-ui text-xs px-3 py-1.5"
            style={{
              backgroundColor: "#E25C3B15",
              color: "#E25C3B",
              border: "1px solid #E25C3B30",
            }}
          >
            Sister Service
          </Badge>
          <h1 className="font-display font-bold text-4xl text-foreground mb-4">
            PhoneBaba
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed mb-2">
            The same easy-to-use experience you love for PDFs — now for images.
            Compress, resize, crop, convert, and enhance with AI.
          </p>
          <p className="text-sm text-muted-foreground max-w-xl mx-auto">
            All tools work directly in your browser. Your images never leave
            your device.
          </p>
        </motion.div>

        {/* Tools Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="mb-14"
        >
          <h2 className="font-display font-bold text-xl text-foreground mb-6 flex items-center gap-2">
            <span className="w-1 h-5 rounded-full bg-primary inline-block" />
            Image Tools
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {IMAGE_TOOLS.map((tool) => {
              const Icon = tool.icon;
              return (
                <Card
                  key={tool.name}
                  className="border-border shadow-card hover:shadow-card-hover transition-all duration-200 group cursor-pointer"
                >
                  <CardContent className="pt-5">
                    <div
                      className="w-11 h-11 rounded-xl flex items-center justify-center mb-3 transition-transform group-hover:scale-110"
                      style={{ backgroundColor: tool.bgColor }}
                    >
                      <Icon className="w-5 h-5" style={{ color: tool.color }} />
                    </div>
                    <h3 className="font-display font-semibold text-sm text-foreground mb-1.5">
                      {tool.name}
                    </h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {tool.description}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </motion.div>

        {/* AI Highlight */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="mb-14"
        >
          <Card className="border-border shadow-card overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-violet-500 via-purple-500 to-indigo-500" />
            <CardContent className="pt-8 pb-8">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500/15 to-purple-600/15 flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-8 h-8 text-violet-500" />
                </div>
                <div className="flex-1">
                  <h3 className="font-display font-bold text-lg text-foreground mb-2">
                    AI-Powered Image Enhancement
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Use our Gemini AI integration to enhance photo quality,
                    upscale resolution up to 4×, remove noise, and sharpen
                    details automatically. No manual editing skills required.
                  </p>
                </div>
                <Badge
                  className="font-ui text-xs px-3 py-1.5 flex-shrink-0"
                  style={{
                    backgroundColor: "#7C3BE215",
                    color: "#7C3BE2",
                    border: "1px solid #7C3BE230",
                  }}
                >
                  <Sparkles className="w-3 h-3 mr-1" />
                  Gemini AI
                </Badge>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="text-center"
        >
          <h2 className="font-display font-bold text-2xl text-foreground mb-3">
            Try PhoneBaba — it's free
          </h2>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Visit PhoneBaba to access all image tools. Same trusted experience,
            built for images.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link to="/">
              <Button
                size="lg"
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-ui font-semibold"
              >
                <Image className="mr-2 w-4 h-4" />
                Open PhoneBaba
                <ChevronRight className="ml-1 w-4 h-4" />
              </Button>
            </Link>
            <Link to="/">
              <Button variant="outline" size="lg" className="font-ui">
                Back to PDF Tools
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </main>
  );
}
