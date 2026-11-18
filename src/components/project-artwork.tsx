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
        <img src="https://commons.wikimedia.org/wiki/Special:FilePath/LineFollower.jpg" alt="Compact line follower robot on a track" loading="lazy" />
        <span className="project-artwork-caption">REAL LINE-FOLLOWER BUILD · PHOTO CREDIT</span>
        <a className="project-artwork-source" href="https://commons.wikimedia.org/wiki/File:LineFollower.jpg" target="_blank" rel="noreferrer">Photo: HimaliKhabar / Wikimedia Commons ↗</a>
      </div>
    );
  }
  if (kind === "soccerbot") {
    return (
      <div className="project-artwork project-artwork-real-photo" role="img" aria-label="Photograph of a four-wheel Arduino soccer robot">
        <img src="https://commons.wikimedia.org/wiki/Special:FilePath/Soccer_Playing_Robots_During_RoboCup_2013.jpg" alt="Four-wheel DIY Arduino soccer bot on artificial turf" loading="lazy" />
        <span className="project-artwork-caption">SOCCER ROBOT REFERENCE PHOTO</span>
        <a className="project-artwork-source" href="https://commons.wikimedia.org/wiki/File:Soccer_Playing_Robots_During_RoboCup_2013.jpg" target="_blank" rel="noreferrer">Photo: Albert van Breemen / Wikimedia Commons ↗</a>
      </div>
    );
  }

  if (kind === "rc") {
    return (
      <div className="project-artwork project-artwork-real-photo" role="img" aria-label="Photograph of an RC hobby car">
        <img src="https://commons.wikimedia.org/wiki/Special:FilePath/RC-car.jpg" alt="Remote control hobby car reference photo" loading="lazy" />
        <span className="project-artwork-caption">RC HOBBY CAR · REFERENCE PHOTO</span>
        <a className="project-artwork-source" href="https://commons.wikimedia.org/wiki/Category:Remote-controlled_models" target="_blank" rel="noreferrer">Photo reference: Wikimedia Commons ↗</a>
      </div>
    );
  }
  if (kind === "drone") {
    return (
      <div className="project-artwork project-artwork-real-photo" role="img" aria-label="Photograph of a quadrotor drone">
        <img src="https://commons.wikimedia.org/wiki/Special:FilePath/ReuseumMakerFaireQuadrotor.JPG" alt="Small quadrotor drone reference photo" loading="lazy" />
        <span className="project-artwork-caption">QUADROTOR · REFERENCE PHOTO</span>
        <a className="project-artwork-source" href="https://commons.wikimedia.org/wiki/Category:Robotics" target="_blank" rel="noreferrer">Photo reference: Wikimedia Commons ↗</a>
      </div>
    );
  }

  return (
    <div className={"project-artwork project-artwork-" + kind} role="img" aria-label={labels[kind] + " — catalogue component photo collage"}>
      <div className="project-artwork-photo-grid">
        {components[kind].map((part) => (
          <figure className="project-artwork-photo" key={part.sku}>
            {part.sku === "P021" ? <img className="project-artwork-nano-photo" src="https://commons.wikimedia.org/wiki/Special:FilePath/Arduino_Nano.jpg" alt="Arduino Nano board photographed on a plain background" loading="lazy" /> : <ProductPhoto name={part.name} sku={part.sku} category={part.category} />}
            <figcaption>{part.name}</figcaption>
          </figure>
        ))}
      </div>
      <span className="project-artwork-caption">CATALOGUE COMPONENT PHOTOS · NOT A BUILD PHOTO</span>
      <span className="project-artwork-index">{labels[kind]}</span>
    </div>
  );
}
