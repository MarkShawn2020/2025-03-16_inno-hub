'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
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
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { LoaderCircle } from 'lucide-react';

const formSchema = z.object({
  file: z.instanceof(File, { message: '请选择文件' }).refine(
    (file) => file.size <= 5 * 1024 * 1024,
    { message: '文件大小不能超过5MB' }
  ).refine(
    (file) => ['text/csv', 'application/vnd.ms-excel'].includes(file.type),
    { message: '请上传CSV格式文件' }
  ),
});

type FormValues = z.infer<typeof formSchema>;

interface ImportFormProps {
  importCompanies: (formData: FormData) => Promise<{ success: boolean; message: string; count?: number }>;
}

export default function ImportForm({ importCompanies }: ImportFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string; count?: number } | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {},
  });

  async function onSubmit(data: FormValues) {
    setIsSubmitting(true);
    setResult(null);
    
    try {
      const formData = new FormData();
      formData.append('file', data.file);
      
      const result = await importCompanies(formData);
      setResult(result);
      
      if (result.success) {
        toast.success(`成功导入${result.count}家企业`);
        setTimeout(() => {
          router.push('/dashboard/companies');
        }, 3000);
      } else {
        toast.error(result.message || '导入失败');
      }
    } catch (error) {
      console.error('导入失败:', error);
      toast.error('导入过程中发生错误');
      setResult({ success: false, message: '导入过程中发生错误，请检查文件格式是否正确' });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>上传CSV文件</CardTitle>
        <CardDescription>
          请选择包含企业数据的CSV文件。文件大小不应超过5MB。
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="file"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>CSV文件</FormLabel>
                  <FormControl>
                    <input
                      type="file"
                      accept=".csv"
                      className="block w-full text-sm text-gray-500
                                file:mr-4 file:py-2 file:px-4
                                file:rounded-md file:border-0
                                file:text-sm file:font-semibold
                                file:bg-primary/10 file:text-primary
                                hover:file:bg-primary/20"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          field.onChange(file);
                        }
                      }}
                    />
                  </FormControl>
                  <FormDescription>
                    文件应包含以下列：企业名称、企业简介、联系人、联系电话、邮箱、所在地区、企业规模、行业
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {result && (
              <Alert variant={result.success ? "default" : "destructive"}>
                <AlertTitle>{result.success ? "导入成功" : "导入失败"}</AlertTitle>
                <AlertDescription>
                  {result.message}
                  {result.success && result.count && (
                    <p className="mt-2">成功导入 {result.count} 家企业，即将跳转到企业列表页...</p>
                  )}
                </AlertDescription>
              </Alert>
            )}

            <Button type="submit" disabled={isSubmitting} className="w-full">
              {isSubmitting ? (
                <>
                  <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                  正在导入...
                </>
              ) : '开始导入'}
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={() => router.push('/dashboard/companies')}>
          返回企业列表
        </Button>
      </CardFooter>
    </Card>
  );
} 