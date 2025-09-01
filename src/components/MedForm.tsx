// src/components/MedForm.tsx
import { InputMed, StoredMed } from "../types/meds";
import { useState } from "react"; // ← useState エラーにも対応

type Props = {
  onAdd: (med: Omit<StoredMed, "id">) => Promise<void>;
  mode: "light" | "dark"; // ← 追加
};

const MedForm = ({ onAdd, mode }: Props) => {
  const [name, setName] = useState("");
  const [dosage, setDosage] = useState("");
  const [timing, setTiming] = useState("");

  const handleSubmit = () => {
    if (!name.trim()) return alert("薬名を入力してね");
    onAdd({ name, dosage, timing, active: true });
    setName("");
    setDosage("");
    setTiming("");
  };

  return (
    <div style={{ marginBottom: "16px" }}>
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="薬の名前"
        style={{
          padding: "8px",
          marginRight: "8px",
          backgroundColor: mode === "dark" ? "#1e1e1e" : "#fff",
          color: mode === "dark" ? "#fff" : "#000",
          border: "1px solid #ccc",
          borderRadius: "4px",
        }}
      />
      <input
        placeholder="容量"
        value={dosage}
        onChange={(e) => setDosage(e.target.value)}
      />
      <input
        placeholder="タイミング"
        value={timing}
        onChange={(e) => setTiming(e.target.value)}
      />
      <button
        onClick={handleSubmit}
        style={{
          padding: "8px 16px",
          backgroundColor: mode === "dark" ? "#444" : "#eee",
          color: mode === "dark" ? "#fff" : "#000",
          border: "1px solid #888",
          borderRadius: "4px",
          cursor: "pointer",
        }}
      >
        追加
      </button>
    </div>
  );
};

export default MedForm;
