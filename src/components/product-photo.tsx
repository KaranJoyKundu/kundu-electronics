import { ProductArtwork } from "@/components/product-artwork";
import { PRODUCT_IMAGE_PATHS } from "@/lib/product-image-paths";

type ProductPhotoProps = { sku?: string | null; name: string; category?: string | null; imageSrc?: string | null };

export function ProductPhoto({ sku, name, category, imageSrc }: ProductPhotoProps) {
  // Build-to-order project kits use clearly identified reference photos until owner build photos are available.
  const isLineFollowerKit = name.toLowerCase().includes("lfr line follower robot");
  const isProjectKit = Boolean(sku && /^(SB|RC)-T[123]$/.test(sku));
  const originalImage = imageSrc || (sku ? PRODUCT_IMAGE_PATHS[sku] : undefined) || (isLineFollowerKit ? "https://makerworkslab.in/projects/projectimages/line_follower_robot.webp" : undefined);

  if (originalImage) {
    return (
      <img
        className="product-photo-real"
        src={originalImage}
        alt={isLineFollowerKit || isProjectKit ? `Reference photo for ${name}; not a photograph of the exact shop-built kit` : name}
        loading="lazy"
        decoding="async"
      />
    );
  }

  return <ProductArtwork name={name} sku={sku} category={category} />;
}
