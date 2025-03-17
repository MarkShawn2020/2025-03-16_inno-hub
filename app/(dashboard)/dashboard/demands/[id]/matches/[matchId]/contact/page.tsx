import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { db } from '@/lib/db/drizzle';
import { demands, matchResults } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Mail, Phone, Building } from 'lucide-react';
import { unstable_noStore } from 'next/cache';
import { ContactButtons } from './components/ContactButtons';

interface ContactPageProps {
  params: Promise<{
    id: string;
    matchId: string;
  }>;
}

export const metadata: Metadata = {
  title: '联系企业 | 商机匹配平台',
  description: '联系匹配的企业，开始合作洽谈',
};

async function getMatchDetails(demandId: number, matchId: number) {
  unstable_noStore();
  
  try {
    // 获取匹配结果和相关企业信息
    const match = await db.query.matchResults.findFirst({
      where: and(
        eq(matchResults.id, matchId),
        eq(matchResults.demandId, demandId)
      ),
      with: {
        company: true,
        demand: true,
      },
    });
    
    if (!match) {
      return null;
    }
    
    return match;
  } catch (error) {
    console.error('获取匹配详情时出错:', error);
    return null;
  }
}

export default async function ContactPage({ params }: ContactPageProps) {
  // 修复：先await params再使用其属性
  const resolvedParams = await params;
  const demandId = parseInt(resolvedParams.id);
  const matchId = parseInt(resolvedParams.matchId);
  
  if (isNaN(demandId) || isNaN(matchId)) {
    notFound();
  }
  
  const match = await getMatchDetails(demandId, matchId);
  
  if (!match) {
    notFound();
  }
  
  return (
    <div className="container mx-auto py-10">
      <div className="mb-6">
        <Link 
          href={`/dashboard/demands/${demandId}/matches`} 
          className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          返回匹配结果列表
        </Link>
        <h1 className="text-2xl font-bold mb-2">联系企业</h1>
        <p className="text-gray-600">
          与匹配的企业洽谈合作事宜
        </p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>企业信息</CardTitle>
            <CardDescription>匹配企业的基本联系信息</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center mr-3">
                  <Building className="h-5 w-5 text-gray-500" />
                </div>
                <div>
                  <h3 className="font-medium">{match.company.name}</h3>
                  <p className="text-sm text-gray-500">
                    {match.company.category} {match.company.subCategory ? `/ ${match.company.subCategory}` : ''}
                  </p>
                </div>
              </div>
              
              {match.company.contactName && (
                <div className="flex items-center text-sm text-gray-600">
                  <span className="font-medium w-20">联系人:</span>
                  <span>{match.company.contactName}</span>
                </div>
              )}
              
              {match.company.contactPhone && (
                <div className="flex items-center text-sm text-gray-600">
                  <Phone className="h-4 w-4 mr-2" />
                  <span>{match.company.contactPhone}</span>
                </div>
              )}
              
              <div className="pt-4">
                <h4 className="text-sm font-medium mb-2">匹配度</h4>
                <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                  {Math.floor(match.score * 100)}%
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>需求信息</CardTitle>
            <CardDescription>您提交的需求摘要</CardDescription>
          </CardHeader>
          <CardContent>
            <h3 className="font-medium mb-2">{match.demand.title}</h3>
            <p className="text-sm text-gray-600 line-clamp-3 mb-4">
              {match.demand.description}
            </p>
            <Link href={`/dashboard/demands/${demandId}`}>
              <Button variant="outline" size="sm">查看完整需求</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
      
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>联系方式</CardTitle>
          <CardDescription>
            您可以通过以下方式联系该企业
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              目前此功能正在开发中，您可以通过企业提供的联系电话直接联系。后续我们会提供更多便捷的联系方式。
            </p>
            
            {/* 使用客户端组件处理交互 */}
            <ContactButtons 
              demandId={demandId} 
              phoneNumber={match.company.contactPhone || undefined} 
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 