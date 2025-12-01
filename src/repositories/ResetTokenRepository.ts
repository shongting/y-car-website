import { ResetToken } from '../models/ResetToken';

/**
 * 重置令牌存储库接口
 * 管理密码重置令牌数据持久化
 */
export interface ResetTokenRepository {
  /**
   * 创建新重置令牌
   */
  create(token: ResetToken): Promise<ResetToken>;

  /**
   * 通过令牌查找重置令牌
   */
  findByToken(token: string): Promise<ResetToken | null>;

  /**
   * 查找用户的所有重置令牌
   */
  findByUserId(userId: string): Promise<ResetToken[]>;

  /**
   * 更新重置令牌
   */
  update(token: string, updates: Partial<ResetToken>): Promise<ResetToken>;

  /**
   * 删除重置令牌
   */
  delete(token: string): Promise<void>;

  /**
   * 使用户的所有重置令牌失效
   */
  invalidateAllByUserId(userId: string): Promise<void>;
}
