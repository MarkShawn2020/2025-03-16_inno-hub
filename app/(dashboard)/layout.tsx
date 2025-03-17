'use client';

import Link from 'next/link';
import { use, useState, Suspense } from 'react';
import { Button } from '@/components/ui/button';
import { 
  CircleIcon, 
  LogOut, 
  LayoutDashboard, 
  FileText, 
  Building, 
  Link2, 
  Settings,
  Menu
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
        <UserAvatar user={user} className="cursor-pointer size-9" />
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
  
  const navItems = [
    { href: '/dashboard', icon: LayoutDashboard, label: '概览' },
    { href: '/dashboard/companies', icon: Building, label: '企业管理' },
    { href: '/dashboard/demands', icon: FileText, label: '需求管理' },
    { href: '/dashboard/matches', icon: Link2, label: '匹配结果' },
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
            
            {/* 桌面导航 */}
            <nav className="hidden md:flex items-center space-x-1">
              {navItems.map((item) => (
                <Link key={item.href} href={item.href} passHref>
                  <Button
                    variant={pathname === item.href || pathname.startsWith(`${item.href}/`) ? 'secondary' : 'ghost'}
                    className={`shadow-none ${
                      pathname === item.href || pathname.startsWith(`${item.href}/`) ? 'bg-gray-100' : ''
                    }`}
                    size="sm"
                  >
                    <item.icon className="mr-2 h-4 w-4" />
                    {item.label}
                  </Button>
                </Link>
              ))}
            </nav>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* 移动端菜单按钮 */}
            <Button 
              variant="ghost" 
              size="icon" 
              className="md:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <Menu className="h-5 w-5" />
            </Button>
            
            <Suspense fallback={<div className="h-9" />}>
              <UserMenu />
            </Suspense>
          </div>
        </div>
        
        {/* 移动端菜单 */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-3 border-t border-gray-100 mt-3">
            <nav className="flex flex-col space-y-2">
              {navItems.map((item) => (
                <Link key={item.href} href={item.href} passHref>
                  <Button
                    variant={pathname === item.href || pathname.startsWith(`${item.href}/`) ? 'secondary' : 'ghost'}
                    className={`shadow-none justify-start w-full ${
                      pathname === item.href || pathname.startsWith(`${item.href}/`) ? 'bg-gray-100' : ''
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <item.icon className="mr-2 h-4 w-4" />
                    {item.label}
                  </Button>
                </Link>
              ))}
            </nav>
          </div>
        )}
      </div>
    </header>
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

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <section className="flex flex-col min-h-screen">
      <Header />
      <NotificationBanner />
      <main className="flex-1 overflow-auto">
        <div className="container mx-auto py-6 px-4 lg:px-8">
          {children}
        </div>
      </main>
    </section>
  );
}
