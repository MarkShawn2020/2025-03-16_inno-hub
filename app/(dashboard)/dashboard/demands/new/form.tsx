'use client';

import { useState, useEffect } from 'react';
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
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import DemandExampleSelector from './demand-example-selector';
import { DemandExample } from './example-demands';
import { Check, Clock, CreditCard, FileText, LayoutGrid, Briefcase } from 'lucide-react';
import { useUser } from '@/lib/auth';
import { use } from 'react';
import { submitDemand } from './actions';

// 需求提交表单的验证模式
const demandFormSchema = z.object({
  title: z.string().min(5),
  description: z.string().min(20),
  category: z.string().optional(),
  budget: z.string().optional(),
  timeline: z.string().optional(), 
  cooperationType: z.string().optional(),
  userId: z.string(),
});

// 预算选项
const budgetOptions = [
  { value: '低于5万', label: '低于5万', amount: '< 5万' },
  { value: '5-20万', label: '5-20万', amount: '5-20万' },
  { value: '20-50万', label: '20-50万', amount: '20-50万' },
  { value: '50-100万', label: '50-100万', amount: '50-100万' },
  { value: '100-500万', label: '100-500万', amount: '100-500万' },
  { value: '500万以上', label: '500万以上', amount: '> 500万' },
];

// 工期选项
const timelineOptions = [
  { value: '少于1个月', label: '少于1个月', icon: <Clock className="h-4 w-4" /> },
  { value: '1-3个月', label: '1-3个月', icon: <Clock className="h-4 w-4" /> },
  { value: '3-6个月', label: '3-6个月', icon: <Clock className="h-4 w-4" /> },
  { value: '6-12个月', label: '6-12个月', icon: <Clock className="h-4 w-4" /> },
  { value: '1年以上', label: '1年以上', icon: <Clock className="h-4 w-4" /> },
];

// 合作类型选项
const cooperationTypeOptions = [
  { value: '项目外包', label: '项目外包', description: '整体项目委托给合作方完成' },
  { value: '技术合作', label: '技术合作', description: '共同开发技术方案' },
  { value: '联合研发', label: '联合研发', description: '双方共同投入资源研发' },
  { value: '股权合作', label: '股权合作', description: '深度合作，包含股权激励' },
  { value: '其他', label: '其他', description: '其他形式的合作方式' },
];

export default function DemandForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('examples');
  const [formStep, setFormStep] = useState<number>(0);
  const { userPromise } = useUser();
  const user = use(userPromise);
  console.log({isSubmitting, activeTab, formStep});
  

  // 初始化表单
  const form = useForm<z.infer<typeof demandFormSchema>>({
    resolver: zodResolver(demandFormSchema),
    defaultValues: {
      title: '',
      description: '',
      category: '',
      budget: '',
      timeline: '',
      cooperationType: '',
      userId: user?.id?.toString() || '',
    },
  });

  // 在组件顶部添加对错误状态的监听
  const formErrors = form.formState.errors;

  // 使用 useEffect 监听错误变化
  useEffect(() => {
    // 当表单验证失败且有错误时
    if (Object.keys(formErrors).length > 0) {
      const errorFields = Object.keys(formErrors);
      // 确定错误所在的 tab
      const errorStep = determineTabWithError(errorFields);
      
      // 如果当前不在错误所在的 tab，则自动跳转并提示
      if (formStep !== errorStep) {
        setFormStep(errorStep);
        toast.error("表单包含错误，已自动跳转到需要修正的部分");
      }
    }
  }, [formErrors, formStep]);

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

  // 表单步骤导航
  const goToNextStep = () => {
    if (formStep === 0) {
      const basicInfoValid = form.trigger(['title', 'category', 'description']);
      if (!basicInfoValid) return;
    }
    setFormStep(current => Math.min(current + 1, 2));
  };

  const goToPrevStep = () => {
    setFormStep(current => Math.max(current - 1, 0));
  };

  // 处理表单提交
  const onSubmit = async (data: z.infer<typeof demandFormSchema>) => {
    console.log('onSubmit', data);
    
    if (!user) {
      toast.error('用户未登录，请先登录');
      return;
    }

    setIsSubmitting(true);
    try {
      // 表单验证失败时，form.formState.errors 将包含所有错误
      // 我们需要分析这些错误并确定它们属于哪个 tab
      
      // 如果表单有错误
      if (!form.formState.isValid) {
        // 获取所有错误字段
        const errorFields = Object.keys(form.formState.errors);
        
        // 确定第一个错误所在的 tab 索引（根据字段名映射到 tab）
        const firstErrorTab = determineTabWithError(errorFields);
        
        // 设置 tab 索引到包含错误的第一个 tab
        setActiveTab(firstErrorTab.toString());
        
        // 显示错误提示
        toast.error("表单包含错误，请检查标记的字段");
        
        return; // 阻止表单提交
      }
      
      // 创建表单数据对象
      const formData = new FormData();
      
      // 添加表单字段 - 确保所有字段都有值，至少是空字符串
      formData.append('title', data.title);
      formData.append('description', data.description);
      formData.append('category', data.category || '');
      formData.append('budget', data.budget || '');
      formData.append('timeline', data.timeline || '');
      formData.append('cooperationType', data.cooperationType || '');
      formData.append('userId', user.id.toString());
      
      // 提交需求
      const result = await submitDemand(formData);
      
      if (result.success) {
        toast.success('需求提交成功！');
        router.push('/dashboard/demands');
      } else {
        toast.error(`提交失败: ${result.message}`);
      }
    } catch (error) {
      console.error('提交需求时出错:', error);
      toast.error('提交时发生错误，请稍后重试');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 表单步骤标题
  const formSteps = [
    { title: '基本信息', icon: <FileText className="h-4 w-4" /> },
    { title: '项目细节', icon: <LayoutGrid className="h-4 w-4" /> },
    { title: '确认提交', icon: <Check className="h-4 w-4" /> },
  ];

  // 根据字段名确定 tab 索引的辅助函数
  function determineTabWithError(errorFields: string[]): number {
    // 这里的映射需要根据你的实际表单结构来定义
    const tabFieldMapping = {
      0: ["title", "category", "description"], // 第一个 tab 的字段
      1: ["budget", "timeline"],              // 第二个 tab 的字段
      2: ["cooperationType"]                      // 第三个 tab 的字段
    };
    
    // 找到包含错误字段的第一个 tab
    for (const [tabIndex, fields] of Object.entries(tabFieldMapping)) {
      if (errorFields.some(field => fields.includes(field))) {
        return parseInt(tabIndex);
      }
    }
    
    return 0; // 默认返回第一个 tab
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
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            {formSteps.map((step, index) => (
              <div key={index} className="flex flex-col items-center">
                <div 
                  className={cn(
                    "flex items-center justify-center w-10 h-10 rounded-full mb-2 border",
                    formStep >= index 
                      ? "bg-primary text-primary-foreground border-primary" 
                      : "bg-muted border-input"
                  )}
                  onClick={() => {
                    if (formStep > index) setFormStep(index);
                  }}
                >
                  {step.icon}
                </div>
                <span className={cn(
                  "text-sm font-medium",
                  formStep >= index ? "text-primary" : "text-muted-foreground"
                )}>
                  {step.title}
                </span>
                {index < formSteps.length - 1 && (
                  <div className="hidden sm:block h-0.5 w-24 bg-muted absolute left-0 right-0" 
                    style={{ left: `${(index + 0.5) * 100 / formSteps.length}%` }} />
                )}
              </div>
            ))}
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {formStep === 0 && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                </div>

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
              </div>
            )}

            {formStep === 1 && (
              <div className="space-y-8">
                <FormField
                  control={form.control}
                  name="budget"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>预算范围</FormLabel>
                      <FormDescription>
                        请选择您的项目预算范围
                      </FormDescription>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 pt-2">
                        {budgetOptions.map((option) => (
                          <div
                            key={option.value}
                            className={cn(
                              "flex flex-col items-center justify-center h-24 rounded-md border-2 p-2 cursor-pointer hover:border-primary hover:bg-primary/5 transition-colors",
                              field.value === option.value
                                ? "border-primary bg-primary/10"
                                : "border-muted"
                            )}
                            onClick={() => field.onChange(option.value)}
                          >
                            <CreditCard className={cn(
                              "h-6 w-6 mb-2",
                              field.value === option.value
                                ? "text-primary"
                                : "text-muted-foreground"
                            )} />
                            <span className="text-sm font-medium">{option.label}</span>
                            <span className="text-xs text-muted-foreground mt-1">
                              {option.amount}
                            </span>
                          </div>
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="timeline"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>工期要求</FormLabel>
                      <FormDescription>
                        请选择项目预计完成时间
                      </FormDescription>
                      <div className="flex flex-wrap gap-2 pt-2">
                        {timelineOptions.map((option) => (
                          <Badge
                            key={option.value}
                            variant={field.value === option.value ? "default" : "outline"}
                            className={cn(
                              "px-4 py-2 cursor-pointer transition-colors text-sm",
                              field.value === option.value
                                ? "bg-primary hover:bg-primary/90"
                                : "hover:bg-muted"
                            )}
                            onClick={() => field.onChange(option.value)}
                          >
                            {option.icon}
                            <span className="ml-2">{option.label}</span>
                          </Badge>
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="cooperationType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>合作类型</FormLabel>
                      <FormDescription>
                        请选择您期望的合作方式
                      </FormDescription>
                      <div className="space-y-3 pt-2">
                        {cooperationTypeOptions.map((option) => (
                          <div
                            key={option.value}
                            className={cn(
                              "flex items-center space-x-3 rounded-md border p-4 cursor-pointer transition-colors",
                              field.value === option.value
                                ? "border-primary bg-primary/5"
                                : "border-muted hover:border-primary/50 hover:bg-muted/50"
                            )}
                            onClick={() => field.onChange(option.value)}
                          >
                            <div className={cn(
                              "flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
                              field.value === option.value
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted"
                            )}>
                              <Briefcase className="h-5 w-5" />
                            </div>
                            <div className="space-y-1">
                              <p className="font-medium">{option.label}</p>
                              <p className="text-sm text-muted-foreground">
                                {option.description}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            {formStep === 2 && (
              <div className="space-y-6">
                <div className="rounded-lg border p-4">
                  <h3 className="text-lg font-medium mb-4">需求信息确认</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">需求标题</p>
                      <p className="text-base">{form.getValues('title')}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">需求分类</p>
                      <p className="text-base">{form.getValues('category') || '未指定'}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">预算范围</p>
                      <p className="text-base">{form.getValues('budget') || '未指定'}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">工期要求</p>
                      <p className="text-base">{form.getValues('timeline') || '未指定'}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">合作类型</p>
                      <p className="text-base">{form.getValues('cooperationType') || '未指定'}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">需求描述</p>
                      <p className="text-base whitespace-pre-line">{form.getValues('description')}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-between pt-4">
              {formStep > 0 ? (
                <Button type="button" variant="outline" onClick={goToPrevStep}>
                  上一步
                </Button>
              ) : (
                <div></div>
              )}
              
              {formStep < 2 ? (
                <Button type="button" onClick={goToNextStep}>
                  下一步
                </Button>
              ) : (
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? '提交中...' : '提交需求'}
                </Button>
              )}
            </div>
          </form>
        </Form>
      </TabsContent>
    </Tabs>
  );
} 