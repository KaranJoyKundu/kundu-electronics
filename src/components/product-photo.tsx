import Image from "next/image";
import { ProductArtwork } from "@/components/product-artwork";

type ProductPhotoProps = { sku?: string | null; name: string; category?: string | null };

const ownerProvidedPhotoSkus = new Set([
  "P002","P004","P019","P023","P025","P027","P029","P034",
  "P035","P036","P037","P038","P050","P063","P080","P181",
]);

// 17 Commons photos arranged as a 5-column by 4-row WebP sprite.
// Positions map to product SKUs; unused final cells remain blank.
const openLicensedPhotoPositions: Record<string, { x: number; y: number }> = {
  P018:{x:0,y:0}, P021:{x:25,y:0}, P024:{x:50,y:0}, P028:{x:75,y:0}, P044:{x:100,y:0},
  P067:{x:0,y:33.333333}, P072:{x:25,y:33.333333}, P074:{x:50,y:33.333333}, P075:{x:75,y:33.333333}, P091:{x:100,y:33.333333},
  P092:{x:0,y:66.666667}, P100:{x:25,y:66.666667}, P110:{x:50,y:66.666667}, P119:{x:75,y:66.666667}, P120:{x:100,y:66.666667},
  P124:{x:0,y:100}, P141:{x:25,y:100},
};

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

  const licensedPosition = sku ? openLicensedPhotoPositions[sku] : undefined;
  if (licensedPosition) {
    return (
      <div
        className="product-photo-open-licensed"
        role="img"
        aria-label={name + " — open-licensed product photograph; source and licence in image credits"}
        style={{ backgroundPosition: licensedPosition.x + "% " + licensedPosition.y + "%" }}
      />
    );
  }

  return <ProductArtwork name={name} sku={sku} category={category} />;
}
