import { useEffect, useState } from "react";
import { MedItem } from "@/types/meds";
import { fetchMeds, addMed, deleteMed } from "../features/meds/services/meds";

export const useMeds = (userId: string) => {
  const [meds, setMeds] = useState<MedItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return; // ← これが超重要！

    const load = async () => {
      const data = await fetchMeds(userId);
      setMeds(data);
      setLoading(false);
    };
    load();
  }, [userId]);

  if (!userId) {
    console.warn("⛔️ userId が未定義なので useMeds スキップ");
    return { meds: [], loading: false, handleAddMed: async () => {} };
  }

  console.log("✅ userId:", userId); // ← ここなら安全に出る！

  // 薬を追加する関数
  const handleAddMed = async (med: Omit<MedItem, "id">) => {
    if (!userId) return; // 🔒 安全に！
    const newId = await addMed(userId, med);
    const newItem: MedItem = { id: newId, ...med };
    setMeds((prev) => [...prev, newItem]);
  };

  // 薬を削除する関数
  const handleDeleteMed = async (medId: string) => {
    if (!userId) return; // 🔒 安全に！
    await deleteMed(userId, medId);
    setMeds((prev) => prev.filter((m) => m.id !== medId));
  };

  return {
    meds,
    loading,
    handleAddMed,
    handleDeleteMed,
  };
};
