// Type stubs for packages used at runtime (loaded via CDN / dynamic import).
// These stubs keep TypeScript happy without requiring the packages to be installed.

declare module "pdf-lib" {
  export class PDFDocument {
    static create(): Promise<PDFDocument>;
    static load(
      data: ArrayBuffer | Uint8Array | string,
      options?: Record<string, unknown>,
    ): Promise<PDFDocument>;
    addPage(sizeOrPage?: [number, number] | PDFPage): PDFPage;
    getPages(): PDFPage[];
    getPageCount(): number;
    getPageIndices(): number[];
    copyPages(src: PDFDocument, indices: number[]): Promise<PDFPage[]>;
    removePage(index: number): void;
    embedFont(font: StandardFonts | Uint8Array): Promise<PDFFont>;
    embedJpg(data: ArrayBuffer | Uint8Array): Promise<PDFImage>;
    embedPng(data: ArrayBuffer | Uint8Array): Promise<PDFImage>;
    embedPage(page: PDFPage): Promise<PDFEmbeddedPage>;
    // Metadata setters
    setTitle(title: string): void;
    setAuthor(author: string): void;
    setSubject(subject: string): void;
    setKeywords(keywords: string[]): void;
    setProducer(producer: string): void;
    setCreator(creator: string): void;
    // Metadata getters
    getTitle(): string | undefined;
    getAuthor(): string | undefined;
    getSubject(): string | undefined;
    getProducer(): string | undefined;
    getCreator(): string | undefined;
    getCreationDate(): Date | undefined;
    getModificationDate(): Date | undefined;
    save(options?: Record<string, unknown>): Promise<Uint8Array>;
    saveAsBase64(options?: { dataUri?: boolean }): Promise<string>;
  }

  export class PDFPage {
    getSize(): { width: number; height: number };
    setSize(width: number, height: number): void;
    setRotation(angle: unknown): void;
    getRotation(): { angle: number; type: unknown };
    setCropBox(x: number, y: number, width: number, height: number): void;
    drawText(text: string, options?: Record<string, unknown>): void;
    drawImage(
      image: PDFImage | PDFEmbeddedPage,
      options?: Record<string, unknown>,
    ): void;
    drawRectangle(options?: Record<string, unknown>): void;
    doc: PDFDocument;
  }

  export class PDFFont {
    widthOfTextAtSize(text: string, size: number): number;
    heightAtSize(size: number): number;
  }

  export class PDFImage {
    width: number;
    height: number;
    size(): { width: number; height: number };
    scale(factor: number): { width: number; height: number };
  }

  export class PDFEmbeddedPage {
    width: number;
    height: number;
    scale(factor: number): { width: number; height: number };
  }

  export enum StandardFonts {
    Helvetica = "Helvetica",
    HelveticaBold = "Helvetica-Bold",
    TimesRoman = "Times-Roman",
    Courier = "Courier",
  }

  export function degrees(deg: number): unknown;

  export function rgb(r: number, g: number, b: number): unknown;
}

declare module "pdfjs-dist" {
  export const GlobalWorkerOptions: { workerSrc: string };
  export const version: string;

  export interface GetDocumentOptions {
    data?: ArrayBuffer | Uint8Array;
    url?: string;
    password?: string;
    [key: string]: unknown;
  }

  export function getDocument(
    src: string | ArrayBuffer | Uint8Array | GetDocumentOptions,
  ): { promise: Promise<PDFDocumentProxy> };

  export interface PDFDocumentProxy {
    numPages: number;
    getPage(pageNumber: number): Promise<PDFPageProxy>;
    destroy(): void;
  }

  export interface PDFPageProxy {
    getViewport(options: { scale: number; rotation?: number }): PageViewport;
    render(params: Record<string, unknown>): { promise: Promise<void> };
    getTextContent(): Promise<{ items: Array<{ str: string }> }>;
    cleanup(): void;
  }

  export interface PageViewport {
    width: number;
    height: number;
  }
}

declare module "jszip" {
  interface JSZipFile {
    name: string;
    async(type: "arraybuffer"): Promise<ArrayBuffer>;
    async(type: "uint8array"): Promise<Uint8Array>;
    async(type: "blob"): Promise<Blob>;
    async(type: "text"): Promise<string>;
    async(type: string): Promise<unknown>;
  }

  interface JSZipObject {
    [key: string]: JSZipFile;
  }

  class JSZip {
    files: JSZipObject;
    file(name: string): JSZipFile | null;
    file(
      name: string,
      data: Blob | ArrayBuffer | Uint8Array | string,
      options?: Record<string, unknown>,
    ): this;
    folder(name: string): JSZip;
    generateAsync(options: {
      type: "uint8array";
      compression?: string;
      compressionOptions?: { level: number };
    }): Promise<Uint8Array>;
    generateAsync(options: {
      type: "blob" | "arraybuffer" | "base64" | "nodebuffer";
      compression?: string;
      compressionOptions?: { level: number };
    }): Promise<Blob>;
    loadAsync(
      data: Blob | ArrayBuffer | Uint8Array | string,
      options?: Record<string, unknown>,
    ): Promise<JSZip>;
    forEach(callback: (relativePath: string, file: JSZipFile) => void): void;
  }

  export default JSZip;
}
