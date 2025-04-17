import { addDoc, collection, getDocs, deleteDoc, doc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";

// 保存用関数（すでにあるやつ）
export const saveHealthLog = async (data: any) => {
  try {
    const docRef = await addDoc(collection(db, "healthLogs"), data);
    console.log("✅ Firestoreに保存成功 ID:", docRef.id);
    alert("Firestoreに保存されたよ！");
    return docRef.id; // ← 🔥 これを return！
  } catch (e) {
    console.error("🔥 保存失敗", e);
    alert("Firestore保存に失敗したよ！");
    return null;
  }
};

// 🔥 この部分が「fetchHealthLogs」！
export const fetchHealthLogs = async () => {
  try {
    const snapshot = await getDocs(collection(db, "healthLogs"));
    const logs = snapshot.docs.map((doc) => ({
      id: doc.id,            // ← FirestoreのドキュメントID
      ...doc.data(),         // ← 本体の中身（memo, date など）
    }));
    return logs;
  } catch (e) {
    console.error("🔥 取得失敗", e);
    return [];
  }
};

// Firestoreからの削除
export const deleteHealthLog = async (id: string) => {
  try {
    await deleteDoc(doc(db, "healthLogs", id));
    console.log("🗑 Firestoreから削除完了:", id);
  } catch (e) {
    console.error("🔥 Firestore削除失敗", e);
  }
};

// Firestoreのデータを更新
export const updateHealthLog = async (id: string, data: any) => {
  try {
    const docRef = doc(db, "healthLogs", id);
    await updateDoc(docRef, {
      ...data,
      updatedAt: new Date(), // ← 🔥 これが毎回変わるので強制的にFirestoreが更新してくれる！
    });
    alert("Firestoreを更新したよ！");
  } catch (e) {
    console.error("🔥 更新失敗", e);
    alert("Firestore更新に失敗したよ！");
  }
};