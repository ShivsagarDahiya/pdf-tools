import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import {
  Brain,
  FileText,
  Globe,
  Image,
  Lock,
  Shield,
  Users,
  Zap,
} from "lucide-react";
import { motion } from "motion/react";

const stats = [
  { value: "30+", label: "Powerful Tools" },
  { value: "100%", label: "Browser-Based" },
  { value: "Zero", label: "Server Uploads" },
  { value: "Free", label: "Forever" },
];

const features = [
  {
    icon: (
      <svg
        role="img"
        aria-label="PDF Processing"
        viewBox="0 0 24 24"
        fill="none"
        className="w-6 h-6"
      >
        <title>PDF Processing</title>
        <rect x="3" y="3" width="18" height="18" rx="3" fill="#E25C3B" />
        <path
          d="M7 8h10M7 12h10M7 16h6"
          stroke="white"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    ),
    title: "PDF Processing",
    description:
      "Merge, split, compress, rotate, watermark, protect, and convert PDF files with professional quality — all without installing any software.",
    color:
      "from-red-50 to-orange-50 dark:from-red-950/30 dark:to-orange-950/30",
    border: "border-red-100 dark:border-red-900/40",
  },
  {
    icon: (
      <svg
        role="img"
        aria-label="Image Tools"
        viewBox="0 0 24 24"
        fill="none"
        className="w-6 h-6"
      >
        <title>Image Tools</title>
        <rect x="3" y="3" width="18" height="18" rx="3" fill="#3B82F6" />
        <circle cx="9" cy="9" r="2" fill="white" />
        <path
          d="M3 16l5-5 4 4 3-3 6 6"
          stroke="white"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
    title: "Image Tools",
    description:
      "Compress, resize, crop, convert, rotate, watermark, and edit images. Remove backgrounds, apply filters, and transform photos instantly.",
    color: "from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30",
    border: "border-blue-100 dark:border-blue-900/40",
  },
  {
    icon: (
      <svg
        role="img"
        aria-label="AI-Powered"
        viewBox="0 0 24 24"
        fill="none"
        className="w-6 h-6"
      >
        <title>AI-Powered</title>
        <rect x="3" y="3" width="18" height="18" rx="3" fill="#8B5CF6" />
        <path
          d="M8 12h8M12 8l4 4-4 4"
          stroke="white"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="7" cy="12" r="1.5" fill="white" />
      </svg>
    ),
    title: "AI-Powered",
    description:
      "Leverage Gemini AI for smart optimization suggestions, document translation, OCR text extraction, and intelligent file processing.",
    color:
      "from-purple-50 to-violet-50 dark:from-purple-950/30 dark:to-violet-950/30",
    border: "border-purple-100 dark:border-purple-900/40",
  },
  {
    icon: (
      <svg
        role="img"
        aria-label="Secure and Private"
        viewBox="0 0 24 24"
        fill="none"
        className="w-6 h-6"
      >
        <title>Secure and Private</title>
        <rect x="3" y="3" width="18" height="18" rx="3" fill="#10B981" />
        <path
          d="M12 7v4l3 3"
          stroke="white"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <circle cx="12" cy="12" r="5" stroke="white" strokeWidth="1.5" />
      </svg>
    ),
    title: "Secure & Private",
    description:
      "All file processing happens directly in your browser. Your files are never uploaded to any server, ensuring complete privacy and security.",
    color:
      "from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30",
    border: "border-green-100 dark:border-green-900/40",
  },
];

const team = [
  {
    name: "Alex Chen",
    role: "Lead Developer",
    initials: "AC",
    color: "bg-primary/10 text-primary",
  },
  {
    name: "Sara Kim",
    role: "UX Designer",
    initials: "SK",
    color: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  },
  {
    name: "James Patel",
    role: "Product Manager",
    initials: "JP",
    color: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export function AboutPage() {
  return (
    <main className="min-h-screen bg-background">
      {/* Hero */}
      <section className="relative overflow-hidden py-20 md:py-28">
        <div className="gradient-hero absolute inset-0 pointer-events-none" />
        <div className="container max-w-4xl px-4 md:px-6 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-ui font-medium mb-6">
              <FileText className="w-3.5 h-3.5" />
              About PDFTools
            </div>
            <h1 className="font-display text-4xl md:text-6xl font-bold text-foreground mb-5 leading-tight">
              About <span className="text-primary">PDFTools</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              We make document processing simple, fast, and free for everyone.
              No subscriptions, no uploads, no limits — just powerful tools that
              work right in your browser.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Mission + Stats */}
      <section className="py-16 bg-card/40">
        <div className="container max-w-5xl px-4 md:px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            {/* Mission text */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="space-y-5"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Globe className="w-5 h-5 text-primary" />
                </div>
                <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground">
                  Our Mission
                </h2>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                We believe powerful document tools should be accessible to
                everyone — not locked behind expensive subscriptions or
                complicated desktop software. PDFTools was built to give you
                professional-grade processing capabilities right in your
                browser, completely free.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Privacy is at the core of everything we build. Your files never
                leave your device — all processing happens locally in your
                browser using the latest web technologies. No accounts required,
                no data collected, no files stored.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                From merging PDFs to removing image backgrounds with AI, we're
                constantly expanding our toolkit to cover every document
                workflow you encounter.
              </p>
            </motion.div>

            {/* Stats grid */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="grid grid-cols-2 gap-4"
            >
              {stats.map((stat) => (
                <div
                  key={stat.label}
                  className="bg-card border border-border rounded-2xl p-6 text-center shadow-sm"
                >
                  <p className="font-display text-4xl font-bold text-primary mb-1">
                    {stat.value}
                  </p>
                  <p className="text-sm text-muted-foreground font-ui">
                    {stat.label}
                  </p>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16">
        <div className="container max-w-5xl px-4 md:px-6">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-10"
          >
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-3">
              What We Offer
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              A complete suite of tools for every document and image task, built
              for performance and reliability.
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 sm:grid-cols-2 gap-5"
          >
            {features.map((feature) => (
              <motion.div
                key={feature.title}
                variants={itemVariants}
                className={`bg-gradient-to-br ${feature.color} border ${feature.border} rounded-2xl p-6`}
              >
                <div className="mb-4">{feature.icon}</div>
                <h3 className="font-display text-lg font-bold text-foreground mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Team */}
      <section className="py-16 bg-card/40">
        <div className="container max-w-5xl px-4 md:px-6">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-10"
          >
            <div className="flex items-center justify-center gap-3 mb-2">
              <Users className="w-5 h-5 text-primary" />
              <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground">
                Our Team
              </h2>
            </div>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Built by passionate developers who care deeply about privacy,
              performance, and great user experience.
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 sm:grid-cols-3 gap-5 max-w-2xl mx-auto"
          >
            {team.map((member) => (
              <motion.div
                key={member.name}
                variants={itemVariants}
                className="bg-card border border-border rounded-2xl p-6 text-center shadow-sm hover:shadow-md transition-shadow"
              >
                <div
                  className={`w-16 h-16 rounded-full ${member.color} flex items-center justify-center mx-auto mb-4`}
                >
                  <span className="font-display text-xl font-bold">
                    {member.initials}
                  </span>
                </div>
                <h3 className="font-display font-bold text-foreground mb-0.5">
                  {member.name}
                </h3>
                <p className="text-sm text-muted-foreground font-ui">
                  {member.role}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16">
        <div className="container max-w-5xl px-4 md:px-6">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-10"
          >
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-3">
              Our Values
            </h2>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 sm:grid-cols-3 gap-5"
          >
            {[
              {
                icon: (
                  <Shield className="w-6 h-6 text-green-600 dark:text-green-400" />
                ),
                bg: "bg-green-500/10",
                title: "Privacy First",
                description:
                  "We never collect, store, or share your files. Everything is processed locally in your browser.",
              },
              {
                icon: (
                  <Zap className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                ),
                bg: "bg-amber-500/10",
                title: "Speed & Reliability",
                description:
                  "Optimized algorithms deliver fast results without sacrificing quality, even for large files.",
              },
              {
                icon: (
                  <Globe className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                ),
                bg: "bg-blue-500/10",
                title: "Open Access",
                description:
                  "Core tools are free forever. We believe everyone deserves access to great document tools.",
              },
            ].map((value) => (
              <motion.div
                key={value.title}
                variants={itemVariants}
                className="bg-card border border-border rounded-2xl p-6 shadow-sm"
              >
                <div
                  className={`w-11 h-11 rounded-xl ${value.bg} flex items-center justify-center mb-4`}
                >
                  {value.icon}
                </div>
                <h3 className="font-display font-bold text-foreground mb-2">
                  {value.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {value.description}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-card/40">
        <div className="container max-w-2xl px-4 md:px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="space-y-5"
          >
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
              <FileText className="w-7 h-7 text-primary" />
            </div>
            <h2 className="font-display text-3xl font-bold text-foreground">
              Start using our tools for free
            </h2>
            <p className="text-muted-foreground">
              Join thousands of people who trust PDFTools for their daily
              document workflows.
            </p>
            <Link to="/">
              <Button size="lg" className="font-ui font-semibold gap-2 mt-2">
                <Zap className="w-4 h-4" />
                Explore All Tools
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
