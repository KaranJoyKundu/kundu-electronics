export type SupportedProductImageMime = "image/jpeg" | "image/png" | "image/webp" | "image/avif";

const IMAGE_EXTENSIONS: Record<SupportedProductImageMime, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
};

/** Validate the declared image MIME against file magic bytes before storing it. */
export function verifiedProductImageExtension(mime: string, bytes: Uint8Array): string | null {
  if (!(mime in IMAGE_EXTENSIONS) || bytes.length < 12) return null;

  const ascii = (start: number, end: number) => String.fromCharCode(...bytes.subarray(start, end));
  let valid = false;
  switch (mime as SupportedProductImageMime) {
    case "image/jpeg":
      valid = bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
      break;
    case "image/png":
      valid = bytes[0] === 0x89 && ascii(1, 8) === "PNG\r\n\x1a\n";
      break;
    case "image/webp":
      valid = ascii(0, 4) === "RIFF" && ascii(8, 12) === "WEBP";
      break;
    case "image/avif":
      valid = ascii(4, 8) === "ftyp" && ["avif", "avis"].includes(ascii(8, 12));
      break;
  }

  return valid ? IMAGE_EXTENSIONS[mime as SupportedProductImageMime] : null;
}
