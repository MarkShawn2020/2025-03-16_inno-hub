'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from '@/components/ui/select';
import { 
  Card, 
  CardHeader,
  CardTitle, 
  CardContent,
  CardFooter 
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DemandStatusBadge } from '../../components/demand-status-badge';
import { toast } from 'sonner';
import { updateDemandStatus, startMatching } from '../../actions';
import { RefreshCcw, Search, AlertCircle } from 'lucide-react';

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

interface DemandStatusControlProps {
  demandId: number;
  currentStatus: string;
  matchCount: number;
}

export default function DemandStatusControl({ 
  demandId, 
  currentStatus,
  matchCount
}: DemandStatusControlProps) {
  const [status, setStatus] = useState<string>(currentStatus);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isMatching, setIsMatching] = useState(false);

  // 根据当前状态确定可选的下一状态
  const getAvailableStatusOptions = (): { value: string; label: string }[] => {
    switch (currentStatus) {
      case 'new':
        return [
          { value: 'new', label: '新建需求' },
          { value: 'waiting_match', label: '等待匹配' },
          { value: 'canceled', label: '取消需求' }
        ];
      case 'waiting_match':
        return [
          { value: 'waiting_match', label: '等待匹配' },
          { value: 'matching', label: '开始匹配' },
          { value: 'canceled', label: '取消需求' }
        ];
      case 'matching':
        return [
          { value: 'matching', label: '匹配中' }
        ];
      case 'matched':
        return [
          { value: 'matched', label: '已匹配' },
          { value: 'contacting', label: '联系中' },
          { value: 'abandoned', label: '放弃匹配' },
          { value: 'canceled', label: '取消需求' }
        ];
      case 'contacting':
        return [
          { value: 'contacting', label: '联系中' },
          { value: 'in_progress', label: '进行中' },
          { value: 'abandoned', label: '放弃匹配' },
          { value: 'canceled', label: '取消需求' }
        ];
      case 'in_progress':
        return [
          { value: 'in_progress', label: '进行中' },
          { value: 'delivered', label: '已交付' },
          { value: 'abandoned', label: '放弃项目' },
          { value: 'canceled', label: '取消需求' }
        ];
      case 'delivered':
        return [
          { value: 'delivered', label: '已交付' },
          { value: 'completed', label: '已完成' }
        ];
      case 'completed':
        return [
          { value: 'completed', label: '已完成' }
        ];
      case 'abandoned':
        return [
          { value: 'abandoned', label: '已放弃' },
          { value: 'new', label: '重新开始' }
        ];
      case 'canceled':
        return [
          { value: 'canceled', label: '已取消' },
          { value: 'new', label: '重新开始' }
        ];
      default:
        return [
          { value: currentStatus, label: currentStatus }
        ];
    }
  };

  // 处理状态更新
  const handleStatusUpdate = async () => {
    if (status === currentStatus) return;
    
    setIsUpdating(true);
    
    try {
      const result = await updateDemandStatus(demandId, status);
      
      if (result.success) {
        toast.success(result.message);
        // 页面会刷新，不需要额外操作
      } else {
        toast.error(result.message);
        // 重置状态选择
        setStatus(currentStatus);
      }
    } catch (error) {
      console.error('更新状态时出错:', error);
      toast.error('更新状态时发生错误');
      setStatus(currentStatus);
    } finally {
      setIsUpdating(false);
    }
  };

  // 处理启动匹配
  const handleStartMatching = async () => {
    setIsMatching(true);
    
    try {
      const result = await startMatching(demandId);
      
      if (result.success) {
        toast.success(result.message);
        // 页面会刷新，不需要额外操作
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error('启动匹配时出错:', error);
      toast.error('启动匹配时发生错误');
    } finally {
      setIsMatching(false);
    }
  };

  const statusOptions = getAvailableStatusOptions();
  const canStartMatching = ['new', 'waiting_match'].includes(currentStatus);
  const showMatchButton = canStartMatching || (currentStatus === 'matched' && matchCount === 0);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-gray-500 flex justify-between items-center">
          <span>需求状态管理</span>
          <DemandStatusBadge status={currentStatus} />
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {currentStatus === 'matching' ? (
          <div className="flex items-center justify-center p-4">
            <RefreshCcw className="animate-spin mr-2 h-5 w-5 text-primary" />
            <span>匹配进行中，请稍候...</span>
          </div>
        ) : (
          <>
            <div className="space-y-2">
              <label htmlFor="status-select" className="text-sm text-gray-500">
                更新需求状态
              </label>
              <Select 
                value={status} 
                onValueChange={setStatus}
                disabled={isUpdating || statusOptions.length <= 1}
              >
                <SelectTrigger id="status-select">
                  <SelectValue placeholder="选择新状态" />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {showMatchButton && (
              <div className="pt-2">
                <Button 
                  className="w-full"
                  variant="default"
                  onClick={handleStartMatching}
                  disabled={isMatching}
                >
                  {isMatching ? (
                    <>
                      <RefreshCcw className="animate-spin mr-2 h-4 w-4" />
                      匹配中...
                    </>
                  ) : (
                    <>
                      <Search className="mr-2 h-4 w-4" />
                      开始AI企业匹配
                    </>
                  )}
                </Button>
              </div>
            )}
            
            {currentStatus === 'matched' && matchCount > 0 && (
              <div className="flex items-center justify-center p-2 bg-gray-50 rounded-md">
                <Badge variant="success">{matchCount}</Badge>
                <span className="ml-2">家匹配企业</span>
              </div>
            )}
            
            {['abandoned', 'canceled'].includes(currentStatus) && (
              <div className="flex items-center justify-center p-2 bg-red-50 rounded-md text-red-500">
                <AlertCircle className="mr-2 h-4 w-4" />
                <span className="text-sm">需求已终止</span>
              </div>
            )}
          </>
        )}
      </CardContent>
      <CardFooter>
        {currentStatus !== 'matching' && status !== currentStatus && (
          <Button 
            className="w-full"
            variant="outline"
            onClick={handleStatusUpdate}
            disabled={isUpdating || status === currentStatus}
          >
            {isUpdating ? '更新中...' : '确认更新状态'}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
} 