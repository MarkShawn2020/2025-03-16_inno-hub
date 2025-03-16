import { Metadata } from 'next';
import Link from 'next/link';
import { cookies } from 'next/headers';
import { db } from '@/lib/db/drizzle';
import { companies, users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { UploadIcon, PlusCircle } from 'lucide-react';

export const metadata: Metadata = {
  title: '企业管理 | 商机匹配平台',
  description: '管理您的企业数据库',
};

// 与需求详情页使用相同的获取用户ID方法
async function getCurrentUserId() {
  try {
    // 直接从cookie获取userId（如果有）
    const cookieList = cookies();
    const userIdCookie = cookieList.get('userId');
    if (userIdCookie) {
      return userIdCookie.value;
    }
    
    // 假设还有其他获取用户ID的途径，根据项目实际情况调整
    return null;
  } catch (error) {
    console.error('获取当前用户ID失败:', error);
    return null;
  }
}

async function getCompanies(userId: string) {
  return db.query.companies.findMany({
    where: eq(companies.userId, parseInt(userId)),
    orderBy: [companies.createdAt]
  });
}

export default async function CompaniesPage() {
  // 获取当前用户
  const userId = await getCurrentUserId();
  
  if (!userId) {
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
  
  const companies = await getCompanies(userId);
  
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
      
      {companies.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-medium mb-2">暂无企业数据</h3>
          <p className="text-gray-500 mb-6">您尚未添加任何企业到系统中</p>
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
                <h3 className="text-lg font-semibold mb-2">{company.name}</h3>
                <p className="text-gray-500 text-sm mb-3">行业: {company.industry || '未指定'}</p>
                <p className="text-gray-500 text-sm mb-3">地区: {company.location || '未指定'}</p>
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