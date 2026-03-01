import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { type GeminiMessage, callGeminiChat } from "@/utils/geminiApi";
import { Loader2, MessageSquare, Send, Sparkles, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";

const SYSTEM_INSTRUCTION =
  "You are a helpful PDF assistant for PDFTools. Help users with PDF-related questions, explain what tools to use, give optimization tips, and guide them through common PDF tasks. Be concise, friendly, and practical. When suggesting tools, refer to them by name (e.g., 'Merge PDF', 'Compress PDF').";

interface Message {
  role: "user" | "model";
  content: string;
}

function MessageBubble({ msg }: { msg: Message }) {
  const isUser = msg.role === "user";
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} mb-3`}>
      {!isUser && (
        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center flex-shrink-0 mr-2 mt-0.5">
          <Sparkles className="w-3 h-3 text-white" />
        </div>
      )}
      <div
        className={`max-w-[80%] px-3 py-2 rounded-2xl text-sm leading-relaxed ${
          isUser
            ? "bg-primary text-primary-foreground rounded-br-sm"
            : "bg-muted text-foreground rounded-bl-sm"
        }`}
        style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}
      >
        {msg.content}
      </div>
    </div>
  );
}

export function GeminiChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "model",
      content:
        "Hi! I'm your PDF assistant powered by Gemini AI. Ask me anything about PDFs — how to compress them, which tools to use, or any other questions! 📄",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Scroll to bottom when new message arrives
  // biome-ignore lint/correctness/useExhaustiveDependencies: scrollAreaRef is stable
  useEffect(() => {
    if (scrollAreaRef.current) {
      const el = scrollAreaRef.current.querySelector(
        "[data-radix-scroll-area-viewport]",
      );
      if (el) {
        el.scrollTop = el.scrollHeight;
      }
    }
  }, [messages]);

  const handleSend = useCallback(async () => {
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;

    const userMessage: Message = { role: "user", content: trimmed };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput("");
    setIsLoading(true);

    try {
      const geminiMessages: GeminiMessage[] = updatedMessages.map((m) => ({
        role: m.role,
        content: m.content,
      }));
      const response = await callGeminiChat(geminiMessages, SYSTEM_INSTRUCTION);
      setMessages((prev) => [
        ...prev,
        {
          role: "model",
          content:
            response ||
            "Sorry, I couldn't generate a response. Please try again.",
        },
      ]);
    } catch (e) {
      const errMsg = e instanceof Error ? e.message : "Something went wrong";
      setMessages((prev) => [
        ...prev,
        {
          role: "model",
          content: `Sorry, I encountered an error: ${errMsg}. Please try again.`,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }, [input, messages, isLoading]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        void handleSend();
      }
    },
    [handleSend],
  );

  const SUGGESTED_QUESTIONS = [
    "How do I reduce a PDF size?",
    "What's the best way to merge PDFs?",
    "How can I password protect a PDF?",
  ];

  return (
    <>
      {/* Floating button */}
      <motion.button
        onClick={() => setIsOpen((o) => !o)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-lg flex items-center justify-center text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2"
        style={{
          background:
            "linear-gradient(135deg, #7c3aed 0%, #6d28d9 50%, #4c1d95 100%)",
        }}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        aria-label="Open PDF AI chat"
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <X className="w-6 h-6" />
            </motion.div>
          ) : (
            <motion.div
              key="open"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <Sparkles className="w-6 h-6" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Chat panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="fixed bottom-24 right-6 z-50 w-[350px] sm:w-[380px] bg-card border border-border rounded-2xl shadow-xl overflow-hidden flex flex-col"
            style={{ maxHeight: "520px" }}
          >
            {/* Header */}
            <div
              className="px-4 py-3 flex items-center gap-3 flex-shrink-0"
              style={{
                background:
                  "linear-gradient(135deg, #7c3aed 0%, #6d28d9 50%, #4c1d95 100%)",
              }}
            >
              <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="font-display font-semibold text-sm text-white">
                  PDF Assistant
                </h3>
                <p className="text-xs text-white/70">powered by Gemini AI</p>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="ml-auto text-white/70 hover:text-white transition-colors"
                aria-label="Close chat"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Messages */}
            <ScrollArea ref={scrollAreaRef} className="flex-1 px-4 py-3">
              <div className="space-y-1">
                {messages.map((msg, i) => (
                  // biome-ignore lint/suspicious/noArrayIndexKey: message list only appends
                  <MessageBubble key={i} msg={msg} />
                ))}
                {isLoading && (
                  <div className="flex justify-start mb-3">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center flex-shrink-0 mr-2 mt-0.5">
                      <Sparkles className="w-3 h-3 text-white" />
                    </div>
                    <div className="bg-muted px-3 py-2 rounded-2xl rounded-bl-sm flex items-center gap-2">
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">
                        Thinking...
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>

            {/* Suggested questions (shown when only 1 message = initial) */}
            {messages.length === 1 && (
              <div className="px-4 pb-2 flex flex-col gap-1.5">
                {SUGGESTED_QUESTIONS.map((q) => (
                  <button
                    type="button"
                    key={q}
                    onClick={() => {
                      setInput(q);
                      inputRef.current?.focus();
                    }}
                    className="text-left text-xs text-muted-foreground bg-muted/60 hover:bg-muted transition-colors px-3 py-2 rounded-lg border border-border/50 flex items-center gap-2"
                  >
                    <MessageSquare className="w-3 h-3 flex-shrink-0" />
                    {q}
                  </button>
                ))}
              </div>
            )}

            {/* Input area */}
            <div className="px-3 pb-3 pt-2 border-t border-border flex-shrink-0">
              <div className="flex gap-2 items-center">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask about PDFs..."
                  className="flex-1 bg-muted/60 border border-border rounded-xl px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500/50 transition-all"
                  disabled={isLoading}
                />
                <Button
                  size="icon"
                  onClick={() => void handleSend()}
                  disabled={!input.trim() || isLoading}
                  className="rounded-xl w-9 h-9 flex-shrink-0"
                  style={{
                    background:
                      !input.trim() || isLoading
                        ? undefined
                        : "linear-gradient(135deg, #7c3aed, #6d28d9)",
                  }}
                  aria-label="Send message"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
