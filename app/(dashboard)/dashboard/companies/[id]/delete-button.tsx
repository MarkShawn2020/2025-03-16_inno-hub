"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { deleteCompany } from '../actions';

interface DeleteCompanyButtonProps {
  companyId: number;
  companyName: string;
}

export default function DeleteCompanyButton({ companyId, companyName }: DeleteCompanyButtonProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const result = await deleteCompany(companyId);
      
      if (result.success) {
        toast.success(result.message);
        router.push('/dashboard/companies');
      } else {
        toast.error(result.message);
        setShowConfirm(false);
      }
    } catch (error) {
      console.error('删除企业时出错:', error);
      toast.error('删除企业时发生错误');
    } finally {
      setIsDeleting(false);
    }
  };

  if (showConfirm) {
    return (
      <div className="flex flex-col gap-3">
        <p className="text-sm text-red-500 font-medium">确定要删除企业 "{companyName}" 吗？此操作不可撤销。</p>
        <div className="flex gap-2">
          <Button 
            variant="destructive" 
            size="sm" 
            disabled={isDeleting}
            onClick={handleDelete}
          >
            {isDeleting ? '删除中...' : '确认删除'}
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
      variant="destructive" 
      size="sm"
      className="flex items-center gap-1"
      onClick={() => setShowConfirm(true)}
    >
      <Trash2 className="h-4 w-4" />
      删除企业
    </Button>
  );
} 