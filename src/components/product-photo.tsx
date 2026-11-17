import { ProductArtwork } from "@/components/product-artwork";

type ProductPhotoProps = { sku?: string | null; name: string; category?: string | null };

const CATALOGUE_PHOTO_COUNT = 211;
const SPRITE_COLUMNS = 16;
const SPRITE_ROWS = 14;

export function ProductPhoto({ sku, name, category }: ProductPhotoProps) {
  const match = sku?.match(/^P(\\d{3})$/);
  const productNumber = match ? Number(match[1]) : 0;
  if (productNumber >= 1 && productNumber <= CATALOGUE_PHOTO_COUNT) {
    const index = productNumber - 1;
    const column = index % SPRITE_COLUMNS;
    const row = Math.floor(index / SPRITE_COLUMNS);
    const x = (column / (SPRITE_COLUMNS - 1)) * 100;
    const y = (row / (SPRITE_ROWS - 1)) * 100;
    return (
      <div
        className="product-photo-catalogue-sprite"
        role="img"
        aria-label={name + " — product photograph from the Kundu Electronics approved catalogue image set"}
        style={{ backgroundPosition: x + "% " + y + "%" }}
      />
    );
  }

  return <ProductArtwork name={name} sku={sku} category={category} />;
}
