/**
 * 用户数据模型
 */
export interface User {
  id: string;
  username: string;
  email: string;
  passwordHash: string;
  createdAt: Date;
  updatedAt: Date;
  accountLockedUntil?: Date;
  failedLoginAttempts: number;
  lastLoginAt?: Date;
  passwordHistory?: string[]; // 存储最近使用过的密码哈希，用于防止重用
}
