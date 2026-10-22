import React, { useState } from "react";
import { PollenLevel } from "../../types";
import { useLanguage } from "../../contexts/LanguageContext";

import { formatMedicationTime } from "../../lib/medicationTime";

export type HealthLogFormProps = {
  memo: string;
  pollenLevel: PollenLevel | "";
  customMedsCheck: Record<string, boolean>;
  customMedsCheckedAt?: Record<string, string>;
  masterMeds: string[];
  onMemoChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onPollenLevelChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  onCustomMedsChange: (name: string, checked: boolean) => void;
  onMedicationTimeChange: (name: string, time: string) => void;
  onSave: () => Promise<void>;
  onCancel: () => void;
  editTargetId?: string | null;
  isSaving?: boolean;
};

const HealthLogForm: React.FC<HealthLogFormProps> = ({
  memo,
  pollenLevel,
  customMedsCheck,
  customMedsCheckedAt = {},
  masterMeds,
  onMemoChange,
  onPollenLevelChange,
  onCustomMedsChange,
  onMedicationTimeChange,
  onSave,
  onCancel,
  editTargetId,
  isSaving,
}) => {
  const { t } = useLanguage();
  const medicationNames = Array.from(new Set([...masterMeds, ...Object.keys(customMedsCheck).filter(name => customMedsCheck[name])]));
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

        {/* Include previously checked items even if removed from the master list. */}
        {medicationNames.length > 0 && (
          <div style={{ marginTop: "1rem" }}>
            <strong>{t.medCheck}</strong>
            {medicationNames.map((name) => (
              <div key={name} style={{ marginBottom: "12px" }}>
                <label style={{ display: "block", minHeight: "44px", paddingTop: "10px" }}>
                  <input
                    type="checkbox"
                    checked={!!customMedsCheck[name]}
                    onChange={(e) => onCustomMedsChange(name, e.target.checked)}
                    style={{ marginRight: "8px" }}
                  />
                  {name}
                </label>
                {customMedsCheck[name] && (
                  <label style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                    <span>時刻（日本時間）</span>
                    <input
                      type="time"
                      aria-label={name + "の時刻（日本時間）"}
                      value={formatMedicationTime(customMedsCheckedAt[name])}
                      onChange={(e) => onMedicationTimeChange(name, e.target.value)}
                      step={60}
                      style={{ minHeight: "44px", fontSize: "16px", maxWidth: "100%" }}
                    />
                  </label>
                )}
              </div>
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
