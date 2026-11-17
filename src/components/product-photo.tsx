import { ProductArtwork } from "@/components/product-artwork";

type ProductPhotoProps = { sku?: string | null; name: string; category?: string | null };
const positions: Record<string, { x: number; y: number }> = {
  P002:{x:0,y:0},P004:{x:16.666667,y:0},P018:{x:33.333333,y:0},P019:{x:50,y:0},P021:{x:66.666667,y:0},P023:{x:83.333333,y:0},P024:{x:100,y:0},
  P025:{x:0,y:25},P027:{x:16.666667,y:25},P028:{x:33.333333,y:25},P029:{x:50,y:25},P034:{x:66.666667,y:25},P035:{x:83.333333,y:25},P036:{x:100,y:25},
  P037:{x:0,y:50},P038:{x:16.666667,y:50},P044:{x:33.333333,y:50},P050:{x:50,y:50},P063:{x:66.666667,y:50},P067:{x:83.333333,y:50},P072:{x:100,y:50},
  P074:{x:0,y:75},P075:{x:16.666667,y:75},P080:{x:33.333333,y:75},P091:{x:50,y:75},P092:{x:66.666667,y:75},P100:{x:83.333333,y:75},P110:{x:100,y:75},
  P119:{x:0,y:100},P120:{x:16.666667,y:100},P124:{x:33.333333,y:100},P141:{x:50,y:100},P181:{x:66.666667,y:100},
};

export function ProductPhoto({ sku, name, category }: ProductPhotoProps) {
  const position = sku ? positions[sku] : undefined;
  if (!position) return <ProductArtwork name={name} sku={sku} category={category} />;
  return (
    <div
      className="approved-product-photo"
      role="img"
      aria-label={"Product photo: " + name}
      style={{ backgroundPosition: position.x + "% " + position.y + "%" }}
    />
  );
}
