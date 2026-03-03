import { ToolLayout } from "@/components/tools/ToolLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAddHistory, useIncrementToolUsage } from "@/hooks/useQueries";
import { extractTextFromPDF } from "@/utils/geminiApi";
import { AlignLeft, Download, Loader2, Upload, X } from "lucide-react";
import { useCallback, useRef, useState } from "react";
import { toast } from "sonner";

function textToRTF(text: string): string {
  // Escape RTF special chars
  const escaped = text
    .replace(/\\/g, "\\\\")
    .replace(/\{/g, "\\{")
    .replace(/\}/g, "\\}")
    .replace(/\n\n/g, "\\par\\par ")
    .replace(/\n/g, "\\par ");

  return `{\\rtf1\\ansi\\ansicpg1252\\deff0
{\\fonttbl{\\f0\\froman\\fcharset0 Times New Roman;}}
{\\colortbl ;\\red0\\green0\\blue0;}
\\viewkind4\\uc1\\pard\\cf1\\f0\\fs24
${escaped}
\\par}`;
}

export function PDFToRTF() {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [rtfContent, setRtfContent] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const { mutate: incrementUsage } = useIncrementToolUsage();
  const { mutate: addHistory } = useAddHistory();

  const handleFile = useCallback((f: File) => {
    if (!f.name.toLowerCase().endsWith(".pdf")) {
      toast.error("Please upload a PDF file");
      return;
    }
    setFile(f);
    setRtfContent("");
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
      const rtf = textToRTF(text);
      setRtfContent(rtf);
      incrementUsage("PDF to RTF");
      addHistory({
        toolName: "PDF to RTF",
        originalFile: file.name,
        resultFile: file.name.replace(/\.pdf$/i, ".rtf"),
      });
      toast.success("Converted to RTF!");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Conversion failed");
    } finally {
      setIsLoading(false);
    }
  }, [file, incrementUsage, addHistory]);

  const handleDownload = useCallback(() => {
    if (!rtfContent || !file) return;
    const blob = new Blob([rtfContent], { type: "application/rtf" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = file.name.replace(/\.pdf$/i, ".rtf");
    a.click();
    URL.revokeObjectURL(url);
  }, [rtfContent, file]);

  return (
    <ToolLayout
      toolName="PDF to RTF"
      toolPath="/pdf-to-rtf"
      description="Convert PDF documents to Rich Text Format (.rtf). Compatible with Word, OpenOffice, and most text editors."
      icon={AlignLeft}
      iconColor="#8B5CF6"
    >
      <div className="space-y-6">
        <Card className="border-border">
          <CardContent className="pt-6 space-y-4">
            <div
              data-ocid="pdf-to-rtf.dropzone"
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
                  ? "border-[#8B5CF6] bg-[#8B5CF6]/5"
                  : file
                    ? "border-[#8B5CF6]/50 bg-[#8B5CF6]/5"
                    : "border-border hover:border-[#8B5CF6]/40 hover:bg-muted/30"
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
                  <div className="w-9 h-9 rounded-lg bg-[#8B5CF6]/15 flex items-center justify-center flex-shrink-0">
                    <AlignLeft className="w-5 h-5 text-[#8B5CF6]" />
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
                      setRtfContent("");
                    }}
                    className="w-7 h-7 rounded-lg bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground flex-shrink-0"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <div className="w-10 h-10 rounded-xl bg-[#8B5CF6]/10 flex items-center justify-center">
                    <Upload className="w-5 h-5 text-[#8B5CF6]" />
                  </div>
                  <p className="font-ui text-sm text-muted-foreground">
                    Drop PDF or click to browse
                  </p>
                </div>
              )}
            </div>

            <Button
              data-ocid="pdf-to-rtf.submit_button"
              onClick={handleProcess}
              disabled={!file || isLoading}
              className="w-full gap-2"
              style={{ backgroundColor: "#8B5CF6" }}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Converting…
                </>
              ) : (
                <>
                  <AlignLeft className="w-4 h-4" />
                  Convert to RTF
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {isLoading && (
          <div
            data-ocid="pdf-to-rtf.loading_state"
            className="flex items-center justify-center gap-3 py-6 text-muted-foreground"
          >
            <Loader2 className="w-5 h-5 animate-spin text-[#8B5CF6]" />
            <span className="font-ui">Converting to RTF…</span>
          </div>
        )}

        {rtfContent && !isLoading && (
          <Card
            data-ocid="pdf-to-rtf.success_state"
            className="border-[#8B5CF6]/20"
          >
            <CardContent className="pt-5">
              <div className="flex items-center justify-between mb-3">
                <span className="font-display font-semibold text-sm text-foreground">
                  RTF Output Ready
                </span>
                <Button
                  onClick={handleDownload}
                  className="gap-2"
                  style={{ backgroundColor: "#8B5CF6" }}
                  data-ocid="pdf-to-rtf.primary_button"
                >
                  <Download className="w-4 h-4" />
                  Download .rtf
                </Button>
              </div>
              <div className="bg-[#8B5CF6]/5 rounded-lg p-4 text-sm font-ui text-foreground border border-[#8B5CF6]/10">
                <p className="text-muted-foreground">
                  RTF file generated successfully. Click "Download .rtf" to save
                  it.
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {(rtfContent.length / 1024).toFixed(1)} KB
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </ToolLayout>
  );
}
