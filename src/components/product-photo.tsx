import Image from "next/image";
import { ProductArtwork } from "@/components/product-artwork";
import { PRODUCT_IMAGE_PATHS } from "@/lib/product-image-paths";

type ProductPhotoProps = { sku?: string | null; name: string; category?: string | null; imageSrc?: string | null };

export function ProductPhoto({ sku, name, category, imageSrc }: ProductPhotoProps) {
  // Use an uploaded owner photo or the approved local SKU image. Project kits
  // intentionally fall back to an illustration until an actual kit photograph is supplied.
  const isProjectKit = Boolean(sku && /^(LFR|SB|RC)-T[123]$/.test(sku));
  const originalImage = imageSrc || (sku ? PRODUCT_IMAGE_PATHS[sku] : undefined);

  if (originalImage) {
    return (
      <Image
        className="product-photo-real"
        src={originalImage}
        alt={name}
        width={800}
        height={800}
        sizes="(max-width: 640px) 45vw, (max-width: 1024px) 30vw, 220px"
        loading="lazy"
        decoding="async"
      />
    );
  }

  return (
    <div className={isProjectKit ? "project-kit-photo-fallback" : undefined}>
      <ProductArtwork name={name} sku={sku} category={category} />
    </div>
  );
}
