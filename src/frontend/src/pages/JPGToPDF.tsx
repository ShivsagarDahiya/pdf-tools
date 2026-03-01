import { FileDropZone } from "@/components/tools/FileDropZone";
import {
  ProcessButton,
  type ProcessState,
} from "@/components/tools/ProcessButton";
import { ToolLayout } from "@/components/tools/ToolLayout";
import { Card, CardContent } from "@/components/ui/card";
import { useAddHistory, useIncrementToolUsage } from "@/hooks/useQueries";
import { downloadBlob, readFileAsArrayBuffer } from "@/utils/pdfUtils";
import { Image } from "lucide-react";
import { PDFDocument, type PDFImage } from "pdf-lib";
import { useCallback, useState } from "react";
import { toast } from "sonner";

export function JPGToPDF() {
  const [files, setFiles] = useState<File[]>([]);
  const [state, setState] = useState<ProcessState>("idle");
  const [resultBytes, setResultBytes] = useState<Uint8Array | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  const { mutate: incrementUsage } = useIncrementToolUsage();
  const { mutate: addHistory } = useAddHistory();

  const handleProcess = useCallback(async () => {
    if (files.length === 0) return;
    setState("processing");
    setErrorMsg("");
    try {
      const doc = await PDFDocument.create();

      for (const file of files) {
        const buf = await readFileAsArrayBuffer(file);
        const bytes = new Uint8Array(buf);
        const isJpeg =
          file.type === "image/jpeg" ||
          file.name.toLowerCase().endsWith(".jpg") ||
          file.name.toLowerCase().endsWith(".jpeg");
        const isPng =
          file.type === "image/png" || file.name.toLowerCase().endsWith(".png");

        let image: PDFImage;
        if (isJpeg) {
          image = await doc.embedJpg(bytes);
        } else if (isPng) {
          image = await doc.embedPng(bytes);
        } else {
          // Try jpeg as fallback
          image = await doc.embedJpg(bytes);
        }

        const { width, height } = image.size();
        const page = doc.addPage([width, height]);
        page.drawImage(image, { x: 0, y: 0, width, height });
      }

      const bytes = await doc.save();
      setResultBytes(bytes);
      setState("done");
      incrementUsage("jpg-to-pdf");
      addHistory({
        toolName: "jpg-to-pdf",
        originalFile: files.map((f) => f.name).join(", "),
        resultFile: "images.pdf",
      });
      toast.success("Images converted to PDF successfully!");
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to convert images";
      setErrorMsg(msg);
      setState("error");
      toast.error(msg);
    }
  }, [files, incrementUsage, addHistory]);

  const handleDownload = useCallback(() => {
    if (resultBytes) downloadBlob(resultBytes, "images.pdf");
  }, [resultBytes]);

  return (
    <ToolLayout
      toolName="JPG to PDF"
      toolPath="/jpg-to-pdf"
      description="Convert one or more images (JPG, PNG) into a single PDF document."
      icon={Image}
      iconColor="#3BE28A"
    >
      <div className="space-y-6">
        <Card className="border-border shadow-card">
          <CardContent className="pt-6">
            <FileDropZone
              accept="image/jpeg,image/jpg,image/png,.jpg,.jpeg,.png"
              multiple={true}
              files={files}
              onFilesChange={setFiles}
              label="Drop your images here"
              description="Select JPG or PNG images to combine into a PDF"
            />
          </CardContent>
        </Card>

        {files.length > 0 && (
          <Card className="border-border shadow-card">
            <CardContent className="pt-6 space-y-4">
              <p className="text-sm text-muted-foreground">
                {files.length} {files.length === 1 ? "image" : "images"}{" "}
                selected — each will become one page.
              </p>
              <ProcessButton
                state={state}
                onProcess={handleProcess}
                onDownload={handleDownload}
                processLabel="Convert to PDF"
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
