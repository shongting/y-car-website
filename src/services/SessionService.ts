import { Session } from '../models/Session';

/**
 * 会话服务接口
 * 管理用户会话生命周期
 */
export interface SessionService {
  /**
   * 为用户创建新会话
   */
  createSession(userId: string): Promise<Session>;

  /**
   * 检索会话
   */
  getSession(sessionToken: string): Promise<Session | null>;

  /**
   * 使会话失效
   */
  invalidateSession(sessionToken: string): Promise<void>;

  /**
   * 使用户的所有会话失效
   */
  invalidateAllUserSessions(userId: string): Promise<void>;

  /**
   * 清理过期会话
   */
  cleanupExpiredSessions(): Promise<void>;
}
