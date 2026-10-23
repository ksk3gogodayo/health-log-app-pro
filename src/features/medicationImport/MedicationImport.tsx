import React, { useEffect, useRef, useState } from "react";
import { MedicationPreview, QrCollector, normalizeName } from "./jahis";
import {
  deleteMedicationImport,
  SavedMedicine,
  saveMedicationImport,
  Selection,
  watchMedicationImports,
} from "./store";
import { readQrImage } from "./qrImage";
import { parseJahis } from "./jahis";
import "./medicationImport.css";

type Props = { uid: string; masterMeds: string[] };
export default function MedicationImport({ uid, masterMeds }: Props) {
  const [open, setOpen] = useState(false);
  const [preview, setPreview] = useState<MedicationPreview | null>(null);
  const [choices, setChoices] = useState<(Selection & { selected: boolean })[]>(
    [],
  );
  const [confirmed, setConfirmed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [history, setHistory] = useState<SavedMedicine[]>([]);
  const [historyError, setHistoryError] = useState(false);
  const collector = useRef(new QrCollector());
  const generation = useRef(0);
  const active = useRef(false);
  useEffect(
    () => () => {
      generation.current++;
      collector.current = new QrCollector();
    },
    [],
  );
  useEffect(() => {
    if (!open) return;
    setHistoryError(false);
    return watchMedicationImports(uid, setHistory, () => setHistoryError(true));
  }, [uid, open]);
  const reset = () => {
    generation.current++;
    collector.current = new QrCollector();
    setPreview(null);
    setChoices([]);
    setConfirmed(false);
    setMessage("");
    setError("");
  };
  const read = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || active.current) return;
    active.current = true;
    setBusy(true);
    setError("");
    const ticket = generation.current;
    try {
      const part = await readQrImage(file);
      if (ticket !== generation.current) return;
      const complete = collector.current.add(part);
      if (!complete) {
        setMessage(collector.current.progress);
        return;
      }
      const parsed = parseJahis(complete);
      setPreview(parsed);
      setMessage("");
      setChoices(
        parsed.medicines.map((m) => ({
          medicine: m,
          mode: "history",
          checkName: m.name,
          selected: true,
        })),
      );
    } catch (err) {
      if (ticket === generation.current)
        setError(
          err instanceof Error ? err.message : "読み取りに失敗しました。",
        );
    } finally {
      active.current = false;
      if (ticket === generation.current) setBusy(false);
    }
  };
  const save = async () => {
    if (!preview || !confirmed || active.current) return;
    active.current = true;
    setBusy(true);
    setError("");
    try {
      const result = await saveMedicationImport(
        uid,
        preview.version,
        choices.filter((c) => c.selected),
      );
      reset();
      setMessage(
        `${result.added}件を登録しました。登録済みの${result.skipped}件は追加していません。服薬チェックは変更していません。`,
      );
    } catch (err) {
      setError(
        "保存できませんでした。通信状態とログインを確認して再試行してください。入力内容は残っています。" +
          (err instanceof Error && !("code" in err) ? ` ${err.message}` : ""),
      );
    } finally {
      active.current = false;
      setBusy(false);
    }
  };
  const update = (
    index: number,
    patch: Partial<Selection & { selected: boolean }>,
  ) =>
    setChoices((old) =>
      old.map((r, i) => (i === index ? { ...r, ...patch } : r)),
    );
  const remove = async (id: string) => {
    if (
      !window.confirm(
        "この取り込み履歴を削除します。服薬記録とチェック項目は残ります。",
      )
    )
      return;
    setBusy(true);
    setError("");
    try {
      await deleteMedicationImport(uid, id);
    } catch {
      setError("削除できませんでした。再試行してください。");
    } finally {
      setBusy(false);
    }
  };
  return (
    <section className="med-import" aria-label="薬の取り込み">
      <button
        type="button"
        onClick={() => {
          if (open) {
            reset();
            setHistory([]);
          }
          setOpen(!open);
        }}
        disabled={busy}
        aria-expanded={open}
      >
        {open ? "取り込み画面を閉じる" : "薬をQRから取り込む"}
      </button>
      {open && (
        <>
          <h3>お薬手帳のQRを読み取る</h3>
          <p>
            薬局の用紙、またはマイナポータルの「薬剤情報 →
            二次元コード表示あり」のQRを使えます。QRは1つずつ読み取ってください。
          </p>
          <p>
            画像は端末内で解析します。確認後に選んだ薬剤情報だけをアカウントへ保存します。暗証番号や認証情報は入力しません。
          </p>
          <details>
            <summary>マイナポータルから取り込むには</summary>
            <p>
              公式サイトで本人認証し、薬剤情報の「二次元コード表示あり」を選びます。QRをスクリーンショットで保存し、この画面で選んでください。複数ある場合は順に読み取れます。自動同期・PDF直接読み込みは未対応です。
            </p>
            <a
              href="https://img.myna.go.jp/manual/03-01/0041.html"
              target="_blank"
              rel="noreferrer"
            >
              マイナポータル公式の手順
            </a>
          </details>
          {!preview && (
            <div className="med-import-inputs">
              <label>
                撮影して読み取る
                <input
                  aria-label="QRを撮影"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  capture="environment"
                  disabled={busy}
                  onChange={read}
                />
              </label>
              <label>
                保存した画像を選ぶ
                <input
                  aria-label="QR画像を選ぶ"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  disabled={busy}
                  onChange={read}
                />
              </label>
            </div>
          )}
          {busy && <p role="status">処理しています…</p>}
          {message && <p role="status">{message}</p>}
          {error && <p role="alert">{error}</p>}
          {preview && (
            <>
              <h3>登録する内容を確認</h3>
              <p>
                対象：
                {preview.patientName ||
                  "氏名の記載なし（用紙で確認してください）"}
              </p>
              <p>
                氏名は確認用の表示のみです。薬剤情報の一部を取り込みます。原本のお薬手帳も残してください。
              </p>
              {preview.omitted && (
                <p>
                  患者情報・市販薬・メモなど、取り込み対象外の項目があります。
                </p>
              )}
              {choices.map((row, i) => {
                const m = row.medicine;
                const similar = masterMeds.filter(
                  (n) => normalizeName(n) === normalizeName(m.name),
                );
                const prior = history.some(
                  (h) =>
                    h.date === m.date &&
                    (m.code
                      ? h.codeType === m.codeType && h.code === m.code
                      : normalizeName(h.name) === normalizeName(m.name)),
                );
                return (
                  <article key={i} className="med-import-card">
                    <label>
                      <input
                        type="checkbox"
                        checked={row.selected}
                        disabled={busy}
                        onChange={(e) =>
                          update(i, { selected: e.target.checked })
                        }
                      />
                      {m.name}
                    </label>
                    <p>
                      {m.date.replace(/-/g, "/")}・{m.pharmacy}
                    </p>
                    {m.prescriber && <p>処方元：{m.prescriber}</p>}
                    <p>
                      用量（原文）：{m.amount || "記載なし"} {m.unit} ／{" "}
                      {m.quantity} {m.quantityUnit}
                    </p>
                    <p>用法：{m.usage || "記載なし"}</p>
                    <p className="med-import-help">
                      用量は1日量・1回量・全量などの場合があります。服用量は用紙で確認してください。
                    </p>
                    {m.notes.map((note, n) => (
                      <p key={n}>補足：{note}</p>
                    ))}
                    {prior && (
                      <p>
                        同じ日・薬の取り込み履歴があります。内容を確認し、不要なら選択を外してください。
                      </p>
                    )}
                    {similar.length > 0 && (
                      <p>
                        同名のチェック項目があります。「既存の項目に紐づける」を選べます。
                      </p>
                    )}
                    <label>
                      服薬チェックとの連携
                      <select
                        aria-label={`${i + 1}件目の連携方法`}
                        value={row.mode}
                        disabled={!row.selected || busy}
                        onChange={(e) =>
                          update(i, {
                            mode: e.target.value as Selection["mode"],
                            checkName:
                              e.target.value === "existing"
                                ? similar[0] || masterMeds[0] || ""
                                : m.name,
                          })
                        }
                      >
                        <option value="history">薬剤情報の保存のみ</option>
                        <option value="new">新しいチェック項目を作る</option>
                        <option value="existing" disabled={!masterMeds.length}>
                          既存の項目に紐づける
                        </option>
                      </select>
                    </label>
                    {row.mode === "new" && (
                      <label>
                        チェック項目名
                        <input
                          aria-label={`${i + 1}件目のチェック項目名`}
                          maxLength={120}
                          value={row.checkName}
                          disabled={!row.selected || busy}
                          onChange={(e) =>
                            update(i, { checkName: e.target.value })
                          }
                        />
                      </label>
                    )}
                    {row.mode === "existing" && (
                      <label>
                        登録先
                        <select
                          aria-label={`${i + 1}件目の登録先`}
                          value={row.checkName}
                          disabled={!row.selected || busy}
                          onChange={(e) =>
                            update(i, { checkName: e.target.value })
                          }
                        >
                          {masterMeds.map((n) => (
                            <option key={n} value={n}>
                              {n}
                            </option>
                          ))}
                        </select>
                      </label>
                    )}
                  </article>
                );
              })}
              <label className="med-import-confirm">
                <input
                  type="checkbox"
                  checked={confirmed}
                  disabled={busy}
                  onChange={(e) => setConfirmed(e.target.checked)}
                />
                自分の薬の情報であることと、選んだ内容を確認しました
              </label>
              <button
                type="button"
                disabled={
                  busy || !confirmed || !choices.some((r) => r.selected)
                }
                onClick={save}
              >
                選んだ薬を登録する
              </button>
            </>
          )}
          <button type="button" disabled={busy} onClick={reset}>
            読み取りをやり直す
          </button>
          <details>
            <summary>取り込み履歴（最新100件）</summary>
            {historyError && (
              <p role="alert">
                履歴を取得できません。アクセス権限と通信状態を確認してください。
              </p>
            )}
            {!historyError && !history.length && (
              <p>取り込み履歴はありません。</p>
            )}
            {history.map((h) => (
              <article key={h.id} className="med-import-card">
                <strong>{h.name}</strong>
                <p>
                  {h.date.replace(/-/g, "/")}・{h.pharmacy}
                </p>
                <p>
                  用量（原文）：{h.amount} {h.unit} ／ {h.quantity}{" "}
                  {h.quantityUnit}
                </p>
                <p>{h.usage}</p>
                {h.notes.map((n, i) => (
                  <p key={i}>{n}</p>
                ))}
                <p>チェック項目：{h.checkName || "連携なし"}</p>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => remove(h.id)}
                >
                  この取り込み履歴を削除
                </button>
              </article>
            ))}
          </details>
        </>
      )}
    </section>
  );
}
