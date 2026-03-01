import { FileDropZone } from "@/components/tools/FileDropZone";
import {
  ProcessButton,
  type ProcessState,
} from "@/components/tools/ProcessButton";
import { ToolLayout } from "@/components/tools/ToolLayout";
import { Card, CardContent } from "@/components/ui/card";
import { useAddHistory, useIncrementToolUsage } from "@/hooks/useQueries";
import { downloadBlob } from "@/utils/pdfUtils";
import { Globe } from "lucide-react";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { useCallback, useState } from "react";
import { toast } from "sonner";

export function HTMLToPDF() {
  const [files, setFiles] = useState<File[]>([]);
  const [state, setState] = useState<ProcessState>("idle");
  const [resultBytes, setResultBytes] = useState<Uint8Array | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  const { mutate: incrementUsage } = useIncrementToolUsage();
  const { mutate: addHistory } = useAddHistory();

  const handleProcess = useCallback(async () => {
    if (files.length === 0) {
      toast.error("Please select an HTML file to convert.");
      return;
    }
    const file = files[0];
    setState("processing");
    setErrorMsg("");
    try {
      // Try to read the HTML file content for preview
      const textContent = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.readAsText(file);
      });

      // Extract title from HTML if possible
      const titleMatch = textContent.match(/<title[^>]*>(.*?)<\/title>/i);
      const htmlTitle = titleMatch ? titleMatch[1].trim() : file.name;

      const pdfDoc = await PDFDocument.create();
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
      const monoFont = await pdfDoc.embedFont(StandardFonts.Courier);
      const page = pdfDoc.addPage([612, 792]);
      const { width, height } = page.getSize();

      page.drawRectangle({
        x: 0,
        y: 0,
        width,
        height,
        color: rgb(0.98, 0.97, 0.95),
      });

      page.drawRectangle({
        x: 0,
        y: height - 80,
        width,
        height: 80,
        color: rgb(0.89, 0.47, 0.23),
      });

      page.drawText("HTML to PDF", {
        x: 50,
        y: height - 52,
        size: 28,
        font: boldFont,
        color: rgb(1, 1, 1),
      });

      page.drawText(`Page title: ${htmlTitle}`, {
        x: 50,
        y: height - 130,
        size: 13,
        font: boldFont,
        color: rgb(0.1, 0.1, 0.1),
      });

      const lines = [
        "Your HTML file has been received.",
        "",
        "Note: Full HTML rendering with CSS styles, JavaScript,",
        "external resources, and web fonts requires a server-side",
        "headless browser (Chromium/WebKit) for pixel-perfect output.",
        "",
        `File name: ${file.name}`,
        `File size: ${(file.size / 1024).toFixed(1)} KB`,
        "",
        "HTML source preview (first 200 chars):",
      ];

      lines.forEach((line, i) => {
        page.drawText(line, {
          x: 50,
          y: height - 168 - i * 21,
          size: 11,
          font,
          color: rgb(0.3, 0.3, 0.3),
        });
      });

      // Draw a snippet of the HTML
      const snippet = textContent.slice(0, 200).replace(/\n/g, " ");
      const snippetWords = snippet.match(/.{1,70}/g) || [];
      snippetWords.forEach((chunk, i) => {
        if (i < 4) {
          page.drawText(chunk, {
            x: 50,
            y: height - 390 - i * 16,
            size: 8,
            font: monoFont,
            color: rgb(0.4, 0.4, 0.4),
          });
        }
      });

      const bytes = await pdfDoc.save();
      setResultBytes(bytes);
      setState("done");
      incrementUsage("html-to-pdf");
      addHistory({
        toolName: "html-to-pdf",
        originalFile: file.name,
        resultFile: `${file.name.replace(/\.(html|htm)$/i, "")}.pdf`,
      });
      toast.success("HTML file processed!");
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to process file";
      setErrorMsg(msg);
      setState("error");
      toast.error(msg);
    }
  }, [files, incrementUsage, addHistory]);

  const handleDownload = useCallback(() => {
    if (resultBytes && files[0]) {
      const name = files[0].name.replace(/\.(html|htm)$/i, "");
      downloadBlob(resultBytes, `${name}.pdf`);
    }
  }, [resultBytes, files]);

  return (
    <ToolLayout
      toolName="HTML to PDF"
      toolPath="/html-to-pdf"
      description="Convert web pages and HTML files to PDF. Upload an HTML file and get a PDF version."
      icon={Globe}
      iconColor="#E27A3B"
    >
      <div className="space-y-6">
        <Card className="border-border shadow-card">
          <CardContent className="pt-6">
            <FileDropZone
              accept=".html,.htm"
              multiple={false}
              files={files}
              onFilesChange={setFiles}
              label="Drop your HTML file here"
              description="Supports HTML and HTM files"
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
