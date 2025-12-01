import { Session } from '../models/Session';

/**
 * 登录结果
 */
export interface LoginResult {
  success: boolean;
  sessionToken?: string;
  error?: string;
  accountLocked?: boolean;
}

/**
 * 身份验证服务接口
 * 负责核心身份验证操作
 */
export interface AuthenticationService {
  /**
   * 使用凭据对用户进行身份验证
   */
  login(username: string, password: string): Promise<LoginResult>;

  /**
   * 使会话失效
   */
  logout(sessionToken: string): Promise<void>;

  /**
   * 验证会话令牌
   */
  validateSession(sessionToken: string): Promise<Session | null>;
}

// 导出实现
export { AuthenticationServiceImpl } from './AuthenticationServiceImpl';
