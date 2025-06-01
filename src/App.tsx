import { useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "./firebase";
import { User } from "firebase/auth";
import HealthLogApp from "./components/HealthLogApp";
import Login from "./Login";
// import SignUp from "./SignUp"; // 新しく追加されたインポート
import { getSeason } from "./lib/getSeason";
import { seasonThemes } from "./lib/theme";

const App = () => {
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

  const [user, setUser] = useState<User | null>(null);

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setIsLoading(false);
    });
    return () => unsub();
  }, []);

  if (isLoading) {
    return <div>読み込み中...</div>;
  }

  const today = new Date().toLocaleDateString("ja-JP");

  return (
    <div
      style={{
        background: theme.background,       // ←ここ変更点！
        color: fontColor,
        minHeight: "100vh",
        padding: "1rem",
        backgroundSize: "cover",            // 背景画像表示のために追加
        backgroundPosition: "center",
      }}
    >
      {!user ? (
        <>
          <Login />
        </>
      ) : (
        <>
          <p style={{
            fontSize: "1.2rem",
            fontWeight: "bold",
            color: fontColor, // ✅ カンマ追加
            textAlign: "center",
            textShadow: "0 0 4px rgba(0,0,0,0.5)"
          }}>            {theme.message}
          </p>
          <div style={{ display: "flex", alignItems: "center", gap: "20px", fontSize: "14px", color: "#666" }}>
          <button onClick={() => signOut(auth)}>ログアウト</button>
          </div>
          <div>今日の日付: {today}</div>
          <HealthLogApp />
        </>
      )}
    </div>
  );
};

export default App;