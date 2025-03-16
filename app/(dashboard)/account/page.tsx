
import { Metadata } from 'next';
import { use } from 'react';
import { redirect } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { getUser } from '@/lib/db/queries';

export const metadata: Metadata = {
  title: '个人信息 | 商机匹配平台',
  description: '管理您的个人信息',
};

export default function ProfilePage() {
  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">个人信息</h1>
      
      <ProfileForm />
    </div>
  );
}

async function ProfileForm() {
  const user = await getUser()
  
  if (!user) {
    redirect('/login');
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>个人资料</CardTitle>
        <CardDescription>更新您的个人信息和联系方式</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">姓名</Label>
          <Input id="name" defaultValue={user.name || ''} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">电子邮箱</Label>
          <Input id="email" type="email" defaultValue={user.email} disabled />
          <p className="text-sm text-gray-500">电子邮箱无法修改</p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="company">公司名称</Label>
          <Input id="company" defaultValue="" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="position">职位</Label>
          <Input id="position" defaultValue="" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">联系电话</Label>
          <Input id="phone" type="tel" defaultValue="" />
        </div>
      </CardContent>
      <CardFooter className="flex justify-end space-x-2">
        <Button variant="outline">取消</Button>
        <Button>保存更改</Button>
      </CardFooter>
    </Card>
  );
} 