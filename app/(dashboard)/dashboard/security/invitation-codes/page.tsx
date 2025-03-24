"use client";
import { Suspense } from 'react';
import { use } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useUser } from '@/lib/auth';
import { InvitationCodeList } from './invitation-code-list';
import { CreateInvitationCodeForm } from './create-invitation-code-form';


export default function InvitationCodesPage() {
  return (
    <div className="container mx-auto py-6 space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">邀请码管理</h2>
      </div>
      
      <div className="grid gap-6">
        <Suspense fallback={<div>加载中...</div>}>
          <CreateInvitationCodeSection />
        </Suspense>
        
        <Suspense fallback={<div>加载中...</div>}>
          <InvitationCodeListSection />
        </Suspense>
      </div>
    </div>
  );
}

function CreateInvitationCodeSection() {
  const { userPromise } = useUser();
  const user = use(userPromise);
  
  if (!user || user.role !== 'owner') {
    return (
      <Card>
        <CardHeader>
          <CardTitle>创建邀请码</CardTitle>
          <CardDescription>您需要拥有管理员权限才能创建邀请码</CardDescription>
        </CardHeader>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>创建邀请码</CardTitle>
        <CardDescription>创建新的邀请码用于邀请用户加入平台</CardDescription>
      </CardHeader>
      <CardContent>
        <CreateInvitationCodeForm />
      </CardContent>
    </Card>
  );
}

function InvitationCodeListSection() {
  const { userPromise } = useUser();
  const user = use(userPromise);
  
  if (!user || user.role !== 'owner') {
    return (
      <Card>
        <CardHeader>
          <CardTitle>邀请码列表</CardTitle>
          <CardDescription>您需要拥有管理员权限才能查看邀请码</CardDescription>
        </CardHeader>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>邀请码列表</CardTitle>
        <CardDescription>管理现有的邀请码</CardDescription>
      </CardHeader>
      <CardContent>
        <InvitationCodeList />
      </CardContent>
    </Card>
  );
} 