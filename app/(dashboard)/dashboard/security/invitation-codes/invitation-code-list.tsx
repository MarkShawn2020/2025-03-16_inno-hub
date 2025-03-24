"use client";
import { useEffect, useState } from 'react';
import { db } from '@/lib/db/drizzle';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { toggleInvitationCodeStatus, deleteInvitationCode } from './actions';
import { toast } from 'sonner';

// Type definition based on our schema
type InvitationCode = {
  id: number;
  code: string;
  description: string | null;
  isActive: boolean;
  maxUses: number | null;
  currentUses: number;
  createdAt: Date;
  expiresAt: Date | null;
  createdBy: number;
  createdByUser?: {
    email: string;
  };
};

export function InvitationCodeList() {
  const [codes, setCodes] = useState<InvitationCode[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCodes() {
      try {
        const response = await fetch('/api/invitation-codes');
        const data = await response.json();
        setCodes(data);
      } catch (error) {
        toast.error('获取邀请码失败');
        console.error('Failed to fetch invitation codes:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchCodes();
  }, []);

  const handleToggleStatus = async (id: number, currentStatus: boolean) => {
    try {
      const result = await toggleInvitationCodeStatus(id, !currentStatus);
      if (result.success) {
        setCodes(codes.map(code => 
          code.id === id ? { ...code, isActive: !currentStatus } : code
        ));
        toast.success(currentStatus ? '邀请码已停用' : '邀请码已启用');
      } else {
        toast.error(result.message || '操作失败');
      }
    } catch (error) {
      toast.error('更新邀请码状态失败');
      console.error('Failed to toggle invitation code status:', error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('确定要删除此邀请码吗？此操作不可撤销。')) {
      return;
    }

    try {
      const result = await deleteInvitationCode(id);
      if (result.success) {
        setCodes(codes.filter(code => code.id !== id));
        toast.success('邀请码已删除');
      } else {
        toast.error(result.message || '删除失败');
      }
    } catch (error) {
      toast.error('删除邀请码失败');
      console.error('Failed to delete invitation code:', error);
    }
  };

  if (loading) {
    return <div>正在加载邀请码列表...</div>;
  }

  if (codes.length === 0) {
    return <div className="text-center py-4">暂无邀请码</div>;
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>邀请码</TableHead>
            <TableHead>描述</TableHead>
            <TableHead>状态</TableHead>
            <TableHead>使用次数</TableHead>
            <TableHead>创建时间</TableHead>
            <TableHead>过期时间</TableHead>
            <TableHead>操作</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {codes.map((code) => (
            <TableRow key={code.id}>
              <TableCell className="font-mono">{code.code}</TableCell>
              <TableCell>{code.description || '-'}</TableCell>
              <TableCell>
                <Badge variant={code.isActive ? "default" : "outline"}>
                  {code.isActive ? '启用' : '停用'}
                </Badge>
              </TableCell>
              <TableCell>
                {code.currentUses} {code.maxUses ? `/ ${code.maxUses}` : ''}
              </TableCell>
              <TableCell>{new Date(code.createdAt).toLocaleString('zh-CN')}</TableCell>
              <TableCell>
                {code.expiresAt 
                  ? new Date(code.expiresAt).toLocaleString('zh-CN')
                  : '永不过期'}
              </TableCell>
              <TableCell>
                <div className="flex space-x-1">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleToggleStatus(code.id, code.isActive)}
                  >
                    {code.isActive ? '停用' : '启用'}
                  </Button>
                  <Button 
                    variant="destructive" 
                    size="sm"
                    onClick={() => handleDelete(code.id)}
                  >
                    删除
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
} 