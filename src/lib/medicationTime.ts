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
