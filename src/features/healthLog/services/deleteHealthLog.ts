// src/features/healthLog/services/deleteHealthLog.ts
import { db } from "../../../firebase";
import { doc, deleteDoc } from "firebase/firestore";

export const deleteHealthLog = async (id: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, "healthLogs", id));
    console.log("🗑️ 削除完了:", id);
  } catch (error) {
    console.error("❌ 削除エラー:", error);
    throw error;
  }
};
