import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAdminSettings } from "@/contexts/AdminSettingsContext";
import { useToolUsage } from "@/hooks/useQueries";
import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Camera,
  Crop,
  Crown,
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
  Lock,
  Merge,
  Minimize2,
  PenLine,
  PenSquare,
  Presentation,
  RotateCw,
  ScanText,
  Scissors,
  Settings2,
  Sheet,
  Sparkles,
  Stamp,
  TableProperties,
  Trash2,
  Unlock,
  Wand2,
  Wrench,
  Zap,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { motion } from "motion/react";

interface Tool {
  name: string;
  path: string;
  description: string;
  icon: LucideIcon;
  color: string;
  bgColor: string;
  comingSoon?: boolean;
}

interface Category {
  label: string;
  tools: Tool[];
}

const CATEGORIES: Category[] = [
  {
    label: "Organize PDF",
    tools: [
      {
        name: "Merge PDF",
        path: "/merge",
        description: "Combine multiple PDFs into one document",
        icon: Merge,
        color: "#E25C3B",
        bgColor: "#FFF0EC",
      },
      {
        name: "Split PDF",
        path: "/split",
        description: "Extract pages or split into multiple files",
        icon: Scissors,
        color: "#D64E4E",
        bgColor: "#FFF0F0",
      },
      {
        name: "Remove Pages",
        path: "/remove-pages",
        description: "Delete specific pages from a PDF",
        icon: Trash2,
        color: "#E25C3B",
        bgColor: "#FFF0EC",
      },
      {
        name: "Extract Pages",
        path: "/extract-pages",
        description: "Extract selected pages into a new PDF",
        icon: FileMinus,
        color: "#3B8CE2",
        bgColor: "#EBF3FF",
      },
      {
        name: "Organize PDF",
        path: "/organize",
        description: "Sort and reorder pages with drag & drop",
        icon: LayoutGrid,
        color: "#3BC4E2",
        bgColor: "#EBF9FD",
      },
    ],
  },
  {
    label: "Optimize PDF",
    tools: [
      {
        name: "Compress PDF",
        path: "/compress",
        description: "Reduce file size without losing quality",
        icon: Minimize2,
        color: "#E27A3B",
        bgColor: "#FFF5EC",
      },
      {
        name: "Optimize PDF",
        path: "/optimize",
        description: "Improve PDF performance with AI tips",
        icon: Zap,
        color: "#E2A83B",
        bgColor: "#FFFAEC",
      },
      {
        name: "Repair PDF",
        path: "/repair",
        description: "Fix corrupted or damaged PDFs",
        icon: Wrench,
        color: "#E25C3B",
        bgColor: "#FFF0EC",
        comingSoon: true,
      },
      {
        name: "OCR PDF",
        path: "/ocr",
        description: "Convert scanned PDFs into searchable text",
        icon: ScanText,
        color: "#3B8CE2",
        bgColor: "#EBF3FF",
        comingSoon: true,
      },
      {
        name: "Scan to PDF",
        path: "/scan-to-pdf",
        description: "Capture and convert scans to PDF",
        icon: Camera,
        color: "#2DBD6E",
        bgColor: "#EBFFF4",
        comingSoon: true,
      },
    ],
  },
  {
    label: "Convert to PDF",
    tools: [
      {
        name: "JPG to PDF",
        path: "/jpg-to-pdf",
        description: "Turn images into a PDF document",
        icon: Image,
        color: "#3BE28A",
        bgColor: "#EBFFF4",
      },
      {
        name: "Word to PDF",
        path: "/word-to-pdf",
        description: "Convert DOC and DOCX files to PDF",
        icon: FileText,
        color: "#2B5CE2",
        bgColor: "#EBF0FF",
        comingSoon: true,
      },
      {
        name: "PowerPoint to PDF",
        path: "/pptx-to-pdf",
        description: "Convert PPT and PPTX to PDF slides",
        icon: Presentation,
        color: "#D94F34",
        bgColor: "#FFF0EC",
        comingSoon: true,
      },
      {
        name: "Excel to PDF",
        path: "/excel-to-pdf",
        description: "Convert XLS and XLSX spreadsheets to PDF",
        icon: Sheet,
        color: "#1D6F42",
        bgColor: "#EBFFF4",
        comingSoon: true,
      },
      {
        name: "HTML to PDF",
        path: "/html-to-pdf",
        description: "Convert web pages and HTML files to PDF",
        icon: Globe,
        color: "#E27A3B",
        bgColor: "#FFF5EC",
        comingSoon: true,
      },
    ],
  },
  {
    label: "Convert from PDF",
    tools: [
      {
        name: "PDF to JPG",
        path: "/pdf-to-jpg",
        description: "Convert every page to a JPG image",
        icon: FileImage,
        color: "#3B7AE2",
        bgColor: "#EBF2FF",
      },
      {
        name: "PDF to Word",
        path: "/pdf-to-word",
        description: "Convert PDF to editable Word document",
        icon: FileOutput,
        color: "#2B5CE2",
        bgColor: "#EBF0FF",
        comingSoon: true,
      },
      {
        name: "PDF to PowerPoint",
        path: "/pdf-to-pptx",
        description: "Convert PDF pages to editable slides",
        icon: Presentation,
        color: "#D94F34",
        bgColor: "#FFF0EC",
        comingSoon: true,
      },
      {
        name: "PDF to Excel",
        path: "/pdf-to-excel",
        description: "Extract tables from PDF to spreadsheet",
        icon: TableProperties,
        color: "#1D6F42",
        bgColor: "#EBFFF4",
        comingSoon: true,
      },
      {
        name: "PDF to PDF/A",
        path: "/pdf-to-pdfa",
        description: "Convert to ISO archival format",
        icon: FileText,
        color: "#6B3BE2",
        bgColor: "#F5EBFF",
        comingSoon: true,
      },
    ],
  },
  {
    label: "Edit PDF",
    tools: [
      {
        name: "Edit PDF",
        path: "/edit",
        description: "Add text annotations and overlays",
        icon: PenLine,
        color: "#3B8CE2",
        bgColor: "#EBF3FF",
      },
      {
        name: "Rotate PDF",
        path: "/rotate",
        description: "Rotate pages 90, 180, or 270 degrees",
        icon: RotateCw,
        color: "#3B8CE2",
        bgColor: "#EBF3FF",
      },
      {
        name: "Add Page Numbers",
        path: "/page-numbers",
        description: "Insert customizable page numbers",
        icon: Hash,
        color: "#E2823B",
        bgColor: "#FFF8EC",
      },
      {
        name: "Watermark",
        path: "/watermark",
        description: "Add diagonal text watermark to all pages",
        icon: Stamp,
        color: "#9B3BE2",
        bgColor: "#F5EBFF",
      },
      {
        name: "Crop PDF",
        path: "/crop",
        description: "Trim edges with custom margins",
        icon: Crop,
        color: "#9B3BE2",
        bgColor: "#F5EBFF",
      },
    ],
  },
  {
    label: "PDF Security",
    tools: [
      {
        name: "Protect PDF",
        path: "/protect",
        description: "Encrypt your PDF with a password",
        icon: Lock,
        color: "#2DBD6E",
        bgColor: "#EBFFF4",
      },
      {
        name: "Unlock PDF",
        path: "/unlock",
        description: "Remove password from a PDF you own",
        icon: Unlock,
        color: "#E2C43B",
        bgColor: "#FFFBEB",
      },
      {
        name: "Sign PDF",
        path: "/sign",
        description: "Draw and stamp your signature",
        icon: PenSquare,
        color: "#2DBD6E",
        bgColor: "#EBFFF4",
      },
      {
        name: "Redact PDF",
        path: "/redact",
        description: "Permanently remove sensitive information",
        icon: EyeOff,
        color: "#E23B3B",
        bgColor: "#FFF0F0",
        comingSoon: true,
      },
      {
        name: "Compare PDF",
        path: "/compare",
        description: "Compare two PDFs side-by-side",
        icon: GitCompare,
        color: "#3B7AE2",
        bgColor: "#EBF2FF",
        comingSoon: true,
      },
    ],
  },
  {
    label: "PDF Intelligence",
    tools: [
      {
        name: "Translate PDF",
        path: "/translate",
        description: "AI-powered translation preserving layout",
        icon: Languages,
        color: "#7C3BE2",
        bgColor: "#F5EBFF",
        comingSoon: true,
      },
    ],
  },
];

function ToolCard({ tool, usageCount }: { tool: Tool; usageCount?: number }) {
  const Icon = tool.icon;
  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.01 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.18 }}
    >
      <Link
        to={tool.path}
        className="group block bg-card border border-border rounded-xl p-5 tool-card-shadow transition-all duration-200 hover:border-primary/30 relative overflow-hidden"
      >
        {/* Subtle top gradient on hover */}
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
            <Icon className="w-5 h-5" style={{ color: tool.color }} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <h3 className="font-display font-semibold text-sm text-foreground">
                {tool.name}
              </h3>
              {tool.comingSoon && (
                <Badge
                  variant="secondary"
                  className="text-xs py-0 h-4 font-ui"
                  style={{
                    backgroundColor: `${tool.color}12`,
                    color: tool.color,
                    border: `1px solid ${tool.color}25`,
                  }}
                >
                  Premium
                </Badge>
              )}
              {!tool.comingSoon &&
                usageCount !== undefined &&
                usageCount > 0 && (
                  <Badge
                    variant="secondary"
                    className="text-xs py-0 h-4 font-ui"
                  >
                    {usageCount.toLocaleString()}
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
}

export function Home() {
  const { data: usageData } = useToolUsage();
  const { settings } = useAdminSettings();
  const { hiddenServices, sponsorPosts } = settings;

  const usageMap = usageData
    ? Object.fromEntries(
        usageData.map(([name, count]) => [name, Number(count)]),
      )
    : {};

  const toolNameToKey: Record<string, string> = {
    "Merge PDF": "merge",
    "Split PDF": "split",
    "Organize PDF": "organize",
    "Compress PDF": "compress",
    "Optimize PDF": "optimize",
    "Rotate PDF": "rotate",
    Watermark: "watermark",
    "Add Page Numbers": "page-numbers",
    "PDF to JPG": "pdf-to-jpg",
    "JPG to PDF": "jpg-to-pdf",
    "Protect PDF": "protect",
    "Unlock PDF": "unlock",
    "Remove Pages": "remove-pages",
    "Extract Pages": "extract-pages",
    "Edit PDF": "edit",
    "Crop PDF": "crop",
    "Sign PDF": "sign",
  };

  const containerVariants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.06 } },
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  };

  const totalFreeTools = CATEGORIES.flatMap((c) => c.tools).filter(
    (t) => !t.comingSoon,
  ).length;

  return (
    <main>
      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-border">
        <div className="gradient-hero absolute inset-0 pointer-events-none" />
        <div className="container max-w-5xl py-20 md:py-28 text-center relative">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full text-sm font-ui font-medium mb-6">
              <FileText className="w-3.5 h-3.5" />
              100% browser-based — your files never leave your device
            </div>
            <h1 className="font-display font-bold text-4xl sm:text-5xl md:text-6xl text-foreground mb-4 leading-tight tracking-tight">
              Every tool you need
              <br />
              <span className="text-primary">to work with PDFs</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto mb-8 leading-relaxed">
              Merge, split, compress, convert, edit, and secure PDFs instantly
              in your browser. Powered by Gemini AI for smart optimizations.
            </p>
          </motion.div>

          {/* Quick stats */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="flex flex-wrap justify-center gap-8 text-sm text-muted-foreground"
          >
            {[
              ["30+", "PDF Tools"],
              [String(totalFreeTools), "Free Tools"],
              ["0", "Files Uploaded to Server"],
            ].map(([num, label]) => (
              <div key={label} className="text-center">
                <div className="font-display font-bold text-2xl text-foreground">
                  {num}
                </div>
                <div className="text-xs mt-0.5">{label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Tools Grid */}
      <section className="container max-w-5xl py-16">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-12"
        >
          {CATEGORIES.map((category) => {
            const visibleTools = category.tools.filter(
              (t) => !hiddenServices.includes(t.path),
            );
            if (visibleTools.length === 0) return null;
            return (
              <motion.div key={category.label} variants={itemVariants}>
                <h2 className="font-display font-bold text-lg text-foreground mb-4 flex items-center gap-2">
                  <span className="w-1 h-5 rounded-full bg-primary inline-block" />
                  {category.label}
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {visibleTools.map((tool) => (
                    <ToolCard
                      key={tool.path}
                      tool={tool}
                      usageCount={usageMap[toolNameToKey[tool.name]]}
                    />
                  ))}
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </section>

      {/* Sponsor Posters Section */}
      {sponsorPosts.length > 0 && (
        <section className="border-t border-border bg-card/20">
          <div className="container max-w-5xl py-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              viewport={{ once: true }}
            >
              <h2 className="font-display font-bold text-lg text-foreground mb-6 flex items-center gap-2">
                <span className="w-1 h-5 rounded-full bg-primary inline-block" />
                Sponsors
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {sponsorPosts.map((post) =>
                  post.link ? (
                    <a
                      key={post.id}
                      href={post.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block group rounded-xl border border-border overflow-hidden bg-card shadow-card hover:shadow-card-hover transition-all duration-200 hover:border-primary/30"
                    >
                      <div className="overflow-hidden">
                        <img
                          src={post.imageUrl}
                          alt={post.caption || "Sponsor"}
                          className="w-full h-44 object-cover group-hover:scale-105 transition-transform duration-300"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='200'%3E%3Crect fill='%23f0f0f0' width='400' height='200'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' fill='%23999' font-size='14'%3ESponsor%3C/text%3E%3C/svg%3E";
                          }}
                        />
                      </div>
                      {post.caption && (
                        <div className="px-4 py-3">
                          <p className="font-ui text-sm text-foreground line-clamp-2">
                            {post.caption}
                          </p>
                        </div>
                      )}
                    </a>
                  ) : (
                    <div
                      key={post.id}
                      className="group rounded-xl border border-border overflow-hidden bg-card shadow-card hover:shadow-card-hover transition-all duration-200 hover:border-primary/30"
                    >
                      <div className="overflow-hidden">
                        <img
                          src={post.imageUrl}
                          alt={post.caption || "Sponsor"}
                          className="w-full h-44 object-cover group-hover:scale-105 transition-transform duration-300"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='200'%3E%3Crect fill='%23f0f0f0' width='400' height='200'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' fill='%23999' font-size='14'%3ESponsor%3C/text%3E%3C/svg%3E";
                          }}
                        />
                      </div>
                      {post.caption && (
                        <div className="px-4 py-3">
                          <p className="font-ui text-sm text-foreground line-clamp-2">
                            {post.caption}
                          </p>
                        </div>
                      )}
                    </div>
                  ),
                )}
              </div>
            </motion.div>
          </div>
        </section>
      )}

      {/* iLoveIMG Promo Section */}
      <section className="border-t border-border bg-card/30">
        <div className="container max-w-5xl py-14">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            viewport={{ once: true }}
          >
            <Card className="border-border shadow-card overflow-hidden">
              <div className="h-1 bg-gradient-to-r from-primary via-orange-400 to-amber-400" />
              <CardContent className="pt-8 pb-8">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 bg-primary/10">
                    <Wand2 className="w-7 h-7 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h2 className="font-display font-bold text-xl text-foreground">
                        PhoneBaba
                      </h2>
                      <Badge
                        variant="secondary"
                        className="font-ui text-xs"
                        style={{
                          backgroundColor: "#E25C3B12",
                          color: "#E25C3B",
                          border: "1px solid #E25C3B25",
                        }}
                      >
                        Sister Service
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Need to work with images too? PhoneBaba offers the same
                      easy PDF experience for images — compress, resize, crop,
                      convert, and enhance with AI.
                    </p>
                  </div>
                  <Link to="/" className="flex-shrink-0">
                    <Button
                      variant="outline"
                      className="font-ui gap-2 border-primary/30 hover:border-primary/60 hover:bg-primary/5"
                    >
                      <Image className="w-4 h-4" />
                      Explore PhoneBaba
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Workflows & Platforms */}
      <section className="container max-w-5xl pb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          viewport={{ once: true }}
        >
          <h2 className="font-display font-bold text-lg text-foreground mb-6 flex items-center gap-2">
            <span className="w-1 h-5 rounded-full bg-primary inline-block" />
            Workflows &amp; Platforms
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                icon: Settings2,
                name: "Workflows",
                desc: "Automate and reuse tool combinations",
                path: "/workflows",
                color: "#3B8CE2",
              },
              {
                icon: Crown,
                name: "Premium Plan",
                desc: "Advanced features, larger files, no ads",
                path: "/premium",
                color: "#E27A3B",
              },
              {
                icon: Sparkles,
                name: "AI Tools",
                desc: "Gemini AI for translation, OCR, and optimization",
                path: "/translate",
                color: "#7C3BE2",
              },
              {
                icon: FileText,
                name: "Business",
                desc: "Team management and bulk automation",
                path: "/premium",
                color: "#2DBD6E",
              },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <Link key={item.name} to={item.path}>
                  <motion.div
                    whileHover={{ y: -3 }}
                    transition={{ duration: 0.18 }}
                  >
                    <Card className="border-border shadow-card hover:shadow-card-hover transition-all duration-200 h-full">
                      <CardContent className="pt-5">
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
                          style={{ backgroundColor: `${item.color}15` }}
                        >
                          <Icon
                            className="w-5 h-5"
                            style={{ color: item.color }}
                          />
                        </div>
                        <h3 className="font-display font-semibold text-sm text-foreground mb-1">
                          {item.name}
                        </h3>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          {item.desc}
                        </p>
                      </CardContent>
                    </Card>
                  </motion.div>
                </Link>
              );
            })}
          </div>
        </motion.div>
      </section>
    </main>
  );
}
