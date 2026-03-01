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
import {
  downloadBlob,
  formatBytes,
  parsePageRanges,
  readFileAsArrayBuffer,
} from "@/utils/pdfUtils";
import { FileMinus } from "lucide-react";
import { PDFDocument } from "pdf-lib";
import { useCallback, useState } from "react";
import { toast } from "sonner";

export function ExtractPages() {
  const [files, setFiles] = useState<File[]>([]);
  const [state, setState] = useState<ProcessState>("idle");
  const [resultBytes, setResultBytes] = useState<Uint8Array | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [pagesToExtract, setPagesToExtract] = useState("");
  const [pageCount, setPageCount] = useState(0);

  const { mutate: incrementUsage } = useIncrementToolUsage();
  const { mutate: addHistory } = useAddHistory();

  const handleFilesChange = useCallback(async (newFiles: File[]) => {
    setFiles(newFiles);
    setPageCount(0);
    setResultBytes(null);
    setState("idle");
    if (newFiles.length === 0) return;
    try {
      const buf = await readFileAsArrayBuffer(newFiles[0]);
      const doc = await PDFDocument.load(buf, { ignoreEncryption: true });
      setPageCount(doc.getPageCount());
    } catch {
      // ignore
    }
  }, []);

  const handleProcess = useCallback(async () => {
    if (files.length === 0) return;
    if (!pagesToExtract.trim()) {
      toast.error("Please enter page numbers to extract.");
      return;
    }
    setState("processing");
    setErrorMsg("");
    try {
      const file = files[0];
      const buf = await readFileAsArrayBuffer(file);
      const doc = await PDFDocument.load(buf, { ignoreEncryption: true });
      const total = doc.getPageCount();
      const toExtract = parsePageRanges(pagesToExtract, total);
      if (toExtract.length === 0) {
        throw new Error("No valid pages specified.");
      }

      const newDoc = await PDFDocument.create();
      const indices = toExtract.map((p) => p - 1); // 0-indexed
      const copiedPages = await newDoc.copyPages(doc, indices);
      for (const page of copiedPages) newDoc.addPage(page);

      const bytes = await newDoc.save();
      setResultBytes(bytes);
      setState("done");
      incrementUsage("extract-pages");
      addHistory({
        toolName: "extract-pages",
        originalFile: file.name,
        resultFile: "extracted.pdf",
      });
      toast.success(`Extracted ${toExtract.length} page(s) successfully!`);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to extract pages";
      setErrorMsg(msg);
      setState("error");
      toast.error(msg);
    }
  }, [files, pagesToExtract, incrementUsage, addHistory]);

  const handleDownload = useCallback(() => {
    if (resultBytes) downloadBlob(resultBytes, "extracted.pdf");
  }, [resultBytes]);

  return (
    <ToolLayout
      toolName="Extract Pages"
      toolPath="/extract-pages"
      description="Pull selected pages from your PDF into a new independent document."
      icon={FileMinus}
      iconColor="#3B8CE2"
    >
      <div className="space-y-6">
        <Card className="border-border shadow-card">
          <CardContent className="pt-6">
            <FileDropZone
              accept=".pdf"
              multiple={false}
              files={files}
              onFilesChange={handleFilesChange}
              label="Drop your PDF here"
              description="Select the PDF to extract pages from"
            />
          </CardContent>
        </Card>

        {files.length > 0 && (
          <Card className="border-border shadow-card">
            <CardContent className="pt-6 space-y-5">
              {pageCount > 0 && (
                <p className="text-sm text-muted-foreground">
                  This PDF has{" "}
                  <span className="font-semibold text-foreground">
                    {pageCount}
                  </span>{" "}
                  page{pageCount !== 1 ? "s" : ""}. Size:{" "}
                  {formatBytes(files[0].size)}
                </p>
              )}
              <div className="space-y-2">
                <Label htmlFor="extract-input" className="font-ui font-medium">
                  Pages to extract
                </Label>
                <Input
                  id="extract-input"
                  placeholder="e.g. 1-3, 5, 7-9"
                  value={pagesToExtract}
                  onChange={(e) => setPagesToExtract(e.target.value)}
                  className="font-ui"
                />
                <p className="text-xs text-muted-foreground">
                  Enter page numbers or ranges separated by commas. The
                  extracted pages will be saved as a new PDF.
                </p>
              </div>
              <ProcessButton
                state={state}
                onProcess={handleProcess}
                onDownload={handleDownload}
                processLabel="Extract Pages"
                downloadLabel="Download Extracted PDF"
                errorMessage={errorMsg}
              />
            </CardContent>
          </Card>
        )}
      </div>
    </ToolLayout>
  );
}
