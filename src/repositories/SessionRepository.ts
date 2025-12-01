import { Session } from '../models/Session';

/**
 * 会话存储库接口
 * 管理会话数据持久化
 */
export interface SessionRepository {
  /**
   * 创建新会话
   */
  create(session: Session): Promise<Session>;

  /**
   * 通过令牌查找会话
   */
  findByToken(token: string): Promise<Session | null>;

  /**
   * 查找用户的所有会话
   */
  findByUserId(userId: string): Promise<Session[]>;

  /**
   * 删除会话
   */
  delete(token: string): Promise<void>;

  /**
   * 删除用户的所有会话
   */
  deleteAllByUserId(userId: string): Promise<void>;

  /**
   * 删除过期会话
   */
  deleteExpired(): Promise<void>;
}
