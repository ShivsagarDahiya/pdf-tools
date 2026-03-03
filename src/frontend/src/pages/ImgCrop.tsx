import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Link } from "@tanstack/react-router";
import { Crop, Download, ImageIcon, Upload } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

type Ratio = "free" | "1:1" | "16:9" | "4:3" | "3:2";

const RATIOS: { label: string; value: Ratio }[] = [
  { label: "Free", value: "free" },
  { label: "1:1", value: "1:1" },
  { label: "16:9", value: "16:9" },
  { label: "4:3", value: "4:3" },
  { label: "3:2", value: "3:2" },
];

function getRatioValue(r: Ratio): number | null {
  if (r === "free") return null;
  const [w, h] = r.split(":").map(Number);
  return w / h;
}

export function ImgCrop() {
  const [file, setFile] = useState<File | null>(null);
  const [imageSrc, setImageSrc] = useState<string>("");
  const [ratio, setRatio] = useState<Ratio>("free");
  const [cropBox, setCropBox] = useState({ x: 50, y: 50, w: 300, h: 200 });
  const [dragging, setDragging] = useState<
    null | "move" | "tl" | "tr" | "bl" | "br"
  >(null);
  const [dragStart, setDragStart] = useState({
    x: 0,
    y: 0,
    cx: 0,
    cy: 0,
    cw: 0,
    ch: 0,
  });
  const [result, setResult] = useState<string>("");
  const [isDragging, setIsDragging] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement>(new Image());
  const containerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !imageSrc) return;
    const ctx = canvas.getContext("2d")!;
    const img = imgRef.current;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    // Overlay
    ctx.fillStyle = "rgba(0,0,0,0.45)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Clear crop area
    ctx.clearRect(cropBox.x, cropBox.y, cropBox.w, cropBox.h);
    ctx.drawImage(
      img,
      (cropBox.x / canvas.width) * img.naturalWidth,
      (cropBox.y / canvas.height) * img.naturalHeight,
      (cropBox.w / canvas.width) * img.naturalWidth,
      (cropBox.h / canvas.height) * img.naturalHeight,
      cropBox.x,
      cropBox.y,
      cropBox.w,
      cropBox.h,
    );

    // Border
    ctx.strokeStyle = "#E25C3B";
    ctx.lineWidth = 2;
    ctx.strokeRect(cropBox.x, cropBox.y, cropBox.w, cropBox.h);

    // Handles
    const handleSize = 10;
    const handles = [
      { x: cropBox.x, y: cropBox.y },
      { x: cropBox.x + cropBox.w, y: cropBox.y },
      { x: cropBox.x, y: cropBox.y + cropBox.h },
      { x: cropBox.x + cropBox.w, y: cropBox.y + cropBox.h },
    ];
    ctx.fillStyle = "#E25C3B";
    for (const h of handles) {
      ctx.fillRect(
        h.x - handleSize / 2,
        h.y - handleSize / 2,
        handleSize,
        handleSize,
      );
    }

    // Grid lines
    ctx.strokeStyle = "rgba(255,255,255,0.3)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(cropBox.x + cropBox.w / 3, cropBox.y);
    ctx.lineTo(cropBox.x + cropBox.w / 3, cropBox.y + cropBox.h);
    ctx.moveTo(cropBox.x + (cropBox.w * 2) / 3, cropBox.y);
    ctx.lineTo(cropBox.x + (cropBox.w * 2) / 3, cropBox.y + cropBox.h);
    ctx.moveTo(cropBox.x, cropBox.y + cropBox.h / 3);
    ctx.lineTo(cropBox.x + cropBox.w, cropBox.y + cropBox.h / 3);
    ctx.moveTo(cropBox.x, cropBox.y + (cropBox.h * 2) / 3);
    ctx.lineTo(cropBox.x + cropBox.w, cropBox.y + (cropBox.h * 2) / 3);
    ctx.stroke();
  }, [imageSrc, cropBox]);

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
      const w = Math.min(300, canvas.width * 0.7);
      const h = Math.min(200, canvas.height * 0.7);
      setCropBox({
        x: (canvas.width - w) / 2,
        y: (canvas.height - h) / 2,
        w,
        h,
      });
    };
    img.src = url;
  };

  const applyRatio = (r: Ratio) => {
    setRatio(r);
    const rv = getRatioValue(r);
    if (!rv) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const newW = Math.min(cropBox.w, canvas.width * 0.8);
    const newH = newW / rv;
    setCropBox((prev) => ({
      ...prev,
      w: newW,
      h: newH,
      x: Math.max(0, Math.min(prev.x, canvas.width - newW)),
      y: Math.max(0, Math.min(prev.y, canvas.height - newH)),
    }));
  };

  const getCanvasPos = (e: React.MouseEvent): { x: number; y: number } => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    const { x, y } = getCanvasPos(e);
    const hs = 12;
    const corners = [
      { key: "tl", cx: cropBox.x, cy: cropBox.y },
      { key: "tr", cx: cropBox.x + cropBox.w, cy: cropBox.y },
      { key: "bl", cx: cropBox.x, cy: cropBox.y + cropBox.h },
      { key: "br", cx: cropBox.x + cropBox.w, cy: cropBox.y + cropBox.h },
    ];
    for (const c of corners) {
      if (Math.abs(x - c.cx) < hs && Math.abs(y - c.cy) < hs) {
        setDragging(c.key as "tl" | "tr" | "bl" | "br");
        setDragStart({
          x,
          y,
          cx: cropBox.x,
          cy: cropBox.y,
          cw: cropBox.w,
          ch: cropBox.h,
        });
        return;
      }
    }
    if (
      x >= cropBox.x &&
      x <= cropBox.x + cropBox.w &&
      y >= cropBox.y &&
      y <= cropBox.y + cropBox.h
    ) {
      setDragging("move");
      setDragStart({
        x,
        y,
        cx: cropBox.x,
        cy: cropBox.y,
        cw: cropBox.w,
        ch: cropBox.h,
      });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!dragging) return;
    const canvas = canvasRef.current!;
    const { x, y } = getCanvasPos(e);
    const dx = x - dragStart.x;
    const dy = y - dragStart.y;
    const rv = getRatioValue(ratio);

    setCropBox(() => {
      let nx = dragStart.cx;
      let ny = dragStart.cy;
      let nw = dragStart.cw;
      let nh = dragStart.ch;

      if (dragging === "move") {
        nx = Math.max(0, Math.min(canvas.width - nw, dragStart.cx + dx));
        ny = Math.max(0, Math.min(canvas.height - nh, dragStart.cy + dy));
      } else if (dragging === "br") {
        nw = Math.max(40, dragStart.cw + dx);
        nh = rv ? nw / rv : Math.max(40, dragStart.ch + dy);
        nw = Math.min(nw, canvas.width - nx);
        nh = Math.min(nh, canvas.height - ny);
      } else if (dragging === "tl") {
        const newX = Math.min(
          dragStart.cx + dragStart.cw - 40,
          dragStart.cx + dx,
        );
        const newY = rv
          ? ny
          : Math.min(dragStart.cy + dragStart.ch - 40, dragStart.cy + dy);
        nw = dragStart.cx + dragStart.cw - newX;
        nh = rv ? nw / rv : dragStart.cy + dragStart.ch - newY;
        nx = newX;
        ny = rv ? dragStart.cy + dragStart.ch - nh : newY;
      } else if (dragging === "tr") {
        const newY = rv
          ? ny
          : Math.min(dragStart.cy + dragStart.ch - 40, dragStart.cy + dy);
        nw = Math.max(40, dragStart.cw + dx);
        nh = rv ? nw / rv : dragStart.cy + dragStart.ch - newY;
        ny = rv ? dragStart.cy + dragStart.ch - nh : newY;
      } else if (dragging === "bl") {
        const newX = Math.min(
          dragStart.cx + dragStart.cw - 40,
          dragStart.cx + dx,
        );
        nw = dragStart.cx + dragStart.cw - newX;
        nh = rv ? nw / rv : Math.max(40, dragStart.ch + dy);
        nx = newX;
      }

      return {
        x: Math.max(0, nx),
        y: Math.max(0, ny),
        w: Math.min(nw, canvas.width - Math.max(0, nx)),
        h: Math.min(nh, canvas.height - Math.max(0, ny)),
      };
    });
  };

  const handleMouseUp = () => setDragging(null);

  const handleCrop = () => {
    const canvas = canvasRef.current;
    const img = imgRef.current;
    if (!canvas || !img.naturalWidth) return;

    const scaleX = img.naturalWidth / canvas.width;
    const scaleY = img.naturalHeight / canvas.height;
    const output = document.createElement("canvas");
    output.width = Math.round(cropBox.w * scaleX);
    output.height = Math.round(cropBox.h * scaleY);
    const ctx = output.getContext("2d")!;
    ctx.drawImage(
      img,
      cropBox.x * scaleX,
      cropBox.y * scaleY,
      cropBox.w * scaleX,
      cropBox.h * scaleY,
      0,
      0,
      output.width,
      output.height,
    );
    const dataUrl = output.toDataURL(
      file?.type === "image/png" ? "image/png" : "image/jpeg",
      0.92,
    );
    setResult(dataUrl);
    toast.success("Image cropped!");
  };

  const handleDownload = () => {
    if (!result || !file) return;
    const a = document.createElement("a");
    a.href = result;
    a.download = `cropped_${file.name}`;
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
            <span className="text-foreground font-medium">Crop Image</span>
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
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 bg-green-50">
            <Crop className="w-7 h-7 text-green-500" />
          </div>
          <div>
            <h1 className="font-display text-3xl font-bold text-foreground">
              Crop Image
            </h1>
            <p className="text-muted-foreground mt-1">
              Drag the crop handles to select your desired area. Choose preset
              ratios for quick sizing.
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
              {/* Ratio Selector */}
              <Card className="border-border shadow-card">
                <CardContent className="pt-5 pb-5">
                  <div className="flex items-center gap-3 flex-wrap">
                    <Label className="font-ui font-medium text-sm shrink-0">
                      Aspect Ratio:
                    </Label>
                    <div className="flex gap-2 flex-wrap">
                      {RATIOS.map((r) => (
                        <Button
                          key={r.value}
                          variant={ratio === r.value ? "default" : "outline"}
                          size="sm"
                          className="font-ui text-xs h-8"
                          onClick={() => applyRatio(r.value)}
                        >
                          {r.label}
                        </Button>
                      ))}
                    </div>
                    <div className="ml-auto text-xs text-muted-foreground font-ui">
                      {Math.round(cropBox.w)} × {Math.round(cropBox.h)}px
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Canvas */}
              <Card className="border-border shadow-card overflow-hidden">
                <CardContent className="pt-4 pb-4">
                  <div ref={containerRef} className="w-full overflow-auto">
                    <canvas
                      ref={canvasRef}
                      style={{
                        cursor:
                          dragging === "move"
                            ? "grabbing"
                            : dragging
                              ? "nwse-resize"
                              : "crosshair",
                        maxWidth: "100%",
                        display: "block",
                        userSelect: "none",
                      }}
                      onMouseDown={handleMouseDown}
                      onMouseMove={handleMouseMove}
                      onMouseUp={handleMouseUp}
                      onMouseLeave={handleMouseUp}
                    />
                  </div>
                </CardContent>
              </Card>

              <div className="flex gap-3">
                <Button
                  onClick={() => {
                    setFile(null);
                    setImageSrc("");
                    setResult("");
                  }}
                  variant="outline"
                  className="font-ui"
                >
                  Change Image
                </Button>
                <Button onClick={handleCrop} className="font-ui gap-2 flex-1">
                  <Crop className="w-4 h-4" />
                  Crop & Preview
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
                      Cropped Preview
                    </h3>
                    <img
                      src={result}
                      alt="Cropped"
                      className="w-full max-h-72 object-contain rounded-lg border border-border"
                    />
                    <Button
                      onClick={handleDownload}
                      className="w-full font-ui gap-2"
                    >
                      <Download className="w-4 h-4" />
                      Download Cropped Image
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
