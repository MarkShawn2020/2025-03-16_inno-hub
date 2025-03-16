import { Metadata } from 'next';
import { submitDemand } from './actions';
import DemandForm from './form';

export const metadata: Metadata = {
  title: '提交企业需求 | 商机匹配平台',
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
        <DemandForm submitDemand={submitDemand} />
      </div>
    </div>
  );
} 