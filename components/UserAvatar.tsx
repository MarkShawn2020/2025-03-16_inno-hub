'use client';

import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface UserAvatarProps {
  user: {
    name?: string | null;
    email: string;
    image?: string | null;
  };
  className?: string;
  fallbackClassName?: string;
}

/**
 * 用户头像组件
 * 优先级：图片（若上传） > 昵称首字母（若有） > 邮箱首字母
 */
export function UserAvatar({ user, className = '', fallbackClassName = '' }: UserAvatarProps) {
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
        .slice(0, 1); // 最多显示两个字母
    }

    // 其次使用邮箱首字母z
    if (user.email) {
      // 获取邮箱用户名部分的首字母（@前面的部分）
      const emailUsername = user.email.split('@')[0];
      return emailUsername?.[0]?.toUpperCase() || '?';
    }

    // 默认显示问号
    return '?';
  };

  return (
    <Avatar className={className}>
      {/* 如果有图片则显示图片 */}
      {user.image && <AvatarImage src={user.image} alt={user.name || 'User'} />}
      
      {/* 如果没有图片则显示文字备选 */}
      <AvatarFallback className={fallbackClassName}>
        {getFallbackText()}
      </AvatarFallback>
    </Avatar>
  );
} 