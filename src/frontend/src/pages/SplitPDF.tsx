import { FileDropZone } from "@/components/tools/FileDropZone";
import {
  ProcessButton,
  type ProcessState,
} from "@/components/tools/ProcessButton";
import { ToolLayout } from "@/components/tools/ToolLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useAddHistory, useIncrementToolUsage } from "@/hooks/useQueries";
import {
  downloadBlob,
  parsePageRanges,
  readFileAsArrayBuffer,
} from "@/utils/pdfUtils";
import JSZip from "jszip";
import { Scissors } from "lucide-react";
import { PDFDocument } from "pdf-lib";
import { useCallback, useState } from "react";
import { toast } from "sonner";

export function SplitPDF() {
  const [files, setFiles] = useState<File[]>([]);
  const [splitMode, setSplitMode] = useState<"every" | "ranges">("every");
  const [ranges, setRanges] = useState("1-3, 4-6");
  const [pageCount, setPageCount] = useState<number | null>(null);
  const [state, setState] = useState<ProcessState>("idle");
  const [resultBlob, setResultBlob] = useState<Uint8Array | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  const { mutate: incrementUsage } = useIncrementToolUsage();
  const { mutate: addHistory } = useAddHistory();

  const handleFilesChange = useCallback(async (newFiles: File[]) => {
    setFiles(newFiles);
    setState("idle");
    setResultBlob(null);
    if (newFiles.length > 0) {
      try {
        const buf = await readFileAsArrayBuffer(newFiles[0]);
        const doc = await PDFDocument.load(buf);
        setPageCount(doc.getPageCount());
      } catch {
        setPageCount(null);
      }
    } else {
      setPageCount(null);
    }
  }, []);

  const handleProcess = useCallback(async () => {
    if (files.length === 0) return;
    setState("processing");
    setErrorMsg("");
    try {
      const buf = await readFileAsArrayBuffer(files[0]);
      const srcDoc = await PDFDocument.load(buf);
      const total = srcDoc.getPageCount();

      const zip = new JSZip();

      if (splitMode === "every") {
        for (let i = 0; i < total; i++) {
          const single = await PDFDocument.create();
          const [page] = await single.copyPages(srcDoc, [i]);
          single.addPage(page);
          const bytes = await single.save();
          zip.file(`page_${i + 1}.pdf`, bytes);
        }
      } else {
        const rangeGroups = ranges
          .split(",")
          .map((r) => r.trim())
          .filter(Boolean);
        for (let gi = 0; gi < rangeGroups.length; gi++) {
          const pages = parsePageRanges(rangeGroups[gi], total).map(
            (p) => p - 1,
          );
          const chunk = await PDFDocument.create();
          const copied = await chunk.copyPages(srcDoc, pages);
          for (const p of copied) chunk.addPage(p);
          const bytes = await chunk.save();
          zip.file(`part_${gi + 1}.pdf`, bytes);
        }
      }

      const zipBytes = await zip.generateAsync({ type: "uint8array" });
      setResultBlob(zipBytes);
      setState("done");
      incrementUsage("split");
      addHistory({
        toolName: "split",
        originalFile: files[0].name,
        resultFile: "split_pages.zip",
      });
      toast.success("PDF split successfully!");
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to split PDF";
      setErrorMsg(msg);
      setState("error");
      toast.error(msg);
    }
  }, [files, splitMode, ranges, incrementUsage, addHistory]);

  const handleDownload = useCallback(() => {
    if (resultBlob)
      downloadBlob(resultBlob, "split_pages.zip", "application/zip");
  }, [resultBlob]);

  return (
    <ToolLayout
      toolName="Split PDF"
      toolPath="/split"
      description="Extract pages or split a PDF into multiple documents."
      icon={Scissors}
      iconColor="#D64E4E"
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
              description="Select the PDF you want to split"
            />
          </CardContent>
        </Card>

        {files.length > 0 && (
          <Card className="border-border shadow-card">
            <CardContent className="pt-6 space-y-6">
              {pageCount !== null && (
                <p className="text-sm text-muted-foreground">
                  This PDF has{" "}
                  <strong className="text-foreground">{pageCount} pages</strong>
                  .
                </p>
              )}

              <div className="space-y-3">
                <Label className="text-sm font-medium">Split mode</Label>
                <RadioGroup
                  value={splitMode}
                  onValueChange={(v) => setSplitMode(v as "every" | "ranges")}
                >
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="every" id="every" />
                    <Label htmlFor="every" className="cursor-pointer">
                      Split every page (one PDF per page)
                    </Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="ranges" id="ranges" />
                    <Label htmlFor="ranges" className="cursor-pointer">
                      Split by page ranges
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {splitMode === "ranges" && (
                <div className="space-y-2">
                  <Label htmlFor="ranges-input">Page ranges</Label>
                  <Input
                    id="ranges-input"
                    value={ranges}
                    onChange={(e) => setRanges(e.target.value)}
                    placeholder="e.g. 1-3, 4-6, 7"
                    className="font-mono"
                  />
                  <p className="text-xs text-muted-foreground">
                    Each comma-separated group becomes its own PDF file.
                  </p>
                </div>
              )}

              <ProcessButton
                state={state}
                onProcess={handleProcess}
                onDownload={handleDownload}
                processLabel="Split PDF"
                downloadLabel="Download ZIP"
                errorMessage={errorMsg}
              />
            </CardContent>
          </Card>
        )}
      </div>
    </ToolLayout>
  );
}
