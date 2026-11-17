import Image from "next/image";
import Link from "next/link";

const products = [
  { id: "P002", name: "Mini Metal Ball Caster Wheel", category: "Robotics parts & mechanics", image: "/product-previews/P002.webp" },
  { id: "P004", name: "BO Geared DC Motor", category: "Robotics parts & mechanics", image: "/product-previews/P004.webp" },
  { id: "P019", name: "Arduino Uno SMD", category: "Microcontrollers & development boards", image: "/product-previews/P019.webp" },
  { id: "P023", name: "ESP32 DevKit V1", category: "Microcontrollers & development boards", image: "/product-previews/P023.webp" },
  { id: "P027", name: "STM32 Black Pill", category: "Microcontrollers & development boards", image: "/product-previews/P027.webp" },
  { id: "P029", name: "0.96-inch OLED Display Module", category: "Displays", image: "/product-previews/P029.webp" },
  { id: "P034", name: "TP4056 Type-C Charging Module", category: "Power & charging modules", image: "/product-previews/P034.webp" },
  { id: "P035", name: "DHT11 Temperature & Humidity Module", category: "Sensors & modules", image: "/product-previews/P035.webp" },
  { id: "P036", name: "HC-SR04 Ultrasonic Sensor Module", category: "Sensors & modules", image: "/product-previews/P036.webp" },
] as const;

export function OwnerProductGallery() {
  return (
    <div className="owner-gallery-grid">
      {products.map((product) => {
        const message = `Hello Kundu Electronics, I am interested in ${product.name} (${product.id}). Could you confirm today's selling price and availability?`;
        const contactUrl = `https://wa.me/8801570263442?text=${encodeURIComponent(message)}`;
        return (
          <article className="owner-gallery-card" key={product.id}>
            <Link className="owner-gallery-image" href={contactUrl} target="_blank" rel="noopener noreferrer" aria-label={`Ask about ${product.name} on WhatsApp`}>
              <Image src={product.image} alt={product.name} width={520} height={520} unoptimized />
            </Link>
            <div className="owner-gallery-copy">
              <span className="owner-gallery-category">{product.category}</span>
              <h2>{product.name}</h2>
              <span className="owner-gallery-id">REF. {product.id}</span>
              <Link className="owner-gallery-contact" href={contactUrl} target="_blank" rel="noopener noreferrer">Ask about price & availability <span aria-hidden="true">↗</span></Link>
            </div>
          </article>
        );
      })}
    </div>
  );
}
