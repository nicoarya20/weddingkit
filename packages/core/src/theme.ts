import type { Theme } from "./schema";

/** Theme -> CSS custom properties. Ganti tema = ganti variabel, tanpa re-render komponen. */
export function themeToCssVars(t: Theme): Record<string, string> {
  return {
    "--c-bg": t.color.bg, "--c-surface": t.color.surface, "--c-text": t.color.text,
    "--c-muted": t.color.muted, "--c-primary": t.color.primary, "--c-accent": t.color.accent,
    "--c-border": t.color.border,
    "--f-heading": `"${t.font.heading}", serif`, "--f-body": `"${t.font.body}", sans-serif`,
    "--f-script": `"${t.font.script}", cursive`,
    "--radius": t.radius,
  };
}
