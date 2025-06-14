// src/features/services/saveNewHealthLog.ts → 新規追加専用
import { db } from "../../../firebase";
import { collection, addDoc } from "firebase/firestore";
import { NewLogItem } from "@/types";

export const saveNewHealthLog = async (log: NewLogItem): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, "healthLogs"), log);
    console.log("✅ 保存完了: ", docRef.id);
    return docRef.id;
  } catch (error) {
    console.error("❌ 保存エラー: ", error);
    throw error; // ←　上のtry-catch　だけじゃ吸収しすぎるので再スローが無難
  }
};