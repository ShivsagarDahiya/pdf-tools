import { FileDropZone } from "@/components/tools/FileDropZone";
import {
  ProcessButton,
  type ProcessState,
} from "@/components/tools/ProcessButton";
import { ToolLayout } from "@/components/tools/ToolLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useAddHistory, useIncrementToolUsage } from "@/hooks/useQueries";
import { downloadBlob, readFileAsArrayBuffer } from "@/utils/pdfUtils";
import { RotateCw } from "lucide-react";
import { PDFDocument, degrees } from "pdf-lib";
import * as pdfjsLib from "pdfjs-dist";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

// Configure worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

function PageThumbnail({
  pdfBytes,
  pageIndex,
}: { pdfBytes: ArrayBuffer; pageIndex: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    let cancelled = false;
    async function render() {
      if (!canvasRef.current) return;
      try {
        const pdf = await pdfjsLib.getDocument({
          data: new Uint8Array(pdfBytes),
        }).promise;
        const page = await pdf.getPage(pageIndex + 1);
        const viewport = page.getViewport({ scale: 0.5 });
        const canvas = canvasRef.current;
        if (!canvas || cancelled) return;
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        await page.render({ canvas, viewport }).promise;
      } catch {
        // Ignore render errors
      }
    }
    render();
    return () => {
      cancelled = true;
    };
  }, [pdfBytes, pageIndex]);

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-auto rounded border border-border"
    />
  );
}

export function RotatePDF() {
  const [files, setFiles] = useState<File[]>([]);
  const [rotation, setRotation] = useState<"90" | "180" | "270">("90");
  const [pageCount, setPageCount] = useState<number | null>(null);
  const [pdfBytes, setPdfBytes] = useState<ArrayBuffer | null>(null);
  const [state, setState] = useState<ProcessState>("idle");
  const [resultBytes, setResultBytes] = useState<Uint8Array | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  const { mutate: incrementUsage } = useIncrementToolUsage();
  const { mutate: addHistory } = useAddHistory();

  const handleFilesChange = useCallback(async (newFiles: File[]) => {
    setFiles(newFiles);
    setState("idle");
    setResultBytes(null);
    if (newFiles.length > 0) {
      const buf = await readFileAsArrayBuffer(newFiles[0]);
      setPdfBytes(buf);
      const doc = await PDFDocument.load(buf);
      setPageCount(doc.getPageCount());
    } else {
      setPdfBytes(null);
      setPageCount(null);
    }
  }, []);

  const handleProcess = useCallback(async () => {
    if (!pdfBytes || files.length === 0) return;
    setState("processing");
    setErrorMsg("");
    try {
      const doc = await PDFDocument.load(pdfBytes);
      const deg = Number.parseInt(rotation, 10);
      for (const page of doc.getPages()) {
        page.setRotation(degrees(page.getRotation().angle + deg));
      }
      const bytes = await doc.save();
      setResultBytes(bytes);
      setState("done");
      incrementUsage("rotate");
      addHistory({
        toolName: "rotate",
        originalFile: files[0].name,
        resultFile: "rotated.pdf",
      });
      toast.success("PDF rotated successfully!");
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to rotate PDF";
      setErrorMsg(msg);
      setState("error");
      toast.error(msg);
    }
  }, [pdfBytes, files, rotation, incrementUsage, addHistory]);

  const handleDownload = useCallback(() => {
    if (resultBytes) downloadBlob(resultBytes, "rotated.pdf");
  }, [resultBytes]);

  return (
    <ToolLayout
      toolName="Rotate PDF"
      toolPath="/rotate"
      description="Rotate all pages of your PDF by 90, 180, or 270 degrees."
      icon={RotateCw}
      iconColor="#3B8CE2"
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
              description="Select the PDF you want to rotate"
            />
          </CardContent>
        </Card>

        {files.length > 0 && (
          <Card className="border-border shadow-card">
            <CardContent className="pt-6 space-y-6">
              {pdfBytes && pageCount !== null && pageCount > 0 && (
                <div>
                  <p className="text-sm text-muted-foreground mb-3">
                    First page preview:
                  </p>
                  <div className="w-32">
                    <PageThumbnail pdfBytes={pdfBytes} pageIndex={0} />
                  </div>
                </div>
              )}

              <div className="space-y-3">
                <Label>Rotation angle</Label>
                <ToggleGroup
                  type="single"
                  value={rotation}
                  onValueChange={(v) =>
                    v && setRotation(v as "90" | "180" | "270")
                  }
                  className="justify-start"
                >
                  <ToggleGroupItem value="90" className="font-ui">
                    90° →
                  </ToggleGroupItem>
                  <ToggleGroupItem value="180" className="font-ui">
                    180° ↓
                  </ToggleGroupItem>
                  <ToggleGroupItem value="270" className="font-ui">
                    270° ←
                  </ToggleGroupItem>
                </ToggleGroup>
              </div>

              <ProcessButton
                state={state}
                onProcess={handleProcess}
                onDownload={handleDownload}
                processLabel="Rotate PDF"
                downloadLabel="Download Rotated PDF"
                errorMessage={errorMsg}
              />
            </CardContent>
          </Card>
        )}
      </div>
    </ToolLayout>
  );
}
