import React, { useState } from "react";
import { Meds, PollenLevel } from "../../types";
import { useLanguage } from "../../contexts/LanguageContext";

export type HealthLogFormProps = {
  memo: string;
  meds: Meds;
  pollenLevel: PollenLevel | "";
  customMedsCheck: Record<string, boolean>;
  masterMeds: string[];
  onMemoChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onMedsChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onPollenLevelChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  onCustomMedsChange: (name: string, checked: boolean) => void;
  onSave: () => Promise<void>;
  onCancel: () => void;
  editTargetId?: string | null;
  isSaving?: boolean;
};

const HealthLogForm: React.FC<HealthLogFormProps> = ({
  memo,
  meds,
  pollenLevel,
  customMedsCheck,
  masterMeds,
  onMemoChange,
  onMedsChange,
  onPollenLevelChange,
  onCustomMedsChange,
  onSave,
  onCancel,
  editTargetId,
  isSaving,
}) => {
  const { t } = useLanguage();
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
    } catch {
      setAiComment("エラーが発生しました。");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div>
        <button onClick={handleGenerateComment} disabled={isLoading}>
          {isLoading ? t.aiGenerating : t.aiComment}
        </button>
        {aiComment && (
          <div style={{ whiteSpace: "pre-wrap", marginTop: "1rem" }}>
            <strong>{t.aiAdvice}</strong>
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
          placeholder={t.memo}
          rows={4}
          style={{ width: "100%", marginTop: "1rem" }}
        />

        {/* Fixed medications */}
        <div style={{ marginTop: "1rem" }}>
          <strong>{t.medCheck}</strong>
          <div style={{ marginTop: "8px" }}>
            {(["asacol", "clearmin", "ebios"] as const).map((key) => (
              <label key={key} style={{ marginRight: "16px" }}>
                <input
                  type="checkbox"
                  name={key}
                  checked={meds[key]}
                  onChange={onMedsChange}
                  style={{ marginRight: "4px" }}
                />
                {key === "asacol" ? "アサコール" : key === "clearmin" ? "クリアミン" : "エビオス"}
              </label>
            ))}
          </div>
        </div>

        {/* Pollen level */}
        <div style={{ marginTop: "1rem" }}>
          <select value={pollenLevel} onChange={onPollenLevelChange}>
            <option value="">{t.pollenLabel}</option>
            <option value="none">{t.pollenNone}</option>
            <option value="low">{t.pollenLow}</option>
            <option value="medium">{t.pollenMedium}</option>
            <option value="high">{t.pollenHigh}</option>
          </select>
        </div>

        {/* Master meds (dynamic from Firestore) */}
        {masterMeds.length > 0 && (
          <div style={{ marginTop: "1rem" }}>
            {masterMeds.map((name) => (
              <label key={name} style={{ display: "block", marginBottom: "4px" }}>
                <input
                  type="checkbox"
                  checked={!!customMedsCheck[name]}
                  onChange={(e) => onCustomMedsChange(name, e.target.checked)}
                  style={{ marginRight: "8px" }}
                />
                {name}
              </label>
            ))}
          </div>
        )}

        <div style={{ marginTop: "1rem", display: "flex", gap: "8px" }}>
          <button type="submit" disabled={isSaving}>
            {isSaving ? t.saving : t.save}
          </button>
          {editTargetId && (
            <button type="button" onClick={onCancel}>
              {t.cancel}
            </button>
          )}
        </div>
      </form>
    </>
  );
};

export default HealthLogForm;
