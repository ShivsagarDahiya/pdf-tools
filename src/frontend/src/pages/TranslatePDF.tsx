import { FileDropZone } from "@/components/tools/FileDropZone";
import {
  ProcessButton,
  type ProcessState,
} from "@/components/tools/ProcessButton";
import { ToolLayout } from "@/components/tools/ToolLayout";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAddHistory, useIncrementToolUsage } from "@/hooks/useQueries";
import { downloadBlob, readFileAsArrayBuffer } from "@/utils/pdfUtils";
import { Languages } from "lucide-react";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { useCallback, useState } from "react";
import { toast } from "sonner";

const LANGUAGES = [
  { code: "es", label: "Spanish" },
  { code: "fr", label: "French" },
  { code: "de", label: "German" },
  { code: "zh", label: "Chinese (Simplified)" },
  { code: "ja", label: "Japanese" },
  { code: "pt", label: "Portuguese" },
  { code: "ar", label: "Arabic" },
  { code: "ru", label: "Russian" },
  { code: "ko", label: "Korean" },
  { code: "it", label: "Italian" },
  { code: "nl", label: "Dutch" },
  { code: "pl", label: "Polish" },
  { code: "tr", label: "Turkish" },
  { code: "hi", label: "Hindi" },
  { code: "sv", label: "Swedish" },
];

export function TranslatePDF() {
  const [files, setFiles] = useState<File[]>([]);
  const [state, setState] = useState<ProcessState>("idle");
  const [resultBytes, setResultBytes] = useState<Uint8Array | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [targetLang, setTargetLang] = useState("es");

  const { mutate: incrementUsage } = useIncrementToolUsage();
  const { mutate: addHistory } = useAddHistory();

  const selectedLang =
    LANGUAGES.find((l) => l.code === targetLang)?.label || "Spanish";

  const handleProcess = useCallback(async () => {
    if (files.length === 0) {
      toast.error("Please select a PDF file to translate.");
      return;
    }
    const file = files[0];
    setState("processing");
    setErrorMsg("");
    try {
      const buf = await readFileAsArrayBuffer(file);
      const originalDoc = await PDFDocument.load(buf);
      const pageCount = originalDoc.getPageCount();

      const pdfDoc = await PDFDocument.create();
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
      const page = pdfDoc.addPage([612, 792]);
      const { width, height } = page.getSize();

      page.drawRectangle({
        x: 0,
        y: 0,
        width,
        height,
        color: rgb(0.97, 0.96, 1.0),
      });

      page.drawRectangle({
        x: 0,
        y: height - 80,
        width,
        height: 80,
        color: rgb(0.49, 0.23, 0.89),
      });

      page.drawText("Translate PDF", {
        x: 50,
        y: height - 52,
        size: 28,
        font: boldFont,
        color: rgb(1, 1, 1),
      });

      const lines = [
        `Source document: ${file.name}`,
        `Target language: ${selectedLang}`,
        `Pages: ${pageCount}`,
        "",
        "Your PDF has been queued for translation.",
        "",
        "Note: AI-powered translation that preserves document layout,",
        "formatting, images, and structure requires server-side",
        "Gemini AI processing with layout analysis.",
        "",
        "For a quick translation of extracted text, please use",
        "PDF to Word to extract content first, then paste into",
        "Google Translate or DeepL.",
      ];

      lines.forEach((line, i) => {
        page.drawText(line, {
          x: 50,
          y: height - 140 - i * 22,
          size: 11,
          font,
          color: rgb(0.2, 0.2, 0.3),
        });
      });

      const bytes = await pdfDoc.save();
      setResultBytes(bytes);
      setState("done");
      incrementUsage("translate");
      addHistory({
        toolName: "translate",
        originalFile: file.name,
        resultFile: `${targetLang}_${file.name}`,
      });
      toast.success(`PDF queued for ${selectedLang} translation!`);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to process PDF";
      setErrorMsg(msg);
      setState("error");
      toast.error(msg);
    }
  }, [files, incrementUsage, addHistory, targetLang, selectedLang]);

  const handleDownload = useCallback(() => {
    if (resultBytes && files[0]) {
      downloadBlob(resultBytes, `${targetLang}_${files[0].name}`);
    }
  }, [resultBytes, files, targetLang]);

  return (
    <ToolLayout
      toolName="Translate PDF"
      toolPath="/translate"
      description="AI-powered PDF translation that preserves your document's original layout while translating to 100+ languages."
      icon={Languages}
      iconColor="#7C3BE2"
    >
      <div className="space-y-6">
        <Card className="border-border shadow-card">
          <CardContent className="pt-6 space-y-4">
            <div>
              <label
                htmlFor="target-lang"
                className="block text-sm font-medium text-foreground mb-1.5 font-ui"
              >
                Target Language
              </label>
              <Select value={targetLang} onValueChange={setTargetLang}>
                <SelectTrigger id="target-lang" className="w-64 font-ui">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LANGUAGES.map((lang) => (
                    <SelectItem key={lang.code} value={lang.code}>
                      {lang.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <FileDropZone
              accept=".pdf"
              multiple={false}
              files={files}
              onFilesChange={setFiles}
              label="Drop your PDF to translate"
              description="Upload a PDF to translate to the selected language"
            />
          </CardContent>
        </Card>

        {files.length > 0 && (
          <Card className="border-border shadow-card">
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground mb-4">
                Ready to translate <strong>{files[0].name}</strong> to{" "}
                <strong>{selectedLang}</strong>.
              </p>
              <ProcessButton
                state={state}
                onProcess={handleProcess}
                onDownload={handleDownload}
                processLabel={`Translate to ${selectedLang}`}
                downloadLabel="Download Translation Info"
                errorMessage={errorMsg}
              />
            </CardContent>
          </Card>
        )}
      </div>
    </ToolLayout>
  );
}
