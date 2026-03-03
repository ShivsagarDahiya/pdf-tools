import { AlertCircle, Shield } from "lucide-react";
import { motion } from "motion/react";

const sections = [
  {
    id: "information-we-collect",
    title: "1. Information We Collect",
    content: [
      "PDFTools is designed with privacy as a core principle. We collect minimal information to provide our service. When you visit our website, we may collect basic usage analytics such as page views, tool usage counts, and general geographic region data — this is anonymous and cannot be traced back to you personally.",
      "If you choose to create an account using Internet Identity, we store your unique principal identifier and any profile information you voluntarily provide (display name, profile picture). We do not collect your name, email address, or any personally identifiable information unless you explicitly provide it.",
      "We do not collect, process, or retain any files you upload or process using our tools. All file processing occurs locally in your browser — files are never transmitted to our servers.",
    ],
  },
  {
    id: "how-we-use",
    title: "2. How We Use Your Information",
    content: [
      "The limited information we collect is used solely to operate and improve the PDFTools service. Usage statistics help us understand which tools are most valuable to users and where we should focus development efforts.",
      "Profile information (display name, profile picture) is used to personalize your experience within the app. This information may be visible to other users who view your public profile if you choose to create one.",
      "We do not sell, trade, or share your information with third parties for marketing purposes. We do not use your information for targeted advertising.",
    ],
  },
  {
    id: "data-storage",
    title: "3. Data Storage and Security",
    content: [
      "PDFTools is built on the Internet Computer Protocol (ICP), a decentralized blockchain platform. Your profile data and preferences are stored in smart contract canisters on the ICP network, which provides inherent security through cryptographic guarantees.",
      "Files you process are never stored on any server. Processing happens entirely within your browser using WebAssembly modules. Once you close the browser tab, any processed data is immediately cleared from memory.",
      "We implement appropriate technical and organizational measures to protect any data we do collect. However, no method of electronic transmission or storage is 100% secure, and we cannot guarantee absolute security.",
    ],
  },
  {
    id: "cookies",
    title: "4. Cookies and Tracking",
    content: [
      "PDFTools uses minimal cookies and local storage to maintain your session and remember your preferences (such as dark mode settings, recent tool usage). These are strictly functional and not used for tracking or advertising.",
      "We do not use third-party advertising cookies. We do not use Facebook Pixel, Google Ads tracking, or similar cross-site tracking technologies.",
      "You can clear cookies and local storage at any time through your browser settings. Doing so will reset your preferences and log you out of any active session.",
    ],
  },
  {
    id: "third-party",
    title: "5. Third-Party Services",
    content: [
      "PDFTools integrates with Google Gemini AI for optional AI-powered features such as optimization suggestions and document translation. When you use these features, your request data (but not your files) may be sent to Google's API. Please refer to Google's Privacy Policy for information on how they handle this data.",
      "We use the Internet Computer Protocol infrastructure for hosting and data storage. The ICP network's privacy and security properties are governed by the DFINITY Foundation's policies.",
      "We may include links to external websites or services. We are not responsible for the privacy practices or content of those external sites. We encourage you to review the privacy policies of any third-party sites you visit.",
    ],
  },
  {
    id: "your-rights",
    title: "6. Your Rights",
    content: [
      "You have the right to access, correct, or delete any personal information we hold about you. Since our service is designed to minimize data collection, the primary personal data we hold is your profile information (display name and profile picture) which you can update or delete at any time from your profile settings.",
      "If you are in the European Union or California, you may have additional rights under GDPR or CCPA respectively, including the right to data portability and the right to object to certain processing activities. Contact us to exercise these rights.",
      "To request deletion of your account and all associated data, contact us at support@pdftools.app. We will process your request within 30 days.",
    ],
  },
  {
    id: "contact-us",
    title: "7. Contact Us",
    content: [
      "If you have any questions, concerns, or requests regarding this Privacy Policy or our data practices, please contact us at support@pdftools.app. We take privacy concerns seriously and will respond within 24 hours.",
      "We may update this Privacy Policy from time to time to reflect changes in our practices or applicable law. We will notify users of significant changes by updating the 'Last updated' date at the top of this page.",
      "By continuing to use PDFTools after changes to this Privacy Policy, you acknowledge and agree to the updated terms.",
    ],
  },
];

export function PrivacyPage() {
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
              <Shield className="w-3.5 h-3.5" />
              Privacy Policy
            </div>
            <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-3">
              Privacy Policy
            </h1>
            <p className="text-muted-foreground font-ui">
              Last updated: January 2026
            </p>
          </motion.div>
        </div>
      </section>

      {/* Important note */}
      <div className="container max-w-3xl px-4 md:px-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="flex gap-4 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800/50 rounded-2xl p-5"
        >
          <AlertCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-ui font-semibold text-green-800 dark:text-green-300 text-sm mb-1">
              Your files stay on your device
            </p>
            <p className="text-sm text-green-700 dark:text-green-400 leading-relaxed">
              We process files entirely in your browser. No files are uploaded
              to our servers — ever. Your documents and images never leave your
              device.
            </p>
          </div>
        </motion.div>
      </div>

      {/* Policy sections */}
      <div className="container max-w-3xl px-4 md:px-6 pb-20">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="space-y-6"
        >
          {sections.map((section, i) => (
            <motion.div
              key={section.id}
              id={section.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 + i * 0.05 }}
              className="bg-card border border-border rounded-2xl p-6 md:p-8 border-l-4 border-l-primary/30"
            >
              <h2 className="font-display text-xl font-bold text-foreground mb-4">
                {section.title}
              </h2>
              <div className="space-y-3">
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
      </div>
    </main>
  );
}
