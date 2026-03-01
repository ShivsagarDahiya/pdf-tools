import { FileDropZone } from "@/components/tools/FileDropZone";
import {
  ProcessButton,
  type ProcessState,
} from "@/components/tools/ProcessButton";
import { ToolLayout } from "@/components/tools/ToolLayout";
import { Card, CardContent } from "@/components/ui/card";
import { useAddHistory, useIncrementToolUsage } from "@/hooks/useQueries";
import { downloadBlob, readFileAsArrayBuffer } from "@/utils/pdfUtils";
import { FileOutput } from "lucide-react";
import { PDFDocument } from "pdf-lib";
import { useCallback, useState } from "react";
import { toast } from "sonner";

export function PDFToWord() {
  const [files, setFiles] = useState<File[]>([]);
  const [state, setState] = useState<ProcessState>("idle");
  const [resultBytes, setResultBytes] = useState<Uint8Array | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [extractedText, setExtractedText] = useState("");

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
    setExtractedText("");
    try {
      const buf = await readFileAsArrayBuffer(file);
      const pdfDoc = await PDFDocument.load(buf);
      const pageCount = pdfDoc.getPageCount();

      // Build a text file with metadata and extraction note
      const sep = "=".repeat(40);
      const textContent = [
        "PDF to Text Extraction",
        sep,
        "",
        `Source file: ${file.name}`,
        `Pages: ${pageCount}`,
        `File size: ${(file.size / 1024).toFixed(1)} KB`,
        `Extracted: ${new Date().toLocaleString()}`,
        "",
        sep,
        "",
        "Note: pdf-lib does not expose a text extraction API.",
        "For accurate text extraction with formatting, tables,",
        "and font information, server-side processing using",
        "tools like pdfminer, PyMuPDF, or Apache PDFBox is required.",
        "",
        "To extract text from this PDF, you can:",
        "1. Open the PDF in Adobe Acrobat or a PDF viewer",
        "2. Use Ctrl+A (Select All) then Ctrl+C (Copy)",
        "3. Paste into a text editor or Word document",
        "",
        "Or upload to Google Drive and open with Google Docs",
        "for automatic PDF-to-Docs conversion.",
        "",
        sep,
        "PDF METADATA",
        sep,
        "",
        `Title: ${pdfDoc.getTitle() || "(not set)"}`,
        `Author: ${pdfDoc.getAuthor() || "(not set)"}`,
        `Subject: ${pdfDoc.getSubject() || "(not set)"}`,
        `Creator: ${pdfDoc.getCreator() || "(not set)"}`,
        `Producer: ${pdfDoc.getProducer() || "(not set)"}`,
        `Creation Date: ${pdfDoc.getCreationDate()?.toLocaleDateString() || "(not set)"}`,
        `Modified Date: ${pdfDoc.getModificationDate()?.toLocaleDateString() || "(not set)"}`,
        `Pages: ${pageCount}`,
      ].join("\n");

      setExtractedText(textContent);

      // Encode as UTF-8 bytes
      const encoder = new TextEncoder();
      const textBytes = encoder.encode(textContent);
      setResultBytes(textBytes);
      setState("done");
      incrementUsage("pdf-to-word");
      addHistory({
        toolName: "pdf-to-word",
        originalFile: file.name,
        resultFile: `${file.name.replace(/\.pdf$/i, "")}.txt`,
      });
      toast.success("PDF metadata and instructions extracted!");
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
      downloadBlob(resultBytes, `${name}.txt`, "text/plain;charset=utf-8");
    }
  }, [resultBytes, files]);

  return (
    <ToolLayout
      toolName="PDF to Word"
      toolPath="/pdf-to-word"
      description="Extract content and metadata from PDFs. Get a text file with all extractable information and PDF metadata."
      icon={FileOutput}
      iconColor="#2B5CE2"
    >
      <div className="space-y-6">
        <Card className="border-border shadow-card">
          <CardContent className="pt-6">
            <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
              <p className="text-sm text-blue-700 dark:text-blue-300">
                <strong>What you'll get:</strong> A .txt file with PDF metadata
                (title, author, page count) and instructions for extracting
                text. Full PDF-to-Word conversion with layout preservation
                requires server-side processing.
              </p>
            </div>
            <FileDropZone
              accept=".pdf"
              multiple={false}
              files={files}
              onFilesChange={setFiles}
              label="Drop your PDF here"
              description="Upload a PDF to extract metadata and content info"
            />
          </CardContent>
        </Card>

        {files.length > 0 && (
          <Card className="border-border shadow-card">
            <CardContent className="pt-6">
              {extractedText && (
                <div className="mb-4 p-3 bg-muted/50 rounded-lg border border-border overflow-auto max-h-40">
                  <pre className="text-xs text-muted-foreground whitespace-pre-wrap font-mono">
                    {extractedText.slice(0, 500)}
                    {extractedText.length > 500 ? "…" : ""}
                  </pre>
                </div>
              )}
              <p className="text-sm text-muted-foreground mb-4">
                Ready to extract from <strong>{files[0].name}</strong>.
              </p>
              <ProcessButton
                state={state}
                onProcess={handleProcess}
                onDownload={handleDownload}
                processLabel="Extract PDF Info"
                downloadLabel="Download .txt File"
                errorMessage={errorMsg}
              />
            </CardContent>
          </Card>
        )}
      </div>
    </ToolLayout>
  );
}
