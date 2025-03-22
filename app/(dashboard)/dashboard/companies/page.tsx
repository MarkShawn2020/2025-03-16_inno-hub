import { Metadata } from 'next';
import Link from 'next/link';
import { cookies } from 'next/headers';
import { db } from '@/lib/db/drizzle';
import { companies, users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { UploadIcon, PlusCircle, Star, InfoIcon, AlertTriangle } from 'lucide-react';
import { getCompanyIndustryDistribution } from '@/lib/db/queries';
import { redirect } from 'next/navigation';
import IndustryCharts from '../industry-charts';
import { getCurrentUser, getCompanyFilter, obfuscateSensitiveInfo } from '@/lib/auth/utils';

export const metadata: Metadata = {
  title: '企业库 | 商机共振平台',
  description: '浏览企业数据库，查找潜在合作伙伴',
};

async function getCompanies(user: any = null) {
  // 根据用户登录状态获取适当的企业数据
  const filter = getCompanyFilter(user);
  
  if (filter.isAvailable) {
    return db.query.companies.findMany({
      where: eq(companies.isAvailable, true),
      orderBy: [companies.createdAt]
    });
  } else {
    // 已登录用户可查看所有企业
    return db.query.companies.findMany({
      orderBy: [companies.createdAt]
    });
  }
}

export default async function CompaniesPage() {
  // 获取当前用户（如果已登录），但不强制重定向
  const user = await getCurrentUser();
  const isLoggedIn = !!user;
  
  const companiesData = await getCompanies(user);
  const industryDistribution = await getCompanyIndustryDistribution();
  
  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">企业库</h1>
        
        {isLoggedIn ? (
          <div className="flex gap-4">
            <Link href="/dashboard/companies/import">
              <Button variant="outline" className="flex items-center gap-2">
                <UploadIcon className="h-4 w-4" />
                导入企业
              </Button>
            </Link>
            <Link href="/dashboard/companies/new">
              <Button className="flex items-center gap-2">
                <PlusCircle className="h-4 w-4" />
                添加企业
              </Button>
            </Link>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-sm text-orange-600 bg-orange-50 p-2 rounded">
            <AlertTriangle className="h-4 w-4" />
            <Link href="/sign-in" className="underline font-medium">登录</Link>
            <span>以查看完整信息并添加企业</span>
          </div>
        )}
      </div>

      {/* 图表区域 */}
      <IndustryCharts industryDistribution={industryDistribution} />
      
      {companiesData.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-medium mb-2">暂无企业数据</h3>
          <p className="text-gray-500 mb-6">系统中尚未添加任何企业</p>
          {isLoggedIn && (
            <div className="flex gap-4 justify-center">
              <Link href="/dashboard/companies/import">
                <Button variant="outline" className="flex items-center gap-2">
                  <UploadIcon className="h-4 w-4" />
                  导入企业
                </Button>
              </Link>
              <Link href="/dashboard/companies/new">
                <Button className="flex items-center gap-2">
                  <PlusCircle className="h-4 w-4" />
                  添加企业
                </Button>
              </Link>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {companiesData.map((company) => (
            <Link href={isLoggedIn ? `/dashboard/companies/${company.id}` : `/sign-in?redirect=/dashboard/companies/${company.id}`} key={company.id}>
              <Card className="p-6 h-full hover:shadow-md transition-shadow cursor-pointer relative">
                {!isLoggedIn && (
                  <div className="absolute top-2 right-2 text-orange-500" title="登录后查看完整详情">
                    <InfoIcon className="h-4 w-4" />
                  </div>
                )}
                
                <div className="flex justify-between items-start">
                  <h3 className="text-lg font-semibold mb-2">{company.name}</h3>
                  {isLoggedIn && user && company.teamId === user.id && (
                    <span className="text-yellow-500" title="您创建的企业">
                      <Star className="h-4 w-4" />
                    </span>
                  )}
                </div>
                
                <p className="text-gray-500 text-sm mb-3">行业: {company.category || '未指定'}</p>
                <p className="text-gray-500 text-sm mb-3">子行业: {company.subCategory || '未指定'}</p>
                
                {company.description && (
                  <p className="text-sm text-gray-600 line-clamp-3 mb-3">
                    {isLoggedIn ? company.description : obfuscateSensitiveInfo(company.description, isLoggedIn)}
                  </p>
                )}
                
                {company.contactName && isLoggedIn && (
                  <p className="text-sm text-gray-600 mb-1">联系人: {company.contactName}</p>
                )}
                
                <div className="text-xs text-gray-400">
                  添加于 {new Date(company.createdAt).toLocaleDateString()}
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
      
      {!isLoggedIn && (
        <div className="mt-8 p-4 bg-gray-50 rounded-lg text-center">
          <h3 className="text-lg font-medium mb-2">登录获取更多功能</h3>
          <p className="text-gray-600 mb-4">登录后可查看详细联系方式，添加企业，并管理您的需求匹配</p>
          <Link href="/sign-in">
            <Button>登录或注册</Button>
          </Link>
        </div>
      )}
    </div>
  );
} 