import { FileDropZone } from "@/components/tools/FileDropZone";
import {
  ProcessButton,
  type ProcessState,
} from "@/components/tools/ProcessButton";
import { ToolLayout } from "@/components/tools/ToolLayout";
import { Card, CardContent } from "@/components/ui/card";
import { useAddHistory, useIncrementToolUsage } from "@/hooks/useQueries";
import { downloadBlob, readFileAsArrayBuffer } from "@/utils/pdfUtils";
import { Archive } from "lucide-react";
import { PDFDocument } from "pdf-lib";
import { useCallback, useState } from "react";
import { toast } from "sonner";

export function PDFToPDFA() {
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

      // Load and re-save the PDF — this cleans up the structure
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const pdfDoc = await PDFDocument.load(buf, {
        ignoreEncryption: true,
      } as any);

      const pages = pdfDoc.getPageCount();
      setPageCount(pages);

      // Set PDF/A metadata hints
      pdfDoc.setTitle(pdfDoc.getTitle() || file.name.replace(/\.pdf$/i, ""));
      pdfDoc.setCreator("PDF Tools — PDF/A Converter");
      pdfDoc.setProducer("pdf-lib");

      const bytes = await pdfDoc.save({
        useObjectStreams: false, // PDF/A compliance requires no object streams
        addDefaultPage: false,
      });

      setResultBytes(bytes);
      setState("done");
      incrementUsage("pdf-to-pdfa");
      addHistory({
        toolName: "pdf-to-pdfa",
        originalFile: file.name,
        resultFile: `${file.name.replace(/\.pdf$/i, "")}.pdfa.pdf`,
      });
      toast.success(
        `PDF rebuilt with ${pages} pages! Note: full ISO PDF/A validation requires server-side processing.`,
        { duration: 5000 },
      );
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to convert PDF";
      setErrorMsg(msg);
      setState("error");
      toast.error(msg);
    }
  }, [files, incrementUsage, addHistory]);

  const handleDownload = useCallback(() => {
    if (resultBytes && files[0]) {
      const name = files[0].name.replace(/\.pdf$/i, "");
      downloadBlob(resultBytes, `${name}.pdfa.pdf`);
    }
  }, [resultBytes, files]);

  return (
    <ToolLayout
      toolName="PDF to PDF/A"
      toolPath="/pdf-to-pdfa"
      description="Convert PDFs to archival format. We rebuild the PDF structure and disable object streams for better PDF/A compatibility."
      icon={Archive}
      iconColor="#6B3BE2"
    >
      <div className="space-y-6">
        <Card className="border-border shadow-card">
          <CardContent className="pt-6">
            <div className="mb-4 p-3 bg-purple-50 dark:bg-purple-950/30 rounded-lg border border-purple-200 dark:border-purple-800">
              <p className="text-sm text-purple-700 dark:text-purple-300">
                <strong>What we do:</strong> Load your PDF, rebuild its
                structure with object streams disabled (required by PDF/A-1b),
                and re-save it. Full ISO PDF/A validation with font embedding
                verification requires server-side processing.
              </p>
            </div>
            <FileDropZone
              accept=".pdf"
              multiple={false}
              files={files}
              onFilesChange={setFiles}
              label="Drop your PDF here"
              description="Upload a PDF to convert to archival format"
            />
          </CardContent>
        </Card>

        {files.length > 0 && (
          <Card className="border-border shadow-card">
            <CardContent className="pt-6">
              {pageCount > 0 && (
                <p className="text-sm text-muted-foreground mb-2">
                  Processed <strong>{pageCount} pages</strong>.
                </p>
              )}
              <p className="text-sm text-muted-foreground mb-4">
                Ready to convert <strong>{files[0].name}</strong> to PDF/A
                format.
              </p>
              <ProcessButton
                state={state}
                onProcess={handleProcess}
                onDownload={handleDownload}
                processLabel="Convert to PDF/A"
                downloadLabel="Download PDF/A File"
                errorMessage={errorMsg}
              />
            </CardContent>
          </Card>
        )}
      </div>
    </ToolLayout>
  );
}
