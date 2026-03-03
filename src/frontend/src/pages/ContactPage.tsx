import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  ChevronDown,
  ChevronUp,
  Clock,
  Globe,
  Mail,
  MessageSquare,
  Send,
} from "lucide-react";
import { motion } from "motion/react";
import { useCallback, useState } from "react";
import { toast } from "sonner";

const faqs = [
  {
    q: "Is PDFTools completely free to use?",
    a: "Yes! All core tools are completely free to use. We offer a Premium plan for advanced features like larger file sizes and priority processing, but the essential tools will always be free.",
  },
  {
    q: "Is my data safe when using PDFTools?",
    a: "Absolutely. All file processing happens directly in your browser using local WebAssembly libraries. Your files are never uploaded to any server — they stay on your device at all times.",
  },
  {
    q: "What file formats are supported?",
    a: "PDFTools supports PDF, JPG, PNG, WEBP, GIF for image tools, and all standard document formats for conversion including DOCX, PPTX, XLSX, and HTML.",
  },
  {
    q: "Can I process multiple files at once?",
    a: "Yes! Most tools support batch processing. Free users can process up to 10 files per batch, while Premium users enjoy unlimited batch sizes.",
  },
];

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-border rounded-xl overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between gap-4 p-5 text-left hover:bg-muted/40 transition-colors"
        aria-expanded={open}
      >
        <span className="font-ui font-semibold text-foreground text-sm leading-snug">
          {q}
        </span>
        {open ? (
          <ChevronUp className="w-4 h-4 text-muted-foreground flex-shrink-0" />
        ) : (
          <ChevronDown className="w-4 h-4 text-muted-foreground flex-shrink-0" />
        )}
      </button>
      {open && (
        <div className="px-5 pb-5 border-t border-border">
          <p className="text-sm text-muted-foreground leading-relaxed pt-4">
            {a}
          </p>
        </div>
      )}
    </div>
  );
}

export function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (!name.trim() || !email.trim() || !subject.trim() || !message.trim()) {
        toast.error("Please fill in all fields.");
        return;
      }
      setSending(true);
      // Simulate sending
      setTimeout(() => {
        setSending(false);
        setName("");
        setEmail("");
        setSubject("");
        setMessage("");
        toast.success("Message sent! We'll get back to you soon.");
      }, 1200);
    },
    [name, email, subject, message],
  );

  return (
    <main className="min-h-screen bg-background">
      {/* Hero */}
      <section className="relative overflow-hidden py-20 md:py-24">
        <div className="gradient-hero absolute inset-0 pointer-events-none" />
        <div className="container max-w-3xl px-4 md:px-6 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-ui font-medium mb-6">
              <MessageSquare className="w-3.5 h-3.5" />
              Contact Us
            </div>
            <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
              Get in <span className="text-primary">Touch</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed">
              Have a question, suggestion, or just want to say hello? We'd love
              to hear from you. We typically respond within 24 hours.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Contact content */}
      <section className="py-12">
        <div className="container max-w-5xl px-4 md:px-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
            {/* Left: contact info */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="md:col-span-2 space-y-4"
            >
              <h2 className="font-display text-xl font-bold text-foreground mb-5">
                Contact Information
              </h2>

              {/* Email card */}
              <div className="bg-card border border-border rounded-2xl p-5 flex gap-4">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Mail className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-ui font-semibold text-foreground text-sm mb-0.5">
                    Email Us
                  </p>
                  <a
                    href="mailto:support@pdftools.app"
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    support@pdftools.app
                  </a>
                </div>
              </div>

              {/* Response time card */}
              <div className="bg-card border border-border rounded-2xl p-5 flex gap-4">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center flex-shrink-0">
                  <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <p className="font-ui font-semibold text-foreground text-sm mb-0.5">
                    Response Time
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Usually within 24 hours
                  </p>
                </div>
              </div>

              {/* Location card */}
              <div className="bg-card border border-border rounded-2xl p-5 flex gap-4">
                <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center flex-shrink-0">
                  <Globe className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="font-ui font-semibold text-foreground text-sm mb-0.5">
                    Location
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Available Worldwide
                  </p>
                </div>
              </div>

              {/* Additional note */}
              <div className="bg-muted/40 border border-border rounded-2xl p-5">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  <span className="font-semibold text-foreground">Note:</span>{" "}
                  For bug reports or feature requests, please include as much
                  detail as possible so we can help you quickly.
                </p>
              </div>
            </motion.div>

            {/* Right: contact form */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="md:col-span-3"
            >
              <div className="bg-card border border-border rounded-2xl p-6 md:p-8 shadow-sm">
                <h2 className="font-display text-xl font-bold text-foreground mb-6">
                  Send a Message
                </h2>
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="contact-name" className="font-ui text-sm">
                        Name <span className="text-primary">*</span>
                      </Label>
                      <Input
                        id="contact-name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Your full name"
                        required
                        autoComplete="name"
                        className="font-ui"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label
                        htmlFor="contact-email"
                        className="font-ui text-sm"
                      >
                        Email <span className="text-primary">*</span>
                      </Label>
                      <Input
                        id="contact-email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        required
                        autoComplete="email"
                        className="font-ui"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label
                      htmlFor="contact-subject"
                      className="font-ui text-sm"
                    >
                      Subject <span className="text-primary">*</span>
                    </Label>
                    <Input
                      id="contact-subject"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      placeholder="What's this about?"
                      required
                      className="font-ui"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label
                      htmlFor="contact-message"
                      className="font-ui text-sm"
                    >
                      Message <span className="text-primary">*</span>
                    </Label>
                    <Textarea
                      id="contact-message"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Tell us how we can help you..."
                      required
                      rows={6}
                      className="font-ui resize-none"
                    />
                  </div>

                  <Button
                    type="submit"
                    size="lg"
                    disabled={sending}
                    className="w-full font-ui font-semibold gap-2"
                  >
                    {sending ? (
                      <>
                        <svg
                          role="img"
                          aria-label="Sending"
                          className="w-4 h-4 animate-spin"
                          viewBox="0 0 24 24"
                          fill="none"
                        >
                          <title>Sending</title>
                          <circle
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="3"
                            strokeOpacity="0.25"
                          />
                          <path
                            d="M12 2a10 10 0 0 1 10 10"
                            stroke="currentColor"
                            strokeWidth="3"
                            strokeLinecap="round"
                          />
                        </svg>
                        Sending…
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        Send Message
                      </>
                    )}
                  </Button>
                </form>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 bg-card/40">
        <div className="container max-w-3xl px-4 md:px-6">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-10"
          >
            <h2 className="font-display text-3xl font-bold text-foreground mb-3">
              Frequently Asked Questions
            </h2>
            <p className="text-muted-foreground">
              Quick answers to the most common questions.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="space-y-3"
          >
            {faqs.map((faq) => (
              <FAQItem key={faq.q} q={faq.q} a={faq.a} />
            ))}
          </motion.div>
        </div>
      </section>
    </main>
  );
}
