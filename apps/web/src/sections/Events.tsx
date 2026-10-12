import { visibleEvents, type GuestCategory, type EventsProps } from "@weddingkit/core";

type P = { props: EventsProps; category: GuestCategory };

export default function Events({ props, category }: P) {
  return (
    <div className="events">
      <h2 className="heading">Acara</h2>
      {visibleEvents(props.items, category).map((e) => (
        <article key={e.name} className="card">
          <h3 className="heading">{e.name}</h3>
          <p>{new Date(e.date).toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</p>
          <p>{e.time}</p>
          <p><strong>{e.place}</strong></p>
          {e.address && <p className="muted">{e.address}</p>}
          {e.mapUrl && <a className="btn" href={e.mapUrl} target="_blank" rel="noreferrer">Buka Maps</a>}
        </article>
      ))}
    </div>
  );
}
