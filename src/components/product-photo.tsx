import { ProductArtwork } from "@/components/product-artwork";
import { PRODUCT_IMAGE_PATHS } from "@/lib/product-image-paths";

type ProductPhotoProps = { sku?: string | null; name: string; category?: string | null };

export function ProductPhoto({ sku, name, category }: ProductPhotoProps) {
  const originalImage = sku ? PRODUCT_IMAGE_PATHS[sku] : undefined;

  if (originalImage) {
    return (
      <img
        className="product-photo-real"
        src={originalImage}
        alt={name}
        loading="lazy"
        decoding="async"
      />
    );
  }

  return <ProductArtwork name={name} sku={sku} category={category} />;
}
