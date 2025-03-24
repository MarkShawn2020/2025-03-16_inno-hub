import { parse } from 'csv-parse/sync';
import { readFileSync } from 'fs';
import { config } from 'dotenv';
import { db } from '../lib/db/index';
import { companies } from '../lib/db/schema';
import { eq } from 'drizzle-orm';


interface CompanyCSV {
  企业名称: string;
  企业logo: string;
  细分领域: string;
  '细分领域（补充）': string;
  企业简介: string;
  产品介绍: string;
  企业优势tag: string;
  产品图片1: string;
  产品图片2: string;
  产品图片3: string;
  其他: string;
  fellow姓名: string;
  fellow联系方式: string;
}

async function importCompanies() {
  try {
    // 读取 CSV 文件
    const fileContent = readFileSync('docs/AI百货大楼企业信息 (1).csv', 'utf-8');
    const records = parse(fileContent, {
      columns: true,
      skip_empty_lines: true,
    }) as CompanyCSV[];

    console.log(`Found ${records.length} companies to import`);

    // 处理每条记录
    for (const record of records) {
      if (!record.企业名称) continue;

      // 处理企业优势标签
      const advantageTags = record.企业优势tag
        ? record.企业优势tag.split('；').filter(Boolean)
        : [];

      // 检查公司是否已存在
      const existingCompany = await db
        .select()
        .from(companies)
        .where(eq(companies.name, record.企业名称))
        .limit(1);

      if (existingCompany.length > 0) {
        // 更新现有公司
        await db
          .update(companies)
          .set({
            logo: record.企业logo || null,
            category: record.细分领域 || null,
            subCategory: record['细分领域（补充）'] || null,
            description: record.企业简介 || null,
            productIntro: record.产品介绍 || null,
            advantageTags: advantageTags,
            contactName: record.fellow姓名 || null,
            contactPhone: record.fellow联系方式 || null,
            lastUpdated: new Date(),
          })
          .where(eq(companies.name, record.企业名称));
        console.log(`Updated company: ${record.企业名称}`);
      } else {
        // 创建新公司
        await db.insert(companies).values({
          name: record.企业名称,
          logo: record.企业logo || null,
          category: record.细分领域 || null,
          subCategory: record['细分领域（补充）'] || null,
          description: record.企业简介 || null,
          productIntro: record.产品介绍 || null,
          advantageTags: advantageTags,
          contactName: record.fellow姓名 || null,
          contactPhone: record.fellow联系方式 || null,
          isAvailable: true,
          isEastRisingPark: true,
        });
        console.log(`Created new company: ${record.企业名称}`);
      }
    }

    console.log('Import completed successfully');
  } catch (error) {
    console.error('Error importing companies:', error);
    throw error;
  }
}

// 执行导入
importCompanies()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Script failed:', error);
    process.exit(1);
  }); 