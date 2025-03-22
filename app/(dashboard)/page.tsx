import { Button } from '@/components/ui/button';
import { ArrowRight, PieChart, Handshake, BarChart } from 'lucide-react';
import Link from 'next/link';
import { Terminal } from './terminal';
import Image from 'next/image';
export default function HomePage() {
  return (
    <main>
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-12 lg:gap-8 items-center">
            <div className="sm:text-center md:max-w-2xl md:mx-auto lg:col-span-6 lg:text-left">
              <h1 className="text-4xl font-bold text-gray-900 tracking-tight sm:text-5xl md:text-6xl">
                商机共振平台
                <span className="block text-orange-500">连接需求与供给</span>
              </h1>
              <p className="mt-3 text-base text-gray-500 sm:mt-5 sm:text-xl lg:text-lg xl:text-xl">
                基于AI的智能匹配引擎，将您的企业需求与最合适的合作伙伴精准匹配，
                助力企业快速找到优质供应商，提升合作效率。
              </p>
              <div className="mt-8 sm:max-w-lg sm:mx-auto sm:text-center lg:text-left lg:mx-0">
                <Link href="/dashboard/demands/new">
                  <Button className="bg-orange-500 hover:bg-orange-600 text-white rounded-full text-lg px-8 py-4 inline-flex items-center justify-center">
                    立即提交需求
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              </div>
            </div>
            <div className="mt-12 relative sm:max-w-lg sm:mx-auto lg:mt-0 lg:max-w-none lg:mx-0 lg:col-span-6 lg:flex lg:items-center">
              {/* <Terminal /> */}
              <Image src="/cover5.png" alt="Cover" width={640} height={480} />
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-white w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-3 lg:gap-8">
            <div>
              <div className="flex items-center justify-center h-12 w-12 rounded-md bg-orange-500 text-white">
                <PieChart className="h-6 w-6" />
              </div>
              <div className="mt-5">
                <h2 className="text-lg font-medium text-gray-900">
                  AI智能匹配
                </h2>
                <p className="mt-2 text-base text-gray-500">
                  采用先进的自然语言处理技术，精准解析企业需求，智能匹配最合适的合作伙伴。
                </p>
              </div>
            </div>

            <div className="mt-10 lg:mt-0">
              <div className="flex items-center justify-center h-12 w-12 rounded-md bg-orange-500 text-white">
                <Handshake className="h-6 w-6" />
              </div>
              <div className="mt-5">
                <h2 className="text-lg font-medium text-gray-900">
                  东升园区企业优先
                </h2>
                <p className="mt-2 text-base text-gray-500">
                  重点对接东升园区内的优质企业资源，提供更便捷的本地化合作机会。
                </p>
              </div>
            </div>

            <div className="mt-10 lg:mt-0">
              <div className="flex items-center justify-center h-12 w-12 rounded-md bg-orange-500 text-white">
                <BarChart className="h-6 w-6" />
              </div>
              <div className="mt-5">
                <h2 className="text-lg font-medium text-gray-900">
                  数据支撑决策
                </h2>
                <p className="mt-2 text-base text-gray-500">
                  基于企业历史协作数据和评价体系，帮助您做出更明智的合作决策。
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-2 lg:gap-8 lg:items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
                寻找最合适的合作伙伴
              </h2>
              <p className="mt-3 max-w-3xl text-lg text-gray-500">
                无论您是需要技术开发、硬件制造、咨询服务还是其他商业需求，
                我们都能帮您找到最匹配的合作伙伴。平台拥有大量优质企业资源，
                覆盖AI基础设施、模型开发、场景应用、智能制造等多个领域。
              </p>
            </div>
            <div className="mt-8 lg:mt-0 flex justify-center lg:justify-end">
              <Link href="/dashboard/demands/new">
                <Button className=" hover:bg-gray-100 text-black border border-gray-200 rounded-full text-xl px-12 py-6 inline-flex items-center justify-center">
                  提交企业需求
                  <ArrowRight className="ml-3 h-6 w-6" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
