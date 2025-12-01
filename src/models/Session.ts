/**
 * 会话数据模型
 */
export interface Session {
  token: string;
  userId: string;
  createdAt: Date;
  expiresAt: Date;
  lastActivityAt: Date;
}
