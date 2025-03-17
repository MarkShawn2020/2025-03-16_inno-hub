'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { deleteDemand } from '../actions';
import { toast } from 'sonner';

interface DeleteDemandButtonProps {
  demandId: number;
  title: string;
}

export default function DeleteDemandButton({ demandId, title }: DeleteDemandButtonProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const router = useRouter();

  // 确认删除步骤
  const handleDelete = async () => {
    if (!showConfirm) {
      setShowConfirm(true);
      return;
    }

    try {
      setIsDeleting(true);
      const result = await deleteDemand(demandId);
      
      if (result.success) {
        toast.success(`需求 "${title}" 已删除`);
        // 刷新页面或重定向
        router.refresh();
      } else {
        toast.error(result.message || '删除失败');
        setShowConfirm(false);
      }
    } catch (error) {
      console.error('删除需求时出错:', error);
      toast.error('删除需求时发生错误');
    } finally {
      setIsDeleting(false);
    }
  };

  // 取消删除
  const handleCancel = () => {
    setShowConfirm(false);
  };

  return (
    <>
      {!showConfirm ? (
        <Button
          variant="destructive"
          size="sm"
          onClick={handleDelete}
          disabled={isDeleting}
        >
          <Trash2 className="h-4 w-4 mr-1" />
          删除
        </Button>
      ) : (
        <div className="flex items-center space-x-1">
          <Button
            variant="destructive"
            size="sm"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? '删除中...' : '确认'}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleCancel}
            disabled={isDeleting}
          >
            取消
          </Button>
        </div>
      )}
    </>
  );
} 