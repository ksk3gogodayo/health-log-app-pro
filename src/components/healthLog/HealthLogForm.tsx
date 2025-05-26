// components/healthLog/HealthLogForm.tsx
import React from "react";
import { PollenLevel, LogItem } from "../../types";

type Meds = {
  asacol: boolean;
  clearmin: boolean;
  ebios: boolean;
};

type Props = {
  memo: string;
  meds: Meds;
  pollenLevel: PollenLevel;
  onMemoChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onMedsChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onPollenLevelChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  onSave: () => void;
  onCancel: () => void;
  editTarget: LogItem | null;
};

const HealthLogForm: React.FC<Props> = ({
  memo,
  meds,
  pollenLevel,
  onMemoChange,
  onMedsChange,
  onPollenLevelChange,
  onSave,
  onCancel,
  editTarget,
}: Props) => {
  const buttonStyle = {
    backgroundColor: editTarget ? "#ffc107" : "#007bff", // 黄色 or 青
    color: "white",
    padding: "10px",
    borderRadius: "4px",
    border: "none",
  };
  return (
    <div>
      {/* 体調メモ */}
      <textarea
        rows={3}
        placeholder="今日の体調をひとことで..."
        value={memo}
        onChange={onMemoChange}
        style={{ marginBottom: "0px" }}
      />

      {/* 薬チェック */}
      <div style={{ marginTop: "10px" }}>
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

      {/* 花粉レベル */}
      <div style={{ marginTop: "10px" }}>
        <label>
          花粉レベル：
          <select
            value={pollenLevel}
            onChange={onPollenLevelChange}
          >
            <option value="">選択してください</option>
            <option value="弱">弱</option>
            <option value="中">中</option>
            <option value="強">強</option>
          </select>
        </label>
      </div>

      {/* 記録ボタン */}
      <div style={{ display: "flex", gap: "10px", marginTop: "10px", marginBottom: "10px" }}>
        {editTarget ? (
          <>
            <button style={buttonStyle} onClick={onSave}>
              {editTarget ? "編集する" : "記録する"}
            </button>
            {editTarget && (
              <button onClick={onCancel}>
                編集キャンセル
              </button>
            )}
          </>
        ) : (
          <button onClick={onSave}>新規作成</button>
        )}
      </div>
    </div>
  );
};

export default HealthLogForm;