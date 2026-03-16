export type Lang = "ja" | "en" | "fil";

export const LANG_STORAGE_KEY = "health-log-lang";

export interface Translations {
  appTitle: string;
  healthLog: string;
  medCheck: string;
  save: string;
  list: string;
  settings: string;
  logout: string;
  memo: string;
  pollenLabel: string;
  pollenNone: string;
  pollenLow: string;
  pollenMedium: string;
  pollenHigh: string;
  medSettings: string;
  medName: string;
  addMed: string;
  noMeds: string;
  saving: string;
  saved: string;
  editComplete: string;
  edit: string;
  delete: string;
  cancel: string;
  pastLogs: string;
  noLogs: string;
  copyMarkdown: string;
  copied: string;
  copiedAll: string;
  noRecords: string;
  loading: string;
  editingRecord: string;
  today: string;
  deleteLogConfirm: string;
  deleteMedConfirm: string;
  deleteFailed: string;
  aiComment: string;
  aiGenerating: string;
  aiAdvice: string;
}

export type TranslationKey = keyof Translations;

const translations: Record<Lang, Translations> = {
  ja: {
    appTitle: "体調記録アプリ",
    healthLog: "体調記録",
    medCheck: "薬チェック",
    save: "記録する",
    list: "一覧",
    settings: "設定",
    logout: "ログアウト",
    memo: "メモ",
    pollenLabel: "花粉レベルを選択",
    pollenNone: "なし",
    pollenLow: "少ない",
    pollenMedium: "普通",
    pollenHigh: "多い",
    medSettings: "薬マスター設定",
    medName: "薬の名前",
    addMed: "追加",
    noMeds: "登録された薬はありません",
    saving: "保存中...",
    saved: "記録されました！",
    editComplete: "編集されました！",
    edit: "編集",
    delete: "削除",
    cancel: "キャンセル",
    pastLogs: "過去の記録一覧",
    noLogs: "まだ記録はありません。",
    copyMarkdown: "すべての記録をMarkdownでコピー",
    copied: "Markdownをコピーしました！",
    copiedAll: "すべての記録をMarkdownでコピーしました！",
    noRecords: "記録がありません",
    loading: "読み込み中...",
    editingRecord: "の記録を編集中",
    today: "今日の日付",
    deleteLogConfirm: "この記録を削除しますか？",
    deleteMedConfirm: "この薬を削除しますか？",
    deleteFailed: "削除に失敗しました",
    aiComment: "AIコメント生成",
    aiGenerating: "生成中...",
    aiAdvice: "AIからのアドバイス:",
  },
  en: {
    appTitle: "Health Log App",
    healthLog: "Health Log",
    medCheck: "Medication",
    save: "Save",
    list: "List",
    settings: "Settings",
    logout: "Logout",
    memo: "Memo",
    pollenLabel: "Select pollen level",
    pollenNone: "None",
    pollenLow: "Low",
    pollenMedium: "Medium",
    pollenHigh: "High",
    medSettings: "Medication Settings",
    medName: "Medication name",
    addMed: "Add",
    noMeds: "No medications registered",
    saving: "Saving...",
    saved: "Saved!",
    editComplete: "Updated!",
    edit: "Edit",
    delete: "Delete",
    cancel: "Cancel",
    pastLogs: "Past Records",
    noLogs: "No records yet.",
    copyMarkdown: "Copy all as Markdown",
    copied: "Copied as Markdown!",
    copiedAll: "Copied all records as Markdown!",
    noRecords: "No records",
    loading: "Loading...",
    editingRecord: "editing record for",
    today: "Today",
    deleteLogConfirm: "Delete this record?",
    deleteMedConfirm: "Delete this medication?",
    deleteFailed: "Delete failed",
    aiComment: "Generate AI Comment",
    aiGenerating: "Generating...",
    aiAdvice: "AI Advice:",
  },
  fil: {
    appTitle: "Health Log App",
    healthLog: "Health Log",
    medCheck: "Gamot",
    save: "I-save",
    list: "Listahan",
    settings: "Mga Setting",
    logout: "Mag-logout",
    memo: "Memo",
    pollenLabel: "Pumili ng antas ng pollen",
    pollenNone: "Wala",
    pollenLow: "Mababa",
    pollenMedium: "Katamtaman",
    pollenHigh: "Mataas",
    medSettings: "Mga Setting ng Gamot",
    medName: "Pangalan ng gamot",
    addMed: "Idagdag",
    noMeds: "Walang nairehistro na gamot",
    saving: "Nag-iingat...",
    saved: "Nai-save!",
    editComplete: "Na-update!",
    edit: "I-edit",
    delete: "Burahin",
    cancel: "Kanselahin",
    pastLogs: "Mga Nakaraang Talaan",
    noLogs: "Wala pang talaan.",
    copyMarkdown: "Kopyahin lahat bilang Markdown",
    copied: "Nakopya bilang Markdown!",
    copiedAll: "Nakopya ang lahat bilang Markdown!",
    noRecords: "Walang talaan",
    loading: "Naglo-load...",
    editingRecord: "ine-edit ang talaan para sa",
    today: "Petsa ngayon",
    deleteLogConfirm: "Burahin ang talaan na ito?",
    deleteMedConfirm: "Burahin ang gamot na ito?",
    deleteFailed: "Hindi nabura",
    aiComment: "Gumawa ng AI Comment",
    aiGenerating: "Ginagawa...",
    aiAdvice: "Payo mula sa AI:",
  },
};

export function getTranslations(lang: Lang): Translations {
  return translations[lang];
}
