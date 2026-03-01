import { FileDropZone } from "@/components/tools/FileDropZone";
import {
  ProcessButton,
  type ProcessState,
} from "@/components/tools/ProcessButton";
import { ToolLayout } from "@/components/tools/ToolLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAddHistory, useIncrementToolUsage } from "@/hooks/useQueries";
import { downloadBlob, readFileAsArrayBuffer } from "@/utils/pdfUtils";
import JSZip from "jszip";
import { FileImage } from "lucide-react";
import { Download } from "lucide-react";
import { motion } from "motion/react";
import * as pdfjsLib from "pdfjs-dist";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

interface PageImage {
  dataUrl: string;
  pageNumber: number;
}

function PageImageCard({ img }: { img: PageImage }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="border border-border rounded-xl overflow-hidden bg-card"
    >
      <img
        src={img.dataUrl}
        alt={`Page ${img.pageNumber}`}
        className="w-full h-auto"
        loading="lazy"
      />
      <div className="p-3 flex items-center justify-between">
        <span className="text-xs text-muted-foreground font-ui">
          Page {img.pageNumber}
        </span>
        <Button
          size="sm"
          variant="outline"
          className="text-xs h-7"
          onClick={() => {
            const a = document.createElement("a");
            a.href = img.dataUrl;
            a.download = `page_${img.pageNumber}.jpg`;
            a.click();
          }}
        >
          <Download className="w-3 h-3 mr-1" />
          JPG
        </Button>
      </div>
    </motion.div>
  );
}

export function PDFToJPG() {
  const [files, setFiles] = useState<File[]>([]);
  const [state, setState] = useState<ProcessState>("idle");
  const [pageImages, setPageImages] = useState<PageImage[]>([]);
  const [progress, setProgress] = useState(0);
  const [errorMsg, setErrorMsg] = useState("");
  const [zipBytes, setZipBytes] = useState<Uint8Array | null>(null);
  const renderedRef = useRef(false);

  const { mutate: incrementUsage } = useIncrementToolUsage();
  const { mutate: addHistory } = useAddHistory();

  const handleFilesChange = useCallback((newFiles: File[]) => {
    setFiles(newFiles);
    setState("idle");
    setPageImages([]);
    setZipBytes(null);
    renderedRef.current = false;
  }, []);

  const handleProcess = useCallback(async () => {
    if (files.length === 0) return;
    setState("processing");
    setPageImages([]);
    setProgress(0);
    setErrorMsg("");
    renderedRef.current = true;

    try {
      const buf = await readFileAsArrayBuffer(files[0]);
      const pdf = await pdfjsLib.getDocument({ data: new Uint8Array(buf) })
        .promise;
      const total = pdf.numPages;
      const images: PageImage[] = [];
      const zip = new JSZip();

      for (let i = 1; i <= total; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 2.0 });
        const canvas = document.createElement("canvas");
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        await page.render({ canvas, viewport }).promise;
        const dataUrl = canvas.toDataURL("image/jpeg", 0.92);
        images.push({ dataUrl, pageNumber: i });

        // Convert data URL to binary for zip
        const base64 = dataUrl.split(",")[1];
        const binary = atob(base64);
        const arr = new Uint8Array(binary.length);
        for (let j = 0; j < binary.length; j++) arr[j] = binary.charCodeAt(j);
        zip.file(`page_${i}.jpg`, arr);

        setProgress(Math.round((i / total) * 100));
        setPageImages([...images]);
      }

      const zipData = await zip.generateAsync({ type: "uint8array" });
      setZipBytes(zipData);
      setState("done");
      incrementUsage("pdf-to-jpg");
      addHistory({
        toolName: "pdf-to-jpg",
        originalFile: files[0].name,
        resultFile: "pages.zip",
      });
      toast.success(`Converted ${total} pages to JPG!`);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to convert PDF";
      setErrorMsg(msg);
      setState("error");
      toast.error(msg);
    }
  }, [files, incrementUsage, addHistory]);

  const handleDownloadAll = useCallback(() => {
    if (zipBytes) downloadBlob(zipBytes, "pages.zip", "application/zip");
  }, [zipBytes]);

  // Cleanup
  useEffect(() => {
    return () => {
      renderedRef.current = false;
    };
  }, []);

  return (
    <ToolLayout
      toolName="PDF to JPG"
      toolPath="/pdf-to-jpg"
      description="Convert each PDF page to a high-quality JPG image."
      icon={FileImage}
      iconColor="#3B7AE2"
    >
      <div className="space-y-6">
        <Card className="border-border shadow-card">
          <CardContent className="pt-6">
            <FileDropZone
              accept=".pdf"
              multiple={false}
              files={files}
              onFilesChange={handleFilesChange}
              label="Drop your PDF here"
              description="Select the PDF to convert to images"
            />
          </CardContent>
        </Card>

        {files.length > 0 && (
          <Card className="border-border shadow-card">
            <CardContent className="pt-6">
              <ProcessButton
                state={state}
                onProcess={handleProcess}
                onDownload={handleDownloadAll}
                processLabel="Convert to JPG"
                downloadLabel="Download All as ZIP"
                progress={progress}
                errorMessage={errorMsg}
              />
            </CardContent>
          </Card>
        )}

        {pageImages.length > 0 && (
          <div>
            <h3 className="font-display font-semibold text-lg mb-4">
              Converted Pages ({pageImages.length})
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {pageImages.map((img) => (
                <PageImageCard key={img.pageNumber} img={img} />
              ))}
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
