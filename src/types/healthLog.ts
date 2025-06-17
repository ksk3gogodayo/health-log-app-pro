import { Timestamp } from 'firebase/firestore';

export interface LogItem {
  id: string;
  memo: string;
  meds: string[];          // チェック付き薬ID配列
  createdAt: Timestamp;    // UTC 保存
}

export type NewLogItem = Omit<LogItem, 'id'>;   // まだ id を持たない入力用
