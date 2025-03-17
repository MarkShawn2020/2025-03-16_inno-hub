'use server';

import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db/drizzle';
import { 
  companies, 
  activityLogs, 
  ActivityType 
} from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { z } from 'zod';
import { getUser } from '@/lib/db/queries';

/**
 * 删除企业的服务器操作
 * @param companyId 要删除的企业ID
 * @returns 删除结果
 */
export async function deleteCompany(companyId: number) {
  try {
    // 获取当前用户
    const user = await getUser();
    
    if (!user || !user.id) {
      return { success: false, message: '用户未登录' };
    }
    
    // 验证企业是否存在且属于当前用户
    const company = await db.query.companies.findFirst({
      where: and(
        eq(companies.id, companyId),
        eq(companies.teamId, user.id)
      ),
    });
    
    if (!company) {
      return { success: false, message: '企业不存在或您无权删除此企业' };
    }
    
    // 删除企业
    await db.delete(companies).where(eq(companies.id, companyId));
    
    // 记录活动日志
    await db.insert(activityLogs).values({
      teamId: user.id,
      userId: user.id,
      action: ActivityType.DELETE_COMPANY,
      ipAddress: '127.0.0.1', // 实际应从请求中获取
    });
    
    // 刷新页面缓存
    revalidatePath('/dashboard/companies');
    
    return { success: true, message: '企业已成功删除' };
  } catch (error) {
    console.error('删除企业时出错:', error);
    return { success: false, message: '删除企业时发生错误' };
  }
} 