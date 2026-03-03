import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatBytes } from "@/utils/pdfUtils";
import { Link } from "@tanstack/react-router";
import {
  ArrowDown,
  ArrowUp,
  Crown,
  Download,
  FileImage,
  FilePlus,
  ImageIcon,
  Upload,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { PDFDocument } from "pdf-lib";
import { useRef, useState } from "react";
import { toast } from "sonner";

const FREE_MAX_FILES = 10;
const FREE_MAX_SIZE = 5 * 1024 * 1024;

function getUserPlan(): "free" | "plus" {
  return (localStorage.getItem("userPlan") as "free" | "plus") || "free";
}

type PageSize = "A4" | "Letter" | "A3";
type Orientation = "portrait" | "landscape";

const PAGE_SIZES: Record<PageSize, [number, number]> = {
  A4: [595.28, 841.89],
  Letter: [612, 792],
  A3: [841.89, 1190.55],
};

export function ImgToPDF() {
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [pageSize, setPageSize] = useState<PageSize>("A4");
  const [orientation, setOrientation] = useState<Orientation>("portrait");
  const [processing, setProcessing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const plan = getUserPlan();
  const maxFiles = plan === "plus" ? Number.POSITIVE_INFINITY : FREE_MAX_FILES;

  const addFiles = (newFiles: File[]) => {
    const valid = newFiles.filter((f) => {
      if (!f.type.startsWith("image/")) {
        toast.error(`${f.name} is not an image`);
        return false;
      }
      if (plan === "free" && f.size > FREE_MAX_SIZE) {
        toast.error(`${f.name} exceeds 5MB limit`);
        return false;
      }
      return true;
    });

    if (files.length + valid.length > maxFiles) {
      toast.error(`Limited to ${FREE_MAX_FILES} images on free plan`);
    }
    const combined = [...files, ...valid].slice(
      0,
      maxFiles === Number.POSITIVE_INFINITY ? 999 : maxFiles,
    );
    const newPreviews = valid.map((f) => URL.createObjectURL(f));
    setFiles(combined);
    setPreviews((prev) => [...prev, ...newPreviews].slice(0, combined.length));
  };

  const removeFile = (index: number) => {
    URL.revokeObjectURL(previews[index]);
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const moveUp = (index: number) => {
    if (index === 0) return;
    setFiles((prev) => {
      const next = [...prev];
      [next[index - 1], next[index]] = [next[index], next[index - 1]];
      return next;
    });
    setPreviews((prev) => {
      const next = [...prev];
      [next[index - 1], next[index]] = [next[index], next[index - 1]];
      return next;
    });
  };

  const moveDown = (index: number) => {
    if (index === files.length - 1) return;
    setFiles((prev) => {
      const next = [...prev];
      [next[index], next[index + 1]] = [next[index + 1], next[index]];
      return next;
    });
    setPreviews((prev) => {
      const next = [...prev];
      [next[index], next[index + 1]] = [next[index + 1], next[index]];
      return next;
    });
  };

  const handleCreate = async () => {
    if (files.length === 0) return;
    setProcessing(true);
    try {
      const pdfDoc = await PDFDocument.create();
      let [pgW, pgH] = PAGE_SIZES[pageSize];
      if (orientation === "landscape") [pgW, pgH] = [pgH, pgW];

      for (const file of files) {
        const bytes = await file.arrayBuffer();
        let img: Awaited<ReturnType<typeof pdfDoc.embedJpg>>;
        const mime = file.type;
        if (mime === "image/jpeg" || mime === "image/jpg") {
          img = await pdfDoc.embedJpg(bytes);
        } else if (mime === "image/png") {
          img = await pdfDoc.embedPng(bytes);
        } else {
          // Convert to PNG via canvas for other formats
          const canvas = document.createElement("canvas");
          const imgEl = new Image();
          await new Promise<void>((res) => {
            const url = URL.createObjectURL(file);
            imgEl.onload = () => {
              canvas.width = imgEl.width;
              canvas.height = imgEl.height;
              canvas.getContext("2d")!.drawImage(imgEl, 0, 0);
              URL.revokeObjectURL(url);
              res();
            };
            imgEl.src = url;
          });
          const pngBlob = await new Promise<Blob>((res) =>
            canvas.toBlob((b) => res(b!), "image/png"),
          );
          img = await pdfDoc.embedPng(await pngBlob.arrayBuffer());
        }

        const page = pdfDoc.addPage([pgW, pgH]);
        const { width: imgW, height: imgH } = img.scale(1);
        const scale = Math.min(pgW / imgW, pgH / imgH, 1);
        const scaledW = imgW * scale;
        const scaledH = imgH * scale;
        page.drawImage(img, {
          x: (pgW - scaledW) / 2,
          y: (pgH - scaledH) / 2,
          width: scaledW,
          height: scaledH,
        });
      }

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes.buffer as ArrayBuffer], {
        type: "application/pdf",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "images_to_pdf.pdf";
      a.click();
      URL.revokeObjectURL(url);
      toast.success("PDF created!");
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to create PDF";
      toast.error(msg);
    } finally {
      setProcessing(false);
    }
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
            <span className="text-foreground font-medium">Image to PDF</span>
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
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 bg-red-50">
            <FilePlus className="w-7 h-7 text-red-500" />
          </div>
          <div>
            <h1 className="font-display text-3xl font-bold text-foreground">
              Image to PDF
            </h1>
            <p className="text-muted-foreground mt-1">
              Combine multiple images into a single PDF. Reorder, choose page
              size, and set orientation.
            </p>
          </div>
        </motion.div>

        {plan === "free" && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <Card className="border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-800">
              <CardContent className="pt-4 pb-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <Crown className="w-5 h-5 text-amber-500 flex-shrink-0" />
                  <p className="text-xs text-muted-foreground">
                    Free plan: max 10 images
                  </p>
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
                  addFiles(Array.from(e.dataTransfer.files));
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
                  onChange={(e) => addFiles(Array.from(e.target.files || []))}
                />
                <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                    <ImageIcon className="w-8 h-8 text-primary" />
                  </div>
                  <p className="font-display font-semibold text-lg text-foreground mb-1">
                    Add images for PDF
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

              <AnimatePresence>
                {files.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="mt-4 space-y-2"
                  >
                    {files.map((file, index) => (
                      <motion.div
                        key={`${file.name}-${index}`}
                        layout
                        initial={{ opacity: 0, x: -16 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 16 }}
                        className="flex items-center gap-3 p-3 bg-card rounded-lg border border-border"
                      >
                        <img
                          src={previews[index]}
                          alt={file.name}
                          className="w-12 h-12 object-cover rounded-lg flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <Badge
                              variant="outline"
                              className="font-ui text-xs py-0 h-4"
                            >
                              {index + 1}
                            </Badge>
                            <p className="text-sm font-medium text-foreground truncate">
                              {file.name}
                            </p>
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {formatBytes(file.size)}
                          </p>
                        </div>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-muted-foreground"
                            onClick={() => moveUp(index)}
                            disabled={index === 0}
                          >
                            <ArrowUp className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-muted-foreground"
                            onClick={() => moveDown(index)}
                            disabled={index === files.length - 1}
                          >
                            <ArrowDown className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-muted-foreground hover:text-destructive"
                            onClick={() => removeFile(index)}
                          >
                            <X className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>

          {files.length > 0 && (
            <Card className="border-border shadow-card">
              <CardContent className="pt-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="font-ui font-medium text-sm">
                      Page Size
                    </Label>
                    <Select
                      value={pageSize}
                      onValueChange={(v) => setPageSize(v as PageSize)}
                    >
                      <SelectTrigger className="font-ui">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="A4">A4</SelectItem>
                        <SelectItem value="Letter">Letter</SelectItem>
                        <SelectItem value="A3">A3</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="font-ui font-medium text-sm">
                      Orientation
                    </Label>
                    <Select
                      value={orientation}
                      onValueChange={(v) => setOrientation(v as Orientation)}
                    >
                      <SelectTrigger className="font-ui">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="portrait">Portrait</SelectItem>
                        <SelectItem value="landscape">Landscape</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Button
                  onClick={handleCreate}
                  disabled={processing}
                  className="w-full font-ui gap-2"
                >
                  <Download className="w-4 h-4" />
                  {processing
                    ? "Creating PDF..."
                    : `Create PDF from ${files.length} Image(s)`}
                </Button>
              </CardContent>
            </Card>
          )}
        </motion.div>
      </div>
    </main>
  );
}
