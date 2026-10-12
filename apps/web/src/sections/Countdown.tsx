import { useEffect, useState } from "react";
import type { CountdownProps } from "@weddingkit/core";

type P = { props: CountdownProps };

function parts(target: string) {
  const ms = Math.max(0, new Date(target).getTime() - Date.now());
  const s = Math.floor(ms / 1000);
  return { Hari: Math.floor(s / 86400), Jam: Math.floor((s % 86400) / 3600), Menit: Math.floor((s % 3600) / 60), Detik: s % 60 };
}

export default function Countdown({ props }: P) {
  const [t, setT] = useState(() => parts(props.target));
  useEffect(() => {
    const id = setInterval(() => setT(parts(props.target)), 1000);
    return () => clearInterval(id);
  }, [props.target]);
  return (
    <div className="countdown">
      <p className="muted">{props.label}</p>
      <div className="cd-grid">
        {Object.entries(t).map(([k, v]) => (
          <div key={k} className="cd-cell"><strong>{v}</strong><span>{k}</span></div>
        ))}
      </div>
    </div>
  );
}
