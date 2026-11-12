import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import type { NextConfig } from "next";

const projectRoot = dirname(fileURLToPath(import.meta.url));

const supabaseImagePattern = (() => {
  const value = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!value) return [];
  try {
    const url = new URL(value);
    if (url.protocol !== "https:" && url.hostname !== "127.0.0.1" && url.hostname !== "localhost") return [];
    return [{ protocol: url.protocol.slice(0, -1) as "https" | "http", hostname: url.hostname, port: url.port, pathname: "/storage/v1/object/sign/product-images/**" }];
  } catch {
    return [];
  }
})();

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: { remotePatterns: supabaseImagePattern },
  experimental: { serverActions: { bodySizeLimit: "9mb" } },
  turbopack: {
    root: projectRoot,
  },
};

export default nextConfig;
