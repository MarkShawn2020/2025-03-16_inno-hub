'use client';

import Link from 'next/link';
import { use, useState, useEffect, useCallback, Suspense } from 'react';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { 
  CircleIcon, 
  LogOut, 
  LayoutDashboard, 
  FileText, 
  Building, 
  Link2, 
  Settings,
  Menu,
  HomeIcon,
  Building2Icon,
  BriefcaseIcon,
  Cog,
  UserIcon,
  Mail,
  Phone,
  MessageSquare,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { UserAvatar } from '@/components/UserAvatar';
import { useUser } from '@/lib/auth';
import { signOut } from '@/app/(login)/actions';
import { useRouter, usePathname } from 'next/navigation';
import { Metadata } from 'next';
import { ComponentProps } from 'react';
import { Carousel } from '../components/Carousel';


function UserMenu() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { userPromise } = useUser();
  const user = use(userPromise);
  const router = useRouter();

  async function handleSignOut() {
    await signOut();
    router.refresh();
    router.push('/');
  }

  if (!user) {
    return (
      <>
        <Link
          href="/pricing"
          className="text-sm font-medium text-gray-700 hover:text-gray-900"
        >
          Pricing
        </Link>
        <Button
          asChild
          className="bg-black hover:bg-gray-800 text-white text-sm px-4 py-2 rounded-full"
        >
          <Link href="/sign-up">Sign Up</Link>
        </Button>
      </>
    );
  }

  return (
    <DropdownMenu open={isMenuOpen} onOpenChange={setIsMenuOpen}>
      <DropdownMenuTrigger>
        <UserAvatar 
          user={user} 
          className="cursor-pointer size-9 ring-2 ring-orange-100 hover:ring-orange-200" 
          showBorder={false}
        />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="flex flex-col gap-1">
        <DropdownMenuItem className="cursor-pointer">
          <Link href="/account" className="flex w-full items-center">
            <Settings className="mr-2 h-4 w-4" />
            <span>账号设置</span>
          </Link>
        </DropdownMenuItem>
        <form action={handleSignOut} className="w-full">
          <button type="submit" className="flex w-full">
            <DropdownMenuItem className="w-full flex-1 cursor-pointer">
              <LogOut className="mr-2 h-4 w-4" />
              <span>退出登录</span>
            </DropdownMenuItem>
          </button>
        </form>
      </DropdownMenuContent>
    </DropdownMenu>
  );
} 

function Header() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { userPromise } = useUser();
  const user = use(userPromise);
  const isLoggedIn = !!user;
  
  const navItems = [
    { href: '/dashboard', icon: LayoutDashboard, label: '概览' },
    { href: '/dashboard/companies', icon: Building, label: '企业库' },
    { href: '/dashboard/demands', icon: FileText, label: '需求库' },
    { href: '/about-us', icon: UserIcon, label: '关于我们' },
  ];

  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <Link href="/" className="flex items-center mr-10">
              <CircleIcon className="h-6 w-6 text-orange-500" />
              <span className="ml-2 text-xl font-semibold text-gray-900">InnoHub</span>
            </Link>
            
            <nav className="hidden md:flex space-x-6">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center text-sm font-medium ${
                    pathname === item.href
                      ? 'text-orange-600'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <item.icon className="h-4 w-4 mr-1" />
                  {item.label}
                </Link>
              ))}
              
            </nav>
          </div>
          
          <div className="hidden md:flex items-center space-x-4">
            <UserMenu />
          </div>
          
          <div className="md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-gray-500 p-2"
            >
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </div>
        
        {/* 移动端菜单 */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4">
            <nav className="flex flex-col space-y-4">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center text-sm font-medium ${
                    pathname === item.href
                      ? 'text-orange-600'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <item.icon className="h-4 w-4 mr-2" />
                  {item.label}
                </Link>
              ))}
            
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer className="bg-gray-50 border-t border-gray-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <div className="flex items-center mb-4">
              <CircleIcon className="h-6 w-6 text-orange-500" />
              <span className="ml-2 text-xl font-semibold text-gray-900">InnoHub</span>
            </div>
            <p className="text-gray-600 text-sm mb-4">
              商机共振平台 - 致力于连接企业间的需求与能力，打造创新生态
            </p>
            <p className="text-gray-600 text-sm">
              © {new Date().getFullYear()} InnoHub. 保留所有权利。
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-4">产品</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/dashboard" className="text-gray-600 text-sm hover:text-orange-500">
                  平台概览
                </Link>
              </li>
              <li>
                <Link href="/dashboard/companies" className="text-gray-600 text-sm hover:text-orange-500">
                  企业库
                </Link>
              </li>
              <li>
                <Link href="/dashboard/demands" className="text-gray-600 text-sm hover:text-orange-500">
                  需求库
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-4">联系我们</h3>
            <ul className="space-y-3">
              <li className="flex items-center text-gray-600 text-sm">
                <MessageSquare className="h-4 w-4 mr-2" />
                <span>企业微信: InnoHub (即将开通)</span>
              </li>
              <li className="flex items-center text-gray-600 text-sm">
                <Mail className="h-4 w-4 mr-2" />
                <a href="mailto:contact@innohub.cn" className="hover:text-orange-500">
                  contact@innohub.cn
                </a>
              </li>
              <li className="flex items-center text-gray-600 text-sm">
                <Phone className="h-4 w-4 mr-2" />
                <a href="tel:+8610xxxxxxxx" className="hover:text-orange-500">
                  010-XXXX-XXXX
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
}

function NotificationBanner() {
  return (
    <div className="bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 text-white py-2.5 px-4 text-center shadow-md animate-pulse">
      <p className="text-sm font-bold flex items-center justify-center">
        <span className="inline-block mr-2">🚀</span>
        已接入满血版 DeepSeek
        <span className="inline-block ml-2">✨</span>
      </p>
    </div>
  );
}

/**
 * 主仪表板布局
 */
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  // 修改条件：在首页和仪表板首页都显示轮播图
  const showCarousel = pathname === '/dashboard' || pathname === '/';
  
  return (
    <section className="flex flex-col min-h-screen">
      <Header />
      <NotificationBanner />
      
      {/* 在首页和仪表板首页都显示轮播图 */}
      {showCarousel && <Carousel />}
      
      <main className="flex-1 overflow-auto">
        <div className="container mx-auto py-6 px-4 lg:px-8">
          {children}
        </div>
      </main>
      <Footer />
    </section>
  );
}
