// components/healthLog/HealthLogForm.tsx
import React from "react";
import { PollenLevel } from "../../types";

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
  editTargetId: string | null;
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
  editTargetId,
}) => {
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
        {editTargetId ? (
          <>
            <button onClick={onSave}>保存</button>
            <button onClick={onCancel}>キャンセル</button>
          </>
        ) : (
          <button onClick={onSave}>新規作成</button>
        )}
      </div>
    </div>
  );
};

export default HealthLogForm;