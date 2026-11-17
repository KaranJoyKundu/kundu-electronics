import Image from "next/image";
import Link from "next/link";

const products = [
  { id: "P002", name: "Mini Metal Ball Caster Wheel", category: "Robotics parts & mechanical", slug: "mini-metal-ball-caster-wheel-p002", image: "/product-previews/P002.webp" },
  { id: "P004", name: "BO Motor 6V 100RPM Geared DC Motor", category: "Robotics parts & mechanical", slug: "bo-motor-6v-100rpm-geared-dc-motor-p004", image: "/product-previews/P004.webp" },
  { id: "P019", name: "Arduino Uno SMD", category: "Microcontrollers & development boards", slug: "arduino-uno-smd-p019", image: "/product-previews/P019.webp" },
  { id: "P023", name: "ESP32 DevKit v1", category: "Microcontrollers & development boards", slug: "esp32-devkit-v1-p023", image: "/product-previews/P023.webp" },
  { id: "P027", name: "STM32 Black Pill", category: "Microcontrollers & development boards", slug: "stm32-black-pill-p027", image: "/product-previews/P027.webp" },
  { id: "P029", name: "0.96 Inch OLED Display I2C Module", category: "Displays", slug: "0-96-inch-oled-display-i2c-module-p029", image: "/product-previews/P029.webp" },
  { id: "P034", name: "TP4056 Type-C Lithium Battery Charging Module protected variant", category: "Sensors & modules", slug: "tp4056-type-c-lithium-battery-charging-module-protected-variant-p034", image: "/product-previews/P034.webp" },
  { id: "P050", name: "TCRT5000 IR Line Tracking Sensor Module (single)", category: "Sensors & modules", slug: "tcrt5000-ir-line-tracking-sensor-module-single-p050", image: "/product-previews/P050.webp" },
  { id: "P035", name: "DHT11 Temperature and Humidity Sensor Module", category: "Sensors & modules", slug: "dht11-temperature-and-humidity-sensor-module-p035", image: "/product-previews/P035.webp" },
  { id: "P036", name: "HC-SR04 Ultrasonic Distance Sensor Module", category: "Sensors & modules", slug: "hc-sr04-ultrasonic-distance-sensor-module-p036", image: "/product-previews/P036.webp" },
  { id: "P037", name: "SG90 Micro Servo Motor 9G", category: "Sensors & modules", slug: "sg90-micro-servo-motor-9g-p037", image: "/product-previews/P037.webp" },
  { id: "P038", name: "DT830D Digital Multimeter", category: "Sensors & modules", slug: "dt830d-digital-multimeter-p038", image: "/product-previews/P038.webp" },
  { id: "P063", name: "L298N H-Bridge Motor Driver Module", category: "Motor drivers & controllers", slug: "l298n-h-bridge-motor-driver-module-p063", image: "/product-previews/P063.webp" },
  { id: "P080", name: "Mini Solderless Breadboard 400 Pin", category: "Prototyping boards", slug: "mini-solderless-breadboard-400-pin-p080", image: "/product-previews/P080.webp" },
  { id: "P181", name: "18650 Sunfort Rechargeable Battery", category: "Batteries & power sources", slug: "18650-sunfort-rechargeable-battery-p181", image: "/product-previews/P181.webp" },
] as const;

export function OwnerProductGallery() {
  return (
    <div className="owner-gallery-grid">
      {products.map((product) => {
        const message = `Hello Kundu Electronics, I am interested in ${product.name} (${product.id}). Could you confirm current availability?`;
        const contactUrl = `https://wa.me/8801570263442?text=${encodeURIComponent(message)}`;
        return (
          <article className="owner-gallery-card" key={product.id}>
            <Link className="owner-gallery-image" href={`/products/${product.slug}`} aria-label={`View price and availability for ${product.name}`}>
              <Image src={product.image} alt={product.name} width={520} height={520} unoptimized />
            </Link>
            <div className="owner-gallery-copy">
              <span className="owner-gallery-category">{product.category}</span>
              <h2>{product.name}</h2>
              <span className="owner-gallery-id">REF. {product.id}</span>
              <Link className="owner-gallery-contact" href={`/products/${product.slug}`}>View price & stock status <span aria-hidden="true">→</span></Link>
              <Link className="owner-gallery-contact" href={contactUrl} target="_blank" rel="noopener noreferrer">Ask us on WhatsApp <span aria-hidden="true">↗</span></Link>
            </div>
          </article>
        );
      })}
    </div>
  );
}
