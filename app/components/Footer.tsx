'use client';

import Link from 'next/link';
import { CircleIcon, Mail, Phone, MessageSquare } from 'lucide-react';

export function Footer() {
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