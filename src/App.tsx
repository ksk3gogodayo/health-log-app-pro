import { useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "./firebase";

import HealthLogApp from "./components/HealthLogApp.tsx";
import Login from "./Login.tsx";
import SignUp from "./SignUp.tsx"; // 新しく追加されたインポート

const App = () => {
  const [user, setUser] = useState(null);
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
    <div>
      {!user ? (
        <>
          <Login />
          <SignUp /> {/* 新規登録コンポーネントを追加 */}
        </>
      ) : (
        <>
          <button onClick={() => signOut(auth)}>ログアウト</button>
          <HealthLogApp />
        </>
      )}
    </div>
  );
};

export default App;