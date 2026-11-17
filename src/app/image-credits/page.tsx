import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Image credits",
  description: "Sources and reuse licences for Kundu Electronics product photographs.",
};

const ownerPhotos = [
  ["P002","Mini Metal Ball Caster Wheel"],["P004","BO Geared DC Motor"],["P019","Arduino Uno SMD"],
  ["P023","ESP32 DevKit v1"],["P025","ESP32-S3"],["P027","STM32 Black Pill"],["P029","0.96 Inch OLED Display"],
  ["P034","TP4056 Type-C Charging Module"],["P035","DHT11 Sensor"],["P036","HC-SR04 Sensor"],
  ["P037","SG90 Micro Servo"],["P038","DT830D Digital Multimeter"],["P050","TCRT5000 Line Tracking Module"],
  ["P063","L298N Motor Driver"],["P080","400-pin Mini Breadboard"],["P181","18650 Rechargeable Battery"],
] as const;

const openLicensedPhotos = [
  {sku:"P018",name:"NEMA 17 Stepper Motor",author:"oomlout",license:"CC BY-SA 2.0",source:"https://commons.wikimedia.org/wiki/File:Nema_17_Stepper_Motor.jpg",licenseUrl:"https://creativecommons.org/licenses/by-sa/2.0/"},
  {sku:"P021",name:"Arduino Nano",author:"Nevit Dilmen",license:"CC BY-SA 3.0",source:"https://commons.wikimedia.org/wiki/File:Arduino_Nano_v3_20140410.jpg",licenseUrl:"https://creativecommons.org/licenses/by-sa/3.0/"},
  {sku:"P024",name:"ESP32-CAM",author:"Nowforever",license:"CC BY-SA 4.0",source:"https://commons.wikimedia.org/wiki/File:ESP32-CAM.jpg",licenseUrl:"https://creativecommons.org/licenses/by-sa/4.0/"},
  {sku:"P028",name:"NodeMCU DevKit",author:"Vowstar",license:"CC BY-SA 4.0",source:"https://commons.wikimedia.org/wiki/File:NodeMCU_DEVKIT_1.0.jpg",licenseUrl:"https://creativecommons.org/licenses/by-sa/4.0/"},
  {sku:"P044",name:"DS3231 RTC module",author:"Suyash Dwivedi",license:"CC BY-SA 4.0",source:"https://commons.wikimedia.org/wiki/File:DS3231_based_RTC_module.jpg",licenseUrl:"https://creativecommons.org/licenses/by-sa/4.0/"},
  {sku:"P067",name:"Single-channel relay module",author:"Suyash Dwivedi",license:"CC BY-SA 4.0",source:"https://commons.wikimedia.org/wiki/File:SRD-05VDC-SL-C_5V_one-channel_relay_module.jpg",licenseUrl:"https://creativecommons.org/licenses/by-sa/4.0/"},
  {sku:"P072",name:"LM2596 buck converter",author:"Matthew Berardi",license:"CC BY-SA 4.0",source:"https://commons.wikimedia.org/wiki/File:LM2596_buck_converter_module,_MP1584_buck_converter_module,_and_SDB628_boost_converter_module.jpg",licenseUrl:"https://creativecommons.org/licenses/by-sa/4.0/"},
  {sku:"P074",name:"MP1584 buck converter",author:"Matthew Berardi",license:"CC BY-SA 4.0",source:"https://commons.wikimedia.org/wiki/File:LM2596_buck_converter_module,_MP1584_buck_converter_module,_and_SDB628_boost_converter_module.jpg",licenseUrl:"https://creativecommons.org/licenses/by-sa/4.0/"},
  {sku:"P075",name:"XL4015 CC-CV buck converter",author:"Retired electrician",license:"Permission confirmed by Kundu Electronics; see source page",source:"https://commons.wikimedia.org/wiki/File:XL4015-based_CC-CV_buck_converter_modules_01.jpg"},
  {sku:"P091",name:"1 kΩ resistor",author:"Nevit Dilmen",license:"CC BY-SA 3.0",source:"https://commons.wikimedia.org/wiki/File:1K_Resistor_1480815.jpg",licenseUrl:"https://creativecommons.org/licenses/by-sa/3.0/"},
  {sku:"P092",name:"10 kΩ axial resistor",author:"oomlout",license:"CC BY-SA 2.0",source:"https://commons.wikimedia.org/wiki/File:10_kiloohms_5%25_axial_resistor.jpg",licenseUrl:"https://creativecommons.org/licenses/by-sa/2.0/"},
  {sku:"P100",name:"220 Ω axial resistor",author:"oomlout",license:"CC BY-SA 2.0",source:"https://commons.wikimedia.org/wiki/File:220_ohms_5%25_axial_resistor.jpg",licenseUrl:"https://creativecommons.org/licenses/by-sa/2.0/"},
  {sku:"P110",name:"SN7400 NAND gate IC",author:"Mister rf",license:"CC BY-SA 4.0",source:"https://commons.wikimedia.org/wiki/File:SN7400N_2.jpg",licenseUrl:"https://creativecommons.org/licenses/by-sa/4.0/"},
  {sku:"P119",name:"7447 display driver IC",author:"Mister rf",license:"CC BY-SA 4.0",source:"https://commons.wikimedia.org/wiki/File:HFO_7447_6M.jpg",licenseUrl:"https://creativecommons.org/licenses/by-sa/4.0/"},
  {sku:"P120",name:"SN7490 decade counter IC",author:"Raimond Spekking",license:"CC BY-SA 4.0",source:"https://commons.wikimedia.org/wiki/File:Texas_Instruments_SN7490AN-2466.jpg",licenseUrl:"https://creativecommons.org/licenses/by-sa/4.0/"},
  {sku:"P124",name:"SN7493 binary counter IC",author:"Mister rf",license:"CC BY-SA 4.0",source:"https://commons.wikimedia.org/wiki/File:SN7493N.jpg",licenseUrl:"https://creativecommons.org/licenses/by-sa/4.0/"},
  {sku:"P141",name:"5 mm red LED",author:"oomlout",license:"CC BY-SA 2.0",source:"https://commons.wikimedia.org/wiki/File:5_mm_Red_LED_(on).jpg",licenseUrl:"https://creativecommons.org/licenses/by-sa/2.0/"},
  {sku:"P142",name:"5 mm tinted white LED",author:"oomlout",license:"CC BY-SA 2.0",source:"https://commons.wikimedia.org/wiki/File:5_mm_Tinted_White_LED_(on).jpg",licenseUrl:"https://creativecommons.org/licenses/by-sa/2.0/"},
  {sku:"P146",name:"5 mm green LED",author:"oomlout",license:"CC BY-SA 2.0",source:"https://commons.wikimedia.org/wiki/File:5_mm_Green_LED_(on).jpg",licenseUrl:"https://creativecommons.org/licenses/by-sa/2.0/"},
] as const;

export default function ImageCreditsPage() {
  return (
    <section className="container simple-page image-credits-page">
      <div className="breadcrumb"><Link href="/">Home</Link><span>/</span><span>Image credits</span></div>
      <span className="section-kicker">TRANSPARENCY / PHOTO SOURCES</span>
      <h1>Product image credits</h1>
      <p className="simple-lead">This page identifies the source and reuse terms for the product photographs used in the catalogue and photo gallery.</p>
      <div className="notice-panel">
        <strong>Image processing</strong>
        <p>All 211 matching product photographs are used in the catalogue. The owner confirmed on 18 November 2026 that Kundu Electronics has permission/licence to use the complete supplied image set. The 19 Creative Commons source images are credited individually below; CC BY-SA adaptations retain the same licence version.</p>
      </div>
      <h2>Photos supplied by Kundu Electronics</h2>
      <p>These 16 images were supplied directly by the shop owner as owner-provided product photographs and are used for their matching SKUs.</p>
      <ul className="image-credits-list">
        {ownerPhotos.map(([sku,name]) => <li key={sku}><strong>{sku}</strong> — {name} <span>Photo supplied by Kundu Electronics / owner-provided.</span></li>)}
      </ul>
      <h2>Open-licensed photos used in the gallery</h2>
      <p>These 19 photographs are matched to product SKUs and used in the catalogue. Each adapted tile is a crop from the cited original source image.</p>
      <ul className="image-credits-list">
        {openLicensedPhotos.map((item) => (
          <li key={item.sku}>
            <strong>{item.sku}</strong> — {item.name}. Author: {item.author}. Reuse: {item.licenseUrl ? <Link href={item.licenseUrl} target="_blank" rel="noopener noreferrer">{item.license}</Link> : item.license}. <Link href={item.source} target="_blank" rel="noopener noreferrer">Original source</Link>.
          </li>
        ))}
      </ul>
      <p className="product-order-note">CC BY-SA photos may be shared and adapted with attribution, a licence link and indication of changes; adaptations must remain under the same licence. See each source page and licence text for full terms.</p>
      <Link className="button button-outline" href="/gallery">Back to product photo gallery</Link>
    </section>
  );
}
