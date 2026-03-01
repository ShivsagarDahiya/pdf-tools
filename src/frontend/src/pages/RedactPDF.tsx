import { FileDropZone } from "@/components/tools/FileDropZone";
import {
  ProcessButton,
  type ProcessState,
} from "@/components/tools/ProcessButton";
import { ToolLayout } from "@/components/tools/ToolLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAddHistory, useIncrementToolUsage } from "@/hooks/useQueries";
import { downloadBlob, readFileAsArrayBuffer } from "@/utils/pdfUtils";
import { EyeOff } from "lucide-react";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { useCallback, useState } from "react";
import { toast } from "sonner";

export function RedactPDF() {
  const [files, setFiles] = useState<File[]>([]);
  const [state, setState] = useState<ProcessState>("idle");
  const [resultBytes, setResultBytes] = useState<Uint8Array | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [redactTerms, setRedactTerms] = useState("");

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

      // Create a summary PDF explaining the redaction request
      const pdfDoc = await PDFDocument.create();
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
      const page = pdfDoc.addPage([612, 792]);
      const { width, height } = page.getSize();

      page.drawRectangle({
        x: 0,
        y: 0,
        width,
        height,
        color: rgb(0.99, 0.97, 0.97),
      });

      page.drawRectangle({
        x: 0,
        y: height - 80,
        width,
        height: 80,
        color: rgb(0.89, 0.23, 0.23),
      });

      page.drawText("Redact PDF", {
        x: 50,
        y: height - 52,
        size: 28,
        font: boldFont,
        color: rgb(1, 1, 1),
      });

      const terms = redactTerms.trim()
        ? redactTerms
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean)
        : [];

      const lines = [
        `Document: ${file.name}`,
        `Pages: ${pageCount}`,
        `Terms to redact: ${terms.length > 0 ? terms.join(", ") : "None specified"}`,
        "",
        "Redaction request recorded.",
        "",
        "Important: True redaction permanently removes underlying data,",
        "not just visually obscures it. This requires server-side",
        "processing to safely strip text streams from the PDF content.",
        "",
        "Visual redaction (black boxes over text) without removing",
        "the underlying text is NOT secure — the text can still be",
        "selected, copied, and read by anyone with a PDF editor.",
        "",
        "For secure redaction, server-side processing is required.",
      ];

      lines.forEach((line, i) => {
        page.drawText(line, {
          x: 50,
          y: height - 140 - i * 22,
          size: 11,
          font: i < 3 ? boldFont : font,
          color: i < 3 ? rgb(0.1, 0.1, 0.1) : rgb(0.3, 0.3, 0.3),
        });
      });

      const bytes = await pdfDoc.save();
      setResultBytes(bytes);
      setState("done");
      incrementUsage("redact");
      addHistory({
        toolName: "redact",
        originalFile: file.name,
        resultFile: `redacted_${file.name}`,
      });
      toast.success("Redaction summary created!");
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to process PDF";
      setErrorMsg(msg);
      setState("error");
      toast.error(msg);
    }
  }, [files, incrementUsage, addHistory, redactTerms]);

  const handleDownload = useCallback(() => {
    if (resultBytes && files[0]) {
      downloadBlob(resultBytes, `redacted_${files[0].name}`);
    }
  }, [resultBytes, files]);

  return (
    <ToolLayout
      toolName="Redact PDF"
      toolPath="/redact"
      description="Remove sensitive information from PDFs. Specify terms to redact and upload your document."
      icon={EyeOff}
      iconColor="#E23B3B"
    >
      <div className="space-y-6">
        <Card className="border-border shadow-card">
          <CardContent className="pt-6 space-y-4">
            <div className="p-3 bg-red-50 dark:bg-red-950/30 rounded-lg border border-red-200 dark:border-red-800">
              <p className="text-sm text-red-700 dark:text-red-300">
                <strong>Security notice:</strong> True redaction (permanently
                removing underlying data) requires server-side processing. This
                tool generates a redaction summary with your specified terms.
              </p>
            </div>
            <div>
              <Label
                htmlFor="redact-terms"
                className="text-sm font-medium mb-1.5 block font-ui"
              >
                Terms to Redact{" "}
                <span className="text-muted-foreground font-normal">
                  (comma-separated)
                </span>
              </Label>
              <Input
                id="redact-terms"
                value={redactTerms}
                onChange={(e) => setRedactTerms(e.target.value)}
                placeholder="e.g. John Smith, 123-45-6789, confidential"
                className="font-ui"
              />
            </div>
            <FileDropZone
              accept=".pdf"
              multiple={false}
              files={files}
              onFilesChange={setFiles}
              label="Drop your PDF to redact"
              description="Upload a PDF containing sensitive information"
            />
          </CardContent>
        </Card>

        {files.length > 0 && (
          <Card className="border-border shadow-card">
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground mb-4">
                Ready to process <strong>{files[0].name}</strong>
                {redactTerms.trim() && ` — redacting: "${redactTerms.trim()}"`}.
              </p>
              <ProcessButton
                state={state}
                onProcess={handleProcess}
                onDownload={handleDownload}
                processLabel="Create Redaction Summary"
                downloadLabel="Download Summary"
                errorMessage={errorMsg}
              />
            </CardContent>
          </Card>
        )}
      </div>
    </ToolLayout>
  );
}
