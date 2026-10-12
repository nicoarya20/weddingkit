import type { CoverProps } from "@weddingkit/core";

type P = { props: CoverProps; guest: { name: string | null } };

export default function Cover({ props, guest }: P) {
  const date = new Date(props.date).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
  return (
    <div className="cover">
      <p className="muted">{props.subtitle}</p>
      <h1 className="script">{props.title}</h1>
      <p>{date}</p>
      {guest.name && (
        <p className="guest">Kepada Yth.<br /><strong>{guest.name}</strong></p>
      )}
    </div>
  );
}
