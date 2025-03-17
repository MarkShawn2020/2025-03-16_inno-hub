"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { deleteDemand } from '../actions';

interface DeleteDemandButtonProps {
  demandId: number;
  demandTitle: string;
}

export default function DeleteDemandButton({ demandId, demandTitle }: DeleteDemandButtonProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const result = await deleteDemand(demandId);
      
      if (result.success) {
        toast.success(result.message);
        router.refresh(); // 刷新当前页面而不是导航
      } else {
        toast.error(result.message);
        setShowConfirm(false);
      }
    } catch (error) {
      console.error('删除需求时出错:', error);
      toast.error('删除需求时发生错误');
    } finally {
      setIsDeleting(false);
    }
  };

  if (showConfirm) {
    return (
      <div className="absolute z-10 bg-white shadow-lg rounded-md p-3 border border-gray-200 w-64">
        <p className="text-sm text-red-500 font-medium mb-2">确定要删除需求 "{demandTitle}" 吗？</p>
        <div className="flex gap-2 justify-end">
          <Button 
            variant="destructive" 
            size="sm" 
            disabled={isDeleting}
            onClick={handleDelete}
          >
            {isDeleting ? '删除中...' : '确认'}
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setShowConfirm(false)}
            disabled={isDeleting}
          >
            取消
          </Button>
        </div>
      </div>
    );
  }

  return (
    <Button 
      variant="outline" 
      size="sm"
      className="flex items-center gap-1 text-red-500 hover:text-red-700 hover:bg-red-50 border-red-200"
      onClick={(e) => {
        e.stopPropagation();
        setShowConfirm(true);
      }}
    >
      <Trash2 className="h-4 w-4" />
      删除
    </Button>
  );
} 