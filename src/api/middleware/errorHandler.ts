import { Request, Response, NextFunction } from 'express';
import { AuthError } from '../../errors/AuthErrors';

/**
 * 错误响应接口
 */
export interface ErrorResponse {
  success: false;
  error: string;
  code: string;
  details?: any;
}

/**
 * 格式化错误响应
 * 确保敏感信息不会泄露给客户端
 */
export function formatErrorResponse(error: Error): ErrorResponse {
  // 处理自定义身份验证错误
  if (error instanceof AuthError) {
    return {
      success: false,
      error: error.message,
      code: error.code,
      details: sanitizeErrorDetails(error.details)
    };
  }

  // 处理未知错误 - 不泄露内部细节
  console.error('未处理的错误:', error);
  return {
    success: false,
    error: '服务器内部错误',
    code: 'INTERNAL_SERVER_ERROR'
  };
}

/**
 * 清理错误详情，移除敏感信息
 */
export function sanitizeErrorDetails(details: any): any {
  if (!details) {
    return undefined;
  }

  // 创建副本以避免修改原始对象
  const sanitized = { ...details };

  // 移除敏感字段
  const sensitiveFields = ['password', 'passwordHash', 'token', 'sessionToken', 'resetToken'];
  for (const field of sensitiveFields) {
    if (field in sanitized) {
      delete sanitized[field];
    }
  }

  return sanitized;
}

/**
 * Express 错误处理中间件
 */
export function errorHandler(
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const errorResponse = formatErrorResponse(error);
  
  // 确定 HTTP 状态码
  const statusCode = error instanceof AuthError ? error.statusCode : 500;

  // 添加 Retry-After 头（如果适用）
  if (error instanceof AuthError && 'retryAfter' in error && error.retryAfter) {
    res.setHeader('Retry-After', error.retryAfter.toString());
  }

  res.status(statusCode).json(errorResponse);
}

/**
 * 包装异步路由处理器以捕获错误
 */
export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

/**
 * 验证必需字段
 */
export function validateRequiredFields(
  body: any,
  fields: { name: string; type: string }[]
): void {
  for (const field of fields) {
    if (!body[field.name]) {
      throw new Error(`${field.name} 是必需的`);
    }
    
    if (typeof body[field.name] !== field.type) {
      throw new Error(`${field.name} 必须是 ${field.type} 类型`);
    }
  }
}
