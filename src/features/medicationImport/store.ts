import {
  collection,
  deleteDoc,
  doc,
  limit,
  onSnapshot,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
} from "firebase/firestore";
import { auth, db } from "../../firebase";
import { ImportedMedicine, medicineId, normalizeName } from "./jahis";
export type Selection = {
  medicine: ImportedMedicine;
  mode: "history" | "new" | "existing";
  checkName: string;
};
export type SavedMedicine = ImportedMedicine & {
  id: string;
  checkName: string;
  sourceVersion: string;
};
function requireOwner(uid: string) {
  if (!uid || auth.currentUser?.uid !== uid)
    throw new Error("ログインし直してください。");
}
export async function saveMedicationImport(
  uid: string,
  version: string,
  selected: Selection[],
) {
  requireOwner(uid);
  if (
    !selected.length ||
    selected.length > 100 ||
    !/^JAHISTC0[3-8]$/.test(version)
  )
    throw new Error("登録内容を確認してください。");
  const rows = await Promise.all(
    selected.map(async (row) => ({
      ...row,
      id: await medicineId(row.medicine),
    })),
  );
  if (new Set(rows.map((r) => r.id)).size !== rows.length)
    throw new Error(
      "同一の薬剤情報が含まれています。重複した行の選択を外してください。",
    );
  return runTransaction(db, async (tx) => {
    requireOwner(uid);
    const masterRef = doc(db, "users", uid, "masterData", "meds");
    const master = await tx.get(masterRef);
    const names: string[] = master.data()?.names || [];
    const refs = rows.map((r) =>
      doc(db, "users", uid, "medicationImports", r.id),
    );
    const previous = await Promise.all(refs.map((ref) => tx.get(ref)));
    let added = 0,
      skipped = 0;
    const nextNames = [...names];
    rows.forEach((row, i) => {
      if (previous[i].exists()) {
        skipped++;
        return;
      }
      const checkName = row.mode === "history" ? "" : row.checkName.trim();
      if (row.mode !== "history" && (!checkName || checkName.length > 120))
        throw new Error("チェック項目名を1〜120文字で入力してください。");
      if (row.mode === "existing" && !names.includes(checkName))
        throw new Error(
          "選んだ薬が削除されています。登録先を選び直してください。",
        );
      if (
        row.mode === "new" &&
        nextNames.some((n) => normalizeName(n) === normalizeName(checkName))
      )
        throw new Error(
          "同じ名前のチェック項目があります。「既存の項目」を選ぶか名前を変えてください。",
        );
      if (row.mode === "new") nextNames.push(checkName);
      tx.set(refs[i], {
        ...row.medicine,
        checkName,
        sourceVersion: version,
        source: "jahis-qr",
        importedAt: serverTimestamp(),
      });
      added++;
    });
    if (nextNames.length !== names.length)
      tx.set(masterRef, { names: nextNames }, { merge: true });
    return { added, skipped };
  });
}
export function watchMedicationImports(
  uid: string,
  onChange: (items: SavedMedicine[]) => void,
  onError: () => void,
) {
  requireOwner(uid);
  return onSnapshot(
    query(
      collection(db, "users", uid, "medicationImports"),
      orderBy("importedAt", "desc"),
      limit(100),
    ),
    (snap) => {
      onChange(
        snap.docs.map((d) => ({ ...d.data(), id: d.id }) as SavedMedicine),
      );
    },
    onError,
  );
}
export async function deleteMedicationImport(uid: string, id: string) {
  requireOwner(uid);
  await deleteDoc(doc(db, "users", uid, "medicationImports", id));
}
