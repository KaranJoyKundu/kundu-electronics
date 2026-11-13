import test from "node:test";
import assert from "node:assert/strict";
import { verifiedProductImageExtension } from "./image-signature.ts";

test("accepts matching JPEG, PNG, WebP and AVIF signatures", () => {
  assert.equal(verifiedProductImageExtension("image/jpeg", Uint8Array.from([0xff, 0xd8, 0xff, 0, 0, 0, 0, 0, 0, 0, 0, 0])), "jpg");
  assert.equal(verifiedProductImageExtension("image/png", Uint8Array.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 0])), "png");
  assert.equal(verifiedProductImageExtension("image/webp", new TextEncoder().encode("RIFF0000WEBP")), "webp");
  assert.equal(verifiedProductImageExtension("image/avif", new TextEncoder().encode("0000ftypavif")), "avif");
});

test("rejects mismatched MIME, malformed signatures, SVG and truncated files", () => {
  const png = Uint8Array.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 0]);
  assert.equal(verifiedProductImageExtension("image/jpeg", png), null);
  assert.equal(verifiedProductImageExtension("image/svg+xml", new TextEncoder().encode("<svg></svg>")), null);
  assert.equal(verifiedProductImageExtension("image/webp", new TextEncoder().encode("RIFF0000NOPE")), null);
  assert.equal(verifiedProductImageExtension("image/avif", new TextEncoder().encode("ftypavif")), null);
});
