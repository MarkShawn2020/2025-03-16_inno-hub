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
    
    // 更新需求状态为matching
    await db.update(demands)
      .set({ 
        status: 'matching',
        updatedAt: new Date()
      })
      .where(eq(demands.id, demandId));
    
    // 模拟DeepSeek AI匹配过程
    // 实际实现中，这里应该调用DeepSeek API进行企业匹配
    const matchedCompanies = await simulateDeepSeekMatching(demand);
    
    if (matchedCompanies.length === 0) {
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
        demandId: demandId,
        companyId: match.companyId,
        score: match.score,
        matchDetails: match.details,
        isRecommended: match.score > 0.7, // 分数高于0.7的推荐
        status: 'pending',
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }
    
    // 更新需求状态为matched
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
      action: ActivityType.UPDATE_DEMAND,
      ipAddress: '127.0.0.1', // 实际应从请求中获取
    });
    
    // 刷新页面缓存
    revalidatePath(`/dashboard/demands/${demandId}`);
    revalidatePath('/dashboard/demands');
    
    return { 
      success: true, 
      message: `找到${matchedCompanies.length}家匹配企业`,
      matchCount: matchedCompanies.length 
    };
  } catch (error) {
    console.error('启动需求匹配时出错:', error);
    return { success: false, message: '启动需求匹配时发生错误' };
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
    
    // 验证状态值是否合法
    const validStatuses = [
      'new', 'waiting_match', 'matching', 'matched', 
      'contacting', 'in_progress', 'delivered', 
      'completed', 'abandoned', 'canceled'
    ];
    
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
      action: ActivityType.UPDATE_DEMAND,
      ipAddress: '127.0.0.1', // 实际应从请求中获取
    });
    
    // 刷新页面缓存
    revalidatePath(`/dashboard/demands/${demandId}`);
    revalidatePath('/dashboard/demands');
    
    return { success: true, message: '需求状态已更新' };
  } catch (error) {
    console.error('更新需求状态时出错:', error);
    return { success: false, message: '更新需求状态时发生错误' };
  }
}

/**
 * 模拟DeepSeek匹配过程
 * 实际实现中，应该通过DeepSeek API进行匹配
 */
async function simulateDeepSeekMatching(demand: any) {
  // 从数据库获取一些企业
  const allCompanies = await db.query.companies.findMany({
    limit: 10,
    orderBy: [sql`RANDOM()`]
  });
  
  if (!allCompanies.length) {
    return [];
  }
  
  // 模拟匹配过程
  const matchResults = allCompanies.map(company => {
    // 随机生成匹配分数，实际应由DeepSeek AI计算
    const score = 0.4 + Math.random() * 0.6; // 0.4-1.0之间
    
    // 模拟匹配详情
    const details = {
      matchReasons: [
        `${company.name}在${company.category || '行业未知'}领域有专业经验`,
        `需求描述与该企业的优势标签匹配度良好`,
        `该企业在处理类似项目上有成功案例`
      ],
      matchedModules: demand.modules.map((module: any) => ({
        moduleName: module.moduleName,
        score: 0.3 + Math.random() * 0.7, // 0.3-1.0之间
        reason: `该企业在${module.moduleName}相关领域有专业经验`
      })),
      overallScore: score
    };
    
    return {
      companyId: company.id,
      score: parseFloat(score.toFixed(2)),
      details: details
    };
  })
  // 按分数排序，从高到低
  .sort((a, b) => b.score - a.score);
  
  return matchResults;
} 