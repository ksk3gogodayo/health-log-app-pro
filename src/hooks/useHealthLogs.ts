// src/hooks/useHealthLogs.ts
import { useEffect, useState } from "react";
import { fetchHealthLogs, saveNewHealthLog, deleteHealthLog } from "../lib/firestore";
import type { LogItem, NewLogItem } from "../types";

export const useHealthLogs = (uid: string | undefined) => {
  const [logs, setLogs] = useState<LogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!uid) return;

    const fetch = async () => {
      setLoading(true);
      try {
        const fetched = await fetchHealthLogs(uid);
        setLogs(fetched);
        setError(null);
      } catch (err) {
        console.error("ログの取得に失敗しました", err);
        setError("ログの取得に失敗しました");
      } finally {
        setLoading(false);
      }
    };

    fetch();
  }, [uid]);

  const addLog = async (newLog: NewLogItem) => {
    if (!uid) return;
    try {
      const fullLog = { ...newLog, uid }; // 🔧 uidを埋め込む
      const id = await saveNewHealthLog(fullLog);
      setLogs((prev) => [...prev, { id, ...newLog }]);
    } catch (err) {
      console.error("保存に失敗しました", err);
    }
  };

  const deleteLog = async (id: string) => {
    if (!uid) return;
    try {
      await deleteHealthLog(id); // 🔧 uidは不要
      setLogs((prev) => prev.filter((log) => log.id !== id));
    } catch (err) {
      console.error("削除に失敗しました", err);
    }
  };

  return { logs, addLog, deleteLog, loading, error };
};