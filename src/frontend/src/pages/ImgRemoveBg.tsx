import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Link } from "@tanstack/react-router";
import {
  Crown,
  Download,
  ImageIcon,
  Layers,
  Upload,
  Wand2,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useRef, useState } from "react";
import { toast } from "sonner";

export function ImgRemoveBg() {
  const [isPlusDemo, setIsPlusDemo] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [original, setOriginal] = useState("");
  const [result, setResult] = useState("");
  const [processing, setProcessing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadImage = (f: File) => {
    if (!f.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }
    setFile(f);
    setResult("");
    setOriginal(URL.createObjectURL(f));
  };

  const floodFill = useCallback(
    (
      imageData: ImageData,
      startX: number,
      startY: number,
      tolerance: number,
    ) => {
      const data = imageData.data;
      const width = imageData.width;
      const height = imageData.height;
      const visited = new Uint8Array(width * height);

      const getIdx = (x: number, y: number) => (y * width + x) * 4;
      const startIdx = getIdx(startX, startY);
      const startR = data[startIdx];
      const startG = data[startIdx + 1];
      const startB = data[startIdx + 2];

      const colorMatch = (x: number, y: number) => {
        const idx = getIdx(x, y);
        return (
          Math.abs(data[idx] - startR) <= tolerance &&
          Math.abs(data[idx + 1] - startG) <= tolerance &&
          Math.abs(data[idx + 2] - startB) <= tolerance
        );
      };

      const queue: [number, number][] = [[startX, startY]];
      while (queue.length > 0) {
        const [cx, cy] = queue.pop()!;
        if (cx < 0 || cx >= width || cy < 0 || cy >= height) continue;
        const vi = cy * width + cx;
        if (visited[vi]) continue;
        if (!colorMatch(cx, cy)) continue;
        visited[vi] = 1;

        const idx = getIdx(cx, cy);
        data[idx + 3] = 0; // Set transparent

        queue.push([cx + 1, cy], [cx - 1, cy], [cx, cy + 1], [cx, cy - 1]);
      }
    },
    [],
  );

  const handleRemoveBg = useCallback(async () => {
    if (!file || !original) return;
    setProcessing(true);
    try {
      await new Promise<void>((resolve) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          canvas.width = img.naturalWidth;
          canvas.height = img.naturalHeight;
          const ctx = canvas.getContext("2d")!;
          ctx.drawImage(img, 0, 0);
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const tolerance = 30;
          const corners: [number, number][] = [
            [0, 0],
            [canvas.width - 1, 0],
            [0, canvas.height - 1],
            [canvas.width - 1, canvas.height - 1],
          ];
          for (const [x, y] of corners) {
            floodFill(imageData, x, y, tolerance);
          }
          ctx.putImageData(imageData, 0, 0);
          const dataUrl = canvas.toDataURL("image/png");
          setResult(dataUrl);
          toast.success("Background removed!");
          resolve();
        };
        img.src = original;
      });
    } catch {
      toast.error("Background removal failed");
    } finally {
      setProcessing(false);
    }
  }, [file, original, floodFill]);

  const handleDownload = () => {
    if (!result || !file) return;
    const a = document.createElement("a");
    a.href = result;
    a.download = `no-bg_${file.name.replace(/\.[^/.]+$/, "")}.png`;
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
            <span className="text-foreground font-medium">
              Remove Background
            </span>
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
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 bg-rose-50">
            <Wand2 className="w-7 h-7 text-rose-500" />
          </div>
          <div>
            <h1 className="font-display text-3xl font-bold text-foreground">
              Remove Background
            </h1>
            <p className="text-muted-foreground mt-1">
              Automatically remove the background from your images. Plus feature
              — uses canvas-based flood fill detection.
            </p>
          </div>
        </motion.div>

        {/* Demo toggle for testing */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <Card className="border-border">
            <CardContent className="pt-4 pb-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Crown className="w-5 h-5 text-amber-500" />
                <div>
                  <p className="font-ui text-sm font-medium text-foreground">
                    Plus Feature Demo
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Toggle to simulate Plus plan access
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Label className="font-ui text-sm text-muted-foreground">
                  I'm a Plus user (demo)
                </Label>
                <Switch checked={isPlusDemo} onCheckedChange={setIsPlusDemo} />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
        >
          {!isPlusDemo ? (
            <Card className="border-border shadow-card">
              <CardContent className="pt-12 pb-12 text-center space-y-6">
                <div className="w-20 h-20 rounded-3xl bg-amber-100 flex items-center justify-center mx-auto">
                  <Crown className="w-10 h-10 text-amber-500" />
                </div>
                <div>
                  <h2 className="font-display font-bold text-2xl text-foreground mb-2">
                    Plus Plan Required
                  </h2>
                  <p className="text-muted-foreground max-w-sm mx-auto">
                    Background removal requires a Plus subscription. Upgrade to
                    unlock this feature along with 200MB file support, unlimited
                    batches, and more.
                  </p>
                </div>
                <div className="flex flex-wrap gap-3 justify-center">
                  <Link to="/upgrade">
                    <Button
                      size="lg"
                      className="bg-amber-500 hover:bg-amber-600 text-white font-ui gap-2"
                    >
                      <Crown className="w-4 h-4" />
                      Upgrade to Plus
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    size="lg"
                    className="font-ui"
                    onClick={() => setIsPlusDemo(true)}
                  >
                    Try Demo
                  </Button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-w-md mx-auto text-left pt-4">
                  {[
                    "200MB file size",
                    "Unlimited batch",
                    "No watermarks",
                    "Background removal",
                    "Priority processing",
                    "Cloud history",
                  ].map((f) => (
                    <div
                      key={f}
                      className="flex items-center gap-2 text-sm text-muted-foreground"
                    >
                      <div className="w-1.5 h-1.5 rounded-full bg-amber-500 flex-shrink-0" />
                      {f}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
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
                          Best with images that have a clear, uniform background
                        </p>
                        <div className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium">
                          <Upload className="w-4 h-4" />
                          Select Image
                        </div>
                      </div>
                    </motion.div>
                  ) : (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs text-muted-foreground font-ui mb-2">
                            Original
                          </p>
                          <img
                            src={original}
                            alt="Original"
                            className="w-full h-48 object-contain rounded-lg border border-border bg-checkered"
                            style={{
                              backgroundImage:
                                "linear-gradient(45deg, #eee 25%, transparent 25%), linear-gradient(-45deg, #eee 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #eee 75%), linear-gradient(-45deg, transparent 75%, #eee 75%)",
                              backgroundSize: "20px 20px",
                              backgroundPosition:
                                "0 0, 0 10px, 10px -10px, -10px 0px",
                            }}
                          />
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground font-ui mb-2">
                            Result
                          </p>
                          {result ? (
                            <img
                              src={result}
                              alt="No background"
                              className="w-full h-48 object-contain rounded-lg border border-border"
                              style={{
                                backgroundImage:
                                  "linear-gradient(45deg, #eee 25%, transparent 25%), linear-gradient(-45deg, #eee 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #eee 75%), linear-gradient(-45deg, transparent 75%, #eee 75%)",
                                backgroundSize: "20px 20px",
                                backgroundPosition:
                                  "0 0, 0 10px, 10px -10px, -10px 0px",
                              }}
                            />
                          ) : (
                            <div className="w-full h-48 rounded-lg border border-dashed border-border flex items-center justify-center">
                              <Layers className="w-8 h-8 text-muted-foreground" />
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <Button
                          variant="outline"
                          onClick={() => {
                            setFile(null);
                            setOriginal("");
                            setResult("");
                          }}
                          className="font-ui"
                        >
                          Change Image
                        </Button>
                        <Button
                          onClick={handleRemoveBg}
                          disabled={processing}
                          className="font-ui gap-2 flex-1"
                        >
                          <Wand2 className="w-4 h-4" />
                          {processing ? "Removing..." : "Remove Background"}
                        </Button>
                        {result && (
                          <Button
                            onClick={handleDownload}
                            variant="outline"
                            className="font-ui gap-2"
                          >
                            <Download className="w-4 h-4" />
                            PNG
                          </Button>
                        )}
                      </div>

                      <p className="text-xs text-muted-foreground text-center">
                        Works best on images with solid, uniform backgrounds
                        (white, blue, green screens)
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </motion.div>
      </div>
    </main>
  );
}
