import { useEffect, useState } from "react";
import {
  subscribeHealthLogs,
  updateHealthLog,
  deleteHealthLog,
} from "../lib/firestore";
import type { LogItem } from "../types";

export const useHealthLogs = (uid: string | undefined) => {
  const [logs, setLogs] = useState<LogItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!uid) return;
    setLoading(true);
    const unsubscribe = subscribeHealthLogs(uid, (fetched) => {
      setLogs(fetched);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [uid]);

  const deleteLog = async (id: string) => {
    if (!uid) return;
    await deleteHealthLog(id);
  };

  const updateLog = async (updatedLog: LogItem) => {
    if (!uid) return;
    await updateHealthLog(updatedLog.id, updatedLog);
  };

  return { logs, deleteLog, updateLog, loading };
};
