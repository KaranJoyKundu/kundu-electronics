import Image from "next/image";
import { ProductArtwork } from "@/components/product-artwork";

type ProductPhotoProps = { sku?: string | null; name: string; category?: string | null };

const ownerProvidedPhotoSkus = new Set([
  "P002","P004","P019","P023","P025","P027","P029","P034",
  "P035","P036","P037","P038","P050","P063","P080","P181",
]);

export function ProductPhoto({ sku, name, category }: ProductPhotoProps) {
  if (sku && ownerProvidedPhotoSkus.has(sku)) {
    return (
      <Image
        src={"/product-previews/" + sku + ".webp"}
        alt={name + " — product photo supplied by Kundu Electronics"}
        width={480}
        height={480}
        className="product-photo-real"
        unoptimized
      />
    );
  }

  return <ProductArtwork name={name} sku={sku} category={category} />;
}
