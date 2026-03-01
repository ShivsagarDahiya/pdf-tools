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
import { downloadBlob, readFileAsArrayBuffer } from "@/utils/pdfUtils";
import { Unlock } from "lucide-react";
import { PDFDocument } from "pdf-lib";
import * as pdfjsLib from "pdfjs-dist";
import { useCallback, useState } from "react";
import { toast } from "sonner";

pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

export function UnlockPDF() {
  const [files, setFiles] = useState<File[]>([]);
  const [password, setPassword] = useState("");
  const [state, setState] = useState<ProcessState>("idle");
  const [resultBytes, setResultBytes] = useState<Uint8Array | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  const { mutate: incrementUsage } = useIncrementToolUsage();
  const { mutate: addHistory } = useAddHistory();

  const handleProcess = useCallback(async () => {
    if (files.length === 0) return;
    setState("processing");
    setErrorMsg("");
    try {
      const buf = await readFileAsArrayBuffer(files[0]);
      const uint8 = new Uint8Array(buf);

      // Use pdfjs to load with password
      const loadingTask = pdfjsLib.getDocument({ data: uint8, password });
      const pdf = await loadingTask.promise;
      const numPages = pdf.numPages;

      // Re-create without encryption
      const newDoc = await PDFDocument.create();
      const srcDoc = await PDFDocument.load(buf, {
        ignoreEncryption: true,
      });

      const pages = await newDoc.copyPages(
        srcDoc,
        Array.from({ length: numPages }, (_, i) => i),
      );
      for (const page of pages) newDoc.addPage(page);

      const bytes = await newDoc.save();
      setResultBytes(bytes);
      setState("done");
      incrementUsage("unlock");
      addHistory({
        toolName: "unlock",
        originalFile: files[0].name,
        resultFile: "unlocked.pdf",
      });
      toast.success("PDF unlocked successfully!");
    } catch (e) {
      const msg =
        e instanceof Error
          ? e.message.includes("password") || e.message.includes("Password")
            ? "Incorrect password."
            : e.message
          : "Failed to unlock PDF";
      setErrorMsg(msg);
      setState("error");
      toast.error(msg);
    }
  }, [files, password, incrementUsage, addHistory]);

  const handleDownload = useCallback(() => {
    if (resultBytes) downloadBlob(resultBytes, "unlocked.pdf");
  }, [resultBytes]);

  return (
    <ToolLayout
      toolName="Unlock PDF"
      toolPath="/unlock"
      description="Remove password protection from a PDF you have permission to access."
      icon={Unlock}
      iconColor="#E2C43B"
    >
      <div className="space-y-6">
        <Card className="border-border shadow-card">
          <CardContent className="pt-6">
            <FileDropZone
              accept=".pdf"
              multiple={false}
              files={files}
              onFilesChange={setFiles}
              label="Drop your encrypted PDF here"
              description="Select the password-protected PDF"
            />
          </CardContent>
        </Card>

        {files.length > 0 && (
          <Card className="border-border shadow-card">
            <CardContent className="pt-6 space-y-6">
              <div className="space-y-2">
                <Label htmlFor="unlock-password">
                  Password (leave blank if not required)
                </Label>
                <Input
                  id="unlock-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter the PDF password"
                  autoComplete="current-password"
                  onKeyDown={(e) => e.key === "Enter" && handleProcess()}
                />
              </div>

              <ProcessButton
                state={state}
                onProcess={handleProcess}
                onDownload={handleDownload}
                processLabel="Unlock PDF"
                downloadLabel="Download Unlocked PDF"
                errorMessage={errorMsg}
              />
            </CardContent>
          </Card>
        )}
      </div>
    </ToolLayout>
  );
}
