import { Badge } from '@/components/ui/badge';

// 扩展状态类型，增加与匹配流程相关的状态
type StatusType = 
  | 'new'             // 新建需求 
  | 'waiting_match'   // 等待匹配
  | 'matching'        // 正在匹配
  | 'matched'         // 已匹配
  | 'contacting'      // 联系中
  | 'in_progress'     // 进行中
  | 'delivered'       // 已交付
  | 'completed'       // 已完成
  | 'abandoned'       // 已放弃
  | 'canceled';       // 已取消

interface DemandStatusBadgeProps {
  status: string;
}

// 状态与显示名称映射
const statusMap: Record<StatusType, { label: string; variant: 'default' | 'outline' | 'secondary' | 'destructive' | 'success' }> = {
  new: { label: '新建需求', variant: 'outline' },
  waiting_match: { label: '等待匹配', variant: 'outline' },
  matching: { label: '匹配中', variant: 'secondary' },
  matched: { label: '已匹配', variant: 'secondary' },
  contacting: { label: '联系中', variant: 'secondary' },
  in_progress: { label: '进行中', variant: 'default' },
  delivered: { label: '已交付', variant: 'success' },
  completed: { label: '已完成', variant: 'success' },
  abandoned: { label: '已放弃', variant: 'destructive' },
  canceled: { label: '已取消', variant: 'destructive' },
};

export function DemandStatusBadge({ status }: DemandStatusBadgeProps) {
  const statusInfo = statusMap[status as StatusType] || { label: status, variant: 'outline' };

  return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>;
} 