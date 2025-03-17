import { Metadata } from 'next';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, MoreHorizontal, Trash2, Edit2, Mail } from 'lucide-react';

export const metadata: Metadata = {
  title: '团队管理 | 商机共振平台',
  description: '管理您的团队成员',
};

const members = [
  {
    id: '1',
    name: '张三',
    email: 'zhangsan@example.com',
    role: '管理员',
    avatar: '',
    status: '已接受',
  },
  {
    id: '2',
    name: '李四',
    email: 'lisi@example.com',
    role: '编辑者',
    avatar: '',
    status: '已接受',
  },
  {
    id: '3',
    name: '王五',
    email: 'wangwu@example.com',
    role: '查看者',
    avatar: '',
    status: '待接受',
  },
];

export default function TeamPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">团队管理</h1>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          <span>邀请成员</span>
        </Button>
      </div>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>邀请新成员</CardTitle>
          <CardDescription>
            向您的团队添加新成员，协同管理商机共振流程
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <div className="grid sm:grid-cols-4 gap-4">
              <div className="sm:col-span-2">
                <Label htmlFor="email">电子邮箱</Label>
                <Input id="email" type="email" placeholder="colleague@example.com" />
              </div>
              <div>
                <Label htmlFor="role">角色</Label>
                <select
                  id="role"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  defaultValue="viewer"
                >
                  <option value="admin">管理员</option>
                  <option value="editor">编辑者</option>
                  <option value="viewer">查看者</option>
                </select>
              </div>
              <div className="flex items-end">
                <Button className="w-full">发送邀请</Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>团队成员</CardTitle>
          <CardDescription>管理您的团队成员和权限</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 font-medium">成员</th>
                  <th className="text-left py-3 font-medium">邮箱</th>
                  <th className="text-left py-3 font-medium">角色</th>
                  <th className="text-left py-3 font-medium">状态</th>
                  <th className="text-right py-3 font-medium">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {members.map((member) => (
                  <tr key={member.id}>
                    <td className="py-4">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-medium">
                          {member.name.charAt(0)}
                        </div>
                        <div className="ml-3">
                          <p className="font-medium">{member.name}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4">{member.email}</td>
                    <td className="py-4">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs ${
                        member.role === '管理员' 
                          ? 'bg-blue-100 text-blue-800' 
                          : member.role === '编辑者' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {member.role}
                      </span>
                    </td>
                    <td className="py-4">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs ${
                        member.status === '已接受' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {member.status}
                      </span>
                    </td>
                    <td className="py-4 text-right">
                      <div className="flex justify-end gap-2">
                        {member.status === '待接受' && (
                          <Button size="icon" variant="outline">
                            <Mail className="h-4 w-4" />
                          </Button>
                        )}
                        <Button size="icon" variant="outline">
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button size="icon" variant="outline" className="text-red-500 hover:text-red-700">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 