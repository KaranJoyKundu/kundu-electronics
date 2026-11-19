import Image from "next/image";
import { ProductArtwork } from "@/components/product-artwork";
import { PRODUCT_IMAGE_PATHS } from "@/lib/product-image-paths";

type ProductPhotoProps = { sku?: string | null; name: string; category?: string | null; imageSrc?: string | null };

const KIT_COMPONENTS: Record<string, string[]> = {
  "LFR-T1": ["P021", "P064", "P006"],
  "LFR-T2": ["P021", "P052", "P064"],
  "LFR-T3": ["P021", "P052", "P064"],
  "SB-T1": ["P021", "P175", "P063"],
  "SB-T2": ["P021", "P175", "P009"],
  "SB-T3": ["P021", "P175", "P011"],
  "RC-T1": ["P023", "P063", "P009"],
  "RC-T2": ["P023", "P065", "P001"],
  "RC-T3": ["P023", "P065", "P012"],
};

function KitComponentPhoto({ sku }: { sku: string }) {
  const path = PRODUCT_IMAGE_PATHS[sku];
  if (!path) return null;
  return <Image src={path} alt="" width={400} height={400} sizes="(max-width: 640px) 30vw, 120px" loading="lazy" decoding="async" />;
}

function ProjectKitCollage({ sku, name }: { sku: string; name: string }) {
  const parts = KIT_COMPONENTS[sku] ?? [];
  if (!parts.length) return <ProductArtwork name={name} sku={sku} />;
  return (
    <div className="project-kit-photo-collage" role="img" aria-label={name + " catalogue component photos, not a photograph of an assembled kit"}>
      <div className="project-kit-photo-collage-grid">
        {parts.map((partSku) => <KitComponentPhoto key={partSku} sku={partSku} />)}
      </div>
      <span className="product-artwork-caption">CATALOGUE COMPONENT PHOTOS · NOT A BUILD PHOTO</span>
    </div>
  );
}

export function ProductPhoto({ sku, name, category, imageSrc }: ProductPhotoProps) {
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

  if (isProjectKit && sku) return <ProjectKitCollage sku={sku} name={name} />;

  return <ProductArtwork name={name} sku={sku} category={category} />;
}
