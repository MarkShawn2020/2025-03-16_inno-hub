'use server';

import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db/drizzle';
import { companies, activityLogs, ActivityType, teamMembers } from '@/lib/db/schema';
import { getUser } from '@/lib/db/queries';
import { parse } from 'csv-parse/sync';
import { eq, and } from 'drizzle-orm';

/**
 * 处理CSV文件并导入企业数据
 */
export async function importCompanies(formData: FormData) {
  try {
    // 获取当前用户
    const user = await getUser();
    
    if (!user || !user.id) {
      return { success: false, message: '用户未登录' };
    }
    
    // 获取用户所属的团队
    const userTeam = await db
      .select({ teamId: teamMembers.teamId })
      .from(teamMembers)
      .where(eq(teamMembers.userId, user.id))
      .limit(1);
    
    if (!userTeam || userTeam.length === 0) {
      return { success: false, message: '用户未关联到任何团队，无法导入企业数据' };
    }
    
    const teamId = userTeam[0].teamId;
    
    // 获取上传的文件
    const file = formData.get('file') as File;
    
    if (!file) {
      return { success: false, message: '未找到上传的文件' };
    }
    
    // 检查文件类型
    if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
      return { success: false, message: '请上传CSV格式的文件' };
    }
    
    // 读取文件内容
    const fileBuffer = await file.arrayBuffer();
    const fileContent = new TextDecoder().decode(fileBuffer);
    
    try {
      // 尝试手动解析CSV内容
      const lines = fileContent.split('\n');
      const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
      
      // 构建记录数组
      const records = [];
      for (let i = 1; i < lines.length; i++) {
        if (!lines[i].trim()) continue; // 跳过空行
        
        // 简单拆分（不考虑引号中的逗号）
        const values = lines[i].split(',').map(v => v.trim().replace(/^"|"$/g, ''));
        
        if (values.length !== headers.length) {
          console.warn(`第${i+1}行字段数量与表头不符，跳过`);
          continue;
        }
        
        // 构建记录对象
        const record: Record<string, string> = {};
        for (let j = 0; j < headers.length; j++) {
          record[headers[j]] = values[j];
        }
        records.push(record);
      }
      
      // 验证数据
      if (records.length === 0) {
        return { success: false, message: 'CSV文件格式错误或没有数据' };
      }
      
      // 导入统计
      let importedCount = 0;
      let failedCount = 0;
      
      // 处理每行数据
      for (const record of records) {
        try {
          // 企业名称是必填项，移除名称中的√字符
          let companyName = record['企业名称'] || '';
          if (!companyName) {
            failedCount++;
            continue;
          }
          
          // 判断是否为东升园区企业（名称中包含√）
          const isEastRisingPark = companyName.includes('√');
          companyName = companyName.replace(/√/g, '').trim();
          
          // 提取并处理标签
          let tags = null;
          if (record['企业优势tag']) {
            tags = record['企业优势tag'].split(';').map((tag: string) => tag.trim()).filter(Boolean);
          }
          
          // 添加到数据库，使用用户的团队ID
          await db.insert(companies).values({
            name: companyName,
            logo: record['企业logo'] || null,
            category: record['细分领域'] || null,
            subCategory: record['细分领域（补充）'] || null,
            description: record['企业简介'] || null,
            productIntro: record['产品介绍'] || null,
            advantageTags: tags,
            contactName: record['fellow姓名'] || null,
            contactPhone: record['fellow联系方式'] || null,
            isEastRisingPark,
            teamId: teamId, // 使用查询到的团队ID
            isAvailable: true,
            lastUpdated: new Date(),
          });
          
          importedCount++;
        } catch (error) {
          console.error('导入企业记录时出错:', error);
          failedCount++;
        }
      }
      
      // 记录活动日志
      try {
        await db.insert(activityLogs).values({
          teamId: teamId, // 使用查询到的团队ID
          userId: user.id,
          action: ActivityType.IMPORT_COMPANIES,
          ipAddress: '127.0.0.1', // 实际应从请求中获取
        });
      } catch (logError) {
        console.error('记录活动日志时出错:', logError);
        // 不影响整体结果，继续执行
      }
      
      // 刷新页面缓存
      revalidatePath('/dashboard/companies');
      
      return { 
        success: true, 
        message: `成功导入 ${importedCount} 条记录，失败 ${failedCount} 条记录`, 
        imported: importedCount, 
        failed: failedCount, 
        total: records.length 
      };
    } catch (csvError) {
      console.error('CSV解析错误:', csvError);
      
      // 尝试使用csv-parse库解析
      try {
        const records = parse(fileContent, {
          columns: true,
          skip_empty_lines: true,
          trim: true,
          relax_quotes: true,
          relax_column_count: true,
        });
        
        // 导入统计
        let importedCount = 0;
        let failedCount = 0;
        
        // 处理每行数据
        for (const record of records) {
          try {
            // 企业名称是必填项，移除名称中的√字符
            let companyName = record['企业名称'] || '';
            if (!companyName) {
              failedCount++;
              continue;
            }
            
            // 判断是否为东升园区企业（名称中包含√）
            const isEastRisingPark = companyName.includes('√');
            companyName = companyName.replace(/√/g, '').trim();
            
            // 提取并处理标签
            let tags = null;
            if (record['企业优势tag']) {
              tags = record['企业优势tag'].split(';').map((tag: string) => tag.trim()).filter(Boolean);
            }
            
            // 添加到数据库，使用用户的团队ID
            await db.insert(companies).values({
              name: companyName,
              logo: record['企业logo'] || null,
              category: record['细分领域'] || null,
              subCategory: record['细分领域（补充）'] || null,
              description: record['企业简介'] || null,
              productIntro: record['产品介绍'] || null,
              advantageTags: tags,
              contactName: record['fellow姓名'] || null,
              contactPhone: record['fellow联系方式'] || null,
              isEastRisingPark,
              teamId: teamId, // 使用查询到的团队ID
              isAvailable: true,
              lastUpdated: new Date(),
            });
            
            importedCount++;
          } catch (error) {
            console.error('导入企业记录时出错:', error);
            failedCount++;
          }
        }
        
        // 记录活动日志
        try {
          await db.insert(activityLogs).values({
            teamId: teamId, // 使用查询到的团队ID
            userId: user.id,
            action: ActivityType.IMPORT_COMPANIES,
            ipAddress: '127.0.0.1', // 实际应从请求中获取
          });
        } catch (logError) {
          console.error('记录活动日志时出错:', logError);
          // 不影响整体结果，继续执行
        }
        
        // 刷新页面缓存
        revalidatePath('/dashboard/companies');
        
        return { 
          success: true, 
          message: `成功导入 ${importedCount} 条记录，失败 ${failedCount} 条记录`, 
          imported: importedCount, 
          failed: failedCount, 
          total: records.length 
        };
      } catch (parseError) {
        console.error('CSV-Parse解析错误:', parseError);
        return { success: false, message: 'CSV格式解析错误，请检查文件格式' };
      }
    }
  } catch (error) {
    console.error('导入企业时出错:', error);
    return { success: false, message: '导入企业时发生错误' };
  }
} 