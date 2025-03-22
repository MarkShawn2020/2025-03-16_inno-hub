'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

// 轮播图数据
const carouselItems = [
  {
    id: 1,
    title: "连接企业需求与能力",
    description: "InnoHub商机共振平台助力企业高效匹配，实现业务增长",
    image: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2084&q=80",
    ctaText: "了解更多",
    ctaLink: "/dashboard"
  },
  {
    id: 2,
    title: "强大的AI匹配算法",
    description: "基于DeepSeek大模型技术，实现精准的商机匹配",
    image: "https://images.unsplash.com/photo-1531482615713-2afd69097998?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
    ctaText: "查看企业库",
    ctaLink: "/dashboard/companies"
  },
  {
    id: 3,
    title: "提交您的业务需求",
    description: "让系统为您推荐最合适的企业合作伙伴",
    image: "https://images.unsplash.com/photo-1551434678-e076c223a692?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2070&q=80",
    ctaText: "提交需求",
    ctaLink: "/dashboard/demands/new"
  }
];

export function Carousel() {
  const [activeIndex, setActiveIndex] = useState(0);
  const itemCount = carouselItems.length;

  // 自动轮播
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((current) => (current + 1) % itemCount);
    }, 5000);
    return () => clearInterval(interval);
  }, [itemCount]);

  // 切换到上一个轮播项
  const prevSlide = useCallback(() => {
    setActiveIndex((current) => (current - 1 + itemCount) % itemCount);
  }, [itemCount]);

  // 切换到下一个轮播项
  const nextSlide = useCallback(() => {
    setActiveIndex((current) => (current + 1) % itemCount);
  }, [itemCount]);

  // 切换到指定轮播项
  const goToSlide = useCallback((index: number) => {
    setActiveIndex(index);
  }, []);

  return (
    <div className="relative w-full overflow-hidden bg-gray-900">
      <div className="w-full h-96 md:h-[500px] relative">
        {carouselItems.map((item, index) => (
          <div
            key={item.id}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              index === activeIndex ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/30 z-10" />
            <div className="absolute inset-0">
              <Image
                src={item.image}
                alt={item.title}
                fill
                className="object-cover"
                priority={index === 0}
              />
            </div>
            <div className="relative z-20 flex h-full items-center">
              <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="max-w-2xl">
                  <h2 className="text-4xl font-bold text-white mb-4">
                    {item.title}
                  </h2>
                  <p className="text-xl text-gray-100 mb-8">
                    {item.description}
                  </p>
                  <Button
                    asChild
                    className="bg-orange-500 hover:bg-orange-600 text-white border-none"
                  >
                    <Link href={item.ctaLink}>{item.ctaText}</Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ))}
        
        {/* 导航按钮 */}
        <button
          onClick={prevSlide}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-30 bg-black/30 hover:bg-black/50 text-white p-2 rounded-full"
          aria-label="Previous slide"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-30 bg-black/30 hover:bg-black/50 text-white p-2 rounded-full"
          aria-label="Next slide"
        >
          <ChevronRight className="h-6 w-6" />
        </button>
        
        {/* 指示器 */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 flex space-x-2">
          {carouselItems.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-3 h-3 rounded-full ${
                index === activeIndex ? 'bg-white' : 'bg-white/50'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
} 