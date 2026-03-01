// Adds an index signature to backendInterface so that authorization component
// methods (like _initializeAccessControlWithSecret) can be called even before
// backend.d.ts is regenerated with those methods.
export {};

declare module "./backend" {
  interface backendInterface {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: any;
  }
}
