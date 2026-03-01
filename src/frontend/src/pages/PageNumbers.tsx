import { FileDropZone } from "@/components/tools/FileDropZone";
import {
  ProcessButton,
  type ProcessState,
} from "@/components/tools/ProcessButton";
import { ToolLayout } from "@/components/tools/ToolLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAddHistory, useIncrementToolUsage } from "@/hooks/useQueries";
import { downloadBlob, readFileAsArrayBuffer } from "@/utils/pdfUtils";
import { Hash } from "lucide-react";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { useCallback, useState } from "react";
import { toast } from "sonner";

type Position = "bottom-center" | "bottom-right" | "bottom-left";

export function PageNumbers() {
  const [files, setFiles] = useState<File[]>([]);
  const [position, setPosition] = useState<Position>("bottom-center");
  const [startNumber, setStartNumber] = useState("1");
  const [fontSize, setFontSize] = useState("12");
  const [state, setState] = useState<ProcessState>("idle");
  const [resultBytes, setResultBytes] = useState<Uint8Array | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  const { mutate: incrementUsage } = useIncrementToolUsage();
  const { mutate: addHistory } = useAddHistory();

  const handleProcess = useCallback(async () => {
    if (files.length === 0) return;
    setState("processing");
    setErrorMsg("");
    try {
      const buf = await readFileAsArrayBuffer(files[0]);
      const doc = await PDFDocument.load(buf);
      const font = await doc.embedFont(StandardFonts.Helvetica);
      const pages = doc.getPages();
      const fSize = Number.parseInt(fontSize, 10) || 12;
      const start = Number.parseInt(startNumber, 10) || 1;
      const margin = 30;

      for (let i = 0; i < pages.length; i++) {
        const page = pages[i];
        const { width } = page.getSize();
        const num = String(i + start);
        const textWidth = font.widthOfTextAtSize(num, fSize);

        let x: number;
        const y = margin;

        if (position === "bottom-center") {
          x = (width - textWidth) / 2;
        } else if (position === "bottom-right") {
          x = width - margin - textWidth;
        } else {
          x = margin;
        }

        page.drawText(num, {
          x,
          y,
          size: fSize,
          font,
          color: rgb(0.2, 0.2, 0.2),
        });
      }

      const bytes = await doc.save();
      setResultBytes(bytes);
      setState("done");
      incrementUsage("page-numbers");
      addHistory({
        toolName: "page-numbers",
        originalFile: files[0].name,
        resultFile: "numbered.pdf",
      });
      toast.success("Page numbers added successfully!");
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to add page numbers";
      setErrorMsg(msg);
      setState("error");
      toast.error(msg);
    }
  }, [files, position, startNumber, fontSize, incrementUsage, addHistory]);

  const handleDownload = useCallback(() => {
    if (resultBytes) downloadBlob(resultBytes, "numbered.pdf");
  }, [resultBytes]);

  return (
    <ToolLayout
      toolName="Add Page Numbers"
      toolPath="/page-numbers"
      description="Add customizable page numbers to every page of your PDF."
      icon={Hash}
      iconColor="#E2823B"
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
              description="Select the PDF to add page numbers to"
            />
          </CardContent>
        </Card>

        {files.length > 0 && (
          <Card className="border-border shadow-card">
            <CardContent className="pt-6 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Position</Label>
                  <Select
                    value={position}
                    onValueChange={(v) => setPosition(v as Position)}
                  >
                    <SelectTrigger className="font-ui">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bottom-center">
                        Bottom Center
                      </SelectItem>
                      <SelectItem value="bottom-right">Bottom Right</SelectItem>
                      <SelectItem value="bottom-left">Bottom Left</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="start-num">Starting number</Label>
                  <Input
                    id="start-num"
                    type="number"
                    min={1}
                    value={startNumber}
                    onChange={(e) => setStartNumber(e.target.value)}
                    className="font-ui"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="font-size">Font size (pt)</Label>
                  <Input
                    id="font-size"
                    type="number"
                    min={6}
                    max={36}
                    value={fontSize}
                    onChange={(e) => setFontSize(e.target.value)}
                    className="font-ui"
                  />
                </div>
              </div>

              <ProcessButton
                state={state}
                onProcess={handleProcess}
                onDownload={handleDownload}
                processLabel="Add Page Numbers"
                downloadLabel="Download PDF"
                errorMessage={errorMsg}
              />
            </CardContent>
          </Card>
        )}
      </div>
    </ToolLayout>
  );
}
