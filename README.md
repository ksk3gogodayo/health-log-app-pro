# Health Log App Pro 🩺🌸

[![Vercel](https://vercelbadge.vercel.app/api/ksk3gogodayo/health-log-app-pro)](https://health-log-app-pro.vercel.app)

個人の健康・体調記録を効率よく記録・振り返りできる Web アプリです。  
React + Firebase（Firestore / Auth）を用い、プロジェクト構成を分離・最適化しました。

## 🎯 設計意図（Why & What）

- **課題背景**  
  潰瘍性大腸炎 (UC) の再燃サインを見逃さないよう、  
  服薬・体調・ストレス要因を **"3タップ" で記録 → カレンダーで振り返り** できるツールが欲しかった。
- **ターゲット**  
  _自分_ ＋ 同じ慢性疾患を抱える家族・仲間、そして主治医との情報共有。
- **ゴール**
  1. 記録コストを徹底的に下げて "毎日続く" UI/UX
  2. ログを **Firestore** に集約し、多デバイスでシームレス閲覧
  3. データポータビリティ確保（CSV Export 検討中）

---

## 🛠 技術選択（How）

| 階層 / 機能    | 採用技術                                 | 選定理由                                  |
| -------------- | ---------------------------------------- | ----------------------------------------- |
| Frontend       | **React 19 + CRA**                       | 安定した構成・TypeScript対応              |
| 状態管理       | React Hooks（`useState` / `useReducer`） | 小〜中規模で十分・学習コスト低            |
| UI             | CSS Modules                              | 既存 CSS を活かしつつ保守性を確保         |
| Authentication | **Firebase Auth**                        | Google / メール / ゲストログイン対応      |
| Database       | **Firestore**                            | スキーマレスで POC 最速、リアルタイム購読 |
| Hosting / CI   | **Vercel**                               | GitHub push → 自動デプロイ                |
| テスト (予定)  | Playwright                               | E2E で回帰バグ検知                        |

---

## 📚 学び・詰まったこと（Learnings）

1. **`useState` Lazy 初期化**  
   – 読み込み時の不要フェッチを 0 にして TTI 改善
2. **Timezone 問題**  
   – UTC 保管で JST が 1 日ズレ → `toLocaleDateString('ja-JP')` で解決
3. **初 PR → レビュー → マージ 完走**  
   – `feature/markdown-export` ブランチで PR デビュー、GitHub Flow を体感
4. **型分離 (`LogItem` vs `NewLogItem`)**  
   – Firestore 書き込み専用型を分け、`Omit<...,'id'>` の地獄を回避
5. **CRA と Vite の環境変数の違い**  
   – `VITE_` → `REACT_APP_` へ統一、`.env` 管理を整理
6. **Firebase Authorized domains の設定**  
   – Vercel デプロイ後に `auth/unauthorized-domain` エラー → Firebase Console で解決

### 今後の TODO

- [ ] Playwright で Happy-path E2E テスト
- [ ] ページネーション + 無限スクロール
- [ ] ダークモード + Lottie アニメ実装
- [ ] CSV Export → 医師への共有をワンクリック化

---

## 📁 構成の特徴

- `features/meds`：薬のCRUD操作（types / services / hooks に分離）
- `hooks/`：カスタムフックでロジックを再利用可能に
- `components/`：フォーム・リスト表示を分離
- `lib/firebase.ts`：初期化設定を共通管理

---

## 📝 機能（実装済み）

- 3タップで体調 + 服薬を記録
- カレンダーで日別ログを閲覧
- マルチデバイス対応 (Responsive)
- **Firebase Auth（Google / メール / ゲストログイン）✅**
- **ユーザーIDでFirestoreデータを分離 ✅**
- ログの編集・削除
- Markdown形式でのログエクスポート

👉 **詳細仕様はこちら** → [docs/FUNCTIONS.md](docs/FUNCTIONS.md)

---

## 🔗 デプロイURL

[https://health-log-app-pro.vercel.app](https://health-log-app-pro.vercel.app)

## 🚀 ローカルでの実行手順

```bash
git clone https://github.com/ksk3gogodayo/health-log-app-pro.git
cd health-log-app-pro
npm install
npm run start
```

※ `.env` に Firebase の環境変数を設定してください。

---

## 🙌 補足

このアプリは、React / TypeScript / Firebase を学習しながら「実務構成」を意識して設計したポートフォリオです。  
実生活の課題をもとに開発し、認証・Firestore設計・カスタムフックによるロジック分離など、実務で使われる技術を意識しています。

📣 ご意見・レビュー大歓迎です！

---

## 🖼 操作画面ギャラリー

▶️ [docs/README_IMAGES.md](./docs/README_IMAGES.md)
