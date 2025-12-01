/**
 * 密码重置令牌数据模型
 */
export interface ResetToken {
  token: string;
  userId: string;
  createdAt: Date;
  expiresAt: Date;
  used: boolean;
}
