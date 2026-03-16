import { doc, getDoc, setDoc, onSnapshot } from "firebase/firestore";
import { db } from "../../../firebase";

const getMedsDocRef = (uid: string) =>
  doc(db, "users", uid, "masterData", "meds");

export const subscribeMasterMeds = (
  uid: string,
  callback: (names: string[]) => void,
): (() => void) => {
  const ref = getMedsDocRef(uid);
  return onSnapshot(ref, (snap) => {
    const data = snap.data();
    callback((data?.names as string[]) || []);
  });
};

export const addMasterMed = async (uid: string, name: string): Promise<void> => {
  const ref = getMedsDocRef(uid);
  const snap = await getDoc(ref);
  const current: string[] = (snap.data()?.names as string[]) || [];
  if (current.includes(name)) return;
  await setDoc(ref, { names: [...current, name] });
};

export const deleteMasterMed = async (uid: string, name: string): Promise<void> => {
  const ref = getMedsDocRef(uid);
  const snap = await getDoc(ref);
  const current: string[] = (snap.data()?.names as string[]) || [];
  await setDoc(ref, { names: current.filter((n) => n !== name) });
};
