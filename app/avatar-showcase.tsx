'use client';

import { UserAvatar } from '@/components/UserAvatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

const demoUsers = [
  { name: '张三', email: 'zhang.san@example.com' },
  { name: '李四', email: 'li.si@example.com' },
  { name: '王五', email: 'wang.wu@example.com' },
  { name: 'John Doe', email: 'john.doe@example.com' },
  { name: 'Jane Smith', email: 'jane.smith@example.com' },
  { name: '', email: 'no.name@example.com' },
  { name: '赵六 Zhou Liu', email: 'zhao.liu@example.com' },
  { name: '刘备 Liu Bei', email: 'liu.bei@example.com' },
];

export default function AvatarShowcase() {
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">用户头像组件展示</h1>
      <p className="text-gray-600 mb-8">这个页面展示了多种头像组件样式和配置选项</p>
      
      <Tabs defaultValue="colorStyles" className="mb-12">
        <TabsList className="grid grid-cols-4 w-full max-w-xl mb-6">
          <TabsTrigger value="colorStyles">颜色风格</TabsTrigger>
          <TabsTrigger value="shapes">形状变化</TabsTrigger>
          <TabsTrigger value="status">状态指示</TabsTrigger>
          <TabsTrigger value="sizes">尺寸变化</TabsTrigger>
        </TabsList>
        
        <TabsContent value="colorStyles">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { name: '鲜艳色调', value: 'vibrant' },
              { name: '柔和色调', value: 'pastel' },
              { name: '深色调', value: 'dark' },
              { name: '渐变效果', value: 'gradient' }
            ].map((style) => (
              <Card key={style.value}>
                <CardHeader>
                  <CardTitle>{style.name}</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-6">
                  {demoUsers.slice(0, 6).map((user, index) => (
                    <div key={index} className="flex flex-col items-center">
                      <UserAvatar 
                        user={user} 
                        className="h-12 w-12 mb-2" 
                        colorStyle={style.value as any}
                        showBorder={false}
                      />
                      <span className="text-sm">{user.name || user.email.split('@')[0]}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="shapes">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { name: '圆形', value: 'circle' },
              { name: '圆角方形', value: 'rounded' },
              { name: '方形', value: 'square' }
            ].map((shape) => (
              <Card key={shape.value}>
                <CardHeader>
                  <CardTitle>{shape.name}</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-6">
                  {demoUsers.slice(0, 4).map((user, index) => (
                    <div key={index} className="flex flex-col items-center">
                      <UserAvatar 
                        user={user} 
                        className="h-12 w-12 mb-2" 
                        shape={shape.value as any}
                        showBorder={false}
                      />
                      <span className="text-sm">{user.name || user.email.split('@')[0]}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="status">
          <Card>
            <CardHeader>
              <CardTitle>状态指示器</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {[
                { name: '在线', value: 'online' },
                { name: '离开', value: 'away' },
                { name: '忙碌', value: 'busy' },
                { name: '离线', value: 'offline' }
              ].map((statusType) => (
                <div key={statusType.value} className="flex flex-col items-center">
                  <UserAvatar 
                    user={demoUsers[0]} 
                    className="h-16 w-16 mb-3" 
                    status={statusType.value as any}
                  />
                  <span className="text-sm font-medium">{statusType.name}</span>
                </div>
              ))}
            </CardContent>
          </Card>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>边框效果</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-6">
                <div className="flex flex-col items-center">
                  <UserAvatar 
                    user={demoUsers[1]} 
                    className="h-12 w-12 mb-2" 
                    showBorder={true}
                  />
                  <span className="text-sm">默认边框</span>
                </div>
                <div className="flex flex-col items-center">
                  <UserAvatar 
                    user={demoUsers[1]} 
                    className="h-12 w-12 mb-2 ring-2 ring-blue-200" 
                    showBorder={false}
                  />
                  <span className="text-sm">自定义边框</span>
                </div>
                <div className="flex flex-col items-center">
                  <UserAvatar 
                    user={demoUsers[1]} 
                    className="h-12 w-12 mb-2 shadow-lg" 
                    showBorder={false}
                  />
                  <span className="text-sm">阴影效果</span>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>动画效果</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-6">
                <div className="flex flex-col items-center">
                  <UserAvatar 
                    user={demoUsers[2]} 
                    className="h-12 w-12 mb-2 animate-bounce" 
                    showBorder={false}
                  />
                  <span className="text-sm">弹跳</span>
                </div>
                <div className="flex flex-col items-center">
                  <UserAvatar 
                    user={demoUsers[2]} 
                    className="h-12 w-12 mb-2" 
                    pulseEffect={true}
                  />
                  <span className="text-sm">脉冲</span>
                </div>
                <div className="flex flex-col items-center">
                  <UserAvatar 
                    user={demoUsers[2]} 
                    className="h-12 w-12 mb-2 hover:rotate-12 transition-transform" 
                    showBorder={false}
                  />
                  <span className="text-sm">悬停旋转</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="sizes">
          <Card>
            <CardHeader>
              <CardTitle>不同尺寸头像</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-end flex-wrap gap-8 justify-center mb-8">
                {[6, 8, 10, 12, 16, 20, 24, 32].map((size) => (
                  <div key={size} className="flex flex-col items-center">
                    <UserAvatar 
                      user={demoUsers[0]} 
                      className={`h-${size} w-${size} mb-2`} 
                      showBorder={false}
                    />
                    <span className="text-sm">{size}px</span>
                  </div>
                ))}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex flex-col items-center">
                  <UserAvatar 
                    user={demoUsers[3]} 
                    className="h-24 w-24 mb-3" 
                    initialsLength={1}
                  />
                  <span className="text-sm">单字母</span>
                </div>
                <div className="flex flex-col items-center">
                  <UserAvatar 
                    user={demoUsers[3]} 
                    className="h-24 w-24 mb-3" 
                    initialsLength={2}
                  />
                  <span className="text-sm">双字母（默认）</span>
                </div>
                <div className="flex flex-col items-center">
                  <UserAvatar 
                    user={demoUsers[3]} 
                    className="h-24 w-24 mb-3" 
                    initialsLength={3}
                  />
                  <span className="text-sm">三字母</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      <Card>
        <CardHeader>
          <CardTitle>组合效果示例</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-8 justify-center">
          <div className="flex flex-col items-center">
            <UserAvatar 
              user={demoUsers[4]} 
              className="h-16 w-16 mb-2 ring-2 ring-orange-200 hover:ring-orange-300" 
              colorStyle="vibrant"
              status="online"
              showBorder={false}
            />
            <span className="text-sm">在线用户</span>
          </div>
          <div className="flex flex-col items-center">
            <UserAvatar 
              user={demoUsers[5]} 
              className="h-16 w-16 mb-2 shadow-md hover:shadow-lg" 
              colorStyle="pastel"
              shape="rounded"
              showBorder={false}
            />
            <span className="text-sm">圆角头像</span>
          </div>
          <div className="flex flex-col items-center">
            <UserAvatar 
              user={demoUsers[6]} 
              className="h-16 w-16 mb-2" 
              colorStyle="gradient"
              initialsLength={1}
              pulseEffect={true}
            />
            <span className="text-sm">渐变脉冲</span>
          </div>
          <div className="flex flex-col items-center">
            <UserAvatar 
              user={demoUsers[7]} 
              className="h-16 w-16 mb-2 hover:scale-110 transition-transform" 
              colorStyle="dark"
              shape="square"
              showBorder={false}
            />
            <span className="text-sm">方形深色</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 