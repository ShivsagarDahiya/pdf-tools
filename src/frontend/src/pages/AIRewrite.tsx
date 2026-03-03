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
import { Check, Copy, Download, Loader2, Wand2, X } from "lucide-react";
import { useCallback, useRef, useState } from "react";
import { toast } from "sonner";

const MODES = [
  {
    value: "Simplify",
    label: "Simplify",
    desc: "Plain, easy-to-understand language",
  },
  {
    value: "Condense",
    label: "Condense",
    desc: "Shorter without losing key points",
  },
  { value: "Formal", label: "Formal", desc: "Professional and academic tone" },
  { value: "Casual", label: "Casual", desc: "Conversational and friendly" },
  { value: "Expand", label: "Expand", desc: "Add more detail and context" },
];

export function AIRewrite() {
  const [inputText, setInputText] = useState("");
  const [rewritten, setRewritten] = useState("");
  const [mode, setMode] = useState("Simplify");
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { mutate: incrementUsage } = useIncrementToolUsage();
  const { mutate: addHistory } = useAddHistory();

  const handleFileUpload = useCallback(async (f: File) => {
    setFile(f);
    setRewritten("");
    try {
      if (f.name.toLowerCase().endsWith(".pdf")) {
        const text = await extractTextFromPDF(f);
        setInputText(text.slice(0, 8000));
        toast.success("PDF text extracted");
      } else {
        const text = await f.text();
        setInputText(text.slice(0, 8000));
        toast.success("File loaded");
      }
    } catch {
      toast.error("Failed to read file");
    }
  }, []);

  const handleProcess = useCallback(async () => {
    if (!inputText.trim()) return;
    setIsLoading(true);
    setRewritten("");
    try {
      const prompt = `Rewrite the following text in ${mode} style. Return only the rewritten text:\n\n${inputText.slice(0, 8000)}`;
      const result = await callGemini(prompt);
      setRewritten(result);
      incrementUsage("AI Rewrite");
      addHistory({
        toolName: "AI Rewrite",
        originalFile: file?.name || "text",
        resultFile: "rewritten.txt",
      });
      toast.success("Text rewritten!");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Rewrite failed");
    } finally {
      setIsLoading(false);
    }
  }, [inputText, mode, file, incrementUsage, addHistory]);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(rewritten).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [rewritten]);

  const handleDownload = useCallback(() => {
    const blob = new Blob([rewritten], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "rewritten.txt";
    a.click();
    URL.revokeObjectURL(url);
  }, [rewritten]);

  return (
    <ToolLayout
      toolName="AI Rewriter"
      toolPath="/ai-rewrite"
      description="Intent-based text rewriting. Simplify, condense, formalize, or expand any text with AI."
      icon={Wand2}
      iconColor="#E11D48"
    >
      <div className="space-y-6">
        <Card className="border-border">
          <CardContent className="pt-6 space-y-4">
            {/* Mode + file upload row */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 flex-1 min-w-[200px]">
                <span className="font-ui text-sm text-muted-foreground whitespace-nowrap">
                  Mode:
                </span>
                <Select value={mode} onValueChange={setMode}>
                  <SelectTrigger
                    data-ocid="ai-rewrite.select"
                    className="flex-1"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {MODES.map((m) => (
                      <SelectItem key={m.value} value={m.value}>
                        <span className="font-ui">{m.label}</span>
                        <span className="text-muted-foreground text-xs ml-2">
                          — {m.desc}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2">
                <input
                  ref={inputRef}
                  type="file"
                  accept=".txt,.pdf"
                  className="hidden"
                  onChange={(e) =>
                    e.target.files?.[0] && handleFileUpload(e.target.files[0])
                  }
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => inputRef.current?.click()}
                  className="gap-1.5 text-xs"
                >
                  <span>📎</span> Load file
                </Button>
                {file && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setFile(null);
                      setInputText("");
                      setRewritten("");
                    }}
                    className="gap-1 text-xs text-muted-foreground"
                  >
                    <X className="w-3 h-3" /> {file.name}
                  </Button>
                )}
              </div>
            </div>

            {/* Input text */}
            <div>
              <label
                htmlFor="ai-rewrite-textarea"
                className="font-ui text-xs text-muted-foreground uppercase tracking-wider mb-1.5 block"
              >
                Original Text
              </label>
              <Textarea
                id="ai-rewrite-textarea"
                data-ocid="ai-rewrite.textarea"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Paste text here, or upload a .txt or .pdf file above…"
                className="min-h-[160px] font-ui text-sm resize-y"
              />
              <p className="text-xs text-muted-foreground mt-1 font-ui">
                {inputText.length.toLocaleString()} characters
              </p>
            </div>

            <Button
              data-ocid="ai-rewrite.submit_button"
              onClick={handleProcess}
              disabled={!inputText.trim() || isLoading}
              className="w-full gap-2"
              style={{ backgroundColor: "#E11D48" }}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Rewriting…
                </>
              ) : (
                <>
                  <Wand2 className="w-4 h-4" />
                  Rewrite — {mode}
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {isLoading && (
          <div
            data-ocid="ai-rewrite.loading_state"
            className="flex items-center justify-center gap-3 py-6 text-muted-foreground"
          >
            <Loader2 className="w-5 h-5 animate-spin text-[#E11D48]" />
            <span className="font-ui">AI is rewriting…</span>
          </div>
        )}

        {rewritten && !isLoading && (
          <Card
            data-ocid="ai-rewrite.success_state"
            className="border-[#E11D48]/20"
          >
            <CardContent className="pt-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-[#E11D48]/10 flex items-center justify-center">
                    <Wand2 className="w-3.5 h-3.5 text-[#E11D48]" />
                  </div>
                  <span className="font-display font-semibold text-sm text-foreground">
                    Rewritten — {mode}
                  </span>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCopy}
                    className="gap-1.5 text-xs"
                    data-ocid="ai-rewrite.secondary_button"
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
                    className="gap-1.5 text-xs"
                  >
                    <Download className="w-3.5 h-3.5" />
                    .txt
                  </Button>
                </div>
              </div>
              {/* Side by side on desktop */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="font-ui text-xs text-muted-foreground uppercase tracking-wider mb-1.5">
                    Original
                  </p>
                  <div
                    className="bg-muted/40 rounded-lg p-3 text-sm font-ui text-foreground leading-relaxed max-h-48 overflow-y-auto"
                    style={{ scrollbarWidth: "thin" }}
                  >
                    {inputText}
                  </div>
                </div>
                <div>
                  <p className="font-ui text-xs text-muted-foreground uppercase tracking-wider mb-1.5">
                    Rewritten
                  </p>
                  <div
                    className="bg-[#E11D48]/5 rounded-lg p-3 text-sm font-ui text-foreground leading-relaxed max-h-48 overflow-y-auto border border-[#E11D48]/10"
                    style={{ scrollbarWidth: "thin" }}
                  >
                    {rewritten}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </ToolLayout>
  );
}
