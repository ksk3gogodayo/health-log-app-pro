// JAHIS electronic medication notebook: core 201/301 records, TC03–TC08.
// Patient identity and original payload remain in memory only.
export type ImportedMedicine = {
  name: string;
  amount: string;
  unit: string;
  codeType: string;
  code: string;
  usage: string;
  quantity: string;
  quantityUnit: string;
  dosageForm: string;
  date: string;
  pharmacy: string;
  pharmacyCode: string;
  prescriber: string;
  rp: string;
  notes: string[];
};
export type MedicationPreview = {
  version: string;
  patientName: string;
  medicines: ImportedMedicine[];
  omitted: boolean;
};
const invalid = () =>
  new Error(
    "お薬手帳のデータを確認できません。すべてのQRを読み取り、薬局の用紙と照合してください。",
  );
export const MAX_TEXT = 120000;
export function cleanPayload(text: string): string {
  if (text.length > MAX_TEXT) throw invalid();
  let cleaned = text.replace(/^\uFEFF/, "");
  if (cleaned.endsWith(String.fromCharCode(26))) cleaned = cleaned.slice(0, -1);
  for (const character of cleaned) {
    const code = character.charCodeAt(0);
    if ((code < 32 && ![9, 10, 13].includes(code)) || code === 65533)
      throw invalid();
  }
  return cleaned.replace(/\r\n?/g, "\n").trim();
}
export function normalizeName(name: string): string {
  return name.normalize("NFKC").replace(/\s+/g, " ").trim();
}
export function parseDate(value: string): string {
  let date = value;
  const era = /^([MTSHR])(\d{2})(\d{4})$/.exec(value);
  if (era) {
    const bases: Record<string, number> = {
      M: 1867,
      T: 1911,
      S: 1925,
      H: 1988,
      R: 2018,
    };
    if (+era[2] === 0) throw invalid();
    date = String(bases[era[1]] + +era[2]) + era[3];
  }
  if (!/^\d{8}$/.test(date)) throw invalid();
  const iso =
    date.slice(0, 4) + "-" + date.slice(4, 6) + "-" + date.slice(6, 8);
  const d = new Date(iso + "T00:00:00Z");
  if (!Number.isFinite(d.getTime()) || d.toISOString().slice(0, 10) !== iso)
    throw invalid();
  return iso;
}
export function parseJahis(input: string): MedicationPreview {
  const lines = cleanPayload(input).split("\n").filter(Boolean);
  const version = lines.shift()?.split(",")[0] || "";
  if (!/^JAHISTC0[3-8]$/.test(version))
    throw new Error(
      "対応するお薬手帳用QRではありません（JAHISTC03〜08対応）。処方箋の引換用QRやURLは登録できません。",
    );
  let patientName = "",
    date = "",
    pharmacy = "",
    pharmacyCode = "",
    prescriber = "",
    scope = 0,
    omitted = false;
  const medicines: ImportedMedicine[] = [];
  const groups = new Map<string, ImportedMedicine[]>();
  let last: ImportedMedicine | undefined;
  const groupKey = (rp: string) => `${scope}:${rp}`;
  for (const line of lines) {
    const c = line.split(",").map((s) => s.trim());
    if (!/^\d{1,3}$/.test(c[0]) || c.some((s) => s.length > 2000))
      throw invalid();
    switch (c[0]) {
      case "1":
        if (patientName && patientName !== c[1]) throw invalid();
        patientName = c[1] || "";
        break;
      case "5":
        date = parseDate(c[1] || "");
        pharmacy = "";
        pharmacyCode = "";
        prescriber = "";
        scope++;
        last = undefined;
        break;
      case "11":
        pharmacy = c[1] || "";
        pharmacyCode = c.slice(2, 5).join(":");
        break;
      case "51":
        prescriber = c[1] || "";
        scope++;
        last = undefined;
        break;
      case "55":
        scope++;
        last = undefined;
        break;
      case "201": {
        if (
          !date ||
          !pharmacy ||
          !/^[1-9]\d{0,2}$/.test(c[1]) ||
          !c[2] ||
          c.length < 7
        )
          throw invalid();
        last = {
          name: c[2],
          amount: c[3],
          unit: c[4],
          codeType: c[5],
          code: c[6],
          usage: "",
          quantity: "",
          quantityUnit: "",
          dosageForm: "",
          date,
          pharmacy,
          pharmacyCode,
          prescriber,
          rp: c[1],
          notes: [],
        };
        medicines.push(last);
        const key = groupKey(c[1]);
        groups.set(key, [...(groups.get(key) || []), last]);
        if (medicines.length > 100)
          throw new Error(
            "一度に取り込める薬は100件までです。期間を分けて取得してください。",
          );
        break;
      }
      case "301": {
        const meds = groups.get(groupKey(c[1]));
        if (!meds?.length || meds.some((m) => m.usage || m.quantity))
          throw invalid();
        meds.forEach((m) => {
          m.usage = c[2] || "";
          m.quantity = c[3] || "";
          m.quantityUnit = c[4] || "";
          m.dosageForm = c[5] || "";
        });
        break;
      }
      case "281":
      case "291":
        if (!last || last.rp !== c[1]) throw invalid();
        if (c[2]) last.notes.push(c[2]);
        break;
      case "311":
      case "391": {
        const meds = groups.get(groupKey(c[1]));
        if (!meds) throw invalid();
        if (c[2]) meds.forEach((m) => m.notes.push(c[2]));
        break;
      }
      case "401": {
        const context = { date, pharmacy };
        medicines
          .filter(
            (m) => m.date === context.date && m.pharmacy === context.pharmacy,
          )
          .forEach((m) => {
            if (c[1]) m.notes.push(c[1]);
          });
        break;
      }
      case "911":
        throw new Error("分割されたQRがまだそろっていません。");
      case "15":
        break;
      default:
        omitted = true;
    }
  }
  if (!medicines.length)
    throw new Error(
      "登録できる調剤薬がありません。市販薬やメモのみのQRは現在対象外です。",
    );
  return { version, patientName, medicines, omitted };
}
export type QrPart = {
  text: string;
  sequence?: number;
  parity?: number;
  bytes?: Uint8Array;
};
// Each collector belongs to one import screen and is never persisted.
export class QrCollector {
  private symbols = new Map<number, QrPart>();
  private symbolGroup = "";
  private records = new Map<number, string>();
  private recordGroup = "";
  private header = "";
  progress = "";
  add(part: QrPart): string | null {
    let text = part.text;
    if (text.length > MAX_TEXT) throw invalid();
    if (part.sequence !== undefined) {
      const index = part.sequence >> 4,
        total = (part.sequence & 15) + 1;
      if (index >= total || total < 2 || part.parity === undefined)
        throw invalid();
      const key = `${total}:${part.parity}`;
      if (this.symbolGroup && this.symbolGroup !== key)
        throw new Error("別の組のQRです。読み取りをやり直してください。");
      this.symbolGroup = key;
      const old = this.symbols.get(index);
      if (old && old.text !== text) throw invalid();
      this.symbols.set(index, part);
      if (
        Array.from(this.symbols.values()).reduce(
          (n, p) => n + p.text.length,
          0,
        ) > MAX_TEXT
      )
        throw invalid();
      this.progress = `連結QR：${this.symbols.size} / ${total}枚。残りのQRを読み取ってください。`;
      if (this.symbols.size !== total) return null;
      const ordered = Array.from(
        { length: total },
        (_, i) => this.symbols.get(i)!,
      );
      text = ordered.every((p) => p.bytes)
        ? new TextDecoder("shift-jis", { fatal: true }).decode(
            Uint8Array.from(ordered.flatMap((p) => Array.from(p.bytes!))),
          )
        : ordered.map((p) => p.text).join("");
      this.symbols.clear();
      this.symbolGroup = "";
    } else if (this.symbolGroup)
      throw new Error("連結QRの残りを先に読み取ってください。");
    text = cleanPayload(text);
    const lines = text.split("\n");
    const controls = lines.filter((l) => l.startsWith("911,"));
    if (!controls.length) {
      if (this.recordGroup)
        throw new Error("分割QRの残りを先に読み取ってください。");
      this.progress = "";
      return text;
    }
    if (controls.length !== 1 || !/^JAHISTC0[3-8](,|$)/.test(lines[0]))
      throw invalid();
    const [, id, count, num] = controls[0].split(",");
    const total = Number(count),
      index = Number(num),
      key = `${id}:${total}`;
    if (
      !/^\d{14}$/.test(id) ||
      !Number.isInteger(total) ||
      total < 1 ||
      total > 32 ||
      !Number.isInteger(index) ||
      index < 1 ||
      index > total
    )
      throw invalid();
    if (
      this.recordGroup &&
      (this.recordGroup !== key || this.header !== lines[0])
    )
      throw new Error("別の組のQRです。読み取りをやり直してください。");
    this.recordGroup = key;
    this.header = lines[0];
    const body = lines
      .slice(1)
      .filter((l) => !l.startsWith("911,"))
      .join("\n");
    if (this.records.has(index) && this.records.get(index) !== body)
      throw invalid();
    this.records.set(index, body);
    if (Array.from(this.records.values()).join("").length > MAX_TEXT)
      throw invalid();
    this.progress = `分割QR：${this.records.size} / ${total}枚。残りのQRを読み取ってください。`;
    if (this.records.size !== total) return null;
    return (
      this.header +
      "\n" +
      Array.from({ length: total }, (_, i) => this.records.get(i + 1)!).join(
        "\n",
      )
    );
  }
}
// Stable per dispensing item, independent of scan order and source file formatting.
// Same-name items with different dates/doses/usages are deliberately distinct.
export async function medicineId(m: ImportedMedicine): Promise<string> {
  const fields = [
    m.date,
    m.pharmacyCode,
    m.pharmacy,
    m.prescriber,
    m.rp,
    m.codeType,
    m.code,
    m.name,
    m.amount,
    m.unit,
    m.usage,
    m.quantity,
    m.quantityUnit,
    m.dosageForm,
    ...m.notes,
  ];
  const bytes = new TextEncoder().encode(
    JSON.stringify(fields.map(normalizeName)),
  );
  const hash = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(hash), (v) =>
    v.toString(16).padStart(2, "0"),
  ).join("");
}
