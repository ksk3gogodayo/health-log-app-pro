// Store absolute instants; always display medication check times in Japan time.
export function updateMedicationTime(
  times: Record<string, string>,
  name: string,
  checked: boolean,
  wasChecked: boolean,
  now: string,
): Record<string, string> {
  const next = { ...times };
  if (!checked) delete next[name];
  else if (!wasChecked) next[name] = now;
  return next;
}

export function formatMedicationTime(value?: string): string {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("ja-JP", {
    timeZone: "Asia/Tokyo", hour: "2-digit", minute: "2-digit", hourCycle: "h23",
  }).format(date);
}

// Keep the original Japan calendar day when editing only the clock time.
export function editMedicationTime(value: string | undefined, time: string, fallbackDate: string): string | undefined {
  if (!/^([01][0-9]|2[0-3]):[0-5][0-9]$/.test(time)) return undefined;
  const original = value ? new Date(value) : undefined;
  const day = original && !Number.isNaN(original.getTime())
    ? new Date(original.getTime() + 9 * 60 * 60 * 1000).toISOString().slice(0, 10)
    : fallbackDate;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(day)) return undefined;
  const date = new Date(day + "T" + time + ":00+09:00");
  if (Number.isNaN(date.getTime())) return undefined;
  if (new Date(date.getTime() + 9 * 60 * 60 * 1000).toISOString().slice(0, 10) !== day) return undefined;
  return date.toISOString();
}
