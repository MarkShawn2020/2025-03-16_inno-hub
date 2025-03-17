import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { db } from '@/lib/db/drizzle';
import { companies } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Building, Star, Shield, Lock } from 'lucide-react';
import { getUser } from '@/lib/db/queries';

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const company = await getCompany(parseInt(params.id));
  
  if (!company) {
    return {
      title: '企业未找到 | 商机匹配平台',
    };
  }
  
  return {
    title: `${company.name} | 商机匹配平台`,
    description: company.description || `查看${company.name}的详细信息`,
  };
}

async function getCompany(id: number) {
  return db.query.companies.findFirst({
    where: eq(companies.id, id),
  });
}

export default async function CompanyDetailPage({ params }: { params: { id: string } }) {
  // 获取当前用户和企业信息
  const user = await getUser();
  const companyId = parseInt(params.id);
  const company = await getCompany(companyId);
  
  if (!company) {
    notFound();
  }
  
  // 判断用户是否是企业创建者
  const isOwner = user?.id === company.teamId;
  
  // 判断是否为东升园区企业
  const isEastRisingPark = company.isEastRisingPark;
  
  // 将标签数组转换为可显示的格式
  const tags = Array.isArray(company.advantageTags) 
    ? company.advantageTags 
    : [];

  return (
    <div className="container mx-auto py-10">
      <div className="mb-6">
        <Link href="/dashboard/companies" className="flex items-center text-gray-500 hover:text-gray-700 transition mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          返回企业列表
        </Link>
        
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">{company.name}</h1>
            {isEastRisingPark && (
              <Badge variant="outline" className="border-blue-500 text-blue-500">
                东升园区企业
              </Badge>
            )}
            {isOwner && (
              <Badge variant="outline" className="border-yellow-500 text-yellow-500 flex items-center gap-1">
                <Star className="h-3 w-3" /> 
                我的企业
              </Badge>
            )}
          </div>
          
          {isOwner && (
            <Link href={`/dashboard/companies/${companyId}/edit`}>
              <Button variant="outline">编辑企业</Button>
            </Link>
          )}
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 左侧：企业基本信息 */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>企业信息</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500">行业分类</h3>
                <p>{company.category || '未指定'} {company.subCategory ? `/ ${company.subCategory}` : ''}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500">企业简介</h3>
                <p className="whitespace-pre-wrap">{company.description || '暂无描述'}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500">产品介绍</h3>
                <p className="whitespace-pre-wrap">{company.productIntro || '暂无产品介绍'}</p>
              </div>
              
              {tags.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">企业优势标签</h3>
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag, index) => (
                      <Badge key={index} variant="secondary">{tag}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* 企业产品信息和其他公开信息卡片可在此添加 */}
        </div>
        
        {/* 右侧：联系信息和其他敏感信息 */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>联系信息</CardTitle>
                {!isOwner && (
                  <div className="text-amber-500 flex items-center gap-1 text-sm">
                    <Shield className="h-4 w-4" />
                    {company.contactName ? '部分信息' : '信息受限'}
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {isOwner ? (
                <>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">联系人</h3>
                    <p>{company.contactName || '未设置'}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">联系电话</h3>
                    <p>{company.contactPhone || '未设置'}</p>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">联系人</h3>
                    {company.contactName ? (
                      <p>{company.contactName.charAt(0)}{'*'.repeat(company.contactName.length > 1 ? company.contactName.length - 1 : 1)}</p>
                    ) : (
                      <p className="flex items-center gap-2 text-gray-400">
                        <Lock className="h-4 w-4" />
                        需要权限查看
                      </p>
                    )}
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">联系电话</h3>
                    <p className="flex items-center gap-2 text-gray-400">
                      <Lock className="h-4 w-4" />
                      需要权限查看
                    </p>
                  </div>
                  
                  <Separator className="my-4" />
                  
                  <div className="text-center">
                    <p className="text-sm text-gray-500 mb-4">想查看完整联系信息？</p>
                    <Button className="w-full">申请查看完整信息</Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
          
          {/* 企业详细评级和合作记录卡片（仅对创建者或特定用户显示） */}
          {isOwner && (
            <Card>
              <CardHeader>
                <CardTitle>企业管理</CardTitle>
                <CardDescription>企业评级和其他管理信息</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">企业评级</h3>
                  <p>{company.rating ? `${company.rating}/5` : '暂无评级'}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500">活跃项目数</h3>
                  <p>{company.activeProjectCount || 0}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500">最后更新</h3>
                  <p>{company.lastUpdated ? new Date(company.lastUpdated).toLocaleDateString() : '未知'}</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
} 