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

function ComponentCollage({ kind }: { kind: ProjectKind }) {
  return (
    <div className={"project-artwork project-artwork-" + kind} role="img"
      aria-label={labels[kind] + " — catalogue component illustrations, not a photograph of an assembled robot"}>
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

function DroneConceptArtwork() {
  return (
    <div className="project-artwork project-artwork-concept" role="img"
      aria-label="Concept illustration of a quadcopter drone; not a completed build or confirmed kit">
      <svg className="project-artwork-concept-svg" viewBox="0 0 640 320" aria-hidden="true" focusable="false">
        <g fill="none" stroke="#456653" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round">
          <path d="M320 160 150 70M320 160 490 70M320 160 150 250M320 160 490 250" />
          <path d="M110 70h80M450 70h80M110 250h80M450 250h80" strokeWidth="7" />
          <rect x="265" y="112" width="110" height="96" rx="22" fill="#dce9df" />
          <path d="M290 160h60M320 132v56" strokeWidth="7" />
        </g>
        <g fill="#8aa993" stroke="#456653" strokeWidth="7">
          <circle cx="150" cy="70" r="42"/><circle cx="490" cy="70" r="42"/>
          <circle cx="150" cy="250" r="42"/><circle cx="490" cy="250" r="42"/>
          <circle cx="150" cy="70" r="9" fill="#f7faf7"/><circle cx="490" cy="70" r="9" fill="#f7faf7"/>
          <circle cx="150" cy="250" r="9" fill="#f7faf7"/><circle cx="490" cy="250" r="9" fill="#f7faf7"/>
        </g>
      </svg>
      <span className="project-artwork-caption">DRONE PROJECT CONCEPT · NO VERIFIED BOM OR BUILD PHOTO</span>
    </div>
  );
}

export function ProjectArtwork({ kind }: { kind: ProjectKind }) {
  if (kind === "bee") {
    return (
      <div className="project-artwork project-artwork-real-photo bee-project-hero-photo">
        <img src="https://raw.githubusercontent.com/KaranJoyKundu/portfolio/main/public/images/bee/photo1.jpg" alt="Bee biped robot, completed working prototype" loading="lazy" />
        <span className="project-artwork-caption">BEE BIPED ROBOT · COMPLETED BUILD</span>
        <a className="project-artwork-source" href="https://karanjoykundu.github.io/portfolio/projects/bee-biped-robot" target="_blank" rel="noreferrer">Project case study & photo source ↗</a>
      </div>
    );
  }
  if (kind === "lfr" || kind === "soccerbot" || kind === "rc") {
    return <ComponentCollage kind={kind} />;
  }
  if (kind === "drone") {
    return <DroneConceptArtwork />;
  }

  return (
    <div className={"project-artwork project-artwork-" + kind} role="img" aria-label={labels[kind] + " — catalogue component photo collage"}>
      <div className="project-artwork-photo-grid">
        {components[kind as ProjectKind].map((part) => (
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
