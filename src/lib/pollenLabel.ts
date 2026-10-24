export function pollenLabel(value?: string) {
  const labels: Record<string, string> = { none: "なし", low: "少ない", medium: "普通", high: "多い" };
  return value ? labels[value] || value : "";
}
