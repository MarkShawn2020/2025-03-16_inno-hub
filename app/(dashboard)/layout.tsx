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
  Settings
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
        <Avatar className="cursor-pointer size-9">
          <AvatarImage alt={user.name || ''} />
          <AvatarFallback>
            {user.email
              .split(' ')
              .map((n) => n[0])
              .join('')}
          </AvatarFallback>
        </Avatar>
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
  return (
    <header className="border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        <Link href="/" className="flex items-center">
          <CircleIcon className="h-6 w-6 text-orange-500" />
          <span className="ml-2 text-xl font-semibold text-gray-900">InnoLink - 基于 DeepSeek 的东升商机匹配平台</span>
        </Link>
        <div className="flex items-center space-x-4">
          <Suspense fallback={<div className="h-9" />}>
            <UserMenu />
          </Suspense>
        </div>
      </div>
    </header>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const navItems = [
    { href: '/dashboard', icon: LayoutDashboard, label: '概览' },
    { href: '/dashboard/demands', icon: FileText, label: '需求管理' },
    { href: '/dashboard/companies', icon: Building, label: '企业管理' },
    { href: '/dashboard/matches', icon: Link2, label: '匹配结果' },
    { href: '/account', icon: Settings, label: '账号设置' },
  ];

  return (
    <section className="flex flex-col min-h-screen">
      <Header />
      <div className="flex flex-1 h-[calc(100vh-68px)]">
        {/* Sidebar */}
        <aside className={`w-64 bg-white border-r border-gray-200 hidden lg:block`}>
          <nav className="h-full p-4">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href} passHref>
                <Button
                  variant={pathname === item.href || pathname.startsWith(`${item.href}/`) ? 'secondary' : 'ghost'}
                  className={`shadow-none my-1 w-full justify-start ${
                    pathname === item.href || pathname.startsWith(`${item.href}/`) ? 'bg-gray-100' : ''
                  }`}
                >
                  <item.icon className="mr-2 h-4 w-4" />
                  {item.label}
                </Button>
              </Link>
            ))}
          </nav>
        </aside>

        {/* Mobile sidebar */}
        <div className="fixed inset-0 z-40 lg:hidden" style={{ display: isSidebarOpen ? 'block' : 'none' }}>
          <div className="fixed inset-0 bg-black bg-opacity-25" onClick={() => setIsSidebarOpen(false)}></div>
          <div className="fixed inset-y-0 left-0 flex flex-col w-64 bg-white">
            <div className="px-4 py-5 border-b border-gray-200">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsSidebarOpen(false)}
                className="absolute top-3 right-3"
              >
                <span>&times;</span>
              </Button>
              <h2 className="text-xl font-semibold">导航菜单</h2>
            </div>
            <nav className="h-full p-4">
              {navItems.map((item) => (
                <Link key={item.href} href={item.href} passHref>
                  <Button
                    variant={pathname === item.href || pathname.startsWith(`${item.href}/`) ? 'secondary' : 'ghost'}
                    className={`shadow-none my-1 w-full justify-start ${
                      pathname === item.href || pathname.startsWith(`${item.href}/`) ? 'bg-gray-100' : ''
                    }`}
                    onClick={() => setIsSidebarOpen(false)}
                  >
                    <item.icon className="mr-2 h-4 w-4" />
                    {item.label}
                  </Button>
                </Link>
              ))}
            </nav>
          </div>
        </div>

        {/* Mobile header */}
        <div className="w-full lg:hidden fixed top-[68px] left-0 right-0 z-30 bg-white border-b border-gray-200 px-4 py-3 flex justify-between items-center">
          <h2 className="text-lg font-semibold">业务平台</h2>
          <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(true)}>
            <span>≡</span>
          </Button>
        </div>

        {/* Main content */}
        <main className="flex-1 overflow-auto pt-14 lg:pt-0">
          <div className="container mx-auto py-6 px-4 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </section>
  );
}
