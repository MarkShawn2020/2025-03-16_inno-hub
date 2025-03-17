'use server';

import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db/drizzle';
import { 
  companies, 
  activityLogs, 
  ActivityType 
} from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { getUser } from '@/lib/db/queries';

// 企业提交表单的验证模式
const companyFormSchema = z.object({
  name: z.string().min(1, "企业名称为必填项"),
  logo: z.string().optional(),
  category: z.string().optional(),
  subCategory: z.string().optional(),
  description: z.string().optional(),
  productIntro: z.string().optional(),
  advantageTags: z.string().optional(),
  contactName: z.string().optional(),
  contactPhone: z.string().optional(),
  isEastRisingPark: z.boolean().default(false)
});

export async function createCompany(formData: FormData) {
  try {
    // 获取当前用户
    const user = await getUser();
    
    if (!user || !user.id) {
      return { success: false, message: '用户未登录' };
    }
    
    // 验证表单数据
    const validatedData = companyFormSchema.parse({
      name: formData.get('name'),
      logo: formData.get('logo'),
      category: formData.get('category'),
      subCategory: formData.get('subCategory'),
      description: formData.get('description'),
      productIntro: formData.get('productIntro'),
      advantageTags: formData.get('advantageTags'),
      contactName: formData.get('contactName'),
      contactPhone: formData.get('contactPhone'),
      isEastRisingPark: formData.get('isEastRisingPark') === 'true',
    });

    // 处理标签数据 - 将逗号分隔的标签字符串转为数组
    const tags = validatedData.advantageTags 
      ? validatedData.advantageTags.split(';').map(tag => tag.trim()).filter(Boolean)
      : [];

    // 创建企业记录
    const [newCompany] = await db.insert(companies).values({
      name: validatedData.name,
      logo: validatedData.logo,
      category: validatedData.category,
      subCategory: validatedData.subCategory,
      description: validatedData.description,
      productIntro: validatedData.productIntro,
      advantageTags: tags.length > 0 ? tags : null,
      contactName: validatedData.contactName,
      contactPhone: validatedData.contactPhone,
      isEastRisingPark: validatedData.isEastRisingPark,
      teamId: user.id,
      isAvailable: true,
      lastUpdated: new Date(),
    }).returning();

    if (!newCompany) {
      return { success: false, message: '创建企业失败' };
    }

    // 记录活动日志
    await db.insert(activityLogs).values({
      teamId: user.id,
      userId: user.id,
      action: ActivityType.CREATE_COMPANY,
      ipAddress: '127.0.0.1', // 实际应从请求中获取
    });

    // 刷新页面缓存
    revalidatePath('/dashboard/companies');

    return { success: true, message: '企业添加成功', companyId: newCompany.id };
  } catch (error) {
    console.error('添加企业时出错:', error);
    if (error instanceof z.ZodError) {
      return { success: false, message: '表单数据验证失败', error };
    }
    return { success: false, message: '添加企业时发生错误' };
  }
} 