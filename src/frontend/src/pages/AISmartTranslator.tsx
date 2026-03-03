import { ToolLayout } from "@/components/tools/ToolLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useAddHistory, useIncrementToolUsage } from "@/hooks/useQueries";
import { callGemini, extractTextFromPDF } from "@/utils/geminiApi";
import {
  Check,
  Copy,
  Download,
  Languages,
  Loader2,
  Upload,
  X,
} from "lucide-react";
import { useCallback, useRef, useState } from "react";
import { toast } from "sonner";

const LANGUAGES = [
  "Spanish",
  "French",
  "German",
  "Italian",
  "Portuguese",
  "Russian",
  "Chinese (Simplified)",
  "Chinese (Traditional)",
  "Japanese",
  "Korean",
  "Arabic",
  "Hindi",
  "Bengali",
  "Turkish",
  "Dutch",
  "Polish",
  "Swedish",
  "Norwegian",
  "Danish",
  "Finnish",
  "Greek",
  "Czech",
  "Romanian",
  "Hungarian",
  "Ukrainian",
  "Thai",
  "Vietnamese",
  "Indonesian",
];

export function AISmartTranslator() {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [language, setLanguage] = useState("Spanish");
  const [isLoading, setIsLoading] = useState(false);
  const [translated, setTranslated] = useState("");
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
    setTranslated("");
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
    setTranslated("");
    try {
      const text = await extractTextFromPDF(file);
      if (!text.trim()) {
        toast.error("No text found in PDF");
        return;
      }
      const truncated = text.slice(0, 10000);
      const prompt = `Translate the following document text to ${language}. Preserve formatting where possible. Text:\n\n${truncated}`;
      const result = await callGemini(prompt);
      setTranslated(result);
      incrementUsage("Smart Translator");
      addHistory({
        toolName: "Smart Translator",
        originalFile: file.name,
        resultFile: `translated_${language}.txt`,
      });
      toast.success(`Translated to ${language}!`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Translation failed");
    } finally {
      setIsLoading(false);
    }
  }, [file, language, incrementUsage, addHistory]);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(translated).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [translated]);

  const handleDownload = useCallback(() => {
    const blob = new Blob([translated], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `translated_${language.toLowerCase().replace(/\s/g, "_")}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }, [translated, language]);

  return (
    <ToolLayout
      toolName="Smart Translator"
      toolPath="/ai-smart-translate"
      description="Multi-language PDF translation powered by AI. Preserve formatting while converting to 28+ languages."
      icon={Languages}
      iconColor="#0891B2"
    >
      <div className="space-y-6">
        <Card className="border-border">
          <CardContent className="pt-6 space-y-4">
            {/* Upload */}
            <div
              data-ocid="ai-translate.dropzone"
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
              className={`relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200 ${
                isDragging
                  ? "border-[#0891B2] bg-[#0891B2]/5"
                  : file
                    ? "border-[#0891B2]/50 bg-[#0891B2]/5"
                    : "border-border hover:border-[#0891B2]/40 hover:bg-muted/30"
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
                  <div className="w-9 h-9 rounded-lg bg-[#0891B2]/15 flex items-center justify-center">
                    <Languages className="w-5 h-5 text-[#0891B2]" />
                  </div>
                  <div className="text-left">
                    <p className="font-display font-semibold text-foreground text-sm">
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
                      setTranslated("");
                    }}
                    className="ml-auto w-7 h-7 rounded-lg bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <div className="w-10 h-10 rounded-xl bg-[#0891B2]/10 flex items-center justify-center">
                    <Upload className="w-5 h-5 text-[#0891B2]" />
                  </div>
                  <p className="font-ui text-sm text-muted-foreground">
                    Drop PDF here or click to browse
                  </p>
                </div>
              )}
            </div>

            {/* Language selector */}
            <div className="flex items-center gap-3">
              <span className="font-ui text-sm text-muted-foreground whitespace-nowrap">
                Translate to:
              </span>
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger
                  data-ocid="ai-translate.select"
                  className="flex-1"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LANGUAGES.map((lang) => (
                    <SelectItem key={lang} value={lang}>
                      {lang}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button
              data-ocid="ai-translate.submit_button"
              onClick={handleProcess}
              disabled={!file || isLoading}
              className="w-full gap-2"
              style={{ backgroundColor: "#0891B2" }}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Translating…
                </>
              ) : (
                <>
                  <Languages className="w-4 h-4" />
                  Translate to {language}
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {isLoading && (
          <div
            data-ocid="ai-translate.loading_state"
            className="flex items-center justify-center gap-3 py-6 text-muted-foreground"
          >
            <Loader2 className="w-5 h-5 animate-spin text-[#0891B2]" />
            <span className="font-ui">Translating your document…</span>
          </div>
        )}

        {translated && !isLoading && (
          <Card
            data-ocid="ai-translate.success_state"
            className="border-[#0891B2]/20"
          >
            <CardContent className="pt-5">
              <div className="flex items-center justify-between mb-3">
                <span className="font-display font-semibold text-foreground text-sm">
                  Translation — {language}
                </span>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCopy}
                    className="gap-1.5"
                    data-ocid="ai-translate.secondary_button"
                  >
                    {copied ? (
                      <Check className="w-3.5 h-3.5 text-green-500" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                    {copied ? "Copied!" : "Copy"}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDownload}
                    className="gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5" />
                    .txt
                  </Button>
                </div>
              </div>
              <Textarea
                value={translated}
                readOnly
                className="min-h-[240px] font-ui text-sm resize-y"
              />
            </CardContent>
          </Card>
        )}
      </div>
    </ToolLayout>
  );
}
