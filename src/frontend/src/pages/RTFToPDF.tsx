import { ToolLayout } from "@/components/tools/ToolLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAddHistory, useIncrementToolUsage } from "@/hooks/useQueries";
import { AlignRight, Download, Loader2, Upload, X } from "lucide-react";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { useCallback, useRef, useState } from "react";
import { toast } from "sonner";

function stripRTF(rtf: string): string {
  // Remove RTF control words and groups
  return rtf
    .replace(/\{[^{}]*\}/g, "") // remove grouped elements
    .replace(/\\[a-z]+\d*\s?/g, " ") // remove control words
    .replace(/\\'/g, "'") // apostrophes
    .replace(/\\/g, "") // remaining backslashes
    .replace(/\s{2,}/g, "\n") // compress whitespace
    .trim();
}

export function RTFToPDF() {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const { mutate: incrementUsage } = useIncrementToolUsage();
  const { mutate: addHistory } = useAddHistory();

  const handleFile = useCallback((f: File) => {
    if (
      !f.name.toLowerCase().endsWith(".rtf") &&
      !f.name.toLowerCase().endsWith(".txt")
    ) {
      toast.error("Please upload a .rtf or .txt file");
      return;
    }
    setFile(f);
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
      const rawText = await file.text();
      const plainText = file.name.toLowerCase().endsWith(".rtf")
        ? stripRTF(rawText)
        : rawText;

      if (!plainText.trim()) {
        toast.error("No text content found");
        return;
      }

      const pdfDoc = await PDFDocument.create();
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const pageWidth = 595;
      const pageHeight = 842;
      const margin = 60;
      const maxWidth = pageWidth - margin * 2;
      const fontSize = 11;
      const lineHeight = 16;

      let page = pdfDoc.addPage([pageWidth, pageHeight]);
      let y = pageHeight - margin;

      const paragraphs = plainText
        .split("\n")
        .filter((l) => l.trim().length > 0);
      for (const para of paragraphs) {
        const words = para.split(" ");
        let currentLine = "";
        const lines: string[] = [];
        for (const word of words) {
          const test = currentLine ? `${currentLine} ${word}` : word;
          const w = font.widthOfTextAtSize(test, fontSize);
          if (w > maxWidth && currentLine) {
            lines.push(currentLine);
            currentLine = word;
          } else {
            currentLine = test;
          }
        }
        if (currentLine) lines.push(currentLine);

        for (const lineText of lines) {
          if (y < margin + lineHeight) {
            page = pdfDoc.addPage([pageWidth, pageHeight]);
            y = pageHeight - margin;
          }
          page.drawText(lineText, {
            x: margin,
            y,
            size: fontSize,
            font,
            color: rgb(0.15, 0.15, 0.15),
          });
          y -= lineHeight;
        }
        y -= 4; // paragraph spacing
      }

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes.buffer as ArrayBuffer], {
        type: "application/pdf",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = file.name.replace(/\.(rtf|txt)$/i, ".pdf");
      a.click();
      URL.revokeObjectURL(url);
      incrementUsage("RTF to PDF");
      addHistory({
        toolName: "RTF to PDF",
        originalFile: file.name,
        resultFile: file.name.replace(/\.(rtf|txt)$/i, ".pdf"),
      });
      toast.success("PDF created!");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Conversion failed");
    } finally {
      setIsLoading(false);
    }
  }, [file, incrementUsage, addHistory]);

  return (
    <ToolLayout
      toolName="RTF to PDF"
      toolPath="/rtf-to-pdf"
      description="Convert Rich Text Format (.rtf) files to PDF. Strip formatting codes and generate a clean document."
      icon={AlignRight}
      iconColor="#EC4899"
    >
      <div className="space-y-6">
        <Card className="border-border">
          <CardContent className="pt-6 space-y-4">
            <div
              data-ocid="rtf-to-pdf.dropzone"
              onDrop={handleDrop}
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              className={`border-2 border-dashed rounded-xl p-10 text-center transition-all ${
                isDragging
                  ? "border-[#EC4899] bg-[#EC4899]/5"
                  : file
                    ? "border-[#EC4899]/50 bg-[#EC4899]/5"
                    : "border-border hover:border-[#EC4899]/40 hover:bg-muted/30"
              }`}
            >
              <input
                ref={inputRef}
                type="file"
                accept=".rtf,.txt"
                className="hidden"
                onChange={(e) =>
                  e.target.files?.[0] && handleFile(e.target.files[0])
                }
              />
              {file ? (
                <div className="flex items-center justify-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-[#EC4899]/15 flex items-center justify-center flex-shrink-0">
                    <AlignRight className="w-5 h-5 text-[#EC4899]" />
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
                    }}
                    className="w-7 h-7 rounded-lg bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground flex-shrink-0"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-[#EC4899]/10 flex items-center justify-center">
                    <Upload className="w-6 h-6 text-[#EC4899]" />
                  </div>
                  <div>
                    <p className="font-display font-semibold text-foreground">
                      Drop your RTF file here
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Supports .rtf and .txt files
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => inputRef.current?.click()}
                    className="text-sm text-[#EC4899] hover:underline font-ui"
                  >
                    Browse Files
                  </button>
                </div>
              )}
            </div>

            <Button
              data-ocid="rtf-to-pdf.submit_button"
              onClick={handleProcess}
              disabled={!file || isLoading}
              className="w-full gap-2"
              style={{ backgroundColor: "#EC4899" }}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Converting to PDF…
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  Convert & Download PDF
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {isLoading && (
          <div
            data-ocid="rtf-to-pdf.loading_state"
            className="flex items-center justify-center gap-3 py-6 text-muted-foreground"
          >
            <Loader2 className="w-5 h-5 animate-spin text-[#EC4899]" />
            <span className="font-ui">Building PDF from RTF…</span>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
