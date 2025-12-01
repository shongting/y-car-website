import { createApp, AppDependencies } from './app';

/**
 * 启动服务器
 */
export function startServer(dependencies: AppDependencies, port: number = 3000): void {
  const app = createApp(dependencies);

  app.listen(port, () => {
    console.log(`服务器运行在端口 ${port}`);
  });
}
