import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { formatBytes } from "@/utils/pdfUtils";
import { Link } from "@tanstack/react-router";
import JSZip from "jszip";
import {
  ArrowRightLeft,
  Crown,
  Download,
  FileImage,
  ImageIcon,
  Upload,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useRef, useState } from "react";
import { toast } from "sonner";

const FREE_MAX_FILES = 10;
const FREE_MAX_SIZE = 5 * 1024 * 1024;

function getUserPlan(): "free" | "plus" {
  return (localStorage.getItem("userPlan") as "free" | "plus") || "free";
}

type TargetFormat = "jpeg" | "png" | "webp";

interface ConvertedResult {
  dataUrl: string;
  filename: string;
  originalName: string;
  size: number;
}

export function ImgConvert() {
  const [files, setFiles] = useState<File[]>([]);
  const [targetFormat, setTargetFormat] = useState<TargetFormat>("jpeg");
  const [quality, setQuality] = useState(90);
  const [results, setResults] = useState<ConvertedResult[]>([]);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const plan = getUserPlan();

  const convertImage = useCallback(
    async (file: File): Promise<ConvertedResult> => {
      return new Promise((resolve, reject) => {
        const img = new Image();
        const url = URL.createObjectURL(file);
        img.onload = () => {
          URL.revokeObjectURL(url);
          const canvas = document.createElement("canvas");
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext("2d")!;

          if (targetFormat === "jpeg") {
            ctx.fillStyle = "#ffffff";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
          }
          ctx.drawImage(img, 0, 0);

          const mime = `image/${targetFormat}`;
          const q = targetFormat === "png" ? undefined : quality / 100;

          canvas.toBlob(
            (blob) => {
              if (!blob) {
                reject(new Error(`Failed to convert ${file.name}`));
                return;
              }
              const reader = new FileReader();
              reader.onload = () => {
                const ext =
                  targetFormat === "jpeg"
                    ? "jpg"
                    : targetFormat === "webp"
                      ? "webp"
                      : "png";
                const baseName = file.name.replace(/\.[^/.]+$/, "");
                resolve({
                  dataUrl: reader.result as string,
                  filename: `${baseName}.${ext}`,
                  originalName: file.name,
                  size: blob.size,
                });
              };
              reader.readAsDataURL(blob);
            },
            mime,
            q,
          );
        };
        img.onerror = () => reject(new Error(`Failed to load ${file.name}`));
        img.src = url;
      });
    },
    [targetFormat, quality],
  );

  const handleProcess = useCallback(async () => {
    if (files.length === 0) return;
    setProcessing(true);
    setProgress(0);
    setResults([]);
    const converted: ConvertedResult[] = [];
    for (let i = 0; i < files.length; i++) {
      try {
        const r = await convertImage(files[i]);
        converted.push(r);
      } catch {
        toast.error(`Failed: ${files[i].name}`);
      }
      setProgress(Math.round(((i + 1) / files.length) * 100));
    }
    setResults(converted);
    setProcessing(false);
    toast.success(`Converted ${converted.length} image(s)`);
  }, [files, convertImage]);

  const downloadAll = async () => {
    if (results.length === 1) {
      const a = document.createElement("a");
      a.href = results[0].dataUrl;
      a.download = results[0].filename;
      a.click();
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
    a.download = `converted_${targetFormat}.zip`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleFiles = (newFiles: File[]) => {
    const valid = newFiles.filter((f) => {
      if (!f.type.startsWith("image/")) {
        toast.error(`${f.name} is not an image`);
        return false;
      }
      if (plan === "free" && f.size > FREE_MAX_SIZE) {
        toast.error(`${f.name} exceeds 5MB free plan limit`);
        return false;
      }
      return true;
    });
    const combined = [...files, ...valid].slice(
      0,
      plan === "plus" ? Number.POSITIVE_INFINITY : FREE_MAX_FILES,
    );
    if (files.length + valid.length > FREE_MAX_FILES && plan === "free") {
      toast.error(`Free plan limited to ${FREE_MAX_FILES} files`);
    }
    setFiles(combined);
    setResults([]);
  };

  const showQuality = targetFormat !== "png";

  return (
    <main className="min-h-screen bg-background">
      <div className="border-b border-border bg-card/50">
        <div className="container max-w-4xl py-3">
          <nav className="flex items-center gap-1 text-sm text-muted-foreground">
            <Link to="/" className="hover:text-foreground transition-colors">
              Home
            </Link>
            <span className="mx-1">/</span>
            <span className="text-foreground font-medium">Convert Image</span>
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
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 bg-purple-50">
            <ArrowRightLeft className="w-7 h-7 text-purple-500" />
          </div>
          <div>
            <h1 className="font-display text-3xl font-bold text-foreground">
              Convert Image
            </h1>
            <p className="text-muted-foreground mt-1">
              Convert images between JPG, PNG, and WEBP formats. Batch
              conversion with ZIP download.
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
                  <p className="text-xs text-muted-foreground">
                    Free plan: max 5MB per file · 10 files per batch
                  </p>
                </div>
                <Link to="/upgrade">
                  <Button
                    size="sm"
                    className="bg-amber-500 hover:bg-amber-600 text-white font-ui text-xs"
                  >
                    Upgrade
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
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDragging(false);
                  handleFiles(Array.from(e.dataTransfer.files));
                }}
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
                <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                    <ImageIcon className="w-8 h-8 text-primary" />
                  </div>
                  <p className="font-display font-semibold text-lg text-foreground mb-1">
                    Drop images to convert
                  </p>
                  <p className="text-sm text-muted-foreground mb-3">
                    JPG, PNG, WEBP, GIF supported
                  </p>
                  <div className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium">
                    <Upload className="w-4 h-4" />
                    Select Images
                  </div>
                </div>
              </motion.div>

              <AnimatePresence>
                {files.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
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

          {files.length > 0 && (
            <Card className="border-border shadow-card">
              <CardContent className="pt-6 space-y-5">
                <div className="space-y-1.5">
                  <Label className="font-ui font-medium">Target Format</Label>
                  <Select
                    value={targetFormat}
                    onValueChange={(v) => setTargetFormat(v as TargetFormat)}
                  >
                    <SelectTrigger className="font-ui">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="jpeg">JPG (JPEG)</SelectItem>
                      <SelectItem value="png">PNG (Lossless)</SelectItem>
                      <SelectItem value="webp">WEBP (Modern)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {showQuality && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="font-ui font-medium">Quality</Label>
                      <span className="font-display font-bold text-primary">
                        {quality}%
                      </span>
                    </div>
                    <Slider
                      min={10}
                      max={100}
                      step={5}
                      value={[quality]}
                      onValueChange={([v]) => setQuality(v)}
                    />
                  </div>
                )}

                {processing && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground font-ui">
                        Converting...
                      </span>
                      <span className="font-medium">{progress}%</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                  </div>
                )}

                <Button
                  onClick={handleProcess}
                  disabled={processing}
                  className="w-full font-ui gap-2"
                >
                  <ArrowRightLeft className="w-4 h-4" />
                  {processing
                    ? "Converting..."
                    : `Convert ${files.length} File(s) to ${targetFormat.toUpperCase()}`}
                </Button>
              </CardContent>
            </Card>
          )}

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
                        Converted Files
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
                    {results.map((r) => (
                      <div
                        key={r.filename}
                        className="flex items-center gap-4 p-3 bg-muted/40 rounded-lg border border-border"
                      >
                        <img
                          src={r.dataUrl}
                          alt={r.filename}
                          className="w-12 h-12 object-cover rounded-lg flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">
                            {r.filename}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-xs text-muted-foreground">
                              {r.originalName}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              →
                            </span>
                            <Badge
                              variant="secondary"
                              className="text-xs py-0 h-4"
                            >
                              {targetFormat.toUpperCase()}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {formatBytes(r.size)}
                            </span>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          className="font-ui text-xs gap-1.5"
                          onClick={() => {
                            const a = document.createElement("a");
                            a.href = r.dataUrl;
                            a.download = r.filename;
                            a.click();
                          }}
                        >
                          <Download className="w-3.5 h-3.5" />
                          Save
                        </Button>
                      </div>
                    ))}
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
