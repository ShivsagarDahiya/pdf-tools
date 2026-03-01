import { FileDropZone } from "@/components/tools/FileDropZone";
import {
  ProcessButton,
  type ProcessState,
} from "@/components/tools/ProcessButton";
import { ToolLayout } from "@/components/tools/ToolLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { useAddHistory, useIncrementToolUsage } from "@/hooks/useQueries";
import { downloadBlob, readFileAsArrayBuffer } from "@/utils/pdfUtils";
import { Stamp } from "lucide-react";
import { PDFDocument, StandardFonts, degrees, rgb } from "pdf-lib";
import { useCallback, useState } from "react";
import { toast } from "sonner";

export function WatermarkPDF() {
  const [files, setFiles] = useState<File[]>([]);
  const [watermarkText, setWatermarkText] = useState("CONFIDENTIAL");
  const [opacity, setOpacity] = useState([0.3]);
  const [fontSize, setFontSize] = useState([48]);
  const [state, setState] = useState<ProcessState>("idle");
  const [resultBytes, setResultBytes] = useState<Uint8Array | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  const { mutate: incrementUsage } = useIncrementToolUsage();
  const { mutate: addHistory } = useAddHistory();

  const handleProcess = useCallback(async () => {
    if (files.length === 0) return;
    if (!watermarkText.trim()) {
      toast.error("Please enter watermark text.");
      return;
    }
    setState("processing");
    setErrorMsg("");
    try {
      const buf = await readFileAsArrayBuffer(files[0]);
      const doc = await PDFDocument.load(buf);
      const font = await doc.embedFont(StandardFonts.HelveticaBold);
      const pages = doc.getPages();
      const opacityVal = opacity[0];
      const fontSizeVal = fontSize[0];
      const text = watermarkText.trim();

      for (const page of pages) {
        const { width, height } = page.getSize();
        const textWidth = font.widthOfTextAtSize(text, fontSizeVal);
        const x = (width - textWidth) / 2;
        const y = height / 2;

        page.drawText(text, {
          x,
          y,
          size: fontSizeVal,
          font,
          color: rgb(0.5, 0.5, 0.5),
          opacity: opacityVal,
          rotate: degrees(45),
        });
      }

      const bytes = await doc.save();
      setResultBytes(bytes);
      setState("done");
      incrementUsage("watermark");
      addHistory({
        toolName: "watermark",
        originalFile: files[0].name,
        resultFile: "watermarked.pdf",
      });
      toast.success("Watermark added successfully!");
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to add watermark";
      setErrorMsg(msg);
      setState("error");
      toast.error(msg);
    }
  }, [files, watermarkText, opacity, fontSize, incrementUsage, addHistory]);

  const handleDownload = useCallback(() => {
    if (resultBytes) downloadBlob(resultBytes, "watermarked.pdf");
  }, [resultBytes]);

  return (
    <ToolLayout
      toolName="Watermark PDF"
      toolPath="/watermark"
      description="Add a diagonal text watermark to all pages of your PDF."
      icon={Stamp}
      iconColor="#9B3BE2"
    >
      <div className="space-y-6">
        <Card className="border-border shadow-card">
          <CardContent className="pt-6">
            <FileDropZone
              accept=".pdf"
              multiple={false}
              files={files}
              onFilesChange={setFiles}
              label="Drop your PDF here"
              description="Select the PDF to watermark"
            />
          </CardContent>
        </Card>

        {files.length > 0 && (
          <Card className="border-border shadow-card">
            <CardContent className="pt-6 space-y-6">
              <div className="space-y-2">
                <Label htmlFor="wm-text">Watermark text</Label>
                <Input
                  id="wm-text"
                  value={watermarkText}
                  onChange={(e) => setWatermarkText(e.target.value)}
                  placeholder="e.g. CONFIDENTIAL"
                  className="font-ui"
                />
              </div>

              <div className="space-y-3">
                <Label>Opacity: {Math.round(opacity[0] * 100)}%</Label>
                <Slider
                  min={0.05}
                  max={1}
                  step={0.05}
                  value={opacity}
                  onValueChange={setOpacity}
                  className="w-full max-w-xs"
                />
              </div>

              <div className="space-y-3">
                <Label>Font size: {fontSize[0]}pt</Label>
                <Slider
                  min={12}
                  max={120}
                  step={4}
                  value={fontSize}
                  onValueChange={setFontSize}
                  className="w-full max-w-xs"
                />
              </div>

              <ProcessButton
                state={state}
                onProcess={handleProcess}
                onDownload={handleDownload}
                processLabel="Add Watermark"
                downloadLabel="Download Watermarked PDF"
                errorMessage={errorMsg}
              />
            </CardContent>
          </Card>
        )}
      </div>
    </ToolLayout>
  );
}
