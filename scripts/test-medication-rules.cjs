// Runs exclusively against the local demo emulator, never a production project.
const { readFileSync } = require("node:fs");
const assert = require("node:assert/strict");
const {
  initializeTestEnvironment,
  assertFails,
  assertSucceeds,
} = require("@firebase/rules-unit-testing");
const {
  doc,
  setDoc,
  getDoc,
  getDocs,
  deleteDoc,
  updateDoc,
  collection,
  query,
  where,
  serverTimestamp,
} = require("firebase/firestore");
const ts = require("typescript");
require.extensions[".ts"] = (module, path) =>
  module._compile(
    ts.transpileModule(readFileSync(path, "utf8"), {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2020,
        esModuleInterop: true,
      },
    }).outputText,
    path,
  );
(async () => {
  const env = await initializeTestEnvironment({
    projectId: "demo-health-qr",
    firestore: {
      host: "127.0.0.1",
      port: 8089,
      rules: readFileSync("firestore.rules", "utf8"),
    },
  });
  let count = 0;
  async function check(name, fn) {
    await fn();
    count++;
    console.log("PASS " + name);
  }
  try {
    await env.clearFirestore();
    const alice = env.authenticatedContext("alice").firestore(),
      bob = env.authenticatedContext("bob").firestore(),
      guest = env.unauthenticatedContext().firestore();
    const oldLog = {
      uid: "alice",
      date: "2026-10-23",
      time: "08:00:00",
      memo: "synthetic",
      customMedsCheck: { 朝: true },
      customMedsCheckedAt: { 朝: "2026-10-22T23:00:00Z" },
    };
    await env.withSecurityRulesDisabled(async (c) => {
      await setDoc(doc(c.firestore(), "healthLogs", "legacy"), oldLog);
      await setDoc(doc(c.firestore(), "users", "alice", "masterData", "meds"), {
        names: ["朝", "昼", "晩"],
        keep: "existing field",
      });
    });
    await check(
      "owner can read, query and edit existing health logs",
      async () => {
        await assertSucceeds(getDoc(doc(alice, "healthLogs", "legacy")));
        await assertSucceeds(
          getDocs(
            query(collection(alice, "healthLogs"), where("uid", "==", "alice")),
          ),
        );
        await assertSucceeds(
          updateDoc(doc(alice, "healthLogs", "legacy"), { time: "08:01:00" }),
        );
      },
    );
    await check(
      "guest and other user cannot read/query/modify/delete health logs",
      async () => {
        for (const db of [bob, guest]) {
          await assertFails(getDoc(doc(db, "healthLogs", "legacy")));
          await assertFails(getDocs(collection(db, "healthLogs")));
          await assertFails(
            updateDoc(doc(db, "healthLogs", "legacy"), { memo: "forbidden" }),
          );
          await assertFails(deleteDoc(doc(db, "healthLogs", "legacy")));
        }
        await assertFails(
          updateDoc(doc(alice, "healthLogs", "legacy"), { uid: "bob" }),
        );
        await assertFails(
          setDoc(doc(bob, "healthLogs", "spoof"), { uid: "alice" }),
        );
      },
    );
    await check(
      "master and legacy medication collections enforce ownership",
      async () => {
        for (const path of [
          ["masterData", "meds"],
          ["meds", "example"],
        ]) {
          await assertSucceeds(
            setDoc(doc(alice, "users", "alice", ...path), {
              names: ["朝", "昼", "晩"],
              keep: "existing field",
            }),
          );
          await assertFails(getDoc(doc(bob, "users", "alice", ...path)));
          await assertFails(setDoc(doc(guest, "users", "alice", ...path), {}));
          await assertFails(deleteDoc(doc(bob, "users", "alice", ...path)));
        }
      },
    );
    const firebasePath = require.resolve("../src/firebase.ts");
    require.cache[firebasePath] = {
      id: firebasePath,
      filename: firebasePath,
      loaded: true,
      exports: { db: alice, auth: { currentUser: { uid: "alice" } } },
    };
    const {
      saveMedicationImport,
    } = require("../src/features/medicationImport/store.ts");
    const {
      parseJahis,
      medicineId,
    } = require("../src/features/medicationImport/jahis.ts");
    const {
      sampleJahis,
    } = require("../src/features/medicationImport/fixtures.ts");
    const medicine = parseJahis(sampleJahis).medicines[0];
    const id = await medicineId(medicine);
    await check(
      "concurrent duplicate imports commit exactly once and keep legacy fields",
      async () => {
        const request = [{ medicine, mode: "new", checkName: "テスト朝" }];
        const results = await Promise.all([
          saveMedicationImport("alice", "JAHISTC08", request),
          saveMedicationImport("alice", "JAHISTC08", request),
        ]);
        assert.equal(
          results.reduce((n, r) => n + r.added, 0),
          1,
        );
        assert.equal(
          results.reduce((n, r) => n + r.skipped, 0),
          1,
        );
        assert.equal(
          (
            await getDocs(
              collection(alice, "users", "alice", "medicationImports"),
            )
          ).size,
          1,
        );
        const master = (
          await getDoc(doc(alice, "users", "alice", "masterData", "meds"))
        ).data();
        assert.deepEqual(master.names, ["朝", "昼", "晩", "テスト朝"]);
        assert.equal(master.keep, "existing field");
        assert.deepEqual(
          (await getDoc(doc(alice, "healthLogs", "legacy"))).data()
            .customMedsCheckedAt,
          oldLog.customMedsCheckedAt,
        );
      },
    );
    await check(
      "separate dispensing dates import separately and existing check mapping creates no new names",
      async () => {
        assert.equal(
          (
            await saveMedicationImport("alice", "JAHISTC08", [
              {
                medicine: { ...medicine, date: "2026-10-24" },
                mode: "existing",
                checkName: "朝",
              },
            ])
          ).added,
          1,
        );
        assert.equal(
          (
            await getDocs(
              collection(alice, "users", "alice", "medicationImports"),
            )
          ).size,
          2,
        );
        assert.equal(
          (
            await getDoc(doc(alice, "users", "alice", "masterData", "meds"))
          ).data().names.length,
          4,
        );
      },
    );
    await check(
      "invalid mapping aborts the whole transaction with no partial additions",
      async () => {
        await assert.rejects(
          saveMedicationImport("alice", "JAHISTC08", [
            {
              medicine: { ...medicine, date: "2026-10-25" },
              mode: "new",
              checkName: "new candidate",
            },
            {
              medicine: { ...medicine, date: "2026-10-26" },
              mode: "existing",
              checkName: "deleted",
            },
          ]),
        );
        assert.equal(
          (
            await getDocs(
              collection(alice, "users", "alice", "medicationImports"),
            )
          ).size,
          2,
        );
        assert.equal(
          (await getDoc(doc(alice, "users", "alice", "masterData", "meds")))
            .data()
            .names.includes("new candidate"),
          false,
        );
      },
    );
    await check(
      "raw payload and credentials cannot be written to imported records",
      async () => {
        const base = {
          ...medicine,
          checkName: "",
          sourceVersion: "JAHISTC08",
          source: "jahis-qr",
          importedAt: serverTimestamp(),
        };
        for (const forbidden of [
          "rawPayload",
          "patientName",
          "pin",
          "accessToken",
        ])
          await assertFails(
            setDoc(
              doc(alice, "users", "alice", "medicationImports", forbidden),
              { ...base, [forbidden]: "must not persist" },
            ),
          );
        await assertFails(
          updateDoc(doc(alice, "users", "alice", "medicationImports", id), {
            name: "changed",
          }),
        );
      },
    );
    await check(
      "guest and another user cannot access imported medication",
      async () => {
        for (const db of [guest, bob]) {
          await assertFails(
            getDoc(doc(db, "users", "alice", "medicationImports", id)),
          );
          await assertFails(
            getDocs(collection(db, "users", "alice", "medicationImports")),
          );
          await assertFails(
            setDoc(doc(db, "users", "alice", "medicationImports", "fake"), {
              ...medicine,
              source: "jahis-qr",
              importedAt: serverTimestamp(),
            }),
          );
          await assertFails(
            deleteDoc(doc(db, "users", "alice", "medicationImports", id)),
          );
        }
      },
    );
    await check(
      "owner can delete import without removing health logs or check names",
      async () => {
        await assertSucceeds(
          deleteDoc(doc(alice, "users", "alice", "medicationImports", id)),
        );
        assert.equal(
          (await getDoc(doc(alice, "healthLogs", "legacy"))).exists(),
          true,
        );
        assert.equal(
          (await getDoc(doc(alice, "users", "alice", "masterData", "meds")))
            .data()
            .names.includes("テスト朝"),
          true,
        );
      },
    );
    console.log(`${count} emulator integration/security scenarios passed`);
  } finally {
    await env.cleanup();
  }
})().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
