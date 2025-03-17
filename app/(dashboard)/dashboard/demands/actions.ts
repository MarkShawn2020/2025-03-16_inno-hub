'use server';

import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db/drizzle';
import { 
  demands, 
  demandModules,
  matchResults,
  activityLogs, 
  ActivityType 
} from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { getUser } from '@/lib/db/queries';

/**
 * 删除需求的服务器操作
 * @param demandId 要删除的需求ID
 * @returns 删除结果
 */
export async function deleteDemand(demandId: number) {
  try {
    // 获取当前用户
    const user = await getUser();
    
    if (!user || !user.id) {
      return { success: false, message: '用户未登录' };
    }
    
    // 验证需求是否存在且属于当前用户
    const demand = await db.query.demands.findFirst({
      where: and(
        eq(demands.id, demandId),
        eq(demands.submittedBy, user.id)
      ),
    });
    
    if (!demand) {
      return { success: false, message: '需求不存在或您无权删除此需求' };
    }
    
    // 先删除相关的匹配结果
    await db.delete(matchResults).where(eq(matchResults.demandId, demandId));
    
    // 删除相关的需求模块
    await db.delete(demandModules).where(eq(demandModules.demandId, demandId));
    
    // 删除需求主记录
    await db.delete(demands).where(eq(demands.id, demandId));
    
    // 记录活动日志
    await db.insert(activityLogs).values({
      teamId: demand.teamId,
      userId: user.id,
      action: ActivityType.DELETE_DEMAND,
      ipAddress: '127.0.0.1', // 实际应从请求中获取
    });
    
    // 刷新页面缓存
    revalidatePath('/dashboard/demands');
    
    return { success: true, message: '需求已成功删除' };
  } catch (error) {
    console.error('删除需求时出错:', error);
    return { success: false, message: '删除需求时发生错误' };
  }
} 