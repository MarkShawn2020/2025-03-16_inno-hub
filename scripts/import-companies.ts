import { parse } from 'csv-parse/sync';
import { readFileSync } from 'fs';
import { config } from 'dotenv';
import { db } from '../lib/db/index';
import { companies, matchResults } from '../lib/db/schema';
import { eq, and, like, isNull } from 'drizzle-orm';

// 加载环境变量
config();

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

async function postClean() {
  try {
    // 1. 先找出所有没有 category 的公司
    const companiesWithoutCategory = await db
      .select()
      .from(companies)
      .where(isNull(companies.category));

    console.log(`Found ${companiesWithoutCategory.length} companies without category`);

    // 2. 删除这些公司的相关 match_results 记录
    for (const company of companiesWithoutCategory) {
      const deleteMatchResults = await db
        .delete(matchResults)
        .where(eq(matchResults.companyId, company.id));
      console.log(`Deleted ${deleteMatchResults.rowCount} match results for company ${company.name}`);
    }

    // 3. 现在可以安全地删除这些公司
    const deleteResult = await db
      .delete(companies)
      .where(isNull(companies.category));
    console.log(`Deleted ${deleteResult.rowCount} companies without category`);

    // 4. 重命名以 "√" 开头的公司
    const companiesToRename = await db
      .select()
      .from(companies)
      .where(like(companies.name, '√%'));

    for (const company of companiesToRename) {
      const newName = company.name.replace(/^√\s*/, '');
      await db
        .update(companies)
        .set({ name: newName })
        .where(eq(companies.id, company.id));
      console.log(`Renamed company from "${company.name}" to "${newName}"`);
    }

    console.log('Post-clean completed successfully');
  } catch (error) {
    console.error('Error during post-clean:', error);
    throw error;
  }
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
      // 跳过没有企业名称或细分领域的记录
      if (!record.企业名称 || !record.细分领域) {
        console.log(`Skipping company "${record.企业名称}" due to missing required fields`);
        continue;
      }

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
    
    // 执行后清理
    await postClean();
    
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