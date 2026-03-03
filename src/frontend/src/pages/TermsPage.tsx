import { ScrollText } from "lucide-react";
import { motion } from "motion/react";

const sections = [
  {
    id: "acceptance",
    title: "1. Acceptance of Terms",
    content: [
      "By accessing or using PDFTools ('the Service'), you agree to be bound by these Terms of Service ('Terms'). If you do not agree to all of these Terms, you may not use the Service.",
      "These Terms apply to all visitors, users, and others who access or use the Service. We may update these Terms at any time without prior notice. Continued use of the Service after any changes constitutes acceptance of the new Terms.",
      "If you are using the Service on behalf of an organization, you represent that you have the authority to bind that organization to these Terms, and these Terms will apply to the organization.",
    ],
  },
  {
    id: "use-of-service",
    title: "2. Use of Service",
    content: [
      "You may use PDFTools for lawful purposes only. You agree not to use the Service to process any files that contain illegal content, infringe on intellectual property rights of others, or violate any applicable laws or regulations.",
      "You are solely responsible for the content of the files you process using our tools. PDFTools does not review, monitor, or take responsibility for the content of files you process locally in your browser.",
      "You agree not to attempt to reverse engineer, decompile, or disassemble any portion of the Service, or interfere with or disrupt the integrity or performance of the Service or the data contained therein.",
    ],
  },
  {
    id: "intellectual-property",
    title: "3. Intellectual Property",
    content: [
      "The Service and its original content, features, and functionality are and will remain the exclusive property of PDFTools and its licensors. The Service is protected by copyright, trademark, and other laws.",
      "Files that you process using our tools remain your property. We claim no ownership or intellectual property rights over any files you process using PDFTools. You retain all rights to your original content.",
      "You grant PDFTools a limited, non-exclusive license to process your files solely for the purpose of providing the requested service. This license is temporary and only exists during your browser session.",
    ],
  },
  {
    id: "limitations",
    title: "4. Limitations of Liability",
    content: [
      "TO THE MAXIMUM EXTENT PERMITTED BY LAW, PDFTOOLS SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING WITHOUT LIMITATION, LOSS OF PROFITS, DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES, RESULTING FROM YOUR ACCESS TO OR USE OF (OR INABILITY TO ACCESS OR USE) THE SERVICE.",
      "PDFTools does not guarantee that the Service will be uninterrupted, error-free, or free of viruses or other harmful components. The Service is provided on an 'AS IS' and 'AS AVAILABLE' basis without warranties of any kind.",
      "Some jurisdictions do not allow the exclusion of certain warranties or limitation of liability, so some of the above limitations may not apply to you. In such cases, our liability will be limited to the greatest extent permitted by applicable law.",
    ],
  },
  {
    id: "privacy",
    title: "5. Privacy Policy",
    content: [
      "Your use of the Service is also governed by our Privacy Policy, which is incorporated into these Terms by reference. Please review our Privacy Policy to understand our practices regarding the collection and use of information.",
      "By using the Service, you consent to the collection and use of information as described in our Privacy Policy. We process files entirely in your browser and do not upload files to our servers.",
      "You can review the full Privacy Policy at any time by visiting the Privacy Policy page of our website.",
    ],
  },
  {
    id: "modifications",
    title: "6. Modifications to Service",
    content: [
      "PDFTools reserves the right to modify or discontinue, temporarily or permanently, the Service (or any part thereof) with or without notice. We shall not be liable to you or to any third party for any modification, suspension, or discontinuance of the Service.",
      "We may introduce new features, modify existing features, or remove features from the Service at any time. We will endeavor to notify users of significant changes through our website or by other reasonable means.",
      "PDFTools may impose usage limits on certain features or restrict access to parts or all of the Service without notice or liability.",
    ],
  },
  {
    id: "governing-law",
    title: "7. Governing Law",
    content: [
      "These Terms shall be governed by and construed in accordance with applicable law, without regard to its conflict of law provisions. Any disputes arising under these Terms shall be subject to the exclusive jurisdiction of the courts in the applicable jurisdiction.",
      "If any provision of these Terms is found to be unenforceable or invalid, that provision will be limited or eliminated to the minimum extent necessary so that the remaining Terms remain in full force and effect.",
      "Our failure to enforce any right or provision of these Terms will not be considered a waiver of those rights.",
    ],
  },
  {
    id: "contact",
    title: "8. Contact Information",
    content: [
      "If you have any questions about these Terms of Service, please contact us at support@pdftools.app. We are committed to resolving any concerns you may have about our Terms or the Service.",
      "For legal notices or service of process, please send correspondence to support@pdftools.app with the subject line 'Legal Notice'.",
      "We will respond to all inquiries within a reasonable timeframe, typically within 5-7 business days for legal matters.",
    ],
  },
];

export function TermsPage() {
  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <section className="relative overflow-hidden py-16 md:py-20">
        <div className="gradient-hero absolute inset-0 pointer-events-none" />
        <div className="container max-w-3xl px-4 md:px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-ui font-medium mb-5">
              <ScrollText className="w-3.5 h-3.5" />
              Terms of Service
            </div>
            <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-3">
              Terms of Service
            </h1>
            <p className="text-muted-foreground font-ui">
              Last updated: January 2026
            </p>
          </motion.div>
        </div>
      </section>

      {/* Intro note */}
      <div className="container max-w-3xl px-4 md:px-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="bg-muted/40 border border-border rounded-2xl p-5"
        >
          <p className="text-sm text-muted-foreground leading-relaxed">
            Please read these Terms of Service carefully before using PDFTools.
            These terms govern your use of our website and services. By using
            PDFTools, you agree to be bound by these terms.
          </p>
        </motion.div>
      </div>

      {/* Terms sections */}
      <div className="container max-w-3xl px-4 md:px-6 pb-20">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="space-y-5"
        >
          {sections.map((section, i) => (
            <motion.div
              key={section.id}
              id={section.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 + i * 0.05 }}
              className="bg-card border border-border rounded-2xl p-6 md:p-8"
            >
              <h2 className="font-display text-xl font-bold text-foreground mb-4 flex items-start gap-3">
                <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-primary/10 text-primary text-xs font-bold flex-shrink-0 mt-0.5">
                  {i + 1}
                </span>
                <span>{section.title.replace(/^\d+\.\s/, "")}</span>
              </h2>
              <div className="space-y-3 pl-10">
                {section.content.map((paragraph) => (
                  <p
                    key={paragraph.slice(0, 40)}
                    className="text-sm text-muted-foreground leading-relaxed"
                  >
                    {paragraph}
                  </p>
                ))}
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Bottom agreement note */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="mt-8 text-center"
        >
          <p className="text-sm text-muted-foreground">
            By using PDFTools, you acknowledge that you have read, understood,
            and agree to be bound by these Terms of Service.
          </p>
        </motion.div>
      </div>
    </main>
  );
}
