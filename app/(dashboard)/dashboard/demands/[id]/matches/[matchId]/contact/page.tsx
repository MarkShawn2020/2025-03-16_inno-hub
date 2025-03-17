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

interface ContactPageProps {
  params: Promise<{
    id: string;
    matchId: string;
  }>;
}

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
      <div className="mb-8">
        <Link href={`/dashboard/demands/${demandId}/matches`} className="flex items-center text-gray-500 hover:text-gray-700 transition mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          返回匹配列表
        </Link>
        <h1 className="text-2xl font-bold mb-2">企业联系方式</h1>
        <p className="text-gray-500">
          查看合作企业的详细联系方式，便于您直接沟通合作事宜
        </p>
      </div>
      
      <div className="grid md:grid-cols-2 gap-8">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>企业信息</CardTitle>
            <CardDescription>基本企业资料</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500">企业名称</h3>
              <p className="font-medium text-lg">{match.company.name}</p>
            </div>
            
            {match.company.category && (
              <div>
                <h3 className="text-sm font-medium text-gray-500">所属行业</h3>
                <p>{match.company.category}</p>
              </div>
            )}
            
            {match.company.description && (
              <div>
                <h3 className="text-sm font-medium text-gray-500">企业简介</h3>
                <p className="text-sm text-gray-700">{match.company.description}</p>
              </div>
            )}
            
            <div className="pt-2">
              <Link href={`/dashboard/companies/${match.company.id}`}>
                <Button variant="outline" className="w-full">
                  <Building className="mr-2 h-4 w-4" />
                  查看企业详情
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
        
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>联系方式</CardTitle>
            <CardDescription>企业负责人联系信息</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500">联系人</h3>
              <p className="font-medium">{match.company.contactName || '未提供'}</p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-500">联系电话</h3>
              <p className="flex items-center">
                <Phone className="mr-2 h-4 w-4 text-gray-500" />
                <a href={`tel:${match.company.contactPhone}`} className="text-blue-600 hover:underline">
                  {match.company.contactPhone || '未提供'}
                </a>
              </p>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col items-stretch gap-2 pt-2">
            {match.company.contactPhone && (
              <Button className="w-full">
                <Phone className="mr-2 h-4 w-4" />
                拨打电话
              </Button>
            )}
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

export async function generateMetadata({ params }: ContactPageProps): Promise<Metadata> {  
  const resolvedParams = await params;
  const match = await getMatchDetails(
    parseInt(resolvedParams.id), 
    parseInt(resolvedParams.matchId)
  );
  
  if (!match) {
    return {
      title: '联系信息 | 商机共振平台',
      description: '查看企业联系信息',
    };
  }
  
  return {
    title: `${match.company.name} 联系方式 | 商机共振平台`,
    description: `查看 ${match.company.name} 的联系信息`,
  };
} 