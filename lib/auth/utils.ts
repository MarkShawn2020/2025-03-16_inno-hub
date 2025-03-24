import { getUser } from '@/lib/db/queries';

/**
 * 获取当前用户（如果已登录），但不会重定向
 * 与需要时重定向的 middleware 不同，此函数允许在未登录状态下继续渲染页面
 * 
 * @returns 用户对象或null（如果未登录）
 */
export async function getCurrentUser() {
  return await getUser();
}

/**
 * 检查用户是否有权限查看或操作某项资源
 * 
 * @param userId 资源所有者ID
 * @param currentUserId 当前用户ID
 * @returns boolean 是否有权限
 */
export function hasPermission(userId: number | null | undefined, currentUserId: number | null | undefined) {
  if (!currentUserId) return false;
  return currentUserId === userId;
}

/**
 * 获取企业数据时的过滤条件，根据用户登录状态决定
 * 
 * @param user 当前用户对象
 * @returns 过滤条件
 */
export function getCompanyFilter(user: any) {
  if (!user) {
    // 未登录用户只显示公开可用的企业
    return { isAvailable: true };
  }
  // 登录用户可以看到全部企业
  return {};
}

/**
 * 模糊处理敏感信息，用于未登录用户
 * 
 * @param text 原始文本
 * @returns 处理后的文本
 */
export function obfuscateSensitiveInfo(text: string | null | undefined, isLoggedIn: boolean) {
  if (!text) return '';
  if (isLoggedIn) return text;
  
  // 只显示前几个字符，其余以星号替代
  const visibleLength = Math.min(5, text.length);
  return text.substring(0, visibleLength) + (text.length > visibleLength ? '***' : '');
} 