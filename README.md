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

---

# Health Log App Pro 🩺🗒️

A personal health tracking app built with **React**, **TypeScript**, and **Firebase**.

## 📦 Features

- ✅ Daily symptom and medication logging  
- 📅 Calendar-based view for reviewing past logs  
- ☁️ Data persistence with Firestore  
- 🔒 Secure login with Firebase Auth  
- 📱 Responsive UI for mobile use

## 🧠 Motivation

This app was created to **track physical symptoms and medication** during chronic illness recovery.  
It helped me understand patterns and communicate more clearly with my doctor.

## 🛠️ Tech Stack

- React / TypeScript  
- Firebase (Auth, Firestore)  
- Vite  
- Zustand / React Hook Form  
- Tailwind CSS  

## 🚀 Getting Started

```bash
git clone https://github.com/ksk3gogodayo/health-log-app-pro.git
cd health-log-app-pro
npm install
npm run dev
