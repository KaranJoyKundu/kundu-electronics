import { ProductArtwork } from "@/components/product-artwork";
import { PRODUCT_IMAGE_PATHS } from "@/lib/product-image-paths";

type ProductPhotoProps = { sku?: string | null; name: string; category?: string | null; imageSrc?: string | null };

export function ProductPhoto({ sku, name, category, imageSrc }: ProductPhotoProps) {
  // LFR kit SKUs are assembled-to-order bundles and do not have individual catalogue photos yet.
  // This is a clearly identified reference photo, not a claim that it is the exact shop-built unit.
  const isLineFollowerKit = name.toLowerCase().includes("lfr line follower robot");
  const originalImage = imageSrc || (sku ? PRODUCT_IMAGE_PATHS[sku] : undefined) || (isLineFollowerKit ? "https://makerworkslab.in/projects/projectimages/line_follower_robot.webp" : undefined);

  if (originalImage) {
    return (
      <img
        className="product-photo-real"
        src={originalImage}
        alt={isLineFollowerKit && !imageSrc ? `Reference photo of ${name}` : name}
        loading="lazy"
        decoding="async"
      />
    );
  }

  return <ProductArtwork name={name} sku={sku} category={category} />;
}
