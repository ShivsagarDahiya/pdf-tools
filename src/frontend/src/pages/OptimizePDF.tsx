import { FileDropZone } from "@/components/tools/FileDropZone";
import {
  ProcessButton,
  type ProcessState,
} from "@/components/tools/ProcessButton";
import { ToolLayout } from "@/components/tools/ToolLayout";
import { Card, CardContent } from "@/components/ui/card";
import { useAddHistory, useIncrementToolUsage } from "@/hooks/useQueries";
import { callGemini } from "@/utils/geminiApi";
import {
  downloadBlob,
  formatBytes,
  readFileAsArrayBuffer,
} from "@/utils/pdfUtils";
import { Loader2, Sparkles, Zap } from "lucide-react";
import { PDFDocument } from "pdf-lib";
import { useCallback, useState } from "react";
import { toast } from "sonner";

export function OptimizePDF() {
  const [files, setFiles] = useState<File[]>([]);
  const [state, setState] = useState<ProcessState>("idle");
  const [resultBytes, setResultBytes] = useState<Uint8Array | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [sizeBefore, setSizeBefore] = useState(0);
  const [sizeAfter, setSizeAfter] = useState(0);
  const [aiSuggestions, setAiSuggestions] = useState<string>("");
  const [aiLoading, setAiLoading] = useState(false);

  const { mutate: incrementUsage } = useIncrementToolUsage();
  const { mutate: addHistory } = useAddHistory();

  const fetchAiSuggestions = useCallback(
    async (filename: string, origSize: number, newSize: number) => {
      setAiLoading(true);
      try {
        const prompt = `The user just optimized a PDF named "${filename}" from ${Math.round(origSize / 1024)}KB to ${Math.round(newSize / 1024)}KB. Give them exactly 3 brief, practical tips for reducing PDF file size further. Format as a numbered list. Keep each tip to 1-2 sentences. Focus on actionable advice.`;
        const result = await callGemini(prompt);
        setAiSuggestions(result);
      } catch (e) {
        // Silently fail for AI suggestions
        console.error("Gemini error:", e);
      } finally {
        setAiLoading(false);
      }
    },
    [],
  );

  const handleProcess = useCallback(async () => {
    if (files.length === 0) return;
    setState("processing");
    setErrorMsg("");
    setAiSuggestions("");
    try {
      const file = files[0];
      setSizeBefore(file.size);
      const buf = await readFileAsArrayBuffer(file);
      const doc = await PDFDocument.load(buf, { ignoreEncryption: true });

      // Optimize: remove metadata, use object streams
      doc.setTitle("");
      doc.setAuthor("");
      doc.setSubject("");
      doc.setKeywords([]);
      doc.setProducer("PDFTools Optimizer");
      doc.setCreator("PDFTools");

      const bytes = await doc.save({ useObjectStreams: true });
      setSizeAfter(bytes.length);
      setResultBytes(bytes);
      setState("done");
      incrementUsage("optimize");
      addHistory({
        toolName: "optimize",
        originalFile: file.name,
        resultFile: "optimized.pdf",
      });
      toast.success("PDF optimized successfully!");

      // Fetch AI suggestions after processing
      void fetchAiSuggestions(file.name, file.size, bytes.length);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to optimize PDF";
      setErrorMsg(msg);
      setState("error");
      toast.error(msg);
    }
  }, [files, incrementUsage, addHistory, fetchAiSuggestions]);

  const handleDownload = useCallback(() => {
    if (resultBytes) downloadBlob(resultBytes, "optimized.pdf");
  }, [resultBytes]);

  const savedPercent =
    sizeBefore > 0
      ? Math.round(((sizeBefore - sizeAfter) / sizeBefore) * 100)
      : 0;

  return (
    <ToolLayout
      toolName="Optimize PDF"
      toolPath="/optimize"
      description="Improve PDF performance by removing metadata and optimizing structure. Get AI-powered tips."
      icon={Zap}
      iconColor="#E27A3B"
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
              description="Select the PDF you want to optimize"
            />
          </CardContent>
        </Card>

        {files.length > 0 && (
          <Card className="border-border shadow-card">
            <CardContent className="pt-6 space-y-6">
              {state === "done" && sizeBefore > 0 && (
                <div className="grid grid-cols-3 gap-4 p-4 bg-muted/50 rounded-xl">
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground mb-1">
                      Original
                    </p>
                    <p className="font-display font-bold text-lg">
                      {formatBytes(sizeBefore)}
                    </p>
                  </div>
                  <div className="text-center flex flex-col items-center justify-center">
                    <p className="text-xs text-muted-foreground mb-1">Saved</p>
                    <p className="font-display font-bold text-lg text-primary">
                      {savedPercent}%
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground mb-1">
                      Optimized
                    </p>
                    <p className="font-display font-bold text-lg">
                      {formatBytes(sizeAfter)}
                    </p>
                  </div>
                </div>
              )}

              <ProcessButton
                state={state}
                onProcess={handleProcess}
                onDownload={handleDownload}
                processLabel="Optimize PDF"
                downloadLabel="Download Optimized PDF"
                errorMessage={errorMsg}
              />
            </CardContent>
          </Card>
        )}

        {/* AI Suggestions Card */}
        {(aiLoading || aiSuggestions) && (
          <Card className="border-border shadow-card overflow-hidden">
            <div className="h-1 w-full bg-gradient-to-r from-violet-500 via-purple-500 to-indigo-500" />
            <CardContent className="pt-5">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <h3 className="font-display font-semibold text-sm text-foreground">
                  AI Optimization Tips
                </h3>
                <span className="text-xs text-muted-foreground font-ui">
                  powered by Gemini
                </span>
              </div>
              {aiLoading ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground py-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Getting AI suggestions...
                </div>
              ) : (
                <div className="text-sm text-foreground leading-relaxed whitespace-pre-line">
                  {aiSuggestions}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </ToolLayout>
  );
}
