import { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "./firebase";

const SignUp = ({ setShowLogin }: { setShowLogin: (show: boolean) => void }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSignUp = async () => {
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      alert("新規登録に成功しました！");
    } catch (error: any) {
      alert("新規登録に失敗しました：" + error.message);
    }
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        handleSignUp();
      }}
      style={{ padding: 20, marginTop: 20 }}
    >
      <h2>新規登録</h2>
      <input
        type="email"
        placeholder="メールアドレス"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <br />
      <input
        type="password"
        placeholder="パスワード"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <br />
      <button onClick={handleSignUp}>登録</button>
      <br />
      <button type="button" onClick={() => setShowLogin(true)}>
        ログイン画面に戻る
      </button>
    </form>
  );
};

export default SignUp;