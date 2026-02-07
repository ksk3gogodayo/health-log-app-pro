import { StoredMed } from "../types/meds";

type Props = {
  meds: StoredMed[];
  onDelete: (id: string) => void;
  onEdit: (med: StoredMed) => void; // ← 新しく「編集用」の入り口を追加
};

const MedList = ({ meds, onDelete, onEdit }: Props) => (
  <ul className="space-y-2">
    {meds.map((med) => (
      <li
        key={med.id}
        className="flex items-center justify-between p-2 border-b border-gray-700"
      >
        <span>
          {med.name} ({med.dosage} / {med.timing})
        </span>
        <div className="flex gap-2">
          {/* 編集ボタンを追加 */}
          <button
            onClick={() => onEdit(med)}
            className="text-blue-400 hover:text-blue-300"
          >
            ✏️
          </button>
          {/* 削除ボタン */}
          <button
            onClick={() => onDelete(med.id)}
            className="text-red-400 hover:text-red-300"
          >
            🗑️
          </button>
        </div>
      </li>
    ))}
  </ul>
);

export default MedList;
