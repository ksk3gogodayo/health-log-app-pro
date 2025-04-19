import { useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "./firebase";
import { User } from "firebase/auth";
import HealthLogApp from "./components/HealthLogApp";
import Login from "./Login";
import SignUp from "./SignUp"; // 新しく追加されたインポート
import { getSeason } from "./lib/getSeason";
import { seasonThemes } from "./lib/theme";

const season = getSeason();
const theme = seasonThemes[season];

const App = () => {
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

  return (
    <div
      style={{
        background: theme.background,       // ←ここ変更点！
        color: theme.color,                 // ←ここもcolorに合わせる！
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
          {/* <p style={{ fontSize: "1.2rem", fontWeight: "bold" }}>
            {theme.message}
          </p> */}
          <button onClick={() => signOut(auth)}>ログアウト</button>
          <HealthLogApp />
        </>
      )}
    </div>
  );
};

export default App;