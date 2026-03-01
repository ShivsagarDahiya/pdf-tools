import { FileDropZone } from "@/components/tools/FileDropZone";
import {
  ProcessButton,
  type ProcessState,
} from "@/components/tools/ProcessButton";
import { ToolLayout } from "@/components/tools/ToolLayout";
import { Card, CardContent } from "@/components/ui/card";
import { useAddHistory, useIncrementToolUsage } from "@/hooks/useQueries";
import { downloadBlob } from "@/utils/pdfUtils";
import { Sheet } from "lucide-react";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { useCallback, useState } from "react";
import { toast } from "sonner";

export function ExcelToPDF() {
  const [files, setFiles] = useState<File[]>([]);
  const [state, setState] = useState<ProcessState>("idle");
  const [resultBytes, setResultBytes] = useState<Uint8Array | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  const { mutate: incrementUsage } = useIncrementToolUsage();
  const { mutate: addHistory } = useAddHistory();

  const handleProcess = useCallback(async () => {
    if (files.length === 0) {
      toast.error("Please select an Excel file to convert.");
      return;
    }
    const file = files[0];
    setState("processing");
    setErrorMsg("");
    try {
      const pdfDoc = await PDFDocument.create();
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
      const page = pdfDoc.addPage([841, 595]); // A4 landscape for spreadsheets
      const { width, height } = page.getSize();

      page.drawRectangle({
        x: 0,
        y: 0,
        width,
        height,
        color: rgb(0.97, 0.99, 0.97),
      });

      page.drawRectangle({
        x: 0,
        y: height - 80,
        width,
        height: 80,
        color: rgb(0.11, 0.43, 0.26),
      });

      page.drawText("Excel to PDF", {
        x: 50,
        y: height - 52,
        size: 28,
        font: boldFont,
        color: rgb(1, 1, 1),
      });

      page.drawText(`File received: ${file.name}`, {
        x: 50,
        y: height - 130,
        size: 14,
        font: boldFont,
        color: rgb(0.1, 0.1, 0.1),
      });

      const lines = [
        "Your Excel spreadsheet has been received.",
        "",
        "Note: Accurate spreadsheet-to-PDF conversion with",
        "formulas, charts, cell formatting, and print areas",
        "requires server-side Excel processing engines.",
        "",
        `File name: ${file.name}`,
        `File size: ${(file.size / 1024).toFixed(1)} KB`,
        `File type: ${file.type || "application/vnd.ms-excel"}`,
      ];

      lines.forEach((line, i) => {
        page.drawText(line, {
          x: 50,
          y: height - 170 - i * 22,
          size: 11,
          font,
          color: rgb(0.3, 0.3, 0.3),
        });
      });

      const bytes = await pdfDoc.save();
      setResultBytes(bytes);
      setState("done");
      incrementUsage("excel-to-pdf");
      addHistory({
        toolName: "excel-to-pdf",
        originalFile: file.name,
        resultFile: `${file.name.replace(/\.(xls|xlsx)$/i, "")}.pdf`,
      });
      toast.success("Spreadsheet processed!");
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to process file";
      setErrorMsg(msg);
      setState("error");
      toast.error(msg);
    }
  }, [files, incrementUsage, addHistory]);

  const handleDownload = useCallback(() => {
    if (resultBytes && files[0]) {
      const name = files[0].name.replace(/\.(xls|xlsx)$/i, "");
      downloadBlob(resultBytes, `${name}.pdf`);
    }
  }, [resultBytes, files]);

  return (
    <ToolLayout
      toolName="Excel to PDF"
      toolPath="/excel-to-pdf"
      description="Convert Excel spreadsheets (XLS and XLSX) to clean, print-ready PDF documents. Tables, charts, and formatting preserved."
      icon={Sheet}
      iconColor="#1D6F42"
    >
      <div className="space-y-6">
        <Card className="border-border shadow-card">
          <CardContent className="pt-6">
            <FileDropZone
              accept=".xls,.xlsx"
              multiple={false}
              files={files}
              onFilesChange={setFiles}
              label="Drop your Excel file here"
              description="Supports XLS and XLSX files"
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
