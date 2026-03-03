import { ToolLayout } from "@/components/tools/ToolLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAddHistory, useIncrementToolUsage } from "@/hooks/useQueries";
import { extractTextFromPDF } from "@/utils/geminiApi";
import { Code2, Download, Loader2, Upload, X } from "lucide-react";
import { useCallback, useRef, useState } from "react";
import { toast } from "sonner";

export function PDFToHTML() {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [htmlContent, setHtmlContent] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const { mutate: incrementUsage } = useIncrementToolUsage();
  const { mutate: addHistory } = useAddHistory();

  const handleFile = useCallback((f: File) => {
    if (!f.name.toLowerCase().endsWith(".pdf")) {
      toast.error("Please upload a PDF file");
      return;
    }
    setFile(f);
    setHtmlContent("");
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
    try {
      const text = await extractTextFromPDF(file);
      if (!text.trim()) {
        toast.error("No text found in PDF");
        return;
      }
      // Convert to HTML: wrap paragraphs in <p> tags, detect headings
      const lines = text.split("\n").filter((l) => l.trim().length > 0);
      const bodyHtml = lines
        .map((line) => {
          const trimmed = line.trim();
          if (
            trimmed === trimmed.toUpperCase() &&
            trimmed.length > 4 &&
            trimmed.length < 80
          ) {
            return `  <h2>${trimmed}</h2>`;
          }
          return `  <p>${trimmed}</p>`;
        })
        .join("\n");

      const fileName = file.name.replace(/\.pdf$/i, "");
      const fullHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${fileName}</title>
  <style>
    body { font-family: Georgia, serif; max-width: 800px; margin: 0 auto; padding: 2rem; line-height: 1.7; color: #222; }
    h2 { font-size: 1.3rem; font-weight: 700; margin-top: 2rem; color: #111; }
    p { margin: 0.5rem 0; }
  </style>
</head>
<body>
${bodyHtml}
</body>
</html>`;
      setHtmlContent(fullHtml);
      incrementUsage("PDF to HTML");
      addHistory({
        toolName: "PDF to HTML",
        originalFile: file.name,
        resultFile: `${fileName}.html`,
      });
      toast.success("Converted to HTML!");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Conversion failed");
    } finally {
      setIsLoading(false);
    }
  }, [file, incrementUsage, addHistory]);

  const handleDownload = useCallback(() => {
    if (!htmlContent || !file) return;
    const blob = new Blob([htmlContent], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = file.name.replace(/\.pdf$/i, ".html");
    a.click();
    URL.revokeObjectURL(url);
  }, [htmlContent, file]);

  return (
    <ToolLayout
      toolName="PDF to HTML"
      toolPath="/pdf-to-html"
      description="Convert PDF documents to clean HTML files with proper heading and paragraph structure."
      icon={Code2}
      iconColor="#F59E0B"
    >
      <div className="space-y-6">
        <Card className="border-border">
          <CardContent className="pt-6 space-y-4">
            <div
              data-ocid="pdf-to-html.dropzone"
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
                  ? "border-[#F59E0B] bg-[#F59E0B]/5"
                  : file
                    ? "border-[#F59E0B]/50 bg-[#F59E0B]/5"
                    : "border-border hover:border-[#F59E0B]/40 hover:bg-muted/30"
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
                  <div className="w-9 h-9 rounded-lg bg-[#F59E0B]/15 flex items-center justify-center flex-shrink-0">
                    <Code2 className="w-5 h-5 text-[#F59E0B]" />
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
                      setHtmlContent("");
                    }}
                    className="w-7 h-7 rounded-lg bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground flex-shrink-0"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <div className="w-10 h-10 rounded-xl bg-[#F59E0B]/10 flex items-center justify-center">
                    <Upload className="w-5 h-5 text-[#F59E0B]" />
                  </div>
                  <p className="font-ui text-sm text-muted-foreground">
                    Drop PDF or click to browse
                  </p>
                </div>
              )}
            </div>

            <Button
              data-ocid="pdf-to-html.submit_button"
              onClick={handleProcess}
              disabled={!file || isLoading}
              className="w-full gap-2"
              style={{ backgroundColor: "#F59E0B" }}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Converting…
                </>
              ) : (
                <>
                  <Code2 className="w-4 h-4" />
                  Convert to HTML
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {isLoading && (
          <div
            data-ocid="pdf-to-html.loading_state"
            className="flex items-center justify-center gap-3 py-6 text-muted-foreground"
          >
            <Loader2 className="w-5 h-5 animate-spin text-[#F59E0B]" />
            <span className="font-ui">Extracting and converting…</span>
          </div>
        )}

        {htmlContent && !isLoading && (
          <Card
            data-ocid="pdf-to-html.success_state"
            className="border-[#F59E0B]/20"
          >
            <CardContent className="pt-5">
              <div className="flex items-center justify-between mb-3">
                <span className="font-display font-semibold text-sm text-foreground">
                  HTML Output
                </span>
                <Button
                  onClick={handleDownload}
                  className="gap-2"
                  style={{ backgroundColor: "#F59E0B" }}
                  data-ocid="pdf-to-html.primary_button"
                >
                  <Download className="w-4 h-4" />
                  Download .html
                </Button>
              </div>
              <pre
                className="bg-muted/40 rounded-lg p-4 text-xs font-mono text-foreground overflow-x-auto max-h-64 overflow-y-auto"
                style={{ scrollbarWidth: "thin" }}
              >
                {htmlContent.slice(0, 2000)}
                {htmlContent.length > 2000
                  ? "\n\n… (truncated for preview)"
                  : ""}
              </pre>
            </CardContent>
          </Card>
        )}
      </div>
    </ToolLayout>
  );
}
