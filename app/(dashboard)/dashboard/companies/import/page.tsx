'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useUser } from '@/lib/auth';
import { use } from 'react';
import { toast } from 'sonner';
import { importCompanies } from './actions';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Upload, FileText, Check, AlertCircle } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

export default function ImportCompaniesPage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [importResult, setImportResult] = useState<{ 
    success: number, 
    error: number, 
    total: number 
  } | null>(null);
  
  // 使用ref避免直接操作DOM
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { userPromise } = useUser();
  const user = use(userPromise);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.type !== 'text/csv' && !selectedFile.name.endsWith('.csv')) {
        toast.error('请上传CSV格式的文件');
        return;
      }
      
      setFile(selectedFile);
      setUploadStatus('idle');
      setImportResult(null);
    }
  };
  
  const handleSelectFile = () => {
    // 安全地触发文件选择器
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  const handleImport = async () => {
    if (!file) {
      toast.error('请先选择要导入的CSV文件');
      return;
    }
    
    if (!user) {
      toast.error('用户未登录，请先登录');
      return;
    }
    
    setIsUploading(true);
    setUploadStatus('uploading');
    
    // 模拟上传进度
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 95) {
          clearInterval(progressInterval);
          return prev;
        }
        return prev + 5;
      });
    }, 200);
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const result = await importCompanies(formData);
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      if (result.success) {
        setUploadStatus('success');
        setImportResult({
          success: result.imported || 0,
          error: result.failed || 0,
          total: result.total || 0
        });
        toast.success(`成功导入 ${result.imported} 条企业数据`);
      } else {
        setUploadStatus('error');
        toast.error(result.message || '导入失败');
      }
    } catch (error) {
      console.error('导入企业时发生错误:', error);
      setUploadStatus('error');
      toast.error('导入企业时发生错误');
    } finally {
      setIsUploading(false);
      clearInterval(progressInterval);
      if (uploadProgress < 100) {
        setUploadProgress(100);
      }
    }
  };
  
  const renderUploadStatus = () => {
    switch (uploadStatus) {
      case 'uploading':
        return (
          <div className="flex flex-col items-center text-center space-y-4">
            <Progress value={uploadProgress} className="w-full" />
            <p className="text-sm text-gray-500">正在导入企业数据...</p>
          </div>
        );
      case 'success':
        return (
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="rounded-full bg-green-100 p-3">
              <Check className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="font-medium">导入成功</p>
              {importResult && (
                <div className="text-sm text-gray-500 mt-1">
                  <p>共 {importResult.total} 条记录</p>
                  <p>成功: {importResult.success} 条 / 失败: {importResult.error} 条</p>
                </div>
              )}
            </div>
            <Button 
              onClick={() => router.push('/dashboard/companies')}
              className="mt-2"
            >
              查看企业列表
            </Button>
          </div>
        );
      case 'error':
        return (
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="rounded-full bg-red-100 p-3">
              <AlertCircle className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <p className="font-medium">导入失败</p>
              <p className="text-sm text-gray-500 mt-1">
                请检查CSV文件格式是否正确
              </p>
            </div>
            <Button 
              onClick={() => setUploadStatus('idle')}
              className="mt-2"
            >
              重新上传
            </Button>
          </div>
        );
      default:
        return null;
    }
  };
  
  return (
    <div className="container max-w-3xl mx-auto py-10">
      <div className="mb-6">
        <Link href="/dashboard/companies" className="flex items-center text-gray-500 hover:text-gray-700 transition mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          返回企业列表
        </Link>
        <h1 className="text-2xl font-bold">导入企业数据</h1>
        <p className="text-gray-500 mt-2">
          通过CSV文件批量导入企业数据
        </p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>CSV文件导入</CardTitle>
          <CardDescription>
            上传CSV文件以批量导入企业数据。请确保CSV格式符合要求。
          </CardDescription>
        </CardHeader>
        <CardContent>
          {uploadStatus === 'idle' ? (
            <div className="space-y-6">
              <div 
                className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer"
                onClick={handleSelectFile}
              >
                <div className="mx-auto flex justify-center mb-4">
                  <FileText className="h-10 w-10 text-gray-400" />
                </div>
                
                <div className="space-y-1">
                  <p className="text-sm font-medium">
                    {file ? file.name : '拖放CSV文件到此处或点击选择文件'}
                  </p>
                  <p className="text-xs text-gray-500">
                    支持 .csv 格式，最大文件大小 10MB
                  </p>
                </div>
                
                <div className="mt-4">
                  <Button 
                    variant="outline" 
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation(); // 阻止事件冒泡
                      handleSelectFile();
                    }}
                  >
                    选择文件
                  </Button>
                </div>
                
                {/* 隐藏的文件输入框 */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,text/csv"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </div>
              
              <div className="rounded-md bg-blue-50 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <div className="text-blue-400">
                      <AlertCircle className="h-5 w-5" />
                    </div>
                  </div>
                  <div className="ml-3 text-sm text-blue-700">
                    <h3 className="font-medium text-blue-800">CSV格式要求</h3>
                    <div className="mt-2">
                      <p>CSV文件需包含以下字段：</p>
                      <ul className="list-disc list-inside ml-2 space-y-1 mt-1">
                        <li>企业名称 - <span className="font-mono text-xs">企业名称</span> (必填)</li>
                        <li>行业 - <span className="font-mono text-xs">细分领域</span></li>
                        <li>子行业 - <span className="font-mono text-xs">细分领域（补充）</span></li>
                        <li>企业简介 - <span className="font-mono text-xs">企业简介</span></li>
                        <li>产品介绍 - <span className="font-mono text-xs">产品介绍</span></li>
                        <li>标签 - <span className="font-mono text-xs">企业优势tag</span></li>
                        <li>联系人 - <span className="font-mono text-xs">fellow姓名</span></li>
                        <li>联系电话 - <span className="font-mono text-xs">fellow联系方式</span></li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="py-6">{renderUploadStatus()}</div>
          )}
        </CardContent>
        <CardFooter className="justify-between">
          <Button 
            variant="outline" 
            onClick={() => router.push('/dashboard/companies')}
            disabled={isUploading}
          >
            取消
          </Button>
          
          {uploadStatus === 'idle' && (
            <Button 
              onClick={handleImport}
              disabled={!file || isUploading}
              className="gap-2"
            >
              <Upload className="h-4 w-4" />
              导入企业
            </Button>
          )}
        </CardFooter>
      </Card>
      
      <div className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>无CSV文件？</CardTitle>
            <CardDescription>您可以手动添加企业信息</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500">
              如果您没有准备好的CSV文件，也可以选择手动添加企业信息。点击下方按钮单个添加企业数据。
            </p>
          </CardContent>
          <CardFooter>
            <Link href="/dashboard/companies/new">
              <Button variant="outline">
                手动添加企业
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
} 