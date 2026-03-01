import { FileDropZone } from "@/components/tools/FileDropZone";
import {
  ProcessButton,
  type ProcessState,
} from "@/components/tools/ProcessButton";
import { ToolLayout } from "@/components/tools/ToolLayout";
import { Card, CardContent } from "@/components/ui/card";
import { useAddHistory, useIncrementToolUsage } from "@/hooks/useQueries";
import { downloadBlob, readFileAsArrayBuffer } from "@/utils/pdfUtils";
import { TableProperties } from "lucide-react";
import { PDFDocument } from "pdf-lib";
import { useCallback, useState } from "react";
import { toast } from "sonner";

export function PDFToExcel() {
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
      const pdfDoc = await PDFDocument.load(buf);
      const pageCount = pdfDoc.getPageCount();

      // Generate a CSV-like text file with metadata
      const csvContent = [
        `"Field","Value"`,
        `"Source File","${file.name}"`,
        `"Page Count","${pageCount}"`,
        `"File Size","${(file.size / 1024).toFixed(1)} KB"`,
        `"Title","${pdfDoc.getTitle() || ""}"`,
        `"Author","${pdfDoc.getAuthor() || ""}"`,
        `"Subject","${pdfDoc.getSubject() || ""}"`,
        `"Creator","${pdfDoc.getCreator() || ""}"`,
        `"Producer","${pdfDoc.getProducer() || ""}"`,
        `"Creation Date","${pdfDoc.getCreationDate()?.toLocaleDateString() || ""}"`,
        `"Modified Date","${pdfDoc.getModificationDate()?.toLocaleDateString() || ""}"`,
        "",
        `"Note","Full PDF-to-Excel table extraction requires server-side AI parsing."`,
        `"Note","Table structures images and complex layouts cannot be parsed client-side."`,
        "",
        `"Page","Width (pts)","Height (pts)"`,
        ...pdfDoc.getPages().map((p, i) => {
          const { width, height } = p.getSize();
          return `"${i + 1}","${width.toFixed(0)}","${height.toFixed(0)}"`;
        }),
      ].join("\n");

      const encoder = new TextEncoder();
      const textBytes = encoder.encode(csvContent);
      setResultBytes(textBytes);
      setState("done");
      incrementUsage("pdf-to-excel");
      addHistory({
        toolName: "pdf-to-excel",
        originalFile: file.name,
        resultFile: `${file.name.replace(/\.pdf$/i, "")}.csv`,
      });
      toast.success("PDF metadata exported as CSV!");
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
      downloadBlob(resultBytes, `${name}.csv`, "text/csv;charset=utf-8");
    }
  }, [resultBytes, files]);

  return (
    <ToolLayout
      toolName="PDF to Excel"
      toolPath="/pdf-to-excel"
      description="Extract PDF metadata and page dimensions as a CSV file. For full table extraction, server-side processing is required."
      icon={TableProperties}
      iconColor="#1D6F42"
    >
      <div className="space-y-6">
        <Card className="border-border shadow-card">
          <CardContent className="pt-6">
            <div className="mb-4 p-3 bg-green-50 dark:bg-green-950/30 rounded-lg border border-green-200 dark:border-green-800">
              <p className="text-sm text-green-700 dark:text-green-300">
                <strong>What you'll get:</strong> A .csv file with PDF metadata
                and page dimensions that can be opened in Excel. Full table data
                extraction from PDF content requires server-side AI parsing.
              </p>
            </div>
            <FileDropZone
              accept=".pdf"
              multiple={false}
              files={files}
              onFilesChange={setFiles}
              label="Drop your PDF here"
              description="Upload a PDF to extract data as CSV"
            />
          </CardContent>
        </Card>

        {files.length > 0 && (
          <Card className="border-border shadow-card">
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground mb-4">
                Ready to extract data from <strong>{files[0].name}</strong>.
              </p>
              <ProcessButton
                state={state}
                onProcess={handleProcess}
                onDownload={handleDownload}
                processLabel="Extract to CSV"
                downloadLabel="Download .csv File"
                errorMessage={errorMsg}
              />
            </CardContent>
          </Card>
        )}
      </div>
    </ToolLayout>
  );
}
