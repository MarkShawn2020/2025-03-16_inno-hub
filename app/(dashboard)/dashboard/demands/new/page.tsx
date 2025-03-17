import { Metadata } from 'next';
import dynamic from 'next/dynamic';

// 使用动态导入
const DemandForm = dynamic(() => import('./form'), { ssr: true });

export const metadata: Metadata = {
  title: '提交企业需求 | 商机共振平台',
  description: '提交您的企业需求，我们将为您匹配最合适的合作伙伴',
};

export default function NewDemandPage() {
  return (
    <div className="container mx-auto py-10">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">提交企业需求</h1>
        <p className="text-gray-600 mb-8">
          请描述您的需求，系统将自动为您匹配最合适的企业。您可以用自然语言描述需求，
          也可以填写具体的预算、工期和合作类型等信息。
        </p>
        <DemandForm />
      </div>
    </div>
  );
} 