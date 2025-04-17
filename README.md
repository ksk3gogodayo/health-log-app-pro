# Health Log App

## 🩺 アプリ概要

「Health Log App」は、毎日の体調・服薬・花粉レベルなどを記録し、  
Markdown形式での振り返りや共有ができるシンプルなログアプリです。  
自分の体調の変化を可視化し、再燃や不調を早期に察知することを目的としています。

## 🚀 アプリURL（Vercel）

▶️ [https://health-log-app.vercel.app](https://health-log-app.vercel.app)

## 🔧 セットアップ手順

```bash
git clone https://github.com/ksk3gogodayo/health-log-app.git
cd health-log-app
npm install

.env ファイルをルートディレクトリに作成し、Firebaseの設定値を記述してください：
REACT_APP_FIREBASE_API_KEY=...
REACT_APP_FIREBASE_AUTH_DOMAIN=...
REACT_APP_FIREBASE_PROJECT_ID=...
REACT_APP_FIREBASE_STORAGE_BUCKET=...
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=...
REACT_APP_FIREBASE_APP_ID=...

起動：
npm start

🛠 使用技術
	•	React（Create React App）
	•	TypeScript
	•	Firebase Firestore
	•	Vercel（ホスティング）
	•	React Calendar
	•	Markdown変換（手動生成）

📝 機能一覧（今後追記）
	•	日付ごとの体調メモ入力
	•	薬チェック機能（アサコール・クリアミン・エビオス）
	•	花粉レベル入力
	•	Firestore保存・取得・更新・削除
	•	Markdownでコピー機能
	•	モバイル対応（iOS調整含む）

⸻

🙋‍♂️ 作者

けい（@ksk3gogodayo）

⸻
