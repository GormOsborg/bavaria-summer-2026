import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col gap-10">
      <section>
        <p className="text-sm uppercase tracking-widest text-accent font-medium">
          28. juni – 15. juli 2026
        </p>
        <h1 className="mt-2 text-4xl sm:text-5xl font-semibold tracking-tight">
          Sommertur med Bavaria 37
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-foreground/80 leading-relaxed">
          Fra Oksval på Nesodden, ned langs sørlandskysten til Lillesand, og
          deretter østover via svenskekysten til overlevering i
          Strömstad-området. Hopp ombord når det passer — det er plass til både
          de som vil seile lange etapper og de som bare vil ha noen netter på
          vannet.
        </p>
      </section>

      <section className="grid sm:grid-cols-3 gap-4">
        <Link
          href="/reiserute"
          className="rounded-2xl bg-accent-soft p-6 hover:bg-accent hover:text-background transition-colors"
        >
          <h2 className="text-lg font-semibold">Reiseruten</h2>
          <p className="mt-2 text-sm opacity-80">
            Dag-for-dag med havner og naturhavner. Skissen er foreløpig — vær og
            humør avgjør.
          </p>
        </Link>
        <Link
          href="/baten"
          className="rounded-2xl bg-sand p-6 hover:bg-accent hover:text-background transition-colors"
        >
          <h2 className="text-lg font-semibold">Båten</h2>
          <p className="mt-2 text-sm opacity-80">
            Bavaria 37 Cruiser. Tre lugarer, salongsofa, og hva du bør pakke.
          </p>
        </Link>
        <Link
          href="/booking"
          className="rounded-2xl bg-accent text-background p-6 hover:opacity-90 transition-opacity"
        >
          <h2 className="text-lg font-semibold">Bestill lugar</h2>
          <p className="mt-2 text-sm opacity-90">
            Velg netter og lugar. Trenger passordet fra gruppechatten.
          </p>
        </Link>
      </section>

      <section className="rounded-2xl border border-foreground/10 p-6 leading-relaxed">
        <h2 className="text-xl font-semibold">Hvordan det funker</h2>
        <ul className="mt-3 space-y-2 text-foreground/80 text-sm sm:text-base">
          <li>
            <strong>Seilingsdager:</strong> som regel 4–5 timer på vannet. Resten
            av dagen er bading, kortspill og kveldsmat i kahytten eller i land.
          </li>
          <li>
            <strong>Hopp på / hopp av:</strong> du velger selv hvor og når. Se
            reiseruten for hvilke havner som er enklest å nå fra by/buss/bil.
          </li>
          <li>
            <strong>Erfaring:</strong> du trenger ingen seilerfaring. Skipperen
            tar deg gjennom det du må kunne.
          </li>
          <li>
            <strong>Dele kostnader:</strong> vi splitter mat og havneavgifter
            for de dagene du er ombord. Drivstoff og båt går på huset.
          </li>
        </ul>
      </section>
    </div>
  );
}
