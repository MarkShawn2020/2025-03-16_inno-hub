import { config } from 'dotenv';
import { db } from '../lib/db/index';
import { companies, matchResults } from '../lib/db/schema';
import { eq, or, like } from 'drizzle-orm';

// 加载环境变量
config();

async function cleanCheckmarkCompanies() {
  try {
    // 1. 找出所有以 √ 开头的公司（包括前后可能有空格的情况）
    const checkmarkCompanies = await db
      .select()
      .from(companies)
      .where(
        or(
          like(companies.name, '√%'),
          like(companies.name, ' √%'),
          like(companies.name, '√ %'),
          like(companies.name, ' √ %')
        )
      );

    console.log(`Found ${checkmarkCompanies.length} companies starting with √ (including spaces)`);

    // 2. 删除这些公司的相关 match_results 记录
    for (const company of checkmarkCompanies) {
      const deleteMatchResults = await db
        .delete(matchResults)
        .where(eq(matchResults.companyId, company.id));
      console.log(`Deleted ${deleteMatchResults.rowCount} match results for company "${company.name}"`);
    }

    // 3. 删除这些公司
    const deleteResult = await db
      .delete(companies)
      .where(
        or(
          like(companies.name, '√%'),
          like(companies.name, ' √%'),
          like(companies.name, '√ %'),
          like(companies.name, ' √ %')
        )
      );
    
    console.log(`Deleted ${deleteResult.rowCount} companies starting with √`);
    console.log('Cleanup completed successfully');

  } catch (error) {
    console.error('Error during cleanup:', error);
    throw error;
  }
}

// 执行清理
cleanCheckmarkCompanies()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Script failed:', error);
    process.exit(1);
  }); 