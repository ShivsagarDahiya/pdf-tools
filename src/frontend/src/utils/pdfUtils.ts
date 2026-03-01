// PDF utility functions using pdf-lib and pdfjs-dist

export function downloadBlob(
  bytes: Uint8Array<ArrayBufferLike>,
  filename: string,
  mimeType = "application/pdf",
) {
  const blob = new Blob([bytes.buffer as ArrayBuffer], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function readFileAsArrayBuffer(file: File): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as ArrayBuffer);
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${Number.parseFloat((bytes / k ** i).toFixed(1))} ${sizes[i]}`;
}

export function parsePageRanges(input: string, totalPages: number): number[] {
  const pages: number[] = [];
  const parts = input.split(",").map((s) => s.trim());
  for (const part of parts) {
    if (part.includes("-")) {
      const [start, end] = part
        .split("-")
        .map((s) => Number.parseInt(s.trim(), 10));
      for (let i = start; i <= Math.min(end, totalPages); i++) {
        if (i >= 1 && !pages.includes(i)) pages.push(i);
      }
    } else {
      const n = Number.parseInt(part, 10);
      if (n >= 1 && n <= totalPages && !pages.includes(n)) pages.push(n);
    }
  }
  return pages.sort((a, b) => a - b);
}
