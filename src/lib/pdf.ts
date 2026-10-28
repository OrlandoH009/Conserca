export const PDF_MAX = 10 * 1024 * 1024;

/** Un PDF de verdad empieza con "%PDF-"; el nombre o el tipo que manda el navegador no bastan. */
export const isPdf = (b: Uint8Array) => b.length > 5 && new TextDecoder().decode(b.subarray(0, 5)) === "%PDF-";

export const fmtMB = (bytes: number) => `${(bytes / 1024 / 1024).toFixed(1)} MB`;
