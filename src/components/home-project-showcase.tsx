"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ProjectArtwork, type ProjectKind } from "@/components/project-artwork";

const slides: Array<{ kind: ProjectKind; title: string; label: string; detail: string; href: string; external?: boolean }> = [
  { kind: "bee", title: "Bee Biped Robot", label: "COMPLETED BUILD", detail: "A Bluetooth-controlled, 3D-printed walking robot built around an Arduino Nano, six servos and an LED-matrix face.", href: "https://github.com/KaranJoyKundu/bee-biped-robot", external: true },
  { kind: "lfr", title: "Line Following Robot", label: "THREE KIT TIERS", detail: "Start with an entry build, move up to a competitive sensor array, or choose the encoder-based elite kit.", href: "/projects#lfr-kits" },
  { kind: "soccerbot", title: "Soccer Bot", label: "THREE KIT TIERS", detail: "Three complete packages for a student soccer robot, from the Budget Scrapper to the Optimized Juggernaut.", href: "/projects#soccerbot-kits" },
  { kind: "rc", title: "RC Speed Battle", label: "THREE KIT TIERS", detail: "Build the race bot and matching remote together, with a choice of three power and control tiers.", href: "/projects#rc-kits" },
  { kind: "drone", title: "Drone Projects", label: "CUSTOM ENQUIRY", detail: "Have a drone idea? Tell me what you want to build and I can help scope a suitable parts list.", href: "/contact" },
];

export function HomeProjectShowcase() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = window.setInterval(() => setActive((current) => (current + 1) % slides.length), 3000);
    return () => window.clearInterval(timer);
  }, [paused]);

  const slide = slides[active];
  return (
    <section className="home-project-showcase" aria-label="Featured projects">
      <div className="project-showcase-topline"><span>PROJECTS / LIVE BUILDS</span><span>{String(active + 1).padStart(2, "0")} / 05</span></div>
      <div className="project-showcase-viewport">
        <div className="project-showcase-track" style={{ transform: "translateX(-" + (active * 20) + "%)" }}>
          {slides.map((item) => <div className="project-showcase-slide" key={item.kind}><ProjectArtwork kind={item.kind} /></div>)}
        </div>
      </div>
      <div className="project-showcase-copy" aria-live="polite">
        <span className="project-showcase-label">{slide.label}</span>
        <h2>{slide.title}</h2>
        <p>{slide.detail}</p>
        {slide.external
          ? <a className="underlined-link" href={slide.href} target="_blank" rel="noreferrer">View the build on GitHub ↗</a>
          : <Link className="underlined-link" href={slide.href}>Explore this project →</Link>}
      </div>
      <div className="project-showcase-controls">
        <div className="project-showcase-dots" aria-label="Choose project">
          {slides.map((item, index) => <button type="button" key={item.kind} className={index === active ? "is-active" : ""} aria-label={"Show " + item.title} aria-current={index === active ? "true" : undefined} onClick={() => setActive(index)} />)}
        </div>
        <div className="project-showcase-buttons">
          <button type="button" onClick={() => setActive((active + slides.length - 1) % slides.length)} aria-label="Previous project">←</button>
          <button type="button" onClick={() => setActive((active + 1) % slides.length)} aria-label="Next project">→</button>
          <button type="button" onClick={() => setPaused((value) => !value)} aria-label={paused ? "Resume automatic project slides" : "Pause automatic project slides"}>{paused ? "Play" : "Pause"}</button>
        </div>
      </div>
    </section>
  );
}
