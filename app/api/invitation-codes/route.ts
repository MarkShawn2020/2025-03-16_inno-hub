import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/drizzle';
import { and, desc, eq } from 'drizzle-orm';
import { invitationCodes, users } from '@/lib/db/schema';
import { getCurrentUser } from '@/lib/auth/utils';

// 获取邀请码列表
export async function GET(request: NextRequest) {
  const user = await getCurrentUser();
  
  // 确保用户已登录且为管理员
  if (!user || user.role !== 'owner') {
    return NextResponse.json(
      { error: '未授权访问' },
      { status: 403 }
    );
  }
  
  // 获取所有邀请码
  try {
    const codes = await db.query.invitationCodes.findMany({
      orderBy: [desc(invitationCodes.createdAt)],
      with: {
        creator: {
          columns: {
            email: true
          }
        }
      }
    });
    
    return NextResponse.json(codes);
  } catch (error) {
    console.error('获取邀请码失败:', error);
    return NextResponse.json(
      { error: '获取邀请码失败' },
      { status: 500 }
    );
  }
}

// 创建新邀请码
export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  
  // 确保用户已登录且为管理员
  if (!user || user.role !== 'owner') {
    return NextResponse.json(
      { error: '未授权访问' },
      { status: 403 }
    );
  }
  
  try {
    const body = await request.json();
    const { code, description, maxUses, expiresAt } = body;
    
    // 检查邀请码是否已存在
    const existingCode = await db.query.invitationCodes.findFirst({
      where: eq(invitationCodes.code, code)
    });
    
    if (existingCode) {
      return NextResponse.json(
        { error: '邀请码已存在' },
        { status: 400 }
      );
    }
    
    // 创建新邀请码
    const [newCode] = await db.insert(invitationCodes).values({
      code,
      description,
      maxUses,
      expiresAt: expiresAt ? new Date(expiresAt) : null,
      createdBy: user.id,
      isActive: true,
      currentUses: 0
    }).returning();
    
    return NextResponse.json({
      success: true,
      code: newCode
    });
    
  } catch (error) {
    console.error('创建邀请码失败:', error);
    return NextResponse.json(
      { error: '创建邀请码失败' },
      { status: 500 }
    );
  }
} 