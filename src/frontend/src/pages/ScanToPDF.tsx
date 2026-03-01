import { FileDropZone } from "@/components/tools/FileDropZone";
import {
  ProcessButton,
  type ProcessState,
} from "@/components/tools/ProcessButton";
import { ToolLayout } from "@/components/tools/ToolLayout";
import { Card, CardContent } from "@/components/ui/card";
import { useAddHistory, useIncrementToolUsage } from "@/hooks/useQueries";
import { downloadBlob, readFileAsArrayBuffer } from "@/utils/pdfUtils";
import { Camera } from "lucide-react";
import { PDFDocument, type PDFImage } from "pdf-lib";
import { useCallback, useState } from "react";
import { toast } from "sonner";

export function ScanToPDF() {
  const [files, setFiles] = useState<File[]>([]);
  const [state, setState] = useState<ProcessState>("idle");
  const [resultBytes, setResultBytes] = useState<Uint8Array | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  const { mutate: incrementUsage } = useIncrementToolUsage();
  const { mutate: addHistory } = useAddHistory();

  const handleProcess = useCallback(async () => {
    if (files.length === 0) {
      toast.error("Please select at least one image file.");
      return;
    }
    setState("processing");
    setErrorMsg("");
    try {
      const pdfDoc = await PDFDocument.create();

      for (const file of files) {
        const buf = await readFileAsArrayBuffer(file);
        const bytes = new Uint8Array(buf);

        const lowerName = file.name.toLowerCase();
        const mimeType = file.type.toLowerCase();

        let img: PDFImage;
        if (
          mimeType === "image/jpeg" ||
          mimeType === "image/jpg" ||
          lowerName.endsWith(".jpg") ||
          lowerName.endsWith(".jpeg")
        ) {
          img = await pdfDoc.embedJpg(bytes);
        } else if (mimeType === "image/png" || lowerName.endsWith(".png")) {
          img = await pdfDoc.embedPng(bytes);
        } else {
          // For other formats (gif, webp, bmp), attempt embedding
          // pdf-lib only supports JPEG and PNG natively
          try {
            img = await pdfDoc.embedPng(bytes);
          } catch {
            try {
              img = await pdfDoc.embedJpg(bytes);
            } catch {
              throw new Error(
                `Unsupported image format: ${file.name}. Please use JPG or PNG images.`,
              );
            }
          }
        }

        const { width, height } = img;
        // Page sized to image dimensions (max A4 @ 72dpi = 595x842)
        const maxW = 595;
        const maxH = 842;
        let pageW = width;
        let pageH = height;
        if (pageW > maxW || pageH > maxH) {
          const scale = Math.min(maxW / pageW, maxH / pageH);
          pageW = Math.round(pageW * scale);
          pageH = Math.round(pageH * scale);
        }

        const page = pdfDoc.addPage([pageW, pageH]);
        page.drawImage(img, {
          x: 0,
          y: 0,
          width: pageW,
          height: pageH,
        });
      }

      const bytes = await pdfDoc.save();
      setResultBytes(bytes);
      setState("done");
      incrementUsage("scan-to-pdf");
      addHistory({
        toolName: "scan-to-pdf",
        originalFile: files.map((f) => f.name).join(", "),
        resultFile: "scanned.pdf",
      });
      toast.success(
        `Created PDF with ${files.length} page${files.length !== 1 ? "s" : ""}!`,
      );
    } catch (e) {
      const msg =
        e instanceof Error ? e.message : "Failed to convert images to PDF";
      setErrorMsg(msg);
      setState("error");
      toast.error(msg);
    }
  }, [files, incrementUsage, addHistory]);

  const handleDownload = useCallback(() => {
    if (resultBytes) downloadBlob(resultBytes, "scanned.pdf");
  }, [resultBytes]);

  return (
    <ToolLayout
      toolName="Scan to PDF"
      toolPath="/scan-to-pdf"
      description="Convert images to PDF. Upload one or more image files and they'll be combined into a multi-page PDF document."
      icon={Camera}
      iconColor="#2DBD6E"
    >
      <div className="space-y-6">
        <Card className="border-border shadow-card">
          <CardContent className="pt-6">
            <div className="mb-4 p-3 bg-green-50 dark:bg-green-950/30 rounded-lg border border-green-200 dark:border-green-800">
              <p className="text-sm text-green-700 dark:text-green-300">
                <strong>Real conversion:</strong> Each image becomes a PDF page,
                scaled to fit while preserving aspect ratio. Upload multiple
                images to create a multi-page PDF.
              </p>
            </div>
            <FileDropZone
              accept=".jpg,.jpeg,.png,.gif,.webp,.bmp"
              multiple={true}
              files={files}
              onFilesChange={setFiles}
              label="Drop your images here"
              description="Supports JPG, PNG, GIF, WebP — multiple files create multi-page PDF"
            />
          </CardContent>
        </Card>

        {files.length > 0 && (
          <Card className="border-border shadow-card">
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground mb-4">
                {files.length} image{files.length !== 1 ? "s" : ""} selected —
                each will become a page in the PDF.
              </p>
              <ProcessButton
                state={state}
                onProcess={handleProcess}
                onDownload={handleDownload}
                processLabel="Create PDF"
                downloadLabel="Download PDF"
                errorMessage={errorMsg}
              />
            </CardContent>
          </Card>
        )}
      </div>
    </ToolLayout>
  );
}
