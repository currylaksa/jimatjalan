import type { MetadataRoute } from "next";

// PWA manifest (PRD: JimatJalan is an installable PWA). Next serves this at
// /manifest.webmanifest and auto-links it from <head>.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "JimatJalan — Smart Fuel",
    short_name: "JimatJalan",
    description: "Know when to fill up. Save more on every tank with your BUDI95 subsidy.",
    start_url: "/",
    display: "standalone",
    background_color: "#eef1ec",
    theme_color: "#ffb020",
    orientation: "portrait",
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" },
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "maskable" },
    ],
  };
}
