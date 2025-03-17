import OpenAI from 'openai';

// DeepSeek API 客户端配置
const openai = new OpenAI({
  baseURL: 'https://api.deepseek.com',
  apiKey: process.env.DEEPSEEK_API_KEY || '',
});

/**
 * 调用DeepSeek API进行需求与企业的匹配
 * @param demand 需求完整信息
 * @param companies 企业列表
 * @returns 匹配结果列表
 */
export async function matchDemandsWithCompanies(
  demand: any,
  companies: any[]
) {
  try {
    if (!companies || companies.length === 0) {
      console.log('没有可用的企业数据进行匹配');
      return [];
    }

    // 将需求信息格式化为文本
    const demandText = `
需求标题: ${demand.title}
需求描述: ${demand.description}
预算: ${demand.budget ? `${demand.budget / 10000}万元` : '未指定'}
时间线: ${demand.timeline || '未指定'}
合作类型: ${demand.cooperationType || '未指定'}

需求模块:
${demand.modules?.map((module: any) => 
  `- ${module.moduleName}（权重: ${module.weight}）: ${module.description || '未提供详细描述'}`
).join('\n') || '无模块信息'}
    `;

    // 将企业列表格式化为文本
    const companiesText = companies.map((company, index) => {
      return `
公司${index+1}: ${company.name}
行业: ${company.category || '未指定'}
细分领域: ${company.subCategory || '未指定'}
企业简介: ${company.description || '未提供'}
产品介绍: ${company.productIntro || '未提供'}
企业优势标签: ${Array.isArray(company.advantageTags) ? company.advantageTags.join(', ') : '未提供'}
是否东升园区企业: ${company.isEastRisingPark ? '是' : '否'}
      `;
    }).join('\n');

    // 构建DeepSeek提示
    const prompt = `
你是一个专业的商业匹配顾问，帮助客户从候选企业中寻找最合适的合作伙伴。
请根据以下需求信息，从候选企业中选择最合适的合作伙伴。

===== 需求信息 =====
${demandText}

===== 候选企业信息 =====
${companiesText}

请基于以下标准对每家企业进行评估，并给出匹配分数（0-1之间，1表示完全匹配）：
1. 行业匹配度：企业所在行业是否与需求领域一致
2. 需求模块匹配度：企业能否满足需求的各个模块，特别是高权重的模块
3. 企业优势：企业的优势标签是否与需求匹配
4. 地域优势：东升园区企业在同等条件下给予优先考虑

对于每家企业，请提供以下格式的回复：
{
  "companies": [
    {
      "companyId": "企业在列表中的序号，如1，2，3等",
      "score": "总体匹配分数，0-1之间",
      "matchDetails": {
        "matchReasons": ["匹配原因1", "匹配原因2", "匹配原因3"],
        "matchedModules": [
          {
            "moduleName": "需求模块名称",
            "score": "该模块的匹配分数，0-1之间",
            "reason": "匹配理由"
          }
        ],
        "overallScore": "总体评估分数，0-1之间"
      }
    }
  ]
}

请确保回复格式为有效的JSON，并且按照匹配分数从高到低排序。
    `;

    // 调用DeepSeek API
    const response = await openai.chat.completions.create({
      model: 'deepseek-chat',
      messages: [
        { role: 'system', content: '你是一个专业的商业匹配顾问。' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
    });

    // 解析API响应
    const content = response.choices[0]?.message?.content || '';
    
    try {
      // 提取JSON
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        console.error('无法从API响应中提取JSON', content);
        return [];
      }
      
      const jsonStr = jsonMatch[0];
      const result = JSON.parse(jsonStr);
      
      // 处理结果，转换companyId从字符串序号到实际ID
      return result.companies.map((match: any) => {
        const companyIndex = parseInt(match.companyId) - 1;
        if (companyIndex >= 0 && companyIndex < companies.length) {
          return {
            companyId: companies[companyIndex].id,
            score: parseFloat(match.score),
            details: match.matchDetails
          };
        }
        return null;
      }).filter(Boolean);
    } catch (error) {
      console.error('解析DeepSeek API响应出错', error);
      console.log('原始响应:', content);
      return [];
    }
  } catch (error) {
    console.error('调用DeepSeek API出错:', error);
    return [];
  }
} 