import React, { useState, useEffect } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css"; // スタイル読み込み
import { fetchHealthLogs, saveNewHealthLog, saveHealthLog, deleteHealthLog, updateHealthLog, subscribeHealthLogs } from "../lib/firestore";
import { auth } from "../firebase";
import { onAuthStateChanged, User } from "firebase/auth";
import { getSeason, seasonThemes } from "lib/theme";
import HealthLogForm from "../components/healthLog/HealthLogForm";
import HealthLogList from "../components/healthLog/HealthLogList";
import { LogItem, NewLogItem, Meds, PollenLevel } from "../types"; // パスは必要に応じて調整
import { useHealthLogs } from "../hooks/useHealthLogs";

type CalendarValue = Date | Date[] | null;
type Value = Date | Date[] | null;

// 薬チェック用の型
const messages = [
    "🌿 今日もおつかれさま",
    "😊 記録しててえらいね",
    "🍵 無理せんと、ゆるっといこう",
    "🌸 深呼吸、忘れてない？",
    "💪 小さな一歩でも前進やで",
    "☁️ 曇ってても、心は晴れるよ"
];

const HealthLogApp = () => {
    // 季節テーマの取得
    const season = getSeason();
    const theme = seasonThemes[season];

    const [mode, setMode] = useState<"light" | "dark">("light");
    useEffect(() => {
        const mq = window.matchMedia("(prefers-color-scheme: dark)");
        const listener = (e: MediaQueryListEvent) => setMode(e.matches ? "dark" : "light");
        setMode(mq.matches ? "dark" : "light");
        mq.addEventListener("change", listener);
        return () => mq.removeEventListener("change", listener);
    }, []);

    const fontColor = mode === "dark" ? theme.darkColor : theme.lightColor;

    // ステート管理
    const [memo, setMemo] = useState<string>("");
    const [meds, setMeds] = useState<Meds>({
        asacol: false,
        clearmin: false,
        ebios: false,
    });
    const [date, setDate] = useState<string>("");
    const [time, setTime] = useState<string>("");
    const [pollenLevel, setPollenLevel] = useState<PollenLevel | "">("");
    const [todayMessage, setTodayMessage] = useState("");
    const [editTarget, setEditTarget] = useState<LogItem | null>(null);
    // 🔸 追加: 保存中ステート
    const [isSaving, setIsSaving] = useState(false);

    // 追加
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        const unsub = onAuthStateChanged(auth, (firebaseUser) => {
            setUser(firebaseUser);
            console.log("✅ ログイン中のユーザー:", firebaseUser?.email, "uid:", firebaseUser?.uid);
        });
        return () => unsub();
    }, []);

    const { logs, addLog, deleteLog } = useHealthLogs(user?.uid);

    useEffect(() => {
        const random = Math.floor(Math.random() * messages.length);
        setTodayMessage(messages[random]);
    }, []);

    // 日付ステートを追加
    const [selectedDate, setSelectedDate] = useState<string | null>(null);

    // 1件のログをMarkdown形式に変換
    const formatToMarkdown = (log: LogItem & { pollenLevel: PollenLevel | "" }) => {
        return `## ${log.date}｜体調記録

- 🕒 ${log.time}
- 📝 ${log.memo}
- 💊 アサコール ${log.meds.asacol ? "✔️" : "❌"} / クリアミン ${log.meds.clearmin ? "✔️" : "❌"} / エビオス ${log.meds.ebios ? "✔️" : "❌"}
- 🍃 花粉レベル：${log.pollenLevel || "未入力"}
`;
    };

    // 全件ログをMarkdownでコピー
    const copyAllLogsMarkdown = () => {
        if (logs.length === 0) {
            alert("記録がありません");
            return;
        }
        const allMarkdown = logs.map(formatToMarkdown).join("\n---\n\n");
        navigator.clipboard.writeText(allMarkdown);
        alert("すべての記録をMarkdownでコピーしました！");
    };

    // チェックボックス処理
    const handleMedsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, checked } = e.target;
        setMeds((prev) => ({
            ...prev,
            [name]: checked,
        }));
    };

    // 記録処理
    const handleSubmit = async () => {
        console.log("🟡 handleSubmit 実行されたよ！");
        const now = new Date();
        const formattedDate = now.toLocaleDateString("ja-JP", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
        });

        console.log("🛠 editTarget:", editTarget);
        const newLog: Omit<LogItem, "id"> = {
            date: now.toISOString().split("T")[0], // YYYY-MM-DD 形式
            time: now.toLocaleTimeString(),
            memo,
            meds,
            pollenLevel,
            uid: user?.uid || "",
        };

        if (editTarget) {
            const editedLog = { ...editTarget, ...newLog }; await updateHealthLog(editedLog.id, editedLog);
            alert("編集されました！");
            setEditTarget(null);
        } else {
            await addLog(newLog); // ← id自動生成
            alert("記録されました！");
        }

        setMemo("");
        setMeds({ asacol: false, clearmin: false, ebios: false });
        setPollenLevel("");

    };

    // 編集中のログかどうかを判定するヘルパー関数を作る：
    const isEditing = (id: string) => {
        return editTarget?.id === id;
    };
    // 編集処理
    const handleEdit = (id: string) => {
        const log = logs.find((log) => log.id === id);
        if (log) {
            setEditTarget(log); // ← ここが主役！
            setMemo(log.memo);
            setMeds(log.meds);
            setPollenLevel(log.pollenLevel);
            setDate(log.date);
            setTime(log.time);
        }
    };

    const handleSave = async () => {
        console.log("🟡 handleSave 実行開始！");
        setIsSaving(true); // 🔸 追加
        const now = new Date();
        const formattedTime = now.toLocaleTimeString();
        const formattedDate = selectedDate ? padDate(selectedDate) : now.toISOString().split("T")[0];

        const commonData = {
            memo,
            meds,
            pollenLevel,
            date: formattedDate,
            time: formattedTime,
            uid: user?.uid || "",
        };

        try {
            if (editTarget) {
                // ✅ 編集モード
                const updatedLog: LogItem = {
                    ...editTarget,
                    ...commonData,
                };

                await saveHealthLog(updatedLog);
                const updatedLogs = await fetchHealthLogs(user?.uid || "");
                alert("編集されました！");
                setEditTarget(null);
            } else {
                // ✅ 新規作成モード
                const newLog: NewLogItem = { ...commonData };
                const id = await saveNewHealthLog(newLog);
                alert("記録されました！");
            }
        } catch (error) {
            console.error("🔥 Firestore保存エラー:", error);
        } finally {
            setIsSaving(false); // 🔸 追加
        }

        // 入力リセット
        setMemo("");
        setMeds({ asacol: false, clearmin: false, ebios: false });
        setPollenLevel("");

        // 日付リセット（または保持）
        if (selectedDate) {
            console.log("編集完了時の選択日付:", selectedDate);
            setSelectedDate(selectedDate);
        } else {
            console.warn("選択日付が null のため保持されませんでした");
        }
    };

    // 編集を途中でキャンセルしたい場合の処理も追加しておく：
    const handleCancel = () => {
        setMemo("");
        setMeds({ asacol: false, clearmin: false, ebios: false });
        setPollenLevel("");
        setEditTarget(null);  // 編集終了
    };

    const handleDelete = async (id: string) => {
        const log = logs.find((log) => log.id === id);
        if (!log) return;

        console.log("削除対象のuid:", log.uid);
        console.log("現在のユーザーuid:", user?.uid);

        if (!window.confirm("この記録を削除しますか？")) return;

        try {
            await deleteLog(id);
            // 削除後にlogListから除外（サブスクでも消えるが、即時UI反映のため明示的にfilter）
            alert("Firestoreから削除されました！");
        } catch (error) {
            console.error("削除失敗:", error);
            alert("削除に失敗しました");
        }
    };

    // ボタンスタイル共通化
    const buttonStyle = {
        backgroundColor: "#007bff",
        color: "white",
        border: "none",
        padding: "8px 12px",
        borderRadius: "4px",
        cursor: "pointer",
        marginBottom: "10px",
    };

    const saveButtonStyle = {
        ...buttonStyle,
        backgroundColor: "#28a745",  // 緑
    };

    const cancelButtonStyle = {
        ...buttonStyle,
        backgroundColor: "#dc3545",  // 赤
    };

    // カレンダーで選んだ日付に合わせてログを絞る
    // カレンダーの選択日付の型定義

    type CalendarValue = Date | [Date, Date] | null;

    const handleDateChange = (value: Date | Date[] | null) => {
        if (Array.isArray(value)) {
            const date = value[0]; // 範囲選択の場合、先頭の日付を取得
            if (date) {
                const year = date.getFullYear();
                const month = String(date.getMonth() + 1).padStart(2, "0");
                const day = String(date.getDate()).padStart(2, "0");
                const formattedDate = `${year}-${month}-${day}`;
                setSelectedDate(formattedDate);
                console.log("選択された日付（範囲）:", formattedDate);
            }
        } else if (value instanceof Date) {
            const year = value.getFullYear();
            const month = String(value.getMonth() + 1).padStart(2, "0");
            const day = String(value.getDate()).padStart(2, "0");
            const formattedDate = `${year}-${month}-${day}`;
            setSelectedDate(formattedDate);
            console.log("選択された日付:", formattedDate);
        } else {
            setSelectedDate(null);
        }
    };

    const padDate = (date: string) => {
        console.log("padDate 関数 - 受け取った日付:", date);

        if (!date || date.trim() === "") {
            console.warn("🚨 padDate 関数に無効な値が渡されました:", date);
            return "日付未設定";
        }

        // スラッシュでもハイフンでも分割できるように
        const parts = date.split(/[-/]/);
        const year = parts[0]?.padStart(4, "0") || "0000";
        const month = parts[1]?.padStart(2, "0") || "00";
        const day = parts[2]?.padStart(2, "0") || "00";

        const formattedDate = `${year}-${month}-${day}`;
        console.log("padDate 関数 - 変換後の日付:", formattedDate);
        return formattedDate;
    };

    const todayDate = new Date().toISOString().split("T")[0];

    // 過去ログ用
    const pastLogs = logs.filter((log) => {
        console.log("🧪 log.date:", log.date);
        // ①「過去ログ用」では logDate
        const formattedDate = padDate(log.date);
        return formattedDate !== "日付未設定" && formattedDate < todayDate;
    });

    // 選択日で絞り込み
    const filteredLogs = selectedDate
            ? logs.filter((log) => {
            // ②「日付選択フィルター」では formattedLogDate
            const formattedLogDate = padDate(log.date);
            console.log(`比較: ${formattedLogDate} === ${selectedDate} → ${formattedLogDate === selectedDate}`);
            return formattedLogDate === selectedDate;
        })
        : logs;

    console.log("filteredLogs:", filteredLogs);
    console.log("selectedDate:", selectedDate);
    console.log("logList:", logs);

    return (
        <div style={{ padding: "20px", fontFamily: "sans-serif" }}>
            <style>
                {`
    * {
        box-sizing: border-box;
        margin: 0;
        padding: 0;
    }
    textarea {
    font-size: 16px;
    padding: 12px;
    border-radius: 6px;
    box-shadow: 0 0 3px rgba(0,0,0,0.1);
    width: 100%;
    margin-bottom: 12px;
    }

    button {
    font-size: 16px;
    padding: 10px 16px;
    margin-bottom: 8px;
    border-radius: 6px;
    min-height: 44px;
    }

    @media (max-width: 600px) {
    .calendar {
        font-size: 14px;
    }
    }

    @media (prefers-color-scheme: dark) {
    body {
        background-color: #121212;
        color: #eeeeee;
    }

    textarea,
    button {
        background-color: #1e1e1e;
        color: #f0f0f0;
        border: 1px solid #444;
    }

    .calendar {
        background-color: #1e1e1e;
        color: #fff;
    }

    .calendar abbr {
        color: #f0f0f0;
    }

    div {
        background-color: #1a1a1a;
    }

    .log-entry {
        background-color: #1e1e1e !important;
        color: #f0f0f0;
        border: 1px solid #444;
    }

    label {
        color: #f0f0f0;
    }

    button:hover {
        opacity: 0.85;
        transition: 0.2s;
    }
    }
`}
            </style>
            <p style={{
                fontSize: "1.5rem",
                fontWeight: "bold",
                marginBottom: "1rem",
                textAlign: "center",
            }}>
                {theme.message}
            </p>
            <h1
                style={{
                    fontSize: "2rem",
                    marginBottom: "0.5rem",
                    textAlign: "center",
                }}
            >体調記録アプリ</h1>
            <p style={{
                fontSize: "1rem",
                fontStyle: "italic",
                color: fontColor,
                textAlign: "center",
                marginBottom: "2rem",
            }}>{todayMessage}</p>

            {/* ✅ カレンダーをここに追加 */}
            <div style={{ marginBottom: "20px" }}>
                <Calendar
                    className="calendar"
                    onChange={(value) => handleDateChange(value as CalendarValue)}
                    value={selectedDate ? new Date(selectedDate) : null}
                />
            </div>

            <HealthLogList
                logs={filteredLogs}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onCopyMarkdown={(log) => {
                    const markdown = formatToMarkdown(log);
                    navigator.clipboard.writeText(markdown);
                    alert("Markdownをコピーしました！");
                }}
                isEditing={isEditing}
            />

            {editTarget && (
                <div>
                    編集モード：{editTarget.date} / {editTarget.time} の記録を編集中
                </div>
            )}

            <HealthLogForm
                memo={memo}
                meds={meds}
                pollenLevel={pollenLevel}
                onMemoChange={(e) => setMemo(e.target.value)}
                onMedsChange={handleMedsChange}
                onPollenLevelChange={(e) => setPollenLevel(e.target.value as PollenLevel)}
                onSave={handleSave}
                onCancel={handleCancel}
                editTargetId={editTarget ? editTarget.id : null}
                isSaving={isSaving} // 🔸 追加
            />
            <button
                onClick={copyAllLogsMarkdown}
                style={{
                    marginBottom: "10px",
                    backgroundColor: "#6c757d",
                    color: "white",
                    border: "none",
                    padding: "8px 12px",
                    borderRadius: "4px",
                    cursor: "pointer",
                }}
            >
                すべての記録をMarkdownでコピー
            </button>

            <hr />

            {/* ログ表示 */}
            <h3>過去の記録一覧</h3>
            {pastLogs.length > 0 ? (
                pastLogs.map((log) => (
                    <div key={log.id}>
                        <p>{log.date} / {log.time}</p>
                        <p>・アサコール: {log.meds.asacol ? "✔️" : "❌"} / クリアミン: {log.meds.clearmin ? "✔️" : "❌"} / エビオス: {log.meds.ebios ? "✔️" : "❌"}</p>
                        <p>花粉レベル: {log.pollenLevel || "未入力"}</p>
                        <p>{log.memo}</p>
                        <button onClick={() => handleEdit(log.id)}>編集</button>
                        <button onClick={() => handleDelete(log.id)}>削除</button>
                    </div>
                ))
            ) : (
                <p>まだ記録はありません。</p>
            )}
        </div>
    )
};

export default HealthLogApp;