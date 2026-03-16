import React, { useState, useEffect } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { getSeason, seasonThemes } from "../lib/theme";
import HealthLogForm from "../components/healthLog/HealthLogForm";
import HealthLogList from "../components/healthLog/HealthLogList";
import { LogItem, NewLogItem, Meds, PollenLevel } from "../types";
import { useHealthLogs } from "../hooks/useHealthLogs";
import { saveNewHealthLog } from "../features/healthLog/services/saveNewHealthLog";
import { useLanguage } from "../contexts/LanguageContext";

const motivationMessages = [
  "🌿 今日もおつかれさま",
  "😊 記録しててえらいね",
  "🍵 無理せんと、ゆるっといこう",
  "🌸 深呼吸、忘れてない？",
  "💪 小さな一歩でも前進やで",
  "☁️ 曇ってても、心は晴れるよ",
];

type Props = {
  uid: string;
  masterMeds: string[];
};

type CalendarValue = Date | [Date, Date] | null;

const HealthLogApp: React.FC<Props> = ({ uid, masterMeds }) => {
  const { t } = useLanguage();
  const season = getSeason();
  const theme = seasonThemes[season];

  const [mode, setMode] = useState<"light" | "dark">("light");
  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const listener = (e: MediaQueryListEvent) =>
      setMode(e.matches ? "dark" : "light");
    setMode(mq.matches ? "dark" : "light");
    mq.addEventListener("change", listener);
    return () => mq.removeEventListener("change", listener);
  }, []);

  const fontColor = mode === "dark" ? theme.darkColor : theme.lightColor;

  const [memo, setMemo] = useState<string>("");
  const [meds, setMeds] = useState<Meds>({
    asacol: false,
    clearmin: false,
    ebios: false,
  });
  const [customMedsCheck, setCustomMedsCheck] = useState<Record<string, boolean>>({});
  const [pollenLevel, setPollenLevel] = useState<PollenLevel | "">("");
  const [todayMessage, setTodayMessage] = useState("");
  const [editTarget, setEditTarget] = useState<LogItem | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [openLogId, setOpenLogId] = useState<string | null>(null);

  const { logs, deleteLog, updateLog } = useHealthLogs(uid);

  useEffect(() => {
    const idx = Math.floor(Math.random() * motivationMessages.length);
    setTodayMessage(motivationMessages[idx]);
  }, []);

  const padDate = (date: string): string => {
    if (!date || date.trim() === "") return "日付未設定";
    const parts = date.split(/[-/]/);
    const year = parts[0]?.padStart(4, "0") || "0000";
    const month = parts[1]?.padStart(2, "0") || "00";
    const day = parts[2]?.padStart(2, "0") || "00";
    return `${year}-${month}-${day}`;
  };

  const handleDateChange = (value: Date | Date[] | null) => {
    const date = Array.isArray(value) ? value[0] : value;
    if (date instanceof Date) {
      const y = date.getFullYear();
      const m = String(date.getMonth() + 1).padStart(2, "0");
      const d = String(date.getDate()).padStart(2, "0");
      setSelectedDate(`${y}-${m}-${d}`);
    } else {
      setSelectedDate(null);
    }
  };

  const handleMedsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setMeds((prev) => ({ ...prev, [name]: checked }));
  };

  const handleCustomMedsChange = (name: string, checked: boolean) => {
    setCustomMedsCheck((prev) => ({ ...prev, [name]: checked }));
  };

  const handleEdit = (id: string) => {
    const log = logs.find((l) => l.id === id);
    if (log) {
      setEditTarget(log);
      setMemo(log.memo);
      setMeds(log.meds);
      setPollenLevel(log.pollenLevel);
      setCustomMedsCheck(log.customMedsCheck || {});
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    const now = new Date();
    const formattedDate = selectedDate
      ? padDate(selectedDate)
      : now.toISOString().split("T")[0];

    const commonData = {
      memo,
      meds,
      pollenLevel,
      date: formattedDate,
      time: now.toLocaleTimeString(),
      uid,
      customMedsCheck,
    };

    try {
      if (editTarget) {
        const updatedLog: LogItem = { ...editTarget, ...commonData };
        await updateLog(updatedLog);
        alert(t.editComplete);
        setEditTarget(null);
      } else {
        const newLog: NewLogItem = { ...commonData };
        await saveNewHealthLog(newLog);
        alert(t.saved);
      }
    } catch (error) {
      console.error("Firestore保存エラー:", error);
    } finally {
      setIsSaving(false);
    }

    setMemo("");
    setMeds({ asacol: false, clearmin: false, ebios: false });
    setPollenLevel("");
    setCustomMedsCheck({});
  };

  const handleCancel = () => {
    setMemo("");
    setMeds({ asacol: false, clearmin: false, ebios: false });
    setPollenLevel("");
    setCustomMedsCheck({});
    setEditTarget(null);
  };

  const handleDelete = async (id: string) => {
    const log = logs.find((l) => l.id === id);
    if (!log) return;
    if (!window.confirm(t.deleteLogConfirm)) return;
    try {
      await deleteLog(id);
    } catch (error) {
      console.error("削除失敗:", error);
      alert(t.deleteFailed);
    }
  };

  const formatToMarkdown = (log: LogItem & { pollenLevel: PollenLevel | "" }) => {
    return `## ${log.date}｜${t.healthLog}\n\n- 🕒 ${log.time}\n- 📝 ${log.memo}\n- 💊 アサコール ${log.meds.asacol ? "✔️" : "❌"} / クリアミン ${log.meds.clearmin ? "✔️" : "❌"} / エビオス ${log.meds.ebios ? "✔️" : "❌"}\n- 🍃 花粉：${log.pollenLevel || "未入力"}\n`;
  };

  const copyAllLogsMarkdown = () => {
    if (logs.length === 0) {
      alert(t.noRecords);
      return;
    }
    const allMarkdown = logs.map(formatToMarkdown).join("\n---\n\n");
    navigator.clipboard.writeText(allMarkdown);
    alert(t.copiedAll);
  };

  const todayDate = new Date().toISOString().split("T")[0];
  const pastLogs = logs.filter((log) => {
    const fd = padDate(log.date);
    return fd !== "日付未設定" && fd < todayDate;
  });
  const filteredLogs = selectedDate
    ? logs.filter((log) => padDate(log.date) === selectedDate)
    : logs;

  const isEditing = (id: string) => editTarget?.id === id;

  return (
    <div style={{ padding: "20px", fontFamily: "sans-serif" }}>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        textarea { font-size: 16px; padding: 12px; border-radius: 6px; box-shadow: 0 0 3px rgba(0,0,0,0.1); width: 100%; margin-bottom: 12px; }
        button { font-size: 16px; padding: 10px 16px; margin-bottom: 8px; border-radius: 6px; min-height: 44px; }
        @media (max-width: 600px) { .calendar { font-size: 14px; } }
        @media (prefers-color-scheme: dark) {
          body { background-color: #121212; color: #eeeeee; }
          textarea, button { background-color: #1e1e1e; color: #f0f0f0; border: 1px solid #444; }
          .calendar { background-color: #1e1e1e; color: #fff; }
          .calendar abbr { color: #f0f0f0; }
          div { background-color: #1a1a1a; }
          .log-entry { background-color: #1e1e1e !important; color: #f0f0f0; border: 1px solid #444; }
          label { color: #f0f0f0; }
          button:hover { opacity: 0.85; transition: 0.2s; }
        }
      `}</style>

      <h1 style={{ fontSize: "2rem", marginBottom: "0.5rem", textAlign: "center" }}>
        {t.appTitle}
      </h1>
      <p
        style={{
          fontSize: "1rem",
          fontStyle: "italic",
          color: fontColor,
          textAlign: "center",
          marginBottom: "2rem",
        }}
      >
        {todayMessage}
      </p>

      {/* Calendar */}
      <div style={{ marginBottom: "20px" }}>
        <Calendar
          className="calendar"
          onChange={(value) => handleDateChange(value as CalendarValue)}
          value={selectedDate ? new Date(selectedDate) : null}
        />
      </div>

      {/* Log list (filtered by selected date) */}
      <HealthLogList
        logs={filteredLogs}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onCopyMarkdown={(log) => {
          const markdown = formatToMarkdown(log);
          navigator.clipboard.writeText(markdown);
          alert(t.copied);
        }}
        isEditing={isEditing}
      />

      {/* Edit mode indicator */}
      {editTarget && (
        <div
          style={{
            padding: "8px 12px",
            backgroundColor: "#fff3e0",
            borderRadius: "6px",
            marginBottom: "12px",
            color: "#e65100",
          }}
        >
          {t.editingRecord}: {editTarget.date} / {editTarget.time}
        </div>
      )}

      {/* Form */}
      <HealthLogForm
        memo={memo}
        meds={meds}
        pollenLevel={pollenLevel}
        customMedsCheck={customMedsCheck}
        masterMeds={masterMeds}
        onMemoChange={(e) => setMemo(e.target.value)}
        onMedsChange={handleMedsChange}
        onPollenLevelChange={(e) => setPollenLevel(e.target.value as PollenLevel)}
        onCustomMedsChange={handleCustomMedsChange}
        onSave={handleSave}
        onCancel={handleCancel}
        editTargetId={editTarget ? editTarget.id : null}
        isSaving={isSaving}
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
        {t.copyMarkdown}
      </button>

      <hr style={{ margin: "16px 0" }} />

      {/* Past logs */}
      <h3 style={{ marginBottom: "12px" }}>{t.pastLogs}</h3>
      {pastLogs.length === 0 ? (
        <p>{t.noLogs}</p>
      ) : (
        pastLogs.map((log) => {
          const isOpen = openLogId === log.id;
          return (
            <div
              key={log.id}
              className="log-entry"
              style={{
                marginBottom: "20px",
                padding: "12px",
                border: "1px solid #ccc",
                borderRadius: "8px",
                backgroundColor: "#f9f9f9",
              }}
            >
              <div
                onClick={() => setOpenLogId(isOpen ? null : log.id)}
                style={{ cursor: "pointer", fontWeight: "bold", fontSize: "16px" }}
              >
                {isOpen ? "▼" : "▶"} {log.date} / {log.time}
              </div>
              {isOpen && (
                <div style={{ marginTop: "8px" }}>
                  <p>
                    💊 アサコール: {log.meds.asacol ? "✔️" : "❌"} / クリアミン:{" "}
                    {log.meds.clearmin ? "✔️" : "❌"} / エビオス:{" "}
                    {log.meds.ebios ? "✔️" : "❌"}
                  </p>
                  <p>🍃 花粉: {log.pollenLevel || "未入力"}</p>
                  <p>📝 {log.memo}</p>
                  {log.customMedsCheck &&
                    Object.entries(log.customMedsCheck)
                      .filter(([, v]) => v)
                      .map(([name]) => (
                        <p key={name}>💊 {name}: ✔️</p>
                      ))}
                  <div style={{ marginTop: "8px" }}>
                    <button onClick={() => handleEdit(log.id)} style={{ marginRight: "8px" }}>
                      {t.edit}
                    </button>
                    <button onClick={() => handleDelete(log.id)}>{t.delete}</button>
                  </div>
                </div>
              )}
            </div>
          );
        })
      )}
    </div>
  );
};

export default HealthLogApp;
