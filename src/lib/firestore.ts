import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  query,
  where,
  doc,
  updateDoc,
  deleteDoc,
  addDoc
} from "firebase/firestore";
import { auth, db } from "../firebase";


type LogItem = {
  id: string;
  date: string;
  time: string;
  memo: string;
  pollenLevel: string;
  meds: {
    asacol: boolean;
    clearmin: boolean;
    ebios: boolean;
  };
  uid: string;
};

// AdminPanel component has been removed from this file

export const saveHealthLog = async (log: Omit<LogItem, "id">) => {  try {
    const uid = auth.currentUser?.uid;
    if (!uid) throw new Error("未ログイン");

    const docRef = await addDoc(collection(db, "healthLogs"), {
      ...log,
      uid,
    });

    console.log("✅ Firestoreに保存成功 ID:", docRef.id);
    return docRef.id;
  } catch (error) {
    console.error("🔥 保存失敗", error);
    throw error;
  }
};

export const fetchHealthLogs = async (uid: string) => {
  try {
    const q = query(
      collection(db, "healthLogs"),
      where("uid", "==", uid)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as LogItem[];
  } catch (error) {
    console.error("🔥 取得失敗", error);
    return [];
  }
};

export const updateHealthLog = async (id: string, data: any) => {
  try {
    const docRef = doc(db, "healthLogs", id);
    await updateDoc(docRef, data);
    console.log("📝 Firestore更新完了:", id);
  } catch (error) {
    console.error("🔥 Firestore更新エラー:", error);
    throw error;
  }
};

export const deleteHealthLog = async (id: string) => {
  try {
    const docRef = doc(db, "healthLogs", id);
    await deleteDoc(docRef);
    console.log("🗑 Firestore削除完了:", id);
  } catch (error) {
    console.error("🔥 Firestore削除エラー:", error);
    throw error;
  }
};