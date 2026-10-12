import { lazy, type ComponentType, type LazyExoticComponent } from "react";
import type { SectionType } from "@weddingkit/core";

// Setiap section di-lazy-load: tamu hanya mengunduh tipe section yang dipakai.
export const sectionRegistry: Record<SectionType, LazyExoticComponent<ComponentType<any>>> = {
  cover: lazy(() => import("./Cover")),
  couple: lazy(() => import("./Couple")),
  countdown: lazy(() => import("./Countdown")),
  events: lazy(() => import("./Events")),
};
