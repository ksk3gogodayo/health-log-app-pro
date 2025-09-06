// src/components/MedForm.tsx
import { InputMed, StoredMed } from "../types/meds";
import { useState } from "react"; // ← useState エラーにも対応

type MedFormProps = {
  onAdd: (med: Omit<StoredMed, "id">) => Promise<void>;
  mode: "light" | "dark"; // ← 追加
  customMeds: StoredMed[];
  setCustomMeds: React.Dispatch<React.SetStateAction<StoredMed[]>>;
};

const MedForm = ({ onAdd, mode, customMeds, setCustomMeds }: MedFormProps) => {
  const [name, setName] = useState("");
  const [dosage, setDosage] = useState("");
  const [timing, setTiming] = useState("");
  const [aiComment, setAiComment] = useState("");

  const handleSubmit = () => {
    if (!name.trim()) return alert("薬名を入力してね");
    onAdd({ name, dosage, timing, aiComment, active: true });
    setName("");
    setDosage("");
    setTiming("");
    setAiComment("");
  };

  const generateAiComment = async (
    name: string,
    dosage: string,
    timing: string
  ) => {
    return Promise.resolve(
      `「${name} (${dosage})を${timing}に服用しましょう。頑張って続けましょうね。」`
    );
  };

  const handleGenerateComment = async () => {
    const comment = await generateAiComment(name, dosage, timing);
    setAiComment(comment);
  };

  const handleDeleteInputMed = (index: number) => {
    setCustomMeds((prev: StoredMed[]) =>
      prev.filter((_, i: number) => i !== index)
    );
  };

  return (
    <div style={{ marginBottom: "16px" }}>
      <input
        placeholder="AIコメント（例：服用時の注意点など）"
        value={aiComment}
        onChange={(e) => setAiComment(e.target.value)}
        style={{
          padding: "8px",
          marginTop: "8px",
          marginBottom: "8px",
          backgroundColor: mode === "dark" ? "#1e1e1e" : "#fff",
          color: mode === "dark" ? "#fff" : "#000",
          border: "1px solid #ccc",
          borderRadius: "4px",
          width: "100%",
        }}
      />
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

      {/* ボタンでコメント生成　 */}
      <button onClick={handleGenerateComment}>AIコメント生成</button>

      {/* 表示部分 */}
      {aiComment && <p className="text-gray-600 mt-2">💬 {aiComment}</p>}
    </div>
  );
};

export default MedForm;
