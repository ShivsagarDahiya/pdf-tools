import { ToolLayout } from "@/components/tools/ToolLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAddHistory, useIncrementToolUsage } from "@/hooks/useQueries";
import { callGemini, extractTextFromPDF } from "@/utils/geminiApi";
import { Loader2, MessageSquare, Send, Upload, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

interface ChatMessage {
  id: number;
  role: "user" | "ai";
  text: string;
}

export function AskPDF() {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [docText, setDocText] = useState<string>("");
  const [isExtracting, setIsExtracting] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isResponding, setIsResponding] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const { mutate: incrementUsage } = useIncrementToolUsage();
  const { mutate: addHistory } = useAddHistory();

  // biome-ignore lint/correctness/useExhaustiveDependencies: ref scroll triggered by message changes
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleFile = useCallback(async (f: File) => {
    if (!f.name.toLowerCase().endsWith(".pdf")) {
      toast.error("Please upload a PDF file");
      return;
    }
    setFile(f);
    setMessages([]);
    setDocText("");
    setIsExtracting(true);
    try {
      const text = await extractTextFromPDF(f);
      setDocText(text);
      setMessages([
        {
          id: Date.now(),
          role: "ai",
          text: `Document loaded! I've read "${f.name}". Ask me anything about it.`,
        },
      ]);
      toast.success("Document ready for Q&A");
    } catch {
      toast.error("Failed to read PDF");
    } finally {
      setIsExtracting(false);
    }
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

  const handleSend = useCallback(async () => {
    if (!input.trim() || !docText || isResponding) return;
    const userMsg = input.trim();
    setInput("");
    setMessages((prev) => [
      ...prev,
      { id: Date.now(), role: "user", text: userMsg },
    ]);
    setIsResponding(true);
    try {
      const truncated = docText.slice(0, 12000);
      const prompt = `You are a document assistant. Based on this document:\n\n${truncated}\n\nAnswer this question concisely and accurately: ${userMsg}`;
      const answer = await callGemini(prompt);
      setMessages((prev) => [
        ...prev,
        { id: Date.now() + 1, role: "ai", text: answer },
      ]);
      incrementUsage("Ask PDF");
      addHistory({
        toolName: "Ask PDF",
        originalFile: file?.name || "document.pdf",
        resultFile: "chat",
      });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "AI failed to respond");
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 2,
          role: "ai",
          text: "Sorry, I encountered an error. Please try again.",
        },
      ]);
    } finally {
      setIsResponding(false);
    }
  }, [input, docText, isResponding, file, incrementUsage, addHistory]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <ToolLayout
      toolName="Ask PDF"
      toolPath="/ai-ask-pdf"
      description="Chat-style Q&A over your documents. Upload a PDF and ask any question — get instant, accurate answers."
      icon={MessageSquare}
      iconColor="#2563EB"
    >
      <div className="space-y-6">
        {/* Upload if no doc loaded */}
        {!file && (
          <Card className="border-border">
            <CardContent className="pt-6">
              <div
                data-ocid="ask-pdf.dropzone"
                onDrop={handleDrop}
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onClick={() => fileInputRef.current?.click()}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ")
                    fileInputRef.current?.click();
                }}
                className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all duration-200 ${
                  isDragging
                    ? "border-[#2563EB] bg-[#2563EB]/5"
                    : "border-border hover:border-[#2563EB]/40 hover:bg-muted/30"
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf"
                  className="hidden"
                  onChange={(e) =>
                    e.target.files?.[0] && handleFile(e.target.files[0])
                  }
                />
                <div className="flex flex-col items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-[#2563EB]/10 flex items-center justify-center">
                    <Upload className="w-6 h-6 text-[#2563EB]" />
                  </div>
                  <div>
                    <p className="font-display font-semibold text-foreground">
                      Upload a PDF to start chatting
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Drop here or click to browse
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Extracting state */}
        {isExtracting && (
          <div
            data-ocid="ask-pdf.loading_state"
            className="flex items-center justify-center gap-3 py-6 text-muted-foreground"
          >
            <Loader2 className="w-5 h-5 animate-spin text-[#2563EB]" />
            <span className="font-ui">Reading document…</span>
          </div>
        )}

        {/* Chat interface */}
        {file && !isExtracting && (
          <Card className="border-border">
            <CardContent className="pt-4 pb-0">
              {/* File header */}
              <div className="flex items-center justify-between pb-3 border-b border-border mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-[#2563EB]/10 flex items-center justify-center">
                    <MessageSquare className="w-3.5 h-3.5 text-[#2563EB]" />
                  </div>
                  <span className="font-ui font-medium text-sm text-foreground truncate max-w-[200px]">
                    {file.name}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setFile(null);
                    setDocText("");
                    setMessages([]);
                  }}
                  className="w-7 h-7 rounded-lg bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Messages */}
              <div
                data-ocid="ask-pdf.panel"
                className="h-80 overflow-y-auto space-y-3 pr-1"
                style={{ scrollbarWidth: "thin" }}
              >
                {messages.map((msg, idx) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                    data-ocid={`ask-pdf.item.${idx + 1}`}
                  >
                    <div
                      className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm font-ui leading-relaxed ${
                        msg.role === "user"
                          ? "bg-[#2563EB] text-white rounded-br-sm"
                          : "bg-muted text-foreground rounded-bl-sm"
                      }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                ))}
                {isResponding && (
                  <div className="flex justify-start">
                    <div className="bg-muted px-4 py-2.5 rounded-2xl rounded-bl-sm">
                      <Loader2 className="w-4 h-4 animate-spin text-[#2563EB]" />
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Input row */}
              <div className="flex gap-2 pt-3 pb-4 mt-2 border-t border-border">
                <Input
                  ref={inputRef}
                  data-ocid="ask-pdf.input"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask a question about this document…"
                  disabled={isResponding}
                  className="flex-1"
                />
                <Button
                  data-ocid="ask-pdf.submit_button"
                  onClick={handleSend}
                  disabled={!input.trim() || isResponding}
                  size="icon"
                  style={{ backgroundColor: "#2563EB" }}
                >
                  {isResponding ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </ToolLayout>
  );
}
