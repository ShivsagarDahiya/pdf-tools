import { useAdminSettings } from "@/contexts/AdminSettingsContext";
import { Link } from "@tanstack/react-router";
import { FileText, Heart } from "lucide-react";

export function Footer() {
  const year = new Date().getFullYear();
  const caffeineUrl = `https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`;
  const { settings } = useAdminSettings();
  const { footerBrandName, footerLinks, footerCopyright } = settings;

  return (
    <footer className="border-t border-border bg-card/50 mt-16">
      <div className="container max-w-5xl py-10">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          {/* Brand */}
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
              <FileText className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-display font-bold text-foreground text-base">
              {footerBrandName || "PDFTools"}
            </span>
          </div>

          {/* Links */}
          <nav className="flex flex-wrap gap-4 text-sm font-ui text-muted-foreground">
            {footerLinks.map((link) => {
              // Check if it's an external link
              const isExternal =
                link.url.startsWith("http://") ||
                link.url.startsWith("https://");
              if (isExternal) {
                return (
                  <a
                    key={link.url}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </a>
                );
              }
              return (
                <Link
                  key={link.url}
                  to={link.url}
                  className="hover:text-foreground transition-colors"
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Attribution / copyright */}
          {footerCopyright ? (
            <p className="text-sm text-muted-foreground font-ui">
              {footerCopyright}
            </p>
          ) : (
            <p className="text-sm text-muted-foreground font-ui flex items-center gap-1">
              © {year}. Built with{" "}
              <Heart className="w-3.5 h-3.5 text-primary inline fill-primary" />{" "}
              using{" "}
              <a
                href={caffeineUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                caffeine.ai
              </a>
            </p>
          )}
        </div>
      </div>
    </footer>
  );
}
