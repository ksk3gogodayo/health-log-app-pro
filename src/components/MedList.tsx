import { MedItem } from "../types/meds";
import { useState } from "react"; // ← useState エラーにも対応

type Props = {
  meds: MedItem[];
  onDelete: (id: string) => void;
};

const MedList = ({ meds, onDelete }: Props) => (
  <ul>
    {meds.map((med) => (
      <li key={med.id}>
        {med.name}（{med.dosage} / {med.timing}） 
        <button onClick={() => onDelete(med.id)}>🗑️</button>
      </li>
    ))}
  </ul>
);