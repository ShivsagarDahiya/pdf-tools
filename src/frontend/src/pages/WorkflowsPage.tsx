import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  ChevronRight,
  Crown,
  Home,
  Play,
  RefreshCw,
  Repeat2,
  Settings2,
  Zap,
} from "lucide-react";
import { motion } from "motion/react";

const EXAMPLE_WORKFLOWS = [
  {
    name: "Invoice Processing",
    description:
      "Merge multiple invoices → Compress → Add page numbers → Protect with password",
    steps: ["Merge PDF", "Compress PDF", "Add Page Numbers", "Protect PDF"],
    color: "#E25C3B",
    icon: RefreshCw,
  },
  {
    name: "Document Archive",
    description:
      "Scan documents → OCR to make searchable → Convert to PDF/A → Watermark with company logo",
    steps: ["Scan to PDF", "OCR PDF", "PDF to PDF/A", "Watermark"],
    color: "#3B8CE2",
    icon: Repeat2,
  },
  {
    name: "Report Distribution",
    description:
      "Convert Excel report → Merge with cover page → Add page numbers → Send via email",
    steps: ["Excel to PDF", "Merge PDF", "Add Page Numbers", "Download"],
    color: "#2DBD6E",
    icon: Zap,
  },
];

export function WorkflowsPage() {
  return (
    <main className="min-h-screen bg-background">
      {/* Breadcrumb */}
      <div className="border-b border-border bg-card/50">
        <div className="container max-w-5xl py-3">
          <nav
            aria-label="Breadcrumb"
            className="flex items-center gap-1 text-sm text-muted-foreground"
          >
            <Link
              to="/"
              className="flex items-center gap-1 hover:text-foreground transition-colors"
            >
              <Home className="w-3.5 h-3.5" />
              <span>Home</span>
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-foreground font-medium">Workflows</span>
          </nav>
        </div>
      </div>

      <div className="container max-w-5xl py-14">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="text-center mb-14"
        >
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full text-sm font-ui font-medium mb-6">
            <Settings2 className="w-3.5 h-3.5" />
            Automate your PDF work
          </div>
          <h1 className="font-display font-bold text-4xl text-foreground mb-4">
            Custom Workflows
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Chain multiple PDF tools into automated workflows. Build once, run
            repeatedly. Save hours of repetitive document work every week.
          </p>
        </motion.div>

        {/* How it works */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="mb-14"
        >
          <h2 className="font-display font-bold text-xl text-foreground mb-6 flex items-center gap-2">
            <span className="w-1 h-5 rounded-full bg-primary inline-block" />
            How Workflows Work
          </h2>
          <div className="grid sm:grid-cols-3 gap-6">
            {[
              {
                step: "1",
                title: "Choose your tools",
                desc: "Select any combination of PDF tools from the full library — merge, compress, OCR, convert, and more.",
              },
              {
                step: "2",
                title: "Set the sequence",
                desc: "Drag and drop tools into your desired order. Configure each step's settings once.",
              },
              {
                step: "3",
                title: "Run automatically",
                desc: "Upload your files and the workflow processes them through every step without any clicks.",
              },
            ].map((item) => (
              <Card key={item.step} className="border-border shadow-card">
                <CardContent className="pt-6">
                  <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center mb-3">
                    <span className="font-display font-bold text-primary text-sm">
                      {item.step}
                    </span>
                  </div>
                  <h3 className="font-display font-semibold text-base text-foreground mb-2">
                    {item.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {item.desc}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </motion.div>

        {/* Example workflows */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="mb-14"
        >
          <h2 className="font-display font-bold text-xl text-foreground mb-6 flex items-center gap-2">
            <span className="w-1 h-5 rounded-full bg-primary inline-block" />
            Example Workflows
          </h2>
          <div className="grid sm:grid-cols-3 gap-6">
            {EXAMPLE_WORKFLOWS.map((wf) => {
              const Icon = wf.icon;
              return (
                <Card
                  key={wf.name}
                  className="border-border shadow-card hover:shadow-card-hover transition-shadow duration-200"
                >
                  <CardContent className="pt-6">
                    <div
                      className="w-11 h-11 rounded-xl flex items-center justify-center mb-4"
                      style={{ backgroundColor: `${wf.color}15` }}
                    >
                      <Icon className="w-5 h-5" style={{ color: wf.color }} />
                    </div>
                    <h3 className="font-display font-semibold text-base text-foreground mb-2">
                      {wf.name}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                      {wf.description}
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {wf.steps.map((step, i) => (
                        <div key={step} className="flex items-center gap-1">
                          <Badge
                            variant="secondary"
                            className="text-xs font-ui"
                            style={{
                              backgroundColor: `${wf.color}12`,
                              color: wf.color,
                              border: `1px solid ${wf.color}25`,
                            }}
                          >
                            {step}
                          </Badge>
                          {i < wf.steps.length - 1 && (
                            <ArrowRight className="w-2.5 h-2.5 text-muted-foreground flex-shrink-0" />
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
        >
          <Card className="border-primary/20 bg-primary/5 shadow-card">
            <CardContent className="pt-8 pb-8 text-center">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Play className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-display font-bold text-xl text-foreground mb-2">
                Workflows coming with Premium
              </h3>
              <p className="text-muted-foreground max-w-md mx-auto mb-6 text-sm leading-relaxed">
                Custom workflows are a Premium feature. Upgrade to unlock
                unlimited workflow automation, batch processing, and scheduled
                runs.
              </p>
              <div className="flex flex-wrap gap-3 justify-center">
                <Link to="/premium">
                  <Button
                    size="lg"
                    className="bg-primary hover:bg-primary/90 text-primary-foreground font-ui font-semibold"
                  >
                    <Crown className="mr-2 w-4 h-4" />
                    View Premium Plan
                  </Button>
                </Link>
                <Link to="/">
                  <Button variant="outline" size="lg" className="font-ui">
                    Explore Free Tools
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </main>
  );
}
