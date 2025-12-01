import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { PasswordValidationError, InvalidTokenError, UserNotFoundError } from '../errors/AuthErrors';
import { UserRepository } from '../repositories/UserRepository';
import { ResetTokenRepository } from '../repositories/ResetTokenRepository';
import { SessionService } from './SessionService';
import { EmailService } from './EmailService';
import { ResetToken } from '../models/ResetToken';

/**
 * 密码验证结果
 */
export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

/**
 * 密码重置结果
 */
export interface ResetResult {
  success: boolean;
  error?: string;
}

/**
 * 密码服务接口
 */
export interface IPasswordService {
  hashPassword(password: string): Promise<string>;
  validatePasswordStrength(password: string): ValidationResult;
  verifyPassword(password: string, hash: string): Promise<boolean>;
  initiatePasswordReset(usernameOrEmail: string): Promise<void>;
  completePasswordReset(resetToken: string, newPassword: string): Promise<ResetResult>;
}

/**
 * 密码服务实现
 * 处理密码哈希、验证和安全检查
 */
export class PasswordService implements IPasswordService {
  private readonly SALT_ROUNDS = 12;
  private readonly MIN_PASSWORD_LENGTH = 8;
  private readonly RESET_TOKEN_EXPIRY_HOURS = 1; // 重置令牌 1 小时后过期
  private readonly PASSWORD_HISTORY_SIZE = 5; // 记住最近 5 个密码
  
  constructor(
    private userRepository: UserRepository,
    private resetTokenRepository: ResetTokenRepository,
    private sessionService: SessionService,
    private emailService: EmailService
  ) {}
  
  /**
   * 使用 bcrypt 安全地哈希密码
   * @param password 明文密码
   * @returns 密码哈希值
   */
  async hashPassword(password: string): Promise<string> {
    if (!password) {
      throw new PasswordValidationError('密码不能为空');
    }
    
    return bcrypt.hash(password, this.SALT_ROUNDS);
  }
  
  /**
   * 验证密码强度
   * 检查最小长度和字符组合要求
   * @param password 要验证的密码
   * @returns 验证结果
   */
  validatePasswordStrength(password: string): ValidationResult {
    const errors: string[] = [];
    
    if (!password) {
      errors.push('密码不能为空');
      return { valid: false, errors };
    }
    
    // 检查最小长度
    if (password.length < this.MIN_PASSWORD_LENGTH) {
      errors.push(`密码长度至少为 ${this.MIN_PASSWORD_LENGTH} 个字符`);
    }
    
    // 检查是否包含字母
    if (!/[a-zA-Z]/.test(password)) {
      errors.push('密码必须包含至少一个字母');
    }
    
    // 检查是否包含数字
    if (!/\d/.test(password)) {
      errors.push('密码必须包含至少一个数字');
    }
    
    // 检查是否包含特殊字符
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      errors.push('密码必须包含至少一个特殊字符');
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }
  
  /**
   * 验证密码是否与哈希匹配
   * @param password 明文密码
   * @param hash 存储的密码哈希
   * @returns 是否匹配
   */
  async verifyPassword(password: string, hash: string): Promise<boolean> {
    if (!password || !hash) {
      return false;
    }
    
    return bcrypt.compare(password, hash);
  }

  /**
   * 发起密码重置
   * 生成重置令牌并发送电子邮件
   * 
   * 注意：为了防止账户枚举，即使用户不存在也返回成功
   * 
   * @param usernameOrEmail 用户名或电子邮件地址
   */
  async initiatePasswordReset(usernameOrEmail: string): Promise<void> {
    if (!usernameOrEmail) {
      // 即使输入无效，也返回成功以防止信息泄露
      return;
    }
    
    // 尝试通过用户名或电子邮件查找用户
    let user = await this.userRepository.findByUsername(usernameOrEmail);
    
    if (!user) {
      user = await this.userRepository.findByEmail(usernameOrEmail);
    }
    
    // 如果用户不存在，静默返回（防止账户枚举）
    if (!user) {
      return;
    }
    
    // 使该用户之前的所有重置令牌失效
    await this.resetTokenRepository.invalidateAllByUserId(user.id);
    
    // 生成新的重置令牌
    const token = this.generateSecureToken();
    const now = new Date();
    const expiresAt = new Date(now.getTime() + this.RESET_TOKEN_EXPIRY_HOURS * 60 * 60 * 1000);
    
    const resetToken: ResetToken = {
      token,
      userId: user.id,
      createdAt: now,
      expiresAt,
      used: false,
    };
    
    // 保存重置令牌
    await this.resetTokenRepository.create(resetToken);
    
    // 发送重置电子邮件
    try {
      await this.emailService.sendPasswordResetEmail(user.email, token, user.username);
    } catch (error) {
      // 记录错误但不抛出，以防止信息泄露
      console.error('发送密码重置邮件失败:', error);
      // 在生产环境中，应该使用适当的日志记录系统
    }
  }

  /**
   * 完成密码重置
   * 验证令牌并更新密码
   * 
   * @param resetToken 重置令牌
   * @param newPassword 新密码
   * @returns 重置结果
   */
  async completePasswordReset(resetToken: string, newPassword: string): Promise<ResetResult> {
    // 验证输入
    if (!resetToken) {
      return {
        success: false,
        error: '重置令牌不能为空',
      };
    }
    
    if (!newPassword) {
      return {
        success: false,
        error: '新密码不能为空',
      };
    }
    
    // 验证新密码强度
    const validation = this.validatePasswordStrength(newPassword);
    if (!validation.valid) {
      return {
        success: false,
        error: validation.errors.join('; '),
      };
    }
    
    // 查找重置令牌
    const token = await this.resetTokenRepository.findByToken(resetToken);
    
    if (!token) {
      throw new InvalidTokenError('重置令牌无效');
    }
    
    // 检查令牌是否已使用
    if (token.used) {
      throw new InvalidTokenError('重置令牌已被使用');
    }
    
    // 检查令牌是否过期
    const now = new Date();
    if (now > token.expiresAt) {
      throw new InvalidTokenError('重置令牌已过期');
    }
    
    // 获取用户
    const user = await this.userRepository.findById(token.userId);
    
    if (!user) {
      throw new UserNotFoundError(token.userId);
    }
    
    // 检查密码历史，防止重用
    const isPasswordReused = await this.checkPasswordHistory(newPassword, user);
    if (isPasswordReused) {
      return {
        success: false,
        error: '不能使用最近使用过的密码',
      };
    }
    
    // 哈希新密码
    const newPasswordHash = await this.hashPassword(newPassword);
    
    // 更新密码历史
    const passwordHistory = user.passwordHistory || [];
    passwordHistory.unshift(user.passwordHash); // 添加当前密码到历史
    
    // 只保留最近的 N 个密码
    const updatedPasswordHistory = passwordHistory.slice(0, this.PASSWORD_HISTORY_SIZE);
    
    // 更新用户密码
    await this.userRepository.update(user.id, {
      passwordHash: newPasswordHash,
      passwordHistory: updatedPasswordHistory,
      updatedAt: now,
    });
    
    // 标记令牌为已使用
    await this.resetTokenRepository.update(resetToken, { used: true });
    
    // 使该用户的所有会话失效
    await this.sessionService.invalidateAllUserSessions(user.id);
    
    return {
      success: true,
    };
  }
  
  /**
   * 生成加密安全的随机令牌
   * @returns 十六进制格式的令牌字符串
   */
  private generateSecureToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }
  
  /**
   * 检查密码是否在历史记录中被使用过
   * @param password 要检查的明文密码
   * @param user 用户对象
   * @returns 如果密码被重用则返回 true
   */
  private async checkPasswordHistory(password: string, user: any): Promise<boolean> {
    const passwordHistory = user.passwordHistory || [];
    
    // 检查当前密码
    const matchesCurrent = await this.verifyPassword(password, user.passwordHash);
    if (matchesCurrent) {
      return true;
    }
    
    // 检查历史密码
    for (const oldHash of passwordHistory) {
      const matchesOld = await this.verifyPassword(password, oldHash);
      if (matchesOld) {
        return true;
      }
    }
    
    return false;
  }
}
