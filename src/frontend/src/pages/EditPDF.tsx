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
import { PenLine } from "lucide-react";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { useCallback, useState } from "react";
import { toast } from "sonner";

export function EditPDF() {
  const [files, setFiles] = useState<File[]>([]);
  const [state, setState] = useState<ProcessState>("idle");
  const [resultBytes, setResultBytes] = useState<Uint8Array | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [text, setText] = useState("Annotation");
  const [posX, setPosX] = useState(50);
  const [posY, setPosY] = useState(50);
  const [fontSize, setFontSize] = useState([14]);

  const { mutate: incrementUsage } = useIncrementToolUsage();
  const { mutate: addHistory } = useAddHistory();

  const handleProcess = useCallback(async () => {
    if (files.length === 0) return;
    if (!text.trim()) {
      toast.error("Please enter annotation text.");
      return;
    }
    setState("processing");
    setErrorMsg("");
    try {
      const file = files[0];
      const buf = await readFileAsArrayBuffer(file);
      const doc = await PDFDocument.load(buf, { ignoreEncryption: true });
      const helvetica = await doc.embedFont(StandardFonts.Helvetica);
      const pages = doc.getPages();

      for (const page of pages) {
        const { width, height } = page.getSize();
        const x = (posX / 100) * width;
        const y = (posY / 100) * height;
        page.drawText(text, {
          x,
          y,
          size: fontSize[0],
          font: helvetica,
          color: rgb(0.1, 0.1, 0.1),
          opacity: 0.85,
        });
      }

      const bytes = await doc.save();
      setResultBytes(bytes);
      setState("done");
      incrementUsage("edit");
      addHistory({
        toolName: "edit",
        originalFile: file.name,
        resultFile: "edited.pdf",
      });
      toast.success("Text annotation added to all pages!");
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to edit PDF";
      setErrorMsg(msg);
      setState("error");
      toast.error(msg);
    }
  }, [files, text, posX, posY, fontSize, incrementUsage, addHistory]);

  const handleDownload = useCallback(() => {
    if (resultBytes) downloadBlob(resultBytes, "edited.pdf");
  }, [resultBytes]);

  return (
    <ToolLayout
      toolName="Edit PDF"
      toolPath="/edit"
      description="Add text annotations and overlays to your PDF pages. Position text freely on the page."
      icon={PenLine}
      iconColor="#3B8CE2"
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
              description="Select the PDF you want to add text to"
            />
          </CardContent>
        </Card>

        {files.length > 0 && (
          <Card className="border-border shadow-card">
            <CardContent className="pt-6 space-y-6">
              <div className="space-y-2">
                <Label
                  htmlFor="annotation-text"
                  className="font-ui font-medium"
                >
                  Annotation text
                </Label>
                <Input
                  id="annotation-text"
                  placeholder="Type your annotation here..."
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  className="font-ui"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="pos-x"
                    className="font-ui font-medium text-sm"
                  >
                    Horizontal position: {posX}%
                  </Label>
                  <Slider
                    id="pos-x"
                    min={0}
                    max={90}
                    step={1}
                    value={[posX]}
                    onValueChange={(v) => setPosX(v[0])}
                  />
                  <p className="text-xs text-muted-foreground">
                    0% = left edge, 90% = near right
                  </p>
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="pos-y"
                    className="font-ui font-medium text-sm"
                  >
                    Vertical position: {posY}%
                  </Label>
                  <Slider
                    id="pos-y"
                    min={0}
                    max={90}
                    step={1}
                    value={[posY]}
                    onValueChange={(v) => setPosY(v[0])}
                  />
                  <p className="text-xs text-muted-foreground">
                    0% = bottom, 90% = near top
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="font-ui font-medium text-sm">
                  Font size: {fontSize[0]}pt
                </Label>
                <Slider
                  min={8}
                  max={72}
                  step={1}
                  value={fontSize}
                  onValueChange={setFontSize}
                />
              </div>

              <div className="p-3 bg-muted/50 rounded-lg text-sm text-muted-foreground">
                The annotation text will be added to <strong>all pages</strong>{" "}
                at the specified position.
              </div>

              <ProcessButton
                state={state}
                onProcess={handleProcess}
                onDownload={handleDownload}
                processLabel="Add Annotation"
                downloadLabel="Download Edited PDF"
                errorMessage={errorMsg}
              />
            </CardContent>
          </Card>
        )}
      </div>
    </ToolLayout>
  );
}
