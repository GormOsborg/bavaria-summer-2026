export function parseISODate(value: string): Date {
  const [y, m, d] = value.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

export function toISODate(date: Date): string {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, "0");
  const d = String(date.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function eachNight(start: string, end: string): string[] {
  const out: string[] = [];
  const s = parseISODate(start);
  const e = parseISODate(end);
  for (let cur = s; cur.getTime() <= e.getTime(); cur = new Date(cur.getTime() + 86400000)) {
    out.push(toISODate(cur));
  }
  return out;
}

export function rangesOverlap(aStart: string, aEnd: string, bStart: string, bEnd: string): boolean {
  return aStart <= bEnd && bStart <= aEnd;
}

const WEEKDAYS_NO = ["søn", "man", "tir", "ons", "tor", "fre", "lør"];
const MONTHS_NO = ["jan", "feb", "mar", "apr", "mai", "jun", "jul", "aug", "sep", "okt", "nov", "des"];

export function formatNorwegianDate(iso: string): string {
  const d = parseISODate(iso);
  return `${WEEKDAYS_NO[d.getUTCDay()]} ${d.getUTCDate()}. ${MONTHS_NO[d.getUTCMonth()]}`;
}

export function formatNorwegianDateShort(iso: string): string {
  const d = parseISODate(iso);
  return `${d.getUTCDate()}. ${MONTHS_NO[d.getUTCMonth()]}`;
}

export function formatStayRange(start: string, end: string): string {
  const nights = eachNight(start, end).length;
  if (start === end) {
    return `${formatNorwegianDateShort(start)} (1 natt)`;
  }
  return `${formatNorwegianDateShort(start)} – ${formatNorwegianDateShort(end)} (${nights} netter)`;
}
