import { FileDropZone } from "@/components/tools/FileDropZone";
import {
  ProcessButton,
  type ProcessState,
} from "@/components/tools/ProcessButton";
import { ToolLayout } from "@/components/tools/ToolLayout";
import { Card, CardContent } from "@/components/ui/card";
import { useAddHistory, useIncrementToolUsage } from "@/hooks/useQueries";
import { downloadBlob, readFileAsArrayBuffer } from "@/utils/pdfUtils";
import { Merge } from "lucide-react";
import { PDFDocument } from "pdf-lib";
import { useCallback, useState } from "react";
import { toast } from "sonner";

export function MergePDF() {
  const [files, setFiles] = useState<File[]>([]);
  const [state, setState] = useState<ProcessState>("idle");
  const [resultBytes, setResultBytes] = useState<Uint8Array | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  const { mutate: incrementUsage } = useIncrementToolUsage();
  const { mutate: addHistory } = useAddHistory();

  const handleProcess = useCallback(async () => {
    if (files.length < 2) {
      toast.error("Please select at least 2 PDF files to merge.");
      return;
    }
    setState("processing");
    setErrorMsg("");
    try {
      const merged = await PDFDocument.create();
      for (const file of files) {
        const buf = await readFileAsArrayBuffer(file);
        const doc = await PDFDocument.load(buf);
        const copiedPages = await merged.copyPages(doc, doc.getPageIndices());
        for (const page of copiedPages) merged.addPage(page);
      }
      const bytes = await merged.save();
      setResultBytes(bytes);
      setState("done");
      incrementUsage("merge");
      addHistory({
        toolName: "merge",
        originalFile: files.map((f) => f.name).join(", "),
        resultFile: "merged.pdf",
      });
      toast.success("PDFs merged successfully!");
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to merge PDFs";
      setErrorMsg(msg);
      setState("error");
      toast.error(msg);
    }
  }, [files, incrementUsage, addHistory]);

  const handleDownload = useCallback(() => {
    if (resultBytes) downloadBlob(resultBytes, "merged.pdf");
  }, [resultBytes]);

  return (
    <ToolLayout
      toolName="Merge PDF"
      toolPath="/merge"
      description="Combine multiple PDF files into one document. Drag to reorder before merging."
      icon={Merge}
      iconColor="#E25C3B"
    >
      <div className="space-y-6">
        <Card className="border-border shadow-card">
          <CardContent className="pt-6">
            <FileDropZone
              accept=".pdf"
              multiple={true}
              files={files}
              onFilesChange={setFiles}
              label="Drop your PDF files here"
              description="Add multiple PDFs to merge them into one"
            />
          </CardContent>
        </Card>

        {files.length >= 2 && (
          <Card className="border-border shadow-card">
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground mb-4">
                {files.length} files selected — they will be merged in the order
                shown above.
              </p>
              <ProcessButton
                state={state}
                onProcess={handleProcess}
                onDownload={handleDownload}
                processLabel="Merge PDFs"
                downloadLabel="Download Merged PDF"
                disabled={files.length < 2}
                errorMessage={errorMsg}
              />
            </CardContent>
          </Card>
        )}
      </div>
    </ToolLayout>
  );
}
