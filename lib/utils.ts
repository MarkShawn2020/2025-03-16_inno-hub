import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { formatDistanceToNow } from 'date-fns'
import { zhCN } from 'date-fns/locale'

export function cn(...inputs: (string | undefined | null | boolean)[]) {
  return inputs.filter(Boolean).join(' ');
}

/**
 * 格式化日期为易读格式
 * @param date 日期对象或日期字符串或时间戳
 * @returns 格式化后的日期字符串，如：2023年12月31日 12:34
 */
export function formatDate(date: Date | string | number): string {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = d.getMonth() + 1;
  const day = d.getDate();
  const hour = d.getHours().toString().padStart(2, '0');
  const minute = d.getMinutes().toString().padStart(2, '0');

  return `${year}年${month}月${day}日 ${hour}:${minute}`;
}

/**
 * 格式化日期为相对时间
 * @param date 日期对象或日期字符串或时间戳
 * @returns 格式化后的相对时间字符串，如：3小时前、2天前
 */
export function formatRelativeTime(date: Date | string | number): string {
  return formatDistanceToNow(new Date(date), { 
    addSuffix: true,
    locale: zhCN
  });
}
