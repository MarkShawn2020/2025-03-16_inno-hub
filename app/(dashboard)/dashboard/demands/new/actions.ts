'use server';

import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { db } from '@/lib/db/drizzle';
import { 
  demands, 
  users, 
  teams, 
  teamMembers, 
  demandModules,
  ActivityType, 
  activityLogs 
} from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { z } from 'zod';
import { useUser } from '@/lib/auth';
import { use } from 'react';

// 对接第三方大模型API的函数，用于解析需求并分解模块
async function parseDemandsWithLLM(description: string) {
  // 这里是模拟调用大模型API的逻辑
  // 实际实现中应该调用如DeepSeek等大模型API
  
  // 简单模拟解析结果
  return {
    modules: [
      {
        moduleName: '后端开发',
        description: '包含数据库设计、API实现等',
        weight: 0.4,
      },
      {
        moduleName: '前端开发',
        description: '包含用户界面设计和实现',
        weight: 0.3,
      },
      {
        moduleName: '系统部署',
        description: '系统部署和运维',
        weight: 0.2,
      },
      {
        moduleName: '项目管理',
        description: '项目管理和协调',
        weight: 0.1,
      },
    ]
  };
}

// 需求提交表单的验证模式
const demandFormSchema = z.object({
  title: z.string().min(5),
  description: z.string().min(20),
  budget: z.string().optional(),
  timeline: z.string().optional(),
  cooperationType: z.string().optional(),
});

export async function submitDemand(formData: FormData) {
  try {
    const { userPromise } = useUser();
    const user = use(userPromise);
    if (!user) {
      return { success: false, message: '用户不存在' };
    }

    // 验证表单数据
    const validatedData = demandFormSchema.parse({
      title: formData.get('title'),
      description: formData.get('description'),
      budget: formData.get('budget'),
      timeline: formData.get('timeline'),
      cooperationType: formData.get('cooperationType'),
    });

    // 获取团队信息
    const teamMember = await db.query.teamMembers.findFirst({
      where: eq(teamMembers.userId, user.id),
      with: {
        team: true,
      },
    });

    if (!teamMember?.team) {
      return { success: false, message: '用户未加入任何团队' };
    }

    // 使用大模型解析需求
    const parsedResult = await parseDemandsWithLLM(validatedData.description);

    // 计算预算数值（如果有）
    let budgetValue = null;
    if (validatedData.budget) {
      const budgetMatch = validatedData.budget.match(/(\d+)/g);
      if (budgetMatch && budgetMatch.length) {
        budgetValue = parseInt(budgetMatch[0]) * 10000; // 转换为元
      }
    }

    // 创建需求记录
    const [newDemand] = await db.insert(demands).values({
      title: validatedData.title,
      description: validatedData.description,
      rawText: validatedData.description,
      parsedModules: parsedResult.modules,
      budget: budgetValue,
      timeline: validatedData.timeline,
      cooperationType: validatedData.cooperationType,
      submittedBy: user.id,
      teamId: teamMember.team.id,
      status: 'new',
    }).returning();

    if (!newDemand) {
      return { success: false, message: '创建需求失败' };
    }

    // 创建需求模块记录
    for (const module of parsedResult.modules) {
      await db.insert(demandModules).values({
        demandId: newDemand.id,
        moduleName: module.moduleName,
        description: module.description,
        weight: module.weight,
      });
    }

    // 记录活动日志
    await db.insert(activityLogs).values({
      teamId: teamMember.team.id,
      userId: user.id,
      action: ActivityType.CREATE_DEMAND,
      ipAddress: '127.0.0.1', // 实际应从请求中获取
    });

    // 刷新页面缓存
    revalidatePath('/dashboard/demands');

    return { success: true, message: '需求提交成功' };
  } catch (error) {
    console.error('提交需求时出错:', error);
    if (error instanceof z.ZodError) {
      return { success: false, message: '表单数据验证失败' };
    }
    return { success: false, message: '提交需求时发生错误' };
  }
} 