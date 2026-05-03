/** Interpret `YYYY-MM-DD` at local midnight (UTC parsing shifts calendar days near zone boundaries). */
export function parseDateOnly(day: string | undefined): Date {
  if (!day || typeof day !== "string") {
    const n = new Date();
    return new Date(n.getFullYear(), n.getMonth(), n.getDate());
  }
  const parts = day.split("-").map((p) => parseInt(p.trim(), 10));
  if (
    parts.length !== 3 ||
    parts.some((n) => Number.isNaN(n)) ||
    parts[0] === undefined ||
    parts[1] === undefined ||
    parts[2] === undefined
  ) {
    const n = new Date();
    return new Date(n.getFullYear(), n.getMonth(), n.getDate());
  }
  const [y, m, d] = parts;
  return new Date(y, m - 1, d);
}

export function dateToYYYYMMDD(d: Date): string {
  if (Number.isNaN(d.getTime())) {
    const n = new Date();
    return dateToYYYYMMDD(
      new Date(n.getFullYear(), n.getMonth(), n.getDate()),
    );
  }
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function clampDate(d: Date, min?: Date, max?: Date): Date {
  let x = d;
  if (min && x.getTime() < min.getTime()) x = min;
  if (max && x.getTime() > max.getTime()) x = max;
  return x;
}

export function clampDateString(
  ymd: string,
  min?: string,
  max?: string,
): string {
  const d = clampDate(
    parseDateOnly(ymd),
    min ? parseDateOnly(min) : undefined,
    max ? parseDateOnly(max) : undefined,
  );
  return dateToYYYYMMDD(d);
}
