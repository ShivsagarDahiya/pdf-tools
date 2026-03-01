import { FileDropZone } from "@/components/tools/FileDropZone";
import {
  ProcessButton,
  type ProcessState,
} from "@/components/tools/ProcessButton";
import { ToolLayout } from "@/components/tools/ToolLayout";
import { Card, CardContent } from "@/components/ui/card";
import { useAddHistory, useIncrementToolUsage } from "@/hooks/useQueries";
import { downloadBlob, readFileAsArrayBuffer } from "@/utils/pdfUtils";
import { Wrench } from "lucide-react";
import { PDFDocument } from "pdf-lib";
import { useCallback, useState } from "react";
import { toast } from "sonner";

export function RepairPDF() {
  const [files, setFiles] = useState<File[]>([]);
  const [state, setState] = useState<ProcessState>("idle");
  const [resultBytes, setResultBytes] = useState<Uint8Array | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [repairInfo, setRepairInfo] = useState("");

  const { mutate: incrementUsage } = useIncrementToolUsage();
  const { mutate: addHistory } = useAddHistory();

  const handleProcess = useCallback(async () => {
    if (files.length === 0) {
      toast.error("Please select a PDF file to repair.");
      return;
    }
    const file = files[0];
    setState("processing");
    setErrorMsg("");
    setRepairInfo("");
    try {
      const buf = await readFileAsArrayBuffer(file);

      // Attempt to load with ignoreEncryption to handle encrypted/damaged PDFs
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const pdfDoc = await PDFDocument.load(buf, {
        ignoreEncryption: true,
      } as any);

      const pageCount = pdfDoc.getPageCount();
      const bytes = await pdfDoc.save();
      setResultBytes(bytes);
      setRepairInfo(
        `Successfully processed ${pageCount} page${pageCount !== 1 ? "s" : ""}. The PDF structure has been rebuilt and cleaned.`,
      );
      setState("done");
      incrementUsage("repair");
      addHistory({
        toolName: "repair",
        originalFile: file.name,
        resultFile: `repaired_${file.name}`,
      });
      toast.success("PDF repaired successfully!");
    } catch (e) {
      const msg =
        e instanceof Error
          ? `Could not repair this PDF: ${e.message}`
          : "Failed to repair PDF. The file may be severely damaged.";
      setErrorMsg(msg);
      setState("error");
      toast.error("Repair failed — the file may be too damaged to recover.");
    }
  }, [files, incrementUsage, addHistory]);

  const handleDownload = useCallback(() => {
    if (resultBytes && files[0]) {
      downloadBlob(resultBytes, `repaired_${files[0].name}`);
    }
  }, [resultBytes, files]);

  return (
    <ToolLayout
      toolName="Repair PDF"
      toolPath="/repair"
      description="Fix corrupted or damaged PDF files. Upload your PDF and we'll attempt to rebuild the structure and recover content."
      icon={Wrench}
      iconColor="#E25C3B"
    >
      <div className="space-y-6">
        <Card className="border-border shadow-card">
          <CardContent className="pt-6">
            <div className="mb-4 p-3 bg-orange-50 dark:bg-orange-950/30 rounded-lg border border-orange-200 dark:border-orange-800">
              <p className="text-sm text-orange-700 dark:text-orange-300">
                <strong>How it works:</strong> We attempt to load your PDF with
                error-tolerant parsing, then re-save it with a clean structure.
                This fixes many common corruption issues caused by incomplete
                downloads or software bugs.
              </p>
            </div>
            <FileDropZone
              accept=".pdf"
              multiple={false}
              files={files}
              onFilesChange={setFiles}
              label="Drop your damaged PDF here"
              description="Upload a PDF file to attempt repair"
            />
          </CardContent>
        </Card>

        {files.length > 0 && (
          <Card className="border-border shadow-card">
            <CardContent className="pt-6">
              {repairInfo && (
                <div className="mb-4 p-3 bg-green-50 dark:bg-green-950/30 rounded-lg border border-green-200 dark:border-green-800">
                  <p className="text-sm text-green-700 dark:text-green-300">
                    {repairInfo}
                  </p>
                </div>
              )}
              <p className="text-sm text-muted-foreground mb-4">
                Ready to repair <strong>{files[0].name}</strong>.
              </p>
              <ProcessButton
                state={state}
                onProcess={handleProcess}
                onDownload={handleDownload}
                processLabel="Repair PDF"
                downloadLabel="Download Repaired PDF"
                errorMessage={errorMsg}
              />
            </CardContent>
          </Card>
        )}
      </div>
    </ToolLayout>
  );
}
