'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { toast } from 'sonner';
import Link from 'next/link';
import { createCompany } from './actions';
import { useUser } from '@/lib/auth';
import { use } from 'react';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft } from 'lucide-react';

// 表单验证模式
const formSchema = z.object({
  name: z.string().min(1, "企业名称为必填项"),
  logo: z.string().optional(),
  category: z.string().optional(),
  subCategory: z.string().optional(),
  description: z.string().optional(),
  productIntro: z.string().optional(),
  advantageTags: z.string().optional(),
  contactName: z.string().optional(),
  contactPhone: z.string().optional(),
  isEastRisingPark: z.boolean().default(false)
});

export default function NewCompanyPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { userPromise } = useUser();
  const user = use(userPromise);

  // 初始化表单
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      logo: '',
      category: '',
      subCategory: '',
      description: '',
      productIntro: '',
      advantageTags: '',
      contactName: '',
      contactPhone: '',
      isEastRisingPark: false
    },
  });

  // 表单提交处理
  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    
    if (!user) {
      toast.error('用户未登录，请先登录');
      setIsSubmitting(false);
      return;
    }
    
    try {
      const formData = new FormData();
      
      // 手动添加每个表单字段，确保所有值都是字符串类型
      formData.append('name', values.name);
      formData.append('logo', values.logo || '');
      formData.append('category', values.category || '');
      formData.append('subCategory', values.subCategory || '');
      formData.append('description', values.description || '');
      formData.append('productIntro', values.productIntro || '');
      formData.append('advantageTags', values.advantageTags || '');
      formData.append('contactName', values.contactName || '');
      formData.append('contactPhone', values.contactPhone || '');
      formData.append('isEastRisingPark', values.isEastRisingPark.toString());
      
      const result = await createCompany(formData);
      
      if (result.success) {
        toast.success(result.message);
        router.push('/dashboard/companies');
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

  // 行业选项
  const industryOptions = [
    { value: 'AI基础设施', label: 'AI基础设施' },
    { value: '模型', label: '模型' },
    { value: '场景应用', label: '场景应用' },
    { value: '智能工业软件', label: '智能工业软件' },
    { value: '具身智能', label: '具身智能' },
    { value: '第三方服务', label: '第三方服务' },
  ];

  // 子行业选项（基于行业动态生成）
  const getSubIndustryOptions = (industry: string) => {
    switch (industry) {
      case 'AI基础设施':
        return [
          { value: '模型', label: '模型' },
          { value: '算法', label: '算法' },
          { value: '芯片', label: '芯片' },
          { value: '算力', label: '算力' },
          { value: '第三方服务', label: '第三方服务' },
        ];
      case '模型':
        return [
          { value: '模型', label: '模型' },
          { value: '算法', label: '算法' },
          { value: '数据', label: '数据' },
          { value: '场景应用', label: '场景应用' },
        ];
      case '场景应用':
        return [
          { value: '场景应用', label: '场景应用' },
          { value: '第三方服务', label: '第三方服务' },
          { value: '模型', label: '模型' },
          { value: '算法', label: '算法' },
          { value: '内容安全', label: '内容安全' },
          { value: 'c端', label: 'c端' },
        ];
      case '智能工业软件':
        return [
          { value: '智能工业软件', label: '智能工业软件' },
          { value: '内容安全', label: '内容安全' },
          { value: 'AI辅助机械设计', label: 'AI辅助机械设计' },
        ];
      case '具身智能':
        return [];
      case '第三方服务':
        return [
          { value: '第三方服务', label: '第三方服务' },
          { value: '大模型备案', label: '大模型备案' },
          { value: '算法备案', label: '算法备案' },
        ];
      default:
        return [];
    }
  };

  const selectedIndustry = form.watch('category') || '';
  const subIndustryOptions = getSubIndustryOptions(selectedIndustry);

  return (
    <div className="container max-w-4xl mx-auto py-10">
      <div className="mb-6">
        <Link href="/dashboard/companies" className="flex items-center text-gray-500 hover:text-gray-700 transition mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          返回企业列表
        </Link>
        <h1 className="text-2xl font-bold">添加新企业</h1>
        <p className="text-gray-500 mt-2">
          填写企业相关信息，创建新的企业记录
        </p>
      </div>

      <Card className="p-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">基本信息</h2>
              <Separator />
              
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>企业名称 *</FormLabel>
                    <FormControl>
                      <Input placeholder="请输入企业名称" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="logo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>企业Logo URL</FormLabel>
                    <FormControl>
                      <Input placeholder="请输入企业Logo图片链接" {...field} />
                    </FormControl>
                    <FormDescription>
                      输入企业Logo的图片URL地址，支持http/https链接
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>行业</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="选择行业" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {industryOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="subCategory"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>细分领域</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        disabled={!selectedIndustry || subIndustryOptions.length === 0}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="选择细分领域" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {subIndustryOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>企业简介</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="请输入企业简介" 
                        className="min-h-[120px]" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="productIntro"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>产品介绍</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="请输入产品介绍" 
                        className="min-h-[120px]" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="advantageTags"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>企业优势标签</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="多个标签用分号(;)分隔，如: 高性能算力;低成本;跨平台" 
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>
                      输入企业优势标签，多个标签之间用分号(;)分隔
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <h2 className="text-lg font-semibold pt-4">联系信息</h2>
              <Separator />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="contactName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>联系人姓名</FormLabel>
                      <FormControl>
                        <Input placeholder="请输入联系人姓名" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="contactPhone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>联系电话</FormLabel>
                      <FormControl>
                        <Input placeholder="请输入联系电话" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="isEastRisingPark"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 mt-4">
                    <FormControl>
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={field.value}
                          onChange={field.onChange}
                          className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                        />
                        <label className="text-sm font-medium leading-none cursor-pointer">
                          是东升园区企业
                        </label>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="flex justify-end space-x-4 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => router.push('/dashboard/companies')}
                disabled={isSubmitting}
              >
                取消
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? '提交中...' : '添加企业'}
              </Button>
            </div>
          </form>
        </Form>
      </Card>
    </div>
  );
} 