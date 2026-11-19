import Image from "next/image";
import { ProductArtwork } from "@/components/product-artwork";
import { PRODUCT_IMAGE_PATHS } from "@/lib/product-image-paths";

type ProductPhotoProps = { sku?: string | null; name: string; category?: string | null; imageSrc?: string | null };

// Reuse the exact photo assets shown in PROJECTS / LIVE BUILDS for kit cards
// under SHOP PICKS / FROM THE CATALOGUE.
const PROJECT_LIVE_BUILD_PHOTOS: Record<string, { src: string; alt: string }> = {
  lfr: {
    src: "https://makerworkslab.in/projects/projectimages/line_follower_robot.webp",
    alt: "Line follower robot photo used in Projects / Live Builds",
  },
  soccerbot: {
    src: "https://static-01.daraz.com.bd/p/cd19eaa8b5d313b4bfe772c83a433ca9.png",
    alt: "Soccer bot photo used in Projects / Live Builds",
  },
  rc: {
    src: "https://hackster.imgix.net/uploads/attachments/1499405/_k2dhbHE8PH.blob?auto=compress&fit=min&fm=jpg&h=1200&w=1600",
    alt: "RC Speed Battle photo used in Projects / Live Builds",
  },
};

const projectPhotoByKitSku: Record<string, keyof typeof PROJECT_LIVE_BUILD_PHOTOS> = {
  "LFR-T1":"lfr","LFR-T2":"lfr","LFR-T3":"lfr",
  "SB-T1":"soccerbot","SB-T2":"soccerbot","SB-T3":"soccerbot",
  "RC-T1":"rc","RC-T2":"rc","RC-T3":"rc",
};

function LiveProjectPhoto({ projectKey, productName }: { projectKey: keyof typeof PROJECT_LIVE_BUILD_PHOTOS; productName: string }) {
  const photo = PROJECT_LIVE_BUILD_PHOTOS[projectKey];
  return (
    <div className="project-artwork project-artwork-real-photo catalogue-live-project-photo" role="img" aria-label={productName + ": same project image used in Projects / Live Builds"}>
      <img src={photo.src} alt={photo.alt} loading="lazy" />
      <span className="project-artwork-caption">SAME PHOTO AS PROJECTS / LIVE BUILDS</span>
    </div>
  );
}

export function ProductPhoto({ sku, name, category, imageSrc }: ProductPhotoProps) {
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
  }

  const projectKey = sku ? projectPhotoByKitSku[sku] : undefined;
  if (projectKey) return <LiveProjectPhoto projectKey={projectKey} productName={name} />;

  return <ProductArtwork name={name} sku={sku} category={category} />;
}
