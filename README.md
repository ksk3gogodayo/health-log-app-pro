# Health Log App Pro

[![Vercel](https://vercelbadge.vercel.app/api/ksk3gogodayo/health-log-app-pro)](https://health-log-app-pro.vercel.app)

慢性疾患の服薬・体調を毎日継続して記録するための Web アプリ。
React / TypeScript / Firebase で構築し、Vercel にデプロイ済み。

---

## デモ

**[https://health-log-app-pro.vercel.app](https://health-log-app-pro.vercel.app)**

> Google アカウントまたはゲストログインで即お試しいただけます。

---

## 技術スタック

| 領域 | 技術 |
|------|------|
| Frontend | React 19 / TypeScript |
| 認証 | Firebase Authentication |
| DB | Firebase Firestore |
| ホスティング / CI | Vercel（GitHub push → 自動デプロイ） |

---

## 機能一覧

- **Google ログイン・メール認証・ゲストログイン**
- **体調・服薬の記録**（メモ・薬チェック・花粉レベルを 3 タップで入力）
- **カレンダーで日別ログを閲覧**（日付選択でフィルタリング）
- **薬マスターデータ管理**（カスタム薬の追加・削除、設定画面から管理）
- **多言語対応**（日本語 / English / Filipino を切り替え、localStorage で永続化）
- **Markdown 形式でのログエクスポート**（1 件 / 全件コピー）
- ログの編集・削除

---

## 設計上の工夫

### Firestore のユーザーごとのデータ分離

全ログに `uid` フィールドを持たせ、クエリ側で `where("uid", "==", uid)` により他ユーザーのデータを取得しないように設計。Firebase Security Rules とあわせて、ユーザー間のデータ分離を担保しています。

### マスターデータと実績データの分離

カスタム薬の定義は `users/{uid}/masterData/meds` に保存し、各ログの服薬チェック結果は `healthLogs` コレクションの `customMedsCheck` フィールドに独立して保存。薬の追加・削除が過去ログに影響しない設計にしています。

### Firebase Auth の複数ログイン方式対応

Google OAuth・メール/パスワード・ゲストログインの 3 方式に対応。ゲストでも主要機能をそのまま試せるよう設計し、デモ時の摩擦を最小化しています。

---

## 今後の予定

- [ ] QR コード共有機能（医師・薬局へワンタップで記録を共有）
- [ ] CSV エクスポート（Excel での集計・持参に対応）

---

## ローカル実行

```bash
git clone https://github.com/ksk3gogodayo/health-log-app-pro.git
cd health-log-app-pro
npm install
npm start
```

`.env.local` に Firebase の設定値を記載してください（`.env.example` 参照）。

---

## 開発の背景

潰瘍性大腸炎（UC）の再燃サインを見逃さないよう、服薬・体調・花粉レベルを毎日続けて記録できるツールが欲しかったことが出発点です。「記録コストを下げて継続できる UI」を軸に設計し、React / TypeScript / Firebase の実務的な使い方を学ぶ場としても活用しました。
