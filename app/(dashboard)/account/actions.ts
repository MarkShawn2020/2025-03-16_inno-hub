'use server';

import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db/drizzle';
import { users, activityLogs, ActivityType } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { getUser, getTeamForUser } from '@/lib/db/queries';

// 个人信息表单的验证模式
const profileFormSchema = z.object({
  name: z.string().min(1, "姓名为必填项"),
  company: z.string().optional(),
  position: z.string().optional(),
  phone: z.string().optional(),
});

/**
 * 更新用户个人信息
 */
export async function updateUserProfile(formData: FormData) {
  try {
    // 获取当前用户
    const user = await getUser();
    
    if (!user || !user.id) {
      return { success: false, message: '用户未登录' };
    }
    
    // 验证表单数据
    const validatedData = profileFormSchema.parse({
      name: formData.get('name'),
      company: formData.get('company'),
      position: formData.get('position'),
      phone: formData.get('phone'),
    });

    // 准备profileData - 包含额外的用户信息
    const profileData = {
      // 保留可能存在的其他profileData字段
      ...((user.profileData as any) || {}),
      // 新值覆盖旧值
      company: validatedData.company || null,
      position: validatedData.position || null,
      phone: validatedData.phone || null,
    };

    // 更新用户记录
    await db.update(users)
      .set({
        name: validatedData.name,
        updatedAt: new Date(),
        profileData: profileData, // 现在可以使用profileData字段了
      })
      .where(eq(users.id, user.id));

    // 获取用户所属的团队
    const team = await getTeamForUser(user.id);
    
    // 只有当用户有所属团队时才记录活动日志
    if (team) {
      // 记录活动日志
      await db.insert(activityLogs).values({
        teamId: team.id, // 使用正确的团队ID
        userId: user.id,
        action: ActivityType.UPDATE_ACCOUNT,
        ipAddress: '127.0.0.1', // 实际应从请求中获取
      });
    }

    // 刷新页面缓存
    revalidatePath('/account');
    revalidatePath('/dashboard');

    return { success: true, message: '个人信息更新成功' };
  } catch (error) {
    console.error('更新个人信息时出错:', error);
    if (error instanceof z.ZodError) {
      return { success: false, message: '表单数据验证失败', error };
    }
    return { success: false, message: '更新个人信息时发生错误' };
  }
} 