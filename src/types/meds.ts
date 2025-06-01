// types/med.ts
export type MedItem = {
  id: string;
  name: string;
  dosage?: string;
  timing?: string;
  active: boolean;
};

export type NewMedItem = Omit<MedItem, "id">;