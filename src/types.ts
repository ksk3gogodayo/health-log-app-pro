
export type PollenLevel = "低い" | "普通" | "多い" | "";

export interface Meds {
  asacol: boolean;
  clearmin: boolean;
  ebios: boolean;
}

export interface LogItem {
  id: string;
  date: string;
  time: string;
  memo: string;
  meds: Meds;
  pollenLevel: PollenLevel;
  uid: string;
  customMedsCheck?: Record<string, boolean>; // ← ★追加
}

export type NewLogItem = Omit<LogItem, "id">;