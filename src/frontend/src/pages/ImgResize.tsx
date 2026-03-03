import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { formatBytes } from "@/utils/pdfUtils";
import { Link } from "@tanstack/react-router";
import { Crown, Download, ImageIcon, Maximize2, Upload, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useRef, useState } from "react";
import { toast } from "sonner";

const FREE_MAX_SIZE = 5 * 1024 * 1024;
const PLUS_MAX_SIZE = 200 * 1024 * 1024;

function getUserPlan(): "free" | "plus" {
  return (localStorage.getItem("userPlan") as "free" | "plus") || "free";
}

interface ResizeResult {
  dataUrl: string;
  filename: string;
  width: number;
  height: number;
}

export function ImgResize() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>("");
  const [origWidth, setOrigWidth] = useState(0);
  const [origHeight, setOrigHeight] = useState(0);
  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);
  const [lockAspect, setLockAspect] = useState(true);
  const [unit, setUnit] = useState<"px" | "%">("px");
  const [result, setResult] = useState<ResizeResult | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const plan = getUserPlan();

  const loadImage = useCallback((f: File) => {
    const maxSize =
      (localStorage.getItem("userPlan") as "free" | "plus") === "plus"
        ? PLUS_MAX_SIZE
        : FREE_MAX_SIZE;
    if (!f.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }
    if (f.size > maxSize) {
      toast.error(
        `File exceeds ${maxSize === FREE_MAX_SIZE ? "5MB" : "200MB"} limit`,
      );
      return;
    }
    setFile(f);
    setResult(null);
    const url = URL.createObjectURL(f);
    const img = new Image();
    img.onload = () => {
      setOrigWidth(img.width);
      setOrigHeight(img.height);
      setWidth(img.width);
      setHeight(img.height);
      setPreview(url);
    };
    img.src = url;
  }, []);

  const handleWidthChange = (val: string) => {
    const n = Number.parseInt(val) || 0;
    setWidth(n);
    if (lockAspect && origWidth > 0 && unit === "px") {
      setHeight(Math.round((n / origWidth) * origHeight));
    }
  };

  const handleHeightChange = (val: string) => {
    const n = Number.parseInt(val) || 0;
    setHeight(n);
    if (lockAspect && origHeight > 0 && unit === "px") {
      setWidth(Math.round((n / origHeight) * origWidth));
    }
  };

  const handleResize = useCallback(() => {
    if (!file || !origWidth || !origHeight) return;
    const img = new Image();
    img.onload = () => {
      const targetW =
        unit === "%" ? Math.round((origWidth * width) / 100) : width;
      const targetH =
        unit === "%" ? Math.round((origHeight * height) / 100) : height;
      const canvas = document.createElement("canvas");
      canvas.width = targetW;
      canvas.height = targetH;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0, targetW, targetH);
      const dataUrl = canvas.toDataURL(
        file.type === "image/png" ? "image/png" : "image/jpeg",
        0.92,
      );
      setResult({
        dataUrl,
        filename: `resized_${file.name}`,
        width: targetW,
        height: targetH,
      });
      toast.success("Image resized!");
    };
    img.src = preview;
  }, [file, origWidth, origHeight, width, height, unit, preview]);

  const handleDownload = () => {
    if (!result) return;
    const a = document.createElement("a");
    a.href = result.dataUrl;
    a.download = result.filename;
    a.click();
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
            <span className="text-foreground font-medium">Resize Image</span>
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
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 bg-blue-50">
            <Maximize2 className="w-7 h-7 text-blue-500" />
          </div>
          <div>
            <h1 className="font-display text-3xl font-bold text-foreground">
              Resize Image
            </h1>
            <p className="text-muted-foreground mt-1">
              Change image dimensions with custom width/height. Lock aspect
              ratio to prevent distortion.
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="space-y-6"
        >
          {/* Drop Zone */}
          <Card className="border-border shadow-card">
            <CardContent className="pt-6">
              {!file ? (
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
                    const f = e.dataTransfer.files[0];
                    if (f) loadImage(f);
                  }}
                  onClick={() => inputRef.current?.click()}
                  whileHover={{ scale: 1.005 }}
                  whileTap={{ scale: 0.995 }}
                >
                  <input
                    ref={inputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) loadImage(f);
                    }}
                  />
                  <div className="flex flex-col items-center justify-center py-14 px-6 text-center">
                    <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                      <ImageIcon className="w-8 h-8 text-primary" />
                    </div>
                    <p className="font-display font-semibold text-lg text-foreground mb-1">
                      Drop an image here
                    </p>
                    <p className="text-sm text-muted-foreground mb-3">
                      JPG, PNG, WEBP supported
                    </p>
                    <div className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium">
                      <Upload className="w-4 h-4" />
                      Select Image
                    </div>
                    <p className="text-xs text-muted-foreground mt-3">
                      Max {plan === "free" ? "5MB" : "200MB"}
                    </p>
                  </div>
                </motion.div>
              ) : (
                <div className="flex items-center gap-3 p-3 bg-card rounded-lg border border-border">
                  <img
                    src={preview}
                    alt="preview"
                    className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {file.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {origWidth} × {origHeight}px · {formatBytes(file.size)}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-muted-foreground hover:text-destructive"
                    onClick={() => {
                      setFile(null);
                      setPreview("");
                      setResult(null);
                    }}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Resize Controls */}
          {file && (
            <Card className="border-border shadow-card">
              <CardContent className="pt-6 space-y-5">
                <div className="flex items-center justify-between">
                  <h3 className="font-display font-semibold text-foreground">
                    Resize Settings
                  </h3>
                  <Select
                    value={unit}
                    onValueChange={(v) => setUnit(v as "px" | "%")}
                  >
                    <SelectTrigger className="w-20 font-ui text-sm h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="px">px</SelectItem>
                      <SelectItem value="%">%</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="font-ui text-sm">Width ({unit})</Label>
                    <Input
                      type="number"
                      value={width}
                      onChange={(e) => handleWidthChange(e.target.value)}
                      className="font-ui"
                      min={1}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="font-ui text-sm">Height ({unit})</Label>
                    <Input
                      type="number"
                      value={height}
                      onChange={(e) => handleHeightChange(e.target.value)}
                      className="font-ui"
                      min={1}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Switch
                    checked={lockAspect}
                    onCheckedChange={setLockAspect}
                    id="lock-aspect"
                  />
                  <Label
                    htmlFor="lock-aspect"
                    className="font-ui text-sm cursor-pointer"
                  >
                    Lock aspect ratio
                  </Label>
                </div>

                <Button
                  onClick={handleResize}
                  className="w-full font-ui gap-2"
                  disabled={!file || width <= 0 || height <= 0}
                >
                  <Maximize2 className="w-4 h-4" />
                  Resize Image
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Result */}
          <AnimatePresence>
            {result && (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
              >
                <Card className="border-border shadow-card">
                  <CardContent className="pt-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-display font-semibold text-foreground">
                        Result
                      </h3>
                      <Badge variant="secondary" className="font-ui text-xs">
                        {result.width} × {result.height}px
                      </Badge>
                    </div>
                    <img
                      src={result.dataUrl}
                      alt="Resized"
                      className="w-full max-h-72 object-contain rounded-lg border border-border"
                    />
                    <Button
                      onClick={handleDownload}
                      className="w-full font-ui gap-2"
                    >
                      <Download className="w-4 h-4" />
                      Download Resized Image
                    </Button>
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
