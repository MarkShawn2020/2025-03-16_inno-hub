'use client';

import React, { useMemo } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

interface UserAvatarProps {
  user: {
    name?: string | null;
    email: string;
    image?: string | null;
  };
  className?: string;
  fallbackClassName?: string;
  showBorder?: boolean;
  pulseEffect?: boolean;
  colorStyle?: 'pastel' | 'vibrant' | 'dark' | 'gradient';
  shape?: 'circle' | 'rounded' | 'square';
  status?: 'online' | 'away' | 'busy' | 'offline';
  initialsLength?: number;
}

/**
 * 用户头像组件
 * 优先级：图片（若上传） > 昵称首字母（若有） > 邮箱首字母
 */
export function UserAvatar({ 
  user, 
  className = '', 
  fallbackClassName = '',
  showBorder = true,
  pulseEffect = false,
  colorStyle = 'vibrant',
  shape = 'circle',
  status,
  initialsLength = 2,
}: UserAvatarProps) {
  // 为用户生成一个独特的颜色
  const backgroundColor = useMemo(() => {
    // 不同色彩风格的配色方案
    const colorOptions = {
      pastel: [
        'bg-blue-300', 'bg-green-300', 'bg-yellow-300', 'bg-red-300', 
        'bg-purple-300', 'bg-pink-300', 'bg-indigo-300', 'bg-orange-300',
        'bg-teal-300', 'bg-cyan-300', 'bg-violet-300', 'bg-fuchsia-300',
      ],
      vibrant: [
        'bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-red-500', 
        'bg-purple-500', 'bg-pink-500', 'bg-indigo-500', 'bg-orange-500',
        'bg-teal-500', 'bg-cyan-500', 'bg-violet-500', 'bg-fuchsia-500',
      ],
      dark: [
        'bg-blue-700', 'bg-green-700', 'bg-yellow-700', 'bg-red-700', 
        'bg-purple-700', 'bg-pink-700', 'bg-indigo-700', 'bg-orange-700',
        'bg-teal-700', 'bg-cyan-700', 'bg-violet-700', 'bg-fuchsia-700',
      ],
      gradient: [
        'bg-gradient-to-r from-blue-500 to-teal-400',
        'bg-gradient-to-r from-purple-500 to-pink-500',
        'bg-gradient-to-r from-red-500 to-orange-500',
        'bg-gradient-to-r from-indigo-500 to-purple-500',
        'bg-gradient-to-r from-amber-500 to-yellow-500',
        'bg-gradient-to-r from-green-500 to-emerald-500',
        'bg-gradient-to-r from-cyan-500 to-blue-500',
        'bg-gradient-to-r from-fuchsia-500 to-violet-500',
      ]
    };
    
    // 生成一个伪随机数，基于用户的姓名和邮箱
    const stringToHash = (str: string) => {
      let hash = 0;
      for (let i = 0; i < str.length; i++) {
        hash = ((hash << 5) - hash) + str.charCodeAt(i);
        hash = hash & hash; // Convert to 32bit integer
      }
      return Math.abs(hash);
    };
    
    const identifier = (user.name || '') + user.email;
    const selectedPalette = colorOptions[colorStyle];
    const index = stringToHash(identifier) % selectedPalette.length;
    
    return selectedPalette[index];
  }, [user.name, user.email, colorStyle]);

  // 获取头像显示文本（备选方案）
  const getFallbackText = () => {
    // 优先使用昵称首字母
    if (user.name && user.name.trim()) {
      // 获取名字中每个单词的首字母
      return user.name
        .trim()
        .split(' ')
        .map(part => part[0]?.toUpperCase())
        .join('')
        .slice(0, initialsLength); // 最多显示指定数量的字母
    }

    // 其次使用邮箱首字母
    if (user.email) {
      // 获取邮箱用户名部分的首字母（@前面的部分）
      const emailUsername = user.email.split('@')[0];
      return emailUsername?.[0]?.toUpperCase() || '?';
    }

    // 默认显示问号
    return '?';
  };
  
  // 根据形状生成样式
  const shapeStyles = {
    circle: 'rounded-full',
    rounded: 'rounded-lg',
    square: 'rounded-none'
  };
  
  // 状态指示器的样式
  const statusIndicator = status && (
    <span className={cn(
      "absolute bottom-0 right-0 block rounded-full ring-2 ring-white",
      status === 'online' && 'bg-green-500',
      status === 'away' && 'bg-yellow-500',
      status === 'busy' && 'bg-red-500',
      status === 'offline' && 'bg-gray-400',
      // 根据头像大小调整指示器大小
      className.includes('h-5') || className.includes('w-5') || 
      className.includes('h-6') || className.includes('w-6') ? 'h-1.5 w-1.5' :
      className.includes('h-8') || className.includes('w-8') ? 'h-2 w-2' :
      className.includes('h-10') || className.includes('w-10') ? 'h-2.5 w-2.5' :
      className.includes('h-12') || className.includes('w-12') ? 'h-3 w-3' :
      className.includes('h-16') || className.includes('w-16') ? 'h-4 w-4' :
      className.includes('h-20') || className.includes('w-20') ? 'h-5 w-5' :
      'h-2 w-2'
    )}
    />
  );

  return (
    <div className="relative inline-block">
      <Avatar 
        className={cn(
          "transition-all duration-300 ease-in-out", 
          shapeStyles[shape],
          showBorder && "border-2 border-white shadow-sm hover:shadow-md hover:scale-105",
          pulseEffect && "animate-pulse",
          className
        )}
      >
        {/* 如果有图片则显示图片 */}
        {user.image && (
          <AvatarImage 
            src={user.image} 
            alt={user.name || 'User'} 
            className={cn(
              "transition-opacity duration-200 hover:opacity-90",
              shapeStyles[shape]
            )}
          />
        )}
        
        {/* 如果没有图片则显示文字备选 */}
        <AvatarFallback 
          className={cn(
            backgroundColor, 
            shapeStyles[shape],
            "text-white font-medium flex items-center justify-center transition-all duration-300",
            "hover:brightness-110 hover:shadow-inner",
            fallbackClassName
          )}
        >
          {getFallbackText()}
        </AvatarFallback>
      </Avatar>
      {statusIndicator}
    </div>
  );
} 