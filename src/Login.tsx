// src/Login.tsx
import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "./firebase";
import SignUp from "./SignUp.tsx";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showSignUp, setShowSignUp] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      setError("ログインに失敗しました！");
    }
  };

  if (showSignUp) {
    return (
      <div style={{ padding: "20px" }}>
        <SignUp setShowLogin={() => setShowSignUp(false)} />
        <p>
          すでにアカウントをお持ちの方は{" "}
          <button onClick={() => setShowSignUp(false)}>ログインへ戻る</button>
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleLogin} style={{ padding: "20px" }}>
      <h2>ログイン</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <input
        type="email"
        placeholder="メールアドレス"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <br />
      <input
        type="password"
        placeholder="パスワード"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      <br />
      <button type="submit">ログイン</button>
      <p style={{ marginTop: "10px" }}>
        アカウントをお持ちでない方は{" "}
        <button type="button" onClick={() => setShowSignUp(true)}>
          新規登録
        </button>
      </p>
    </form>
  );
};

export default Login;