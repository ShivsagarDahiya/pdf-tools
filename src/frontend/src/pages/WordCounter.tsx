import { ToolLayout } from "@/components/tools/ToolLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { extractTextFromPDF } from "@/utils/geminiApi";
import { Calculator, Copy, Loader2, Trash2, Upload, X } from "lucide-react";
import { useCallback, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

const STOP_WORDS = new Set([
  "the",
  "a",
  "an",
  "and",
  "or",
  "but",
  "in",
  "on",
  "at",
  "to",
  "for",
  "of",
  "with",
  "by",
  "from",
  "is",
  "it",
  "its",
  "was",
  "are",
  "were",
  "be",
  "been",
  "being",
  "have",
  "has",
  "had",
  "do",
  "does",
  "did",
  "will",
  "would",
  "could",
  "should",
  "may",
  "might",
  "shall",
  "can",
  "this",
  "that",
  "these",
  "those",
  "i",
  "you",
  "he",
  "she",
  "we",
  "they",
  "me",
  "him",
  "her",
  "us",
  "them",
  "my",
  "your",
  "his",
  "our",
  "their",
  "what",
  "which",
  "who",
  "whom",
  "when",
  "where",
  "why",
  "how",
  "not",
  "no",
  "so",
  "as",
  "if",
  "then",
  "than",
  "because",
  "while",
  "although",
  "however",
  "also",
  "both",
  "each",
  "more",
  "most",
  "other",
  "some",
  "such",
  "up",
  "out",
  "about",
  "after",
  "before",
  "into",
  "through",
]);

function getTopWords(
  text: string,
  limit = 10,
): Array<{ word: string; count: number }> {
  const freq: Record<string, number> = {};
  const words = text.toLowerCase().match(/\b[a-z]{3,}\b/g) || [];
  for (const w of words) {
    if (!STOP_WORDS.has(w)) {
      freq[w] = (freq[w] || 0) + 1;
    }
  }
  return Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([word, count]) => ({ word, count }));
}

export function WordCounter() {
  const [text, setText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(async (f: File) => {
    setFile(f);
    setIsLoading(true);
    try {
      if (f.name.toLowerCase().endsWith(".pdf")) {
        const extracted = await extractTextFromPDF(f);
        setText(extracted);
      } else {
        const t = await f.text();
        setText(t);
      }
      toast.success("File loaded");
    } catch {
      toast.error("Failed to read file");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const stats = useMemo(() => {
    const trimmed = text.trim();
    if (!trimmed) return null;
    const wordCount = (trimmed.match(/\b\S+\b/g) || []).length;
    const charCount = trimmed.length;
    const charNoSpaces = trimmed.replace(/\s/g, "").length;
    const sentences = (trimmed.match(/[.!?]+/g) || []).length;
    const paragraphs = trimmed
      .split(/\n\s*\n/)
      .filter((p) => p.trim().length > 0).length;
    const readingTimeMin = Math.ceil(wordCount / 200);
    const speakingTimeMin = Math.ceil(wordCount / 130);
    const topWords = getTopWords(trimmed);
    const maxCount = topWords[0]?.count || 1;
    return {
      wordCount,
      charCount,
      charNoSpaces,
      sentences,
      paragraphs,
      readingTimeMin,
      speakingTimeMin,
      topWords,
      maxCount,
    };
  }, [text]);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(text).then(() => toast.success("Copied!"));
  }, [text]);

  const handleClear = useCallback(() => {
    setText("");
    setFile(null);
  }, []);

  return (
    <ToolLayout
      toolName="Word Counter"
      toolPath="/word-counter"
      description="Real-time word, character, sentence, and paragraph counts. Reading time, speaking time, and top word frequency analysis."
      icon={Calculator}
      iconColor="#0EA5E9"
    >
      <div className="space-y-6">
        <Card className="border-border">
          <CardContent className="pt-6 space-y-4">
            {/* Upload option */}
            <div className="flex items-center justify-between">
              <span className="font-ui text-sm text-muted-foreground">
                Paste text or upload a file
              </span>
              <div className="flex gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".txt,.pdf,.md"
                  className="hidden"
                  onChange={(e) =>
                    e.target.files?.[0] && handleFile(e.target.files[0])
                  }
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  className="gap-1.5 text-xs"
                  data-ocid="word-counter.upload_button"
                >
                  {isLoading ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Upload className="w-3.5 h-3.5" />
                  )}
                  {file ? file.name : "Upload file"}
                </Button>
                {file && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setFile(null);
                      setText("");
                    }}
                    className="text-muted-foreground"
                  >
                    <X className="w-3.5 h-3.5" />
                  </Button>
                )}
              </div>
            </div>

            <Textarea
              data-ocid="word-counter.textarea"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Start typing or paste text here…"
              className="min-h-[200px] font-ui text-sm resize-y"
            />

            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopy}
                disabled={!text}
                className="gap-1.5"
                data-ocid="word-counter.secondary_button"
              >
                <Copy className="w-3.5 h-3.5" />
                Copy
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleClear}
                disabled={!text}
                className="gap-1.5 text-destructive hover:text-destructive"
                data-ocid="word-counter.delete_button"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Clear
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Stats grid */}
        {stats && (
          <div data-ocid="word-counter.panel" className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {[
                {
                  label: "Words",
                  value: stats.wordCount.toLocaleString(),
                  color: "#0EA5E9",
                },
                {
                  label: "Characters",
                  value: stats.charCount.toLocaleString(),
                  color: "#7C3BE2",
                },
                {
                  label: "Chars (no spaces)",
                  value: stats.charNoSpaces.toLocaleString(),
                  color: "#059669",
                },
                {
                  label: "Sentences",
                  value: stats.sentences.toLocaleString(),
                  color: "#D97706",
                },
                {
                  label: "Paragraphs",
                  value: stats.paragraphs.toLocaleString(),
                  color: "#E11D48",
                },
                {
                  label: "Read time",
                  value: `~${stats.readingTimeMin} min`,
                  color: "#0891B2",
                },
                {
                  label: "Speak time",
                  value: `~${stats.speakingTimeMin} min`,
                  color: "#6366F1",
                },
              ].map((stat) => (
                <Card key={stat.label} className="border-border">
                  <CardContent className="pt-4 pb-3">
                    <p className="font-ui text-xs text-muted-foreground uppercase tracking-wider mb-1">
                      {stat.label}
                    </p>
                    <p
                      className="font-display font-bold text-2xl"
                      style={{ color: stat.color }}
                    >
                      {stat.value}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Top words frequency */}
            {stats.topWords.length > 0 && (
              <Card className="border-border">
                <CardContent className="pt-5">
                  <h3 className="font-display font-semibold text-sm text-foreground mb-4">
                    Top 10 Most Frequent Words
                  </h3>
                  <div className="space-y-2">
                    {stats.topWords.map((item, i) => (
                      <div
                        key={item.word}
                        className="flex items-center gap-3"
                        data-ocid={`word-counter.item.${i + 1}`}
                      >
                        <span className="font-mono text-xs text-muted-foreground w-5 text-right">
                          {i + 1}
                        </span>
                        <span className="font-ui text-sm text-foreground w-24 truncate">
                          {item.word}
                        </span>
                        <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{
                              width: `${(item.count / stats.maxCount) * 100}%`,
                              backgroundColor: "#0EA5E9",
                            }}
                          />
                        </div>
                        <span className="font-ui text-xs text-muted-foreground w-8 text-right">
                          {item.count}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {!text && (
          <div
            data-ocid="word-counter.empty_state"
            className="text-center py-8 text-muted-foreground font-ui text-sm"
          >
            Start typing above to see real-time statistics
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
