import { Metadata } from 'next';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export const metadata: Metadata = {
  title: '安全设置 | 商机共振平台',
  description: '管理您的账户安全设置',
};

export default function SecurityPage() {
  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">安全设置</h1>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>修改密码</CardTitle>
          <CardDescription>定期更新您的密码有助于保护您的账户安全</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="current-password">当前密码</Label>
            <Input id="current-password" type="password" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="new-password">新密码</Label>
            <Input id="new-password" type="password" />
            <p className="text-xs text-gray-500">密码长度至少为8个字符，且包含字母、数字和特殊字符</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm-password">确认新密码</Label>
            <Input id="confirm-password" type="password" />
          </div>
        </CardContent>
        <CardFooter>
          <Button>更新密码</Button>
        </CardFooter>
      </Card>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>双重认证</CardTitle>
          <CardDescription>设置额外的安全层级以保护您的账户</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">启用双重认证</p>
              <p className="text-sm text-gray-500">登录时要求额外的验证步骤</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>登录历史</CardTitle>
          <CardDescription>查看最近的登录活动</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="divide-y divide-gray-200">
            <li className="py-3">
              <div className="flex justify-between">
                <div>
                  <p className="font-medium">上海，中国</p>
                  <p className="text-sm text-gray-500">Chrome on Windows</p>
                </div>
                <p className="text-sm text-gray-500">10分钟前</p>
              </div>
            </li>
            <li className="py-3">
              <div className="flex justify-between">
                <div>
                  <p className="font-medium">上海，中国</p>
                  <p className="text-sm text-gray-500">Safari on macOS</p>
                </div>
                <p className="text-sm text-gray-500">昨天 14:34</p>
              </div>
            </li>
            <li className="py-3">
              <div className="flex justify-between">
                <div>
                  <p className="font-medium">北京，中国</p>
                  <p className="text-sm text-gray-500">Firefox on Windows</p>
                </div>
                <p className="text-sm text-gray-500">2天前</p>
              </div>
            </li>
          </ul>
        </CardContent>
        <CardFooter>
          <Button variant="outline" className="w-full">查看完整历史</Button>
        </CardFooter>
      </Card>
    </div>
  );
} 