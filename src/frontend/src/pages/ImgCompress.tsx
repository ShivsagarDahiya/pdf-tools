import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import { formatBytes } from "@/utils/pdfUtils";
import { Link } from "@tanstack/react-router";
import JSZip from "jszip";
import {
  Crown,
  Download,
  FileImage,
  ImageIcon,
  Minimize2,
  Upload,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useRef, useState } from "react";
import { toast } from "sonner";

const FREE_MAX_FILES = 10;
const FREE_MAX_SIZE = 5 * 1024 * 1024; // 5MB
const PLUS_MAX_SIZE = 200 * 1024 * 1024; // 200MB

function getUserPlan(): "free" | "plus" {
  return (localStorage.getItem("userPlan") as "free" | "plus") || "free";
}

interface CompressedResult {
  file: File;
  originalSize: number;
  compressedSize: number;
  dataUrl: string;
  filename: string;
}

export function ImgCompress() {
  const [files, setFiles] = useState<File[]>([]);
  const [quality, setQuality] = useState(80);
  const [results, setResults] = useState<CompressedResult[]>([]);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const plan = getUserPlan();
  const maxFiles = plan === "plus" ? Number.POSITIVE_INFINITY : FREE_MAX_FILES;
  const maxSize = plan === "plus" ? PLUS_MAX_SIZE : FREE_MAX_SIZE;

  const addWatermark = useCallback(
    (ctx: CanvasRenderingContext2D, width: number, height: number) => {
      if (plan === "free") {
        ctx.save();
        ctx.globalAlpha = 0.3;
        ctx.fillStyle = "#888888";
        ctx.font = `${Math.max(12, Math.min(width, height) / 30)}px sans-serif`;
        ctx.textAlign = "center";
        ctx.translate(width / 2, height / 2);
        ctx.rotate(-Math.PI / 6);
        ctx.fillText("Processed by PDFTools", 0, 0);
        ctx.restore();
      }
    },
    [plan],
  );

  const compressImage = useCallback(
    async (file: File): Promise<CompressedResult> => {
      return new Promise((resolve, reject) => {
        const img = new Image();
        const url = URL.createObjectURL(file);
        img.onload = () => {
          URL.revokeObjectURL(url);
          const canvas = document.createElement("canvas");
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext("2d")!;
          ctx.drawImage(img, 0, 0);
          addWatermark(ctx, img.width, img.height);

          const mimeType =
            file.type === "image/png" ? "image/png" : "image/jpeg";
          const q = quality / 100;

          canvas.toBlob(
            (blob) => {
              if (!blob) {
                reject(new Error("Compression failed"));
                return;
              }
              const reader = new FileReader();
              reader.onload = () => {
                resolve({
                  file,
                  originalSize: file.size,
                  compressedSize: blob.size,
                  dataUrl: reader.result as string,
                  filename: `compressed_${file.name}`,
                });
              };
              reader.readAsDataURL(blob);
            },
            mimeType,
            q,
          );
        };
        img.onerror = () => reject(new Error(`Failed to load ${file.name}`));
        img.src = url;
      });
    },
    [quality, addWatermark],
  );

  const handleProcess = useCallback(async () => {
    if (files.length === 0) return;
    setProcessing(true);
    setProgress(0);
    setResults([]);
    const compressed: CompressedResult[] = [];
    for (let i = 0; i < files.length; i++) {
      try {
        const result = await compressImage(files[i]);
        compressed.push(result);
      } catch {
        toast.error(`Failed: ${files[i].name}`);
      }
      setProgress(Math.round(((i + 1) / files.length) * 100));
    }
    setResults(compressed);
    setProcessing(false);
    toast.success(`Compressed ${compressed.length} image(s)`);
  }, [files, compressImage]);

  const downloadSingle = (result: CompressedResult) => {
    const a = document.createElement("a");
    a.href = result.dataUrl;
    a.download = result.filename;
    a.click();
  };

  const downloadAll = async () => {
    if (results.length === 1) {
      downloadSingle(results[0]);
      return;
    }
    const zip = new JSZip();
    for (const r of results) {
      const res = await fetch(r.dataUrl);
      const blob = await res.blob();
      zip.file(r.filename, blob);
    }
    const zipBlob = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(zipBlob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "compressed_images.zip";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleFiles = (newFiles: File[]) => {
    const valid = newFiles.filter((f) => {
      if (!f.type.startsWith("image/")) {
        toast.error(`${f.name} is not an image`);
        return false;
      }
      if (f.size > maxSize) {
        toast.error(
          `${f.name} exceeds ${plan === "free" ? "5MB" : "200MB"} limit`,
        );
        return false;
      }
      return true;
    });
    const combined = [...files, ...valid].slice(0, maxFiles);
    if (files.length + valid.length > maxFiles) {
      toast.error(
        `Free plan limited to ${FREE_MAX_FILES} files. Upgrade for unlimited.`,
      );
    }
    setFiles(combined);
    setResults([]);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(Array.from(e.dataTransfer.files));
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
            <Link
              to="/img-compress"
              className="hover:text-foreground transition-colors"
            >
              Image Tools
            </Link>
            <span className="mx-1">/</span>
            <span className="text-foreground font-medium">Compress Image</span>
          </nav>
        </div>
      </div>

      <div className="container max-w-4xl py-10">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex items-start gap-4 mb-8"
        >
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 bg-orange-50">
            <Minimize2 className="w-7 h-7 text-orange-500" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="font-display text-3xl font-bold text-foreground">
                Compress Image
              </h1>
              {plan === "free" && (
                <Badge variant="secondary" className="font-ui text-xs">
                  Free Plan
                </Badge>
              )}
              {plan === "plus" && (
                <Badge className="font-ui text-xs bg-amber-500 text-white">
                  <Crown className="w-3 h-3 mr-1" />
                  Plus
                </Badge>
              )}
            </div>
            <p className="text-muted-foreground mt-1">
              Reduce image file size with adjustable quality. Supports JPG, PNG,
              WEBP, GIF.
            </p>
          </div>
        </motion.div>

        {plan === "free" && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-6"
          >
            <Card className="border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-800">
              <CardContent className="pt-4 pb-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <Crown className="w-5 h-5 text-amber-500 flex-shrink-0" />
                  <div>
                    <p className="font-ui text-sm font-medium text-foreground">
                      Free Plan Limits
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Max 5MB per file · 10 files per batch · Watermark added
                    </p>
                  </div>
                </div>
                <Link to="/upgrade">
                  <Button
                    size="sm"
                    className="bg-amber-500 hover:bg-amber-600 text-white font-ui text-xs"
                  >
                    Upgrade to Plus
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
          className="space-y-6"
        >
          {/* Drop Zone */}
          <Card className="border-border shadow-card">
            <CardContent className="pt-6">
              <motion.div
                className={`relative rounded-xl border-2 border-dashed transition-all duration-200 cursor-pointer ${
                  isDragging
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50 hover:bg-accent/30"
                }`}
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={(e) => {
                  e.preventDefault();
                  if (!e.currentTarget.contains(e.relatedTarget as Node))
                    setIsDragging(false);
                }}
                onDrop={handleDrop}
                onClick={() => inputRef.current?.click()}
                whileHover={{ scale: 1.005 }}
                whileTap={{ scale: 0.995 }}
              >
                <input
                  ref={inputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(e) =>
                    handleFiles(Array.from(e.target.files || []))
                  }
                />
                <div className="flex flex-col items-center justify-center py-14 px-6 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                    <ImageIcon className="w-8 h-8 text-primary" />
                  </div>
                  <p className="font-display font-semibold text-lg text-foreground mb-1">
                    {isDragging ? "Release to upload" : "Drop images here"}
                  </p>
                  <p className="text-sm text-muted-foreground mb-3">
                    JPG, PNG, WEBP, GIF supported
                  </p>
                  <div className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium">
                    <Upload className="w-4 h-4" />
                    Select Images
                  </div>
                  <p className="text-xs text-muted-foreground mt-3">
                    Max {plan === "free" ? "5MB" : "200MB"} per file
                    {plan === "free" ? " · 10 files max" : " · Unlimited batch"}
                  </p>
                </div>
              </motion.div>

              <AnimatePresence>
                {files.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="mt-4 space-y-2"
                  >
                    {files.map((file, i) => (
                      <div
                        key={`${file.name}-${i}`}
                        className="flex items-center gap-3 p-3 bg-card rounded-lg border border-border"
                      >
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                          <FileImage className="w-4 h-4 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">
                            {file.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatBytes(file.size)}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-muted-foreground hover:text-destructive"
                          onClick={(e) => {
                            e.stopPropagation();
                            setFiles((prev) => prev.filter((_, j) => j !== i));
                            setResults([]);
                          }}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>

          {/* Quality Slider */}
          {files.length > 0 && (
            <Card className="border-border shadow-card">
              <CardContent className="pt-6 space-y-6">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="font-ui font-medium">
                      Compression Quality
                    </Label>
                    <span className="font-display font-bold text-lg text-primary">
                      {quality}%
                    </span>
                  </div>
                  <Slider
                    min={10}
                    max={100}
                    step={5}
                    value={[quality]}
                    onValueChange={([v]) => setQuality(v)}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Smaller file</span>
                    <span>Better quality</span>
                  </div>
                </div>

                {processing && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground font-ui">
                        Processing...
                      </span>
                      <span className="font-medium">{progress}%</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                  </div>
                )}

                <Button
                  onClick={handleProcess}
                  disabled={processing || files.length === 0}
                  className="w-full font-ui gap-2"
                >
                  <Minimize2 className="w-4 h-4" />
                  {processing
                    ? "Compressing..."
                    : `Compress ${files.length} Image(s)`}
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Results */}
          <AnimatePresence>
            {results.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
              >
                <Card className="border-border shadow-card">
                  <CardContent className="pt-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-display font-semibold text-foreground">
                        Results
                      </h3>
                      <Button
                        onClick={downloadAll}
                        className="font-ui gap-2"
                        size="sm"
                      >
                        <Download className="w-4 h-4" />
                        {results.length > 1 ? "Download All (ZIP)" : "Download"}
                      </Button>
                    </div>
                    {results.map((r) => {
                      const saved = Math.round(
                        ((r.originalSize - r.compressedSize) / r.originalSize) *
                          100,
                      );
                      return (
                        <div
                          key={r.filename}
                          className="flex items-center gap-4 p-3 bg-muted/40 rounded-lg border border-border"
                        >
                          <img
                            src={r.dataUrl}
                            alt={r.filename}
                            className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground truncate">
                              {r.file.name}
                            </p>
                            <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                              <span>{formatBytes(r.originalSize)}</span>
                              <span>→</span>
                              <span className="text-foreground">
                                {formatBytes(r.compressedSize)}
                              </span>
                              <Badge
                                variant="secondary"
                                className="text-xs py-0 h-4"
                                style={{
                                  backgroundColor: "#2DBD6E15",
                                  color: "#2DBD6E",
                                }}
                              >
                                -{saved}%
                              </Badge>
                            </div>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            className="font-ui text-xs gap-1.5"
                            onClick={() => downloadSingle(r)}
                          >
                            <Download className="w-3.5 h-3.5" />
                            Save
                          </Button>
                        </div>
                      );
                    })}
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </main>
  );
}
