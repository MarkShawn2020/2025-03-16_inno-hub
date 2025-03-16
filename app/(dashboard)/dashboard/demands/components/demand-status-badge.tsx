import { Badge } from '@/components/ui/badge';

type StatusType = 'new' | 'matching' | 'matched' | 'in_progress' | 'completed' | 'canceled';

interface DemandStatusBadgeProps {
  status: string;
}

// 状态与显示名称映射
const statusMap: Record<StatusType, { label: string; variant: 'default' | 'outline' | 'secondary' | 'destructive' }> = {
  new: { label: '新建需求', variant: 'outline' },
  matching: { label: '匹配中', variant: 'secondary' },
  matched: { label: '已匹配', variant: 'default' },
  in_progress: { label: '进行中', variant: 'default' },
  completed: { label: '已完成', variant: 'default' },
  canceled: { label: '已取消', variant: 'destructive' },
};

export function DemandStatusBadge({ status }: DemandStatusBadgeProps) {
  const statusInfo = statusMap[status as StatusType] || { label: status, variant: 'outline' };

  return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>;
} 