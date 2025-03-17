'use server';

import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db/drizzle';
import { 
  demands, 
  demandModules,
  matchResults,
  companies,
  activityLogs, 
  ActivityType 
} from '@/lib/db/schema';
import { eq, and, desc, sql } from 'drizzle-orm';
import { getUser } from '@/lib/db/queries';
import { matchDemandsWithCompanies } from '@/lib/services/deepseek';

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
      ipAddress: '127.0.0.1', // 实际应从请求中获取IP
    });
    
    // 刷新页面
    revalidatePath('/dashboard/demands');
    
    return { success: true, message: '需求已成功删除' };
  } catch (error) {
    console.error('删除需求时出错:', error);
    return { success: false, message: '删除需求时发生错误' };
  }
}

/**
 * 启动需求匹配过程
 * @param demandId 需求ID
 * @returns 操作结果
 */
export async function startMatching(demandId: number) {
  try {
    // 获取当前用户
    const user = await getUser();
    
    if (!user || !user.id) {
      return { success: false, message: '用户未登录' };
    }
    
    // 获取需求详情
    const demand = await db.query.demands.findFirst({
      where: eq(demands.id, demandId),
      with: {
        modules: true,
      },
    });
    
    if (!demand) {
      return { success: false, message: '需求不存在' };
    }
    
    // 验证用户是否有权限匹配此需求
    if (demand.submittedBy !== user.id) {
      return { success: false, message: '您无权对此需求进行操作' };
    }
    
    // 更新需求状态为matching
    await db.update(demands)
      .set({ 
        status: 'matching',
        updatedAt: new Date()
      })
      .where(eq(demands.id, demandId));
    
    // 获取企业列表
    const allCompanies = await db.query.companies.findMany({
      orderBy: [companies.createdAt]
    });
    
    if (!allCompanies.length) {
      await db.update(demands)
        .set({ 
          status: 'waiting_match',
          updatedAt: new Date()
        })
        .where(eq(demands.id, demandId));
      
      return { success: false, message: '系统中没有企业数据，无法进行匹配' };
    }
    
    // 调用DeepSeek进行AI匹配
    const matchedCompanies = await matchDemandsWithCompanies(demand, allCompanies);
    
    if (!matchedCompanies || matchedCompanies.length === 0) {
      await db.update(demands)
        .set({ 
          status: 'waiting_match',
          updatedAt: new Date()
        })
        .where(eq(demands.id, demandId));
      
      return { success: false, message: '未找到匹配的企业' };
    }
    
    // 保存匹配结果
    for (const match of matchedCompanies) {
      await db.insert(matchResults).values({
        demandId: demand.id,
        companyId: match.companyId,
        score: match.score,
        matchDetails: match.details,
        isRecommended: match.score > 0.7, // 匹配度>0.7的自动推荐
        status: 'pending',
      });
    }
    
    // 更新需求状态为已匹配
    await db.update(demands)
      .set({ 
        status: 'matched',
        updatedAt: new Date()
      })
      .where(eq(demands.id, demandId));
    
    // 记录活动日志
    await db.insert(activityLogs).values({
      teamId: demand.teamId,
      userId: user.id,
      action: ActivityType.MATCH_DEMAND,
      ipAddress: '127.0.0.1', // 实际应从请求中获取IP
    });
    
    // 刷新页面缓存
    revalidatePath(`/dashboard/demands/${demandId}`);
    revalidatePath(`/dashboard/demands/${demandId}/matches`);
    
    return { success: true, message: '已成功匹配企业', matchCount: matchedCompanies.length };
  } catch (error) {
    console.error('匹配企业时出错:', error);
    return { success: false, message: '匹配企业时发生错误' };
  }
}

/**
 * 更新需求状态
 * @param demandId 需求ID
 * @param status 新状态
 * @returns 操作结果
 */
export async function updateDemandStatus(demandId: number, status: string) {
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
      return { success: false, message: '需求不存在或您无权更新此需求' };
    }
    
    // 有效状态列表
    const validStatuses = ['new', 'matching', 'matched', 'in_progress', 'completed', 'cancelled'];
    
    if (!validStatuses.includes(status)) {
      return { success: false, message: '无效的状态值' };
    }
    
    // 更新需求状态
    await db.update(demands)
      .set({ 
        status: status,
        updatedAt: new Date()
      })
      .where(eq(demands.id, demandId));
    
    // 记录活动日志
    await db.insert(activityLogs).values({
      teamId: demand.teamId,
      userId: user.id,
      action: ActivityType.UPDATE_DEMAND_STATUS,
      ipAddress: '127.0.0.1', // 实际应从请求中获取IP
    });
    
    // 刷新页面缓存
    revalidatePath(`/dashboard/demands/${demandId}`);
    
    return { success: true, message: '需求状态已更新' };
  } catch (error) {
    console.error('更新需求状态时出错:', error);
    return { success: false, message: '更新需求状态时发生错误' };
  }
} 