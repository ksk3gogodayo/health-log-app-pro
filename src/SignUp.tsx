// src/SignUp.tsx

import { useState } from "react";
import { getSeason } from "./lib/getSeason";

type Props = {
  setShowLogin: () => void;
};

const season = getSeason();
const seasonIconMap = {
  spring: "🌸",
  summer: "☀️",
  autumn: "🍁",
  winter: "❄️",
} as const;
const seasonIcon = seasonIconMap[season];

const SignUp = ({ setShowLogin }: Props) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    // ユーザー登録処理（略）
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "1rem",
      }}
    >
      {/* 🌸 新しく始める（フォームの外） */}
      <p
        style={{
          fontSize: "1.25rem",
          fontWeight: "bold",
          textAlign: "center",
          textShadow: "0 0 8px rgba(0,0,0,0.5)",
          marginBottom: "1rem",
          color: "#fff",
        }}
      >
        {seasonIcon} 新しく始める
      </p>

      {/* フォーム本体 */}
      <form
        onSubmit={handleSignUp}
        style={{
          backgroundColor: "rgba(255, 255, 255, 0.9)",
          padding: "2rem",
          borderRadius: "12px",
          boxShadow: "0 4px 10px rgba(0, 0, 0, 0.2)",
          color: "#000",
          minWidth: "280px",
          width: "90%",
          maxWidth: "360px",
        }}
      >
        {/* ← h2「新規登録」は削除済み */}

        <input
          type="email"
          placeholder="メールアドレス"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{ width: "100%", marginBottom: "0.5rem", padding: "0.5rem" }}
        />
        <input
          type="password"
          placeholder="パスワード"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={{ width: "100%", marginBottom: "0.5rem", padding: "0.5rem" }}
        />
        <button type="submit" style={{ width: "100%", padding: "0.5rem" }}>
          登録
        </button>
      </form>

      {/* ログインへ戻る：下にゆったり配置 */}
      <div style={{ marginTop: "1rem", textAlign: "center" }}>
        {/* <p
          style={{
            marginBottom: "0.5rem",
            color: "#fff",
            textShadow: "0 0 6px rgba(0,0,0,0.5)",
            fontSize: "0.95rem",
          }}
        >
          すでにアカウントをお持ちの方は
        </p>
        <button
          type="button"
          onClick={setShowLogin}
          style={{
            backgroundColor: "#ffffffdd",
            border: "none",
            padding: "0.5rem 1rem",
            borderRadius: "8px",
            color: "#0077cc",
            fontWeight: "bold",
            cursor: "pointer",
            boxShadow: "0 2px 6px rgba(0, 0, 0, 0.2)",
          }}
        >
          ログインへ戻る
        </button> */}
      </div>
    </div>
  );
};

export default SignUp;