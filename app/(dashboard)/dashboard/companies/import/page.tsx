import { Metadata } from 'next';
import { importCompanies } from './actions';
import ImportForm from './form';

export const metadata: Metadata = {
  title: '导入企业数据 | 商机匹配平台',
  description: '导入企业数据到平台',
};

export default function ImportCompaniesPage() {
  return (
    <div className="container mx-auto py-10">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">导入企业数据</h1>
        <p className="text-gray-600 mb-8">
          您可以从CSV文件导入企业数据。系统将解析文件并将企业信息添加到数据库中。
          导入后，您可以在企业管理页面查看和编辑企业信息。
        </p>
        <ImportForm importCompanies={importCompanies} />
      </div>
    </div>
  );
} 