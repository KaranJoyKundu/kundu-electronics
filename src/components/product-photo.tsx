import Image from "next/image";
import { ProductArtwork } from "@/components/product-artwork";
import { PRODUCT_IMAGE_PATHS } from "@/lib/product-image-paths";

type ProductPhotoProps = { sku?: string | null; name: string; category?: string | null; imageSrc?: string | null };
type KitKind = "lfr" | "soccerbot" | "rc";
type ComponentPhoto = { sku: string; name: string; category: string };

const kitKindBySku: Record<string, KitKind> = {
  "LFR-T1":"lfr","LFR-T2":"lfr","LFR-T3":"lfr",
  "SB-T1":"soccerbot","SB-T2":"soccerbot","SB-T3":"soccerbot",
  "RC-T1":"rc","RC-T2":"rc","RC-T3":"rc",
};

// These deliberately mirror the component photo selections in ProjectArtwork,
// so catalogue tiers show the exact same photos as their live project showcase.
const kitComponents: Record<KitKind, ComponentPhoto[]> = {
  lfr: [
    {sku:"P021",name:"Arduino Nano",category:"Microcontrollers & Development Boards"},
    {sku:"P064",name:"TB6612FNG Driver",category:"Motor Drivers"},
    {sku:"P006",name:"N20 Gear Motor",category:"Robotics Parts & Mechanical"},
    {sku:"P050",name:"TCRT5000 Sensor",category:"Sensors & Modules"},
    {sku:"P052",name:"QTR-8A Array",category:"Sensors & Modules"},
    {sku:"P036",name:"HC-SR04 Sensor",category:"Sensors & Modules"},
  ],
  soccerbot: [
    {sku:"P021",name:"Arduino Nano",category:"Microcontrollers & Development Boards"},
    {sku:"P175",name:"HC-05 Bluetooth",category:"Sensors & Modules"},
    {sku:"P063",name:"L298N Driver",category:"Motor Drivers"},
    {sku:"P009",name:"Yellow BO Motor",category:"Robotics Parts & Mechanical"},
    {sku:"P013",name:"65mm Rubber Wheel",category:"Robotics Parts & Mechanical"},
    {sku:"P011",name:"GA25 Gear Motor",category:"Robotics Parts & Mechanical"},
  ],
  rc: [
    {sku:"P023",name:"ESP32 DevKit",category:"Microcontrollers & Development Boards"},
    {sku:"P063",name:"L298N Driver",category:"Motor Drivers"},
    {sku:"P065",name:"BTS7960 Driver",category:"Motor Drivers"},
    {sku:"P009",name:"Yellow BO Motor",category:"Robotics Parts & Mechanical"},
    {sku:"P001",name:"65mm Robot Wheel",category:"Robotics Parts & Mechanical"},
    {sku:"P012",name:"GA37 Gear Motor",category:"Robotics Parts & Mechanical"},
  ],
};

function ProjectKitPhotoCollage({ sku, name }: {sku:string;name:string}) {
  const kind=kitKindBySku[sku];
  const components=kind ? kitComponents[kind] : [];
  if(!components.length) return <ProductArtwork name={name} sku={sku}/>;
  return (
    <div className={"project-artwork project-artwork-"+kind} role="img"
      aria-label={name+" — catalogue component imagery, matching the project showcase"}>
      <div className="project-artwork-photo-grid">
        {components.map((part)=> {
          const path=PRODUCT_IMAGE_PATHS[part.sku];
          return <figure className="project-artwork-photo" key={part.sku}>
            {path ? <Image src={path} alt="" width={400} height={400} sizes="(max-width: 640px) 30vw, 120px" loading="lazy" decoding="async"/> : <ProductArtwork name={part.name} sku={part.sku} category={part.category}/>}
            <figcaption>{part.name}</figcaption>
          </figure>;
        })}
      </div>
      <span className="project-artwork-caption">CATALOGUE COMPONENT PHOTOS · NOT A BUILD PHOTO</span>
    </div>
  );
}

export function ProductPhoto({ sku, name, category, imageSrc }: ProductPhotoProps) {
  const isProjectKit=Boolean(sku && /^(LFR|SB|RC)-T[123]$/.test(sku));
  const originalImage=imageSrc || (sku ? PRODUCT_IMAGE_PATHS[sku] : undefined);
  if(originalImage) return <Image className="product-photo-real" src={originalImage} alt={name} width={800} height={800} sizes="(max-width: 640px) 45vw, (max-width: 1024px) 30vw, 220px" loading="lazy" decoding="async"/>;
  if(isProjectKit && sku) return <ProjectKitPhotoCollage sku={sku} name={name}/>;
  return <ProductArtwork name={name} sku={sku} category={category}/>;
}
