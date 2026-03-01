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
import { Trash2 } from "lucide-react";
import { PDFDocument } from "pdf-lib";
import { useCallback, useState } from "react";
import { toast } from "sonner";

export function RemovePages() {
  const [files, setFiles] = useState<File[]>([]);
  const [state, setState] = useState<ProcessState>("idle");
  const [resultBytes, setResultBytes] = useState<Uint8Array | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [pagesToRemove, setPagesToRemove] = useState("");
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
    if (!pagesToRemove.trim()) {
      toast.error("Please enter page numbers to remove.");
      return;
    }
    setState("processing");
    setErrorMsg("");
    try {
      const file = files[0];
      const buf = await readFileAsArrayBuffer(file);
      const doc = await PDFDocument.load(buf, { ignoreEncryption: true });
      const total = doc.getPageCount();
      const toRemove = parsePageRanges(pagesToRemove, total);
      if (toRemove.length === 0) {
        throw new Error("No valid pages specified.");
      }
      if (toRemove.length >= total) {
        throw new Error("Cannot remove all pages from a PDF.");
      }

      // Remove pages in reverse order to keep indices valid
      const sortedDesc = [...toRemove].sort((a, b) => b - a);
      for (const p of sortedDesc) {
        doc.removePage(p - 1); // 0-indexed
      }

      const bytes = await doc.save();
      setResultBytes(bytes);
      setState("done");
      incrementUsage("remove-pages");
      addHistory({
        toolName: "remove-pages",
        originalFile: file.name,
        resultFile: "pages-removed.pdf",
      });
      toast.success(`Removed ${toRemove.length} page(s) successfully!`);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to remove pages";
      setErrorMsg(msg);
      setState("error");
      toast.error(msg);
    }
  }, [files, pagesToRemove, incrementUsage, addHistory]);

  const handleDownload = useCallback(() => {
    if (resultBytes) downloadBlob(resultBytes, "pages-removed.pdf");
  }, [resultBytes]);

  return (
    <ToolLayout
      toolName="Remove Pages"
      toolPath="/remove-pages"
      description="Delete specific pages from your PDF. Enter page numbers or ranges like 2, 4-6, 8."
      icon={Trash2}
      iconColor="#E25C3B"
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
              description="Select the PDF to remove pages from"
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
                <Label htmlFor="pages-input" className="font-ui font-medium">
                  Pages to remove
                </Label>
                <Input
                  id="pages-input"
                  placeholder="e.g. 2, 4-6, 8"
                  value={pagesToRemove}
                  onChange={(e) => setPagesToRemove(e.target.value)}
                  className="font-ui"
                />
                <p className="text-xs text-muted-foreground">
                  Separate individual pages with commas. Use hyphens for ranges
                  (e.g. 3-7).
                </p>
              </div>
              <ProcessButton
                state={state}
                onProcess={handleProcess}
                onDownload={handleDownload}
                processLabel="Remove Pages"
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
