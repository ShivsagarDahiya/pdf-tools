import { FileDropZone } from "@/components/tools/FileDropZone";
import {
  ProcessButton,
  type ProcessState,
} from "@/components/tools/ProcessButton";
import { ToolLayout } from "@/components/tools/ToolLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAddHistory, useIncrementToolUsage } from "@/hooks/useQueries";
import { downloadBlob, readFileAsArrayBuffer } from "@/utils/pdfUtils";
import { GripVertical, LayoutGrid, X } from "lucide-react";
import { AnimatePresence, Reorder, motion } from "motion/react";
import { PDFDocument } from "pdf-lib";
import * as pdfjsLib from "pdfjs-dist";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

interface PageItem {
  id: string;
  originalIndex: number;
  dataUrl: string;
}

export function OrganizePDF() {
  const [files, setFiles] = useState<File[]>([]);
  const [pages, setPages] = useState<PageItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [state, setState] = useState<ProcessState>("idle");
  const [resultBytes, setResultBytes] = useState<Uint8Array | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const srcBytesRef = useRef<ArrayBuffer | null>(null);

  const { mutate: incrementUsage } = useIncrementToolUsage();
  const { mutate: addHistory } = useAddHistory();

  const handleFilesChange = useCallback(async (newFiles: File[]) => {
    setFiles(newFiles);
    setState("idle");
    setPages([]);
    setResultBytes(null);

    if (newFiles.length === 0) return;
    setLoading(true);
    try {
      const buf = await readFileAsArrayBuffer(newFiles[0]);
      srcBytesRef.current = buf;
      const pdf = await pdfjsLib.getDocument({ data: new Uint8Array(buf) })
        .promise;
      const total = pdf.numPages;
      const items: PageItem[] = [];

      for (let i = 1; i <= total; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 0.7 });
        const canvas = document.createElement("canvas");
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        await page.render({ canvas, viewport }).promise;
        items.push({
          id: `page-${i}`,
          originalIndex: i - 1,
          dataUrl: canvas.toDataURL("image/jpeg", 0.8),
        });
      }
      setPages(items);
    } catch (_e) {
      toast.error("Failed to load PDF pages");
    } finally {
      setLoading(false);
    }
  }, []);

  const removePage = useCallback((id: string) => {
    setPages((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const handleProcess = useCallback(async () => {
    if (!srcBytesRef.current || pages.length === 0) return;
    setState("processing");
    setErrorMsg("");
    try {
      const srcDoc = await PDFDocument.load(srcBytesRef.current);
      const newDoc = await PDFDocument.create();
      const indices = pages.map((p) => p.originalIndex);
      const copied = await newDoc.copyPages(srcDoc, indices);
      for (const page of copied) newDoc.addPage(page);

      const bytes = await newDoc.save();
      setResultBytes(bytes);
      setState("done");
      incrementUsage("organize");
      addHistory({
        toolName: "organize",
        originalFile: files[0].name,
        resultFile: "organized.pdf",
      });
      toast.success("PDF organized successfully!");
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to organize PDF";
      setErrorMsg(msg);
      setState("error");
      toast.error(msg);
    }
  }, [pages, files, incrementUsage, addHistory]);

  const handleDownload = useCallback(() => {
    if (resultBytes) downloadBlob(resultBytes, "organized.pdf");
  }, [resultBytes]);

  return (
    <ToolLayout
      toolName="Organize PDF"
      toolPath="/organize"
      description="Reorder, delete, or rearrange pages in your PDF document."
      icon={LayoutGrid}
      iconColor="#3BC4E2"
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
              description="Select the PDF to organize"
            />
          </CardContent>
        </Card>

        {loading && (
          <div className="text-center py-8 text-muted-foreground">
            Loading page previews…
          </div>
        )}

        {pages.length > 0 && (
          <Card className="border-border shadow-card">
            <CardContent className="pt-6 space-y-6">
              <p className="text-sm text-muted-foreground">
                Drag pages to reorder. Click × to remove a page. {pages.length}{" "}
                page{pages.length !== 1 ? "s" : ""} remaining.
              </p>

              <Reorder.Group
                axis="x"
                values={pages}
                onReorder={setPages}
                className="flex flex-wrap gap-4"
              >
                <AnimatePresence>
                  {pages.map((page) => (
                    <Reorder.Item
                      key={page.id}
                      value={page}
                      className="relative cursor-grab active:cursor-grabbing select-none"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      whileDrag={{ scale: 1.05, zIndex: 10 }}
                    >
                      <div className="w-28 sm:w-32 border border-border rounded-lg overflow-hidden bg-card shadow-xs group hover:shadow-card transition-shadow">
                        <div className="relative">
                          <img
                            src={page.dataUrl}
                            alt={`Page ${page.originalIndex + 1}`}
                            className="w-full h-auto"
                          />
                          <button
                            type="button"
                            onClick={() => removePage(page.id)}
                            className="absolute top-1 right-1 w-5 h-5 rounded-full bg-destructive text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:scale-110"
                            aria-label={`Remove page ${page.originalIndex + 1}`}
                          >
                            <X className="w-3 h-3" />
                          </button>
                          <div className="absolute top-1 left-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <GripVertical className="w-4 h-4 text-white drop-shadow" />
                          </div>
                        </div>
                        <p className="text-center text-xs text-muted-foreground py-1 font-ui">
                          {page.originalIndex + 1}
                        </p>
                      </div>
                    </Reorder.Item>
                  ))}
                </AnimatePresence>
              </Reorder.Group>

              <ProcessButton
                state={state}
                onProcess={handleProcess}
                onDownload={handleDownload}
                processLabel="Apply Changes"
                downloadLabel="Download Organized PDF"
                disabled={pages.length === 0}
                errorMessage={errorMsg}
              />
            </CardContent>
          </Card>
        )}
      </div>
    </ToolLayout>
  );
}
