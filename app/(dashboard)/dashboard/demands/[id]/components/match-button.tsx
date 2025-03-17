'use client';

import { useState } from 'react';
import { startMatching } from '../../actions';
import { Button } from '@/components/ui/button';
import { Wand2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

interface MatchButtonProps {
  demandId: number;
  isOwner: boolean;
  currentStatus: string;
}

export default function MatchButton({ demandId, isOwner, currentStatus }: MatchButtonProps) {
  const [isMatching, setIsMatching] = useState(false);
  const router = useRouter();
  
  // 非需求所有者不显示按钮
  if (!isOwner) {
    return null;
  }
  
  // 已经匹配成功的需求显示"查看匹配结果"按钮
  if (currentStatus === 'matched') {
    return (
      <Button 
        onClick={() => router.push(`/dashboard/demands/${demandId}/matches`)}
        variant="outline"
      >
        <Wand2 className="mr-2 h-4 w-4" />
        查看匹配结果
      </Button>
    );
  }
  
  // 正在匹配中的需求显示加载按钮
  if (currentStatus === 'matching') {
    return (
      <Button disabled>
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        正在匹配中...
      </Button>
    );
  }

  const handleMatch = async () => {
    try {
      setIsMatching(true);
      
      const result = await startMatching(demandId);
      
      if (result.success) {
        toast.success(result.message);
        router.refresh();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error('匹配过程中出错:', error);
      toast.error('匹配过程中发生错误');
    } finally {
      setIsMatching(false);
    }
  };

  return (
    <Button 
      onClick={handleMatch}
      disabled={isMatching}
    >
      {isMatching ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          正在匹配中...
        </>
      ) : (
        <>
          <Wand2 className="mr-2 h-4 w-4" />
          AI智能匹配
        </>
      )}
    </Button>
  );
} 