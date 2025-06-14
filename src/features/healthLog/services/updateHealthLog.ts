// src/features/services/updateHealthLog.ts → 編集専用
import { db } from "../../../firebase";
import { doc, updateDoc } from "firebase/firestore";
import { LogItem } from "@/types";

export const updateHealthLog = async (id: string, log: Partial<LogItem>) => {
  const docRef = doc(db, "healthLogs", id);
  await updateDoc(docRef, log);
};