import { FileDropZone } from "@/components/tools/FileDropZone";
import {
  ProcessButton,
  type ProcessState,
} from "@/components/tools/ProcessButton";
import { ToolLayout } from "@/components/tools/ToolLayout";
import { Card, CardContent } from "@/components/ui/card";
import { useAddHistory, useIncrementToolUsage } from "@/hooks/useQueries";
import { downloadBlob, readFileAsArrayBuffer } from "@/utils/pdfUtils";
import { ScanText } from "lucide-react";
import { PDFDocument } from "pdf-lib";
import { useCallback, useState } from "react";
import { toast } from "sonner";

export function OCRPDF() {
  const [files, setFiles] = useState<File[]>([]);
  const [state, setState] = useState<ProcessState>("idle");
  const [resultBytes, setResultBytes] = useState<Uint8Array | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [pageCount, setPageCount] = useState(0);

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
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const pdfDoc = await PDFDocument.load(buf, {
        ignoreEncryption: true,
      } as any);
      const pages = pdfDoc.getPageCount();
      setPageCount(pages);

      // Return the original PDF as-is (OCR requires server-side ML)
      const bytes = await pdfDoc.save();
      setResultBytes(bytes);
      setState("done");
      incrementUsage("ocr");
      addHistory({
        toolName: "ocr",
        originalFile: file.name,
        resultFile: `ocr_${file.name}`,
      });
      toast.success(
        `PDF loaded (${pages} page${pages !== 1 ? "s" : ""}). OCR processing requires server-side ML — download the original.`,
        { duration: 5000 },
      );
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to load PDF";
      setErrorMsg(msg);
      setState("error");
      toast.error(msg);
    }
  }, [files, incrementUsage, addHistory]);

  const handleDownload = useCallback(() => {
    if (resultBytes && files[0]) {
      downloadBlob(resultBytes, `ocr_${files[0].name}`);
    }
  }, [resultBytes, files]);

  return (
    <ToolLayout
      toolName="OCR PDF"
      toolPath="/ocr"
      description="Convert scanned PDFs into searchable documents using Optical Character Recognition. Upload your PDF to process."
      icon={ScanText}
      iconColor="#3B8CE2"
    >
      <div className="space-y-6">
        <Card className="border-border shadow-card">
          <CardContent className="pt-6">
            <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
              <p className="text-sm text-blue-700 dark:text-blue-300">
                <strong>Note:</strong> Full OCR (text recognition from scanned
                images) requires server-side ML models. We'll validate your PDF
                and return it for download. For searchable text extraction, use
                the PDF to Word tool.
              </p>
            </div>
            <FileDropZone
              accept=".pdf"
              multiple={false}
              files={files}
              onFilesChange={setFiles}
              label="Drop your scanned PDF here"
              description="Upload a PDF to process with OCR"
            />
          </CardContent>
        </Card>

        {files.length > 0 && (
          <Card className="border-border shadow-card">
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground mb-4">
                Ready to process <strong>{files[0].name}</strong>
                {pageCount > 0 && ` — ${pageCount} pages detected`}.
              </p>
              <ProcessButton
                state={state}
                onProcess={handleProcess}
                onDownload={handleDownload}
                processLabel="Process PDF"
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
