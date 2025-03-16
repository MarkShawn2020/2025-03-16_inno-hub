import { Metadata } from 'next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export const metadata: Metadata = {
  title: '通用设置 | 商机匹配平台',
  description: '管理您的通用设置',
};

export default function GeneralSettingsPage() {
  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">通用设置</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>通知设置</CardTitle>
          <CardDescription>设置您希望接收的通知类型</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">电子邮件通知</p>
                <p className="text-sm text-gray-500">接收与账户相关的重要邮件通知</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
              </label>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">新匹配提醒</p>
                <p className="text-sm text-gray-500">当有新的匹配结果时接收通知</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
              </label>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">系统更新</p>
                <p className="text-sm text-gray-500">接收平台功能更新和改进的通知</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>语言和区域设置</CardTitle>
          <CardDescription>设置您偏好的语言和区域</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="language">
                语言
              </label>
              <select
                id="language"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                defaultValue="zh_CN"
              >
                <option value="zh_CN">简体中文</option>
                <option value="en_US">English (US)</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="timezone">
                时区
              </label>
              <select
                id="timezone"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                defaultValue="Asia/Shanghai"
              >
                <option value="Asia/Shanghai">中国标准时间 (GMT+8)</option>
                <option value="America/New_York">美国东部时间 (GMT-5)</option>
                <option value="Europe/London">格林威治标准时间 (GMT)</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 