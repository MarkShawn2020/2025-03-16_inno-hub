'use server';

import { desc, and, eq, isNull, count, gte, lt } from 'drizzle-orm';
import { db } from './drizzle';
import { activityLogs, demands, teamMembers, teams, users, companies, matchResults } from './schema';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth/session';

export async function getUser() {

  const sessionCookie = (await cookies()).get('session');
  if (!sessionCookie || !sessionCookie.value) {
    return null;
  }

  const sessionData = await verifyToken(sessionCookie.value);
  if (
    !sessionData ||
    !sessionData.user ||
    typeof sessionData.user.id !== 'number'
  ) {
    return null;
  }

  if (new Date(sessionData.expires) < new Date()) {
    return null;
  }

  const user = await db
    .select()
    .from(users)
    .where(and(eq(users.id, sessionData.user.id), isNull(users.deletedAt)))
    .limit(1);

  if (user.length === 0) {
    return null;
  }

  return user[0];
}

export async function getTeamByStripeCustomerId(customerId: string) {
  const result = await db
    .select()
    .from(teams)
    .where(eq(teams.stripeCustomerId, customerId))
    .limit(1);

  return result.length > 0 ? result[0] : null;
}

export async function updateTeamSubscription(
  teamId: number,
  subscriptionData: {
    stripeSubscriptionId: string | null;
    stripeProductId: string | null;
    planName: string | null;
    subscriptionStatus: string;
  }
) {
  await db
    .update(teams)
    .set({
      ...subscriptionData,
      updatedAt: new Date(),
    })
    .where(eq(teams.id, teamId));
}

export async function getUserWithTeam(userId: number) {
  const result = await db
    .select({
      user: users,
      teamId: teamMembers.teamId,
    })
    .from(users)
    .leftJoin(teamMembers, eq(users.id, teamMembers.userId))
    .where(eq(users.id, userId))
    .limit(1);

  return result[0];
}

export async function getActivityLogs() {
  const user = await getUser();
  if (!user) {
    throw new Error('User not authenticated');
  }

  return await db
    .select({
      id: activityLogs.id,
      action: activityLogs.action,
      timestamp: activityLogs.timestamp,
      ipAddress: activityLogs.ipAddress,
      userName: users.name,
    })
    .from(activityLogs)
    .leftJoin(users, eq(activityLogs.userId, users.id))
    .where(eq(activityLogs.userId, user.id))
    .orderBy(desc(activityLogs.timestamp))
    .limit(10);
}

export async function getTeamForUser(userId: number) {
  const result = await db.query.users.findFirst({
    where: eq(users.id, userId),
    with: {
      teamMembers: {
        with: {
          team: {
            with: {
              teamMembers: {
                with: {
                  user: {
                    columns: {
                      id: true,
                      name: true,
                      email: true,
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  });

  return result?.teamMembers[0]?.team || null;
}

export async function getDemandsForUser() {
  
    const user = await getUser();
    if (!user) {
      return [];
    }

    const allDemands = await db.query.demands.findMany({
      orderBy: [desc(demands.createdAt)],
      with: {
        submitter: {
          columns: {
            id: true,
            name: true,
            email: true,
          }
        },
        matchResults: {
          with: {
            company: true,
          },
        },
      },
    });

    return allDemands;
  }

// 获取概览页统计数据
export async function getDashboardStats() {
  const user = await getUser();
  if (!user) {
    return null;
  }

  // 获取总需求数
  const totalDemands = await db.select({ count: count() }).from(demands);
  
  // 获取总企业数
  const totalCompanies = await db.select({ count: count() }).from(companies);
  
  // 获取匹配成功的数量
  const successfulMatches = await db.select({ count: count() })
    .from(matchResults)
    .where(eq(matchResults.isRecommended, true));
  
  // 获取上个月的数据（示例比较数据）
  const lastMonth = new Date();
  lastMonth.setMonth(lastMonth.getMonth() - 1);
  
  const prevMonthDemands = await db.select({ count: count() })
    .from(demands)
    .where(
      and(
        gte(demands.createdAt, new Date(lastMonth.getFullYear(), lastMonth.getMonth(), 1)),
        lt(demands.createdAt, new Date(lastMonth.getFullYear(), lastMonth.getMonth() + 1, 1))
      )
    );
  
  const prevMonthCompanies = await db.select({ count: count() })
    .from(companies)
    .where(
      and(
        gte(companies.createdAt, new Date(lastMonth.getFullYear(), lastMonth.getMonth(), 1)),
        lt(companies.createdAt, new Date(lastMonth.getFullYear(), lastMonth.getMonth() + 1, 1))
      )
    );
  
  const prevMonthMatches = await db.select({ count: count() })
    .from(matchResults)
    .where(
      and(
        eq(matchResults.isRecommended, true),
        gte(matchResults.createdAt, new Date(lastMonth.getFullYear(), lastMonth.getMonth(), 1)),
        lt(matchResults.createdAt, new Date(lastMonth.getFullYear(), lastMonth.getMonth() + 1, 1))
      )
    );
  
  // 计算匹配率及其变化
  const matchRate = totalDemands[0].count > 0 
    ? (successfulMatches[0].count * 100 / totalDemands[0].count).toFixed(0)
    : 0;
  
  // 返回统计结果
  return {
    totalDemands: Number(totalDemands[0].count),
    totalCompanies: Number(totalCompanies[0].count),
    successfulMatches: Number(successfulMatches[0].count),
    matchRate: Number(matchRate),
    
    // 月度变化
    demandChange: prevMonthDemands[0].count > 0 ? Number(totalDemands[0].count) - Number(prevMonthDemands[0].count) : 0,
    companyChange: prevMonthCompanies[0].count > 0 ? Number(totalCompanies[0].count) - Number(prevMonthCompanies[0].count) : 0,
    matchChange: prevMonthMatches[0].count > 0 ? Number(successfulMatches[0].count) - Number(prevMonthMatches[0].count) : 0,
    matchRateChange: 0, // 这个需要更复杂的计算，此处简化处理
  };
}

// 获取最近的需求
export async function getRecentDemands(limit = 2) {
  const user = await getUser();
  if (!user) {
    return [];
  }
  
  return await db.query.demands.findMany({
    orderBy: [desc(demands.createdAt)],
    limit,
    with: {
      matchResults: {
        with: {
          company: true
        }
      }
    }
  });
}

// 获取最新匹配
export async function getRecentMatches(limit = 2) {
  const user = await getUser();
  if (!user) {
    return [];
  }
  
  return await db.query.matchResults.findMany({
    orderBy: [desc(matchResults.createdAt)],
    limit,
    with: {
      demand: true,
      company: true
    }
  });
}

// 获取企业行业分布数据
export async function getCompanyIndustryDistribution() {
  const user = await getUser();
  if (!user) {
    return [];
  }
  
  // 获取所有企业的行业分类
  const allCompanies = await db.select({
    category: companies.category
  }).from(companies);
  
  // 计算各行业的数量
  const distribution = new Map<string, number>();
  
  // 对空分类进行处理
  allCompanies.forEach(company => {
    const category = company.category || '未分类';
    distribution.set(category, (distribution.get(category) || 0) + 1);
  });
  
  // 转换为数组格式，适合图表使用
  const result = Array.from(distribution.entries()).map(([name, value]) => ({
    name,
    value
  }));
  
  // 按照数量排序
  return result.sort((a, b) => b.value - a.value);
}