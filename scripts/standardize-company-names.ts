import { config } from 'dotenv';
import { db } from '../lib/db/index';
import { companies, matchResults } from '../lib/db/schema';
import { eq, sql, inArray } from 'drizzle-orm';

// 加载环境变量
config();

// 标准化公司名称
function standardizeCompanyName(name: string): string {
  // 1. 去除首尾空格
  // 2. 去除 √ 前缀（包括可能的前后空格）
  return name
    .trim()
    .replace(/^[\s]*√[\s]*/, '')
    .trim();
}

interface DuplicateCompany {
  name: string;
  count: number;
  keep_id: number;
  all_ids: number[];
}

async function standardizeCompanyNames() {
  try {
    // 1. 获取所有公司
    const allCompanies = await db.select().from(companies);
    console.log(`Found ${allCompanies.length} companies to process`);

    // 2. 标准化并更新公司名称
    let updatedCount = 0;
    for (const company of allCompanies) {
      const standardizedName = standardizeCompanyName(company.name);
      
      // 只有当名称发生变化时才更新
      if (standardizedName !== company.name) {
        await db
          .update(companies)
          .set({ name: standardizedName })
          .where(eq(companies.id, company.id));
        
        console.log(`Updated: "${company.name}" -> "${standardizedName}"`);
        updatedCount++;
      }
    }

    // 3. 找出重复的公司名称
    const duplicateCompaniesResult = await db.execute(sql`
      WITH duplicates AS (
        SELECT name, COUNT(*) as count,
               MIN(id) as keep_id,
               array_agg(id) as all_ids
        FROM companies
        GROUP BY name
        HAVING COUNT(*) > 1
      )
      SELECT * FROM duplicates
    `);

    const duplicateCompanies = duplicateCompaniesResult.rows.map(row => ({
      name: row.name as string,
      count: row.count as number,
      keep_id: row.keep_id as number,
      all_ids: row.all_ids as number[]
    }));
    const duplicateCount = duplicateCompanies.length;

    // 4. 处理重复的公司
    let deletedCount = 0;
    for (const duplicate of duplicateCompanies) {
      const { name, count, keep_id, all_ids } = duplicate;
      console.log(`\nFound ${count} duplicates for company "${name}"`);
      console.log(`Keeping ID: ${keep_id}`);
      
      // 删除重复公司的 match_results 记录
      for (const id of all_ids) {
        if (id !== keep_id) {
          const deleteMatchResults = await db
            .delete(matchResults)
            .where(eq(matchResults.companyId, id));
          console.log(`Deleted ${deleteMatchResults.rowCount} match results for company ID ${id}`);
        }
      }

      // 删除重复的公司记录
      const deleteResult = await db
        .delete(companies)
        .where(inArray(companies.id, all_ids.filter(id => id !== keep_id)));
      
      deletedCount += deleteResult.rowCount ?? 0;
      console.log(`Deleted ${deleteResult.rowCount} duplicate records`);
    }

    console.log(`\nStandardization completed:`);
    console.log(`- Total companies processed: ${allCompanies.length}`);
    console.log(`- Companies updated: ${updatedCount}`);
    console.log(`- Companies unchanged: ${allCompanies.length - updatedCount}`);
    console.log(`- Duplicate companies found: ${duplicateCount}`);
    console.log(`- Duplicate records deleted: ${deletedCount}`);

  } catch (error) {
    console.error('Error during standardization:', error);
    throw error;
  }
}

// 执行标准化
standardizeCompanyNames()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Script failed:', error);
    process.exit(1);
  }); 