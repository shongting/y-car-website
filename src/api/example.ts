/**
 * API 使用示例
 * 
 * 此文件展示如何设置和使用身份验证 API
 */

import { createApp, AppDependencies } from './app';
import { PasswordService } from '../services/PasswordService';

/**
 * 示例：创建和启动 API 服务器
 * 
 * 注意：此示例需要实际的服务实现。
 * 在任务 3-10 完成后，您可以使用真实的服务实例。
 */
export function exampleUsage() {
  // 1. 创建服务实例（这里使用占位符）
  const dependencies: AppDependencies = {
    authService: {
      login: async (username, password) => {
        // 实际实现将在任务 6 中完成
        return { success: false, error: '服务尚未实现' };
      },
      logout: async (sessionToken) => {
        // 实际实现将在任务 6 中完成
      },
      validateSession: async (sessionToken) => {
        // 实际实现将在任务 6 中完成
        return null;
      }
    },
    passwordService: new PasswordService()
  };

  // 2. 创建 Express 应用
  const app = createApp(dependencies);

  // 3. 启动服务器
  const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;
  app.listen(PORT, () => {
    console.log(`身份验证 API 服务器运行在端口 ${PORT}`);
    console.log(`健康检查: http://localhost:${PORT}/health`);
    console.log(`登录端点: POST http://localhost:${PORT}/auth/login`);
    console.log(`注销端点: POST http://localhost:${PORT}/auth/logout`);
    console.log(`密码重置请求: POST http://localhost:${PORT}/auth/password-reset/request`);
    console.log(`密码重置完成: POST http://localhost:${PORT}/auth/password-reset/complete`);
    console.log(`会话验证: GET http://localhost:${PORT}/auth/session/validate`);
  });
}

/**
 * API 端点使用示例
 */
export const apiExamples = {
  /**
   * 登录请求示例
   */
  login: {
    method: 'POST',
    url: '/auth/login',
    body: {
      username: 'testuser',
      password: 'Test123!@#'
    },
    successResponse: {
      success: true,
      sessionToken: 'abc123...'
    },
    errorResponse: {
      success: false,
      error: '用户名或密码无效'
    }
  },

  /**
   * 注销请求示例
   */
  logout: {
    method: 'POST',
    url: '/auth/logout',
    body: {
      sessionToken: 'abc123...'
    },
    successResponse: {
      success: true,
      message: '注销成功'
    }
  },

  /**
   * 密码重置请求示例
   */
  passwordResetRequest: {
    method: 'POST',
    url: '/auth/password-reset/request',
    body: {
      usernameOrEmail: 'testuser'
    },
    successResponse: {
      success: true,
      message: '如果该账户存在，密码重置链接已发送到注册的电子邮件地址'
    }
  },

  /**
   * 密码重置完成示例
   */
  passwordResetComplete: {
    method: 'POST',
    url: '/auth/password-reset/complete',
    body: {
      resetToken: 'reset-token-123',
      newPassword: 'NewPass123!@#'
    },
    successResponse: {
      success: true,
      message: '密码重置成功'
    },
    errorResponse: {
      success: false,
      error: '重置令牌无效或已过期'
    }
  },

  /**
   * 会话验证示例（使用查询参数）
   */
  sessionValidateQuery: {
    method: 'GET',
    url: '/auth/session/validate?sessionToken=abc123...',
    successResponse: {
      success: true,
      valid: true,
      session: {
        userId: 'user-123',
        createdAt: '2024-01-01T00:00:00.000Z',
        expiresAt: '2024-01-01T01:00:00.000Z',
        lastActivityAt: '2024-01-01T00:30:00.000Z'
      }
    }
  },

  /**
   * 会话验证示例（使用 Authorization 头）
   */
  sessionValidateHeader: {
    method: 'GET',
    url: '/auth/session/validate',
    headers: {
      Authorization: 'Bearer abc123...'
    },
    successResponse: {
      success: true,
      valid: true,
      session: {
        userId: 'user-123',
        createdAt: '2024-01-01T00:00:00.000Z',
        expiresAt: '2024-01-01T01:00:00.000Z',
        lastActivityAt: '2024-01-01T00:30:00.000Z'
      }
    }
  }
};

// 如果直接运行此文件，启动示例服务器
// 注意：在测试环境中不启动服务器
if (require.main === module && process.env.NODE_ENV !== 'test') {
  console.log('启动示例 API 服务器...');
  console.log('注意：某些功能需要完整的服务实现才能正常工作');
  exampleUsage();
}
