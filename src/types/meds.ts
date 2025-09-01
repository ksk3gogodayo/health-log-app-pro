// Firestore保存後の薬データ（ID付き）
export type StoredMed = {
  id: string; // FirestoreのドキュメントID
  name: string; // 薬の名前
  dosage?: string; // 用量（任意）
  timing?: string; // タイミング（任意）
  active: boolean; // 現在使用中かどうか
};

// 新規作成時の薬データ（IDなし）
export type InputMed = Omit<StoredMed, "id">;
