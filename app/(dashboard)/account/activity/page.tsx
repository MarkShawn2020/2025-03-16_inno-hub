import { Metadata } from 'next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  FileText, Building, User, Link2, Settings, AlertTriangle, 
  LogIn, LogOut, Download, Filter
} from 'lucide-react';

export const metadata: Metadata = {
  title: '活动记录 | 商机匹配平台',
  description: '查看您的账户活动记录',
};

const activities = [
  {
    id: '1',
    type: 'login',
    description: '登录成功',
    details: 'Chrome on Windows',
    ip: '123.45.67.89',
    time: '今天 09:32',
    icon: LogIn,
  },
  {
    id: '2',
    type: 'demand',
    description: '创建了新需求',
    details: '智慧城市解决方案',
    time: '今天 10:15',
    icon: FileText,
  },
  {
    id: '3',
    type: 'company',
    description: '导入了企业数据',
    details: '导入了32家企业',
    time: '昨天 15:47',
    icon: Building,
  },
  {
    id: '4',
    type: 'profile',
    description: '更新了个人信息',
    details: '修改了联系电话',
    time: '昨天 14:32',
    icon: User,
  },
  {
    id: '5',
    type: 'match',
    description: '生成了匹配结果',
    details: '为"智慧城市解决方案"生成了匹配结果',
    time: '2天前',
    icon: Link2,
  },
  {
    id: '6',
    type: 'settings',
    description: '修改了通知设置',
    details: '启用了邮件通知',
    time: '3天前',
    icon: Settings,
  },
  {
    id: '7',
    type: 'security',
    description: '尝试登录失败',
    details: 'Firefox on macOS',
    ip: '203.0.113.42',
    time: '1周前',
    icon: AlertTriangle,
  },
  {
    id: '8',
    type: 'logout',
    description: '退出登录',
    details: 'Chrome on Windows',
    time: '1周前',
    icon: LogOut,
  },
];

export default function ActivityPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">活动记录</h1>
        <div className="flex gap-2">
          <Button variant="outline" className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            <span>筛选</span>
          </Button>
          <Button variant="outline" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            <span>导出</span>
          </Button>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>账户活动</CardTitle>
          <CardDescription>
            查看您的账户最近活动记录，包括登录、操作和设置更改
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="divide-y divide-gray-200">
            {activities.map((activity) => (
              <li key={activity.id} className="py-4">
                <div className="flex">
                  <div className="mr-4">
                    <div className={`p-2 rounded-full ${
                      activity.type === 'security' 
                        ? 'bg-red-100 text-red-600' 
                        : activity.type === 'login' || activity.type === 'logout'
                        ? 'bg-blue-100 text-blue-600'
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      <activity.icon className="h-5 w-5" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="font-medium">{activity.description}</p>
                      <p className="text-sm text-gray-500">{activity.time}</p>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{activity.details}</p>
                    {activity.ip && (
                      <p className="text-xs text-gray-500 mt-1">IP: {activity.ip}</p>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
          
          <div className="mt-6 text-center">
            <Button variant="outline">加载更多</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 