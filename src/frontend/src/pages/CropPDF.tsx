import { FileDropZone } from "@/components/tools/FileDropZone";
import {
  ProcessButton,
  type ProcessState,
} from "@/components/tools/ProcessButton";
import { ToolLayout } from "@/components/tools/ToolLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAddHistory, useIncrementToolUsage } from "@/hooks/useQueries";
import { downloadBlob, readFileAsArrayBuffer } from "@/utils/pdfUtils";
import { Crop } from "lucide-react";
import { PDFDocument } from "pdf-lib";
import { useCallback, useState } from "react";
import { toast } from "sonner";

export function CropPDF() {
  const [files, setFiles] = useState<File[]>([]);
  const [state, setState] = useState<ProcessState>("idle");
  const [resultBytes, setResultBytes] = useState<Uint8Array | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [margins, setMargins] = useState({
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  });

  const { mutate: incrementUsage } = useIncrementToolUsage();
  const { mutate: addHistory } = useAddHistory();

  const handleProcess = useCallback(async () => {
    if (files.length === 0) return;
    const { top, right, bottom, left } = margins;
    if (top < 0 || right < 0 || bottom < 0 || left < 0) {
      toast.error("Margins must be non-negative.");
      return;
    }
    setState("processing");
    setErrorMsg("");
    try {
      const file = files[0];
      const buf = await readFileAsArrayBuffer(file);
      const doc = await PDFDocument.load(buf, { ignoreEncryption: true });
      const pages = doc.getPages();

      for (const page of pages) {
        const { width, height } = page.getSize();
        // Apply crop box margins (in points, 1pt = ~1.333px at 96dpi)
        const newX = left;
        const newY = bottom;
        const newWidth = Math.max(1, width - left - right);
        const newHeight = Math.max(1, height - top - bottom);
        page.setCropBox(newX, newY, newWidth, newHeight);
      }

      const bytes = await doc.save();
      setResultBytes(bytes);
      setState("done");
      incrementUsage("crop");
      addHistory({
        toolName: "crop",
        originalFile: file.name,
        resultFile: "cropped.pdf",
      });
      toast.success("PDF cropped successfully!");
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to crop PDF";
      setErrorMsg(msg);
      setState("error");
      toast.error(msg);
    }
  }, [files, margins, incrementUsage, addHistory]);

  const handleDownload = useCallback(() => {
    if (resultBytes) downloadBlob(resultBytes, "cropped.pdf");
  }, [resultBytes]);

  const updateMargin = (key: keyof typeof margins, val: string) => {
    const n = Math.max(0, Number.parseInt(val, 10) || 0);
    setMargins((prev) => ({ ...prev, [key]: n }));
  };

  return (
    <ToolLayout
      toolName="Crop PDF"
      toolPath="/crop"
      description="Trim the edges of your PDF by setting crop margins in points (1 pt ≈ 0.35 mm)."
      icon={Crop}
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
              description="Select the PDF you want to crop"
            />
          </CardContent>
        </Card>

        {files.length > 0 && (
          <Card className="border-border shadow-card">
            <CardContent className="pt-6 space-y-6">
              <div>
                <h3 className="font-display font-semibold text-base text-foreground mb-4">
                  Crop Margins (points)
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  {(["top", "right", "bottom", "left"] as const).map((side) => (
                    <div key={side} className="space-y-1.5">
                      <Label
                        htmlFor={`margin-${side}`}
                        className="font-ui font-medium capitalize text-sm"
                      >
                        {side}
                      </Label>
                      <Input
                        id={`margin-${side}`}
                        type="number"
                        min={0}
                        value={margins[side]}
                        onChange={(e) => updateMargin(side, e.target.value)}
                        className="font-ui"
                        placeholder="0"
                      />
                    </div>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-3">
                  Enter margins in PDF points (72 pts = 1 inch). These margins
                  are applied uniformly to all pages.
                </p>
              </div>
              <ProcessButton
                state={state}
                onProcess={handleProcess}
                onDownload={handleDownload}
                processLabel="Crop PDF"
                downloadLabel="Download Cropped PDF"
                errorMessage={errorMsg}
              />
            </CardContent>
          </Card>
        )}
      </div>
    </ToolLayout>
  );
}
