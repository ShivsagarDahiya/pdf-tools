import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Link } from "@tanstack/react-router";
import { Download, ImageIcon, PenLine, RotateCcw, Upload } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

interface FilterState {
  brightness: number;
  contrast: number;
  blur: number;
  saturation: number;
  grayscale: boolean;
  sepia: boolean;
}

const DEFAULT_FILTERS: FilterState = {
  brightness: 0,
  contrast: 0,
  blur: 0,
  saturation: 0,
  grayscale: false,
  sepia: false,
};

function buildFilter(f: FilterState): string {
  const parts = [
    `brightness(${1 + f.brightness / 100})`,
    `contrast(${1 + f.contrast / 100})`,
    `blur(${f.blur}px)`,
    `saturate(${1 + f.saturation / 100})`,
    f.grayscale ? "grayscale(1)" : "",
    f.sepia ? "sepia(1)" : "",
  ];
  return parts.filter(Boolean).join(" ");
}

export function ImgEditor() {
  const [file, setFile] = useState<File | null>(null);
  const [imageSrc, setImageSrc] = useState("");
  const [filters, setFilters] = useState<FilterState>({ ...DEFAULT_FILTERS });
  const [result, setResult] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement>(new Image());

  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !imageSrc) return;
    const img = imgRef.current;
    const ctx = canvas.getContext("2d")!;
    ctx.filter = buildFilter(filters);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    ctx.filter = "none";
  }, [imageSrc, filters]);

  useEffect(() => {
    drawCanvas();
  }, [drawCanvas]);

  const loadImage = (f: File) => {
    if (!f.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }
    setFile(f);
    setResult("");
    setFilters({ ...DEFAULT_FILTERS });
    const url = URL.createObjectURL(f);
    const img = imgRef.current;
    img.onload = () => {
      setImageSrc(url);
      const canvas = canvasRef.current;
      if (!canvas) return;
      const maxW = Math.min(img.naturalWidth, 700);
      const scale = maxW / img.naturalWidth;
      canvas.width = maxW;
      canvas.height = img.naturalHeight * scale;
    };
    img.src = url;
  };

  const handleApply = () => {
    const canvas = canvasRef.current;
    const img = imgRef.current;
    if (!canvas || !img.naturalWidth) return;

    const output = document.createElement("canvas");
    output.width = img.naturalWidth;
    output.height = img.naturalHeight;
    const ctx = output.getContext("2d")!;
    ctx.filter = buildFilter(filters);
    ctx.drawImage(img, 0, 0);
    ctx.filter = "none";

    const dataUrl = output.toDataURL(
      file?.type === "image/png" ? "image/png" : "image/jpeg",
      0.95,
    );
    setResult(dataUrl);
    toast.success("Filters applied!");
  };

  const handleDownload = () => {
    if (!result || !file) return;
    const a = document.createElement("a");
    a.href = result;
    a.download = `edited_${file.name}`;
    a.click();
  };

  const updateFilter = (key: keyof FilterState, value: number | boolean) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setResult("");
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
            <span className="text-foreground font-medium">Image Editor</span>
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
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 bg-indigo-50">
            <PenLine className="w-7 h-7 text-indigo-500" />
          </div>
          <div>
            <h1 className="font-display text-3xl font-bold text-foreground">
              Image Editor
            </h1>
            <p className="text-muted-foreground mt-1">
              Adjust brightness, contrast, blur, saturation, and apply filters.
              All processing in the browser.
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="space-y-6"
        >
          {!file ? (
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
                    const f = e.dataTransfer.files[0];
                    if (f) loadImage(f);
                  }}
                  onClick={() => fileInputRef.current?.click()}
                  whileHover={{ scale: 1.005 }}
                  whileTap={{ scale: 0.995 }}
                >
                  <input
                    ref={fileInputRef}
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
                      Drop an image to edit
                    </p>
                    <p className="text-sm text-muted-foreground mb-3">
                      JPG, PNG, WEBP supported
                    </p>
                    <div className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium">
                      <Upload className="w-4 h-4" />
                      Select Image
                    </div>
                  </div>
                </motion.div>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Canvas Preview */}
              <Card className="border-border shadow-card overflow-hidden">
                <CardContent className="pt-4 pb-4">
                  <p className="text-xs text-muted-foreground font-ui mb-3">
                    Live Preview (CSS filters)
                  </p>
                  <canvas
                    ref={canvasRef}
                    style={{ maxWidth: "100%", display: "block" }}
                    className="rounded-lg border border-border mx-auto"
                  />
                </CardContent>
              </Card>

              {/* Filter Controls */}
              <Card className="border-border shadow-card">
                <CardContent className="pt-6 space-y-5">
                  <div className="flex items-center justify-between">
                    <h3 className="font-display font-semibold text-foreground">
                      Adjustments
                    </h3>
                    <Button
                      variant="outline"
                      size="sm"
                      className="font-ui text-xs gap-1.5"
                      onClick={() => {
                        setFilters({ ...DEFAULT_FILTERS });
                        setResult("");
                      }}
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      Reset
                    </Button>
                  </div>

                  {[
                    {
                      key: "brightness" as const,
                      label: "Brightness",
                      min: -100,
                      max: 100,
                    },
                    {
                      key: "contrast" as const,
                      label: "Contrast",
                      min: -100,
                      max: 100,
                    },
                    {
                      key: "saturation" as const,
                      label: "Saturation",
                      min: -100,
                      max: 100,
                    },
                    {
                      key: "blur" as const,
                      label: "Blur",
                      min: 0,
                      max: 20,
                      suffix: "px",
                    },
                  ].map(({ key, label, min, max, suffix }) => (
                    <div key={key} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label className="font-ui text-sm font-medium">
                          {label}
                        </Label>
                        <span className="text-sm font-bold text-primary">
                          {filters[key] as number}
                          {suffix || ""}
                        </span>
                      </div>
                      <Slider
                        min={min}
                        max={max}
                        step={1}
                        value={[filters[key] as number]}
                        onValueChange={([v]) => updateFilter(key, v)}
                      />
                    </div>
                  ))}

                  <div className="grid grid-cols-2 gap-4 pt-2 border-t border-border">
                    <div className="flex items-center gap-3">
                      <Switch
                        id="grayscale"
                        checked={filters.grayscale}
                        onCheckedChange={(v) => updateFilter("grayscale", v)}
                      />
                      <Label
                        htmlFor="grayscale"
                        className="font-ui text-sm cursor-pointer"
                      >
                        Grayscale
                      </Label>
                    </div>
                    <div className="flex items-center gap-3">
                      <Switch
                        id="sepia"
                        checked={filters.sepia}
                        onCheckedChange={(v) => updateFilter("sepia", v)}
                      />
                      <Label
                        htmlFor="sepia"
                        className="font-ui text-sm cursor-pointer"
                      >
                        Sepia
                      </Label>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setFile(null);
                    setImageSrc("");
                    setResult("");
                    setFilters({ ...DEFAULT_FILTERS });
                  }}
                  className="font-ui"
                >
                  Change Image
                </Button>
                <Button onClick={handleApply} className="font-ui gap-2 flex-1">
                  <PenLine className="w-4 h-4" />
                  Apply & Preview
                </Button>
              </div>
            </>
          )}

          <AnimatePresence>
            {result && (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
              >
                <Card className="border-border shadow-card">
                  <CardContent className="pt-6 space-y-4">
                    <h3 className="font-display font-semibold text-foreground">
                      Edited Image
                    </h3>
                    <img
                      src={result}
                      alt="Edited"
                      className="w-full max-h-72 object-contain rounded-lg border border-border"
                    />
                    <Button
                      onClick={handleDownload}
                      className="w-full font-ui gap-2"
                    >
                      <Download className="w-4 h-4" />
                      Download Edited Image
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
