import { User } from '../models/User';

/**
 * 用户存储库接口
 * 管理用户数据持久化
 */
export interface UserRepository {
  /**
   * 创建新用户
   */
  create(user: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User>;

  /**
   * 通过 ID 查找用户
   */
  findById(id: string): Promise<User | null>;

  /**
   * 通过用户名查找用户
   */
  findByUsername(username: string): Promise<User | null>;

  /**
   * 通过电子邮件查找用户
   */
  findByEmail(email: string): Promise<User | null>;

  /**
   * 更新用户
   */
  update(id: string, updates: Partial<User>): Promise<User>;

  /**
   * 删除用户
   */
  delete(id: string): Promise<void>;
}
