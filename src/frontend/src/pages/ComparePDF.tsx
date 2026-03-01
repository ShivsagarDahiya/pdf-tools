import { FileDropZone } from "@/components/tools/FileDropZone";
import {
  ProcessButton,
  type ProcessState,
} from "@/components/tools/ProcessButton";
import { ToolLayout } from "@/components/tools/ToolLayout";
import { Card, CardContent } from "@/components/ui/card";
import { useAddHistory, useIncrementToolUsage } from "@/hooks/useQueries";
import { downloadBlob, readFileAsArrayBuffer } from "@/utils/pdfUtils";
import { GitCompare } from "lucide-react";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { useCallback, useState } from "react";
import { toast } from "sonner";

export function ComparePDF() {
  const [filesA, setFilesA] = useState<File[]>([]);
  const [filesB, setFilesB] = useState<File[]>([]);
  const [state, setState] = useState<ProcessState>("idle");
  const [resultBytes, setResultBytes] = useState<Uint8Array | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  const { mutate: incrementUsage } = useIncrementToolUsage();
  const { mutate: addHistory } = useAddHistory();

  const handleProcess = useCallback(async () => {
    if (filesA.length === 0 || filesB.length === 0) {
      toast.error("Please select both PDF files to compare.");
      return;
    }
    const fileA = filesA[0];
    const fileB = filesB[0];
    setState("processing");
    setErrorMsg("");
    try {
      const [bufA, bufB] = await Promise.all([
        readFileAsArrayBuffer(fileA),
        readFileAsArrayBuffer(fileB),
      ]);

      const [docA, docB] = await Promise.all([
        PDFDocument.load(bufA),
        PDFDocument.load(bufB),
      ]);

      const pagesA = docA.getPageCount();
      const pagesB = docB.getPageCount();

      const pdfDoc = await PDFDocument.create();
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
      const page = pdfDoc.addPage([612, 792]);
      const { width, height } = page.getSize();

      // Background
      page.drawRectangle({
        x: 0,
        y: 0,
        width,
        height,
        color: rgb(0.97, 0.98, 1.0),
      });

      // Header
      page.drawRectangle({
        x: 0,
        y: height - 80,
        width,
        height: 80,
        color: rgb(0.23, 0.48, 0.89),
      });
      page.drawText("Compare PDF — Summary Report", {
        x: 50,
        y: height - 52,
        size: 22,
        font: boldFont,
        color: rgb(1, 1, 1),
      });

      // Two-column comparison
      const colW = (width - 100) / 2;
      const colGap = 20;

      // Column A header
      page.drawRectangle({
        x: 50,
        y: height - 160,
        width: colW,
        height: 50,
        color: rgb(0.23, 0.48, 0.89),
        opacity: 0.15,
      });
      page.drawText("Document A", {
        x: 60,
        y: height - 138,
        size: 12,
        font: boldFont,
        color: rgb(0.1, 0.2, 0.5),
      });

      // Column B header
      page.drawRectangle({
        x: 50 + colW + colGap,
        y: height - 160,
        width: colW,
        height: 50,
        color: rgb(0.55, 0.23, 0.89),
        opacity: 0.15,
      });
      page.drawText("Document B", {
        x: 60 + colW + colGap,
        y: height - 138,
        size: 12,
        font: boldFont,
        color: rgb(0.3, 0.1, 0.5),
      });

      // File info
      const truncA =
        fileA.name.length > 35 ? `${fileA.name.slice(0, 32)}...` : fileA.name;
      const truncB =
        fileB.name.length > 35 ? `${fileB.name.slice(0, 32)}...` : fileB.name;

      const colAInfo = [
        `Name: ${truncA}`,
        `Pages: ${pagesA}`,
        `Size: ${(fileA.size / 1024).toFixed(1)} KB`,
      ];
      const colBInfo = [
        `Name: ${truncB}`,
        `Pages: ${pagesB}`,
        `Size: ${(fileB.size / 1024).toFixed(1)} KB`,
      ];

      colAInfo.forEach((line, i) => {
        page.drawText(line, {
          x: 60,
          y: height - 185 - i * 18,
          size: 10,
          font,
          color: rgb(0.2, 0.2, 0.2),
        });
      });
      colBInfo.forEach((line, i) => {
        page.drawText(line, {
          x: 60 + colW + colGap,
          y: height - 185 - i * 18,
          size: 10,
          font,
          color: rgb(0.2, 0.2, 0.2),
        });
      });

      // Differences summary
      const diffY = height - 300;
      page.drawText("Comparison Summary", {
        x: 50,
        y: diffY,
        size: 14,
        font: boldFont,
        color: rgb(0.1, 0.1, 0.1),
      });

      const pageDiff = pagesA - pagesB;
      const summaryLines = [
        `Page count difference: ${Math.abs(pageDiff)} page${Math.abs(pageDiff) !== 1 ? "s" : ""} ${pageDiff > 0 ? "(A has more)" : pageDiff < 0 ? "(B has more)" : "(identical)"}`,
        `Size difference: ${Math.abs(fileA.size - fileB.size) > 1024 ? `${(Math.abs(fileA.size - fileB.size) / 1024).toFixed(1)} KB` : `${Math.abs(fileA.size - fileB.size)} bytes`}`,
        "",
        "Note: Deep semantic comparison (text diffs, image changes,",
        "structural differences with visual highlighting) requires",
        "server-side document parsing and diff analysis.",
      ];

      summaryLines.forEach((line, i) => {
        page.drawText(line, {
          x: 50,
          y: diffY - 30 - i * 20,
          size: 11,
          font: i < 2 ? boldFont : font,
          color: rgb(0.2, 0.2, 0.2),
        });
      });

      const bytes = await pdfDoc.save();
      setResultBytes(bytes);
      setState("done");
      incrementUsage("compare");
      addHistory({
        toolName: "compare",
        originalFile: `${fileA.name} vs ${fileB.name}`,
        resultFile: "comparison_report.pdf",
      });
      toast.success("Comparison report generated!");
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to compare PDFs";
      setErrorMsg(msg);
      setState("error");
      toast.error(msg);
    }
  }, [filesA, filesB, incrementUsage, addHistory]);

  const handleDownload = useCallback(() => {
    if (resultBytes) downloadBlob(resultBytes, "comparison_report.pdf");
  }, [resultBytes]);

  return (
    <ToolLayout
      toolName="Compare PDF"
      toolPath="/compare"
      description="Compare two PDF documents and get a summary report showing page counts, sizes, and structural differences."
      icon={GitCompare}
      iconColor="#3B7AE2"
    >
      <div className="space-y-6">
        <div className="grid md:grid-cols-2 gap-4">
          <Card className="border-border shadow-card">
            <CardContent className="pt-6">
              <p className="text-sm font-semibold text-foreground mb-3 font-ui">
                Document A
              </p>
              <FileDropZone
                accept=".pdf"
                multiple={false}
                files={filesA}
                onFilesChange={setFilesA}
                label="Drop first PDF"
                description="Original document"
              />
            </CardContent>
          </Card>
          <Card className="border-border shadow-card">
            <CardContent className="pt-6">
              <p className="text-sm font-semibold text-foreground mb-3 font-ui">
                Document B
              </p>
              <FileDropZone
                accept=".pdf"
                multiple={false}
                files={filesB}
                onFilesChange={setFilesB}
                label="Drop second PDF"
                description="Revised document"
              />
            </CardContent>
          </Card>
        </div>

        {filesA.length > 0 && filesB.length > 0 && (
          <Card className="border-border shadow-card">
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground mb-4">
                Ready to compare <strong>{filesA[0].name}</strong> with{" "}
                <strong>{filesB[0].name}</strong>.
              </p>
              <ProcessButton
                state={state}
                onProcess={handleProcess}
                onDownload={handleDownload}
                processLabel="Compare PDFs"
                downloadLabel="Download Report"
                disabled={filesA.length === 0 || filesB.length === 0}
                errorMessage={errorMsg}
              />
            </CardContent>
          </Card>
        )}
      </div>
    </ToolLayout>
  );
}
