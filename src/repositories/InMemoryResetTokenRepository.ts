import { ResetToken } from '../models/ResetToken';
import { ResetTokenRepository } from './ResetTokenRepository';

/**
 * 重置令牌存储库的内存实现
 * 用于开发和测试环境
 */
export class InMemoryResetTokenRepository implements ResetTokenRepository {
  private tokens: Map<string, ResetToken> = new Map();

  /**
   * 创建新重置令牌
   */
  async create(token: ResetToken): Promise<ResetToken> {
    this.tokens.set(token.token, { ...token });
    return { ...token };
  }

  /**
   * 通过令牌查找重置令牌
   */
  async findByToken(token: string): Promise<ResetToken | null> {
    const resetToken = this.tokens.get(token);
    return resetToken ? { ...resetToken } : null;
  }

  /**
   * 查找用户的所有重置令牌
   */
  async findByUserId(userId: string): Promise<ResetToken[]> {
    const userTokens: ResetToken[] = [];
    
    for (const token of this.tokens.values()) {
      if (token.userId === userId) {
        userTokens.push({ ...token });
      }
    }
    
    return userTokens;
  }

  /**
   * 更新重置令牌
   */
  async update(token: string, updates: Partial<ResetToken>): Promise<ResetToken> {
    const existingToken = this.tokens.get(token);
    
    if (!existingToken) {
      throw new Error(`令牌不存在: ${token}`);
    }
    
    const updatedToken = {
      ...existingToken,
      ...updates,
      token: existingToken.token, // 令牌本身不能被更新
    };
    
    this.tokens.set(token, updatedToken);
    return { ...updatedToken };
  }

  /**
   * 删除重置令牌
   */
  async delete(token: string): Promise<void> {
    this.tokens.delete(token);
  }

  /**
   * 使用户的所有重置令牌失效
   */
  async invalidateAllByUserId(userId: string): Promise<void> {
    const userTokens = await this.findByUserId(userId);
    
    for (const token of userTokens) {
      await this.update(token.token, { used: true });
    }
  }

  /**
   * 清除所有令牌（用于测试）
   */
  async clear(): Promise<void> {
    this.tokens.clear();
  }
}
