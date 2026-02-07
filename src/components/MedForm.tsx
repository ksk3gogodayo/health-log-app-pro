import { useState, useEffect } from "react";
import { db } from "../firebase";
import {
  collection,
  addDoc,
  doc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";

// 1. 編集するデータを受け取るための「型」を定義
interface MedFormProps {
  initialData?: { id: string; name: string; dosage: string; frequency: string }; // 編集時のみデータが入る
  onSuccess?: () => void; // 終わった後に親でやりたい処理（画面を閉じるとか）
}

export default function MedForm({ initialData, onSuccess }: MedFormProps) {
  // initialDataがあればその値、なければ空にする（これが「編集」の準備や）
  const [name, setName] = useState(initialData?.name || "");
  const [dosage, setDosage] = useState(initialData?.dosage || "");
  const [frequency, setFrequency] = useState(initialData?.frequency || "");

  // initialDataが変わったとき（✏️ボタンが押されたとき）に、入力欄を書き換える
  useEffect(() => {
    setName(initialData?.name || "");
    setDosage(initialData?.dosage || "");
    setFrequency(initialData?.frequency || "");
  }, [initialData]);

  // 2. 「保存ボタン」を押した時の処理
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      if (initialData?.id) {
        // 【更新】IDがある＝既存の薬を編集する場合
        const docRef = doc(db, "meds", initialData.id);
        await updateDoc(docRef, {
          name,
          dosage,
          frequency,
          updatedAt: serverTimestamp(),
        });
        console.log("更新完了や！");
      } else {
        // 【追加】IDがない＝新しい薬を登録する場合
        await addDoc(collection(db, "meds"), {
          name,
          dosage,
          frequency,
          createdAt: serverTimestamp(),
        });
        console.log("新規追加完了や！");
      }

      // 成功したら入力欄をリセットして、親に知らせる
      if (!initialData) {
        setName("");
        setDosage("");
        setFrequency("");
      }
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error("Firebaseの操作でエラー出たわ:", error);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 p-4 border border-gray-700 rounded bg-gray-800"
    >
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="薬の名前"
        className="block w-full border p-2 text-black"
      />
      <input
        value={dosage}
        onChange={(e) => setDosage(e.target.value)}
        placeholder="容量（500mgとか）"
        className="block w-full border p-2 text-black"
      />
      <input
        value={frequency}
        onChange={(e) => setFrequency(e.target.value)}
        placeholder="タイミング（朝夕食後とか）"
        className="block w-full border p-2 text-black"
      />

      <button
        type="submit"
        className="bg-blue-600 text-white p-2 rounded w-full font-bold hover:bg-blue-500"
      >
        {initialData ? "更新する" : "追加する"}
      </button>
    </form>
  );
}
