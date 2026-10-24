// Keep historical positive intake records; default false values are not intake records.
export function checkedLegacyMedications(meds?: Partial<Record<"asacol" | "clearmin" | "ebios", boolean>>) {
  const labels = { asacol: "アサコール", clearmin: "クリアミン", ebios: "エビオス" };
  return (Object.keys(labels) as Array<keyof typeof labels>)
    .filter((key) => meds?.[key] === true)
    .map((key) => labels[key]);
}
