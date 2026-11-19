import { ProductPhoto } from "@/components/product-photo";

export type ProjectKind = "bee" | "lfr" | "soccerbot" | "rc" | "drone";

const labels: Record<ProjectKind, string> = {
  bee: "BEE BIPED ROBOT",
  lfr: "LINE FOLLOWER ROBOT",
  soccerbot: "SOCCER BOT",
  rc: "RC SPEED BATTLE",
  drone: "DRONE BUILD",
};

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
  if (kind === "lfr") {
    return (
      <div className="project-artwork project-artwork-real-photo" role="img" aria-label="Photograph of a line follower robot">
        <img src="https://makerworkslab.in/projects/projectimages/line_follower_robot.webp" alt="Line follower robot on a marked track" loading="lazy" />
        <span className="project-artwork-caption">LINE-FOLLOWER ROBOT · REFERENCE PHOTO</span>
        <a className="project-artwork-source" href="https://makerworkslab.in/projects/projectimages/line_follower_robot.webp" target="_blank" rel="noreferrer">Photo reference: MakerWorks Lab ↗</a>
      </div>
    );
  }
  if (kind === "soccerbot") {
    return (
      <div className="project-artwork project-artwork-real-photo" role="img" aria-label="Reference photograph of an Arduino soccer robot">
        <img src="https://static-01.daraz.com.bd/p/cd19eaa8b5d313b4bfe772c83a433ca9.png" alt="Four-wheel Arduino soccer robot beside a football on artificial turf" loading="lazy" />
        <span className="project-artwork-caption">SOCCER BOT · REFERENCE PHOTO</span>
        <a className="project-artwork-source" href="https://www.daraz.com.bd/products/soccer-bot-diy-arduino-based-robotic-soccer-robot-robobox-4-i323729310.html" target="_blank" rel="noreferrer">Photo reference: RoboBox-4 product listing ↗</a>
      </div>
    );
  }
  if (kind === "rc") {
    return (
      <div className="project-artwork project-artwork-real-photo" role="img" aria-label="Reference photograph of an Arduino remote-control car">
        <img src="https://hackster.imgix.net/uploads/attachments/1499405/_k2dhbHE8PH.blob?auto=compress&fit=min&fm=jpg&h=1200&w=1600" alt="Arduino remote-control hobby car with its handheld transmitter" loading="lazy" />
        <span className="project-artwork-caption">RC SPEED CAR · REFERENCE PHOTO</span>
        <a className="project-artwork-source" href="https://www.hackster.io/enriquelopezprojects/arduino-rc-car-with-flysky-fs-i6x-controller-and-receiver-994675" target="_blank" rel="noreferrer">Photo reference: Hackster.io Arduino RC car project ↗</a>
      </div>
    );
  }
  if (kind === "drone") {
    return (
      <div className="project-artwork project-artwork-real-photo" role="img" aria-label="Reference photograph of a DIY quadcopter drone">
        <img src="https://content.instructables.com/FMP/EKWZ/L9ZO4HJ4/FMPEKWZL9ZO4HJ4.jpg?auto=webp&fit=bounds&frame=1&height=1024&width=1024" alt="DIY quadcopter frame with four propellers and exposed flight-control electronics" loading="lazy" />
        <span className="project-artwork-caption">QUADCOPTER · REFERENCE PHOTO</span>
        <a className="project-artwork-source" href="https://www.instructables.com/Fusion360-Laser-Cut-Plywood-UAV/" target="_blank" rel="noreferrer">Photo reference: Instructables DIY quadcopter build ↗</a>
      </div>
    );
  }
  return <div className="project-artwork project-artwork-fallback" aria-label={labels[kind]}><ProductPhoto name="Arduino Nano" sku="P021" category="Microcontrollers & Development Boards" /></div>;
}
