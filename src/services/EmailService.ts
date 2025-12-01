/**
 * 电子邮件服务接口
 * 负责发送各种类型的电子邮件通知
 */
export interface EmailService {
  /**
   * 发送密码重置电子邮件
   * @param email 收件人电子邮件地址
   * @param resetToken 密码重置令牌
   * @param username 用户名（用于个性化邮件）
   * @returns Promise，成功时解析，失败时拒绝
   */
  sendPasswordResetEmail(email: string, resetToken: string, username: string): Promise<void>;
}

/**
 * 电子邮件配置选项
 */
export interface EmailConfig {
  /**
   * 发件人电子邮件地址
   */
  from: string;
  
  /**
   * 应用程序基础 URL（用于构建重置链接）
   */
  baseUrl: string;
  
  /**
   * SMTP 服务器主机（可选，用于实际发送）
   */
  smtpHost?: string;
  
  /**
   * SMTP 服务器端口（可选）
   */
  smtpPort?: number;
  
  /**
   * SMTP 用户名（可选）
   */
  smtpUser?: string;
  
  /**
   * SMTP 密码（可选）
   */
  smtpPassword?: string;
}

/**
 * 电子邮件服务实现
 * 
 * 注意：这是一个基础实现，在生产环境中应该：
 * 1. 使用真实的 SMTP 服务器或电子邮件服务提供商（如 SendGrid、AWS SES）
 * 2. 实现重试逻辑
 * 3. 添加电子邮件队列以处理大量邮件
 * 4. 实现电子邮件模板引擎
 */
export class EmailServiceImpl implements EmailService {
  constructor(private config: EmailConfig) {}
  
  /**
   * 发送密码重置电子邮件
   * 
   * 在开发环境中，此方法会将电子邮件内容记录到控制台
   * 在生产环境中，应该通过 SMTP 或电子邮件服务提供商发送实际邮件
   */
  async sendPasswordResetEmail(
    email: string,
    resetToken: string,
    username: string
  ): Promise<void> {
    // 验证输入
    if (!email || !this.isValidEmail(email)) {
      throw new Error('无效的电子邮件地址');
    }
    
    if (!resetToken) {
      throw new Error('重置令牌不能为空');
    }
    
    // 构建重置链接
    const resetLink = `${this.config.baseUrl}/reset-password?token=${resetToken}`;
    
    // 生成电子邮件内容
    const emailContent = this.generatePasswordResetEmailContent(
      username,
      resetLink,
      resetToken
    );
    
    // 在开发环境中，记录到控制台
    // 在生产环境中，这里应该调用实际的邮件发送服务
    if (process.env.NODE_ENV === 'production' && this.config.smtpHost) {
      await this.sendEmailViaSMTP(email, emailContent);
    } else {
      // 开发模式：记录到控制台
      console.log('=== 密码重置电子邮件 ===');
      console.log(`收件人: ${email}`);
      console.log(`主题: ${emailContent.subject}`);
      console.log(`内容:\n${emailContent.text}`);
      console.log('========================');
    }
  }
  
  /**
   * 生成密码重置电子邮件内容
   */
  private generatePasswordResetEmailContent(
    username: string,
    resetLink: string,
    resetToken: string
  ): { subject: string; text: string; html: string } {
    const subject = '密码重置请求';
    
    // 纯文本版本
    const text = `
您好 ${username}，

我们收到了您的密码重置请求。请点击以下链接重置您的密码：

${resetLink}

此链接将在 1 小时后过期。

如果您没有请求重置密码，请忽略此邮件。您的密码将保持不变。

为了您的安全，请不要与任何人分享此链接。

此致，
身份验证系统团队
    `.trim();
    
    // HTML 版本
    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .container {
      background-color: #f9f9f9;
      border: 1px solid #ddd;
      border-radius: 5px;
      padding: 30px;
    }
    .button {
      display: inline-block;
      padding: 12px 24px;
      background-color: #007bff;
      color: white;
      text-decoration: none;
      border-radius: 4px;
      margin: 20px 0;
    }
    .warning {
      color: #856404;
      background-color: #fff3cd;
      border: 1px solid #ffeaa7;
      padding: 10px;
      border-radius: 4px;
      margin-top: 20px;
    }
    .footer {
      margin-top: 30px;
      font-size: 12px;
      color: #666;
    }
  </style>
</head>
<body>
  <div class="container">
    <h2>密码重置请求</h2>
    <p>您好 <strong>${username}</strong>，</p>
    <p>我们收到了您的密码重置请求。请点击以下按钮重置您的密码：</p>
    <a href="${resetLink}" class="button">重置密码</a>
    <p>或者复制以下链接到浏览器：</p>
    <p style="word-break: break-all; background-color: #f5f5f5; padding: 10px; border-radius: 4px;">
      ${resetLink}
    </p>
    <div class="warning">
      <strong>⚠️ 重要提示：</strong>
      <ul>
        <li>此链接将在 <strong>1 小时</strong>后过期</li>
        <li>如果您没有请求重置密码，请忽略此邮件</li>
        <li>请不要与任何人分享此链接</li>
      </ul>
    </div>
    <div class="footer">
      <p>此致，<br>身份验证系统团队</p>
    </div>
  </div>
</body>
</html>
    `.trim();
    
    return { subject, text, html };
  }
  
  /**
   * 验证电子邮件地址格式
   */
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
  
  /**
   * 通过 SMTP 发送电子邮件（生产环境）
   * 
   * 注意：这是一个占位符实现
   * 在实际生产环境中，应该使用 nodemailer 或类似库
   */
  private async sendEmailViaSMTP(
    to: string,
    content: { subject: string; text: string; html: string }
  ): Promise<void> {
    // 占位符实现
    // 在实际应用中，这里应该使用 nodemailer 或电子邮件服务提供商的 SDK
    console.log(`发送电子邮件到 ${to}: ${content.subject}`);
    
    // 示例：使用 nodemailer（需要安装 nodemailer 包）
    // const transporter = nodemailer.createTransport({
    //   host: this.config.smtpHost,
    //   port: this.config.smtpPort,
    //   auth: {
    //     user: this.config.smtpUser,
    //     pass: this.config.smtpPassword,
    //   },
    // });
    //
    // await transporter.sendMail({
    //   from: this.config.from,
    //   to,
    //   subject: content.subject,
    //   text: content.text,
    //   html: content.html,
    // });
  }
}
