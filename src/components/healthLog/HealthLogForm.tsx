import React, { useState } from "react";
import { Meds, PollenLevel } from "../../types";
import { StoredMed } from "../../types/meds";

export type HealthLogFormProps = {
  memo: string;
  meds: Meds;
  pollenLevel: PollenLevel | "";
  onMemoChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onMedsChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onPollenLevelChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  onSave: () => Promise<void>;

  onCancel: () => void;
  editTargetId?: string | null;
  isSaving?: boolean;
  customMeds: StoredMed[]; // ← 追加
  onCustomMedsChange: (id: string, checked: boolean) => void;
};

const HealthLogForm: React.FC<HealthLogFormProps> = ({
  memo,
  meds,
  pollenLevel,
  onMemoChange,
  onMedsChange,
  onPollenLevelChange,
  onSave,
  customMeds,
  onCustomMedsChange, // ← これが抜けてるはず！
}) => {
  const [aiComment, setAiComment] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleGenerateComment = async () => {
    if (!memo.trim()) return;

    setIsLoading(true);
    setAiComment("");

    try {
      const res = await fetch("/api/generateComment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: `以下の体調メモに対して簡潔にアドバイスをください:\n${memo}`,
        }),
      });

      const data = await res.json();
      setAiComment(data.comment || "コメント生成に失敗しました。");
    } catch (err) {
      console.error("APIエラー:", err);
      setAiComment("エラーが発生しました。");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div>
        <button onClick={handleGenerateComment} disabled={isLoading}>
          {isLoading ? "生成中..." : "AIコメント生成"}
        </button>

        {aiComment && (
          <div style={{ whiteSpace: "pre-wrap", marginTop: "1rem" }}>
            <strong>AIからのアドバイス:</strong>
            <p>{aiComment}</p>
          </div>
        )}
      </div>
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          await onSave();
        }}
      >
        <textarea
          value={memo}
          onChange={onMemoChange}
          placeholder="メモ"
          rows={4}
          style={{ width: "100%", marginTop: "1rem" }}
        />
        <div style={{ marginTop: "1rem" }}>
          <label>
            <input
              type="checkbox"
              name="asacol"
              checked={meds.asacol}
              onChange={onMedsChange}
            />
            アサコール
          </label>
          <label>
            <input
              type="checkbox"
              name="clearmin"
              checked={meds.clearmin}
              onChange={onMedsChange}
            />
            クリアミン
          </label>
          <label>
            <input
              type="checkbox"
              name="ebios"
              checked={meds.ebios}
              onChange={onMedsChange}
            />
            エビオス
          </label>
        </div>

        <div style={{ marginTop: "1rem" }}>
          <select value={pollenLevel} onChange={onPollenLevelChange}>
            <option value="">花粉レベルを選択</option>
            <option value="none">なし</option>
            <option value="low">少ない</option>
            <option value="medium">普通</option>
            <option value="high">多い</option>
          </select>
        </div>

        <div style={{ marginTop: "1rem" }}>
          {customMeds.map((med) => (
            <label key={med.id}>
              <input
                type="checkbox"
                checked={!!med.active}
                onChange={(e) => onCustomMedsChange(med.id, e.target.checked)}
                style={{ marginRight: "8px" }}
              />
              {med.name}
            </label>
          ))}
        </div>

        <button type="submit" style={{ marginTop: "1rem" }}>
          保存
        </button>
      </form>
    </>
  );
};

export default HealthLogForm;
