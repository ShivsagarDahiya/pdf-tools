import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { CheckCircle2, Download, Loader2 } from "lucide-react";
import { motion } from "motion/react";

export type ProcessState = "idle" | "processing" | "done" | "error";

interface ProcessButtonProps {
  state: ProcessState;
  onProcess: () => void;
  onDownload: () => void;
  processLabel?: string;
  downloadLabel?: string;
  progress?: number;
  disabled?: boolean;
  errorMessage?: string;
}

export function ProcessButton({
  state,
  onProcess,
  onDownload,
  processLabel = "Process PDF",
  downloadLabel = "Download",
  progress = 0,
  disabled = false,
  errorMessage,
}: ProcessButtonProps) {
  return (
    <div className="space-y-3">
      {state === "processing" && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-2"
        >
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>Processing...</span>
            {progress > 0 && <span>{progress}%</span>}
          </div>
          <Progress value={progress || undefined} className="h-2" />
        </motion.div>
      )}

      {state === "error" && errorMessage && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="p-3 bg-destructive/10 text-destructive rounded-lg text-sm"
        >
          {errorMessage}
        </motion.div>
      )}

      <div className="flex flex-wrap gap-3">
        {state !== "done" && (
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button
              size="lg"
              onClick={onProcess}
              disabled={disabled || state === "processing"}
              className={cn(
                "bg-primary hover:bg-primary/90 text-primary-foreground px-8 font-ui font-semibold",
                state === "processing" && "opacity-80",
              )}
            >
              {state === "processing" ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing…
                </>
              ) : (
                processLabel
              )}
            </Button>
          </motion.div>
        )}

        {state === "done" && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-wrap gap-3 items-center"
          >
            <div className="flex items-center gap-2 text-sm text-success font-medium">
              <CheckCircle2 className="w-4 h-4" />
              Done! Your file is ready.
            </div>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                size="lg"
                onClick={onDownload}
                className="bg-success hover:bg-success/90 text-white px-8 font-ui font-semibold"
              >
                <Download className="mr-2 h-4 w-4" />
                {downloadLabel}
              </Button>
            </motion.div>
            <Button
              variant="outline"
              size="lg"
              onClick={onProcess}
              className="font-ui"
            >
              Process Again
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
