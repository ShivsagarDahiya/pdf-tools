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
import { Slider } from "@/components/ui/slider";
import { Link } from "@tanstack/react-router";
import { Download, ImageIcon, Stamp, Upload } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

type Position =
  | "center"
  | "top-left"
  | "top-right"
  | "bottom-left"
  | "bottom-right";

const POSITIONS: { label: string; value: Position }[] = [
  { label: "Center", value: "center" },
  { label: "Top Left", value: "top-left" },
  { label: "Top Right", value: "top-right" },
  { label: "Bottom Left", value: "bottom-left" },
  { label: "Bottom Right", value: "bottom-right" },
];

export function ImgWatermark() {
  const [file, setFile] = useState<File | null>(null);
  const [imageSrc, setImageSrc] = useState("");
  const [text, setText] = useState("© My Brand");
  const [fontSize, setFontSize] = useState(40);
  const [opacity, setOpacity] = useState(50);
  const [position, setPosition] = useState<Position>("center");
  const [color, setColor] = useState("#ffffff");
  const [result, setResult] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement>(new Image());
  const fileInputRef = useRef<HTMLInputElement>(null);

  const drawPreview = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !imageSrc) return;
    const img = imgRef.current;
    const ctx = canvas.getContext("2d")!;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    if (!text.trim()) return;

    ctx.globalAlpha = opacity / 100;
    ctx.fillStyle = color;
    ctx.font = `bold ${fontSize}px sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    const padding = 20;
    const metrics = ctx.measureText(text);
    const textW = metrics.width;

    let x = canvas.width / 2;
    let y = canvas.height / 2;

    switch (position) {
      case "top-left":
        x = padding + textW / 2;
        y = padding + fontSize / 2;
        break;
      case "top-right":
        x = canvas.width - padding - textW / 2;
        y = padding + fontSize / 2;
        break;
      case "bottom-left":
        x = padding + textW / 2;
        y = canvas.height - padding - fontSize / 2;
        break;
      case "bottom-right":
        x = canvas.width - padding - textW / 2;
        y = canvas.height - padding - fontSize / 2;
        break;
      default:
        break;
    }

    // Shadow for visibility
    ctx.shadowColor = "rgba(0,0,0,0.4)";
    ctx.shadowBlur = 4;
    ctx.fillText(text, x, y);
    ctx.shadowBlur = 0;
    ctx.globalAlpha = 1;
  }, [imageSrc, text, fontSize, opacity, position, color]);

  useEffect(() => {
    drawPreview();
  }, [drawPreview]);

  const loadImage = (f: File) => {
    if (!f.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }
    setFile(f);
    setResult("");
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
    ctx.drawImage(img, 0, 0);

    if (text.trim()) {
      const scale = img.naturalWidth / canvas.width;
      ctx.globalAlpha = opacity / 100;
      ctx.fillStyle = color;
      ctx.font = `bold ${fontSize * scale}px sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      const metrics = ctx.measureText(text);
      const textW = metrics.width;
      const padding = 20 * scale;
      const fs = fontSize * scale;

      let x = output.width / 2;
      let y = output.height / 2;

      switch (position) {
        case "top-left":
          x = padding + textW / 2;
          y = padding + fs / 2;
          break;
        case "top-right":
          x = output.width - padding - textW / 2;
          y = padding + fs / 2;
          break;
        case "bottom-left":
          x = padding + textW / 2;
          y = output.height - padding - fs / 2;
          break;
        case "bottom-right":
          x = output.width - padding - textW / 2;
          y = output.height - padding - fs / 2;
          break;
      }

      ctx.shadowColor = "rgba(0,0,0,0.4)";
      ctx.shadowBlur = 6;
      ctx.fillText(text, x, y);
      ctx.shadowBlur = 0;
      ctx.globalAlpha = 1;
    }

    const dataUrl = output.toDataURL(
      file?.type === "image/png" ? "image/png" : "image/jpeg",
      0.95,
    );
    setResult(dataUrl);
    toast.success("Watermark applied!");
  };

  const handleDownload = () => {
    if (!result || !file) return;
    const a = document.createElement("a");
    a.href = result;
    a.download = `watermarked_${file.name}`;
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
            <span className="text-foreground font-medium">Watermark Image</span>
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
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 bg-violet-50">
            <Stamp className="w-7 h-7 text-violet-500" />
          </div>
          <div>
            <h1 className="font-display text-3xl font-bold text-foreground">
              Watermark Image
            </h1>
            <p className="text-muted-foreground mt-1">
              Add a text watermark to your image with adjustable opacity,
              position, size, and color.
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
                      Drop an image here
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
              {/* Watermark Controls */}
              <Card className="border-border shadow-card">
                <CardContent className="pt-6 space-y-4">
                  <div className="space-y-1.5">
                    <Label className="font-ui font-medium">
                      Watermark Text
                    </Label>
                    <Input
                      value={text}
                      onChange={(e) => setText(e.target.value)}
                      placeholder="© Your Name"
                      className="font-ui"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <Label className="font-ui font-medium text-sm">
                          Font Size
                        </Label>
                        <span className="text-sm text-primary font-bold">
                          {fontSize}px
                        </span>
                      </div>
                      <Slider
                        min={10}
                        max={200}
                        step={5}
                        value={[fontSize]}
                        onValueChange={([v]) => setFontSize(v)}
                      />
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <Label className="font-ui font-medium text-sm">
                          Opacity
                        </Label>
                        <span className="text-sm text-primary font-bold">
                          {opacity}%
                        </span>
                      </div>
                      <Slider
                        min={10}
                        max={100}
                        step={5}
                        value={[opacity]}
                        onValueChange={([v]) => setOpacity(v)}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className="font-ui font-medium text-sm">
                        Position
                      </Label>
                      <Select
                        value={position}
                        onValueChange={(v) => setPosition(v as Position)}
                      >
                        <SelectTrigger className="font-ui">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {POSITIONS.map((p) => (
                            <SelectItem key={p.value} value={p.value}>
                              {p.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="font-ui font-medium text-sm">
                        Text Color
                      </Label>
                      <div className="flex gap-2">
                        <Input
                          type="color"
                          value={color}
                          onChange={(e) => setColor(e.target.value)}
                          className="w-12 h-9 p-1 cursor-pointer"
                        />
                        <Input
                          value={color}
                          onChange={(e) => setColor(e.target.value)}
                          className="font-ui flex-1"
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Canvas Preview */}
              <Card className="border-border shadow-card overflow-hidden">
                <CardContent className="pt-4 pb-4">
                  <p className="text-xs text-muted-foreground font-ui mb-3">
                    Live Preview
                  </p>
                  <canvas
                    ref={canvasRef}
                    style={{ maxWidth: "100%", display: "block" }}
                    className="rounded-lg border border-border mx-auto"
                  />
                </CardContent>
              </Card>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setFile(null);
                    setImageSrc("");
                    setResult("");
                  }}
                  className="font-ui"
                >
                  Change Image
                </Button>
                <Button onClick={handleApply} className="font-ui gap-2 flex-1">
                  <Stamp className="w-4 h-4" />
                  Apply Watermark
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
                      Watermarked Image
                    </h3>
                    <img
                      src={result}
                      alt="Watermarked"
                      className="w-full max-h-72 object-contain rounded-lg border border-border"
                    />
                    <Button
                      onClick={handleDownload}
                      className="w-full font-ui gap-2"
                    >
                      <Download className="w-4 h-4" />
                      Download Watermarked Image
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
