import { useAdminSettings } from "@/contexts/AdminSettingsContext";
import { Link } from "@tanstack/react-router";
import { FileText, Github, Mail, Shield, Twitter } from "lucide-react";

export function Footer() {
  const { settings } = useAdminSettings();
  const { footerBrandName, footerCopyright } = settings;

  const brandName = footerBrandName || "PDFTools";
  const year = new Date().getFullYear();
  const copyrightText = footerCopyright?.trim()
    ? footerCopyright
    : `© ${year} ${brandName}. All rights reserved.`;

  return (
    <footer className="border-t border-border bg-card/60 mt-16 pb-20 md:pb-0">
      <div className="container max-w-6xl py-12 px-4 md:px-6">
        {/* Top: 3 columns */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-8 mb-10">
          {/* Brand column */}
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
                <FileText className="w-4 h-4 text-white" />
              </div>
              <span className="font-display font-bold text-foreground text-lg">
                {brandName}
              </span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
              Powerful PDF &amp; image tools, right in your browser. Fast, free,
              and 100% private — your files never leave your device.
            </p>
            {/* Social links */}
            <div className="flex items-center gap-3 pt-1">
              <button
                type="button"
                aria-label="GitHub (coming soon)"
                className="w-8 h-8 rounded-md border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors"
              >
                <Github className="w-4 h-4" />
              </button>
              <button
                type="button"
                aria-label="Twitter (coming soon)"
                className="w-8 h-8 rounded-md border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors"
              >
                <Twitter className="w-4 h-4" />
              </button>
              <a
                href="mailto:support@pdftools.app"
                aria-label="Email"
                className="w-8 h-8 rounded-md border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors"
              >
                <Mail className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* PDF Tools column */}
          <div className="space-y-4">
            <h3 className="font-ui font-semibold text-foreground text-sm uppercase tracking-wider">
              PDF Tools
            </h3>
            <nav className="flex flex-col gap-2.5">
              {[
                { label: "Merge PDF", to: "/merge" },
                { label: "Split PDF", to: "/split" },
                { label: "Compress PDF", to: "/compress" },
                { label: "Protect PDF", to: "/protect" },
                { label: "Rotate PDF", to: "/rotate" },
                { label: "PDF to JPG", to: "/pdf-to-jpg" },
              ].map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors w-fit"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Company column */}
          <div className="space-y-4">
            <h3 className="font-ui font-semibold text-foreground text-sm uppercase tracking-wider">
              Company
            </h3>
            <nav className="flex flex-col gap-2.5">
              {[
                { label: "About Us", to: "/about" },
                { label: "Contact", to: "/contact" },
                { label: "Privacy Policy", to: "/privacy" },
                { label: "Terms of Service", to: "/terms" },
                { label: "Premium", to: "/premium" },
                { label: "History", to: "/history" },
              ].map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors w-fit"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-border" />

        {/* Bottom bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-6">
          <p className="text-sm text-muted-foreground font-ui">
            {copyrightText}
          </p>
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Shield className="w-3.5 h-3.5 mr-1 opacity-60" />
            <Link
              to="/privacy"
              className="hover:text-foreground transition-colors"
            >
              Privacy
            </Link>
            <span className="mx-2 opacity-30">·</span>
            <Link
              to="/terms"
              className="hover:text-foreground transition-colors"
            >
              Terms
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
