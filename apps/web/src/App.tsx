import { Suspense } from "react";
import { sampleInvitation, sectionsFor, themeToCssVars } from "@weddingkit/core";
import { readGuest } from "./guest";
import { sectionRegistry } from "./sections/registry";

export function App() {
  const inv = sampleInvitation; // nanti: fetch JSON published per slug/kategori
  const guest = readGuest();
  const sections = sectionsFor(inv.sections, guest.category);

  return (
    <div className="stage">
      <main className="phone" style={themeToCssVars(inv.theme) as React.CSSProperties}>
        <Suspense fallback={<div className="loading">Memuat…</div>}>
          {sections.map((s) => {
            const Comp = sectionRegistry[s.type] as React.ComponentType<any>;
            return (
              <section key={s.id} className="section" data-align={s.style?.align} data-pad={s.style?.paddingY}
                style={{ background: s.style?.bg, color: s.style?.text }}>
                <Comp props={s.props} guest={guest} category={guest.category} />
              </section>
            );
          })}
        </Suspense>
      </main>
    </div>
  );
}
