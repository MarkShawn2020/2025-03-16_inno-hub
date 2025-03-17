import { Metadata } from 'next';
import Link from 'next/link';
import { cookies } from 'next/headers';
import { db } from '@/lib/db/drizzle';
import { companies, users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { UploadIcon, PlusCircle, Star } from 'lucide-react';
import { getCompanyIndustryDistribution, getUser } from '@/lib/db/queries';
import { redirect } from 'next/navigation';
import IndustryCharts from '../industry-charts';
export const metadata: Metadata = {
  title: '企业管理 | 商机匹配平台',
  description: '管理您的企业数据库',
};



async function getCompanies() {
  // 获取所有企业记录，不限于用户自己的团队
  return db.query.companies.findMany({
    orderBy: [companies.createdAt]
  });
}

export default async function CompaniesPage() {
  // 获取当前用户
  const user = await getUser();
  if (!user) {
    redirect('/sign-in');
  }
  
  if (!user.id) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">未授权访问</h2>
          <p className="mb-4">请先登录以访问企业管理页面。</p>
          <Link href="/login">
            <Button>登录</Button>
          </Link>
        </Card>
      </div>
    );
  }
  
  const companies = await getCompanies();
  const industryDistribution = await getCompanyIndustryDistribution();
  
  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">企业管理</h1>
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
      </div>

            {/* 图表区域 */}
            <IndustryCharts industryDistribution={industryDistribution} />
      
      {companies.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-medium mb-2">暂无企业数据</h3>
          <p className="text-gray-500 mb-6">系统中尚未添加任何企业</p>
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
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {companies.map((company) => (
            <Link href={`/dashboard/companies/${company.id}`} key={company.id}>
              <Card className="p-6 h-full hover:shadow-md transition-shadow cursor-pointer">
                <div className="flex justify-between items-start">
                  <h3 className="text-lg font-semibold mb-2">{company.name}</h3>
                  {company.teamId === user.id && (
                    <span className="text-yellow-500" title="您创建的企业">
                      <Star className="h-4 w-4" />
                    </span>
                  )}
                </div>
                <p className="text-gray-500 text-sm mb-3">行业: {company.category || '未指定'}</p>
                <p className="text-gray-500 text-sm mb-3">子行业: {company.subCategory || '未指定'}</p>
                {company.description && (
                  <p className="text-sm text-gray-600 line-clamp-3 mb-3">{company.description}</p>
                )}
                <div className="text-xs text-gray-400">
                  添加于 {new Date(company.createdAt).toLocaleDateString()}
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
} 