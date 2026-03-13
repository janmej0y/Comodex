import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Comodex - Commodities Management",
    short_name: "Comodex",
    description: "Executive-grade commodities management frontend",
    start_url: "/",
    display: "standalone",
    background_color: "#020617",
    theme_color: "#0284c7"
  };
}