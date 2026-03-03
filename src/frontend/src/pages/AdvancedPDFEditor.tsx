import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAddHistory, useIncrementToolUsage } from "@/hooks/useQueries";
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  ArrowLeft,
  Bold,
  Check,
  ChevronDown,
  Circle,
  Download,
  Edit2,
  Eraser,
  FileText,
  Highlighter,
  Image,
  Italic,
  Layers,
  LayoutTemplate,
  MessageSquare,
  Minus,
  MousePointer,
  Pen,
  Plus,
  Printer,
  Redo2,
  RotateCw,
  Share2,
  Sparkles,
  Square,
  StickyNote,
  Triangle,
  Type,
  Underline,
  Undo2,
  Upload,
  X,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

// ─── Types ──────────────────────────────────────────────────────────────────

type ToolMode =
  | "selection"
  | "edit"
  | "sign"
  | "text"
  | "erase"
  | "highlight"
  | "redact"
  | "image"
  | "arrow"
  | "draw"
  | "cross"
  | "check"
  | "sticky"
  | "shape";

type ElementType =
  | "text"
  | "shape"
  | "image"
  | "signature"
  | "sticky"
  | "highlight"
  | "arrow"
  | "check"
  | "cross"
  | "draw";

interface AnnotationObject {
  id: string;
  type: ElementType;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  content: string;
  style: {
    fontSize?: number;
    fontFamily?: string;
    bold?: boolean;
    italic?: boolean;
    underline?: boolean;
    color?: string;
    fillColor?: string;
    borderColor?: string;
    borderWidth?: number;
    opacity?: number;
    alignment?: "left" | "center" | "right";
    shapeType?: "rect" | "circle" | "line" | "arrow";
    filter?: string;
    brightness?: number;
    contrast?: number;
    saturation?: number;
    blur?: number;
    lineHeight?: number;
    shadow?: boolean;
    borderRadius?: number;
    drawPoints?: Array<{ x: number; y: number }>;
  };
  imageData?: string;
}

type SidebarTab =
  | "pages"
  | "text"
  | "elements"
  | "uploads"
  | "templates"
  | "forms"
  | "comments"
  | "layers";

// ─── Galaxy header helpers (reuse same pattern as ToolLayout) ────────────────

function seededRand(seed: number): number {
  const x = Math.sin(seed + 1) * 10000;
  return x - Math.floor(x);
}

interface StarData {
  id: number;
  top: string;
  left: string;
  size: string;
  animDuration: string;
  animDelay: string;
  opacity: string;
}

function generateStars(count: number): StarData[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    top: `${(seededRand(i * 3) * 100).toFixed(2)}%`,
    left: `${(seededRand(i * 3 + 1) * 100).toFixed(2)}%`,
    size: `${(seededRand(i * 3 + 2) * 1.5 + 0.5).toFixed(2)}px`,
    animDuration: `${(seededRand(i * 7 + 5) * 3 + 2).toFixed(2)}s`,
    animDelay: `${(seededRand(i * 7 + 6) * 4).toFixed(2)}s`,
    opacity: `${(seededRand(i * 11 + 3) * 0.6 + 0.3).toFixed(2)}`,
  }));
}

const GALAXY_STYLES_ID = "galaxy-editor-keyframes";

function injectGalaxyStyles() {
  if (document.getElementById(GALAXY_STYLES_ID)) return;
  const style = document.createElement("style");
  style.id = GALAXY_STYLES_ID;
  style.textContent = `
    @keyframes starTwinkleEd {
      0%, 100% { opacity: var(--star-opacity, 0.6); transform: scale(1); }
      50% { opacity: 0.1; transform: scale(0.6); }
    }
    @keyframes galaxyDriftA {
      0% { transform: translate(0, 0); }
      33% { transform: translate(8px, -6px); }
      66% { transform: translate(-6px, 4px); }
      100% { transform: translate(0, 0); }
    }
    @keyframes galaxyDriftB {
      0% { transform: translate(0, 0); }
      33% { transform: translate(-10px, 5px); }
      66% { transform: translate(7px, -8px); }
      100% { transform: translate(0, 0); }
    }
    .star-dot-ed {
      position: absolute;
      border-radius: 50%;
      background: white;
      animation: starTwinkleEd var(--dur, 3s) var(--delay, 0s) ease-in-out infinite;
    }
    .galaxy-drift-a { animation: galaxyDriftA 28s ease-in-out infinite; }
    .galaxy-drift-b { animation: galaxyDriftB 35s ease-in-out infinite; }
  `;
  document.head.appendChild(style);
}

// ─── Signature Modal ─────────────────────────────────────────────────────────

interface SignatureModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (dataUrl: string) => void;
  title?: string;
}

function SignatureModal({
  open,
  onClose,
  onConfirm,
  title = "Create Signature",
}: SignatureModalProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [penColor, setPenColor] = useState("#1a1a2e");
  const [lineWidth, setLineWidth] = useState(2);
  const [typedName, setTypedName] = useState("");
  const [typedFont, setTypedFont] = useState("cursive");

  const clearCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }, []);

  const startDraw = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      const rect = canvas.getBoundingClientRect();
      ctx.beginPath();
      ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
      ctx.strokeStyle = penColor;
      ctx.lineWidth = lineWidth;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      setIsDrawing(true);
    },
    [penColor, lineWidth],
  );

  const draw = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (!isDrawing) return;
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      const rect = canvas.getBoundingClientRect();
      ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
      ctx.stroke();
    },
    [isDrawing],
  );

  const stopDraw = useCallback(() => {
    setIsDrawing(false);
  }, []);

  const handleConfirmDraw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL("image/png");
    onConfirm(dataUrl);
  }, [onConfirm]);

  const handleConfirmType = useCallback(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 400;
    canvas.height = 100;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.font = `italic 42px ${typedFont}`;
    ctx.fillStyle = penColor;
    ctx.fillText(typedName || "Signature", 10, 60);
    onConfirm(canvas.toDataURL("image/png"));
  }, [typedName, typedFont, penColor, onConfirm]);

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <Tabs defaultValue="draw">
          <TabsList className="w-full">
            <TabsTrigger value="draw" className="flex-1">
              Draw
            </TabsTrigger>
            <TabsTrigger value="type" className="flex-1">
              Type
            </TabsTrigger>
            <TabsTrigger value="upload" className="flex-1">
              Upload
            </TabsTrigger>
          </TabsList>

          <TabsContent value="draw" className="space-y-3">
            <div className="flex items-center gap-3 pt-2">
              <Label className="text-xs">Color</Label>
              <input
                type="color"
                value={penColor}
                onChange={(e) => setPenColor(e.target.value)}
                className="w-8 h-8 rounded border border-border cursor-pointer"
              />
              <Label className="text-xs">Width</Label>
              <div className="flex-1">
                <Slider
                  min={1}
                  max={8}
                  step={1}
                  value={[lineWidth]}
                  onValueChange={(v) => setLineWidth(v[0])}
                />
              </div>
              <Button variant="outline" size="sm" onClick={clearCanvas}>
                Clear
              </Button>
            </div>
            <canvas
              ref={canvasRef}
              width={460}
              height={140}
              className="w-full border-2 border-dashed border-border rounded-lg bg-white cursor-crosshair"
              onMouseDown={startDraw}
              onMouseMove={draw}
              onMouseUp={stopDraw}
              onMouseLeave={stopDraw}
            />
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button onClick={handleConfirmDraw}>Confirm</Button>
            </div>
          </TabsContent>

          <TabsContent value="type" className="space-y-3 pt-2">
            <div className="space-y-2">
              <Label className="text-xs">Your name</Label>
              <Input
                value={typedName}
                onChange={(e) => setTypedName(e.target.value)}
                placeholder="Type your name..."
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Font style</Label>
              <Select value={typedFont} onValueChange={setTypedFont}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cursive">Cursive</SelectItem>
                  <SelectItem value="serif">Serif</SelectItem>
                  <SelectItem value="Georgia, serif">Georgia</SelectItem>
                  <SelectItem value="'Times New Roman', serif">
                    Times New Roman
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            {typedName && (
              <div
                className="border rounded-lg p-4 bg-white text-center"
                style={{
                  fontFamily: typedFont,
                  fontSize: "36px",
                  color: penColor,
                  fontStyle: "italic",
                }}
              >
                {typedName}
              </div>
            )}
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button onClick={handleConfirmType}>Confirm</Button>
            </div>
          </TabsContent>

          <TabsContent value="upload" className="space-y-3 pt-2">
            <label className="flex flex-col items-center gap-3 border-2 border-dashed border-border rounded-lg p-8 cursor-pointer hover:bg-muted/30 transition-colors">
              <Upload className="w-8 h-8 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                Click to upload signature image
              </span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (!f) return;
                  const reader = new FileReader();
                  reader.onload = (ev) => {
                    onConfirm(ev.target?.result as string);
                  };
                  reader.readAsDataURL(f);
                }}
              />
            </label>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

// ─── AI Panel ────────────────────────────────────────────────────────────────

function AIPanelDrawer({
  open,
  onClose,
  extractedText,
}: {
  open: boolean;
  onClose: () => void;
  extractedText: string;
}) {
  const [activeAction, setActiveAction] = useState<string | null>(null);
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  const GEMINI_KEY = "AIzaSyDQ7TIhVnlu8RWdLe82sPL7vdxzlqDlIEM";

  const callGemini = useCallback(
    async (prompt: string) => {
      setLoading(true);
      setResult("");
      try {
        const res = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_KEY}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
            }),
          },
        );
        const data = await res.json();
        const text =
          data?.candidates?.[0]?.content?.parts?.[0]?.text || "No result";
        setResult(text);
      } catch {
        setResult("AI assistant is temporarily unavailable.");
      } finally {
        setLoading(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const actions = [
    {
      id: "summarize",
      label: "Summarize Page",
      prompt: `Summarize this document in 3-5 bullet points:\n\n${extractedText.slice(0, 3000)}`,
    },
    {
      id: "rewrite",
      label: "Rewrite Selected",
      prompt: `Rewrite this text more clearly and professionally:\n\n${extractedText.slice(0, 1500)}`,
    },
    {
      id: "translate",
      label: "Translate to English",
      prompt: `Translate the following text to English:\n\n${extractedText.slice(0, 2000)}`,
    },
    {
      id: "grammar",
      label: "Fix Grammar",
      prompt: `Fix grammar and spelling errors in this text:\n\n${extractedText.slice(0, 2000)}`,
    },
    {
      id: "expand",
      label: "Expand Text",
      prompt: `Expand and elaborate on this text with more detail:\n\n${extractedText.slice(0, 1000)}`,
    },
  ];

  if (!open) return null;

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-80 bg-card border-l border-border shadow-2xl flex flex-col">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-gradient-to-r from-violet-500/10 to-blue-500/10">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-violet-500" />
          <span className="font-semibold text-sm">AI PDF Assistant</span>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="w-4 h-4" />
        </Button>
      </div>
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-2">
          {actions.map((action) => (
            <Button
              key={action.id}
              variant={activeAction === action.id ? "default" : "outline"}
              size="sm"
              className="w-full justify-start"
              onClick={() => {
                setActiveAction(action.id);
                callGemini(action.prompt);
              }}
            >
              {action.label}
            </Button>
          ))}
        </div>
        {loading && (
          <div className="mt-4 text-sm text-muted-foreground animate-pulse">
            Generating...
          </div>
        )}
        {result && !loading && (
          <div className="mt-4 p-3 bg-muted/50 rounded-lg text-sm whitespace-pre-wrap leading-relaxed">
            {result}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function AdvancedPDFEditor() {
  // ── State ──
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfBytes, setPdfBytes] = useState<Uint8Array | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [zoom, setZoom] = useState(100);
  const [activeTool, setActiveTool] = useState<ToolMode>("selection");
  const [sidebarTab, setSidebarTab] = useState<SidebarTab | null>("pages");
  const [annotations, setAnnotations] = useState<AnnotationObject[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [history, setHistory] = useState<AnnotationObject[][]>([[]]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{
    x: number;
    y: number;
    objX: number;
    objY: number;
  } | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [createStart, setCreateStart] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const [signatureModal, setSignatureModal] = useState<{
    open: boolean;
    type: "signature" | "initials";
  }>({ open: false, type: "signature" });
  const [aiPanelOpen, setAiPanelOpen] = useState(false);
  const [extractedText, setExtractedText] = useState("");
  const [isDrawingFreehand, setIsDrawingFreehand] = useState(false);
  const [freehandPoints, setFreehandPoints] = useState<
    Array<{ x: number; y: number }>
  >([]);
  const [pageThumbnails, setPageThumbnails] = useState<string[]>([]);
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState<
    Array<{ id: string; text: string; time: string }>
  >([]);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const stars = useMemo(() => generateStars(40), []);

  const { mutate: incrementUsage } = useIncrementToolUsage();
  const { mutate: addHistory } = useAddHistory();

  // ── Galaxy injection ──
  useEffect(() => {
    injectGalaxyStyles();
  }, []);

  // ── Keyboard shortcuts ──
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Delete" || e.key === "Backspace") {
        if (
          selectedId &&
          !(e.target instanceof HTMLInputElement) &&
          !(e.target instanceof HTMLTextAreaElement)
        ) {
          setAnnotations((prev) => prev.filter((a) => a.id !== selectedId));
          setSelectedId(null);
        }
      }
      if (e.ctrlKey && e.key === "z") {
        e.preventDefault();
        handleUndo();
      }
      if (e.ctrlKey && e.key === "y") {
        e.preventDefault();
        handleRedo();
      }
      if (e.key === "Escape") {
        setSelectedId(null);
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  });

  // ── History management ──
  const pushHistory = useCallback(
    (newAnnotations: AnnotationObject[]) => {
      setHistory((prev) => {
        const newHist = prev.slice(0, historyIndex + 1);
        return [...newHist, newAnnotations];
      });
      setHistoryIndex((i) => i + 1);
    },
    [historyIndex],
  );

  const handleUndo = useCallback(() => {
    if (historyIndex > 0) {
      setHistoryIndex((i) => i - 1);
      setAnnotations(history[historyIndex - 1] || []);
    }
  }, [historyIndex, history]);

  const handleRedo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex((i) => i + 1);
      setAnnotations(history[historyIndex + 1] || []);
    }
  }, [historyIndex, history]);

  // ── PDF rendering ──
  const renderPDFPage = useCallback(
    async (bytes: Uint8Array, pageIdx: number) => {
      try {
        const pdfjsLib = await import("pdfjs-dist");
        pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.js";
        const loadingTask = pdfjsLib.getDocument({ data: bytes });
        const pdf = await loadingTask.promise;
        setPageCount(pdf.numPages);

        const page = await pdf.getPage(pageIdx + 1);
        const viewport = page.getViewport({ scale: zoom / 100 });

        const canvas = canvasRef.current;
        if (!canvas) return;
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        await page.render({ canvasContext: ctx, viewport }).promise;

        // Generate thumbnails
        const thumbs: string[] = [];
        for (let i = 1; i <= Math.min(pdf.numPages, 20); i++) {
          const p = await pdf.getPage(i);
          const vp = p.getViewport({ scale: 0.2 });
          const tc = document.createElement("canvas");
          tc.width = vp.width;
          tc.height = vp.height;
          const tc2d = tc.getContext("2d");
          if (tc2d)
            await p.render({ canvasContext: tc2d, viewport: vp }).promise;
          thumbs.push(tc.toDataURL("image/jpeg", 0.7));
        }
        setPageThumbnails(thumbs);
      } catch {
        // pdfjs not available — show placeholder
        const canvas = canvasRef.current;
        if (!canvas) return;
        canvas.width = 595;
        canvas.height = 842;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "#e2e8f0";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "#94a3b8";
        ctx.font = "16px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("PDF Preview", canvas.width / 2, canvas.height / 2 - 10);
        ctx.fillText(
          "(PDF.js not loaded)",
          canvas.width / 2,
          canvas.height / 2 + 14,
        );
      }
    },
    [zoom],
  );

  useEffect(() => {
    if (pdfBytes) {
      renderPDFPage(pdfBytes, currentPage);
    }
  }, [pdfBytes, currentPage, renderPDFPage]);

  // ── File upload ──
  const handleFileUpload = useCallback(async (file: File) => {
    if (!file.name.toLowerCase().endsWith(".pdf")) {
      toast.error("Please upload a PDF file");
      return;
    }
    const buf = await file.arrayBuffer();
    const bytes = new Uint8Array(buf);
    setPdfFile(file);
    setPdfBytes(bytes);
    setAnnotations([]);
    setSelectedId(null);
    setCurrentPage(0);
    setHistory([[]]);
    setHistoryIndex(0);

    // Try text extraction
    try {
      const pdfjsLib = await import("pdfjs-dist");
      pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.js";
      const pdf = await pdfjsLib.getDocument({ data: bytes }).promise;
      let fullText = "";
      for (let i = 1; i <= Math.min(pdf.numPages, 5); i++) {
        const page = await pdf.getPage(i);
        const tc = await page.getTextContent();
        fullText += `${tc.items.map((item) => ("str" in item ? item.str : "")).join(" ")}\n`;
      }
      setExtractedText(fullText);
    } catch {
      setExtractedText("");
    }

    toast.success(`Loaded: ${file.name}`);
  }, []);

  // ── Drop zone ──
  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const file = e.dataTransfer.files[0];
      if (file) handleFileUpload(file);
    },
    [handleFileUpload],
  );

  // ── Add annotation ──
  const addAnnotation = useCallback(
    (obj: Omit<AnnotationObject, "id">) => {
      const newObj: AnnotationObject = { ...obj, id: `el_${Date.now()}` };
      const next = [...annotations, newObj];
      setAnnotations(next);
      setSelectedId(newObj.id);
      pushHistory(next);
      return newObj;
    },
    [annotations, pushHistory],
  );

  // ── Canvas mouse handlers ──
  const getRelativePos = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = overlayRef.current?.getBoundingClientRect();
    if (!rect) return { x: 0, y: 0 };
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  }, []);

  const handleOverlayMouseDown = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (e.target !== overlayRef.current) return;
      const pos = getRelativePos(e);

      if (activeTool === "draw") {
        setIsDrawingFreehand(true);
        setFreehandPoints([pos]);
        return;
      }

      if (
        activeTool === "text" ||
        activeTool === "sticky" ||
        activeTool === "shape"
      ) {
        setIsCreating(true);
        setCreateStart(pos);
        return;
      }

      if (activeTool === "selection") {
        setSelectedId(null);
      }
    },
    [activeTool, getRelativePos],
  );

  const handleOverlayMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (isDrawingFreehand) {
        const pos = getRelativePos(e);
        setFreehandPoints((prev) => [...prev, pos]);
      }
    },
    [isDrawingFreehand, getRelativePos],
  );

  const handleOverlayMouseUp = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const pos = getRelativePos(e);

      if (isDrawingFreehand) {
        setIsDrawingFreehand(false);
        if (freehandPoints.length > 2) {
          const xs = freehandPoints.map((p) => p.x);
          const ys = freehandPoints.map((p) => p.y);
          const minX = Math.min(...xs);
          const minY = Math.min(...ys);
          addAnnotation({
            type: "draw",
            x: minX,
            y: minY,
            width: Math.max(...xs) - minX + 10,
            height: Math.max(...ys) - minY + 10,
            rotation: 0,
            content: "",
            style: {
              color: "#1a1a2e",
              borderWidth: 2,
              drawPoints: freehandPoints,
            },
          });
        }
        setFreehandPoints([]);
        return;
      }

      if (isCreating && createStart) {
        setIsCreating(false);
        const w = Math.abs(pos.x - createStart.x);
        const h = Math.abs(pos.y - createStart.y);
        const x = Math.min(pos.x, createStart.x);
        const y = Math.min(pos.y, createStart.y);

        if (activeTool === "text") {
          addAnnotation({
            type: "text",
            x,
            y,
            width: Math.max(w, 120),
            height: Math.max(h, 40),
            rotation: 0,
            content: "Double-click to edit",
            style: {
              fontSize: 16,
              fontFamily: "sans-serif",
              color: "#1a1a2e",
              alignment: "left",
              opacity: 1,
              lineHeight: 1.5,
            },
          });
        } else if (activeTool === "sticky") {
          addAnnotation({
            type: "sticky",
            x,
            y,
            width: Math.max(w, 160),
            height: Math.max(h, 120),
            rotation: 0,
            content: "Note",
            style: {
              fillColor: "#fef08a",
              fontSize: 13,
              color: "#713f12",
              opacity: 0.95,
            },
          });
        } else if (activeTool === "shape") {
          addAnnotation({
            type: "shape",
            x,
            y,
            width: Math.max(w, 80),
            height: Math.max(h, 60),
            rotation: 0,
            content: "",
            style: {
              shapeType: "rect",
              fillColor: "transparent",
              borderColor: "#3b82f6",
              borderWidth: 2,
              opacity: 1,
              borderRadius: 4,
            },
          });
        }
        setCreateStart(null);
      }
    },
    [
      isDrawingFreehand,
      freehandPoints,
      isCreating,
      createStart,
      activeTool,
      addAnnotation,
      getRelativePos,
    ],
  );

  // ── Element drag ──
  const handleElementMouseDown = useCallback(
    (e: React.MouseEvent, id: string) => {
      e.stopPropagation();
      setSelectedId(id);
      if (activeTool !== "selection") return;
      const obj = annotations.find((a) => a.id === id);
      if (!obj) return;
      setIsDragging(true);
      setDragStart({ x: e.clientX, y: e.clientY, objX: obj.x, objY: obj.y });
    },
    [annotations, activeTool],
  );

  const handleGlobalMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!isDragging || !dragStart || !selectedId) return;
      const dx = e.clientX - dragStart.x;
      const dy = e.clientY - dragStart.y;
      setAnnotations((prev) =>
        prev.map((a) =>
          a.id === selectedId
            ? { ...a, x: dragStart.objX + dx, y: dragStart.objY + dy }
            : a,
        ),
      );
    },
    [isDragging, dragStart, selectedId],
  );

  const handleGlobalMouseUp = useCallback(() => {
    if (isDragging) {
      setIsDragging(false);
      setDragStart(null);
      pushHistory(annotations);
    }
  }, [isDragging, annotations, pushHistory]);

  // ── Quick add helpers ──
  const addTextBox = useCallback(() => {
    setActiveTool("text");
    toast.info("Click and drag on the canvas to place a text box");
  }, []);

  const addShape = useCallback(
    (shapeType: "rect" | "circle" | "line" | "arrow") => {
      addAnnotation({
        type: "shape",
        x: 80,
        y: 80,
        width: 120,
        height: 80,
        rotation: 0,
        content: "",
        style: {
          shapeType,
          fillColor: "transparent",
          borderColor: "#3b82f6",
          borderWidth: 2,
          opacity: 1,
          borderRadius: shapeType === "circle" ? 9999 : 4,
        },
      });
    },
    [addAnnotation],
  );

  const addFormField = useCallback(
    (fieldType: string) => {
      addAnnotation({
        type: "text",
        x: 80,
        y: 80 + annotations.length * 40,
        width: 200,
        height: 36,
        rotation: 0,
        content: `[${fieldType}]`,
        style: {
          fontSize: 13,
          fontFamily: "sans-serif",
          color: "#1a1a2e",
          borderColor: "#94a3b8",
          borderWidth: 1,
          fillColor: "#f8fafc",
          opacity: 1,
        },
      });
    },
    [addAnnotation, annotations.length],
  );

  const handleSignatureConfirm = useCallback(
    (dataUrl: string) => {
      addAnnotation({
        type: "signature",
        x: 120,
        y: 300,
        width: 200,
        height: 80,
        rotation: 0,
        content: "signature",
        style: { opacity: 1 },
        imageData: dataUrl,
      });
      setSignatureModal({ open: false, type: "signature" });
      toast.success("Signature added to canvas");
    },
    [addAnnotation],
  );

  const handleImageUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        addAnnotation({
          type: "image",
          x: 80,
          y: 80,
          width: 200,
          height: 150,
          rotation: 0,
          content: "uploaded image",
          style: {
            opacity: 1,
            brightness: 100,
            contrast: 100,
            saturation: 100,
            blur: 0,
            filter: "none",
          },
          imageData: ev.target?.result as string,
        });
      };
      reader.readAsDataURL(file);
    },
    [addAnnotation],
  );

  // ── Export PDF ──
  const handleExport = useCallback(
    async (mode: "pdf" | "jpg" = "pdf") => {
      if (!pdfBytes) {
        toast.error("No PDF loaded");
        return;
      }

      try {
        const doc = await PDFDocument.load(pdfBytes, {
          ignoreEncryption: true,
        });
        const pages = doc.getPages();
        const page = pages[currentPage] || pages[0];
        const { width, height } = page.getSize();
        const canvas = canvasRef.current;
        const scaleX = canvas ? width / canvas.width : 1;
        const scaleY = canvas ? height / canvas.height : 1;

        const font = await doc.embedFont(StandardFonts.Helvetica);

        for (const ann of annotations) {
          if (ann.type === "text" || ann.type === "sticky") {
            const pdfY = height - (ann.y + ann.height) * scaleY;
            page.drawText(ann.content || "", {
              x: ann.x * scaleX,
              y: Math.max(0, pdfY),
              size: (ann.style.fontSize || 14) * scaleY,
              font,
              color: rgb(0.1, 0.1, 0.1),
              opacity: ann.style.opacity ?? 1,
            });
          } else if (ann.type === "shape") {
            const color = ann.style.borderColor || "#3b82f6";
            const r = Number.parseInt(color.slice(1, 3), 16) / 255;
            const g = Number.parseInt(color.slice(3, 5), 16) / 255;
            const b = Number.parseInt(color.slice(5, 7), 16) / 255;
            const pdfY = height - (ann.y + ann.height) * scaleY;
            if (ann.style.shapeType === "circle") {
              // Use rectangle with very round corners as pdf-lib ellipse typing may differ
              page.drawRectangle({
                x: ann.x * scaleX,
                y: Math.max(0, pdfY),
                width: ann.width * scaleX,
                height: ann.height * scaleY,
                borderColor: rgb(r, g, b),
                borderWidth: ann.style.borderWidth || 2,
                opacity: ann.style.opacity ?? 1,
              });
            } else {
              page.drawRectangle({
                x: ann.x * scaleX,
                y: Math.max(0, pdfY),
                width: ann.width * scaleX,
                height: ann.height * scaleY,
                borderColor: rgb(r, g, b),
                borderWidth: ann.style.borderWidth || 2,
                opacity: ann.style.opacity ?? 1,
              });
            }
          } else if (
            (ann.type === "signature" || ann.type === "image") &&
            ann.imageData
          ) {
            try {
              const isJpeg =
                ann.imageData.includes("image/jpeg") ||
                ann.imageData.includes("image/jpg");
              const base64 = ann.imageData.split(",")[1];
              const imgBytes = Uint8Array.from(atob(base64), (c) =>
                c.charCodeAt(0),
              );
              const embedded = isJpeg
                ? await doc.embedJpg(imgBytes)
                : await doc.embedPng(imgBytes);
              const pdfY = height - (ann.y + ann.height) * scaleY;
              page.drawImage(embedded, {
                x: ann.x * scaleX,
                y: Math.max(0, pdfY),
                width: ann.width * scaleX,
                height: ann.height * scaleY,
                opacity: ann.style.opacity ?? 1,
              });
            } catch {
              /* skip unembeddable image */
            }
          }
        }

        if (mode === "jpg") {
          const jpgCanvas = document.createElement("canvas");
          jpgCanvas.width = canvas?.width || 595;
          jpgCanvas.height = canvas?.height || 842;
          const ctx = jpgCanvas.getContext("2d");
          if (ctx && canvas) ctx.drawImage(canvas, 0, 0);
          jpgCanvas.toBlob(
            (blob) => {
              if (!blob) return;
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = "edited-page.jpg";
              a.click();
              URL.revokeObjectURL(url);
            },
            "image/jpeg",
            0.95,
          );
        } else {
          const bytes = await doc.save();
          const blob = new Blob([bytes as unknown as ArrayBuffer], {
            type: "application/pdf",
          });
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = "edited.pdf";
          a.click();
          URL.revokeObjectURL(url);
        }

        incrementUsage("Advanced PDF Editor");
        addHistory({
          toolName: "Advanced PDF Editor",
          originalFile: pdfFile?.name || "document.pdf",
          resultFile: mode === "jpg" ? "edited-page.jpg" : "edited.pdf",
        });
        toast.success("File exported successfully!");
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Export failed");
      }
    },
    [pdfBytes, annotations, currentPage, pdfFile, incrementUsage, addHistory],
  );

  // ── Template insertion ──
  const addTemplate = useCallback(
    (templateName: string) => {
      addAnnotation({
        type: "text",
        x: 50,
        y: 50,
        width: 400,
        height: 200,
        rotation: 0,
        content: `[${templateName} Template — click to edit]`,
        style: {
          fontSize: 18,
          fontFamily: "serif",
          bold: true,
          color: "#1e293b",
          alignment: "center",
          opacity: 1,
        },
      });
      toast.success(`${templateName} template added`);
    },
    [addAnnotation],
  );

  // ── Quick stamp helpers ──
  const addCheck = useCallback(() => {
    addAnnotation({
      type: "check",
      x: 100,
      y: 100,
      width: 40,
      height: 40,
      rotation: 0,
      content: "✓",
      style: { fontSize: 32, color: "#16a34a", opacity: 1 },
    });
  }, [addAnnotation]);

  const addCross = useCallback(() => {
    addAnnotation({
      type: "cross",
      x: 100,
      y: 100,
      width: 40,
      height: 40,
      rotation: 0,
      content: "✗",
      style: { fontSize: 32, color: "#dc2626", opacity: 1 },
    });
  }, [addAnnotation]);

  const selectedObj = annotations.find((a) => a.id === selectedId);

  const updateSelected = useCallback(
    (updates: Partial<AnnotationObject["style"]>) => {
      setAnnotations((prev) => {
        const next = prev.map((a) =>
          a.id === selectedId ? { ...a, style: { ...a.style, ...updates } } : a,
        );
        pushHistory(next);
        return next;
      });
    },
    [selectedId, pushHistory],
  );

  const updateSelectedContent = useCallback(
    (content: string) => {
      setAnnotations((prev) => {
        const next = prev.map((a) =>
          a.id === selectedId ? { ...a, content } : a,
        );
        pushHistory(next);
        return next;
      });
    },
    [selectedId, pushHistory],
  );

  const deleteSelected = useCallback(() => {
    if (!selectedId) return;
    const next = annotations.filter((a) => a.id !== selectedId);
    setAnnotations(next);
    setSelectedId(null);
    pushHistory(next);
  }, [selectedId, annotations, pushHistory]);

  // ── Tool buttons config ──
  const toolButtons: Array<{
    mode: ToolMode;
    icon: React.ReactNode;
    label: string;
    ocid?: string;
    onClick?: () => void;
  }> = [
    {
      mode: "selection",
      icon: <MousePointer className="w-4 h-4" />,
      label: "Selection",
      ocid: "edit-advanced.tool.selection",
    },
    {
      mode: "edit",
      icon: <Edit2 className="w-4 h-4" />,
      label: "Edit PDF",
    },
    {
      mode: "sign",
      icon: <Pen className="w-4 h-4" />,
      label: "Sign",
      ocid: "edit-advanced.tool.sign",
      onClick: () => setSignatureModal({ open: true, type: "signature" }),
    },
    {
      mode: "text",
      icon: <Type className="w-4 h-4" />,
      label: "Text",
      ocid: "edit-advanced.tool.text",
      onClick: addTextBox,
    },
    {
      mode: "erase",
      icon: <Eraser className="w-4 h-4" />,
      label: "Erase",
    },
    {
      mode: "highlight",
      icon: <Highlighter className="w-4 h-4" />,
      label: "Highlight",
    },
    {
      mode: "redact",
      icon: <Square className="w-4 h-4" />,
      label: "Redact",
    },
    {
      mode: "image",
      icon: <Image className="w-4 h-4" />,
      label: "Image",
      onClick: () => imageInputRef.current?.click(),
    },
    {
      mode: "arrow",
      icon: <ArrowLeft className="w-4 h-4 rotate-180" />,
      label: "Arrow",
      onClick: () => addShape("arrow"),
    },
    {
      mode: "draw",
      icon: <Pen className="w-4 h-4" />,
      label: "Draw",
      ocid: "edit-advanced.tool.draw",
    },
    {
      mode: "cross",
      icon: <X className="w-4 h-4" />,
      label: "Cross",
      onClick: addCross,
    },
    {
      mode: "check",
      icon: <Check className="w-4 h-4" />,
      label: "Check",
      onClick: addCheck,
    },
    {
      mode: "sticky",
      icon: <StickyNote className="w-4 h-4" />,
      label: "Sticky",
    },
  ];

  // ── Sidebar tabs config ──
  const sidebarTabs: Array<{
    id: SidebarTab;
    icon: React.ReactNode;
    label: string;
    ocid?: string;
  }> = [
    {
      id: "pages",
      icon: <FileText className="w-4 h-4" />,
      label: "Pages",
      ocid: "edit-advanced.left_sidebar.pages_tab",
    },
    {
      id: "text",
      icon: <Type className="w-4 h-4" />,
      label: "Text",
      ocid: "edit-advanced.left_sidebar.text_tab",
    },
    {
      id: "elements",
      icon: <Square className="w-4 h-4" />,
      label: "Elements",
      ocid: "edit-advanced.left_sidebar.elements_tab",
    },
    {
      id: "uploads",
      icon: <Upload className="w-4 h-4" />,
      label: "Uploads",
    },
    {
      id: "templates",
      icon: <LayoutTemplate className="w-4 h-4" />,
      label: "Templates",
      ocid: "edit-advanced.left_sidebar.templates_tab",
    },
    {
      id: "forms",
      icon: <Edit2 className="w-4 h-4" />,
      label: "Forms",
    },
    {
      id: "comments",
      icon: <MessageSquare className="w-4 h-4" />,
      label: "Comments",
    },
    {
      id: "layers",
      icon: <Layers className="w-4 h-4" />,
      label: "Layers",
      ocid: "edit-advanced.left_sidebar.layers_tab",
    },
  ];

  // ── Canvas width for zoom ──
  const canvasWidth = canvasRef.current?.width || 595;
  const canvasHeight = canvasRef.current?.height || 842;

  return (
    <div
      className="flex flex-col h-screen bg-background overflow-hidden"
      onMouseMove={handleGlobalMouseMove}
      onMouseUp={handleGlobalMouseUp}
    >
      {/* ── Top App Bar (galaxy themed) ── */}
      <div
        className="relative overflow-hidden flex-shrink-0"
        style={{
          background:
            "linear-gradient(135deg, #04041a 0%, #080820 40%, #06061e 70%, #030312 100%)",
          zIndex: 40,
        }}
      >
        {/* Galaxy stars */}
        <div
          aria-hidden="true"
          className="galaxy-drift-a absolute inset-0 pointer-events-none"
        >
          {stars.slice(0, 20).map((star) => (
            <div
              key={star.id}
              className="star-dot-ed"
              style={
                {
                  top: star.top,
                  left: star.left,
                  width: star.size,
                  height: star.size,
                  "--star-opacity": star.opacity,
                  "--dur": star.animDuration,
                  "--delay": star.animDelay,
                } as React.CSSProperties
              }
            />
          ))}
        </div>
        <div
          aria-hidden="true"
          className="galaxy-drift-b absolute inset-0 pointer-events-none"
        >
          {stars.slice(20).map((star) => (
            <div
              key={star.id}
              className="star-dot-ed"
              style={
                {
                  top: star.top,
                  left: star.left,
                  width: star.size,
                  height: star.size,
                  "--star-opacity": star.opacity,
                  "--dur": star.animDuration,
                  "--delay": star.animDelay,
                } as React.CSSProperties
              }
            />
          ))}
        </div>
        {/* Nebula blobs */}
        <div
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none"
        >
          <div
            className="absolute rounded-full"
            style={{
              top: "-80%",
              left: "-5%",
              width: "40%",
              height: "300%",
              background:
                "radial-gradient(ellipse at center, rgba(107,33,168,0.18) 0%, transparent 65%)",
            }}
          />
          <div
            className="absolute rounded-full"
            style={{
              bottom: "-80%",
              right: "-5%",
              width: "35%",
              height: "300%",
              background:
                "radial-gradient(ellipse at center, rgba(14,116,144,0.14) 0%, transparent 60%)",
            }}
          />
        </div>

        {/* Main toolbar row */}
        <div className="relative z-10 flex items-center px-3 py-2 gap-2 border-b border-white/10">
          {/* Left: branding */}
          <div className="flex items-center gap-2 mr-3">
            <div className="w-7 h-7 bg-red-500 rounded flex items-center justify-center flex-shrink-0">
              <FileText className="w-4 h-4 text-white" />
            </div>
            <div className="hidden sm:block">
              <div className="text-white text-xs font-bold leading-none">
                Files Editor
              </div>
              {pdfFile && (
                <div className="text-white/60 text-[10px] leading-none mt-0.5 flex items-center gap-1">
                  <span className="truncate max-w-[100px]">{pdfFile.name}</span>
                  {pageCount > 0 && (
                    <span className="bg-white/20 text-white/90 px-1 py-0.5 rounded text-[9px]">
                      {pageCount}p
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Tool mode buttons */}
          <div className="flex items-center gap-0.5 flex-1 overflow-x-auto scrollbar-none">
            {toolButtons.map((tb) => (
              <button
                key={tb.mode}
                data-ocid={tb.ocid}
                type="button"
                onClick={() => {
                  setActiveTool(tb.mode);
                  tb.onClick?.();
                }}
                className={`flex flex-col items-center gap-0.5 px-2 py-1.5 rounded text-[10px] font-medium transition-all whitespace-nowrap min-w-[44px] ${
                  activeTool === tb.mode
                    ? "bg-blue-500 text-white"
                    : "text-white/70 hover:text-white hover:bg-white/10"
                }`}
              >
                {tb.icon}
                <span className="hidden md:block">{tb.label}</span>
              </button>
            ))}
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-1.5 ml-2 flex-shrink-0">
            <Button
              size="sm"
              variant="outline"
              className="bg-white/10 border-white/20 text-white hover:bg-white/20 text-xs h-7"
              onClick={() => fileInputRef.current?.click()}
              data-ocid="edit-advanced.upload_button"
            >
              <Upload className="w-3 h-3 mr-1" />
              Upload
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="text-white/70 hover:text-white hover:bg-white/10 h-7 w-7"
              onClick={() => window.print()}
            >
              <Printer className="w-3.5 h-3.5" />
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  size="sm"
                  variant="outline"
                  className="bg-white/10 border-white/20 text-white hover:bg-white/20 text-xs h-7"
                  data-ocid="edit-advanced.export_button"
                >
                  <Download className="w-3 h-3 mr-1" />
                  Export
                  <ChevronDown className="w-3 h-3 ml-1" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleExport("pdf")}>
                  Export as PDF
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport("jpg")}>
                  Export as JPG
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport("pdf")}>
                  Export Compressed
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button
              size="sm"
              className="bg-blue-500 hover:bg-blue-600 text-white text-xs h-7"
              onClick={() => handleExport("pdf")}
              data-ocid="edit-advanced.download_button"
            >
              DONE
            </Button>
          </div>
        </div>

        {/* Secondary toolbar row */}
        <div className="relative z-10 flex items-center px-3 py-1.5 gap-2 text-white/70 border-b border-white/10">
          {/* Undo/Redo */}
          <button
            type="button"
            onClick={handleUndo}
            disabled={historyIndex === 0}
            data-ocid="edit-advanced.undo_button"
            className="p-1 rounded hover:bg-white/10 disabled:opacity-30 transition-colors"
          >
            <Undo2 className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={handleRedo}
            disabled={historyIndex >= history.length - 1}
            data-ocid="edit-advanced.redo_button"
            className="p-1 rounded hover:bg-white/10 disabled:opacity-30 transition-colors"
          >
            <Redo2 className="w-3.5 h-3.5" />
          </button>

          <div className="w-px h-4 bg-white/20" />

          {/* Zoom */}
          <button
            type="button"
            onClick={() => setZoom((z) => Math.max(25, z - 25))}
            data-ocid="edit-advanced.zoom_out"
            className="p-1 rounded hover:bg-white/10 transition-colors"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <span className="text-xs text-white/80 min-w-[36px] text-center font-mono">
            {zoom}%
          </span>
          <button
            type="button"
            onClick={() => setZoom((z) => Math.min(200, z + 25))}
            data-ocid="edit-advanced.zoom_in"
            className="p-1 rounded hover:bg-white/10 transition-colors"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>

          <div className="w-px h-4 bg-white/20" />

          {/* Page nav */}
          {pageCount > 0 && (
            <>
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
                className="p-1 rounded hover:bg-white/10 disabled:opacity-30"
                disabled={currentPage === 0}
              >
                <ArrowLeft className="w-3.5 h-3.5" />
              </button>
              <span className="text-xs text-white/80 font-mono">
                {currentPage + 1}/{pageCount}
              </span>
              <button
                type="button"
                onClick={() =>
                  setCurrentPage((p) => Math.min(pageCount - 1, p + 1))
                }
                className="p-1 rounded hover:bg-white/10 disabled:opacity-30"
                disabled={currentPage >= pageCount - 1}
              >
                <ArrowLeft className="w-3.5 h-3.5 rotate-180" />
              </button>
              <div className="w-px h-4 bg-white/20" />
            </>
          )}

          {/* Share / AI */}
          <button
            type="button"
            className="flex items-center gap-1 text-[10px] px-2 py-1 rounded hover:bg-white/10 transition-colors"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span className="hidden sm:block">Share</span>
          </button>
          <button
            type="button"
            onClick={() => setAiPanelOpen((p) => !p)}
            className="flex items-center gap-1 text-[10px] px-2 py-1 rounded hover:bg-white/10 transition-colors text-violet-300"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span className="hidden sm:block">AI Assistant</span>
          </button>
          <button
            type="button"
            onClick={() => handleExport("pdf")}
            className="flex items-center gap-1 text-[10px] px-2 py-1 rounded hover:bg-white/10 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:block">Download</span>
          </button>

          <div className="w-px h-4 bg-white/20" />
          <RotateCw className="w-3.5 h-3.5 opacity-40" />
          <span className="text-[10px] text-white/50">Preview</span>
        </div>
      </div>

      {/* ── Body (sidebar + canvas + properties) ── */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left sidebar icon tabs */}
        <div className="flex flex-shrink-0 h-full border-r border-border">
          {/* Icon column */}
          <div className="w-12 bg-card flex flex-col items-center py-2 gap-1 border-r border-border">
            {sidebarTabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                data-ocid={tab.ocid}
                onClick={() =>
                  setSidebarTab((t) => (t === tab.id ? null : tab.id))
                }
                title={tab.label}
                className={`w-9 h-9 flex flex-col items-center justify-center gap-0.5 rounded transition-all ${
                  sidebarTab === tab.id
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                }`}
              >
                {tab.icon}
                <span className="text-[8px] font-medium leading-none">
                  {tab.label}
                </span>
              </button>
            ))}
          </div>

          {/* Sidebar panel */}
          {sidebarTab && (
            <div className="w-64 bg-card flex flex-col border-r border-border">
              <div className="px-3 py-2 border-b border-border text-xs font-semibold text-foreground flex items-center justify-between">
                <span className="capitalize">{sidebarTab}</span>
                <button
                  type="button"
                  onClick={() => setSidebarTab(null)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
              <ScrollArea className="flex-1">
                <div className="p-3">
                  {/* Pages tab */}
                  {sidebarTab === "pages" && (
                    <div className="space-y-2">
                      {pageCount === 0 && (
                        <p className="text-xs text-muted-foreground text-center py-4">
                          Upload a PDF to see pages
                        </p>
                      )}
                      {pageThumbnails.map((thumb, i) => (
                        <button
                          key={thumb.slice(-20)}
                          type="button"
                          onClick={() => setCurrentPage(i)}
                          className={`w-full border-2 rounded overflow-hidden transition-all ${
                            i === currentPage
                              ? "border-blue-500"
                              : "border-border hover:border-blue-300"
                          }`}
                        >
                          <img
                            src={thumb}
                            alt={`Page ${i + 1}`}
                            className="w-full"
                          />
                          <div className="text-center text-[10px] py-0.5 text-muted-foreground">
                            {i + 1}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Text tab */}
                  {sidebarTab === "text" && (
                    <div className="space-y-2">
                      {[
                        {
                          label: "Heading",
                          size: 28,
                          bold: true,
                          text: "Add Heading",
                        },
                        {
                          label: "Subheading",
                          size: 20,
                          bold: true,
                          text: "Add Subheading",
                        },
                        {
                          label: "Body Text",
                          size: 14,
                          bold: false,
                          text: "Add Body Text",
                        },
                        {
                          label: "Small Text",
                          size: 10,
                          bold: false,
                          text: "Add Small Text",
                        },
                        {
                          label: "Custom Box",
                          size: 14,
                          bold: false,
                          text: "Custom text box",
                        },
                      ].map((item) => (
                        <button
                          key={item.label}
                          type="button"
                          onClick={() => {
                            addAnnotation({
                              type: "text",
                              x: 80,
                              y: 80 + annotations.length * 30,
                              width: 300,
                              height: item.size * 2,
                              rotation: 0,
                              content: item.text,
                              style: {
                                fontSize: item.size,
                                bold: item.bold,
                                color: "#1a1a2e",
                                fontFamily: "sans-serif",
                                opacity: 1,
                                alignment: "left",
                                lineHeight: 1.5,
                              },
                            });
                          }}
                          className="w-full text-left px-3 py-2 rounded border border-border hover:bg-muted/50 transition-colors"
                          style={{ fontSize: Math.min(item.size, 16) }}
                        >
                          <span
                            style={{
                              fontWeight: item.bold ? "bold" : "normal",
                            }}
                          >
                            {item.label}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Elements tab */}
                  {sidebarTab === "elements" && (
                    <div className="space-y-3">
                      <p className="text-xs font-medium text-muted-foreground">
                        Shapes
                      </p>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          {
                            label: "Rect",
                            type: "rect" as const,
                            icon: <Square className="w-5 h-5" />,
                          },
                          {
                            label: "Circle",
                            type: "circle" as const,
                            icon: <Circle className="w-5 h-5" />,
                          },
                          {
                            label: "Line",
                            type: "line" as const,
                            icon: <Minus className="w-5 h-5" />,
                          },
                          {
                            label: "Arrow",
                            type: "arrow" as const,
                            icon: <ArrowLeft className="w-5 h-5 rotate-180" />,
                          },
                          {
                            label: "Triangle",
                            type: "rect" as const,
                            icon: <Triangle className="w-5 h-5" />,
                          },
                        ].map((s) => (
                          <button
                            key={s.label}
                            type="button"
                            onClick={() => addShape(s.type)}
                            className="flex flex-col items-center gap-1 p-2 rounded border border-border hover:bg-muted/50 text-muted-foreground hover:text-foreground transition-colors"
                          >
                            {s.icon}
                            <span className="text-[9px]">{s.label}</span>
                          </button>
                        ))}
                      </div>
                      <p className="text-xs font-medium text-muted-foreground mt-3">
                        Stamps
                      </p>
                      <div className="grid grid-cols-3 gap-2">
                        <button
                          type="button"
                          onClick={addCheck}
                          className="flex flex-col items-center gap-1 p-2 rounded border border-border hover:bg-muted/50 text-green-600 transition-colors"
                        >
                          <Check className="w-5 h-5" />
                          <span className="text-[9px] text-muted-foreground">
                            Check
                          </span>
                        </button>
                        <button
                          type="button"
                          onClick={addCross}
                          className="flex flex-col items-center gap-1 p-2 rounded border border-border hover:bg-muted/50 text-red-600 transition-colors"
                        >
                          <X className="w-5 h-5" />
                          <span className="text-[9px] text-muted-foreground">
                            Cross
                          </span>
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            addAnnotation({
                              type: "sticky",
                              x: 80,
                              y: 80,
                              width: 160,
                              height: 120,
                              rotation: 0,
                              content: "Note",
                              style: {
                                fillColor: "#fef08a",
                                fontSize: 13,
                                color: "#713f12",
                                opacity: 0.95,
                              },
                            })
                          }
                          className="flex flex-col items-center gap-1 p-2 rounded border border-border hover:bg-muted/50 text-yellow-600 transition-colors"
                        >
                          <StickyNote className="w-5 h-5" />
                          <span className="text-[9px] text-muted-foreground">
                            Note
                          </span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Uploads tab */}
                  {sidebarTab === "uploads" && (
                    <div>
                      <label className="flex flex-col items-center gap-2 border-2 border-dashed border-border rounded-lg p-6 cursor-pointer hover:bg-muted/30 transition-colors">
                        <Upload className="w-6 h-6 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground text-center">
                          Upload image to place on PDF
                        </span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleImageUpload}
                        />
                      </label>
                    </div>
                  )}

                  {/* Templates tab */}
                  {sidebarTab === "templates" && (
                    <div className="space-y-2">
                      {[
                        "Resume",
                        "Invoice",
                        "Certificate",
                        "Brochure",
                        "Poster",
                        "Social Media",
                        "Contract",
                        "E-book",
                        "Business Proposal",
                        "Presentation",
                      ].map((tpl) => (
                        <button
                          key={tpl}
                          type="button"
                          onClick={() => addTemplate(tpl)}
                          className="w-full text-left px-3 py-2 text-xs rounded border border-border hover:bg-muted/50 transition-colors font-medium"
                        >
                          {tpl}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Forms tab */}
                  {sidebarTab === "forms" && (
                    <div className="space-y-2">
                      {[
                        "Text Field",
                        "Checkbox",
                        "Radio",
                        "Signature",
                        "Date Field",
                        "Dropdown",
                        "Initials",
                      ].map((field) => (
                        <button
                          key={field}
                          type="button"
                          onClick={() => addFormField(field)}
                          className="w-full text-left px-3 py-2 text-xs rounded border border-border hover:bg-muted/50 transition-colors"
                        >
                          {field}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Comments tab */}
                  {sidebarTab === "comments" && (
                    <div className="space-y-3">
                      <div className="flex gap-2">
                        <Input
                          value={comment}
                          onChange={(e) => setComment(e.target.value)}
                          placeholder="Add comment..."
                          className="text-xs h-8"
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && comment.trim()) {
                              setComments((prev) => [
                                ...prev,
                                {
                                  id: `c_${Date.now()}`,
                                  text: comment.trim(),
                                  time: new Date().toLocaleTimeString(),
                                },
                              ]);
                              setComment("");
                            }
                          }}
                        />
                        <Button
                          size="sm"
                          className="h-8 text-xs"
                          onClick={() => {
                            if (!comment.trim()) return;
                            setComments((prev) => [
                              ...prev,
                              {
                                id: `c_${Date.now()}`,
                                text: comment.trim(),
                                time: new Date().toLocaleTimeString(),
                              },
                            ]);
                            setComment("");
                          }}
                        >
                          Add
                        </Button>
                      </div>
                      {comments.length === 0 && (
                        <p className="text-xs text-muted-foreground text-center py-2">
                          No comments yet
                        </p>
                      )}
                      {comments.map((c) => (
                        <div
                          key={c.id}
                          className="flex items-start justify-between gap-2 p-2 rounded bg-muted/40"
                        >
                          <div>
                            <p className="text-xs">{c.text}</p>
                            <p className="text-[10px] text-muted-foreground mt-0.5">
                              {c.time}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() =>
                              setComments((prev) =>
                                prev.filter((cc) => cc.id !== c.id),
                              )
                            }
                            className="text-muted-foreground hover:text-destructive flex-shrink-0"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Layers tab */}
                  {sidebarTab === "layers" && (
                    <div className="space-y-1">
                      {annotations.length === 0 && (
                        <p className="text-xs text-muted-foreground text-center py-4">
                          No layers yet
                        </p>
                      )}
                      {[...annotations].reverse().map((ann, idx) => (
                        <button
                          key={ann.id}
                          type="button"
                          onClick={() => setSelectedId(ann.id)}
                          className={`w-full flex items-center justify-between px-2 py-1.5 rounded cursor-pointer transition-colors text-left ${
                            selectedId === ann.id
                              ? "bg-primary/10 border border-primary/30"
                              : "hover:bg-muted/50"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-[9px] text-muted-foreground font-mono">
                              {String(annotations.length - idx).padStart(
                                2,
                                "0",
                              )}
                            </span>
                            <span className="text-xs capitalize">
                              {ann.type}
                            </span>
                            {ann.content && (
                              <span className="text-[10px] text-muted-foreground truncate max-w-[80px]">
                                {ann.content.slice(0, 15)}
                              </span>
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              const next = annotations.filter(
                                (a) => a.id !== ann.id,
                              );
                              setAnnotations(next);
                              if (selectedId === ann.id) setSelectedId(null);
                              pushHistory(next);
                            }}
                            className="text-muted-foreground hover:text-destructive flex-shrink-0"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </ScrollArea>
            </div>
          )}
        </div>

        {/* Center canvas */}
        <div className="flex-1 overflow-auto bg-muted/30 flex flex-col">
          <ScrollArea className="flex-1">
            <div className="min-h-full flex flex-col items-center justify-start py-8 px-4">
              {!pdfFile ? (
                /* Drop zone */
                <div
                  className="w-full max-w-xl mt-16"
                  onDrop={handleDrop}
                  onDragOver={(e) => e.preventDefault()}
                >
                  <label
                    data-ocid="edit-advanced.upload_button"
                    className="flex flex-col items-center gap-4 border-2 border-dashed border-border rounded-2xl p-16 cursor-pointer hover:bg-muted/20 transition-all group"
                  >
                    <div className="w-16 h-16 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center group-hover:bg-blue-500/20 transition-colors">
                      <FileText className="w-8 h-8 text-blue-500" />
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-semibold text-foreground">
                        Drop PDF here or click to upload
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Supports PDF files up to 200MB
                      </p>
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf,application/pdf"
                      className="hidden"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) handleFileUpload(f);
                      }}
                    />
                  </label>
                </div>
              ) : (
                /* PDF canvas + annotations overlay */
                <div
                  className="relative shadow-2xl"
                  style={{
                    width: canvasWidth,
                    height: canvasHeight,
                    transform: `scale(${zoom / 100})`,
                    transformOrigin: "top center",
                  }}
                >
                  {/* PDF canvas */}
                  <canvas
                    ref={canvasRef}
                    className="block bg-white"
                    style={{ imageRendering: "crisp-edges" }}
                  />

                  {/* Grid overlay (snap lines) */}
                  <div
                    aria-hidden="true"
                    className="absolute inset-0 pointer-events-none"
                    style={{
                      backgroundImage:
                        "radial-gradient(circle, rgba(148,163,184,0.25) 1px, transparent 1px)",
                      backgroundSize: "24px 24px",
                    }}
                  />

                  {/* Freehand drawing overlay */}
                  {isDrawingFreehand && freehandPoints.length > 1 && (
                    <svg
                      role="img"
                      aria-label="Freehand drawing"
                      className="absolute inset-0 pointer-events-none"
                      width={canvasWidth}
                      height={canvasHeight}
                    >
                      <title>Freehand drawing</title>
                      <polyline
                        points={freehandPoints
                          .map((p) => `${p.x},${p.y}`)
                          .join(" ")}
                        fill="none"
                        stroke="#1a1a2e"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}

                  {/* Annotation elements */}
                  {annotations.map((ann) => (
                    <AnnotationElement
                      key={ann.id}
                      ann={ann}
                      selected={ann.id === selectedId}
                      onMouseDown={(e) => handleElementMouseDown(e, ann.id)}
                      onContentChange={updateSelectedContent}
                      onDelete={deleteSelected}
                    />
                  ))}

                  {/* Transparent interaction overlay */}
                  <div
                    ref={overlayRef}
                    data-ocid="edit-advanced.canvas_target"
                    className="absolute inset-0"
                    style={{
                      cursor:
                        activeTool === "text"
                          ? "text"
                          : activeTool === "draw"
                            ? "crosshair"
                            : activeTool === "erase"
                              ? "cell"
                              : "default",
                    }}
                    onMouseDown={handleOverlayMouseDown}
                    onMouseMove={handleOverlayMouseMove}
                    onMouseUp={handleOverlayMouseUp}
                  />
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Page strip at bottom */}
          {pageThumbnails.length > 1 && (
            <div className="border-t border-border bg-card flex items-center gap-2 px-4 py-2 overflow-x-auto">
              {pageThumbnails.map((thumb, i) => (
                <button
                  key={thumb.slice(-20)}
                  type="button"
                  onClick={() => setCurrentPage(i)}
                  className={`flex-shrink-0 border-2 rounded overflow-hidden transition-all ${
                    i === currentPage
                      ? "border-blue-500"
                      : "border-border hover:border-blue-300"
                  }`}
                  style={{ width: 48 }}
                >
                  <img src={thumb} alt={`Page ${i + 1}`} className="w-full" />
                  <div className="text-[9px] text-center text-muted-foreground">
                    {i + 1}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right properties panel */}
        <div className="w-72 bg-card border-l border-border flex-shrink-0 flex flex-col overflow-hidden">
          <div className="px-4 py-3 border-b border-border text-xs font-semibold text-foreground">
            {selectedObj ? `Properties — ${selectedObj.type}` : "Sign"}
          </div>
          <ScrollArea className="flex-1">
            <div className="p-3 space-y-4">
              {!selectedObj && (
                /* Sign panel (default, no selection) */
                <div className="space-y-2">
                  {[
                    {
                      label: "Signature",
                      desc: "Draw or type your signature",
                      onClick: () =>
                        setSignatureModal({ open: true, type: "signature" }),
                      ocid: "edit-advanced.signature.create_button",
                    },
                    {
                      label: "Initials",
                      desc: "Add your initials",
                      onClick: () =>
                        setSignatureModal({ open: true, type: "initials" }),
                    },
                    {
                      label: "Text field",
                      desc: "Insert a text input area",
                      onClick: () => addFormField("Text Field"),
                    },
                    {
                      label: "Date field",
                      desc: "Insert a date field",
                      onClick: () => addFormField("Date Field"),
                    },
                    {
                      label: "Check",
                      desc: "Insert a checkbox",
                      onClick: addCheck,
                    },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="flex items-center justify-between p-2 rounded-lg border border-border hover:bg-muted/30 transition-colors"
                    >
                      <div>
                        <p className="text-xs font-medium">{item.label}</p>
                        <p className="text-[10px] text-muted-foreground">
                          {item.desc}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 text-xs"
                        onClick={item.onClick}
                        data-ocid={item.ocid}
                      >
                        Create
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              {/* Text properties */}
              {selectedObj?.type === "text" ||
              selectedObj?.type === "sticky" ? (
                <div className="space-y-3">
                  <div className="space-y-1">
                    <Label className="text-[10px]">Content</Label>
                    <textarea
                      value={selectedObj.content}
                      onChange={(e) => updateSelectedContent(e.target.value)}
                      className="w-full border border-border rounded text-xs p-2 bg-background resize-none"
                      rows={3}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[10px]">Font size</Label>
                    <div className="flex items-center gap-2">
                      <Slider
                        min={8}
                        max={72}
                        value={[selectedObj.style.fontSize || 14]}
                        onValueChange={(v) =>
                          updateSelected({ fontSize: v[0] })
                        }
                        className="flex-1"
                      />
                      <span className="text-xs font-mono w-6 text-center">
                        {selectedObj.style.fontSize || 14}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[10px]">Style</Label>
                    <div className="flex gap-1">
                      <button
                        type="button"
                        onClick={() =>
                          updateSelected({ bold: !selectedObj.style.bold })
                        }
                        className={`p-1.5 rounded border transition-colors ${selectedObj.style.bold ? "bg-primary text-primary-foreground" : "border-border hover:bg-muted/50"}`}
                      >
                        <Bold className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          updateSelected({ italic: !selectedObj.style.italic })
                        }
                        className={`p-1.5 rounded border transition-colors ${selectedObj.style.italic ? "bg-primary text-primary-foreground" : "border-border hover:bg-muted/50"}`}
                      >
                        <Italic className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          updateSelected({
                            underline: !selectedObj.style.underline,
                          })
                        }
                        className={`p-1.5 rounded border transition-colors ${selectedObj.style.underline ? "bg-primary text-primary-foreground" : "border-border hover:bg-muted/50"}`}
                      >
                        <Underline className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[10px]">Alignment</Label>
                    <div className="flex gap-1">
                      {(
                        [
                          {
                            val: "left" as const,
                            icon: <AlignLeft className="w-3.5 h-3.5" />,
                          },
                          {
                            val: "center" as const,
                            icon: <AlignCenter className="w-3.5 h-3.5" />,
                          },
                          {
                            val: "right" as const,
                            icon: <AlignRight className="w-3.5 h-3.5" />,
                          },
                        ] as const
                      ).map(({ val, icon }) => (
                        <button
                          key={val}
                          type="button"
                          onClick={() => updateSelected({ alignment: val })}
                          className={`p-1.5 rounded border transition-colors ${selectedObj.style.alignment === val ? "bg-primary text-primary-foreground" : "border-border hover:bg-muted/50"}`}
                        >
                          {icon}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[10px]">Text color</Label>
                    <input
                      type="color"
                      value={selectedObj.style.color || "#1a1a2e"}
                      onChange={(e) =>
                        updateSelected({ color: e.target.value })
                      }
                      className="w-full h-8 rounded border border-border cursor-pointer"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[10px]">
                      Opacity:{" "}
                      {Math.round((selectedObj.style.opacity ?? 1) * 100)}%
                    </Label>
                    <Slider
                      min={0.1}
                      max={1}
                      step={0.05}
                      value={[selectedObj.style.opacity ?? 1]}
                      onValueChange={(v) => updateSelected({ opacity: v[0] })}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="shadow-toggle"
                      checked={selectedObj.style.shadow || false}
                      onChange={(e) =>
                        updateSelected({ shadow: e.target.checked })
                      }
                      className="w-3.5 h-3.5"
                    />
                    <Label htmlFor="shadow-toggle" className="text-[10px]">
                      Shadow
                    </Label>
                  </div>
                </div>
              ) : null}

              {/* Shape properties */}
              {selectedObj?.type === "shape" && (
                <div className="space-y-3">
                  <div className="space-y-1">
                    <Label className="text-[10px]">Shape type</Label>
                    <Select
                      value={selectedObj.style.shapeType || "rect"}
                      onValueChange={(v) =>
                        updateSelected({
                          shapeType: v as "rect" | "circle" | "line" | "arrow",
                          borderRadius: v === "circle" ? 9999 : 4,
                        })
                      }
                    >
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="rect">Rectangle</SelectItem>
                        <SelectItem value="circle">Circle</SelectItem>
                        <SelectItem value="line">Line</SelectItem>
                        <SelectItem value="arrow">Arrow</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[10px]">Fill color</Label>
                    <input
                      type="color"
                      value={
                        selectedObj.style.fillColor === "transparent"
                          ? "#ffffff"
                          : selectedObj.style.fillColor || "#ffffff"
                      }
                      onChange={(e) =>
                        updateSelected({ fillColor: e.target.value })
                      }
                      className="w-full h-8 rounded border border-border cursor-pointer"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[10px]">Border color</Label>
                    <input
                      type="color"
                      value={selectedObj.style.borderColor || "#3b82f6"}
                      onChange={(e) =>
                        updateSelected({ borderColor: e.target.value })
                      }
                      className="w-full h-8 rounded border border-border cursor-pointer"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[10px]">Border width</Label>
                    <Slider
                      min={0}
                      max={12}
                      step={1}
                      value={[selectedObj.style.borderWidth || 2]}
                      onValueChange={(v) =>
                        updateSelected({ borderWidth: v[0] })
                      }
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[10px]">
                      Opacity:{" "}
                      {Math.round((selectedObj.style.opacity ?? 1) * 100)}%
                    </Label>
                    <Slider
                      min={0.1}
                      max={1}
                      step={0.05}
                      value={[selectedObj.style.opacity ?? 1]}
                      onValueChange={(v) => updateSelected({ opacity: v[0] })}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[10px]">Border radius</Label>
                    <Slider
                      min={0}
                      max={40}
                      step={1}
                      value={[selectedObj.style.borderRadius || 0]}
                      onValueChange={(v) =>
                        updateSelected({ borderRadius: v[0] })
                      }
                    />
                  </div>
                </div>
              )}

              {/* Image properties */}
              {selectedObj?.type === "image" && (
                <div className="space-y-3">
                  <div className="space-y-1">
                    <Label className="text-[10px]">
                      Brightness: {selectedObj.style.brightness ?? 100}%
                    </Label>
                    <Slider
                      min={0}
                      max={200}
                      step={5}
                      value={[selectedObj.style.brightness ?? 100]}
                      onValueChange={(v) =>
                        updateSelected({ brightness: v[0] })
                      }
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[10px]">
                      Contrast: {selectedObj.style.contrast ?? 100}%
                    </Label>
                    <Slider
                      min={0}
                      max={200}
                      step={5}
                      value={[selectedObj.style.contrast ?? 100]}
                      onValueChange={(v) => updateSelected({ contrast: v[0] })}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[10px]">
                      Saturation: {selectedObj.style.saturation ?? 100}%
                    </Label>
                    <Slider
                      min={0}
                      max={200}
                      step={5}
                      value={[selectedObj.style.saturation ?? 100]}
                      onValueChange={(v) =>
                        updateSelected({ saturation: v[0] })
                      }
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[10px]">
                      Blur: {selectedObj.style.blur ?? 0}px
                    </Label>
                    <Slider
                      min={0}
                      max={20}
                      step={1}
                      value={[selectedObj.style.blur ?? 0]}
                      onValueChange={(v) => updateSelected({ blur: v[0] })}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[10px]">Filter</Label>
                    <Select
                      value={selectedObj.style.filter || "none"}
                      onValueChange={(v) => updateSelected({ filter: v })}
                    >
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Normal</SelectItem>
                        <SelectItem value="grayscale(100%)">B&W</SelectItem>
                        <SelectItem value="sepia(80%)">Vintage</SelectItem>
                        <SelectItem value="saturate(150%) hue-rotate(10deg)">
                          Warm
                        </SelectItem>
                        <SelectItem value="contrast(120%) brightness(110%)">
                          Vivid
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[10px]">
                      Opacity:{" "}
                      {Math.round((selectedObj.style.opacity ?? 1) * 100)}%
                    </Label>
                    <Slider
                      min={0.1}
                      max={1}
                      step={0.05}
                      value={[selectedObj.style.opacity ?? 1]}
                      onValueChange={(v) => updateSelected({ opacity: v[0] })}
                    />
                  </div>
                </div>
              )}

              {/* Signature info */}
              {selectedObj?.type === "signature" && (
                <div className="space-y-3">
                  <div className="p-3 bg-muted/40 rounded text-xs text-muted-foreground">
                    Signature placed
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[10px]">
                    <div>
                      <span className="text-muted-foreground">X: </span>
                      <span className="font-mono">
                        {Math.round(selectedObj.x)}px
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Y: </span>
                      <span className="font-mono">
                        {Math.round(selectedObj.y)}px
                      </span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[10px]">
                      Opacity:{" "}
                      {Math.round((selectedObj.style.opacity ?? 1) * 100)}%
                    </Label>
                    <Slider
                      min={0.1}
                      max={1}
                      step={0.05}
                      value={[selectedObj.style.opacity ?? 1]}
                      onValueChange={(v) => updateSelected({ opacity: v[0] })}
                    />
                  </div>
                </div>
              )}

              {/* Delete button for any selected */}
              {selectedObj && (
                <Button
                  variant="destructive"
                  size="sm"
                  className="w-full text-xs"
                  onClick={deleteSelected}
                >
                  <X className="w-3.5 h-3.5 mr-1" />
                  Delete Element
                </Button>
              )}
            </div>
          </ScrollArea>
        </div>
      </div>

      {/* Hidden file inputs */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,application/pdf"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleFileUpload(f);
        }}
      />
      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleImageUpload}
      />

      {/* Signature modal */}
      <SignatureModal
        open={signatureModal.open}
        onClose={() => setSignatureModal({ open: false, type: "signature" })}
        onConfirm={handleSignatureConfirm}
        title={
          signatureModal.type === "initials"
            ? "Create Initials"
            : "Create Signature"
        }
      />

      {/* AI Panel */}
      <AIPanelDrawer
        open={aiPanelOpen}
        onClose={() => setAiPanelOpen(false)}
        extractedText={extractedText}
      />
    </div>
  );
}

// ─── Annotation Element Renderer ─────────────────────────────────────────────

function AnnotationElement({
  ann,
  selected,
  onMouseDown,
  onContentChange,
  onDelete,
}: {
  ann: AnnotationObject;
  selected: boolean;
  onMouseDown: (e: React.MouseEvent) => void;
  onContentChange: (v: string) => void;
  onDelete: () => void;
}) {
  const [editing, setEditing] = useState(false);

  const baseStyle: React.CSSProperties = {
    position: "absolute",
    left: ann.x,
    top: ann.y,
    width: ann.width,
    height: ann.height,
    opacity: ann.style.opacity ?? 1,
    cursor: "move",
    userSelect: "none",
    outline: selected ? "2px solid #3b82f6" : "none",
    outlineOffset: 2,
  };

  if (ann.type === "text" || ann.type === "sticky") {
    const sticky = ann.type === "sticky";
    return (
      <div
        style={{
          ...baseStyle,
          backgroundColor: sticky
            ? ann.style.fillColor || "#fef08a"
            : "transparent",
          padding: "4px 6px",
          borderRadius: sticky ? 4 : 0,
          boxShadow: sticky
            ? "2px 2px 8px rgba(0,0,0,0.12)"
            : ann.style.shadow
              ? "2px 2px 6px rgba(0,0,0,0.2)"
              : "none",
        }}
        onMouseDown={onMouseDown}
        onDoubleClick={() => setEditing(true)}
      >
        {editing ? (
          <textarea
            value={ann.content}
            onChange={(e) => onContentChange(e.target.value)}
            onBlur={() => setEditing(false)}
            ref={(el) => el?.focus()}
            style={{
              width: "100%",
              height: "100%",
              resize: "none",
              border: "none",
              outline: "none",
              background: "transparent",
              font: `${ann.style.italic ? "italic " : ""}${ann.style.bold ? "bold " : ""}${ann.style.fontSize || 14}px ${ann.style.fontFamily || "sans-serif"}`,
              color: ann.style.color || "#1a1a2e",
              textAlign: ann.style.alignment || "left",
              textDecoration: ann.style.underline ? "underline" : "none",
              lineHeight: String(ann.style.lineHeight || 1.5),
              cursor: "text",
            }}
            onMouseDown={(e) => e.stopPropagation()}
          />
        ) : (
          <p
            style={{
              font: `${ann.style.italic ? "italic " : ""}${ann.style.bold ? "bold " : ""}${ann.style.fontSize || 14}px ${ann.style.fontFamily || "sans-serif"}`,
              color: ann.style.color || "#1a1a2e",
              textAlign: ann.style.alignment || "left",
              textDecoration: ann.style.underline ? "underline" : "none",
              lineHeight: String(ann.style.lineHeight || 1.5),
              margin: 0,
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
            }}
          >
            {ann.content}
          </p>
        )}
        {selected && (
          <button
            type="button"
            className="absolute -top-2.5 -right-2.5 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white z-10"
            onMouseDown={(e) => e.stopPropagation()}
            onClick={onDelete}
          >
            <X className="w-3 h-3" />
          </button>
        )}
      </div>
    );
  }

  if (ann.type === "shape") {
    const isCircle = ann.style.shapeType === "circle";
    return (
      <div
        style={{
          ...baseStyle,
          backgroundColor:
            ann.style.fillColor === "transparent"
              ? "transparent"
              : ann.style.fillColor || "transparent",
          border: `${ann.style.borderWidth || 2}px solid ${ann.style.borderColor || "#3b82f6"}`,
          borderRadius: isCircle ? "50%" : ann.style.borderRadius || 0,
        }}
        onMouseDown={onMouseDown}
      >
        {selected && (
          <button
            type="button"
            className="absolute -top-2.5 -right-2.5 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white z-10"
            onMouseDown={(e) => e.stopPropagation()}
            onClick={onDelete}
          >
            <X className="w-3 h-3" />
          </button>
        )}
      </div>
    );
  }

  if (ann.type === "image" || ann.type === "signature") {
    const filterStr =
      ann.type === "image"
        ? `brightness(${ann.style.brightness ?? 100}%) contrast(${ann.style.contrast ?? 100}%) saturate(${ann.style.saturation ?? 100}%) blur(${ann.style.blur ?? 0}px) ${ann.style.filter && ann.style.filter !== "none" ? ann.style.filter : ""}`.trim()
        : "none";

    return (
      <div style={baseStyle} onMouseDown={onMouseDown}>
        {ann.imageData && (
          <img
            src={ann.imageData}
            alt={ann.content || ann.type}
            style={{
              width: "100%",
              height: "100%",
              objectFit: ann.type === "signature" ? "contain" : "cover",
              filter: filterStr,
              pointerEvents: "none",
              userSelect: "none",
            }}
            draggable={false}
          />
        )}
        {selected && (
          <button
            type="button"
            className="absolute -top-2.5 -right-2.5 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white z-10"
            onMouseDown={(e) => e.stopPropagation()}
            onClick={onDelete}
          >
            <X className="w-3 h-3" />
          </button>
        )}
      </div>
    );
  }

  // check, cross, draw, highlight, arrow stamps
  if (
    ann.type === "check" ||
    ann.type === "cross" ||
    ann.type === "highlight" ||
    ann.type === "arrow"
  ) {
    return (
      <div
        style={{
          ...baseStyle,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: ann.style.fontSize || 32,
          color: ann.style.color || "#1a1a2e",
          backgroundColor:
            ann.type === "highlight" ? "rgba(253,224,71,0.5)" : "transparent",
        }}
        onMouseDown={onMouseDown}
      >
        {ann.content}
        {selected && (
          <button
            type="button"
            className="absolute -top-2.5 -right-2.5 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white z-10"
            onMouseDown={(e) => e.stopPropagation()}
            onClick={onDelete}
          >
            <X className="w-3 h-3" />
          </button>
        )}
      </div>
    );
  }

  // draw
  if (ann.type === "draw" && ann.style.drawPoints) {
    const pts = ann.style.drawPoints;
    const minX = Math.min(...pts.map((p) => p.x));
    const minY = Math.min(...pts.map((p) => p.y));
    return (
      <div style={baseStyle} onMouseDown={onMouseDown}>
        <svg
          role="img"
          aria-label="Drawn annotation"
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            overflow: "visible",
            pointerEvents: "none",
          }}
          width={ann.width}
          height={ann.height}
        >
          <title>Drawn annotation</title>
          <polyline
            points={pts.map((p) => `${p.x - minX},${p.y - minY}`).join(" ")}
            fill="none"
            stroke={ann.style.color || "#1a1a2e"}
            strokeWidth={ann.style.borderWidth || 2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        {selected && (
          <button
            type="button"
            className="absolute -top-2.5 -right-2.5 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white z-10"
            onMouseDown={(e) => e.stopPropagation()}
            onClick={onDelete}
          >
            <X className="w-3 h-3" />
          </button>
        )}
      </div>
    );
  }

  return null;
}
