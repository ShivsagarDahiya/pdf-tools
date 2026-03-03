import { ToolLayout } from "@/components/tools/ToolLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAddHistory, useIncrementToolUsage } from "@/hooks/useQueries";
import { callGemini, extractTextFromPDF } from "@/utils/geminiApi";
import { Check, Copy, Loader2, Sparkles, Upload, X } from "lucide-react";
import { useCallback, useRef, useState } from "react";
import { toast } from "sonner";

export function AISummarizePDF() {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [summary, setSummary] = useState<string>("");
  const [copied, setCopied] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const { mutate: incrementUsage } = useIncrementToolUsage();
  const { mutate: addHistory } = useAddHistory();

  const handleFile = useCallback((f: File) => {
    if (!f.name.toLowerCase().endsWith(".pdf")) {
      toast.error("Please upload a PDF file");
      return;
    }
    setFile(f);
    setSummary("");
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const dropped = e.dataTransfer.files[0];
      if (dropped) handleFile(dropped);
    },
    [handleFile],
  );

  const handleProcess = useCallback(async () => {
    if (!file) return;
    setIsLoading(true);
    setSummary("");
    try {
      const text = await extractTextFromPDF(file);
      if (!text.trim()) {
        toast.error("Could not extract text from this PDF");
        return;
      }
      const truncated = text.slice(0, 12000);
      const prompt = `Summarize this document in 3-5 bullet points with a brief executive summary paragraph. Document text:\n\n${truncated}`;
      const result = await callGemini(prompt);
      setSummary(result);
      incrementUsage("AI Summarize PDF");
      addHistory({
        toolName: "AI Summarize PDF",
        originalFile: file.name,
        resultFile: "summary.txt",
      });
      toast.success("Summary generated!");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to generate summary",
      );
    } finally {
      setIsLoading(false);
    }
  }, [file, incrementUsage, addHistory]);

  const handleCopy = useCallback(() => {
    if (!summary) return;
    navigator.clipboard.writeText(summary).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [summary]);

  return (
    <ToolLayout
      toolName="PDF Summarizer"
      toolPath="/ai-summarize"
      description="AI-powered document abstraction. Upload a PDF and get an executive summary with key bullet points instantly."
      icon={Sparkles}
      iconColor="#7C3BE2"
    >
      <div className="space-y-6">
        {/* Upload Zone */}
        <Card className="border-border">
          <CardContent className="pt-6">
            <div
              data-ocid="ai-summarize.dropzone"
              onDrop={handleDrop}
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onClick={() => inputRef.current?.click()}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ")
                  inputRef.current?.click();
              }}
              className={`relative border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all duration-200 ${
                isDragging
                  ? "border-[#7C3BE2] bg-[#7C3BE2]/5"
                  : file
                    ? "border-[#7C3BE2]/50 bg-[#7C3BE2]/5"
                    : "border-border hover:border-[#7C3BE2]/40 hover:bg-muted/30"
              }`}
            >
              <input
                ref={inputRef}
                type="file"
                accept=".pdf"
                className="hidden"
                onChange={(e) =>
                  e.target.files?.[0] && handleFile(e.target.files[0])
                }
              />
              {file ? (
                <div className="flex flex-col items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-[#7C3BE2]/15 flex items-center justify-center">
                    <Sparkles className="w-6 h-6 text-[#7C3BE2]" />
                  </div>
                  <div>
                    <p className="font-display font-semibold text-foreground">
                      {file.name}
                    </p>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      {(file.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setFile(null);
                      setSummary("");
                    }}
                    className="absolute top-3 right-3 w-7 h-7 rounded-lg bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-[#7C3BE2]/10 flex items-center justify-center">
                    <Upload className="w-6 h-6 text-[#7C3BE2]" />
                  </div>
                  <div>
                    <p className="font-display font-semibold text-foreground">
                      Drop your PDF here
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      or click to browse
                    </p>
                  </div>
                </div>
              )}
            </div>

            <Button
              data-ocid="ai-summarize.submit_button"
              onClick={handleProcess}
              disabled={!file || isLoading}
              className="w-full mt-4 gap-2"
              style={{ backgroundColor: "#7C3BE2" }}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Analyzing document…
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Generate Summary
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Loading state */}
        {isLoading && (
          <div
            data-ocid="ai-summarize.loading_state"
            className="flex items-center justify-center gap-3 py-6 text-muted-foreground"
          >
            <Loader2 className="w-5 h-5 animate-spin text-[#7C3BE2]" />
            <span className="font-ui">AI is reading your document…</span>
          </div>
        )}

        {/* Summary result */}
        {summary && !isLoading && (
          <Card
            data-ocid="ai-summarize.success_state"
            className="border-[#7C3BE2]/20 bg-[#7C3BE2]/5"
          >
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-[#7C3BE2]/20 flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-[#7C3BE2]" />
                  </div>
                  <h3 className="font-display font-semibold text-foreground">
                    AI Summary
                  </h3>
                </div>
                <Button
                  data-ocid="ai-summarize.secondary_button"
                  variant="outline"
                  size="sm"
                  onClick={handleCopy}
                  className="gap-1.5"
                >
                  {copied ? (
                    <Check className="w-3.5 h-3.5 text-green-500" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                  {copied ? "Copied!" : "Copy"}
                </Button>
              </div>
              <div className="prose prose-sm max-w-none">
                <pre className="whitespace-pre-wrap font-ui text-sm text-foreground leading-relaxed bg-transparent border-0 p-0 m-0">
                  {summary}
                </pre>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </ToolLayout>
  );
}
