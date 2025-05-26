// components/healthLog/HealthLogList.tsx
import React from "react";
import { PollenLevel } from "../../types";

type Meds = {
  asacol: boolean;
  clearmin: boolean;
  ebios: boolean;
};

type LogItem = {
  id: string;
  date: string;
  time: string;
  memo: string;
  meds: Meds;
  pollenLevel: PollenLevel | "";
  uid: string;
};

type Props = {
  logs: LogItem[];
  onEdit: (id: string) => void;
  onDelete: (index: number) => void;
  onCopyMarkdown: (log: LogItem) => void;
  isEditing: (id: string) => boolean;
};

const HealthLogList: React.FC<Props> = ({ logs, onEdit, onDelete, onCopyMarkdown, isEditing }) => {
  return (
    <div>
      {logs.length > 0 ? (
        logs.map((log, index) => (
          <div
            key={index}
            className="log-entry"
            style={{
              border: "1px solid #ccc",
              borderRadius: "8px",
              padding: "15px",
              marginBottom: "15px",
              backgroundColor: "#fff",
              boxShadow: "0 2px 5px rgba(0,0,0,0.05)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <strong>{log.date} / {log.time}</strong>
              <div style={{
                padding: "10px",
                marginBottom: "5px",
                backgroundColor: isEditing(log.id) ? "#ffeb3b" : "#f0f0f0",
                border: isEditing(log.id) ? "2px solid #ff9800" : "1px solid #ccc",
                borderRadius: "4px",
              }}>
                <button onClick={() => onEdit(log.id)}>編集</button>
                <button onClick={() => onDelete(index)}>削除</button>
                <button onClick={() => onCopyMarkdown(log)}>Markdownコピー</button>
              </div>
            </div>
            <p>{log.memo}</p>
            <ul>
              <li>アサコール: {log.meds.asacol ? "✔️" : "❌"}</li>
              <li>クリアミン: {log.meds.clearmin ? "✔️" : "❌"}</li>
              <li>エビオス: {log.meds.ebios ? "✔️" : "❌"}</li>
              <li>花粉レベル: {log.pollenLevel || "未入力"}</li>
            </ul>
          </div>
        ))
      ) : (
        <p>まだ記録はありません。</p>
      )}
    </div>
  );
};

export default HealthLogList;