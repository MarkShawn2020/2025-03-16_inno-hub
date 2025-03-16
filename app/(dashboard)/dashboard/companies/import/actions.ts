'use server';

import { revalidatePath } from 'next/cache';
import { auth } from '@/auth';
import { db } from '@/db';
import { company } from '@/db/schema';
import { nanoid } from 'nanoid';

export async function importCompanies(formData: FormData) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return {
        success: false,
        message: '未授权，请先登录',
      };
    }

    const file = formData.get('file') as File;
    if (!file) {
      return {
        success: false,
        message: '请选择文件',
      };
    }

    // 读取并解析CSV文件
    const text = await file.text();
    const rows = text.split('\n');
    
    // 检查表头
    const headers = rows[0].split(',');
    const requiredHeaders = ['企业名称', '企业简介', '联系人', '联系电话', '邮箱', '所在地区', '企业规模', '行业'];
    const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));
    
    if (missingHeaders.length > 0) {
      return {
        success: false,
        message: `文件缺少必要的列: ${missingHeaders.join(', ')}`,
      };
    }

    // 解析数据行
    const companies = [];
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i].trim();
      if (!row) continue;
      
      const values = row.split(',');
      if (values.length !== headers.length) {
        continue; // 跳过格式不正确的行
      }
      
      const data: any = {};
      headers.forEach((header, index) => {
        data[header] = values[index];
      });
      
      companies.push({
        id: nanoid(),
        userId: session.user.id,
        name: data['企业名称'],
        description: data['企业简介'],
        contactPerson: data['联系人'],
        contactPhone: data['联系电话'],
        contactEmail: data['邮箱'],
        location: data['所在地区'],
        size: data['企业规模'],
        industry: data['行业'],
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }
    
    if (companies.length === 0) {
      return {
        success: false,
        message: '未找到有效的企业数据',
      };
    }
    
    // 批量插入数据库
    await db.insert(company).values(companies);
    
    // 重新验证企业列表页面
    revalidatePath('/dashboard/companies');
    
    return {
      success: true,
      message: '企业数据导入成功',
      count: companies.length,
    };
  } catch (error) {
    console.error('导入企业数据失败:', error);
    return {
      success: false,
      message: '导入过程中发生错误，请检查文件格式',
    };
  }
} 