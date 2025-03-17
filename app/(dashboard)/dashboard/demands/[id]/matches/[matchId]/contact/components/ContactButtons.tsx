'use client';

import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface ContactButtonsProps {
  demandId: number;
  phoneNumber?: string;
}

export function ContactButtons({ demandId, phoneNumber }: ContactButtonsProps) {
  // 客户端交互逻辑
  const handleGoBack = () => {
    window.history.back();
  };
  
  const handleCallPhone = () => {
    if (phoneNumber) {
      window.location.href = `tel:${phoneNumber}`;
    } else {
      alert('该企业未提供联系电话');
    }
  };
  
  return (
    <div className="w-full">
      <div className="flex gap-4 mb-6">
        <Button disabled>发送邮件</Button>
        <Button disabled>在线聊天</Button>
        <Button onClick={handleCallPhone}>拨打电话</Button>
      </div>
      
      <div className="border-t pt-6 flex justify-between">
        <Button variant="outline" onClick={handleGoBack}>
          返回
        </Button>
        <Link href={`/dashboard/demands/${demandId}/matches`}>
          <Button>查看其他匹配</Button>
        </Link>
      </div>
    </div>
  );
} 