// src/features/meds/services/meds.ts
import { collection, getDocs, query, where, addDoc, deleteDoc, doc } from "firebase/firestore";
import { db } from "../../../firebase";
import { MedItem } from "@/types/meds";

// 薬一覧を取得
export const fetchMeds = async (userId: string): Promise<MedItem[]> => {
  const colRef = collection(db, "users", userId, "meds");
  const snap = await getDocs(colRef);
  return snap.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as MedItem[];
};

// 薬を追加
export const addMed = async (userId: string, med: Omit<MedItem, "id">) => {
  const colRef = collection(db, "users", userId, "meds");
  const docRef = await addDoc(colRef, med);
  return docRef.id;
};

// 薬を削除
export const deleteMed = async (userId: string, medId: string) => {
  const docRef = doc(db, "users", userId, "meds", medId);
  await deleteDoc(docRef);
};