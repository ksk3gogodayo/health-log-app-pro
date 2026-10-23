import { webcrypto } from "crypto";
import { TextEncoder, TextDecoder } from "util";
import { parseJahis, parseDate, QrCollector, medicineId } from "./jahis";
import { sampleJahis } from "./fixtures";
beforeAll(() => {
  global.TextEncoder = TextEncoder;
  global.TextDecoder = TextDecoder;
  Object.defineProperty(global, "crypto", { value: webcrypto });
});
test("imports core records with dose and warnings, excludes patient identity from medicines", () => {
  const p = parseJahis(sampleJahis);
  expect(p.medicines[0]).toMatchObject({
    name: "テスト錠60mg",
    date: "2026-10-23",
    amount: "3",
    unit: "錠",
    usage: "毎食後",
    quantity: "7",
    quantityUnit: "日分",
    notes: ["用紙を確認してください"],
  });
  expect(JSON.stringify(p.medicines)).not.toContain("テスト利用者");
});
test.each([
  "JAHISTC99\n201,1,a",
  "https://example.test/",
  sampleJahis.replace("20261023", "20260230"),
  sampleJahis.replace("テスト錠", "�"),
  sampleJahis.replace("5,20261023,1\r\n", ""),
])("rejects unsupported or broken payload", (input) =>
  expect(() => parseJahis(input)).toThrow(),
);
test("normalizes Japanese era dates", () => {
  expect(parseDate("R081023")).toBe("2026-10-23");
  expect(() => parseDate("R000101")).toThrow();
});
test("keeps repeated prescription numbers separate by date", () => {
  const extra = sampleJahis
    .split("\r\n")
    .slice(2)
    .join("\r\n")
    .replace("20261023", "20261024")
    .replace("毎食後", "朝食後");
  const p = parseJahis(sampleJahis + extra);
  expect(p.medicines.map((m) => m.usage)).toEqual(["毎食後", "朝食後"]);
});
test("JAHIS 911 requires every part, supports out-of-order and duplicate scans", () => {
  const c = new QrCollector();
  const rows = sampleJahis.trim().split("\r\n");
  const header = rows.shift();
  const a =
    header + "\n" + rows.slice(0, 4).join("\n") + "\n911,12345678901234,2,1";
  const b =
    header + "\n" + rows.slice(4).join("\n") + "\n911,12345678901234,2,2";
  expect(c.add({ text: b })).toBeNull();
  expect(c.add({ text: b })).toBeNull();
  expect(parseJahis(c.add({ text: a })).medicines).toEqual(
    parseJahis(sampleJahis).medicines,
  );
});
test("rejects conflicting sets and incomplete payloads", () => {
  const c = new QrCollector();
  c.add({ text: "JAHISTC08,1\n911,12345678901234,2,1" });
  expect(() =>
    c.add({ text: "JAHISTC08,1\n911,12345678901235,2,2" }),
  ).toThrow();
  expect(() => parseJahis(sampleJahis + "911,12345678901234,2,1")).toThrow();
});
test("QR structured append joins in sequence", () => {
  const c = new QrCollector(),
    split = sampleJahis.indexOf("201");
  expect(
    c.add({ text: sampleJahis.slice(split), sequence: 17, parity: 42 }),
  ).toBeNull();
  expect(
    parseJahis(
      c.add({ text: sampleJahis.slice(0, split), sequence: 1, parity: 42 }),
    ).medicines,
  ).toHaveLength(1);
});
test("reassembles Shift-JIS bytes split in the middle of a character", () => {
  const c = new QrCollector();
  expect(
    c.add({
      text: "�",
      bytes: Uint8Array.from([0x82]),
      sequence: 1,
      parity: 1,
    }),
  ).toBeNull();
  expect(
    c.add({
      text: "�",
      bytes: Uint8Array.from([0xa0]),
      sequence: 17,
      parity: 1,
    }),
  ).toBe("あ");
});
test("stable duplicate ids, but new dates/strengths/doses remain separate", async () => {
  const m = parseJahis(sampleJahis).medicines[0];
  expect(await medicineId(m)).toBe(
    await medicineId({ ...m, name: "テスト錠６０ｍｇ" }),
  );
  for (const patch of [
    { date: "2026-10-24" },
    { name: "テスト錠30mg" },
    { amount: "1" },
  ])
    expect(await medicineId({ ...m, ...patch })).not.toBe(await medicineId(m));
});
