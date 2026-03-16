import { useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "./firebase";
import { User } from "firebase/auth";
import HealthLogApp from "./components/HealthLogApp";
import Settings from "./components/Settings";
import Login from "./Login";
import { getSeason } from "./lib/getSeason";
import { seasonThemes } from "./lib/theme";
import { LanguageProvider, useLanguage } from "./contexts/LanguageContext";
import { Lang } from "./i18n";
import { subscribeMasterMeds } from "./features/meds/services/masterMeds";

type View = "main" | "settings";

const AppContent = () => {
  const season = getSeason();
  const theme = seasonThemes[season];
  const { t, lang, setLang } = useLanguage();

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

  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [view, setView] = useState<View>("main");
  const [masterMeds, setMasterMeds] = useState<string[]>([]);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setIsLoading(false);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!user) {
      setMasterMeds([]);
      return;
    }
    const unsubscribe = subscribeMasterMeds(user.uid, setMasterMeds);
    return () => unsubscribe();
  }, [user]);

  if (isLoading) {
    return <div style={{ padding: "2rem", textAlign: "center" }}>{t.loading}</div>;
  }

  const today = new Date().toLocaleDateString(
    lang === "ja" ? "ja-JP" : "en-US",
  );

  const langButtons: { label: string; value: Lang }[] = [
    { label: "日本語", value: "ja" },
    { label: "EN", value: "en" },
    { label: "FIL", value: "fil" },
  ];

  return (
    <div
      style={{
        background: theme.background,
        color: fontColor,
        minHeight: "100vh",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "8px 16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "8px",
          backgroundColor: "rgba(0,0,0,0.25)",
        }}
      >
        {/* Language switcher */}
        <div style={{ display: "flex", gap: "4px" }}>
          {langButtons.map(({ label, value }) => (
            <button
              key={value}
              onClick={() => setLang(value)}
              style={{
                padding: "4px 10px",
                borderRadius: "4px",
                border: "1px solid rgba(255,255,255,0.5)",
                backgroundColor:
                  lang === value ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.2)",
                color: lang === value ? "#333" : "#fff",
                cursor: "pointer",
                fontSize: "13px",
                fontWeight: lang === value ? "bold" : "normal",
              }}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Right side: logout + date */}
        {user && (
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <span style={{ fontSize: "13px", color: "#fff" }}>
              {t.today}: {today}
            </span>
            <button
              onClick={() => signOut(auth)}
              style={{
                padding: "4px 12px",
                borderRadius: "4px",
                border: "1px solid rgba(255,255,255,0.5)",
                backgroundColor: "rgba(255,255,255,0.2)",
                color: "#fff",
                cursor: "pointer",
                fontSize: "13px",
              }}
            >
              {t.logout}
            </button>
          </div>
        )}
      </div>

      {/* Seasonal message */}
      <p
        style={{
          fontSize: "1.1rem",
          fontWeight: "bold",
          color: fontColor,
          textAlign: "center",
          textShadow: "0 0 4px rgba(0,0,0,0.5)",
          padding: "8px 16px 0",
        }}
      >
        {theme.message}
      </p>

      {!user ? (
        <Login />
      ) : (
        <>
          {/* Nav tabs */}
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: "8px",
              padding: "12px 16px",
            }}
          >
            {(["main", "settings"] as View[]).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                style={{
                  padding: "8px 24px",
                  borderRadius: "20px",
                  border: "none",
                  cursor: "pointer",
                  fontWeight: view === v ? "bold" : "normal",
                  backgroundColor:
                    view === v ? "#1976d2" : "rgba(255,255,255,0.3)",
                  color: view === v ? "#fff" : fontColor,
                  fontSize: "15px",
                }}
              >
                {v === "main" ? t.healthLog : t.settings}
              </button>
            ))}
          </div>

          {view === "main" ? (
            <HealthLogApp uid={user.uid} masterMeds={masterMeds} />
          ) : (
            <Settings uid={user.uid} masterMeds={masterMeds} />
          )}
        </>
      )}
    </div>
  );
};

const App = () => (
  <LanguageProvider>
    <AppContent />
  </LanguageProvider>
);

export default App;
