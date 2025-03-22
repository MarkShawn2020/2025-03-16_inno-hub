'use server';

import { db } from '@/lib/db/drizzle';
import { eq } from 'drizzle-orm';
import { invitationCodes, ActivityType } from '@/lib/db/schema';
import { getCurrentUser } from '@/lib/auth/utils';
import { revalidatePath } from 'next/cache';
import { randomUUID } from 'crypto';
import { redirect } from 'next/navigation';

type InvitationCodeFormData = {
  code: string;
  description: string | null;
  maxUses: number | null;
  expiresAt: Date | null;
};

/**
 * 创建邀请码
 */
export async function createInvitationCode(data: InvitationCodeFormData) {
  const user = await getCurrentUser();
  
  if (!user || user.role !== 'owner') {
    return {
      success: false,
      message: '只有管理员可以创建邀请码',
    };
  }
  
  try {
    // 检查邀请码是否已存在
    const existingCode = await db.query.invitationCodes.findFirst({
      where: eq(invitationCodes.code, data.code),
    });
    
    if (existingCode) {
      return {
        success: false,
        message: '该邀请码已存在，请使用其他邀请码',
      };
    }
    
    // 创建新邀请码
    await db.insert(invitationCodes).values({
      code: data.code,
      description: data.description,
      maxUses: data.maxUses,
      expiresAt: data.expiresAt,
      createdBy: user.id,
      isActive: true,
      currentUses: 0,
    });
    
    revalidatePath('/dashboard/security/invitation-codes');
    
    return {
      success: true,
      message: '邀请码创建成功',
    };
  } catch (error) {
    console.error('创建邀请码失败:', error);
    return {
      success: false,
      message: '创建邀请码时发生错误',
    };
  }
}

/**
 * 切换邀请码状态
 */
export async function toggleInvitationCodeStatus(id: number, newStatus: boolean) {
  const user = await getCurrentUser();
  
  if (!user || user.role !== 'owner') {
    return {
      success: false,
      message: '只有管理员可以修改邀请码',
    };
  }
  
  try {
    await db.update(invitationCodes)
      .set({ isActive: newStatus })
      .where(eq(invitationCodes.id, id));
    
    revalidatePath('/dashboard/security/invitation-codes');
    
    return {
      success: true,
      message: newStatus ? '邀请码已启用' : '邀请码已停用',
    };
  } catch (error) {
    console.error('更新邀请码状态失败:', error);
    return {
      success: false,
      message: '更新邀请码状态时发生错误',
    };
  }
}

/**
 * 删除邀请码
 */
export async function deleteInvitationCode(id: number) {
  const user = await getCurrentUser();
  
  if (!user || user.role !== 'owner') {
    return {
      success: false,
      message: '只有管理员可以删除邀请码',
    };
  }
  
  try {
    await db.delete(invitationCodes)
      .where(eq(invitationCodes.id, id));
    
    revalidatePath('/dashboard/security/invitation-codes');
    
    return {
      success: true,
      message: '邀请码已删除',
    };
  } catch (error) {
    console.error('删除邀请码失败:', error);
    return {
      success: false,
      message: '删除邀请码时发生错误',
    };
  }
}

/**
 * 生成随机邀请码
 */
export async function generateRandomCode() {
  return randomUUID().substring(0, 8).toUpperCase();
} 