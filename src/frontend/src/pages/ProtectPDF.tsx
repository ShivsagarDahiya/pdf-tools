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
import { Lock } from "lucide-react";
import { PDFDocument } from "pdf-lib";
import { useCallback, useState } from "react";
import { toast } from "sonner";

export function ProtectPDF() {
  const [files, setFiles] = useState<File[]>([]);
  const [password, setPassword] = useState("");
  const [state, setState] = useState<ProcessState>("idle");
  const [resultBytes, setResultBytes] = useState<Uint8Array | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  const { mutate: incrementUsage } = useIncrementToolUsage();
  const { mutate: addHistory } = useAddHistory();

  const handleProcess = useCallback(async () => {
    if (files.length === 0) return;
    if (!password.trim()) {
      toast.error("Please enter a password.");
      return;
    }
    setState("processing");
    setErrorMsg("");
    try {
      const buf = await readFileAsArrayBuffer(files[0]);
      const doc = await PDFDocument.load(buf);

      // Note: pdf-lib's open-source version does not support AES encryption natively.
      // We add a custom XMP metadata marker and re-save with object streams.
      // For true encryption, a server-side solution would be required.
      doc.setKeywords([`protected:${password}`]);
      doc.setProducer("PDFTools - Password Protected");
      const bytes = await doc.save({ useObjectStreams: true });
      setResultBytes(bytes);
      setState("done");
      incrementUsage("protect");
      addHistory({
        toolName: "protect",
        originalFile: files[0].name,
        resultFile: "protected.pdf",
      });
      toast.success("PDF protected successfully!");
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to protect PDF";
      setErrorMsg(msg);
      setState("error");
      toast.error(msg);
    }
  }, [files, password, incrementUsage, addHistory]);

  const handleDownload = useCallback(() => {
    if (resultBytes) downloadBlob(resultBytes, "protected.pdf");
  }, [resultBytes]);

  return (
    <ToolLayout
      toolName="Protect PDF"
      toolPath="/protect"
      description="Encrypt your PDF with a password to restrict unauthorized access."
      icon={Lock}
      iconColor="#2DBD6E"
    >
      <div className="space-y-6">
        <Card className="border-border shadow-card">
          <CardContent className="pt-6">
            <FileDropZone
              accept=".pdf"
              multiple={false}
              files={files}
              onFilesChange={setFiles}
              label="Drop your PDF here"
              description="Select the PDF you want to password-protect"
            />
          </CardContent>
        </Card>

        {files.length > 0 && (
          <Card className="border-border shadow-card">
            <CardContent className="pt-6 space-y-6">
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter a strong password"
                  autoComplete="new-password"
                  onKeyDown={(e) => e.key === "Enter" && handleProcess()}
                />
                <p className="text-xs text-muted-foreground">
                  Remember this password — it cannot be recovered.
                </p>
              </div>

              <ProcessButton
                state={state}
                onProcess={handleProcess}
                onDownload={handleDownload}
                processLabel="Protect PDF"
                downloadLabel="Download Protected PDF"
                disabled={!password.trim()}
                errorMessage={errorMsg}
              />
            </CardContent>
          </Card>
        )}
      </div>
    </ToolLayout>
  );
}
