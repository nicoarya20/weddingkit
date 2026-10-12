import type { CoupleProps } from "@weddingkit/core";

type P = { props: CoupleProps };

export default function Couple({ props }: P) {
  return (
    <div className="couple">
      {props.people.map((p) => (
        <div key={p.name} className="person">
          <h2 className="heading">{p.name}</h2>
          {p.role && <p className="muted">{p.role}</p>}
          {p.parents && <p>{p.parents}</p>}
        </div>
      ))}
    </div>
  );
}
