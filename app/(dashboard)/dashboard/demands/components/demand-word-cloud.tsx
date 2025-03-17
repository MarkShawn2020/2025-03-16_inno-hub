'use client';

import { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// 动态加载 WordCloud 组件以避免 SSR 问题
const WordCloud = dynamic(() => import('react-d3-cloud').then(mod => mod.default), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-[300px]">
      <div className="w-full h-full bg-gray-100 animate-pulse rounded-md" />
    </div>
  ),
});

// 定义词云数据项接口
interface WordCloudData {
  text: string;
  value: number;
}

interface DemandWordCloudProps {
  demands: Array<{
    id: number;
    title: string;
    description: string;
    status: string;
    parsedModules?: any;
  }>;
}

export function DemandWordCloud({ demands }: DemandWordCloudProps) {
  const [words, setWords] = useState<WordCloudData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [containerWidth, setContainerWidth] = useState<number>(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // 监听容器宽度变化
  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.clientWidth);
      }
    };

    updateWidth();

    // 添加窗口大小变化监听
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  useEffect(() => {
    if (demands && demands.length > 0) {
      // 提取关键词并计算频率
      const keywords: Record<string, number> = {};
      
      demands.forEach(demand => {
        // 从标题提取关键词
        extractKeywords(demand.title).forEach(keyword => {
          keywords[keyword] = (keywords[keyword] || 0) + 3; // 标题中的词权重高
        });
        
        // 从描述提取关键词
        extractKeywords(demand.description).forEach(keyword => {
          keywords[keyword] = (keywords[keyword] || 0) + 1;
        });
        
        // 从解析模块中提取关键词
        if (demand.parsedModules) {
          const modules = Array.isArray(demand.parsedModules) ? demand.parsedModules : [];
          modules.forEach((module: any) => {
            if (module.moduleName) {
              extractKeywords(module.moduleName).forEach(keyword => {
                keywords[keyword] = (keywords[keyword] || 0) + 2;
              });
            }
            if (module.description) {
              extractKeywords(module.description).forEach(keyword => {
                keywords[keyword] = (keywords[keyword] || 0) + 1;
              });
            }
          });
        }
      });
      
      // 过滤停用词和短词
      const filteredWords = Object.entries(keywords)
        .filter(([word]) => !isStopWord(word) && word.length > 1)
        .map(([text, value]) => ({ text, value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 50); // 最多展示50个词
      
      setWords(filteredWords);
      setIsLoading(false);
    } else {
      setWords([]);
      setIsLoading(false);
    }
  }, [demands]);
  
  // 词云配置 - 根据容器宽度调整字体大小
  const fontSizeMapper = (word: { value: number }) => {
    // 根据容器宽度动态调整字体大小
    const baseSize = Math.min(Math.log2(word.value) * 8 + 12, 40);
    if (containerWidth < 640) {
      return Math.min(baseSize * 0.7, 30); // 小屏幕上字体更小
    }
    return baseSize;
  };
  const rotate = () => 0; // 不旋转文字

  // 如果没有数据，显示空状态
  if (!isLoading && words.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>需求关键词云</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[250px] bg-gray-50 rounded-md">
            <p className="text-gray-500">暂无足够数据生成词云</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>需求关键词云</CardTitle>
      </CardHeader>
      <CardContent>
        <div 
          ref={containerRef} 
          className="h-[250px] w-full overflow-hidden"
        >
          {isLoading ? (
            <div className="w-full h-full bg-gray-100 animate-pulse rounded-md" />
          ) : (
            containerWidth > 0 && (
              <WordCloud
                data={words}
                fontSize={fontSizeMapper}
                rotate={rotate}
                padding={3}
                font="Arial"
                width={containerWidth - 20} // 留出边距
                height={230} // 固定高度
                fill={(d: { value: number }) => {
                  // 基于词频生成颜色
                  const value = d.value;
                  if (value > 10) return '#e11d48'; // 最高频词
                  if (value > 5) return '#f43f5e';
                  if (value > 3) return '#fb7185';
                  return '#fda4af'; // 低频词
                }}
              />
            )
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// 辅助函数：提取关键词
function extractKeywords(text: string): string[] {
  if (!text) return [];
  
  // 简单的分词逻辑，根据汉字和英文单词分开
  return text
    .toLowerCase()
    .replace(/[^\u4e00-\u9fa5a-zA-Z0-9]/g, ' ') // 保留汉字、字母和数字
    .split(/\s+/)
    .filter(word => word.length > 0);
}

// 辅助函数：判断是否为停用词
function isStopWord(word: string): boolean {
  const stopWords = [
    'and', 'the', 'to', 'of', 'a', 'in', 'for', 'is', 'on', 'that', 'by', 'this', 'with', 'i', 'you', 'it',
    '的', '了', '和', '是', '在', '我', '有', '与', '这', '他', '你', '她', '它', '那', '也', '上', '下', '中', '个',
    '需求', '系统', '功能', '开发', '实现', '进行', '通过', '使用', '用户', '提供', '数据', '平台', '应用'
  ];
  return stopWords.includes(word);
} 