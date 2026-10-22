import { updateMedicationTime, formatMedicationTime } from "./medicationTime";

test("morning, noon and evening keep independent check instants", () => {
  let times = updateMedicationTime({}, "朝", true, false, "2026-10-23T23:00:00Z");
  times = updateMedicationTime(times, "昼", true, false, "2026-10-24T03:00:00Z");
  times = updateMedicationTime(times, "晩", true, false, "2026-10-24T10:00:00Z");
  expect(Object.values(times).map(formatMedicationTime)).toEqual(["08:00", "12:00", "19:00"]);
});

test("editing an already checked item does not change its time", () => {
  const original = { 朝: "2026-10-23T23:00:00Z" };
  expect(updateMedicationTime(original, "朝", true, true, "2026-10-24T10:00:00Z")).toEqual(original);
  expect(updateMedicationTime({}, "過去の薬", true, true, "2026-10-24T10:00:00Z")).toEqual({});
});

test("unchecking removes only that time; rechecking records a new instant", () => {
  const original = { 朝: "2026-10-23T23:00:00Z", 昼: "2026-10-24T03:00:00Z" };
  const unchecked = updateMedicationTime(original, "朝", false, true, "2026-10-24T04:00:00Z");
  expect(unchecked).toEqual({ 昼: original.昼 });
  expect(original.朝).toBe("2026-10-23T23:00:00Z");
  expect(updateMedicationTime(unchecked, "朝", true, false, "2026-10-24T04:00:00Z").朝).toBe("2026-10-24T04:00:00Z");
});

test("Japanese midnight is 00:00 and missing historical times stay blank", () => {
  expect(formatMedicationTime("2026-10-23T15:00:00Z")).toBe("00:00");
  expect(formatMedicationTime()).toBe("");
  expect(formatMedicationTime("invalid")).toBe("");
});
