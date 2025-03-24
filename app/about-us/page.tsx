'use client';

import { Rocket, Target, Zap, Users, Lightbulb, BrainCircuit } from 'lucide-react';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { NotificationBanner } from '../components/NotificationBanner';
import Image from 'next/image';

export default function AboutPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <NotificationBanner />
      
      <main className="flex-1">
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl">
                关于 <span className="text-orange-500">InnoHub</span>
              </h1>
              <p className="mt-4 text-xl text-gray-600 mx-auto max-w-3xl">
                打造领先的企业商机共振平台，助力企业间精准对接，创造商业价值
              </p>
            </div>
            
            <div className="mt-20">
              <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">我们的使命</h2>
              <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
                <div className="bg-orange-50 p-8 rounded-xl">
                  <div className="flex items-center justify-center h-12 w-12 rounded-md bg-orange-500 text-white mx-auto mb-4">
                    <Target className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-medium text-gray-900 text-center mb-2">连接需求与供给</h3>
                  <p className="text-gray-600 text-center">
                    通过AI技术精准匹配企业间的各类需求和能力，促进供需高效对接
                  </p>
                </div>
                
                <div className="bg-blue-50 p-8 rounded-xl">
                  <div className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white mx-auto mb-4">
                    <Zap className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-medium text-gray-900 text-center mb-2">加速企业发展</h3>
                  <p className="text-gray-600 text-center">
                    帮助企业快速找到最合适的合作伙伴，推动业务增长与技术创新
                  </p>
                </div>
                
                <div className="bg-purple-50 p-8 rounded-xl">
                  <div className="flex items-center justify-center h-12 w-12 rounded-md bg-purple-500 text-white mx-auto mb-4">
                    <Users className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-medium text-gray-900 text-center mb-2">构建创新生态</h3>
                  <p className="text-gray-600 text-center">
                    促进东升科技园区内外企业资源整合，打造自循环的创新生态系统
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="lg:grid lg:grid-cols-2 lg:gap-16 items-center">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">我们的团队</h2>
                <p className="text-lg text-gray-600 mb-6">
                  InnoHub由一群充满激情的科技与商业专家组成，我们拥有丰富的产品开发、AI技术和商业对接经验。
                </p>
                <p className="text-lg text-gray-600 mb-6">
                  团队成员来自顶尖科技公司和咨询机构，对企业需求和行业痛点有深刻理解，致力于用技术解决商业对接中的信息不对称问题。
                </p>
                <div className="grid grid-cols-2 gap-4 mt-8">
                  <div className="bg-white p-4 rounded-lg shadow-sm">
                    <div className="flex items-center mb-2">
                      <Lightbulb className="h-5 w-5 text-orange-500 mr-2" />
                      <h3 className="font-medium text-gray-900">产品专家</h3>
                    </div>
                    <p className="text-gray-600 text-sm">
                      精通用户体验设计，打造简洁高效的供需对接流程
                    </p>
                  </div>
                  <div className="bg-white p-4 rounded-lg shadow-sm">
                    <div className="flex items-center mb-2">
                      <BrainCircuit className="h-5 w-5 text-orange-500 mr-2" />
                      <h3 className="font-medium text-gray-900">AI研发团队</h3>
                    </div>
                    <p className="text-gray-600 text-sm">
                      掌握前沿大模型技术，实现智能化企业需求解析与匹配
                    </p>
                  </div>
                </div>
              </div>
              <div className="mt-10 lg:mt-0 flex justify-center">
                <Image
                  src="/about-team.jpg"
                  alt="InnoHub团队"
                  width={500}
                  height={400}
                  className="rounded-xl shadow-lg"
                />
              </div>
            </div>
          </div>
        </section>
        
        <section className="py-20 bg-gradient-to-r from-orange-500 via-red-500 to-purple-500 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold mb-6">与我们一起，拓展无限商机</h2>
            <p className="text-xl max-w-3xl mx-auto">
              加入InnoHub商机共振平台，连接更多优质企业资源，让您的业务蓬勃发展
            </p>
            <div className="mt-12 flex flex-wrap justify-center gap-4">
              <div className="flex items-center justify-center p-6 bg-white/10 backdrop-blur-sm rounded-lg w-full md:w-56 h-32">
                <div className="text-center">
                  <p className="text-4xl font-bold">500+</p>
                  <p className="mt-2">入驻企业</p>
                </div>
              </div>
              <div className="flex items-center justify-center p-6 bg-white/10 backdrop-blur-sm rounded-lg w-full md:w-56 h-32">
                <div className="text-center">
                  <p className="text-4xl font-bold">1,200+</p>
                  <p className="mt-2">成功对接</p>
                </div>
              </div>
              <div className="flex items-center justify-center p-6 bg-white/10 backdrop-blur-sm rounded-lg w-full md:w-56 h-32">
                <div className="text-center">
                  <p className="text-4xl font-bold">20+</p>
                  <p className="mt-2">合作领域</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
} 