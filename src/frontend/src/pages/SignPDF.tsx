import { FileDropZone } from "@/components/tools/FileDropZone";
import {
  ProcessButton,
  type ProcessState,
} from "@/components/tools/ProcessButton";
import { ToolLayout } from "@/components/tools/ToolLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { useAddHistory, useIncrementToolUsage } from "@/hooks/useQueries";
import { downloadBlob, readFileAsArrayBuffer } from "@/utils/pdfUtils";
import { PenSquare, RotateCcw } from "lucide-react";
import { PDFDocument } from "pdf-lib";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

export function SignPDF() {
  const [files, setFiles] = useState<File[]>([]);
  const [state, setState] = useState<ProcessState>("idle");
  const [resultBytes, setResultBytes] = useState<Uint8Array | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);
  const [sigScale, setSigScale] = useState([30]);
  const [sigPage, setSigPage] = useState(1);
  const [pageCount, setPageCount] = useState(1);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const lastPosRef = useRef<{ x: number; y: number } | null>(null);

  const { mutate: incrementUsage } = useIncrementToolUsage();
  const { mutate: addHistory } = useAddHistory();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }, []);

  const handleFilesChange = useCallback(async (newFiles: File[]) => {
    setFiles(newFiles);
    if (newFiles.length === 0) return;
    try {
      const buf = await readFileAsArrayBuffer(newFiles[0]);
      const doc = await PDFDocument.load(buf, { ignoreEncryption: true });
      setPageCount(doc.getPageCount());
      setSigPage(1);
    } catch {
      // ignore
    }
  }, []);

  const getPos = useCallback(
    (e: React.MouseEvent | React.TouchEvent, canvas: HTMLCanvasElement) => {
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      if ("touches" in e) {
        const t = e.touches[0];
        return {
          x: (t.clientX - rect.left) * scaleX,
          y: (t.clientY - rect.top) * scaleY,
        };
      }
      return {
        x: (e.clientX - rect.left) * scaleX,
        y: (e.clientY - rect.top) * scaleY,
      };
    },
    [],
  );

  const startDraw = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      e.preventDefault();
      setIsDrawing(true);
      lastPosRef.current = getPos(e, canvas);
    },
    [getPos],
  );

  const draw = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      if (!isDrawing) return;
      const canvas = canvasRef.current;
      if (!canvas) return;
      e.preventDefault();
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      const pos = getPos(e, canvas);
      const last = lastPosRef.current;
      if (!last) return;
      ctx.beginPath();
      ctx.moveTo(last.x, last.y);
      ctx.lineTo(pos.x, pos.y);
      ctx.strokeStyle = "#1a1a2e";
      ctx.lineWidth = 3;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.stroke();
      lastPosRef.current = pos;
      setHasSignature(true);
    },
    [isDrawing, getPos],
  );

  const endDraw = useCallback(() => {
    setIsDrawing(false);
    lastPosRef.current = null;
  }, []);

  const clearSignature = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
  }, []);

  const handleProcess = useCallback(async () => {
    if (files.length === 0) return;
    if (!hasSignature) {
      toast.error("Please draw your signature first.");
      return;
    }
    setState("processing");
    setErrorMsg("");
    try {
      const canvas = canvasRef.current;
      if (!canvas) throw new Error("Canvas not available");

      const sigDataUrl = canvas.toDataURL("image/png");
      const base64 = sigDataUrl.split(",")[1];
      const sigBytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));

      const file = files[0];
      const buf = await readFileAsArrayBuffer(file);
      const doc = await PDFDocument.load(buf, { ignoreEncryption: true });
      const sigImage = await doc.embedPng(sigBytes);

      const pages = doc.getPages();
      const targetPage = pages[Math.min(sigPage - 1, pages.length - 1)];
      const { width } = targetPage.getSize();

      const scale = sigScale[0] / 100;
      const sigW = width * scale;
      const sigH = (sigW * canvas.height) / canvas.width;

      // Place bottom-right corner
      targetPage.drawImage(sigImage, {
        x: width - sigW - 30,
        y: 30,
        width: sigW,
        height: sigH,
        opacity: 0.95,
      });

      const bytes = await doc.save();
      setResultBytes(bytes);
      setState("done");
      incrementUsage("sign");
      addHistory({
        toolName: "sign",
        originalFile: file.name,
        resultFile: "signed.pdf",
      });
      toast.success("Signature stamped onto your PDF!");
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to sign PDF";
      setErrorMsg(msg);
      setState("error");
      toast.error(msg);
    }
  }, [files, hasSignature, sigPage, sigScale, incrementUsage, addHistory]);

  const handleDownload = useCallback(() => {
    if (resultBytes) downloadBlob(resultBytes, "signed.pdf");
  }, [resultBytes]);

  return (
    <ToolLayout
      toolName="Sign PDF"
      toolPath="/sign"
      description="Draw your signature and stamp it onto your PDF document."
      icon={PenSquare}
      iconColor="#2DBD6E"
    >
      <div className="space-y-6">
        <Card className="border-border shadow-card">
          <CardContent className="pt-6">
            <FileDropZone
              accept=".pdf"
              multiple={false}
              files={files}
              onFilesChange={handleFilesChange}
              label="Drop your PDF here"
              description="Select the PDF you want to sign"
            />
          </CardContent>
        </Card>

        <Card className="border-border shadow-card">
          <CardContent className="pt-6 space-y-4">
            <div className="flex items-center justify-between">
              <Label className="font-ui font-medium">Draw your signature</Label>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearSignature}
                className="text-muted-foreground hover:text-destructive font-ui text-xs"
              >
                <RotateCcw className="w-3.5 h-3.5 mr-1" />
                Clear
              </Button>
            </div>
            <div className="border-2 border-border rounded-xl overflow-hidden bg-white cursor-crosshair touch-none">
              <canvas
                ref={canvasRef}
                width={600}
                height={180}
                className="w-full"
                style={{ touchAction: "none" }}
                onMouseDown={startDraw}
                onMouseMove={draw}
                onMouseUp={endDraw}
                onMouseLeave={endDraw}
                onTouchStart={startDraw}
                onTouchMove={draw}
                onTouchEnd={endDraw}
              />
            </div>
            {!hasSignature && (
              <p className="text-xs text-muted-foreground text-center">
                Draw your signature in the box above
              </p>
            )}
          </CardContent>
        </Card>

        {files.length > 0 && (
          <Card className="border-border shadow-card">
            <CardContent className="pt-6 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="font-ui font-medium text-sm">
                    Signature size: {sigScale[0]}%
                  </Label>
                  <Slider
                    min={10}
                    max={60}
                    step={5}
                    value={sigScale}
                    onValueChange={setSigScale}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="font-ui font-medium text-sm">
                    Apply to page: {sigPage} / {pageCount}
                  </Label>
                  <Slider
                    min={1}
                    max={pageCount}
                    step={1}
                    value={[sigPage]}
                    onValueChange={(v) => setSigPage(v[0])}
                  />
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Signature will be placed in the bottom-right corner of page{" "}
                {sigPage}.
              </p>
              <ProcessButton
                state={state}
                onProcess={handleProcess}
                onDownload={handleDownload}
                processLabel="Apply Signature"
                downloadLabel="Download Signed PDF"
                disabled={!hasSignature}
                errorMessage={errorMsg}
              />
            </CardContent>
          </Card>
        )}
      </div>
    </ToolLayout>
  );
}
