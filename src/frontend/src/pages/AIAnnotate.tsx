import { ToolLayout } from "@/components/tools/ToolLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAddHistory, useIncrementToolUsage } from "@/hooks/useQueries";
import { callGemini, extractTextFromPDF } from "@/utils/geminiApi";
import { Lightbulb, Loader2, PenLine, Upload, Wand2, X } from "lucide-react";
import { useCallback, useRef, useState } from "react";
import { toast } from "sonner";

interface AnnotationResult {
  insights: string[];
  suggestions: string[];
  score: number;
  justification: string;
}

export function AIAnnotate() {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<AnnotationResult | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { mutate: incrementUsage } = useIncrementToolUsage();
  const { mutate: addHistory } = useAddHistory();

  const handleFile = useCallback((f: File) => {
    if (!f.name.toLowerCase().endsWith(".pdf")) {
      toast.error("Please upload a PDF file");
      return;
    }
    setFile(f);
    setResult(null);
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
    setResult(null);
    try {
      const text = await extractTextFromPDF(file);
      if (!text.trim()) {
        toast.error("No text found in PDF");
        return;
      }
      const truncated = text.slice(0, 12000);
      const prompt = `Read this document and provide in JSON format:
1) "insights": array of 3-5 key insights as strings
2) "suggestions": array of 3-5 suggested improvements as strings
3) "score": integer 1-10 quality score
4) "justification": one sentence explaining the score

Return ONLY valid JSON. Document:\n\n${truncated}`;
      const resultText = await callGemini(prompt);
      const jsonMatch = resultText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error("Invalid AI response");
      const parsed: AnnotationResult = JSON.parse(jsonMatch[0]);
      setResult({
        insights: Array.isArray(parsed.insights) ? parsed.insights : [],
        suggestions: Array.isArray(parsed.suggestions)
          ? parsed.suggestions
          : [],
        score:
          typeof parsed.score === "number"
            ? Math.min(10, Math.max(1, parsed.score))
            : 5,
        justification:
          typeof parsed.justification === "string" ? parsed.justification : "",
      });
      incrementUsage("AI Annotate");
      addHistory({
        toolName: "AI Annotate",
        originalFile: file.name,
        resultFile: "annotations.json",
      });
      toast.success("Annotations generated!");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Annotation failed");
    } finally {
      setIsLoading(false);
    }
  }, [file, incrementUsage, addHistory]);

  const scoreColor = result
    ? result.score >= 8
      ? "#059669"
      : result.score >= 5
        ? "#D97706"
        : "#DC2626"
    : "#7C3AED";
  const scorePercent = result ? (result.score / 10) * 100 : 0;

  return (
    <ToolLayout
      toolName="AI Annotations & Suggestions"
      toolPath="/ai-annotate"
      description="Get AI-generated insights, improvement suggestions, and a quality score for any document."
      icon={PenLine}
      iconColor="#7C3AED"
    >
      <div className="space-y-6">
        <Card className="border-border">
          <CardContent className="pt-6 space-y-4">
            <div
              data-ocid="ai-annotate.dropzone"
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
              className={`relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
                isDragging
                  ? "border-[#7C3AED] bg-[#7C3AED]/5"
                  : file
                    ? "border-[#7C3AED]/50 bg-[#7C3AED]/5"
                    : "border-border hover:border-[#7C3AED]/40 hover:bg-muted/30"
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
                <div className="flex items-center justify-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-[#7C3AED]/15 flex items-center justify-center flex-shrink-0">
                    <PenLine className="w-5 h-5 text-[#7C3AED]" />
                  </div>
                  <div className="text-left flex-1 min-w-0">
                    <p className="font-display font-semibold text-foreground text-sm truncate">
                      {file.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {(file.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setFile(null);
                      setResult(null);
                    }}
                    className="w-7 h-7 rounded-lg bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground flex-shrink-0"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <div className="w-10 h-10 rounded-xl bg-[#7C3AED]/10 flex items-center justify-center">
                    <Upload className="w-5 h-5 text-[#7C3AED]" />
                  </div>
                  <p className="font-ui text-sm text-muted-foreground">
                    Drop PDF or click to browse
                  </p>
                </div>
              )}
            </div>

            <Button
              data-ocid="ai-annotate.submit_button"
              onClick={handleProcess}
              disabled={!file || isLoading}
              className="w-full gap-2"
              style={{ backgroundColor: "#7C3AED" }}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Analyzing…
                </>
              ) : (
                <>
                  <PenLine className="w-4 h-4" />
                  Annotate Document
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {isLoading && (
          <div
            data-ocid="ai-annotate.loading_state"
            className="flex items-center justify-center gap-3 py-6 text-muted-foreground"
          >
            <Loader2 className="w-5 h-5 animate-spin text-[#7C3AED]" />
            <span className="font-ui">Generating annotations…</span>
          </div>
        )}

        {result && !isLoading && (
          <div data-ocid="ai-annotate.success_state" className="space-y-4">
            {/* Score card */}
            <Card className="border-border bg-gradient-to-br from-[#7C3AED]/5 to-transparent">
              <CardContent className="pt-5">
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <p className="font-ui text-xs uppercase tracking-wider text-muted-foreground mb-1">
                      Quality Score
                    </p>
                    <div className="h-3 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{
                          width: `${scorePercent}%`,
                          backgroundColor: scoreColor,
                        }}
                      />
                    </div>
                  </div>
                  <div className="text-center flex-shrink-0">
                    <span
                      className="font-display text-3xl font-bold"
                      style={{ color: scoreColor }}
                    >
                      {result.score}
                    </span>
                    <span className="font-display text-lg text-muted-foreground">
                      /10
                    </span>
                  </div>
                </div>
                {result.justification && (
                  <p className="text-sm text-muted-foreground font-ui mt-3 leading-relaxed">
                    {result.justification}
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Insights */}
            {result.insights.length > 0 && (
              <Card className="border-border">
                <CardContent className="pt-5">
                  <div className="flex items-center gap-2 mb-3">
                    <Lightbulb className="w-4 h-4 text-[#D97706]" />
                    <h3 className="font-display font-semibold text-sm text-foreground">
                      Key Insights
                    </h3>
                  </div>
                  <ul className="space-y-2">
                    {result.insights.map((insight, i) => (
                      <li
                        key={insight.slice(0, 40)}
                        className="flex items-start gap-2 text-sm font-ui text-foreground"
                      >
                        <span className="w-5 h-5 rounded-full bg-[#D97706]/15 text-[#D97706] text-xs flex items-center justify-center flex-shrink-0 mt-0.5 font-bold">
                          {i + 1}
                        </span>
                        {insight}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Suggestions */}
            {result.suggestions.length > 0 && (
              <Card className="border-border">
                <CardContent className="pt-5">
                  <div className="flex items-center gap-2 mb-3">
                    <Wand2 className="w-4 h-4 text-[#7C3AED]" />
                    <h3 className="font-display font-semibold text-sm text-foreground">
                      Suggested Improvements
                    </h3>
                  </div>
                  <ul className="space-y-2">
                    {result.suggestions.map((sug, i) => (
                      <li
                        key={sug.slice(0, 40)}
                        className="flex items-start gap-2 text-sm font-ui text-foreground"
                      >
                        <span className="w-5 h-5 rounded-full bg-[#7C3AED]/15 text-[#7C3AED] text-xs flex items-center justify-center flex-shrink-0 mt-0.5 font-bold">
                          {i + 1}
                        </span>
                        {sug}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
