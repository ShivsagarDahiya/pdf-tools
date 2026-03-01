import { Footer } from "@/components/Footer";
import { GeminiChat } from "@/components/GeminiChat";
import { Header } from "@/components/Header";
import { Toaster } from "@/components/ui/sonner";
import { AdminSettingsProvider } from "@/contexts/AdminSettingsContext";
import { AdminPage } from "@/pages/AdminPage";
import { ComparePDF } from "@/pages/ComparePDF";
import { CompressPDF } from "@/pages/CompressPDF";
import { CropPDF } from "@/pages/CropPDF";
import { EditPDF } from "@/pages/EditPDF";
import { ExcelToPDF } from "@/pages/ExcelToPDF";
import { ExtractPages } from "@/pages/ExtractPages";
import { HTMLToPDF } from "@/pages/HTMLToPDF";
import { HistoryPage } from "@/pages/HistoryPage";
import { Home } from "@/pages/Home";
import { ILoveIMGPage } from "@/pages/ILoveIMGPage";
import { JPGToPDF } from "@/pages/JPGToPDF";
import { MergePDF } from "@/pages/MergePDF";
import { OCRPDF } from "@/pages/OCRPDF";
import { OptimizePDF } from "@/pages/OptimizePDF";
import { OrganizePDF } from "@/pages/OrganizePDF";
import { PDFToExcel } from "@/pages/PDFToExcel";
import { PDFToJPG } from "@/pages/PDFToJPG";
import { PDFToPDFA } from "@/pages/PDFToPDFA";
import { PDFToPowerPoint } from "@/pages/PDFToPowerPoint";
import { PDFToWord } from "@/pages/PDFToWord";
import { PageNumbers } from "@/pages/PageNumbers";
import { PowerPointToPDF } from "@/pages/PowerPointToPDF";
import { PremiumPage } from "@/pages/PremiumPage";
import { ProfilePage } from "@/pages/ProfilePage";
import { ProtectPDF } from "@/pages/ProtectPDF";
import { PublicProfilePage } from "@/pages/PublicProfilePage";
import { RedactPDF } from "@/pages/RedactPDF";
import { RemovePages } from "@/pages/RemovePages";
import { RepairPDF } from "@/pages/RepairPDF";
import { RotatePDF } from "@/pages/RotatePDF";
import { ScanToPDF } from "@/pages/ScanToPDF";
import { SignPDF } from "@/pages/SignPDF";
import { SplitPDF } from "@/pages/SplitPDF";
import { TranslatePDF } from "@/pages/TranslatePDF";
import { UnlockPDF } from "@/pages/UnlockPDF";
import { WatermarkPDF } from "@/pages/WatermarkPDF";
import { WordToPDF } from "@/pages/WordToPDF";
import { WorkflowsPage } from "@/pages/WorkflowsPage";
import {
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";

// Root layout
const rootRoute = createRootRoute({
  component: () => (
    <AdminSettingsProvider>
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <div className="flex-1">
          <Outlet />
        </div>
        <Footer />
        <Toaster position="bottom-right" richColors />
        <GeminiChat />
      </div>
    </AdminSettingsProvider>
  ),
});

// Routes
const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: Home,
});
const mergeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/merge",
  component: MergePDF,
});
const splitRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/split",
  component: SplitPDF,
});
const compressRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/compress",
  component: CompressPDF,
});
const rotateRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/rotate",
  component: RotatePDF,
});
const watermarkRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/watermark",
  component: WatermarkPDF,
});
const protectRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/protect",
  component: ProtectPDF,
});
const unlockRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/unlock",
  component: UnlockPDF,
});
const pdfToJpgRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/pdf-to-jpg",
  component: PDFToJPG,
});
const jpgToPdfRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/jpg-to-pdf",
  component: JPGToPDF,
});
const pageNumbersRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/page-numbers",
  component: PageNumbers,
});
const organizeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/organize",
  component: OrganizePDF,
});
const historyRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/history",
  component: HistoryPage,
});

// New routes
const removePagesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/remove-pages",
  component: RemovePages,
});
const extractPagesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/extract-pages",
  component: ExtractPages,
});
const optimizeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/optimize",
  component: OptimizePDF,
});
const repairRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/repair",
  component: RepairPDF,
});
const ocrRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/ocr",
  component: OCRPDF,
});
const scanToPdfRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/scan-to-pdf",
  component: ScanToPDF,
});
const wordToPdfRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/word-to-pdf",
  component: WordToPDF,
});
const pptxToPdfRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/pptx-to-pdf",
  component: PowerPointToPDF,
});
const excelToPdfRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/excel-to-pdf",
  component: ExcelToPDF,
});
const htmlToPdfRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/html-to-pdf",
  component: HTMLToPDF,
});
const pdfToWordRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/pdf-to-word",
  component: PDFToWord,
});
const pdfToPptxRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/pdf-to-pptx",
  component: PDFToPowerPoint,
});
const pdfToExcelRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/pdf-to-excel",
  component: PDFToExcel,
});
const pdfToPdfaRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/pdf-to-pdfa",
  component: PDFToPDFA,
});
const editPdfRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/edit",
  component: EditPDF,
});
const cropPdfRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/crop",
  component: CropPDF,
});
const signPdfRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/sign",
  component: SignPDF,
});
const redactPdfRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/redact",
  component: RedactPDF,
});
const comparePdfRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/compare",
  component: ComparePDF,
});
const translatePdfRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/translate",
  component: TranslatePDF,
});
const workflowsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/workflows",
  component: WorkflowsPage,
});
const premiumRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/premium",
  component: PremiumPage,
});
const ilovepdfRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/ilovepdf",
  component: ILoveIMGPage,
});
const profileRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/profile",
  component: ProfilePage,
});
const adminRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin",
  component: AdminPage,
});
const publicProfileRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/user/$principalId",
  component: PublicProfilePage,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  mergeRoute,
  splitRoute,
  compressRoute,
  rotateRoute,
  watermarkRoute,
  protectRoute,
  unlockRoute,
  pdfToJpgRoute,
  jpgToPdfRoute,
  pageNumbersRoute,
  organizeRoute,
  historyRoute,
  // New routes
  removePagesRoute,
  extractPagesRoute,
  optimizeRoute,
  repairRoute,
  ocrRoute,
  scanToPdfRoute,
  wordToPdfRoute,
  pptxToPdfRoute,
  excelToPdfRoute,
  htmlToPdfRoute,
  pdfToWordRoute,
  pdfToPptxRoute,
  pdfToExcelRoute,
  pdfToPdfaRoute,
  editPdfRoute,
  cropPdfRoute,
  signPdfRoute,
  redactPdfRoute,
  comparePdfRoute,
  translatePdfRoute,
  workflowsRoute,
  premiumRoute,
  ilovepdfRoute,
  profileRoute,
  adminRoute,
  publicProfileRoute,
]);

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return <RouterProvider router={router} />;
}
