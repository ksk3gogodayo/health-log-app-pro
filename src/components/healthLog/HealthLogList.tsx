import React from "react";
import { PollenLevel } from "../../types";
import { useLanguage } from "../../contexts/LanguageContext";

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
  customMedsCheck?: Record<string, boolean>;
};

type Props = {
  logs: LogItem[];
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onCopyMarkdown: (log: LogItem) => void;
  isEditing: (id: string) => boolean;
};

const HealthLogList: React.FC<Props> = ({
  logs,
  onEdit,
  onDelete,
  onCopyMarkdown,
  isEditing,
}) => {
  const { t } = useLanguage();

  const checkedCustomMeds = (check?: Record<string, boolean>) =>
    check ? Object.entries(check).filter(([, v]) => v).map(([name]) => name) : [];

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
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "8px",
              }}
            >
              <strong>
                {log.date} / {log.time}
              </strong>
              <div
                style={{
                  display: "flex",
                  gap: "4px",
                  padding: "6px",
                  backgroundColor: isEditing(log.id) ? "#ffeb3b" : "#f0f0f0",
                  border: isEditing(log.id)
                    ? "2px solid #ff9800"
                    : "1px solid #ccc",
                  borderRadius: "4px",
                }}
              >
                <button onClick={() => onEdit(log.id)}>{t.edit}</button>
                <button onClick={() => onDelete(log.id)}>{t.delete}</button>
                <button onClick={() => onCopyMarkdown(log)}>Markdown</button>
              </div>
            </div>
            <p style={{ whiteSpace: "pre-line", marginBottom: "8px" }}>{log.memo}</p>
            <ul style={{ listStyle: "none", padding: 0 }}>
              <li>アサコール: {log.meds.asacol ? "✔️" : "❌"}</li>
              <li>クリアミン: {log.meds.clearmin ? "✔️" : "❌"}</li>
              <li>エビオス: {log.meds.ebios ? "✔️" : "❌"}</li>
              <li>花粉: {log.pollenLevel || "未入力"}</li>
              {checkedCustomMeds(log.customMedsCheck).map((name) => (
                <li key={name}>💊 {name}: ✔️</li>
              ))}
            </ul>
          </div>
        ))
      ) : (
        <p>{t.noLogs}</p>
      )}
    </div>
  );
};

export default HealthLogList;
