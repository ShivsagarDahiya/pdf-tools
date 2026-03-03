import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  ChevronRight,
  Crop,
  Download,
  FileImage,
  FilePlus,
  FlipHorizontal,
  Home,
  ImageIcon,
  Maximize2,
  Minimize2,
  PenLine,
  Stamp,
  Wand2,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { motion } from "motion/react";

interface ImgTool {
  name: string;
  description: string;
  icon: LucideIcon;
  color: string;
  bgColor: string;
  path: string;
  plusOnly?: boolean;
}

const IMAGE_TOOLS: ImgTool[] = [
  {
    name: "Compress Image",
    description:
      "Reduce file size by up to 80% with adjustable quality. Batch support.",
    icon: Minimize2,
    color: "#E25C3B",
    bgColor: "#FFF0EC",
    path: "/img-compress",
  },
  {
    name: "Resize Image",
    description:
      "Change dimensions with custom width/height. Lock aspect ratio.",
    icon: Maximize2,
    color: "#3B8CE2",
    bgColor: "#EBF3FF",
    path: "/img-resize",
  },
  {
    name: "Crop Image",
    description: "Drag crop handles or pick preset ratios: 1:1, 16:9, 4:3.",
    icon: Crop,
    color: "#2DBD6E",
    bgColor: "#EBFFF4",
    path: "/img-crop",
  },
  {
    name: "Convert Image",
    description: "Convert between JPG, PNG, WEBP. Batch with ZIP download.",
    icon: ImageIcon,
    color: "#9B3BE2",
    bgColor: "#F5EBFF",
    path: "/img-convert",
  },
  {
    name: "Rotate & Flip",
    description: "Rotate 90°, 180°, 270° or flip horizontally/vertically.",
    icon: FlipHorizontal,
    color: "#3BE2D4",
    bgColor: "#EBFDF9",
    path: "/img-rotate",
  },
  {
    name: "Watermark Image",
    description: "Add text watermarks with adjustable opacity and position.",
    icon: Stamp,
    color: "#7C3BE2",
    bgColor: "#F0EBFF",
    path: "/img-watermark",
  },
  {
    name: "Image to PDF",
    description: "Combine images into a PDF. Choose page size & orientation.",
    icon: FilePlus,
    color: "#E23B3B",
    bgColor: "#FFF0F0",
    path: "/img-to-pdf",
  },
  {
    name: "Remove Background",
    description:
      "Canvas-based background removal. Works best on solid backgrounds.",
    icon: Wand2,
    color: "#D94F34",
    bgColor: "#FFF3F0",
    path: "/img-remove-bg",
    plusOnly: true,
  },
  {
    name: "Image Editor",
    description:
      "Brightness, contrast, blur, saturation, grayscale, sepia filters.",
    icon: PenLine,
    color: "#3B6CE2",
    bgColor: "#EBF0FF",
    path: "/img-editor",
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
            <span className="text-foreground font-medium">Image Tools</span>
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
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-ui font-medium mb-6">
            <ImageIcon className="w-3.5 h-3.5" />
            100% browser-based — your images never leave your device
          </div>
          <h1 className="font-display font-bold text-4xl sm:text-5xl text-foreground mb-4">
            Image Tools
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed mb-2">
            Compress, resize, crop, convert, rotate, watermark, and edit images
            — all in your browser. No uploads, no waiting.
          </p>
          <p className="text-sm text-muted-foreground max-w-xl mx-auto">
            9 powerful tools. Free to use. Upgrade to Plus for larger files and
            advanced features.
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
            All Image Tools
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {IMAGE_TOOLS.map((tool) => {
              const Icon = tool.icon;
              return (
                <motion.div
                  key={tool.name}
                  whileHover={{ y: -4, scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ duration: 0.18 }}
                >
                  <Link
                    to={tool.path}
                    className="group block bg-card border border-border rounded-xl p-5 shadow-card hover:shadow-card-hover transition-all duration-200 hover:border-primary/30 relative overflow-hidden"
                  >
                    <div
                      className="absolute inset-x-0 top-0 h-1 rounded-t-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      style={{
                        background: `linear-gradient(90deg, ${tool.color}88, ${tool.color})`,
                      }}
                    />
                    <div className="flex items-start gap-4">
                      <div
                        className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110"
                        style={{ backgroundColor: tool.bgColor }}
                      >
                        <Icon
                          className="w-5 h-5"
                          style={{ color: tool.color }}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <h3 className="font-display font-semibold text-sm text-foreground">
                            {tool.name}
                          </h3>
                          {tool.plusOnly && (
                            <Badge
                              variant="secondary"
                              className="text-xs py-0 h-4 font-ui"
                              style={{
                                backgroundColor: "#E2A83B12",
                                color: "#E2A83B",
                                border: "1px solid #E2A83B25",
                              }}
                            >
                              Plus
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          {tool.description}
                        </p>
                      </div>
                      <ArrowRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-200 flex-shrink-0 mt-1" />
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Download All / Batch section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          viewport={{ once: true }}
          className="mb-14"
        >
          <div className="grid sm:grid-cols-2 gap-6">
            <Card className="border-border shadow-card">
              <CardContent className="pt-6">
                <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center mb-3">
                  <Download className="w-5 h-5 text-green-600" />
                </div>
                <h3 className="font-display font-semibold text-foreground mb-1">
                  Batch Processing
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Compress or convert multiple images at once and download them
                  all as a ZIP file. Free: 10 files. Plus: unlimited.
                </p>
              </CardContent>
            </Card>
            <Card className="border-border shadow-card">
              <CardContent className="pt-6">
                <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center mb-3">
                  <FileImage className="w-5 h-5 text-blue-600" />
                </div>
                <h3 className="font-display font-semibold text-foreground mb-1">
                  All formats supported
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Works with JPG, PNG, WEBP, GIF, and more. Convert between
                  formats with one click.
                </p>
              </CardContent>
            </Card>
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <h2 className="font-display font-bold text-2xl text-foreground mb-3">
            Ready to get started?
          </h2>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Pick any tool above — no sign-up required. All processing happens in
            your browser.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link to="/img-compress">
              <Button size="lg" className="font-ui font-semibold gap-2">
                <Minimize2 className="w-4 h-4" />
                Start Compressing
                <ChevronRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link to="/upgrade">
              <Button variant="outline" size="lg" className="font-ui gap-2">
                View Plus Plans
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </main>
  );
}
