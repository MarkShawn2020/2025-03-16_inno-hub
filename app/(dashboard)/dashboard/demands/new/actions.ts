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

// 对接第三方大模型API的函数，用于解析需求并分解模块
async function parseDemandsWithLLM(description: string, category?: string) {
  // 这里是模拟调用大模型API的逻辑
  // 实际实现中应该调用如DeepSeek等大模型API，并将category作为提示信息
  
  if (category === '智慧城市') {
    return {
      modules: [
        {
          moduleName: 'AI交互系统',
          description: '开发智能语音交互接口，提升用户体验',
          weight: 0.3,
        },
        {
          moduleName: '数据分析平台',
          description: '构建数据分析系统，优化资源利用',
          weight: 0.3,
        },
        {
          moduleName: '移动应用集成',
          description: '与本地生活APP集成，实现联动服务',
          weight: 0.2,
        },
        {
          moduleName: '业务优化方案',
          description: '优化商业模式和经营策略',
          weight: 0.2,
        },
      ]
    };
  } else if (category === '新能源') {
    return {
      modules: [
        {
          moduleName: '智能调度系统',
          description: '充电桩智能调度与管理系统开发',
          weight: 0.3,
        },
        {
          moduleName: '安全监控平台',
          description: '充电设备安全监控系统',
          weight: 0.3,
        },
        {
          moduleName: '用户分析系统',
          description: '用户行为分析与服务优化',
          weight: 0.2,
        },
        {
          moduleName: '运营平台',
          description: '充电桩运营管理与数据分析',
          weight: 0.2,
        },
      ]
    };
  } else if (category === '无人机') {
    return {
      modules: [
        {
          moduleName: '低空表演系统',
          description: '无人机编队表演控制系统',
          weight: 0.25,
        },
        {
          moduleName: '智能巡检系统',
          description: '基于计算机视觉的智能巡检',
          weight: 0.25,
        },
        {
          moduleName: '物流配送系统',
          description: '无人机物流配送路径规划与调度',
          weight: 0.25,
        },
        {
          moduleName: '远程监控平台',
          description: '低空设备远程监控与管理',
          weight: 0.25,
        },
      ]
    };
  } else if (category === '能源管理') {
    return {
      modules: [
        {
          moduleName: '光伏智能优化系统',
          description: '基于环境数据的光伏板角度智能调整',
          weight: 0.3,
        },
        {
          moduleName: '能效预测模型',
          description: '发电效率预测与参数优化',
          weight: 0.25,
        },
        {
          moduleName: '安全防护系统',
          description: '恶劣天气预警与设备保护',
          weight: 0.25,
        },
        {
          moduleName: '综合管理平台',
          description: '多站点统一监控与管理',
          weight: 0.2,
        },
      ]
    };
  }
  
  // 默认分解模块
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
  category: z.string().optional(),
  budget: z.string().optional(),
  timeline: z.string().optional(),
  cooperationType: z.string().optional(),
  userId: z.string(),  // 添加userId字段，由客户端传入
});

export async function submitDemand(formData: FormData) {
  try {
    // 从表单数据中获取用户ID并转换为数字
    const userIdStr = formData.get('userId') as string;
    
    if (!userIdStr) {
      return { success: false, message: '缺少用户ID' };
    }
    
    // 转换userId为数字
    const userId = parseInt(userIdStr, 10);
    
    if (isNaN(userId)) {
      return { success: false, message: '用户ID格式无效' };
    }

    // 获取用户信息
    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
    });

    if (!user) {
      return { success: false, message: '用户不存在' };
    }

    // 验证表单数据
    const validatedData = demandFormSchema.parse({
      title: formData.get('title'),
      description: formData.get('description'),
      category: formData.get('category'),
      budget: formData.get('budget'),
      timeline: formData.get('timeline'),
      cooperationType: formData.get('cooperationType'),
      userId: userIdStr,
    });

    // 获取团队信息
    const teamMember = await db.query.teamMembers.findFirst({
      where: eq(teamMembers.userId, userId),
      with: {
        team: true,
      },
    });

    if (!teamMember?.team) {
      return { success: false, message: '用户未加入任何团队' };
    }

    // 使用大模型解析需求
    const parsedResult = await parseDemandsWithLLM(validatedData.description, validatedData.category);

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
      submittedBy: userId,  // 使用转换后的数字ID
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
      userId: userId,  // 使用转换后的数字ID
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