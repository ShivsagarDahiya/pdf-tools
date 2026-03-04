import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { callGemini } from "@/utils/geminiApi";
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  ArrowLeft,
  ArrowRight,
  Bold,
  Check,
  ChevronDown,
  Download,
  Eye,
  EyeOff,
  FileText,
  Italic,
  Layers,
  Loader2,
  Lock,
  MessageSquare,
  Minus,
  MoreHorizontal,
  Move,
  Pen,
  Plus,
  QrCode,
  Redo,
  RotateCcw,
  Save,
  Sparkles,
  StickyNote,
  Trash2,
  Type,
  Underline,
  Unlock,
  Upload,
  X,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

// ─── Types ────────────────────────────────────────────────────────────────────

type ElementType =
  | "text"
  | "shape"
  | "image"
  | "signature"
  | "checkbox"
  | "datefield"
  | "textfield"
  | "sticky"
  | "highlight"
  | "redact"
  | "arrow"
  | "draw"
  | "cross"
  | "check";

interface CanvasElement {
  id: string;
  type: ElementType;
  x: number;
  y: number;
  w: number;
  h: number;
  text?: string;
  fontSize?: number;
  fontFamily?: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  color?: string;
  bgColor?: string;
  opacity?: number;
  borderColor?: string;
  borderWidth?: number;
  shadow?: boolean;
  shapeType?: "rect" | "circle" | "line" | "arrow";
  imageData?: string;
  locked?: boolean;
  hidden?: boolean;
  layerName?: string;
  textAlign?: "left" | "center" | "right";
  brightness?: number;
  contrast?: number;
  saturation?: number;
  filter?: string;
  required?: boolean;
  placeholder?: string;
  drawPoints?: Array<{ x: number; y: number }>;
}

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
  | "more";

type LeftTab =
  | "pages"
  | "text"
  | "elements"
  | "uploads"
  | "templates"
  | "forms"
  | "comments"
  | "layers";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function generateId() {
  return Math.random().toString(36).slice(2, 10);
}

const TOOL_MODES: { mode: ToolMode; label: string; icon: React.ReactNode }[] = [
  {
    mode: "selection",
    label: "Select",
    icon: <Move className="w-3.5 h-3.5" />,
  },
  { mode: "edit", label: "Edit PDF", icon: <Pen className="w-3.5 h-3.5" /> },
  { mode: "sign", label: "Sign", icon: <Pen className="w-3.5 h-3.5" /> },
  { mode: "text", label: "Text", icon: <Type className="w-3.5 h-3.5" /> },
  { mode: "erase", label: "Erase", icon: <X className="w-3.5 h-3.5" /> },
  {
    mode: "highlight",
    label: "Highlight",
    icon: <span className="text-xs font-bold">H</span>,
  },
  {
    mode: "redact",
    label: "Redact",
    icon: (
      <span className="text-xs font-bold bg-gray-800 text-white px-0.5 rounded">
        R
      </span>
    ),
  },
  { mode: "image", label: "Image", icon: <span className="text-xs">🖼</span> },
  {
    mode: "arrow",
    label: "Arrow",
    icon: <ArrowRight className="w-3.5 h-3.5" />,
  },
  { mode: "draw", label: "Draw", icon: <Pen className="w-3.5 h-3.5" /> },
  { mode: "cross", label: "Cross", icon: <X className="w-3.5 h-3.5" /> },
  { mode: "check", label: "Check", icon: <Check className="w-3.5 h-3.5" /> },
  {
    mode: "sticky",
    label: "Sticky",
    icon: <StickyNote className="w-3.5 h-3.5" />,
  },
  {
    mode: "more",
    label: "More",
    icon: <MoreHorizontal className="w-3.5 h-3.5" />,
  },
];

const FONT_FAMILIES = [
  "Arial",
  "Georgia",
  "Courier New",
  "Verdana",
  "Times New Roman",
  "Trebuchet MS",
];

// ─── Galaxy Header ─────────────────────────────────────────────────────────────

function GalaxyHeader() {
  const stars = Array.from({ length: 30 }, (_, i) => ({
    id: i,
    top: Math.random() * 100,
    left: Math.random() * 100,
    size: Math.random() * 2 + 1,
    delay: Math.random() * 2,
    duration: Math.random() * 2 + 1.5,
  }));

  return (
    <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-purple-900 to-slate-900 py-6 px-6 flex-shrink-0">
      <div className="absolute inset-0 pointer-events-none">
        {stars.map((s) => (
          <div
            key={s.id}
            className="absolute rounded-full bg-white animate-pulse"
            style={{
              top: `${s.top}%`,
              left: `${s.left}%`,
              width: `${s.size}px`,
              height: `${s.size}px`,
              opacity: Math.random() * 0.6 + 0.2,
              animationDelay: `${s.delay}s`,
              animationDuration: `${s.duration}s`,
            }}
          />
        ))}
        <div className="absolute top-4 left-1/4 w-32 h-32 bg-purple-500/20 rounded-full blur-2xl animate-pulse" />
        <div
          className="absolute top-2 right-1/3 w-24 h-24 bg-cyan-500/15 rounded-full blur-xl animate-pulse"
          style={{ animationDelay: "0.5s" }}
        />
        <div
          className="absolute bottom-2 left-1/2 w-20 h-20 bg-indigo-500/20 rounded-full blur-xl animate-pulse"
          style={{ animationDelay: "1s" }}
        />
      </div>
      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-7 h-7 rounded-lg bg-violet-500/30 flex items-center justify-center">
            <FileText className="w-4 h-4 text-violet-300" />
          </div>
          <h1 className="text-white text-xl font-bold font-display tracking-tight">
            Advanced PDF Editor
          </h1>
          <span className="ml-2 text-xs font-medium px-2 py-0.5 rounded-full bg-violet-500/30 text-violet-200 border border-violet-500/40">
            Canva-Style
          </span>
        </div>
        <p className="text-purple-200 text-sm">
          Drag &amp; drop visual editing · Text · Shapes · Signs · Forms · AI
          Assistant
        </p>
      </div>
    </div>
  );
}

// ─── Signature Modal ────────────────────────────────────────────────────────────

interface SignatureModalProps {
  open: boolean;
  onClose: () => void;
  onInsert: (dataUrl: string, label: string) => void;
  title?: string;
}

function SignatureModal({
  open,
  onClose,
  onInsert,
  title = "Create Signature",
}: SignatureModalProps) {
  const [activeTab, setActiveTab] = useState<"draw" | "type" | "upload">(
    "draw",
  );
  const [typedSig, setTypedSig] = useState("");
  const [sigFont, setSigFont] = useState("cursive");
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [lastPos, setLastPos] = useState({ x: 0, y: 0 });

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const getPos = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const onMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    setLastPos(getPos(e));
  };

  const onMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    const pos = getPos(e);
    ctx.beginPath();
    ctx.moveTo(lastPos.x, lastPos.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.strokeStyle = "#1a1a2e";
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.stroke();
    setLastPos(pos);
  };

  const onMouseUp = () => setIsDrawing(false);

  const handleInsert = () => {
    if (activeTab === "draw") {
      const canvas = canvasRef.current;
      if (!canvas) return;
      onInsert(canvas.toDataURL(), "Signature");
    } else if (activeTab === "type" && typedSig.trim()) {
      const canvas = document.createElement("canvas");
      canvas.width = 300;
      canvas.height = 80;
      const ctx = canvas.getContext("2d")!;
      ctx.font = `32px ${sigFont}`;
      ctx.fillStyle = "#1a1a2e";
      ctx.fillText(typedSig, 10, 55);
      onInsert(canvas.toDataURL(), typedSig);
    } else {
      toast.error("Please provide a signature");
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-lg" data-ocid="signature.dialog">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="flex gap-1 border-b pb-2">
          {(["draw", "type", "upload"] as const).map((tab) => (
            <button
              type="button"
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1.5 text-sm rounded-md capitalize transition-colors ${
                activeTab === tab
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-muted"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
        {activeTab === "draw" && (
          <div>
            <p className="text-xs text-muted-foreground mb-2">
              Draw your signature below
            </p>
            <canvas
              ref={canvasRef}
              width={430}
              height={120}
              className="w-full border-2 border-dashed border-border rounded-lg bg-white cursor-crosshair"
              onMouseDown={onMouseDown}
              onMouseMove={onMouseMove}
              onMouseUp={onMouseUp}
              onMouseLeave={onMouseUp}
            />
            <button
              type="button"
              onClick={clearCanvas}
              className="mt-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Clear
            </button>
          </div>
        )}
        {activeTab === "type" && (
          <div className="space-y-3">
            <Input
              placeholder="Type your signature..."
              value={typedSig}
              onChange={(e) => setTypedSig(e.target.value)}
              data-ocid="signature.input"
            />
            <div>
              <Label className="text-xs mb-1">Font Style</Label>
              <div className="flex gap-2">
                {["cursive", "serif", "sans-serif"].map((f) => (
                  <button
                    type="button"
                    key={f}
                    onClick={() => setSigFont(f)}
                    className={`px-3 py-1 text-sm rounded border transition-colors ${
                      sigFont === f
                        ? "border-primary bg-primary/10"
                        : "border-border"
                    }`}
                    style={{ fontFamily: f }}
                  >
                    Abc
                  </button>
                ))}
              </div>
            </div>
            {typedSig && (
              <div
                className="p-4 border rounded-lg text-2xl text-center bg-white"
                style={{ fontFamily: sigFont }}
              >
                {typedSig}
              </div>
            )}
          </div>
        )}
        {activeTab === "upload" && (
          <div
            className="border-2 border-dashed border-border rounded-lg p-8 text-center"
            data-ocid="signature.dropzone"
          >
            <Upload className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">
              Upload a signature image (PNG/JPG)
            </p>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              id="sig-upload"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = (ev) => {
                  if (ev.target?.result)
                    onInsert(ev.target.result as string, "Signature");
                };
                reader.readAsDataURL(file);
              }}
            />
            <label htmlFor="sig-upload">
              <Button variant="outline" size="sm" className="mt-2" asChild>
                <span>Choose File</span>
              </Button>
            </label>
          </div>
        )}
        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
            data-ocid="signature.cancel_button"
          >
            Cancel
          </Button>
          <Button onClick={handleInsert} data-ocid="signature.confirm_button">
            Insert
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Canvas Element Renderer ────────────────────────────────────────────────────

interface ElementRendererProps {
  el: CanvasElement;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onUpdate: (id: string, updates: Partial<CanvasElement>) => void;
  onDelete: (id: string) => void;
  canvasW: number;
  canvasH: number;
  toolMode: ToolMode;
}

function ElementRenderer({
  el,
  isSelected,
  onSelect,
  onUpdate,
  onDelete,
  canvasW,
  canvasH,
  toolMode,
}: ElementRendererProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ mx: 0, my: 0, ex: 0, ey: 0 });
  const [isEditing, setIsEditing] = useState(false);
  const textRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging) return;
      const dx = ((e.clientX - dragStart.mx) / canvasW) * 100;
      const dy = ((e.clientY - dragStart.my) / canvasH) * 100;
      onUpdate(el.id, {
        x: Math.max(0, Math.min(100 - el.w, dragStart.ex + dx)),
        y: Math.max(0, Math.min(100 - el.h, dragStart.ey + dy)),
      });
    },
    [isDragging, dragStart, canvasW, canvasH, el.id, el.w, el.h, onUpdate],
  );

  const handleMouseUp = useCallback(() => setIsDragging(false), []);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    }
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);

  if (el.hidden) return null;

  const px = (el.x / 100) * canvasW;
  const py = (el.y / 100) * canvasH;
  const pw = (el.w / 100) * canvasW;
  const ph = (el.h / 100) * canvasH;

  const handleMouseDown = (e: React.MouseEvent) => {
    if (el.locked) return;
    if (toolMode === "erase") {
      onDelete(el.id);
      return;
    }
    e.stopPropagation();
    onSelect(el.id);
    setIsDragging(true);
    setDragStart({ mx: e.clientX, my: e.clientY, ex: el.x, ey: el.y });
  };

  const filterStyle =
    el.type === "image"
      ? `brightness(${100 + (el.brightness ?? 0)}%) contrast(${100 + (el.contrast ?? 0)}%) saturate(${100 + (el.saturation ?? 0)}%)`
      : undefined;

  const renderContent = () => {
    switch (el.type) {
      case "text":
      case "textfield":
        return (
          <div
            ref={textRef}
            contentEditable={isEditing}
            suppressContentEditableWarning
            onDoubleClick={() => {
              if (!el.locked) setIsEditing(true);
            }}
            onBlur={(e) => {
              setIsEditing(false);
              onUpdate(el.id, { text: e.currentTarget.textContent ?? "" });
            }}
            className="w-full h-full flex items-center overflow-hidden px-1"
            style={{
              fontFamily: el.fontFamily ?? "Arial",
              fontSize: `${el.fontSize ?? 14}px`,
              fontWeight: el.bold ? "bold" : "normal",
              fontStyle: el.italic ? "italic" : "normal",
              textDecoration: el.underline ? "underline" : "none",
              color: el.color ?? "#1a1a2e",
              textAlign: el.textAlign ?? "left",
              textShadow: el.shadow ? "1px 1px 3px rgba(0,0,0,0.3)" : undefined,
              cursor: isEditing ? "text" : "move",
              outline: isEditing ? "2px solid oklch(0.58 0.22 27)" : "none",
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
            }}
          >
            {el.text ??
              (el.type === "textfield"
                ? (el.placeholder ?? "Text Field")
                : "Text")}
          </div>
        );

      case "shape":
        if (el.shapeType === "circle") {
          return (
            <div
              className="w-full h-full rounded-full"
              style={{
                backgroundColor: el.bgColor ?? "transparent",
                border: `${el.borderWidth ?? 2}px solid ${el.borderColor ?? "#7C3AED"}`,
              }}
            />
          );
        }
        if (el.shapeType === "line") {
          return (
            <div
              className="w-full"
              style={{
                height: `${el.borderWidth ?? 2}px`,
                backgroundColor: el.borderColor ?? "#7C3AED",
                marginTop: "50%",
              }}
            />
          );
        }
        return (
          <div
            className="w-full h-full rounded-sm"
            style={{
              backgroundColor: el.bgColor ?? "transparent",
              border: `${el.borderWidth ?? 2}px solid ${el.borderColor ?? "#7C3AED"}`,
            }}
          />
        );

      case "image":
        return (
          <img
            src={el.imageData}
            alt="canvas element"
            className="w-full h-full object-cover rounded"
            style={{ filter: filterStyle }}
            draggable={false}
          />
        );

      case "signature":
        if (el.imageData) {
          return (
            <img
              src={el.imageData}
              alt="signature"
              className="w-full h-full object-contain"
              draggable={false}
            />
          );
        }
        return (
          <div
            className="w-full h-full flex items-center justify-center border-2 border-dashed border-violet-400 rounded text-violet-500 text-xs font-medium"
            style={{
              fontFamily: "cursive",
              fontSize: `${el.fontSize ?? 18}px`,
            }}
          >
            {el.text ?? "Signature"}
          </div>
        );

      case "highlight":
        return (
          <div
            className="w-full h-full rounded-sm"
            style={{
              backgroundColor: el.bgColor ?? "rgba(255, 235, 59, 0.45)",
            }}
          />
        );

      case "redact": {
        const redactBg = el.bgColor ?? "#000";
        return (
          <div
            className="w-full h-full rounded-sm"
            style={{ backgroundColor: redactBg }}
          />
        );
      }

      case "sticky":
        return (
          <div
            className="w-full h-full p-2 rounded shadow-md overflow-hidden"
            style={{
              backgroundColor: el.bgColor ?? "#fef08a",
              fontSize: `${el.fontSize ?? 12}px`,
              fontFamily: el.fontFamily ?? "Arial",
            }}
          >
            <div
              contentEditable={isEditing}
              suppressContentEditableWarning
              onDoubleClick={() => !el.locked && setIsEditing(true)}
              onBlur={(e) => {
                setIsEditing(false);
                onUpdate(el.id, { text: e.currentTarget.textContent ?? "" });
              }}
              className="w-full h-full overflow-hidden"
              style={{ cursor: isEditing ? "text" : "move", outline: "none" }}
            >
              {el.text ?? "Note..."}
            </div>
          </div>
        );

      case "cross":
        return (
          <div className="w-full h-full flex items-center justify-center">
            <X
              className="w-full h-full"
              style={{
                color: el.color ?? "#e53e3e",
                strokeWidth: el.borderWidth ?? 3,
              }}
            />
          </div>
        );

      case "check":
        return (
          <div className="w-full h-full flex items-center justify-center">
            <Check
              className="w-full h-full"
              style={{
                color: el.color ?? "#38a169",
                strokeWidth: el.borderWidth ?? 3,
              }}
            />
          </div>
        );

      case "checkbox":
        return (
          <div
            className="w-full h-full border-2 rounded flex items-center justify-center"
            style={{ borderColor: el.borderColor ?? "#4a5568" }}
          >
            {el.text === "checked" && (
              <Check
                className="w-3/4 h-3/4"
                style={{ color: el.color ?? "#38a169" }}
              />
            )}
          </div>
        );

      case "datefield":
        return (
          <div
            className="w-full h-full border-2 border-dashed rounded flex items-center justify-center text-xs"
            style={{
              borderColor: el.borderColor ?? "#7C3AED",
              color: el.color ?? "#7C3AED",
              fontSize: `${el.fontSize ?? 12}px`,
            }}
          >
            {el.text ?? new Date().toLocaleDateString()}
          </div>
        );

      case "arrow":
        return (
          <svg
            className="w-full h-full"
            viewBox="0 0 100 40"
            aria-label="Arrow element"
          >
            <title>Arrow</title>
            <defs>
              <marker
                id={`arrow-${el.id}`}
                markerWidth="8"
                markerHeight="6"
                refX="8"
                refY="3"
                orient="auto"
              >
                <polygon points="0 0, 8 3, 0 6" fill={el.color ?? "#7C3AED"} />
              </marker>
            </defs>
            <line
              x1="5"
              y1="20"
              x2="90"
              y2="20"
              stroke={el.color ?? "#7C3AED"}
              strokeWidth={el.borderWidth ?? 2}
              markerEnd={`url(#arrow-${el.id})`}
            />
          </svg>
        );

      default:
        return null;
    }
  };

  const HANDLE_SIZE = 8;
  const handles =
    isSelected && !el.locked
      ? [
          { dir: "nw", cx: 0, cy: 0 },
          { dir: "n", cx: 50, cy: 0 },
          { dir: "ne", cx: 100, cy: 0 },
          { dir: "e", cx: 100, cy: 50 },
          { dir: "se", cx: 100, cy: 100 },
          { dir: "s", cx: 50, cy: 100 },
          { dir: "sw", cx: 0, cy: 100 },
          { dir: "w", cx: 0, cy: 50 },
        ]
      : [];

  return (
    <div
      data-ocid={`canvas.item.${el.id}`}
      style={{
        position: "absolute",
        left: `${px}px`,
        top: `${py}px`,
        width: `${pw}px`,
        height: `${ph}px`,
        opacity: (el.opacity ?? 100) / 100,
        cursor: el.locked ? "not-allowed" : isDragging ? "grabbing" : "grab",
        userSelect: "none",
        zIndex: isSelected ? 10 : 1,
      }}
      onMouseDown={handleMouseDown}
      className={`group ${isSelected ? "ring-2 ring-violet-500 ring-offset-0" : ""}`}
    >
      {renderContent()}

      {/* Delete button */}
      {isSelected && !el.locked && (
        <button
          type="button"
          className="absolute -top-3 -right-3 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center shadow-md hover:bg-red-600 transition-colors z-20"
          onMouseDown={(e) => {
            e.stopPropagation();
            onDelete(el.id);
          }}
          data-ocid="canvas.delete_button"
        >
          <X className="w-3 h-3" />
        </button>
      )}

      {/* Lock icon */}
      {el.locked && (
        <div className="absolute top-0 right-0 w-4 h-4 bg-amber-400 rounded-bl flex items-center justify-center">
          <Lock className="w-2.5 h-2.5 text-white" />
        </div>
      )}

      {/* Resize handles */}
      {handles.map((h) => (
        <div
          key={h.dir}
          className="absolute bg-white border-2 border-violet-500 rounded-full z-20 hover:bg-violet-100"
          style={{
            width: HANDLE_SIZE,
            height: HANDLE_SIZE,
            left: `calc(${h.cx}% - ${HANDLE_SIZE / 2}px)`,
            top: `calc(${h.cy}% - ${HANDLE_SIZE / 2}px)`,
            cursor: `${h.dir}-resize`,
          }}
          onMouseDown={(e) => {
            e.stopPropagation();
            // Simple resize: drag SE handle adjusts width/height
          }}
        />
      ))}
    </div>
  );
}

// ─── Right Properties Panel ──────────────────────────────────────────────────

interface PropertiesPanelProps {
  element: CanvasElement | null;
  onUpdate: (id: string, updates: Partial<CanvasElement>) => void;
  onDelete: (id: string) => void;
  onBringForward: (id: string) => void;
  onSendBack: (id: string) => void;
  onAddSignature: () => void;
  onAddElement: (type: ElementType, extra?: Partial<CanvasElement>) => void;
}

function PropertiesPanel({
  element,
  onUpdate,
  onDelete,
  onBringForward,
  onSendBack,
  onAddSignature,
  onAddElement,
}: PropertiesPanelProps) {
  if (!element) {
    return (
      <div className="flex flex-col h-full">
        {/* Sign panel */}
        <div className="p-3 border-b">
          <div className="flex items-center gap-2 mb-3">
            <Pen className="w-4 h-4 text-violet-600" />
            <h3 className="font-semibold text-sm text-foreground">
              Sign Document
            </h3>
          </div>
          <div className="space-y-2">
            {[
              { label: "Signature", type: "signature" as ElementType },
              { label: "Initials", type: "signature" as ElementType },
              { label: "Text", type: "textfield" as ElementType },
              { label: "Date", type: "datefield" as ElementType },
              { label: "Check", type: "check" as ElementType },
            ].map(({ label, type }) => (
              <div
                key={label}
                className="flex items-center justify-between py-1.5 px-2 rounded-md hover:bg-muted/50"
              >
                <span className="text-sm text-foreground">{label}</span>
                <button
                  type="button"
                  onClick={() => {
                    if (type === "signature") {
                      onAddSignature();
                    } else {
                      onAddElement(type, {
                        text:
                          label === "Date"
                            ? new Date().toLocaleDateString()
                            : undefined,
                      });
                    }
                  }}
                  className="text-xs font-medium text-violet-600 hover:text-violet-800 bg-violet-50 hover:bg-violet-100 px-2 py-1 rounded transition-colors"
                  data-ocid={`sign.${label.toLowerCase()}.button`}
                >
                  Create
                </button>
              </div>
            ))}
          </div>
        </div>
        <div className="p-3 flex-1 flex items-center justify-center">
          <p className="text-xs text-muted-foreground text-center">
            Select an element to edit its properties
          </p>
        </div>
      </div>
    );
  }

  const up = (updates: Partial<CanvasElement>) => onUpdate(element.id, updates);

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      <div className="p-3 border-b flex items-center justify-between">
        <h3 className="font-semibold text-sm capitalize text-foreground">
          {element.type} Properties
        </h3>
        {element.locked ? (
          <button
            type="button"
            onClick={() => up({ locked: false })}
            className="p-1 rounded hover:bg-muted"
            title="Unlock"
          >
            <Lock className="w-3.5 h-3.5 text-amber-500" />
          </button>
        ) : (
          <button
            type="button"
            onClick={() => up({ locked: true })}
            className="p-1 rounded hover:bg-muted"
            title="Lock"
          >
            <Unlock className="w-3.5 h-3.5 text-muted-foreground" />
          </button>
        )}
      </div>

      <div className="p-3 space-y-3 flex-1 overflow-y-auto">
        {/* Text properties */}
        {(element.type === "text" ||
          element.type === "textfield" ||
          element.type === "sticky") && (
          <>
            <div>
              <Label className="text-xs mb-1 block text-muted-foreground">
                Font Family
              </Label>
              <Select
                value={element.fontFamily ?? "Arial"}
                onValueChange={(v) => up({ fontFamily: v })}
              >
                <SelectTrigger
                  className="h-7 text-xs"
                  data-ocid="props.font_select"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {FONT_FAMILIES.map((f) => (
                    <SelectItem key={f} value={f} style={{ fontFamily: f }}>
                      {f}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs mb-1 block text-muted-foreground">
                Font Size
              </Label>
              <Input
                type="number"
                min={6}
                max={144}
                value={element.fontSize ?? 14}
                onChange={(e) => up({ fontSize: Number(e.target.value) })}
                className="h-7 text-xs"
                data-ocid="props.font_size_input"
              />
            </div>
            <div>
              <Label className="text-xs mb-1 block text-muted-foreground">
                Style
              </Label>
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={() => up({ bold: !element.bold })}
                  className={`flex-1 h-7 text-xs font-bold rounded border transition-colors ${
                    element.bold
                      ? "bg-primary text-primary-foreground border-primary"
                      : "border-border hover:bg-muted"
                  }`}
                  data-ocid="props.bold_toggle"
                >
                  B
                </button>
                <button
                  type="button"
                  onClick={() => up({ italic: !element.italic })}
                  className={`flex-1 h-7 text-xs italic rounded border transition-colors ${
                    element.italic
                      ? "bg-primary text-primary-foreground border-primary"
                      : "border-border hover:bg-muted"
                  }`}
                  data-ocid="props.italic_toggle"
                >
                  I
                </button>
                <button
                  type="button"
                  onClick={() => up({ underline: !element.underline })}
                  className={`flex-1 h-7 text-xs underline rounded border transition-colors ${
                    element.underline
                      ? "bg-primary text-primary-foreground border-primary"
                      : "border-border hover:bg-muted"
                  }`}
                  data-ocid="props.underline_toggle"
                >
                  U
                </button>
              </div>
            </div>
            <div>
              <Label className="text-xs mb-1 block text-muted-foreground">
                Alignment
              </Label>
              <div className="flex gap-1">
                {(["left", "center", "right"] as const).map((align) => (
                  <button
                    type="button"
                    key={align}
                    onClick={() => up({ textAlign: align })}
                    className={`flex-1 h-7 flex items-center justify-center rounded border transition-colors ${
                      element.textAlign === align
                        ? "bg-primary text-primary-foreground border-primary"
                        : "border-border hover:bg-muted"
                    }`}
                  >
                    {align === "left" && <AlignLeft className="w-3 h-3" />}
                    {align === "center" && <AlignCenter className="w-3 h-3" />}
                    {align === "right" && <AlignRight className="w-3 h-3" />}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <Label className="text-xs mb-1 block text-muted-foreground">
                Text Color
              </Label>
              <div className="flex gap-2 items-center">
                <input
                  type="color"
                  value={element.color ?? "#1a1a2e"}
                  onChange={(e) => up({ color: e.target.value })}
                  className="w-7 h-7 rounded border border-border cursor-pointer"
                  data-ocid="props.text_color_input"
                />
                <Input
                  value={element.color ?? "#1a1a2e"}
                  onChange={(e) => up({ color: e.target.value })}
                  className="h-7 text-xs flex-1"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="prop-shadow"
                checked={element.shadow ?? false}
                onChange={(e) => up({ shadow: e.target.checked })}
                className="rounded"
                data-ocid="props.shadow_toggle"
              />
              <Label htmlFor="prop-shadow" className="text-xs cursor-pointer">
                Text Shadow
              </Label>
            </div>
          </>
        )}

        {/* Shape properties */}
        {element.type === "shape" && (
          <>
            <div>
              <Label className="text-xs mb-1 block text-muted-foreground">
                Fill Color
              </Label>
              <div className="flex gap-2 items-center">
                <input
                  type="color"
                  value={element.bgColor ?? "#ffffff"}
                  onChange={(e) => up({ bgColor: e.target.value })}
                  className="w-7 h-7 rounded border border-border cursor-pointer"
                  data-ocid="props.fill_color_input"
                />
                <Input
                  value={element.bgColor ?? "#ffffff"}
                  onChange={(e) => up({ bgColor: e.target.value })}
                  className="h-7 text-xs flex-1"
                />
              </div>
            </div>
            <div>
              <Label className="text-xs mb-1 block text-muted-foreground">
                Border Color
              </Label>
              <div className="flex gap-2 items-center">
                <input
                  type="color"
                  value={element.borderColor ?? "#7C3AED"}
                  onChange={(e) => up({ borderColor: e.target.value })}
                  className="w-7 h-7 rounded border border-border cursor-pointer"
                  data-ocid="props.border_color_input"
                />
                <Input
                  value={element.borderColor ?? "#7C3AED"}
                  onChange={(e) => up({ borderColor: e.target.value })}
                  className="h-7 text-xs flex-1"
                />
              </div>
            </div>
            <div>
              <Label className="text-xs mb-1 block text-muted-foreground">
                Border Width: {element.borderWidth ?? 2}px
              </Label>
              <Slider
                min={0}
                max={20}
                step={1}
                value={[element.borderWidth ?? 2]}
                onValueChange={([v]) => up({ borderWidth: v })}
                data-ocid="props.border_width_input"
              />
            </div>
          </>
        )}

        {/* Image properties */}
        {element.type === "image" && (
          <>
            <div>
              <Label className="text-xs mb-1 block text-muted-foreground">
                Brightness: {element.brightness ?? 0}
              </Label>
              <Slider
                min={-100}
                max={100}
                step={1}
                value={[element.brightness ?? 0]}
                onValueChange={([v]) => up({ brightness: v })}
                data-ocid="props.brightness_input"
              />
            </div>
            <div>
              <Label className="text-xs mb-1 block text-muted-foreground">
                Contrast: {element.contrast ?? 0}
              </Label>
              <Slider
                min={-100}
                max={100}
                step={1}
                value={[element.contrast ?? 0]}
                onValueChange={([v]) => up({ contrast: v })}
                data-ocid="props.contrast_input"
              />
            </div>
            <div>
              <Label className="text-xs mb-1 block text-muted-foreground">
                Saturation: {element.saturation ?? 0}
              </Label>
              <Slider
                min={-100}
                max={100}
                step={1}
                value={[element.saturation ?? 0]}
                onValueChange={([v]) => up({ saturation: v })}
                data-ocid="props.saturation_input"
              />
            </div>
          </>
        )}

        {/* Form field properties */}
        {(element.type === "checkbox" || element.type === "datefield") && (
          <>
            <div>
              <Label className="text-xs mb-1 block text-muted-foreground">
                Label
              </Label>
              <Input
                value={element.text ?? ""}
                onChange={(e) => up({ text: e.target.value })}
                className="h-7 text-xs"
                data-ocid="props.label_input"
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="prop-required"
                checked={element.required ?? false}
                onChange={(e) => up({ required: e.target.checked })}
                data-ocid="props.required_checkbox"
              />
              <Label htmlFor="prop-required" className="text-xs cursor-pointer">
                Required Field
              </Label>
            </div>
          </>
        )}

        {/* Common: Position */}
        <div className="pt-1 border-t">
          <Label className="text-xs mb-1 block text-muted-foreground">
            Position
          </Label>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-xs text-muted-foreground">X%</Label>
              <Input
                type="number"
                value={Math.round(element.x)}
                onChange={(e) => up({ x: Number(e.target.value) })}
                className="h-7 text-xs"
                data-ocid="props.pos_x_input"
              />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Y%</Label>
              <Input
                type="number"
                value={Math.round(element.y)}
                onChange={(e) => up({ y: Number(e.target.value) })}
                className="h-7 text-xs"
                data-ocid="props.pos_y_input"
              />
            </div>
          </div>
        </div>

        {/* Common: Size */}
        <div>
          <Label className="text-xs mb-1 block text-muted-foreground">
            Size
          </Label>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-xs text-muted-foreground">W%</Label>
              <Input
                type="number"
                value={Math.round(element.w)}
                onChange={(e) => up({ w: Number(e.target.value) })}
                className="h-7 text-xs"
                data-ocid="props.width_input"
              />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">H%</Label>
              <Input
                type="number"
                value={Math.round(element.h)}
                onChange={(e) => up({ h: Number(e.target.value) })}
                className="h-7 text-xs"
                data-ocid="props.height_input"
              />
            </div>
          </div>
        </div>

        {/* Common: Opacity */}
        <div>
          <Label className="text-xs mb-1 block text-muted-foreground">
            Opacity: {element.opacity ?? 100}%
          </Label>
          <Slider
            min={10}
            max={100}
            step={1}
            value={[element.opacity ?? 100]}
            onValueChange={([v]) => up({ opacity: v })}
            data-ocid="props.opacity_input"
          />
        </div>

        {/* Layer order */}
        <div className="pt-1 border-t">
          <Label className="text-xs mb-2 block text-muted-foreground">
            Layer Order
          </Label>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1 h-7 text-xs"
              onClick={() => onBringForward(element.id)}
              data-ocid="props.bring_forward_button"
            >
              Bring Forward
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="flex-1 h-7 text-xs"
              onClick={() => onSendBack(element.id)}
              data-ocid="props.send_back_button"
            >
              Send Back
            </Button>
          </div>
        </div>

        {/* Delete */}
        <Button
          variant="destructive"
          size="sm"
          className="w-full mt-2"
          onClick={() => onDelete(element.id)}
          data-ocid="props.delete_button"
        >
          <Trash2 className="w-3.5 h-3.5 mr-1" />
          Delete Element
        </Button>
      </div>
    </div>
  );
}

// ─── AI Panel ──────────────────────────────────────────────────────────────────

interface AIPanelProps {
  onClose: () => void;
  pdfText: string;
  selectedElementText?: string;
}

function AIPanel({ onClose, pdfText, selectedElementText }: AIPanelProps) {
  const [result, setResult] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [translateLang, setTranslateLang] = useState("Spanish");

  const run = async (prompt: string) => {
    setIsLoading(true);
    setResult("");
    try {
      const res = await callGemini(prompt);
      setResult(res);
    } catch {
      setResult("AI request failed. Please check your API key.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-card border-l">
      <div className="p-3 border-b flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-violet-600" />
          <h3 className="font-semibold text-sm">AI Assistant</h3>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="p-1 rounded hover:bg-muted"
          data-ocid="ai_panel.close_button"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
      <div className="p-3 space-y-2 overflow-y-auto flex-1">
        <Button
          variant="outline"
          size="sm"
          className="w-full justify-start text-xs h-8"
          onClick={() =>
            run(
              `Summarize this document content in 3-5 key points:\n\n${pdfText || "No text extracted yet. Please upload a PDF."}`,
            )
          }
          disabled={isLoading}
          data-ocid="ai_panel.summarize_button"
        >
          <Sparkles className="w-3 h-3 mr-2 text-violet-500" />
          Summarize Page
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="w-full justify-start text-xs h-8"
          onClick={() =>
            run(
              `Rewrite the following text to be clearer and more professional:\n\n${selectedElementText || "No text selected."}`,
            )
          }
          disabled={isLoading}
          data-ocid="ai_panel.rewrite_button"
        >
          <Pen className="w-3 h-3 mr-2 text-blue-500" />
          Rewrite Selected Text
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="w-full justify-start text-xs h-8"
          onClick={() =>
            run(
              `Check grammar and fix any errors in this text:\n\n${selectedElementText || pdfText || "No text available."}`,
            )
          }
          disabled={isLoading}
          data-ocid="ai_panel.grammar_button"
        >
          <Check className="w-3 h-3 mr-2 text-green-500" />
          Grammar Check
        </Button>
        <div className="flex gap-1">
          <Select value={translateLang} onValueChange={setTranslateLang}>
            <SelectTrigger className="h-8 text-xs flex-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[
                "Spanish",
                "French",
                "German",
                "Hindi",
                "Chinese",
                "Arabic",
                "Japanese",
                "Portuguese",
              ].map((l) => (
                <SelectItem key={l} value={l}>
                  {l}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            size="sm"
            className="h-8 text-xs px-2"
            onClick={() =>
              run(
                `Translate the following text to ${translateLang}:\n\n${selectedElementText || pdfText || "No text available."}`,
              )
            }
            disabled={isLoading}
            data-ocid="ai_panel.translate_button"
          >
            Translate
          </Button>
        </div>

        {isLoading && (
          <div
            className="flex items-center gap-2 py-4 justify-center"
            data-ocid="ai_panel.loading_state"
          >
            <Loader2 className="w-4 h-4 animate-spin text-violet-600" />
            <span className="text-xs text-muted-foreground">Processing...</span>
          </div>
        )}
        {result && (
          <div
            className="mt-2 p-2 rounded-lg bg-muted text-xs leading-relaxed border"
            data-ocid="ai_panel.success_state"
          >
            {result}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────

export function AdvancedPDFEditor() {
  // State
  const [elements, setElements] = useState<CanvasElement[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [toolMode, setToolMode] = useState<ToolMode>("selection");
  const [leftTab, setLeftTab] = useState<LeftTab>("pages");
  const [zoom, setZoom] = useState(100);
  const [showAIPanel, setShowAIPanel] = useState(false);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [pdfText] = useState("");
  const [showSignatureModal, setShowSignatureModal] = useState(false);
  const [signatureModalTitle, setSignatureModalTitle] =
    useState("Create Signature");
  const [isPreview, setIsPreview] = useState(false);
  const [pages, setPages] = useState([{ id: "page-1", label: "Page 1" }]);
  const [currentPage, setCurrentPage] = useState(0);
  const [comments, setComments] = useState<
    { id: string; text: string; time: string }[]
  >([]);
  const [newComment, setNewComment] = useState("");
  const [uploadedImages, setUploadedImages] = useState<
    { id: string; url: string; name: string }[]
  >([]);
  const [history, setHistory] = useState<CanvasElement[][]>([[]]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [qrText, setQrText] = useState("");

  const canvasRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  // Canvas dimensions
  const CANVAS_W = 794;
  const CANVAS_H = 1123;

  // ── History ─────────────────────────────────────────────────────────────────

  const pushHistory = useCallback(
    (newElements: CanvasElement[]) => {
      setHistory((prev) => {
        const truncated = prev.slice(0, historyIndex + 1);
        return [...truncated, newElements];
      });
      setHistoryIndex((i) => i + 1);
    },
    [historyIndex],
  );

  const undo = () => {
    if (historyIndex > 0) {
      setHistoryIndex((i) => i - 1);
      setElements(history[historyIndex - 1]);
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex((i) => i + 1);
      setElements(history[historyIndex + 1]);
    }
  };

  // ── Element Management ───────────────────────────────────────────────────────

  const addElement = useCallback(
    (type: ElementType, extra: Partial<CanvasElement> = {}) => {
      const el: CanvasElement = {
        id: generateId(),
        type,
        x: 35,
        y: 35,
        w: 30,
        h: type === "arrow" || type === "cross" || type === "check" ? 6 : 10,
        text:
          type === "text"
            ? "Double-click to edit"
            : type === "textfield"
              ? "Text Field"
              : type === "sticky"
                ? "Note..."
                : type === "datefield"
                  ? new Date().toLocaleDateString()
                  : undefined,
        fontSize: 14,
        fontFamily: "Arial",
        color: "#1a1a2e",
        opacity: 100,
        layerName: `${type} layer`,
        ...extra,
      };
      const next = [...elements, el];
      setElements(next);
      pushHistory(next);
      setSelectedId(el.id);
    },
    [elements, pushHistory],
  );

  const updateElement = useCallback(
    (id: string, updates: Partial<CanvasElement>) => {
      setElements((prev) => {
        const next = prev.map((el) =>
          el.id === id ? { ...el, ...updates } : el,
        );
        return next;
      });
    },
    [],
  );

  const updateElementWithHistory = useCallback(
    (id: string, updates: Partial<CanvasElement>) => {
      setElements((prev) => {
        const next = prev.map((el) =>
          el.id === id ? { ...el, ...updates } : el,
        );
        pushHistory(next);
        return next;
      });
    },
    [pushHistory],
  );

  const deleteElement = useCallback(
    (id: string) => {
      setElements((prev) => {
        const next = prev.filter((el) => el.id !== id);
        pushHistory(next);
        return next;
      });
      setSelectedId(null);
    },
    [pushHistory],
  );

  const bringForward = (id: string) => {
    setElements((prev) => {
      const idx = prev.findIndex((e) => e.id === id);
      if (idx >= prev.length - 1) return prev;
      const next = [...prev];
      [next[idx], next[idx + 1]] = [next[idx + 1], next[idx]];
      return next;
    });
  };

  const sendBack = (id: string) => {
    setElements((prev) => {
      const idx = prev.findIndex((e) => e.id === id);
      if (idx <= 0) return prev;
      const next = [...prev];
      [next[idx], next[idx - 1]] = [next[idx - 1], next[idx]];
      return next;
    });
  };

  // ── PDF Upload ───────────────────────────────────────────────────────────────

  const handlePdfUpload = (file: File) => {
    if (!file.name.toLowerCase().endsWith(".pdf")) {
      toast.error("Please upload a PDF file");
      return;
    }
    const url = URL.createObjectURL(file);
    if (pdfUrl) URL.revokeObjectURL(pdfUrl);
    setPdfFile(file);
    setPdfUrl(url);
    toast.success(`Loaded: ${file.name}`);
  };

  useEffect(() => {
    return () => {
      if (pdfUrl) URL.revokeObjectURL(pdfUrl);
    };
  }, [pdfUrl]);

  // ── Canvas Click ─────────────────────────────────────────────────────────────

  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement) === canvasRef.current) {
      setSelectedId(null);
    }

    // Add element on canvas click for certain tool modes
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const xPct = ((e.clientX - rect.left) / rect.width) * 100;
    const yPct = ((e.clientY - rect.top) / rect.height) * 100;

    const addAtPosition = (
      type: ElementType,
      extra: Partial<CanvasElement> = {},
    ) => {
      const el: CanvasElement = {
        id: generateId(),
        type,
        x: Math.max(0, xPct - 15),
        y: Math.max(0, yPct - 5),
        w: 30,
        h: 10,
        text:
          type === "text"
            ? "Text"
            : type === "sticky"
              ? "Note..."
              : type === "highlight"
                ? ""
                : undefined,
        fontSize: 14,
        fontFamily: "Arial",
        color: "#1a1a2e",
        opacity: 100,
        layerName: `${type} layer`,
        ...extra,
      };
      const next = [...elements, el];
      setElements(next);
      pushHistory(next);
      setSelectedId(el.id);
    };

    switch (toolMode) {
      case "text":
        addAtPosition("text");
        setToolMode("selection");
        break;
      case "highlight":
        addAtPosition("highlight", {
          bgColor: "rgba(255, 235, 59, 0.45)",
          h: 4,
          w: 20,
        });
        setToolMode("selection");
        break;
      case "redact":
        addAtPosition("redact", { bgColor: "#000000", h: 4, w: 20 });
        setToolMode("selection");
        break;
      case "sticky":
        addAtPosition("sticky", { bgColor: "#fef08a", w: 20, h: 15 });
        setToolMode("selection");
        break;
      case "cross":
        addAtPosition("cross", { w: 8, h: 8, color: "#e53e3e" });
        setToolMode("selection");
        break;
      case "check":
        addAtPosition("check", { w: 8, h: 8, color: "#38a169" });
        setToolMode("selection");
        break;
      case "arrow":
        addAtPosition("arrow", { w: 20, h: 6 });
        setToolMode("selection");
        break;
    }
  };

  // ── Export ───────────────────────────────────────────────────────────────────

  const handleExportPDF = async () => {
    try {
      let pdfDoc: Awaited<ReturnType<typeof PDFDocument.create>>;

      if (pdfFile) {
        const buf = await pdfFile.arrayBuffer();
        pdfDoc = await PDFDocument.load(buf, { ignoreEncryption: true });
      } else {
        pdfDoc = await PDFDocument.create();
        pdfDoc.addPage([CANVAS_W, CANVAS_H]);
      }

      const page = pdfDoc.getPages()[0];
      const { width, height } = page.getSize();
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

      for (const el of elements) {
        if (el.hidden) continue;
        const x = (el.x / 100) * width;
        const y = height - (el.y / 100) * height - (el.h / 100) * height;
        const w = (el.w / 100) * width;
        const h = (el.h / 100) * height;

        if (el.type === "text" || el.type === "textfield") {
          const hex = el.color ?? "#1a1a2e";
          const r = Number.parseInt(hex.slice(1, 3), 16) / 255;
          const g = Number.parseInt(hex.slice(3, 5), 16) / 255;
          const b = Number.parseInt(hex.slice(5, 7), 16) / 255;
          page.drawText(el.text ?? "", {
            x,
            y: y + h / 2,
            size: el.fontSize ?? 14,
            font,
            color: rgb(r, g, b),
          });
        } else if (
          el.type === "shape" ||
          el.type === "redact" ||
          el.type === "highlight"
        ) {
          const hex =
            el.bgColor ?? (el.type === "redact" ? "#000000" : "#FFEB3B");
          const r = Number.parseInt(hex.slice(1, 3), 16) / 255;
          const g = Number.parseInt(hex.slice(3, 5), 16) / 255;
          const b = Number.parseInt(hex.slice(5, 7), 16) / 255;
          page.drawRectangle({
            x,
            y,
            width: w,
            height: h,
            color: rgb(r, g, b),
            opacity: (el.opacity ?? 100) / 100,
          });
        } else if (el.type === "image" && el.imageData) {
          try {
            const imgBytes = await fetch(el.imageData).then((r) =>
              r.arrayBuffer(),
            );
            const isJpg = el.imageData.startsWith("data:image/jpeg");
            const embedded = isJpg
              ? await pdfDoc.embedJpg(imgBytes)
              : await pdfDoc.embedPng(imgBytes);
            page.drawImage(embedded, { x, y, width: w, height: h });
          } catch {
            // skip image embed errors
          }
        }
      }

      const bytes = await pdfDoc.save();
      const blob = new Blob([bytes.buffer as ArrayBuffer], {
        type: "application/pdf",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = pdfFile ? `edited-${pdfFile.name}` : "edited.pdf";
      a.click();
      URL.revokeObjectURL(url);
      toast.success("PDF exported successfully");
    } catch (err) {
      toast.error(`Export failed: ${(err as Error).message}`);
    }
  };

  const handleExportJPG = () => {
    if (!canvasRef.current) return;
    toast.info(
      "JPG export: Use browser screenshot or a canvas-based renderer for full fidelity.",
    );
  };

  // ── Template Loader ──────────────────────────────────────────────────────────

  const loadTemplate = (name: string) => {
    const base: Partial<CanvasElement>[] = [];
    switch (name) {
      case "Resume":
        base.push(
          {
            type: "text",
            x: 10,
            y: 5,
            w: 80,
            h: 8,
            text: "John Doe",
            fontSize: 28,
            bold: true,
            color: "#1a1a2e",
          },
          {
            type: "text",
            x: 10,
            y: 12,
            w: 80,
            h: 5,
            text: "Software Engineer · john@email.com · +1 555-0100",
            fontSize: 12,
            color: "#555",
          },
          {
            type: "shape",
            x: 5,
            y: 19,
            w: 90,
            h: 1,
            shapeType: "line",
            borderColor: "#7C3AED",
            borderWidth: 2,
          },
          {
            type: "text",
            x: 10,
            y: 22,
            w: 80,
            h: 6,
            text: "EXPERIENCE",
            fontSize: 14,
            bold: true,
            color: "#7C3AED",
          },
          {
            type: "text",
            x: 10,
            y: 30,
            w: 80,
            h: 5,
            text: "Senior Developer — Acme Corp (2021–Present)",
            fontSize: 12,
            color: "#333",
          },
        );
        break;
      case "Invoice":
        base.push(
          {
            type: "text",
            x: 5,
            y: 5,
            w: 50,
            h: 10,
            text: "INVOICE",
            fontSize: 32,
            bold: true,
            color: "#7C3AED",
          },
          {
            type: "text",
            x: 60,
            y: 5,
            w: 35,
            h: 6,
            text: `#INV-001\nDate: ${new Date().toLocaleDateString()}`,
            fontSize: 12,
            color: "#555",
          },
          {
            type: "shape",
            x: 5,
            y: 20,
            w: 90,
            h: 1,
            shapeType: "line",
            borderColor: "#e5e7eb",
            borderWidth: 2,
          },
          {
            type: "text",
            x: 5,
            y: 24,
            w: 60,
            h: 5,
            text: "Description",
            fontSize: 12,
            bold: true,
            color: "#333",
          },
          {
            type: "text",
            x: 70,
            y: 24,
            w: 25,
            h: 5,
            text: "Amount",
            fontSize: 12,
            bold: true,
            color: "#333",
          },
          {
            type: "text",
            x: 5,
            y: 32,
            w: 60,
            h: 5,
            text: "Professional Services",
            fontSize: 12,
            color: "#555",
          },
          {
            type: "text",
            x: 70,
            y: 32,
            w: 25,
            h: 5,
            text: "$1,200.00",
            fontSize: 12,
            color: "#555",
          },
        );
        break;
      case "Certificate":
        base.push(
          {
            type: "shape",
            x: 3,
            y: 3,
            w: 94,
            h: 94,
            shapeType: "rect",
            bgColor: "transparent",
            borderColor: "#7C3AED",
            borderWidth: 3,
          },
          {
            type: "text",
            x: 10,
            y: 20,
            w: 80,
            h: 10,
            text: "CERTIFICATE OF ACHIEVEMENT",
            fontSize: 22,
            bold: true,
            color: "#7C3AED",
            textAlign: "center",
          },
          {
            type: "text",
            x: 20,
            y: 40,
            w: 60,
            h: 8,
            text: "This certifies that",
            fontSize: 14,
            color: "#555",
            textAlign: "center",
          },
          {
            type: "text",
            x: 15,
            y: 50,
            w: 70,
            h: 12,
            text: "Recipient Name",
            fontSize: 28,
            bold: true,
            color: "#1a1a2e",
            textAlign: "center",
          },
          {
            type: "shape",
            x: 25,
            y: 64,
            w: 50,
            h: 1,
            shapeType: "line",
            borderColor: "#7C3AED",
            borderWidth: 1,
          },
        );
        break;
      case "Brochure":
        base.push(
          {
            type: "shape",
            x: 0,
            y: 0,
            w: 100,
            h: 30,
            shapeType: "rect",
            bgColor: "#7C3AED",
            borderColor: "transparent",
            borderWidth: 0,
          },
          {
            type: "text",
            x: 10,
            y: 10,
            w: 80,
            h: 12,
            text: "Your Company",
            fontSize: 28,
            bold: true,
            color: "#ffffff",
            textAlign: "center",
          },
          {
            type: "text",
            x: 10,
            y: 35,
            w: 80,
            h: 8,
            text: "Our Services",
            fontSize: 18,
            bold: true,
            color: "#7C3AED",
          },
          {
            type: "text",
            x: 10,
            y: 45,
            w: 80,
            h: 15,
            text: "We offer professional services tailored to your business needs. Contact us today to learn more.",
            fontSize: 12,
            color: "#555",
          },
        );
        break;
      case "Poster":
        base.push(
          {
            type: "shape",
            x: 0,
            y: 0,
            w: 100,
            h: 100,
            shapeType: "rect",
            bgColor: "#1a1a2e",
            borderColor: "transparent",
            borderWidth: 0,
          },
          {
            type: "text",
            x: 5,
            y: 25,
            w: 90,
            h: 20,
            text: "EVENT TITLE",
            fontSize: 42,
            bold: true,
            color: "#ffffff",
            textAlign: "center",
          },
          {
            type: "text",
            x: 15,
            y: 55,
            w: 70,
            h: 8,
            text: "📅 Saturday, June 14, 2026 · 7:00 PM",
            fontSize: 14,
            color: "#a78bfa",
            textAlign: "center",
          },
          {
            type: "text",
            x: 20,
            y: 65,
            w: 60,
            h: 6,
            text: "📍 Grand Ballroom, City Center",
            fontSize: 13,
            color: "#e2e8f0",
            textAlign: "center",
          },
        );
        break;
    }
    if (base.length) {
      const newEls = base.map(
        (b) =>
          ({
            id: generateId(),
            layerName: `${name} element`,
            opacity: 100,
            w: b.w ?? 30,
            h: b.h ?? 10,
            x: b.x ?? 10,
            y: b.y ?? 10,
            ...b,
          }) as CanvasElement,
      );
      const next = [...elements, ...newEls];
      setElements(next);
      pushHistory(next);
      toast.success(`${name} template loaded`);
    }
  };

  // ── Image Upload ─────────────────────────────────────────────────────────────

  const handleImageUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      if (!e.target?.result) return;
      const url = e.target.result as string;
      const imgId = generateId();
      setUploadedImages((prev) => [
        ...prev,
        { id: imgId, url, name: file.name },
      ]);
      toast.success("Image uploaded");
    };
    reader.readAsDataURL(file);
  };

  const addImageToCanvas = (imageData: string) => {
    addElement("image", { imageData, w: 30, h: 25 });
  };

  // ── Selected element ─────────────────────────────────────────────────────────

  const selectedElement = elements.find((e) => e.id === selectedId) ?? null;

  // ── Left Sidebar Content ──────────────────────────────────────────────────────

  const renderLeftContent = () => {
    switch (leftTab) {
      case "pages":
        return (
          <div className="p-2 space-y-2">
            <div className="text-xs font-medium text-muted-foreground px-1 mb-2">
              {pages.length} Page{pages.length !== 1 ? "s" : ""}
            </div>
            {pages.map((page, idx) => (
              <button
                type="button"
                key={page.id}
                onClick={() => setCurrentPage(idx)}
                className={`relative w-full rounded-lg overflow-hidden cursor-pointer border-2 transition-colors ${
                  currentPage === idx
                    ? "border-violet-500"
                    : "border-border hover:border-violet-300"
                }`}
                data-ocid={`pages.item.${idx + 1}`}
              >
                <div className="aspect-[0.707] bg-white flex items-center justify-center">
                  {pdfUrl ? (
                    <div className="w-full h-full bg-gray-50 flex items-center justify-center">
                      <FileText className="w-8 h-8 text-gray-300" />
                    </div>
                  ) : (
                    <div className="w-full h-full bg-gray-50 flex items-center justify-center">
                      <FileText className="w-6 h-6 text-gray-300" />
                    </div>
                  )}
                </div>
                <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs text-center py-0.5">
                  {idx + 1}
                </div>
                <div className="absolute top-1 right-1 flex gap-0.5">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      const newPage = {
                        id: generateId(),
                        label: `Page ${pages.length + 1}`,
                      };
                      setPages((prev) => [...prev, newPage]);
                    }}
                    className="w-4 h-4 bg-white/80 rounded-sm text-xs flex items-center justify-center hover:bg-white"
                    title="Duplicate"
                  >
                    +
                  </button>
                  {pages.length > 1 && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setPages((prev) => prev.filter((_, i) => i !== idx));
                        if (currentPage >= idx)
                          setCurrentPage(Math.max(0, idx - 1));
                      }}
                      className="w-4 h-4 bg-red-500/80 rounded-sm text-xs text-white flex items-center justify-center hover:bg-red-500"
                      title="Delete"
                    >
                      ×
                    </button>
                  )}
                </div>
              </button>
            ))}
            <Button
              variant="outline"
              size="sm"
              className="w-full text-xs"
              onClick={() =>
                setPages((prev) => [
                  ...prev,
                  { id: generateId(), label: `Page ${prev.length + 1}` },
                ])
              }
              data-ocid="pages.add_button"
            >
              <Plus className="w-3 h-3 mr-1" />
              Add Page
            </Button>
          </div>
        );

      case "text":
        return (
          <div className="p-2 space-y-1.5">
            <p className="text-xs font-medium text-muted-foreground px-1 mb-2">
              Click to add text
            </p>
            {[
              { label: "Add Heading", size: 28, bold: true },
              { label: "Add Subheading", size: 20, bold: true },
              { label: "Add Body Text", size: 14, bold: false },
              { label: "Add Text Box", size: 12, bold: false },
            ].map(({ label, size, bold }) => (
              <button
                type="button"
                key={label}
                onClick={() =>
                  addElement("text", {
                    text: label.replace("Add ", ""),
                    fontSize: size,
                    bold,
                    w: 70,
                    h: size > 20 ? 12 : 8,
                  })
                }
                className="w-full text-left px-2 py-2 rounded-lg border border-border hover:bg-muted hover:border-violet-300 transition-colors"
                data-ocid={`text.${label.toLowerCase().replace(/\s+/g, "_")}_button`}
              >
                <span
                  className="block text-foreground"
                  style={{
                    fontSize: `${Math.min(size, 18)}px`,
                    fontWeight: bold ? "bold" : "normal",
                  }}
                >
                  {label}
                </span>
              </button>
            ))}
          </div>
        );

      case "elements":
        return (
          <div className="p-2 space-y-3">
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1.5">
                Shapes
              </p>
              <div className="grid grid-cols-2 gap-1.5">
                {[
                  { label: "Rectangle", shapeType: "rect" as const },
                  { label: "Circle", shapeType: "circle" as const },
                  { label: "Line", shapeType: "line" as const, h: 3 },
                  { label: "Arrow", type: "arrow" as ElementType },
                ].map(({ label, shapeType, type, h }) => (
                  <button
                    type="button"
                    key={label}
                    onClick={() =>
                      addElement(type ?? "shape", {
                        shapeType,
                        borderColor: "#7C3AED",
                        borderWidth: 2,
                        bgColor: "transparent",
                        h: h ?? 15,
                      })
                    }
                    className="px-2 py-2 rounded-lg border border-border hover:bg-violet-50 hover:border-violet-300 transition-colors text-xs text-center"
                    data-ocid={`elements.${label.toLowerCase()}_button`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1.5">
                Other
              </p>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  type="button"
                  onClick={() =>
                    addElement("highlight", {
                      bgColor: "#fbbf24",
                      w: 30,
                      h: 4,
                      opacity: 50,
                    })
                  }
                  className="px-2 py-2 rounded-lg border border-border hover:bg-yellow-50 hover:border-yellow-300 transition-colors text-xs"
                  data-ocid="elements.highlight_button"
                >
                  Highlight
                </button>
                <button
                  type="button"
                  onClick={() =>
                    addElement("sticky", { bgColor: "#fef08a", w: 22, h: 18 })
                  }
                  className="px-2 py-2 rounded-lg border border-border hover:bg-yellow-50 hover:border-yellow-300 transition-colors text-xs"
                  data-ocid="elements.sticky_button"
                >
                  Sticky Note
                </button>
              </div>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1.5">
                QR Code
              </p>
              <div className="space-y-1.5">
                <Input
                  placeholder="Enter URL or text..."
                  value={qrText}
                  onChange={(e) => setQrText(e.target.value)}
                  className="h-7 text-xs"
                  data-ocid="elements.qr_input"
                />
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full text-xs h-7"
                  onClick={() => {
                    if (!qrText.trim()) return;
                    addElement("text", {
                      text: `[QR: ${qrText}]`,
                      bgColor: "#f9fafb",
                      borderColor: "#374151",
                      borderWidth: 1,
                      w: 15,
                      h: 15,
                      fontSize: 10,
                    });
                    toast.success("QR placeholder added");
                  }}
                  data-ocid="elements.qr_add_button"
                >
                  <QrCode className="w-3 h-3 mr-1" />
                  Add QR Code
                </Button>
              </div>
            </div>
          </div>
        );

      case "uploads":
        return (
          <div className="p-2 space-y-2">
            <input
              ref={imageInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleImageUpload(file);
              }}
            />
            <Button
              variant="outline"
              size="sm"
              className="w-full text-xs"
              onClick={() => imageInputRef.current?.click()}
              data-ocid="uploads.upload_button"
            >
              <Upload className="w-3 h-3 mr-1" />
              Upload Image
            </Button>
            {uploadedImages.length === 0 && (
              <div
                className="text-xs text-muted-foreground text-center py-6"
                data-ocid="uploads.empty_state"
              >
                No images uploaded yet
              </div>
            )}
            <div className="grid grid-cols-2 gap-1.5">
              {uploadedImages.map((img, idx) => (
                <button
                  type="button"
                  key={img.id}
                  className="relative rounded border border-border overflow-hidden cursor-pointer hover:border-violet-400 transition-colors text-left w-full"
                  onClick={() => addImageToCanvas(img.url)}
                  data-ocid={`uploads.item.${idx + 1}`}
                >
                  <img
                    src={img.url}
                    alt={img.name}
                    className="w-full aspect-square object-cover"
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs p-0.5 truncate">
                    {img.name}
                  </div>
                </button>
              ))}
            </div>
          </div>
        );

      case "templates":
        return (
          <div className="p-2 space-y-1.5">
            <p className="text-xs font-medium text-muted-foreground px-1 mb-2">
              Pre-built layouts
            </p>
            {["Resume", "Invoice", "Certificate", "Brochure", "Poster"].map(
              (t) => (
                <button
                  type="button"
                  key={t}
                  onClick={() => loadTemplate(t)}
                  className="w-full text-left px-3 py-2.5 rounded-lg border border-border hover:bg-violet-50 hover:border-violet-300 transition-colors"
                  data-ocid={`templates.${t.toLowerCase()}_button`}
                >
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-10 rounded bg-gradient-to-b from-violet-100 to-violet-50 border border-violet-200 flex items-center justify-center flex-shrink-0">
                      <FileText className="w-4 h-4 text-violet-400" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-foreground">
                        {t}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Template
                      </div>
                    </div>
                  </div>
                </button>
              ),
            )}
          </div>
        );

      case "forms":
        return (
          <div className="p-2 space-y-1.5">
            <p className="text-xs font-medium text-muted-foreground px-1 mb-2">
              Click to add form fields
            </p>
            {[
              {
                label: "Text Field",
                type: "textfield" as ElementType,
                icon: "T",
              },
              { label: "Checkbox", type: "checkbox" as ElementType, icon: "☑" },
              {
                label: "Signature",
                type: "signature" as ElementType,
                icon: "✍",
              },
              {
                label: "Date Field",
                type: "datefield" as ElementType,
                icon: "📅",
              },
            ].map(({ label, type, icon }) => (
              <button
                type="button"
                key={label}
                onClick={() => {
                  if (type === "signature") {
                    setSignatureModalTitle("Create Signature");
                    setShowSignatureModal(true);
                  } else {
                    addElement(type, { w: 35, h: 8, placeholder: label });
                  }
                }}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg border border-border hover:bg-violet-50 hover:border-violet-300 transition-colors"
                data-ocid={`forms.${label.toLowerCase().replace(/\s+/g, "_")}_button`}
              >
                <span className="w-7 h-7 rounded border border-violet-200 bg-violet-50 flex items-center justify-center text-violet-600">
                  {icon}
                </span>
                <span className="text-sm text-foreground">{label}</span>
              </button>
            ))}
          </div>
        );

      case "comments":
        return (
          <div className="p-2 space-y-2">
            <div className="flex gap-1">
              <Input
                placeholder="Add comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="h-7 text-xs flex-1"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && newComment.trim()) {
                    setComments((prev) => [
                      ...prev,
                      {
                        id: generateId(),
                        text: newComment,
                        time: new Date().toLocaleTimeString(),
                      },
                    ]);
                    setNewComment("");
                  }
                }}
                data-ocid="comments.input"
              />
              <Button
                size="sm"
                className="h-7 px-2"
                onClick={() => {
                  if (!newComment.trim()) return;
                  setComments((prev) => [
                    ...prev,
                    {
                      id: generateId(),
                      text: newComment,
                      time: new Date().toLocaleTimeString(),
                    },
                  ]);
                  setNewComment("");
                }}
                data-ocid="comments.add_button"
              >
                <Plus className="w-3 h-3" />
              </Button>
            </div>
            {comments.length === 0 && (
              <div
                className="text-xs text-muted-foreground text-center py-6"
                data-ocid="comments.empty_state"
              >
                No comments yet
              </div>
            )}
            {comments.map((c, idx) => (
              <div
                key={c.id}
                className="p-2 rounded-lg bg-muted/50 border border-border"
                data-ocid={`comments.item.${idx + 1}`}
              >
                <p className="text-xs text-foreground">{c.text}</p>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-xs text-muted-foreground">
                    {c.time}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      setComments((prev) => prev.filter((x) => x.id !== c.id))
                    }
                    className="text-red-400 hover:text-red-600"
                    data-ocid={`comments.delete_button.${idx + 1}`}
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        );

      case "layers":
        return (
          <div className="p-2 space-y-1">
            {elements.length === 0 && (
              <div
                className="text-xs text-muted-foreground text-center py-6"
                data-ocid="layers.empty_state"
              >
                No layers yet
              </div>
            )}
            {[...elements].reverse().map((el, idx) => (
              <button
                type="button"
                key={el.id}
                className={`w-full flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-xs cursor-pointer transition-colors ${
                  selectedId === el.id
                    ? "bg-violet-100 border border-violet-300"
                    : "hover:bg-muted border border-transparent"
                }`}
                onClick={() => setSelectedId(el.id)}
                data-ocid={`layers.item.${idx + 1}`}
              >
                <div className="flex items-center gap-0.5">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      updateElement(el.id, { hidden: !el.hidden });
                    }}
                    className="p-0.5 hover:bg-muted rounded"
                    data-ocid={`layers.visibility_toggle.${idx + 1}`}
                  >
                    {el.hidden ? (
                      <EyeOff className="w-3 h-3 text-muted-foreground" />
                    ) : (
                      <Eye className="w-3 h-3 text-foreground" />
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      updateElement(el.id, { locked: !el.locked });
                    }}
                    className="p-0.5 hover:bg-muted rounded"
                    data-ocid={`layers.lock_toggle.${idx + 1}`}
                  >
                    {el.locked ? (
                      <Lock className="w-3 h-3 text-amber-500" />
                    ) : (
                      <Unlock className="w-3 h-3 text-muted-foreground" />
                    )}
                  </button>
                </div>
                <span
                  className={`flex-1 truncate capitalize ${el.hidden ? "opacity-40 line-through" : ""}`}
                >
                  {el.layerName ?? el.type}
                </span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteElement(el.id);
                  }}
                  className="p-0.5 hover:bg-red-100 rounded text-red-400 hover:text-red-600"
                  data-ocid={`layers.delete_button.${idx + 1}`}
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </button>
            ))}
          </div>
        );
    }
  };

  const LEFT_TABS: { id: LeftTab; label: string; icon: React.ReactNode }[] = [
    { id: "pages", label: "Pages", icon: <FileText className="w-3.5 h-3.5" /> },
    { id: "text", label: "Text", icon: <Type className="w-3.5 h-3.5" /> },
    {
      id: "elements",
      label: "Elements",
      icon: <Plus className="w-3.5 h-3.5" />,
    },
    {
      id: "uploads",
      label: "Uploads",
      icon: <Upload className="w-3.5 h-3.5" />,
    },
    {
      id: "templates",
      label: "Templates",
      icon: <FileText className="w-3.5 h-3.5" />,
    },
    {
      id: "forms",
      label: "Forms",
      icon: <AlignLeft className="w-3.5 h-3.5" />,
    },
    {
      id: "comments",
      label: "Comments",
      icon: <MessageSquare className="w-3.5 h-3.5" />,
    },
    { id: "layers", label: "Layers", icon: <Layers className="w-3.5 h-3.5" /> },
  ];

  return (
    <div className="flex flex-col h-screen bg-background overflow-hidden">
      {/* Galaxy Header */}
      <GalaxyHeader />

      {/* Top Toolbar */}
      <div className="flex items-center gap-1 px-2 py-1.5 border-b bg-card shadow-xs flex-shrink-0 overflow-x-auto">
        {/* File Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs gap-1"
              data-ocid="toolbar.file_button"
            >
              <FileText className="w-3.5 h-3.5" />
              File
              <ChevronDown className="w-3 h-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent data-ocid="toolbar.file_dropdown_menu">
            <DropdownMenuItem
              onClick={() => {
                setElements([]);
                setPdfFile(null);
                setPdfUrl(null);
                setSelectedId(null);
                toast.success("New document created");
              }}
            >
              New
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => fileInputRef.current?.click()}>
              Open PDF
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                const data = JSON.stringify(elements, null, 2);
                const blob = new Blob([data], { type: "application/json" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = "editor-session.json";
                a.click();
                URL.revokeObjectURL(url);
              }}
            >
              Save JSON
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleExportPDF}>
              Export PDF
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleExportJPG}>
              Export JPG
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Undo / Redo */}
        <div className="flex gap-0.5">
          <button
            type="button"
            onClick={undo}
            disabled={historyIndex === 0}
            className="h-7 w-7 rounded flex items-center justify-center hover:bg-muted disabled:opacity-40 transition-colors"
            title="Undo"
            data-ocid="toolbar.undo_button"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={redo}
            disabled={historyIndex >= history.length - 1}
            className="h-7 w-7 rounded flex items-center justify-center hover:bg-muted disabled:opacity-40 transition-colors"
            title="Redo"
            data-ocid="toolbar.redo_button"
          >
            <Redo className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="w-px h-5 bg-border mx-1" />

        {/* Tool mode buttons */}
        <div className="flex gap-0.5 overflow-x-auto">
          {TOOL_MODES.map(({ mode, label, icon }) => (
            <button
              type="button"
              key={mode}
              onClick={() => setToolMode(mode)}
              title={label}
              className={`flex items-center gap-1 px-2 py-1 h-7 rounded text-xs transition-colors whitespace-nowrap ${
                toolMode === mode
                  ? "bg-violet-600 text-white"
                  : "hover:bg-muted text-foreground"
              }`}
              data-ocid={`toolbar.tool_${mode}_button`}
            >
              {icon}
              <span className="hidden md:inline">{label}</span>
            </button>
          ))}
        </div>

        <div className="w-px h-5 bg-border mx-1" />

        {/* Zoom controls */}
        <div className="flex items-center gap-0.5">
          <button
            type="button"
            onClick={() => setZoom((z) => Math.max(25, z - 10))}
            className="h-7 w-7 rounded flex items-center justify-center hover:bg-muted"
            data-ocid="toolbar.zoom_out_button"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <span className="text-xs font-medium w-10 text-center">{zoom}%</span>
          <button
            type="button"
            onClick={() => setZoom((z) => Math.min(200, z + 10))}
            className="h-7 w-7 rounded flex items-center justify-center hover:bg-muted"
            data-ocid="toolbar.zoom_in_button"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="w-px h-5 bg-border mx-1" />

        {/* Right toolbar actions */}
        <div className="flex gap-0.5 ml-auto">
          <button
            type="button"
            onClick={() => setIsPreview((p) => !p)}
            className={`h-7 px-2 rounded text-xs flex items-center gap-1 transition-colors ${
              isPreview ? "bg-green-600 text-white" : "hover:bg-muted"
            }`}
            data-ocid="toolbar.preview_toggle"
          >
            <Eye className="w-3.5 h-3.5" />
            <span className="hidden lg:inline">
              {isPreview ? "Editing" : "Preview"}
            </span>
          </button>
          <button
            type="button"
            onClick={() => {
              navigator.clipboard.writeText(window.location.href);
              toast.success("Link copied to clipboard");
            }}
            className="h-7 px-2 rounded text-xs flex items-center gap-1 hover:bg-muted"
            data-ocid="toolbar.share_button"
          >
            <ArrowRight className="w-3.5 h-3.5" />
            <span className="hidden lg:inline">Share</span>
          </button>
          <button
            type="button"
            onClick={() => setShowAIPanel((p) => !p)}
            className={`h-7 px-2 rounded text-xs flex items-center gap-1 transition-colors ${
              showAIPanel ? "bg-violet-600 text-white" : "hover:bg-muted"
            }`}
            data-ocid="toolbar.ai_assistant_button"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span className="hidden lg:inline">AI</span>
          </button>

          {/* Download dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                size="sm"
                className="h-7 text-xs gap-1 bg-violet-600 hover:bg-violet-700 text-white"
                data-ocid="toolbar.download_button"
              >
                <Download className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Download</span>
                <ChevronDown className="w-3 h-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              data-ocid="toolbar.download_dropdown_menu"
            >
              <DropdownMenuItem onClick={handleExportPDF}>
                Export PDF (Standard)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleExportPDF}>
                Export PDF (Print Ready)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleExportJPG}>
                Export as JPG
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleExportPDF}>
                Export Compressed
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Hidden file inputs */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handlePdfUpload(file);
        }}
      />

      {/* Main editor area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar */}
        <div className="w-48 lg:w-56 flex flex-col border-r bg-card flex-shrink-0 overflow-hidden">
          {/* Tab buttons */}
          <div className="grid grid-cols-4 border-b">
            {LEFT_TABS.map(({ id, label, icon }) => (
              <button
                type="button"
                key={id}
                onClick={() => setLeftTab(id)}
                title={label}
                className={`flex flex-col items-center justify-center py-1.5 text-xs transition-colors ${
                  leftTab === id
                    ? "bg-violet-600 text-white"
                    : "hover:bg-muted text-muted-foreground"
                }`}
                data-ocid={`sidebar.${id}_tab`}
              >
                {icon}
                <span className="text-[9px] mt-0.5 leading-none">{label}</span>
              </button>
            ))}
          </div>
          {/* Tab content */}
          <div className="flex-1 overflow-y-auto">{renderLeftContent()}</div>
        </div>

        {/* Canvas Area */}
        <div className="flex-1 overflow-auto bg-gray-100 flex items-start justify-center p-6">
          {!pdfUrl && !isPreview ? (
            // Empty / upload state
            <div
              className="w-full max-w-2xl"
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const file = e.dataTransfer.files[0];
                if (file) handlePdfUpload(file);
              }}
            >
              <div
                className="border-2 border-dashed border-violet-300 rounded-2xl bg-white p-16 flex flex-col items-center gap-4 hover:border-violet-500 hover:bg-violet-50/30 transition-colors"
                data-ocid="canvas.dropzone"
              >
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-700 flex items-center justify-center shadow-lg">
                  <Upload className="w-8 h-8 text-white" />
                </div>
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-foreground mb-1">
                    Upload PDF to Start Editing
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Drag &amp; drop your PDF here, or click to browse
                  </p>
                </div>
                <Button
                  className="bg-violet-600 hover:bg-violet-700 text-white"
                  data-ocid="canvas.upload_button"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Choose PDF File
                </Button>
                <p className="text-xs text-muted-foreground">
                  Or start with a blank canvas and add elements from the left
                  panel
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    setPdfUrl("blank");
                  }}
                  data-ocid="canvas.blank_canvas_button"
                >
                  Start with Blank Canvas
                </Button>
              </div>
            </div>
          ) : (
            // Canvas with PDF/blank + annotation layer
            <div
              className="relative bg-white shadow-2xl rounded-sm overflow-hidden"
              style={{
                width: `${(CANVAS_W * zoom) / 100}px`,
                height: `${(CANVAS_H * zoom) / 100}px`,
                transform: "none",
                cursor:
                  toolMode === "text"
                    ? "text"
                    : toolMode === "draw"
                      ? "crosshair"
                      : toolMode === "erase"
                        ? "not-allowed"
                        : "default",
              }}
              data-ocid="canvas.canvas_target"
            >
              {/* PDF iframe if real PDF, else blank */}
              {pdfUrl && pdfUrl !== "blank" ? (
                <iframe
                  src={pdfUrl}
                  title="PDF Preview"
                  className="absolute inset-0 w-full h-full border-0 pointer-events-none"
                  style={{ transform: "none" }}
                />
              ) : (
                <div className="absolute inset-0 bg-white" />
              )}

              {/* Annotation overlay */}
              {!isPreview && (
                <div
                  ref={canvasRef}
                  className="absolute inset-0"
                  style={{ cursor: "inherit" }}
                  onClick={handleCanvasClick}
                  onKeyDown={(e) => e.key === "Escape" && setSelectedId(null)}
                  aria-label="PDF canvas editing area"
                >
                  {elements.map((el) => (
                    <ElementRenderer
                      key={el.id}
                      el={el}
                      isSelected={selectedId === el.id}
                      onSelect={setSelectedId}
                      onUpdate={updateElementWithHistory}
                      onDelete={deleteElement}
                      canvasW={(CANVAS_W * zoom) / 100}
                      canvasH={(CANVAS_H * zoom) / 100}
                      toolMode={toolMode}
                    />
                  ))}
                </div>
              )}

              {/* Preview overlay */}
              {isPreview && (
                <div className="absolute inset-0">
                  {elements
                    .filter((e) => !e.hidden)
                    .map((el) => (
                      <ElementRenderer
                        key={el.id}
                        el={el}
                        isSelected={false}
                        onSelect={() => {}}
                        onUpdate={() => {}}
                        onDelete={() => {}}
                        canvasW={(CANVAS_W * zoom) / 100}
                        canvasH={(CANVAS_H * zoom) / 100}
                        toolMode="selection"
                      />
                    ))}
                </div>
              )}

              {/* Page indicator */}
              <div className="absolute bottom-2 right-2 bg-black/40 text-white text-xs px-2 py-0.5 rounded-full">
                Page {currentPage + 1} / {pages.length}
              </div>
            </div>
          )}
        </div>

        {/* Right Panel: Properties + AI */}
        <div className="flex flex-shrink-0">
          {showAIPanel && (
            <div className="w-64 border-l flex flex-col overflow-hidden">
              <AIPanel
                onClose={() => setShowAIPanel(false)}
                pdfText={pdfText}
                selectedElementText={selectedElement?.text}
              />
            </div>
          )}
          <div className="w-52 lg:w-60 border-l bg-card overflow-hidden flex flex-col">
            <PropertiesPanel
              element={selectedElement}
              onUpdate={updateElementWithHistory}
              onDelete={deleteElement}
              onBringForward={bringForward}
              onSendBack={sendBack}
              onAddSignature={() => {
                setSignatureModalTitle("Create Signature");
                setShowSignatureModal(true);
              }}
              onAddElement={(type, extra) => addElement(type, extra)}
            />
          </div>
        </div>
      </div>

      {/* Signature Modal */}
      <SignatureModal
        open={showSignatureModal}
        onClose={() => setShowSignatureModal(false)}
        title={signatureModalTitle}
        onInsert={(dataUrl, label) => {
          addElement("signature", {
            imageData: dataUrl,
            text: label,
            w: 28,
            h: 12,
            layerName: "Signature",
          });
          setShowSignatureModal(false);
          toast.success("Signature added to canvas");
        }}
      />

      {/* Status bar */}
      <div className="flex items-center gap-4 px-4 py-1 bg-card border-t text-xs text-muted-foreground flex-shrink-0">
        <span>
          Tool:{" "}
          <span className="font-medium text-foreground capitalize">
            {toolMode}
          </span>
        </span>
        <span>
          Elements:{" "}
          <span className="font-medium text-foreground">{elements.length}</span>
        </span>
        <span>
          Page:{" "}
          <span className="font-medium text-foreground">
            {currentPage + 1} / {pages.length}
          </span>
        </span>
        {selectedElement && (
          <span>
            Selected:{" "}
            <span className="font-medium text-violet-600 capitalize">
              {selectedElement.type}
            </span>
          </span>
        )}
        {pdfFile && (
          <span className="ml-auto truncate max-w-xs">📄 {pdfFile.name}</span>
        )}
      </div>
    </div>
  );
}
