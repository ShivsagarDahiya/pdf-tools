import { ToolLayout } from "@/components/tools/ToolLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAddHistory, useIncrementToolUsage } from "@/hooks/useQueries";
import { callGemini, extractTextFromPDF } from "@/utils/geminiApi";
import { Download, Loader2, Table2, Upload, X } from "lucide-react";
import { useCallback, useRef, useState } from "react";
import { toast } from "sonner";

interface ExtractedTable {
  title: string;
  rows: string[][];
}

export function AITableExtractor() {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [tables, setTables] = useState<ExtractedTable[] | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { mutate: incrementUsage } = useIncrementToolUsage();
  const { mutate: addHistory } = useAddHistory();

  const handleFile = useCallback((f: File) => {
    if (!f.name.toLowerCase().endsWith(".pdf")) {
      toast.error("Please upload a PDF file");
      return;
    }
    setFile(f);
    setTables(null);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const dropped = e.dataTransfer.files[0];
      if (dropped) handleFile(dropped);
    },
    [handleFile],
  );

  const handleProcess = useCallback(async () => {
    if (!file) return;
    setIsLoading(true);
    setTables(null);
    try {
      const text = await extractTextFromPDF(file);
      if (!text.trim()) {
        toast.error("No text found in PDF");
        return;
      }
      const truncated = text.slice(0, 12000);
      const prompt = `Find all tables in this document and return them as a JSON array. Each element must have "title" (string) and "rows" (array of arrays of strings). The first row should be headers. If no tables are found, return []. Return ONLY valid JSON, no extra text. Document:\n\n${truncated}`;
      const result = await callGemini(prompt);

      const jsonMatch = result.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        setTables([]);
        toast.info("No tables found in this document");
        return;
      }
      const parsed: ExtractedTable[] = JSON.parse(jsonMatch[0]);
      setTables(Array.isArray(parsed) ? parsed : []);
      incrementUsage("Table Extractor");
      addHistory({
        toolName: "Table Extractor",
        originalFile: file.name,
        resultFile: "tables.csv",
      });
      if (parsed.length === 0) {
        toast.info("No tables found in this document");
      } else {
        toast.success(
          `Found ${parsed.length} table${parsed.length > 1 ? "s" : ""}!`,
        );
      }
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Table extraction failed",
      );
    } finally {
      setIsLoading(false);
    }
  }, [file, incrementUsage, addHistory]);

  const downloadCSV = useCallback((table: ExtractedTable, idx: number) => {
    const csv = table.rows
      .map((row) =>
        row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(","),
      )
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `table_${idx + 1}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, []);

  return (
    <ToolLayout
      toolName="Table & Chart Extractor"
      toolPath="/ai-table-extractor"
      description="Automatically detect and extract tables from PDFs. Download each table as a CSV file."
      icon={Table2}
      iconColor="#D97706"
    >
      <div className="space-y-6">
        <Card className="border-border">
          <CardContent className="pt-6 space-y-4">
            <div
              data-ocid="ai-tables.dropzone"
              onDrop={handleDrop}
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onClick={() => inputRef.current?.click()}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ")
                  inputRef.current?.click();
              }}
              className={`relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
                isDragging
                  ? "border-[#D97706] bg-[#D97706]/5"
                  : file
                    ? "border-[#D97706]/50 bg-[#D97706]/5"
                    : "border-border hover:border-[#D97706]/40 hover:bg-muted/30"
              }`}
            >
              <input
                ref={inputRef}
                type="file"
                accept=".pdf"
                className="hidden"
                onChange={(e) =>
                  e.target.files?.[0] && handleFile(e.target.files[0])
                }
              />
              {file ? (
                <div className="flex items-center justify-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-[#D97706]/15 flex items-center justify-center flex-shrink-0">
                    <Table2 className="w-5 h-5 text-[#D97706]" />
                  </div>
                  <div className="text-left flex-1 min-w-0">
                    <p className="font-display font-semibold text-foreground text-sm truncate">
                      {file.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {(file.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setFile(null);
                      setTables(null);
                    }}
                    className="w-7 h-7 rounded-lg bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground flex-shrink-0"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <div className="w-10 h-10 rounded-xl bg-[#D97706]/10 flex items-center justify-center">
                    <Upload className="w-5 h-5 text-[#D97706]" />
                  </div>
                  <p className="font-ui text-sm text-muted-foreground">
                    Drop PDF or click to browse
                  </p>
                </div>
              )}
            </div>

            <Button
              data-ocid="ai-tables.submit_button"
              onClick={handleProcess}
              disabled={!file || isLoading}
              className="w-full gap-2"
              style={{ backgroundColor: "#D97706" }}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Extracting tables…
                </>
              ) : (
                <>
                  <Table2 className="w-4 h-4" />
                  Extract Tables
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {isLoading && (
          <div
            data-ocid="ai-tables.loading_state"
            className="flex items-center justify-center gap-3 py-6 text-muted-foreground"
          >
            <Loader2 className="w-5 h-5 animate-spin text-[#D97706]" />
            <span className="font-ui">Scanning for tables…</span>
          </div>
        )}

        {tables !== null && !isLoading && (
          <div data-ocid="ai-tables.success_state" className="space-y-5">
            {tables.length === 0 ? (
              <Card className="border-border">
                <CardContent className="pt-6 text-center text-muted-foreground font-ui text-sm py-10">
                  No tables found in this document.
                </CardContent>
              </Card>
            ) : (
              tables.map((table, idx) => (
                <Card
                  key={`${table.title}-${table.rows.length}`}
                  className="border-border"
                  data-ocid={`ai-tables.item.${idx + 1}`}
                >
                  <CardContent className="pt-5">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-display font-semibold text-sm text-foreground">
                        {table.title || `Table ${idx + 1}`}
                      </h3>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => downloadCSV(table, idx)}
                        className="gap-1.5 text-xs"
                      >
                        <Download className="w-3.5 h-3.5" />
                        CSV
                      </Button>
                    </div>
                    <div className="overflow-x-auto rounded-lg border border-border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            {(table.rows[0] || []).map((cell) => (
                              <TableHead
                                key={`head-${String(cell)}`}
                                className="text-xs font-ui font-semibold"
                              >
                                {cell}
                              </TableHead>
                            ))}
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {table.rows.slice(1).map((row, ri) => (
                            <TableRow key={`row-${row[0]}-${row.length}-${ri}`}>
                              {row.map((cell, ci) => (
                                <TableCell
                                  key={`cell-${String(cell)}-${ci}`}
                                  className="text-xs font-ui"
                                >
                                  {cell}
                                </TableCell>
                              ))}
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
