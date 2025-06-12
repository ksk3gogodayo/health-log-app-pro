# Health Log App Pro 🩺🌸


個人の健康・体調記録を効率よく記録・振り返りできる Web アプリです。  
React + Firebase（Firestore / Auth）を用い、プロジェクト構成を分離・最適化しました。

## 🔧 使用技術・スタック

- **Frontend**: Vite + React + TypeScript
- **UI**: CSS Modules / Tailwind（必要に応じて）
- **状態管理**: useState, useEffect, カスタムフック（`useMeds`, `useHealthLogs` など）
- **Backend**: Firebase Firestore / Firebase Auth
- **Deployment**: Vercel

## 📁 構成の特徴

- `features/meds`：薬のCRUD操作（types / services / hooks に分離）
- `hooks/`：カスタムフックでロジックを再利用可能に
- `components/`：フォーム・リスト表示を分離
- `lib/firebase.ts`：初期化設定を共通管理

## 🚀 機能一覧

- Firebase Auth によるログイン / 新規登録
- 健康ログの記録（メモ＋薬のチェック）
- カレンダーUIでのログ閲覧
- Markdown出力対応（予定）
- モバイル対応済（レスポンシブ）

## 🔗 デプロイURL

[https://health-log-app-pro.vercel.app](https://health-log-app-pro.vercel.app)

## 📌 今後の予定

- ログの編集・削除機能
- ユーザーごとのデータ保存整理
- ダークモード対応

---

## 🙌 補足

このアプリは、React / TypeScript / Firebase を学習しながら「実務構成」を意識して設計したポートフォリオです。  
より現場に近い構成で、機能を拡張しやすく保守性を高めています。


📣 ご意見・レビュー大歓迎です！  
GitHub IssuesやPull Requestでの提案もお気軽にどうぞ。

