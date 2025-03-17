'use client';

import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { updateUserProfile } from './actions';

// 表单验证模式
const formSchema = z.object({
  name: z.string().min(1, "姓名为必填项"),
  company: z.string().optional(),
  position: z.string().optional(),
  phone: z.string().optional(),
});

type User = {
  id: number;
  name: string | null;
  email: string;
  role: string;
  profileData?: any; // 添加profileData字段
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
};

interface ProfileFormProps {
  user: User | null;
}

export default function ProfileForm({ user }: ProfileFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 如果用户不存在，显示错误状态
  if (!user) {
    return (
      <div className="p-6 text-center">
        <p className="text-red-500">获取用户信息失败，请重新登录</p>
      </div>
    );
  }

  // 从profileData中提取用户额外信息
  const userProfileData = user.profileData || {};

  // 初始化表单
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: user.name || '',
      company: userProfileData.company || '',
      position: userProfileData.position || '',
      phone: userProfileData.phone || '',
    },
  });

  // 表单提交处理
  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    
    try {
      const formData = new FormData();
      
      // 手动添加每个表单字段
      formData.append('name', values.name);
      formData.append('company', values.company || '');
      formData.append('position', values.position || '');
      formData.append('phone', values.phone || '');
      
      const result = await updateUserProfile(formData);
      
      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error('提交表单时出错:', error);
      toast.error('提交表单时发生错误');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <CardHeader>
        <CardTitle>个人资料</CardTitle>
        <CardDescription>更新您的个人信息和联系方式</CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>姓名</FormLabel>
                  <FormControl>
                    <Input placeholder="请输入姓名" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="space-y-2">
              <Label htmlFor="email">电子邮箱</Label>
              <Input id="email" type="email" value={user.email} disabled />
              <p className="text-sm text-gray-500">电子邮箱无法修改</p>
            </div>
            
            <FormField
              control={form.control}
              name="company"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>公司名称</FormLabel>
                  <FormControl>
                    <Input placeholder="请输入公司名称" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="position"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>职位</FormLabel>
                  <FormControl>
                    <Input placeholder="请输入职位" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>联系电话</FormLabel>
                  <FormControl>
                    <Input placeholder="请输入联系电话" type="tel" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter className="flex justify-end space-x-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => form.reset()}
              disabled={isSubmitting}
            >
              重置
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? '保存中...' : '保存更改'}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </>
  );
} 