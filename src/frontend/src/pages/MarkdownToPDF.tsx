import { ToolLayout } from "@/components/tools/ToolLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useAddHistory, useIncrementToolUsage } from "@/hooks/useQueries";
import { FileDown, Loader2, Upload, X } from "lucide-react";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { useCallback, useRef, useState } from "react";
import { toast } from "sonner";

function parseMarkdownToPdfItems(
  md: string,
): Array<{ text: string; isHeading: boolean; isBullet: boolean }> {
  return md
    .split("\n")
    .filter((l) => l.trim().length > 0)
    .map((line) => {
      const trimmed = line.trim();
      if (/^#{1,6}\s/.test(trimmed)) {
        return {
          text: trimmed.replace(/^#{1,6}\s/, ""),
          isHeading: true,
          isBullet: false,
        };
      }
      if (/^[-*]\s/.test(trimmed)) {
        return {
          text: `• ${trimmed.slice(2)}`,
          isHeading: false,
          isBullet: true,
        };
      }
      if (/^\d+\.\s/.test(trimmed)) {
        return { text: trimmed, isHeading: false, isBullet: true };
      }
      return {
        text: trimmed
          .replace(/\*\*(.*?)\*\*/g, "$1")
          .replace(/\*(.*?)\*/g, "$1")
          .replace(/`(.*?)`/g, "$1"),
        isHeading: false,
        isBullet: false,
      };
    });
}

export function MarkdownToPDF() {
  const [mdText, setMdText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { mutate: incrementUsage } = useIncrementToolUsage();
  const { mutate: addHistory } = useAddHistory();

  const handleFile = useCallback(async (f: File) => {
    if (
      !f.name.toLowerCase().endsWith(".md") &&
      !f.name.toLowerCase().endsWith(".txt")
    ) {
      toast.error("Please upload a .md or .txt file");
      return;
    }
    setFile(f);
    const text = await f.text();
    setMdText(text);
    toast.success("File loaded");
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
    if (!mdText.trim()) return;
    setIsLoading(true);
    try {
      const pdfDoc = await PDFDocument.create();
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

      const items = parseMarkdownToPdfItems(mdText);
      const pageWidth = 595;
      const pageHeight = 842;
      const margin = 60;
      const maxWidth = pageWidth - margin * 2;

      let page = pdfDoc.addPage([pageWidth, pageHeight]);
      let y = pageHeight - margin;

      for (const item of items) {
        const fontSize = item.isHeading ? 16 : 11;
        const lineHeight = item.isHeading ? 26 : 16;
        const usedFont = item.isHeading ? boldFont : font;
        const color = item.isHeading ? rgb(0.1, 0.1, 0.1) : rgb(0.2, 0.2, 0.2);

        // Word wrap
        const words = item.text.split(" ");
        let currentLine = "";
        const lines: string[] = [];
        for (const word of words) {
          const test = currentLine ? `${currentLine} ${word}` : word;
          const w = usedFont.widthOfTextAtSize(test, fontSize);
          if (w > maxWidth && currentLine) {
            lines.push(currentLine);
            currentLine = word;
          } else {
            currentLine = test;
          }
        }
        if (currentLine) lines.push(currentLine);

        if (item.isHeading) y -= 8;

        for (const lineText of lines) {
          if (y < margin + lineHeight) {
            page = pdfDoc.addPage([pageWidth, pageHeight]);
            y = pageHeight - margin;
          }
          page.drawText(lineText, {
            x: margin,
            y,
            size: fontSize,
            font: usedFont,
            color,
          });
          y -= lineHeight;
        }
        if (item.isHeading) y -= 4;
      }

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes.buffer as ArrayBuffer], {
        type: "application/pdf",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${file?.name.replace(/\.(md|txt)$/i, "") || "document"}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      incrementUsage("Markdown to PDF");
      addHistory({
        toolName: "Markdown to PDF",
        originalFile: file?.name || "markdown.md",
        resultFile: "document.pdf",
      });
      toast.success("PDF created!");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Conversion failed");
    } finally {
      setIsLoading(false);
    }
  }, [mdText, file, incrementUsage, addHistory]);

  return (
    <ToolLayout
      toolName="Markdown to PDF"
      toolPath="/markdown-to-pdf"
      description="Convert Markdown to a clean, well-formatted PDF. Supports headings, bold, lists, and paragraphs."
      icon={FileDown}
      iconColor="#10B981"
    >
      <div className="space-y-6">
        <Card className="border-border">
          <CardContent className="pt-6 space-y-4">
            {/* File upload option */}
            <div className="flex items-center gap-3">
              <div
                data-ocid="md-to-pdf.dropzone"
                onDrop={handleDrop}
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                className={`flex-1 border-2 border-dashed rounded-xl py-4 px-5 text-center transition-all ${
                  isDragging
                    ? "border-[#10B981] bg-[#10B981]/5"
                    : "border-border hover:border-[#10B981]/40 hover:bg-muted/30"
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".md,.txt"
                  className="hidden"
                  onChange={(e) =>
                    e.target.files?.[0] && handleFile(e.target.files[0])
                  }
                />
                <div className="flex items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <Upload className="w-4 h-4 text-[#10B981]" />
                    <span className="font-ui text-sm">
                      {file ? file.name : "Upload .md or .txt"}
                    </span>
                  </button>
                  {file && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setFile(null);
                      }}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div>
              <label
                htmlFor="md-textarea"
                className="font-ui text-xs text-muted-foreground uppercase tracking-wider mb-1.5 block"
              >
                Markdown Content
              </label>
              <Textarea
                id="md-textarea"
                data-ocid="md-to-pdf.textarea"
                value={mdText}
                onChange={(e) => setMdText(e.target.value)}
                placeholder={
                  "# My Document\n\n## Introduction\n\nWrite or paste Markdown here...\n\n- Item one\n- Item two\n\n**Bold text** and *italic text* are supported."
                }
                className="min-h-[200px] font-mono text-sm resize-y"
              />
            </div>

            <Button
              data-ocid="md-to-pdf.submit_button"
              onClick={handleProcess}
              disabled={!mdText.trim() || isLoading}
              className="w-full gap-2"
              style={{ backgroundColor: "#10B981" }}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creating PDF…
                </>
              ) : (
                <>
                  <FileDown className="w-4 h-4" />
                  Convert to PDF
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {isLoading && (
          <div
            data-ocid="md-to-pdf.loading_state"
            className="flex items-center justify-center gap-3 py-6 text-muted-foreground"
          >
            <Loader2 className="w-5 h-5 animate-spin text-[#10B981]" />
            <span className="font-ui">Building PDF…</span>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
