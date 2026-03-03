import { ToolLayout } from "@/components/tools/ToolLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAddHistory, useIncrementToolUsage } from "@/hooks/useQueries";
import { extractTextFromPDF } from "@/utils/geminiApi";
import { Download, FileCode, Loader2, Upload, X } from "lucide-react";
import { useCallback, useRef, useState } from "react";
import { toast } from "sonner";

export function PDFToMarkdown() {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [markdown, setMarkdown] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const { mutate: incrementUsage } = useIncrementToolUsage();
  const { mutate: addHistory } = useAddHistory();

  const handleFile = useCallback((f: File) => {
    if (!f.name.toLowerCase().endsWith(".pdf")) {
      toast.error("Please upload a PDF file");
      return;
    }
    setFile(f);
    setMarkdown("");
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

  const textToMarkdown = useCallback((text: string): string => {
    const lines = text.split("\n");
    return lines
      .map((line) => {
        const trimmed = line.trim();
        if (!trimmed) return "";
        // All-caps short lines → headings
        if (
          trimmed === trimmed.toUpperCase() &&
          trimmed.length > 3 &&
          trimmed.length < 80 &&
          !/^\d/.test(trimmed)
        ) {
          return `## ${trimmed}`;
        }
        // Lines starting with numbers → numbered list items
        if (/^\d+[\.\)]\s/.test(trimmed)) {
          return `${trimmed}`;
        }
        // Lines starting with bullet chars → list items
        if (/^[•\-\*]\s/.test(trimmed)) {
          return `- ${trimmed.slice(2)}`;
        }
        return trimmed;
      })
      .join("\n");
  }, []);

  const handleProcess = useCallback(async () => {
    if (!file) return;
    setIsLoading(true);
    try {
      const text = await extractTextFromPDF(file);
      if (!text.trim()) {
        toast.error("No text found in PDF");
        return;
      }
      const md = textToMarkdown(text);
      setMarkdown(md);
      incrementUsage("PDF to Markdown");
      addHistory({
        toolName: "PDF to Markdown",
        originalFile: file.name,
        resultFile: file.name.replace(/\.pdf$/i, ".md"),
      });
      toast.success("Converted to Markdown!");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Conversion failed");
    } finally {
      setIsLoading(false);
    }
  }, [file, textToMarkdown, incrementUsage, addHistory]);

  const handleDownload = useCallback(() => {
    if (!markdown || !file) return;
    const blob = new Blob([markdown], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = file.name.replace(/\.pdf$/i, ".md");
    a.click();
    URL.revokeObjectURL(url);
  }, [markdown, file]);

  return (
    <ToolLayout
      toolName="PDF to Markdown"
      toolPath="/pdf-to-markdown"
      description="Convert PDF documents to clean Markdown format. Headings, lists, and paragraphs are auto-detected."
      icon={FileCode}
      iconColor="#6366F1"
    >
      <div className="space-y-6">
        <Card className="border-border">
          <CardContent className="pt-6 space-y-4">
            <div
              data-ocid="pdf-to-md.dropzone"
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
              className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
                isDragging
                  ? "border-[#6366F1] bg-[#6366F1]/5"
                  : file
                    ? "border-[#6366F1]/50 bg-[#6366F1]/5"
                    : "border-border hover:border-[#6366F1]/40 hover:bg-muted/30"
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
                  <div className="w-9 h-9 rounded-lg bg-[#6366F1]/15 flex items-center justify-center flex-shrink-0">
                    <FileCode className="w-5 h-5 text-[#6366F1]" />
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
                      setMarkdown("");
                    }}
                    className="w-7 h-7 rounded-lg bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground flex-shrink-0"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <div className="w-10 h-10 rounded-xl bg-[#6366F1]/10 flex items-center justify-center">
                    <Upload className="w-5 h-5 text-[#6366F1]" />
                  </div>
                  <p className="font-ui text-sm text-muted-foreground">
                    Drop PDF or click to browse
                  </p>
                </div>
              )}
            </div>

            <Button
              data-ocid="pdf-to-md.submit_button"
              onClick={handleProcess}
              disabled={!file || isLoading}
              className="w-full gap-2"
              style={{ backgroundColor: "#6366F1" }}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Converting…
                </>
              ) : (
                <>
                  <FileCode className="w-4 h-4" />
                  Convert to Markdown
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {isLoading && (
          <div
            data-ocid="pdf-to-md.loading_state"
            className="flex items-center justify-center gap-3 py-6 text-muted-foreground"
          >
            <Loader2 className="w-5 h-5 animate-spin text-[#6366F1]" />
            <span className="font-ui">Converting to Markdown…</span>
          </div>
        )}

        {markdown && !isLoading && (
          <Card
            data-ocid="pdf-to-md.success_state"
            className="border-[#6366F1]/20"
          >
            <CardContent className="pt-5">
              <div className="flex items-center justify-between mb-3">
                <span className="font-display font-semibold text-sm text-foreground">
                  Markdown Output
                </span>
                <Button
                  onClick={handleDownload}
                  className="gap-2"
                  style={{ backgroundColor: "#6366F1" }}
                  data-ocid="pdf-to-md.primary_button"
                >
                  <Download className="w-4 h-4" />
                  Download .md
                </Button>
              </div>
              <pre
                className="bg-muted/40 rounded-lg p-4 text-xs font-mono text-foreground overflow-x-auto max-h-64 overflow-y-auto whitespace-pre-wrap"
                style={{ scrollbarWidth: "thin" }}
              >
                {markdown.slice(0, 3000)}
                {markdown.length > 3000 ? "\n\n… (truncated for preview)" : ""}
              </pre>
            </CardContent>
          </Card>
        )}
      </div>
    </ToolLayout>
  );
}
