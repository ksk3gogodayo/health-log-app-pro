import React, { useState, useEffect } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css"; // スタイル読み込み
import { fetchHealthLogs, saveHealthLog, deleteHealthLog, updateHealthLog } from "../lib/firestore";
import { auth } from "../firebase";
import { onAuthStateChanged, User } from "firebase/auth";
import { getSeason, seasonThemes } from "lib/theme";
type CalendarValue = Date | Date[] | null;
type Value = Date | Date[] | null;

// 花粉レベルの型
type PollenLevel = "弱" | "中" | "強";

// 薬チェック用の型
const messages = [
    "🌿 今日もおつかれさま",
    "😊 記録しててえらいね",
    "🍵 無理せんと、ゆるっといこう",
    "🌸 深呼吸、忘れてない？",
    "💪 小さな一歩でも前進やで",
    "☁️ 曇ってても、心は晴れるよ"
];
type Meds = {
    asacol: boolean;
    clearmin: boolean;
    ebios: boolean;
};

// 体調ログの型（1件分）
type LogItem = {
    id: string; // ← これ追加！（Firestore用ID）
    date: string;
    time: string;
    memo: string;
    meds: Meds;
    pollenLevel: PollenLevel | "";
    uid: string; // ← 追加！
};

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
    const [pollenLevel, setPollenLevel] = useState<PollenLevel | "">("");
    const [editIndex, setEditIndex] = useState<number | null>(null); // 👈 追加  
    const [logList, setLogList] = useState<LogItem[]>([]);
    const [todayMessage, setTodayMessage] = useState("");

    // 追加
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        const unsub = onAuthStateChanged(auth, (firebaseUser) => {
            setUser(firebaseUser);
            console.log("✅ ログイン中のユーザー:", firebaseUser?.email, "uid:", firebaseUser?.uid);
        });
        return () => unsub();
    }, []);

    useEffect(() => {
        const random = Math.floor(Math.random() * messages.length);
        setTodayMessage(messages[random]);
    }, []);

    // Firestoreからログ取得（初回だけ実行）
    useEffect(() => {
        const loadLogs = async () => {
            if (!user?.uid) return;
            const fetchedLogs = (await fetchHealthLogs(user.uid)) as LogItem[];
    
            const formattedLogs = fetchedLogs.map(log => {
                const formattedDate = padDate(log.date);
                console.log("変換前:", log.date, "変換後:", formattedDate);
                return {
                    ...log,
                    date: formattedDate,
                };
            });
    
            setLogList(formattedLogs);
        };
    
        loadLogs();
    }, [user]);


    // 日付ステートを追加
    const [selectedDate, setSelectedDate] = useState<string | null>(null);

    // 1件のログをMarkdown形式に変換
    const formatToMarkdown = (log: LogItem) => {
        return `## ${log.date}｜体調記録

- 🕒 ${log.time}
- 📝 ${log.memo}
- 💊 アサコール ${log.meds.asacol ? "✔️" : "❌"} / クリアミン ${log.meds.clearmin ? "✔️" : "❌"} / エビオス ${log.meds.ebios ? "✔️" : "❌"}
- 🍃 花粉レベル：${log.pollenLevel || "未入力"}
`;
    };

    // 全件ログをMarkdownでコピー
    const copyAllLogsMarkdown = () => {
        if (logList.length === 0) {
            alert("記録がありません");
            return;
        }
        const allMarkdown = logList.map(formatToMarkdown).join("\n---\n\n");
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

        console.log("🛠 editIndex:", editIndex);
        console.log("🛠 対象ログ:", logList[editIndex ?? -1]);
        const newLog: Omit<LogItem, "id"> = {
            date: now.toISOString().split("T")[0], // YYYY-MM-DD 形式
            time: now.toLocaleTimeString(),
            memo,
            meds,
            pollenLevel,
            uid: user?.uid || "",
        };

        if (editIndex !== null) {
            const editedLog = { ...newLog, id: logList[editIndex].id, uid: user?.uid || "" };

            setLogList((prev) => {
                const updated = [...prev];
                updated[editIndex] = editedLog;
                return updated;
            });
            setEditIndex(null);

            if (editedLog.id) {
                await updateHealthLog(editedLog.id, editedLog);
                const updatedLogs = await fetchHealthLogs(user?.uid || "");
                setLogList(updatedLogs as LogItem[]);
                alert("編集されました！");
                setEditTargetId(null);
            }
        } else {
            const id = await saveHealthLog(newLog); // ← id を受け取る
            if (id) {
                setLogList((prev) => [...prev, { ...newLog, id }]); // ← id付きで保存
                alert("記録されました！");
            }
        }

        setMemo("");
        setMeds({ asacol: false, clearmin: false, ebios: false });
        setPollenLevel("");

    };

    const [editTargetId, setEditTargetId] = useState<string | null>(null);

    // 編集中のログかどうかを判定するヘルパー関数を作る：
    const isEditing = (id: string) => {
        return id === editTargetId;
    };
    // 編集処理
    const handleEdit = (id: string) => {
        const log = logList.find((log) => log.id === id);
        if (log) {
            setMemo(log.memo);
            setMeds(log.meds);
            setPollenLevel(log.pollenLevel);
            setEditTargetId(log.id);  // `id` をセット
        }
        // // 編集完了またはキャンセル時に editTargetId を null にリセット：
        const handleSave = () => {
            // 保存処理
            setEditTargetId(null); // 編集終了
        };

        const handleCancel = () => {
            setEditTargetId(null); // 編集終了
        };
    };

    // handleSave 関数を定義して、以下のように編集保存と新規作成を分ける：
    // const handleSave = async () => {
    //     // console.log("🟡 handleSave 実行開始！");
    //     // const now = new Date();
    //     // const formattedDate = now.toISOString().split("T")[0];
    //     // const formattedTime = now.toLocaleTimeString();
    
    //     // const newLogData: Omit<LogItem, "id"> = {
    //     //     date: selectedDate || formattedDate,  // 選択日がある場合はそれを優先
    //     //     time: formattedTime,
    //     //     memo,
    //     //     meds,
    //     //     pollenLevel,
    //     //     uid: user?.uid || "",
    //     // };
    
    //     // console.log("新規ログデータ:", newLogData);

    //     if (!editTargetId) {
    //         console.log("新規作成モード");
            
    //         const newLog = {
    //             id: Date.now().toString(),
    //             memo,
    //             meds,
    //             pollenLevel,
    //             date: selectedDate || new Date().toISOString().split("T")[0],  // ✅ ここで `selectedDate` を優先
    //             time: new Date().toLocaleTimeString(),
    //             uid: user?.uid || "",
    //         };
        
    //         console.log("新規作成データ:", newLog);
        
    //         setLogList([...logList, newLog]);
        
    //         try {
    //             const id = await saveHealthLog(newLog);
    //             console.log("Firestore 新規保存完了:", id);
    //             alert("記録されました！");
    //         } catch (error) {
    //             console.error("🔥 Firestore保存エラー:", error);
    //         }
    //     }
    
    //     if (editTargetId) {
    //         console.log("編集モード");
    //         const updatedLogList = logList.map((log) => {
    //             if (log.id === editTargetId) {
    //                 console.log("更新対象:", log.id);
    //                 return {
    //                     ...log,
    //                     memo,
    //                     meds,
    //                     pollenLevel,
    //                 };
    //             }
    //             return log;
    //         });
    
    //         setLogList(updatedLogList);
    
    //         try {
    //             await updateHealthLog(editTargetId, {
    //                 ...newLogData,
    //                 time: new Date().toLocaleTimeString(), // 更新時刻を上書き
    //             });
    
    //             console.log("Firestore 更新完了");
    //             alert("編集されました！");
    //         } catch (error) {
    //             console.error("🔥 Firestore更新エラー:", error);
    //         }
    
    //     } else {
    //         console.log("新規作成モード");
    
    //         const newLog = {
    //             ...newLogData,
    //             id: Date.now().toString(),
    //         };
    
    //         setLogList([...logList, newLog]);
    
    //         try {
    //             const id = await saveHealthLog(newLog);
    //             console.log("Firestore 新規保存完了:", id);
    //             alert("記録されました！");
    //         } catch (error) {
    //             console.error("🔥 Firestore保存エラー:", error);
    //         }
    //     }

    //     console.log("editTargetId:", editTargetId);
    
    //     // 入力欄のリセット
    //     setMemo("");
    //     setMeds({ asacol: false, clearmin: false, ebios: false });
    //     setPollenLevel("");
    //     setEditTargetId(null);
    
    //     // 選択日付の保持
    //     if (selectedDate) {
    //         console.log("編集完了時の選択日付:", selectedDate);
    //         setSelectedDate(selectedDate); // これでリセットされないように保持
    //     } else {
    //         console.warn("選択日付が null のため保持されませんでした");
    //     }

    //     console.log("選択された日付:", selectedDate);
    // };

    const handleSave = async () => {
        console.log("🟡 handleSave 実行開始！");
        const now = new Date();
        const formattedDate = selectedDate ? padDate(selectedDate) : now.toISOString().split("T")[0];
        const formattedTime = now.toLocaleTimeString();
    
        // ✅ newLogData を定義しておく
        const newLogData = {
            memo,
            meds,
            pollenLevel,
            date: formattedDate,
            uid: user?.uid || "",
        };
    
        if (editTargetId) {
            console.log("編集モード");
    
            const updatedLogList = logList.map((log) => {
                if (log.id === editTargetId) {
                    console.log("更新対象:", log.id);
                    return {
                        ...log,
                        ...newLogData,
                        time: formattedTime,
                    };
                }
                return log;
            });
    
            setLogList(updatedLogList);
    
            try {
                await updateHealthLog(editTargetId, {
                    ...newLogData,
                    time: formattedTime, // 更新時刻を上書き
                });
    
                console.log("Firestore 更新完了");
                alert("編集されました！");
            } catch (error) {
                console.error("🔥 Firestore更新エラー:", error);
            }
    
        } else {
            console.log("新規作成モード");
    
            const newLog = {
                ...newLogData,
                id: Date.now().toString(),
                time: formattedTime,
            };
    
            console.log("新規作成データ:", newLog);
    
            setLogList([...logList, newLog]);
    
            try {
                const id = await saveHealthLog(newLog);
                console.log("Firestore 新規保存完了:", id);
                alert("記録されました！");
            } catch (error) {
                console.error("🔥 Firestore保存エラー:", error);
            }
        }
    
        // 入力欄のリセット
        setMemo("");
        setMeds({ asacol: false, clearmin: false, ebios: false });
        setPollenLevel("");
        setEditTargetId(null);
    
        // 選択日付の保持
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
        setEditTargetId(null);  // 編集終了
    };  

    const handleDelete = async (index: number) => {
        const log = logList[index];
        console.log("🧾 削除対象ログ:", log);
    
        if (!window.confirm("この記録を削除しますか？")) return;
    
        if (log.id) {
            console.log("🗑 Firestore削除実行:", log.id);
            console.log("🛠 削除対象のuid:", log.uid);
            console.log("🛠 現在のユーザーuid:", user?.uid);

            try {
                await deleteHealthLog(log.id);
                console.log("✅ Firestore削除成功:", log.id);
                alert("Firestoreから削除されました！");
                
                // ローカルのログリストも更新
                setLogList((prev) => prev.filter((_, i) => i !== index));
    
            } catch (error) {
                console.error("🔥 Firestore削除失敗:", error);
                alert("Firestoreの削除に失敗しました！");
            }
        } else {
            console.warn("❗ log.id が undefined なのでFirestore削除できない");
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
    
        const parts = date.split("-");
        const year = parts[0] || "----";
        const month = parts[1]?.padStart(2, "0") || "--";
        const day = parts[2]?.padStart(2, "0") || "--";
    
        const formattedDate = `${year}-${month}-${day}`;
        console.log("padDate 関数 - 変換後の日付:", formattedDate);
        return formattedDate;
    };

    const filteredLogs = selectedDate
        ? logList.filter((log) => {
            const formattedLogDate = padDate(log.date);
            console.log(`比較: ${formattedLogDate} === ${selectedDate} → ${formattedLogDate === selectedDate}`);
            return formattedLogDate === selectedDate;
        })
        : logList;

    console.log("filteredLogs:", filteredLogs);
        console.log("selectedDate:", selectedDate);
        console.log("logList:", logList);

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

            {filteredLogs.length > 0 ? (
                filteredLogs.map((log, index) => (
                    <div
                        key={index}
                        className="log-entry"
                        style={{
                            border: "1px solid #ccc",
                            borderRadius: "8px",
                            padding: "15px",
                            marginBottom: "15px",
                            backgroundColor: "#fff",
                            boxShadow: "0 2px 5px rgba(0,0,0,0.05)",
                        }}
                    >
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <strong>
                                {log.date} / {log.time}
                            </strong>
                            <div style={{
                                // 編集中のログには背景色 #ffeb3b（黄色）と、枠線色 #ff9800（オレンジ）を設定
                                padding: "10px",
                                marginBottom: "5px",
                                backgroundColor: isEditing(log.id) ? "#ffeb3b" : "#f0f0f0",
                                border: isEditing(log.id) ? "2px solid #ff9800" : "1px solid #ccc",
                                borderRadius: "4px",
                            }}>
                                <button
                                    onClick={() => handleEdit(log.id)}  // ← log.id を渡す
                                    style={{
                                        backgroundColor: "#007bff",
                                        color: "white",
                                        border: "none",
                                        padding: "5px 10px",
                                        borderRadius: "4px",
                                        cursor: "pointer",
                                    }}
                                >
                                    編集
                                </button>
                                <button
                                    onClick={() => handleDelete(index)}
                                    style={{
                                        backgroundColor: "#dc3545",
                                        color: "white",
                                        border: "none",
                                        padding: "5px 10px",
                                        borderRadius: "4px",
                                        cursor: "pointer",
                                    }}
                                >
                                    削除
                                </button>
                                <button
                                    onClick={() => {
                                        const markdown = formatToMarkdown(log);
                                        navigator.clipboard.writeText(markdown);
                                        alert("Markdownをコピーしました！");
                                    }}
                                    style={{
                                        backgroundColor: "#28a745",
                                        color: "white",
                                        border: "none",
                                        padding: "5px 10px",
                                        borderRadius: "4px",
                                        cursor: "pointer",
                                    }}
                                >
                                    Markdownコピー
                                </button>
                            </div>
                        </div>

                        <p>{log.memo}</p>
                        <ul>
                            <li>アサコール: {log.meds.asacol ? "✔️" : "❌"}</li>
                            <li>クリアミン: {log.meds.clearmin ? "✔️" : "❌"}</li>
                            <li>エビオス: {log.meds.ebios ? "✔️" : "❌"}</li>
                            <li>花粉レベル: {log.pollenLevel || "未入力"}</li>
                        </ul>
                    </div>
                ))
            ) : (
                <p>まだ記録はありません。</p>
            )}

            {editIndex !== null && (
                <div style={{ marginBottom: "10px", color: "green" }}>
                    編集モード：{logList[editIndex].date} / {logList[editIndex].time} の記録を編集中
                </div>
            )}

            {/* 体調メモ */}
            <textarea
                rows={3}
                placeholder="今日の体調をひとことで..."
                value={memo}
                onChange={(e) => setMemo(e.target.value)}
                style={{ marginBottom: "0px" }}
            />

            {/* 薬チェック */}
            <div style={{ marginTop: "10px" }}>
                <label>
                    <input
                        type="checkbox"
                        name="asacol"
                        checked={meds.asacol}
                        onChange={handleMedsChange}
                    />
                    アサコール
                </label>
                <label>
                    <input
                        type="checkbox"
                        name="clearmin"
                        checked={meds.clearmin}
                        onChange={handleMedsChange}
                    />
                    クリアミン
                </label>
                <label>
                    <input
                        type="checkbox"
                        name="ebios"
                        checked={meds.ebios}
                        onChange={handleMedsChange}
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
                        onChange={(e) => setPollenLevel(e.target.value as PollenLevel)}
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
                        <button onClick={handleSave} style={buttonStyle}>保存</button>
                        <button onClick={handleCancel} style={buttonStyle}>キャンセル</button>
                    </>
                ) : (
                    <button onClick={handleSave} style={buttonStyle}>新規作成</button>
                )}
            </div>
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
            {logList.length > 0 ? (

                <p>まだ記録はありません。</p>
            ) : null}
        </div>
    );
};

export default HealthLogApp;
