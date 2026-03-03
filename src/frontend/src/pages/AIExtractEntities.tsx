import { ToolLayout } from "@/components/tools/ToolLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAddHistory, useIncrementToolUsage } from "@/hooks/useQueries";
import { callGemini, extractTextFromPDF } from "@/utils/geminiApi";
import { Loader2, Tag, Upload, X } from "lucide-react";
import { useCallback, useRef, useState } from "react";
import { toast } from "sonner";

interface Entities {
  persons: string[];
  organizations: string[];
  dates: string[];
  locations: string[];
  other: string[];
}

const ENTITY_STYLES: Record<
  keyof Entities,
  { label: string; color: string; bg: string }
> = {
  persons: { label: "People", color: "#2563EB", bg: "#EFF6FF" },
  organizations: { label: "Organizations", color: "#059669", bg: "#ECFDF5" },
  dates: { label: "Dates", color: "#D97706", bg: "#FFFBEB" },
  locations: { label: "Locations", color: "#7C3AED", bg: "#F5F3FF" },
  other: { label: "Other", color: "#6B7280", bg: "#F9FAFB" },
};

export function AIExtractEntities() {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [entities, setEntities] = useState<Entities | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { mutate: incrementUsage } = useIncrementToolUsage();
  const { mutate: addHistory } = useAddHistory();

  const handleFile = useCallback((f: File) => {
    if (!f.name.toLowerCase().endsWith(".pdf")) {
      toast.error("Please upload a PDF file");
      return;
    }
    setFile(f);
    setEntities(null);
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
    setEntities(null);
    try {
      const text = await extractTextFromPDF(file);
      if (!text.trim()) {
        toast.error("No text found in PDF");
        return;
      }
      const truncated = text.slice(0, 12000);
      const prompt = `Extract all named entities from this text. Return ONLY valid JSON with these exact keys: persons (array of strings), organizations (array of strings), dates (array of strings), locations (array of strings), other (array of strings). No extra text, just JSON. Text:\n\n${truncated}`;
      const result = await callGemini(prompt);

      // Extract JSON from the response
      const jsonMatch = result.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error("Invalid AI response format");
      const parsed: Entities = JSON.parse(jsonMatch[0]);

      // Ensure all keys exist and are arrays
      const normalized: Entities = {
        persons: Array.isArray(parsed.persons) ? parsed.persons : [],
        organizations: Array.isArray(parsed.organizations)
          ? parsed.organizations
          : [],
        dates: Array.isArray(parsed.dates) ? parsed.dates : [],
        locations: Array.isArray(parsed.locations) ? parsed.locations : [],
        other: Array.isArray(parsed.other) ? parsed.other : [],
      };

      setEntities(normalized);
      incrementUsage("Entity Recognition");
      addHistory({
        toolName: "Entity Recognition",
        originalFile: file.name,
        resultFile: "entities.json",
      });
      toast.success("Entities extracted!");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Entity extraction failed",
      );
    } finally {
      setIsLoading(false);
    }
  }, [file, incrementUsage, addHistory]);

  const totalEntities = entities
    ? Object.values(entities).reduce((sum, arr) => sum + arr.length, 0)
    : 0;

  return (
    <ToolLayout
      toolName="Entity Recognition"
      toolPath="/ai-extract-entities"
      description="Auto text extraction and named entity recognition. Identify people, organizations, dates, locations, and more."
      icon={Tag}
      iconColor="#059669"
    >
      <div className="space-y-6">
        <Card className="border-border">
          <CardContent className="pt-6 space-y-4">
            <div
              data-ocid="ai-entities.dropzone"
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
                  ? "border-[#059669] bg-[#059669]/5"
                  : file
                    ? "border-[#059669]/50 bg-[#059669]/5"
                    : "border-border hover:border-[#059669]/40 hover:bg-muted/30"
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
                  <div className="w-9 h-9 rounded-lg bg-[#059669]/15 flex items-center justify-center flex-shrink-0">
                    <Tag className="w-5 h-5 text-[#059669]" />
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
                      setEntities(null);
                    }}
                    className="w-7 h-7 rounded-lg bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground flex-shrink-0"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <div className="w-10 h-10 rounded-xl bg-[#059669]/10 flex items-center justify-center">
                    <Upload className="w-5 h-5 text-[#059669]" />
                  </div>
                  <p className="font-ui text-sm text-muted-foreground">
                    Drop PDF or click to browse
                  </p>
                </div>
              )}
            </div>

            <Button
              data-ocid="ai-entities.submit_button"
              onClick={handleProcess}
              disabled={!file || isLoading}
              className="w-full gap-2"
              style={{ backgroundColor: "#059669" }}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Extracting entities…
                </>
              ) : (
                <>
                  <Tag className="w-4 h-4" />
                  Extract Entities
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {isLoading && (
          <div
            data-ocid="ai-entities.loading_state"
            className="flex items-center justify-center gap-3 py-6 text-muted-foreground"
          >
            <Loader2 className="w-5 h-5 animate-spin text-[#059669]" />
            <span className="font-ui">Recognizing entities…</span>
          </div>
        )}

        {entities && !isLoading && (
          <div data-ocid="ai-entities.success_state" className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-display font-semibold text-foreground">
                Found {totalEntities} entities
              </h3>
            </div>
            {(Object.keys(ENTITY_STYLES) as Array<keyof Entities>).map(
              (key) => {
                const items = entities[key];
                if (items.length === 0) return null;
                const style = ENTITY_STYLES[key];
                return (
                  <Card
                    key={key}
                    className="border-border"
                    data-ocid="ai-entities.card"
                  >
                    <CardContent className="pt-4">
                      <p
                        className="font-ui font-semibold text-xs uppercase tracking-wider mb-3"
                        style={{ color: style.color }}
                      >
                        {style.label} ({items.length})
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {items.map((item) => (
                          <Badge
                            key={item}
                            className="font-ui text-xs"
                            style={{
                              backgroundColor: style.bg,
                              color: style.color,
                              border: `1px solid ${style.color}30`,
                            }}
                          >
                            {item}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                );
              },
            )}
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
