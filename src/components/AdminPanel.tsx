

import { useEffect, useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
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

const AdminPanel = () => {
  const [logs, setLogs] = useState<LogItem[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const user = auth.currentUser;
        if (!user || user.email !== "あなたのメール@example.com") {
          setError("アクセス権がありません");
          return;
        }

        const q = query(collection(db, "healthLogs"), where("uid", "==", user.uid));
        const snapshot = await getDocs(q);
        const fetchedLogs = snapshot.docs.map((doc) => ({
          ...(doc.data() as Omit<LogItem, "id">), // ← idを省いた型にする
          id: doc.id, // ← 最後に上書き
        }));
        setLogs(fetchedLogs);
      } catch (err) {
        setError("データ取得に失敗しました");
      }
    };

    fetchLogs();
  }, []);

  return (
    <div style={{ padding: 20 }}>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <h2>管理者パネル</h2>
      {logs.map((log) => (
        <div key={log.id} style={{ border: "1px solid #ccc", marginBottom: 10, padding: 10 }}>
          <strong>{log.date} / {log.time}</strong>
          <p>{log.memo}</p>
          <ul>
            <li>アサコール: {log.meds.asacol ? "✔️" : "❌"}</li>
            <li>クリアミン: {log.meds.clearmin ? "✔️" : "❌"}</li>
            <li>エビオス: {log.meds.ebios ? "✔️" : "❌"}</li>
            <li>花粉レベル: {log.pollenLevel}</li>
          </ul>
          <small>UID: {log.uid}</small>
        </div>
      ))}
    </div>
  );
};

export default AdminPanel;