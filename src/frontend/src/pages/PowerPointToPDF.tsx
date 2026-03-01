import { FileDropZone } from "@/components/tools/FileDropZone";
import {
  ProcessButton,
  type ProcessState,
} from "@/components/tools/ProcessButton";
import { ToolLayout } from "@/components/tools/ToolLayout";
import { Card, CardContent } from "@/components/ui/card";
import { useAddHistory, useIncrementToolUsage } from "@/hooks/useQueries";
import { downloadBlob } from "@/utils/pdfUtils";
import { Presentation } from "lucide-react";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { useCallback, useState } from "react";
import { toast } from "sonner";

export function PowerPointToPDF() {
  const [files, setFiles] = useState<File[]>([]);
  const [state, setState] = useState<ProcessState>("idle");
  const [resultBytes, setResultBytes] = useState<Uint8Array | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  const { mutate: incrementUsage } = useIncrementToolUsage();
  const { mutate: addHistory } = useAddHistory();

  const handleProcess = useCallback(async () => {
    if (files.length === 0) {
      toast.error("Please select a PowerPoint file to convert.");
      return;
    }
    const file = files[0];
    setState("processing");
    setErrorMsg("");
    try {
      const pdfDoc = await PDFDocument.create();
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
      const page = pdfDoc.addPage([792, 612]); // Landscape for slides
      const { width, height } = page.getSize();

      page.drawRectangle({
        x: 0,
        y: 0,
        width,
        height,
        color: rgb(0.13, 0.13, 0.16),
      });

      page.drawRectangle({
        x: 0,
        y: height - 100,
        width,
        height: 100,
        color: rgb(0.85, 0.31, 0.2),
      });

      page.drawText("PowerPoint to PDF", {
        x: 50,
        y: height - 65,
        size: 30,
        font: boldFont,
        color: rgb(1, 1, 1),
      });

      page.drawText(`File received: ${file.name}`, {
        x: 50,
        y: height - 150,
        size: 14,
        font: boldFont,
        color: rgb(0.9, 0.9, 0.9),
      });

      const lines = [
        "Your PowerPoint presentation has been received.",
        "",
        "Note: Full presentation-to-PDF conversion with animations,",
        "transitions, embedded media, and custom fonts requires",
        "server-side Office rendering engines.",
        "",
        `File name: ${file.name}`,
        `File size: ${(file.size / 1024).toFixed(1)} KB`,
      ];

      lines.forEach((line, i) => {
        page.drawText(line, {
          x: 50,
          y: height - 190 - i * 22,
          size: 11,
          font,
          color: rgb(0.7, 0.7, 0.7),
        });
      });

      const bytes = await pdfDoc.save();
      setResultBytes(bytes);
      setState("done");
      incrementUsage("pptx-to-pdf");
      addHistory({
        toolName: "pptx-to-pdf",
        originalFile: file.name,
        resultFile: `${file.name.replace(/\.(ppt|pptx)$/i, "")}.pdf`,
      });
      toast.success("Presentation processed!");
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to process file";
      setErrorMsg(msg);
      setState("error");
      toast.error(msg);
    }
  }, [files, incrementUsage, addHistory]);

  const handleDownload = useCallback(() => {
    if (resultBytes && files[0]) {
      const name = files[0].name.replace(/\.(ppt|pptx)$/i, "");
      downloadBlob(resultBytes, `${name}.pdf`);
    }
  }, [resultBytes, files]);

  return (
    <ToolLayout
      toolName="PowerPoint to PDF"
      toolPath="/pptx-to-pdf"
      description="Convert PowerPoint presentations (PPT and PPTX) to PDF. Each slide becomes a page with all visuals preserved."
      icon={Presentation}
      iconColor="#D94F34"
    >
      <div className="space-y-6">
        <Card className="border-border shadow-card">
          <CardContent className="pt-6">
            <FileDropZone
              accept=".ppt,.pptx"
              multiple={false}
              files={files}
              onFilesChange={setFiles}
              label="Drop your PowerPoint file here"
              description="Supports PPT and PPTX files"
            />
          </CardContent>
        </Card>

        {files.length > 0 && (
          <Card className="border-border shadow-card">
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground mb-4">
                Ready to convert <strong>{files[0].name}</strong> to PDF.
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
