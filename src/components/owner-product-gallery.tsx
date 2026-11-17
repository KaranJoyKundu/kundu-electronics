import Link from "next/link";
import { ProductPhoto } from "@/components/product-photo";

const products = [
  { id:"P002",name:"Mini Metal Ball Caster Wheel",category:"Robotics parts & mechanical",slug:"mini-metal-ball-caster-wheel-p002" },
  { id:"P004",name:"BO Motor 6V 100RPM Geared DC Motor",category:"Robotics parts & mechanical",slug:"bo-motor-6v-100rpm-geared-dc-motor-p004" },
  { id:"P018",name:"Stepper Motor Nema 17 (Original)",category:"Robotics parts & mechanical",slug:"stepper-motor-nema-17-original-p018" },
  { id:"P019",name:"Arduino Uno SMD",category:"Microcontrollers & development boards",slug:"arduino-uno-smd-p019" },
  { id:"P021",name:"Arduino Nano (ATmega328P)",category:"Microcontrollers & development boards",slug:"arduino-nano-atmega328p-p021" },
  { id:"P023",name:"ESP32 DevKit v1",category:"Microcontrollers & development boards",slug:"esp32-devkit-v1-p023" },
  { id:"P024",name:"ESP32-CAM",category:"Microcontrollers & development boards",slug:"esp32-cam-p024" },
  { id:"P025",name:"ESP32-S3",category:"Microcontrollers & development boards",slug:"esp32-s3-p025" },
  { id:"P027",name:"STM32 Black Pill",category:"Microcontrollers & development boards",slug:"stm32-black-pill-p027" },
  { id:"P028",name:"NodeMCU (ESP8266)",category:"Microcontrollers & development boards",slug:"nodemcu-esp8266-p028" },
  { id:"P029",name:"0.96 Inch OLED Display I2C Module",category:"Displays",slug:"0-96-inch-oled-display-i2c-module-p029" },
  { id:"P034",name:"TP4056 Type-C Lithium Battery Charging Module protected variant",category:"Sensors & modules",slug:"tp4056-type-c-lithium-battery-charging-module-protected-variant-p034" },
  { id:"P035",name:"DHT11 Temperature and Humidity Sensor Module",category:"Sensors & modules",slug:"dht11-temperature-and-humidity-sensor-module-p035" },
  { id:"P036",name:"HC-SR04 Ultrasonic Distance Sensor Module",category:"Sensors & modules",slug:"hc-sr04-ultrasonic-distance-sensor-module-p036" },
  { id:"P037",name:"SG90 Micro Servo Motor 9G",category:"Sensors & modules",slug:"sg90-micro-servo-motor-9g-p037" },
  { id:"P038",name:"DT830D Digital Multimeter",category:"Test equipment",slug:"dt830d-digital-multimeter-p038" },
  { id:"P044",name:"DS3231 RTC Real Time Clock Module",category:"Sensors & modules",slug:"ds3231-rtc-real-time-clock-module-p044" },
  { id:"P050",name:"TCRT5000 IR Line Tracking Sensor Module (single)",category:"Sensors & modules",slug:"tcrt5000-ir-line-tracking-sensor-module-single-p050" },
  { id:"P063",name:"L298N H-Bridge Motor Driver Module",category:"Motor drivers & controllers",slug:"l298n-h-bridge-motor-driver-module-p063" },
  { id:"P067",name:"Relay 1 Channel",category:"Sensors & modules",slug:"relay-1-channel-p067" },
  { id:"P072",name:"LM2596 DC-DC Buck Converter Module",category:"Power modules",slug:"lm2596-dc-dc-buck-converter-module-p072" },
  { id:"P074",name:"MP1584EN Mini Buck Converter",category:"Power modules",slug:"mp1584en-mini-buck-converter-p074" },
  { id:"P075",name:"XL4015 5A Buck Converter",category:"Power modules",slug:"xl4015-5a-buck-converter-p075" },
  { id:"P080",name:"Mini Solderless Breadboard 400 Pin",category:"Prototyping boards",slug:"mini-solderless-breadboard-400-pin-p080" },
  { id:"P091",name:"1kΩ Resistor Box 5000pcs",category:"Resistors & passive components",slug:"1k-resistor-box-5000pcs-p091" },
  { id:"P092",name:"10kΩ Resistor Box 5000pcs",category:"Resistors & passive components",slug:"10k-resistor-box-5000pcs-p092" },
  { id:"P100",name:"220Ω Resistor",category:"Resistors & passive components",slug:"220-resistor-p100" },
  { id:"P110",name:"7400 Quad 2-Input NAND Gate IC",category:"Logic ICs & regulators",slug:"7400-quad-2-input-nand-gate-ic-p110" },
  { id:"P119",name:"7447 BCD to 7-Segment Driver",category:"Logic ICs & regulators",slug:"7447-bcd-to-7-segment-driver-p119" },
  { id:"P120",name:"7490 Decade Counter (original)",category:"Logic ICs & regulators",slug:"7490-decade-counter-original-p120" },
  { id:"P124",name:"7493 Binary Counter",category:"Logic ICs & regulators",slug:"7493-binary-counter-p124" },
  { id:"P141",name:"5mm LED — Red",category:"LEDs & optoelectronics",slug:"5mm-led-red-p141" },
  { id:"P181",name:"18650 Sunfort Rechargeable Battery",category:"Batteries & power sources",slug:"18650-sunfort-rechargeable-battery-p181" },
] as const;

export function OwnerProductGallery() {
  return (
    <div className="owner-gallery-grid">
      {products.map((product) => {
        const message = "Hello Kundu Electronics, I am interested in " + product.name + " (" + product.id + "). Could you confirm current availability?";
        const contactUrl = "https://wa.me/8801570263442?text=" + encodeURIComponent(message);
        return (
          <article className="owner-gallery-card" key={product.id}>
            <Link className="owner-gallery-image" href={"/products/" + product.slug} aria-label={"View price and availability for " + product.name}>
              <ProductPhoto sku={product.id} name={product.name} category={product.category} />
            </Link>
            <div className="owner-gallery-copy">
              <span className="owner-gallery-category">{product.category}</span>
              <h2>{product.name}</h2>
              <span className="owner-gallery-id">REF. {product.id}</span>
              <Link className="owner-gallery-contact" href={"/products/" + product.slug}>View price & stock status <span aria-hidden="true">→</span></Link>
              <Link className="owner-gallery-contact" href={contactUrl} target="_blank" rel="noopener noreferrer">Ask us on WhatsApp <span aria-hidden="true">↗</span></Link>
            </div>
          </article>
        );
      })}
    </div>
  );
}
