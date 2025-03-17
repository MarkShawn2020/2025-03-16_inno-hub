import { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { PlusCircle, Trash2 } from 'lucide-react';
import { DemandStatusBadge } from './components/demand-status-badge';
import { formatDate } from '@/lib/utils';
import { getDemandsForUser } from '@/lib/db/queries';
import { unstable_noStore } from 'next/cache';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { UserAvatar } from '@/components/UserAvatar';

export const metadata: Metadata = {
  title: '企业需求管理 | 商机匹配平台',
  description: '管理您提交的企业需求和匹配结果',
};



export default async function DemandsPage() {
  unstable_noStore() // opt out before we even get to the try/catch

  const userDemands = await getDemandsForUser();

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">企业需求管理</h1>
        <Link href="/dashboard/demands/new">
          <Button>
            <PlusCircle className="w-4 h-4 mr-2" />
            新增需求
          </Button>
        </Link>
      </div>

      {userDemands.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-medium text-gray-900 mb-2">暂无需求记录</h3>
          <p className="text-gray-500 mb-6">
            您还没有提交任何企业需求，点击"新增需求"按钮开始匹配合作伙伴
          </p>
          <Link href="/dashboard/demands/new">
            <Button>
              <PlusCircle className="w-4 h-4 mr-2" />
              提交第一个需求
            </Button>
          </Link>
        </div>
      ) : (
        <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 rounded-lg">
          <table className="min-w-full divide-y divide-gray-300">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900">
                  需求标题
                </th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                  提交时间
                </th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                  状态
                </th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                  匹配企业数
                </th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                  提交人
                </th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {userDemands.map((demand) => (
                <tr key={demand.id}>
                  <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900">
                    <Link
                      href={`/dashboard/demands/${demand.id}`}
                      className="hover:text-orange-500 hover:underline"
                    >
                      {demand.title}
                    </Link>
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    {formatDate(demand.createdAt)}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    <DemandStatusBadge status={demand.status} />
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    {demand.matchResults.length}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    <div className="flex items-center gap-2">
                      <UserAvatar 
                        user={demand.submitter} 
                        className="h-6 w-6 ring-1 ring-gray-100" 
                        fallbackClassName="text-xs"
                        showBorder={false}
                      />
                      <span>{demand.submitter?.name || '未知用户'}</span>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    <div className="flex space-x-2">
                      <Link href={`/dashboard/demands/${demand.id}`}>
                        <Button variant="outline" size="sm">
                          查看详情
                        </Button>
                      </Link>
                      <Link href={`/dashboard/demands/${demand.id}/matches`}>
                        <Button size="sm">查看匹配</Button>
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
} 