import {
  doc,
  setDoc,
  onSnapshot,
  arrayUnion,
  arrayRemove,
} from "firebase/firestore";
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

export const addMasterMed = async (
  uid: string,
  name: string,
): Promise<void> => {
  const ref = getMedsDocRef(uid);
  await setDoc(ref, { names: arrayUnion(name) }, { merge: true });
};

export const deleteMasterMed = async (
  uid: string,
  name: string,
): Promise<void> => {
  const ref = getMedsDocRef(uid);
  await setDoc(ref, { names: arrayRemove(name) }, { merge: true });
};
