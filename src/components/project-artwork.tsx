import { ProductPhoto } from "@/components/product-photo";

export type ProjectKind = "bee" | "lfr" | "soccerbot" | "rc" | "drone";

type ComponentPhoto = { sku: string; name: string; category: string };

const labels: Record<ProjectKind, string> = {
  bee: "BEE BIPED ROBOT",
  lfr: "LINE FOLLOWER ROBOT",
  soccerbot: "SOCCER BOT",
  rc: "RC SPEED BATTLE",
  drone: "DRONE BUILD",
};

// Catalogue photos are real component photographs. They are not photographs of the assembled kits.
const components: Record<ProjectKind, ComponentPhoto[]> = {
  bee: [
    { sku: "P021", name: "Arduino Nano", category: "Microcontrollers & Development Boards" },
    { sku: "P037", name: "SG90 Servo", category: "Sensors & Modules" },
    { sku: "P031", name: "MAX7219 LED Matrix", category: "Displays" },
    { sku: "P175", name: "HC-05 Bluetooth", category: "Sensors & Modules" },
    { sku: "P036", name: "HC-SR04 Ultrasonic", category: "Sensors & Modules" },
    { sku: "P181", name: "18650 Battery", category: "Power" },
  ],
  lfr: [
    { sku: "P021", name: "Arduino Nano", category: "Microcontrollers & Development Boards" },
    { sku: "P064", name: "TB6612FNG Driver", category: "Motor Drivers" },
    { sku: "P006", name: "N20 Gear Motor", category: "Robotics Parts & Mechanical" },
    { sku: "P050", name: "TCRT5000 Sensor", category: "Sensors & Modules" },
    { sku: "P052", name: "QTR-8A Array", category: "Sensors & Modules" },
    { sku: "P036", name: "HC-SR04 Sensor", category: "Sensors & Modules" },
  ],
  soccerbot: [
    { sku: "P021", name: "Arduino Nano", category: "Microcontrollers & Development Boards" },
    { sku: "P175", name: "HC-05 Bluetooth", category: "Sensors & Modules" },
    { sku: "P063", name: "L298N Driver", category: "Motor Drivers" },
    { sku: "P009", name: "Yellow BO Motor", category: "Robotics Parts & Mechanical" },
    { sku: "P013", name: "65mm Rubber Wheel", category: "Robotics Parts & Mechanical" },
    { sku: "P011", name: "GA25 Gear Motor", category: "Robotics Parts & Mechanical" },
  ],
  rc: [
    { sku: "P023", name: "ESP32 DevKit", category: "Microcontrollers & Development Boards" },
    { sku: "P063", name: "L298N Driver", category: "Motor Drivers" },
    { sku: "P065", name: "BTS7960 Driver", category: "Motor Drivers" },
    { sku: "P009", name: "Yellow BO Motor", category: "Robotics Parts & Mechanical" },
    { sku: "P001", name: "65mm Robot Wheel", category: "Robotics Parts & Mechanical" },
    { sku: "P012", name: "GA37 Gear Motor", category: "Robotics Parts & Mechanical" },
  ],
  drone: [
    { sku: "P023", name: "ESP32 DevKit", category: "Microcontrollers & Development Boards" },
    { sku: "P024", name: "ESP32-CAM", category: "Microcontrollers & Development Boards" },
    { sku: "P025", name: "ESP32-S3", category: "Microcontrollers & Development Boards" },
    { sku: "P040", name: "MPU6050 IMU", category: "Sensors & Modules" },
    { sku: "P036", name: "Ultrasonic Sensor", category: "Sensors & Modules" },
    { sku: "P181", name: "18650 Battery", category: "Power" },
  ],
};

export function ProjectArtwork({ kind }: { kind: ProjectKind }) {
  if (kind === "lfr") {
    return (
      <div className="project-artwork project-artwork-real-photo" role="img" aria-label="Photograph of a real line follower robot">
        <img src="https://3zuli.github.io/img/linefollower.jpg" alt="Compact line follower robot on a track" loading="lazy" />
        <span className="project-artwork-caption">REAL LINE-FOLLOWER BUILD · PHOTO CREDIT</span>
        <a className="project-artwork-source" href="https://3zuli.github.io/robotics.html" target="_blank" rel="noreferrer">Source photo: 3zuli Robotics ↗</a>
      </div>
    );
  }
  if (kind === "soccerbot") {
    return (
      <div className="project-artwork project-artwork-real-photo" role="img" aria-label="Photograph of a four-wheel Arduino soccer robot">
        <img src="https://static-01.daraz.com.bd/p/cd19eaa8b5d313b4bfe772c83a433ca9.png" alt="Four-wheel DIY Arduino soccer bot on artificial turf" loading="lazy" />
        <span className="project-artwork-caption">SOCCER ROBOT REFERENCE PHOTO</span>
        <a className="project-artwork-source" href="https://www.daraz.com.bd/products/soccer-bot-diy-arduino-based-robotic-soccer-robot-robobox-4-i323729310.html" target="_blank" rel="noreferrer">Image source: Daraz listing ↗</a>
      </div>
    );
  }

  return (
    <div className={"project-artwork project-artwork-" + kind} role="img" aria-label={labels[kind] + " — catalogue component photo collage"}>
      <div className="project-artwork-photo-grid">
        {components[kind].map((part) => (
          <figure className="project-artwork-photo" key={part.sku}>
            <ProductPhoto name={part.name} sku={part.sku} category={part.category} />
            <figcaption>{part.name}</figcaption>
          </figure>
        ))}
      </div>
      <span className="project-artwork-caption">CATALOGUE COMPONENT PHOTOS · NOT A BUILD PHOTO</span>
      <span className="project-artwork-index">{labels[kind]}</span>
    </div>
  );
}
