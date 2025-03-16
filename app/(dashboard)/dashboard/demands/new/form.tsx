'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import DemandExampleSelector from './demand-example-selector';
import { DemandExample } from './example-demands';

// 定义表单验证模式
const formSchema = z.object({
  title: z.string().min(5, {
    message: '标题至少需要5个字符',
  }),
  description: z.string().min(20, {
    message: '需求描述至少需要20个字符',
  }),
  category: z.string().optional(),
  budget: z.string().optional(),
  timeline: z.string().optional(),
  cooperationType: z.string().optional(),
});

export default function DemandForm({
  submitDemand,
}: {
  submitDemand: (data: FormData) => Promise<{ success: boolean; message: string }>;
}) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('examples');

  // 初始化表单
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      description: '',
      category: '',
      budget: '',
      timeline: '',
      cooperationType: '',
    },
  });

  // 处理示例选择
  const handleSelectExample = (example: DemandExample) => {
    form.setValue('title', example.title);
    form.setValue('description', example.description);
    if (example.category) form.setValue('category', example.category);
    if (example.budget) form.setValue('budget', example.budget);
    if (example.timeline) form.setValue('timeline', example.timeline);
    if (example.cooperationType) form.setValue('cooperationType', example.cooperationType);
    
    setActiveTab('form');
  };

  // 跳过示例选择
  const handleSkipExamples = () => {
    setActiveTab('form');
  };

  // 提交处理函数
  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      Object.entries(values).forEach(([key, value]) => {
        if (value) formData.append(key, value);
      });

      const result = await submitDemand(formData);
      
      if (result.success) {
        toast.success('需求提交成功', {
          description: '我们将尽快为您匹配合适的企业',
        });
        router.push('/dashboard/demands');
      } else {
        toast.error('提交失败', {
          description: result.message || '请稍后重试',
        });
      }
    } catch (error) {
      toast.error('发生错误', {
        description: '提交需求时发生错误，请稍后重试',
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="mb-6">
        <TabsTrigger value="examples">选择示例</TabsTrigger>
        <TabsTrigger value="form">填写表单</TabsTrigger>
      </TabsList>
      
      <TabsContent value="examples">
        <DemandExampleSelector
          onSelectExample={handleSelectExample}
          onSkip={handleSkipExamples}
        />
      </TabsContent>
      
      <TabsContent value="form">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>需求标题</FormLabel>
                  <FormControl>
                    <Input placeholder="例如：需要开发一个企业官网" {...field} />
                  </FormControl>
                  <FormDescription>
                    简短描述您的需求标题，便于企业快速理解
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>需求分类</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="选择需求分类" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="智慧城市">智慧城市</SelectItem>
                      <SelectItem value="新能源">新能源</SelectItem>
                      <SelectItem value="无人机">无人机</SelectItem>
                      <SelectItem value="能源管理">能源管理</SelectItem>
                      <SelectItem value="人工智能">人工智能</SelectItem>
                      <SelectItem value="软件开发">软件开发</SelectItem>
                      <SelectItem value="硬件制造">硬件制造</SelectItem>
                      <SelectItem value="其他">其他</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    选择最符合您需求的分类，有助于更准确地匹配企业
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>需求详细描述</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="请详细描述您的需求，包括功能、技术要求、期望效果等"
                      className="min-h-[200px]"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    越详细的描述将帮助我们更准确地匹配合适的企业
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <FormField
                control={form.control}
                name="budget"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>预算范围（选填）</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="选择预算范围" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="低于5万">低于5万</SelectItem>
                        <SelectItem value="5-20万">5-20万</SelectItem>
                        <SelectItem value="20-50万">20-50万</SelectItem>
                        <SelectItem value="50-100万">50-100万</SelectItem>
                        <SelectItem value="100-500万">100-500万</SelectItem>
                        <SelectItem value="500万以上">500万以上</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="timeline"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>工期要求（选填）</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="选择工期要求" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="少于1个月">少于1个月</SelectItem>
                        <SelectItem value="1-3个月">1-3个月</SelectItem>
                        <SelectItem value="3-6个月">3-6个月</SelectItem>
                        <SelectItem value="6-12个月">6-12个月</SelectItem>
                        <SelectItem value="1年以上">1年以上</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="cooperationType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>合作类型（选填）</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="选择合作类型" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="项目外包">项目外包</SelectItem>
                        <SelectItem value="技术合作">技术合作</SelectItem>
                        <SelectItem value="联合研发">联合研发</SelectItem>
                        <SelectItem value="股权合作">股权合作</SelectItem>
                        <SelectItem value="其他">其他</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? '提交中...' : '提交需求'}
              </Button>
            </div>
          </form>
        </Form>
      </TabsContent>
    </Tabs>
  );
} 