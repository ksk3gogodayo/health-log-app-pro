import React, { useState } from "react";
import { useLanguage } from "../contexts/LanguageContext";
import {
  addMasterMed,
  deleteMasterMed,
} from "../features/meds/services/masterMeds";

type Props = {
  uid: string;
  masterMeds: string[];
};

const Settings: React.FC<Props> = ({ uid, masterMeds }) => {
  const { t } = useLanguage();
  const [newMedName, setNewMedName] = useState("");

  const handleAdd = async () => {
    const name = newMedName.trim();
    if (!name) return;
    await addMasterMed(uid, name);
    setNewMedName("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleAdd();
  };

  const handleDelete = async (name: string) => {
    if (!window.confirm(t.deleteMedConfirm)) return;
    await deleteMasterMed(uid, name);
  };

  return (
    <div style={{ padding: "20px", maxWidth: "500px", margin: "0 auto" }}>
      <h2 style={{ marginBottom: "16px" }}>{t.medSettings}</h2>

      <div style={{ display: "flex", gap: "8px", marginBottom: "16px" }}>
        <input
          value={newMedName}
          onChange={(e) => setNewMedName(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={t.medName}
          style={{
            flex: 1,
            padding: "8px 12px",
            borderRadius: "6px",
            border: "1px solid #ccc",
            fontSize: "16px",
          }}
        />
        <button
          onClick={handleAdd}
          style={{
            padding: "8px 16px",
            borderRadius: "6px",
            backgroundColor: "#4caf50",
            color: "white",
            border: "none",
            cursor: "pointer",
          }}
        >
          {t.addMed}
        </button>
      </div>

      {masterMeds.length === 0 ? (
        <p style={{ color: "#888" }}>{t.noMeds}</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
          {masterMeds.map((name) => (
            <li
              key={name}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "10px 12px",
                borderBottom: "1px solid #eee",
                borderRadius: "4px",
              }}
            >
              <span>💊 {name}</span>
              <button
                onClick={() => handleDelete(name)}
                style={{
                  padding: "4px 10px",
                  borderRadius: "4px",
                  backgroundColor: "#e53935",
                  color: "white",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "14px",
                }}
              >
                {t.delete}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Settings;
