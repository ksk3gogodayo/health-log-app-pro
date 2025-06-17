# Health Log App Pro 🩺🌸

[![Vercel](https://vercelbadge.vercel.app/api/ksk3gogodayo/health-log-app-pro)](https://health-log-app-pro.vercel.app)

個人の健康・体調記録を効率よく記録・振り返りできる Web アプリです。  
React + Firebase（Firestore / Auth）を用い、プロジェクト構成を分離・最適化しました。

<!-- ===== 🎯 DESIGN INTENT ===== -->
## 🎯 設計意図（Why & What）

- **課題背景**  
  潰瘍性大腸炎 (UC) の再燃サインを見逃さないよう、  
  服薬・体調・ストレス要因を **“3タップ” で記録 → カレンダーで振り返り** できるツールが欲しかった。

- **ターゲット**  
  *自分* ＋ 同じ慢性疾患を抱える家族・仲間、そして主治医との情報共有。

- **ゴール**  
  1. 記録コストを徹底的に下げて “毎日続く” UI/UX  
  2. ログを **Firestore** に集約し、多デバイスでシームレス閲覧  
  3. データポータビリティ確保（Markdown / CSV Export 検討中）

---

<!-- ===== 🛠 TECH STACK ===== -->
## 🛠 技術選択（How）

| 階層 / 機能 | 採用技術 | 選定理由 |
| --- | --- | --- |
| Frontend | **React 18 + Vite** | 超高速 HMR とシンプル設定 |
| 状態管理 | React Hooks（`useState` / `useReducer`）| 小〜中規模で十分・学習コスト低 |
| UI | CSS Modules<br>Tailwind (一部) | 既存 CSS を活かしつつ、ユーティリティで速度アップ |
| Authentication | **Firebase Auth** | メールリンク式でパスレス、実装 5 分 |
| Database | **Firestore** | スキーマレスで POC 最速、リアルタイム購読 |
| Hosting / CI | **Vercel** | GitHub PR → Preview URL 自動生成でレビューフロー楽 |
| テスト (予定) | Playwright | E2E で回帰バグ検知 |
| 図管理 | Figma | 画面遷移図 / Arch 図共有 |

---

<!-- ===== 📚 LEARNINGS ===== -->
## 📚 学び・詰まったこと（Learnings）

1. **`useState` Lazy 初期化**  
   – 読み込み時の不要フェッチを 0 にして TTI 改善  
2. **Timezone 問題**  
   – UTC 保管で JST が 1 日ズレ → `toLocaleDateString('ja-JP')` で解決  
3. **初 PR → レビュー → マージ 完走**  
   – `feature/markdown-export` ブランチで PR デビュー、GitHub Flow を体感  
4. **README リッチ化**  
   – スクショを `docs/` に分離、バッジ追加でファーストインプレッション向上  
5. **型分離 (`LogItem` vs `NewLogItem`)**  
   – Firestore 書き込み専用型を分け、`Omit<...,'id'>` の地獄を回避

### 今後の TODO
- [ ] Playwright で Happy-path E2E テスト  
- [ ] `GET latest 10` のページネーション + 無限スクロール  
- [ ] Next.js 版を派生させて CSR / SSR 比較  
- [ ] ダークモード + Lottie アニメ実装  
- [ ] CSV / Markdown Export → 医師への共有をワンクリック化

---

## 📁 構成の特徴

- `features/meds`：薬のCRUD操作（types / services / hooks に分離）
- `hooks/`：カスタムフックでロジックを再利用可能に
- `components/`：フォーム・リスト表示を分離
- `lib/firebase.ts`：初期化設定を共通管理

---

## 📝 機能
- 3タップで体調 + 服薬を記録  
- カレンダーで日別ログを閲覧  
- マルチデバイス対応 (Responsive)
- Firebase Auth でログイン

👉 **詳細仕様はこちら** → [docs/FUNCTIONS.md](docs/FUNCTIONS.md)

## 🔗 デプロイURL

[https://health-log-app-pro.vercel.app](https://health-log-app-pro.vercel.app)

## 🚀 ローカルでの実行手順

以下の手順でローカル開発環境を立ち上げられます。

```bash
git clone https://github.com/ksk3gogodayo/health-log-app-pro.git
cd health-log-app-pro
npm install
npm run dev
```

※ Firebaseプロジェクトのセットアップが必要な場合があります。

## 📌 今後の予定

- ログの編集・削除機能
- ユーザーごとのデータ保存整理
- ダークモード対応

---

## 🙌 補足

このアプリは、React / TypeScript / Firebase を学習しながら「実務構成」を意識して設計したポートフォリオです。  
より現場に近い構成で、機能を拡張しやすく保守性を高めています。

## 🎯 開発の動機（日本語）

慢性症状の経過観察や、医師との相談に役立つよう  
自分で体調と服薬の記録をつけられるアプリを作成しました。  
継続的に使えるよう、UIと操作性を重視しています。

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

## 🚀 Getting Started

```bash
git clone https://github.com/ksk3gogodayo/health-log-app-pro.git
cd health-log-app-pro
npm install
npm run dev
```

---

## 🖼 操作画面ギャラリー（スクリーンショット）

アプリの操作イメージをまとめています。  
スマホ／PC両方の画面をご覧いただけます👇

▶️ [docs/README_IMAGES.md](./docs/README_IMAGES.md)
