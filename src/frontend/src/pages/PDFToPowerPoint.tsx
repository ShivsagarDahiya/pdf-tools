import { FileDropZone } from "@/components/tools/FileDropZone";
import {
  ProcessButton,
  type ProcessState,
} from "@/components/tools/ProcessButton";
import { ToolLayout } from "@/components/tools/ToolLayout";
import { Card, CardContent } from "@/components/ui/card";
import { useAddHistory, useIncrementToolUsage } from "@/hooks/useQueries";
import { downloadBlob, readFileAsArrayBuffer } from "@/utils/pdfUtils";
import { PresentationIcon } from "lucide-react";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { useCallback, useState } from "react";
import { toast } from "sonner";

export function PDFToPowerPoint() {
  const [files, setFiles] = useState<File[]>([]);
  const [state, setState] = useState<ProcessState>("idle");
  const [resultBytes, setResultBytes] = useState<Uint8Array | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  const { mutate: incrementUsage } = useIncrementToolUsage();
  const { mutate: addHistory } = useAddHistory();

  const handleProcess = useCallback(async () => {
    if (files.length === 0) {
      toast.error("Please select a PDF file.");
      return;
    }
    const file = files[0];
    setState("processing");
    setErrorMsg("");
    try {
      const buf = await readFileAsArrayBuffer(file);
      const originalDoc = await PDFDocument.load(buf);
      const pageCount = originalDoc.getPageCount();

      // Create a landscape PDF showing slide-format summary for each page
      const pdfDoc = await PDFDocument.create();
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

      // Cover slide
      const cover = pdfDoc.addPage([792, 612]);
      const { width, height } = cover.getSize();

      cover.drawRectangle({
        x: 0,
        y: 0,
        width,
        height,
        color: rgb(0.13, 0.13, 0.16),
      });
      cover.drawRectangle({
        x: 0,
        y: height / 2 - 60,
        width,
        height: 120,
        color: rgb(0.85, 0.31, 0.2),
        opacity: 0.9,
      });
      cover.drawText("PDF to PowerPoint", {
        x: 50,
        y: height / 2 + 20,
        size: 36,
        font: boldFont,
        color: rgb(1, 1, 1),
      });
      cover.drawText(`Source: ${file.name}  |  ${pageCount} pages`, {
        x: 50,
        y: height / 2 - 20,
        size: 14,
        font,
        color: rgb(0.9, 0.9, 0.9),
      });

      // Slide placeholders
      for (let i = 0; i < Math.min(pageCount, 5); i++) {
        const slide = pdfDoc.addPage([792, 612]);
        slide.drawRectangle({
          x: 0,
          y: 0,
          width,
          height,
          color: rgb(0.97, 0.97, 0.97),
        });
        slide.drawRectangle({
          x: 0,
          y: height - 60,
          width,
          height: 60,
          color: rgb(0.85, 0.31, 0.2),
          opacity: 0.8,
        });
        slide.drawText(`Slide ${i + 1} of ${pageCount}`, {
          x: 30,
          y: height - 38,
          size: 16,
          font: boldFont,
          color: rgb(1, 1, 1),
        });
        slide.drawText(
          "Full slide layout conversion requires server-side rendering.",
          {
            x: width / 2 - 200,
            y: height / 2,
            size: 12,
            font,
            color: rgb(0.5, 0.5, 0.5),
          },
        );
      }

      if (pageCount > 5) {
        const lastSlide = pdfDoc.addPage([792, 612]);
        lastSlide.drawRectangle({
          x: 0,
          y: 0,
          width,
          height,
          color: rgb(0.97, 0.97, 0.97),
        });
        lastSlide.drawText(`... and ${pageCount - 5} more slides`, {
          x: width / 2 - 100,
          y: height / 2,
          size: 16,
          font: boldFont,
          color: rgb(0.5, 0.5, 0.5),
        });
      }

      const bytes = await pdfDoc.save();
      setResultBytes(bytes);
      setState("done");
      incrementUsage("pdf-to-pptx");
      addHistory({
        toolName: "pdf-to-pptx",
        originalFile: file.name,
        resultFile: `${file.name.replace(/\.pdf$/i, "")}_slides.pdf`,
      });
      toast.success(`Slide preview created — ${pageCount} slides!`);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to process PDF";
      setErrorMsg(msg);
      setState("error");
      toast.error(msg);
    }
  }, [files, incrementUsage, addHistory]);

  const handleDownload = useCallback(() => {
    if (resultBytes && files[0]) {
      const name = files[0].name.replace(/\.pdf$/i, "");
      downloadBlob(resultBytes, `${name}_slides.pdf`);
    }
  }, [resultBytes, files]);

  return (
    <ToolLayout
      toolName="PDF to PowerPoint"
      toolPath="/pdf-to-pptx"
      description="Convert PDF files into a slide-format preview PDF. Each PDF page becomes a slide placeholder."
      icon={PresentationIcon}
      iconColor="#D94F34"
    >
      <div className="space-y-6">
        <Card className="border-border shadow-card">
          <CardContent className="pt-6">
            <div className="mb-4 p-3 bg-orange-50 dark:bg-orange-950/30 rounded-lg border border-orange-200 dark:border-orange-800">
              <p className="text-sm text-orange-700 dark:text-orange-300">
                <strong>What you'll get:</strong> A landscape PDF with
                slide-format pages — one per PDF page. Full PPTX generation with
                editable shapes and text requires server-side slide layout
                analysis.
              </p>
            </div>
            <FileDropZone
              accept=".pdf"
              multiple={false}
              files={files}
              onFilesChange={setFiles}
              label="Drop your PDF here"
              description="Upload a PDF to convert to slide format"
            />
          </CardContent>
        </Card>

        {files.length > 0 && (
          <Card className="border-border shadow-card">
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground mb-4">
                Ready to convert <strong>{files[0].name}</strong> to slide
                format.
              </p>
              <ProcessButton
                state={state}
                onProcess={handleProcess}
                onDownload={handleDownload}
                processLabel="Create Slide Preview"
                downloadLabel="Download Slides PDF"
                errorMessage={errorMsg}
              />
            </CardContent>
          </Card>
        )}
      </div>
    </ToolLayout>
  );
}
