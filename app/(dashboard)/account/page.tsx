import { Metadata } from 'next';

import { Card } from '@/components/ui/card';
import { getUser } from '@/lib/db/queries';
import ProfileForm from './profile-form';

export const metadata: Metadata = {
  title: '个人信息 | 商机匹配平台',
  description: '管理您的个人信息',
};

export default async function ProfilePage() {
  const user = await getUser();
  
  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">个人信息</h1>
      
      <Card>
        <ProfileForm user={user} />
      </Card>
    </div>
  );
} 