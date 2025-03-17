'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// 动态加载 WordCloud 组件以避免 SSR 问题
const WordCloud = dynamic(() => import('react-d3-cloud').then(mod => mod.default), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-[300px]">
      <div className="w-full h-full bg-slate-100 animate-pulse rounded-md">
        <div className="h-full w-full flex items-center justify-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-rose-500"></div>
        </div>
      </div>
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
  const [hoveredWord, setHoveredWord] = useState<string | null>(null);
  const [currentColorTheme, setCurrentColorTheme] = useState<string>('rose');
  const containerRef = useRef<HTMLDivElement>(null);
  const [hasSeenAnimation, setHasSeenAnimation] = useState(false);

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

  // 颜色主题方案
  const colorThemes = useMemo(() => ({
    rose: [
      '#fff1f2', '#ffe4e6', '#fecdd3', '#fda4af', '#fb7185', 
      '#f43f5e', '#e11d48', '#be123c', '#9f1239', '#881337'
    ],
    sky: [
      '#f0f9ff', '#e0f2fe', '#bae6fd', '#7dd3fc', '#38bdf8',
      '#0ea5e9', '#0284c7', '#0369a1', '#075985', '#0c4a6e'
    ],
    amber: [
      '#fffbeb', '#fef3c7', '#fde68a', '#fcd34d', '#fbbf24',
      '#f59e0b', '#d97706', '#b45309', '#92400e', '#78350f'
    ],
    emerald: [
      '#ecfdf5', '#d1fae5', '#a7f3d0', '#6ee7b7', '#34d399', 
      '#10b981', '#059669', '#047857', '#065f46', '#064e3b'
    ],
    violet: [
      '#f5f3ff', '#ede9fe', '#ddd6fe', '#c4b5fd', '#a78bfa',
      '#8b5cf6', '#7c3aed', '#6d28d9', '#5b21b6', '#4c1d95'
    ]
  }), []);

  // 每30秒切换一次颜色主题
  useEffect(() => {
    const themes = Object.keys(colorThemes);
    const interval = setInterval(() => {
      setCurrentColorTheme(prevTheme => {
        const currentIndex = themes.indexOf(prevTheme);
        const nextIndex = (currentIndex + 1) % themes.length;
        return themes[nextIndex];
      });
    }, 30000);
    
    return () => clearInterval(interval);
  }, [colorThemes]);

  // 提取关键词
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
      
      // 添加动画效果：逐步显示词
      const animateWords = async () => {
        if (!hasSeenAnimation) {
          setWords([]);
          // 每次添加一个词，形成动画效果
          for (let i = 0; i < filteredWords.length; i++) {
            setWords(prev => [...prev, filteredWords[i]]);
            await new Promise(resolve => setTimeout(resolve, 50));
          }
          setHasSeenAnimation(true);
        } else {
          setWords(filteredWords);
        }
        setIsLoading(false);
      };
      
      animateWords();
    } else {
      setWords([]);
      setIsLoading(false);
    }
  }, [demands, hasSeenAnimation]);
  
  // 词云配置 - 根据容器宽度调整字体大小
  const fontSizeMapper = (word: { value: number, text: string }) => {
    // 根据容器宽度动态调整字体大小
    const baseSize = Math.min(Math.log2(word.value) * 8 + 14, 50);
    // 如果是悬停词，增大字体
    if (hoveredWord === word.text) {
      return Math.min(baseSize * 1.3, 60);
    }
    if (containerWidth < 640) {
      return Math.min(baseSize * 0.7, 35); // 小屏幕上字体更小
    }
    return baseSize;
  };

  // 随机旋转文字，有30%概率旋转
  const rotate = () => Math.random() > 0.7 ? (Math.random() > 0.5 ? 90 : -90) : 0;

  // 根据当前主题和词频生成颜色
  const getWordColor = (value: number) => {
    const currentPalette = colorThemes[currentColorTheme as keyof typeof colorThemes];
    
    // 将值归一化到0-9的范围
    const colorMax = Math.max(...words.map(w => w.value));
    const colorMin = Math.min(...words.map(w => w.value));
    const normalizedValue = Math.floor(((value - colorMin) / (colorMax - colorMin || 1)) * 9);
    
    // 最小值为8, 确保颜色不会太淡
    return currentPalette[Math.max(9 - normalizedValue, 3)];
  };

  // 如果没有数据，显示空状态
  if (!isLoading && words.length === 0) {
    return (
      <Card className="bg-gradient-to-r from-slate-50 to-gray-50 shadow-md">
        <CardHeader className="border-b pb-3">
          <CardTitle className="text-lg text-gray-700 flex items-center gap-2">
            <span className="i-lucide-cloud" />
            需求关键词云
          </CardTitle>
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
    <Card className="bg-gradient-to-r from-slate-50 to-gray-50 shadow-lg border-t border-l border-r border-b-2 border-b-gray-200 hover:shadow-xl transition-all duration-300">
      <CardHeader className="border-b pb-3">
        <CardTitle className="text-lg flex justify-between items-center">
          <div className="flex items-center gap-2 text-gray-700">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"/>
              <path d="M22 5a3 3 0 0 0-3-3h-2.207a5.502 5.502 0 0 0-10.702.5"/>
            </svg>
            需求关键词云
          </div>
          <div className="flex gap-1">
            {Object.keys(colorThemes).map(theme => (
              <button
                key={theme}
                className={`w-4 h-4 rounded-full ${
                  currentColorTheme === theme 
                    ? 'ring-2 ring-offset-2 ring-gray-400'
                    : 'opacity-60 hover:opacity-100'
                }`}
                style={{ 
                  backgroundColor: colorThemes[theme as keyof typeof colorThemes][5],
                  transition: 'all 0.2s ease'
                }}
                onClick={() => setCurrentColorTheme(theme)}
                title={`切换到${theme}主题`}
              />
            ))}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        <div 
          ref={containerRef} 
          className="h-[300px] w-full overflow-hidden relative"
        >
          {isLoading ? (
            <div className="w-full h-full bg-slate-100 rounded-md flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-500"></div>
            </div>
          ) : (
            containerWidth > 0 && (
              <div className="relative transform transition-all duration-500 hover:scale-102">
                <WordCloud
                  data={words}
                  fontSize={fontSizeMapper}
                  rotate={rotate}
                  padding={3}
                  font="Arial"
                  width={containerWidth - 10}
                  height={290}
                  fill={(d: { value: number, text: string }) => {
                    // 基于词频和当前主题生成颜色
                    return hoveredWord === d.text 
                      ? '#000000' // 悬停时变黑色
                      : getWordColor(d.value);
                  }}
                  onWordMouseOver={(_, d) => {
                    setHoveredWord(d.text);
                  }}
                  onWordMouseOut={() => {
                    setHoveredWord(null);
                  }}
                  random={() => 0.5}
                />
                {hoveredWord && (
                  <div className="absolute bottom-2 right-2 bg-white/80 backdrop-blur-sm px-3 py-1 rounded-full text-sm shadow-sm border border-gray-100">
                    {hoveredWord}
                  </div>
                )}
              </div>
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