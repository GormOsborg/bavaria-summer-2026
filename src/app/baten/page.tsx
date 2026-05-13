import { supabaseRead } from "@/lib/supabase";
import type { Cabin } from "@/lib/types";

export const dynamic = "force-dynamic";

const SPECS: Array<{ label: string; value: string }> = [
  { label: "Modell", value: "Bavaria 37 Cruiser" },
  { label: "Lengde", value: "11,30 m" },
  { label: "Bredde", value: "3,67 m" },
  { label: "Dypgang", value: "1,95 m" },
  { label: "Køyeplasser", value: "6–7 (inkl. salongsofa)" },
  { label: "Motor", value: "Diesel, ca. 30 hk" },
];

const PACKING = [
  "Sovepose eller laken — det er puter og dyner ombord",
  "Klær for både sol og kuling — Nordsjøen kan være lunefull",
  "Solbriller, solkrem, lue",
  "Et par sko du kan ha våte (gjerne lyse såler — ikke svarte striper på dekk)",
  "Toalettmappe i mykt etui (bedre plass enn hardcase)",
  "Eventuelle medisiner mot sjøsyke",
];

export default async function BatenPage() {
  const supabase = supabaseRead();
  const { data } = await supabase
    .from("cabins")
    .select("*")
    .order("position", { ascending: true });

  const cabins = (data ?? []) as Cabin[];

  return (
    <div className="flex flex-col gap-10">
      <header>
        <h1 className="text-3xl font-semibold tracking-tight">Båten</h1>
        <p className="mt-2 text-foreground/70 max-w-2xl">
          Bavaria 37 Cruiser. Solid familiebåt, lett å manøvrere, god plass i
          cockpit. Kjøkken, dusj og toalett ombord.
        </p>
      </header>

      <section className="grid sm:grid-cols-2 gap-3">
        {SPECS.map((spec) => (
          <div
            key={spec.label}
            className="flex items-baseline justify-between gap-4 border-b border-foreground/10 py-3"
          >
            <span className="text-foreground/60 text-sm">{spec.label}</span>
            <span className="font-medium">{spec.value}</span>
          </div>
        ))}
      </section>

      <section>
        <h2 className="text-2xl font-semibold">Lugarer</h2>
        <p className="mt-2 text-foreground/70">
          Tre lugarer pluss salongsofaen. Maksimal kapasitet vises per natt i
          bookingoversikten.
        </p>
        <ul className="mt-4 grid sm:grid-cols-2 gap-3">
          {cabins.map((cabin) => (
            <li
              key={cabin.id}
              className="rounded-xl border border-foreground/10 bg-background p-4"
            >
              <div className="flex items-baseline justify-between gap-3">
                <h3 className="font-semibold">{cabin.name_no}</h3>
                <span className="text-xs text-foreground/60">
                  Maks {cabin.capacity_max} personer
                </span>
              </div>
              {cabin.description_no && (
                <p className="mt-1 text-sm text-foreground/70">
                  {cabin.description_no}
                </p>
              )}
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="text-2xl font-semibold">Hva du bør pakke</h2>
        <ul className="mt-4 space-y-2 text-foreground/80">
          {PACKING.map((item) => (
            <li key={item} className="flex gap-2">
              <span className="text-accent">›</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
