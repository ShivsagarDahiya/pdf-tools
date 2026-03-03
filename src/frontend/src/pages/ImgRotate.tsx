import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatBytes } from "@/utils/pdfUtils";
import { Link } from "@tanstack/react-router";
import {
  Download,
  FileImage,
  FlipHorizontal,
  FlipVertical,
  ImageIcon,
  RotateCcw,
  RotateCw,
  Upload,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useRef, useState } from "react";
import { toast } from "sonner";

interface RotateFile {
  file: File;
  preview: string;
  rotation: number;
  flipH: boolean;
  flipV: boolean;
  result: string | null;
}

export function ImgRotate() {
  const [files, setFiles] = useState<RotateFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const loadFiles = (newFiles: File[]) => {
    const valid = newFiles.filter((f) => f.type.startsWith("image/"));
    if (valid.length < newFiles.length)
      toast.error("Some files are not images and were skipped");

    const loadedFiles: RotateFile[] = valid.map((f) => ({
      file: f,
      preview: URL.createObjectURL(f),
      rotation: 0,
      flipH: false,
      flipV: false,
      result: null,
    }));
    setFiles((prev) => [...prev, ...loadedFiles]);
  };

  const updateFile = (
    index: number,
    updates: Partial<Omit<RotateFile, "file" | "preview">>,
  ) => {
    setFiles((prev) =>
      prev.map((f, i) => (i === index ? { ...f, ...updates } : f)),
    );
  };

  // biome-ignore lint/correctness/useExhaustiveDependencies: files dependency intentional
  const applyTransform = useCallback(
    (index: number) => {
      const rf = files[index];
      const img = new Image();
      img.onload = () => {
        const rad = (rf.rotation * Math.PI) / 180;
        const cos = Math.abs(Math.cos(rad));
        const sin = Math.abs(Math.sin(rad));
        const newW = Math.round(img.width * cos + img.height * sin);
        const newH = Math.round(img.width * sin + img.height * cos);
        const canvas = document.createElement("canvas");
        canvas.width = newW;
        canvas.height = newH;
        const ctx = canvas.getContext("2d")!;
        ctx.translate(newW / 2, newH / 2);
        ctx.rotate(rad);
        ctx.scale(rf.flipH ? -1 : 1, rf.flipV ? -1 : 1);
        ctx.drawImage(img, -img.width / 2, -img.height / 2);
        const dataUrl = canvas.toDataURL(
          rf.file.type === "image/png" ? "image/png" : "image/jpeg",
          0.92,
        );
        updateFile(index, { result: dataUrl });
        toast.success(`Applied to ${rf.file.name}`);
      };
      img.src = rf.preview;
    },
    [files],
  );

  const downloadResult = (rf: RotateFile) => {
    if (!rf.result) return;
    const a = document.createElement("a");
    a.href = rf.result;
    a.download = `rotated_${rf.file.name}`;
    a.click();
  };

  const rotate = (index: number, deg: number) => {
    const current = files[index].rotation;
    updateFile(index, { rotation: (((current + deg) % 360) + 360) % 360 });
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
            <span className="text-foreground font-medium">Rotate Image</span>
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
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 bg-teal-50">
            <RotateCw className="w-7 h-7 text-teal-500" />
          </div>
          <div>
            <h1 className="font-display text-3xl font-bold text-foreground">
              Rotate & Flip Image
            </h1>
            <p className="text-muted-foreground mt-1">
              Rotate 90°, 180°, 270° or flip horizontally and vertically. Batch
              support.
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
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
                  loadFiles(Array.from(e.dataTransfer.files));
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
                  onChange={(e) => loadFiles(Array.from(e.target.files || []))}
                />
                <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                    <ImageIcon className="w-8 h-8 text-primary" />
                  </div>
                  <p className="font-display font-semibold text-lg text-foreground mb-1">
                    Drop images to rotate
                  </p>
                  <p className="text-sm text-muted-foreground mb-3">
                    JPG, PNG, WEBP supported
                  </p>
                  <div className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium">
                    <Upload className="w-4 h-4" />
                    Select Images
                  </div>
                </div>
              </motion.div>
            </CardContent>
          </Card>

          <AnimatePresence>
            {files.map((rf, index) => (
              <motion.div
                key={`${rf.file.name}-${index}`}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="border-border shadow-card">
                  <CardContent className="pt-6 space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                        <FileImage className="w-4 h-4 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">
                          {rf.file.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatBytes(rf.file.size)} · {rf.rotation}°
                          {rf.flipH ? " · Flipped H" : ""}
                          {rf.flipV ? " · Flipped V" : ""}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-muted-foreground hover:text-destructive"
                        onClick={() => {
                          URL.revokeObjectURL(rf.preview);
                          setFiles((prev) =>
                            prev.filter((_, i) => i !== index),
                          );
                        }}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>

                    {/* Preview */}
                    <div className="flex justify-center">
                      <img
                        src={rf.result || rf.preview}
                        alt={rf.file.name}
                        className="max-h-48 max-w-full object-contain rounded-lg border border-border"
                        style={{
                          transform: `rotate(${rf.rotation}deg) scaleX(${rf.flipH ? -1 : 1}) scaleY(${rf.flipV ? -1 : 1})`,
                          transition: "transform 0.3s ease",
                        }}
                      />
                    </div>

                    {/* Controls */}
                    <div className="flex flex-wrap gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="font-ui text-xs gap-1.5"
                        onClick={() => rotate(index, 90)}
                      >
                        <RotateCw className="w-3.5 h-3.5" />
                        90° CW
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="font-ui text-xs gap-1.5"
                        onClick={() => rotate(index, -90)}
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        90° CCW
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="font-ui text-xs gap-1.5"
                        onClick={() => rotate(index, 180)}
                      >
                        <RotateCw className="w-3.5 h-3.5" />
                        180°
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className={`font-ui text-xs gap-1.5 ${rf.flipH ? "border-primary text-primary" : ""}`}
                        onClick={() =>
                          updateFile(index, { flipH: !rf.flipH, result: null })
                        }
                      >
                        <FlipHorizontal className="w-3.5 h-3.5" />
                        Flip H
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className={`font-ui text-xs gap-1.5 ${rf.flipV ? "border-primary text-primary" : ""}`}
                        onClick={() =>
                          updateFile(index, { flipV: !rf.flipV, result: null })
                        }
                      >
                        <FlipVertical className="w-3.5 h-3.5" />
                        Flip V
                      </Button>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        onClick={() => applyTransform(index)}
                        className="font-ui gap-2 flex-1"
                        size="sm"
                      >
                        <RotateCw className="w-4 h-4" />
                        Apply Transform
                      </Button>
                      {rf.result && (
                        <Button
                          onClick={() => downloadResult(rf)}
                          variant="outline"
                          className="font-ui gap-2"
                          size="sm"
                        >
                          <Download className="w-4 h-4" />
                          Download
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </div>
    </main>
  );
}
