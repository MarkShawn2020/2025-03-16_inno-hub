export interface DemandExample {
  id: string;
  title: string;
  description: string;
  category: string;
  budget?: string;
  timeline?: string;
  cooperationType?: string;
}

export const demandExamples: DemandExample[] = [
  {
    id: 'smart-parking',
    title: '智慧停车场AI交互与营收优化方案',
    description: `智慧停车场如何利用AI智能模块更好地与车主进行交互，提高用户体验感。同时，计划链接本地常用APP，通过智能分析算法，提升停车场效益。

具体需求包括：
1. 开发AI语音交互模块，优化车主入场、出场、缴费等环节体验
2. 设计智能推荐系统，基于用户停车习惯提供个性化服务
3. 构建与本地生活服务APP的对接接口，实现停车优惠联动
4. 开发大数据分析系统，优化车位利用率和定价策略

希望找到有AI交互、移动应用开发和大数据分析经验的合作伙伴。`,
    category: '智慧城市',
    budget: '50-100万',
    timeline: '3-6个月',
    cooperationType: '项目外包'
  },
  {
    id: 'ev-charging',
    title: 'AI赋能充电桩场站运营与安全管控方案',
    description: `利用AI智能，赋能39处汽车充电桩场站运营，提升经营利润。同时，因充电桩产品良莠不齐，计划通过AI进行安全管控。

具体需求包括：
1. 开发充电站智能调度系统，优化充电资源分配
2. 构建用户行为分析模型，提高充电站增值服务转化率
3. 设计充电设备安全监测系统，实时监控充电桩运行状态
4. 开发异常用电行为识别算法，预防安全隐患

希望寻找具有能源管理、AI安全监测和运营优化经验的合作伙伴。`,
    category: '新能源',
    budget: '100-500万',
    timeline: '6-12个月',
    cooperationType: '技术合作'
  },
  {
    id: 'low-altitude',
    title: '低空经济业务智能化解决方案',
    description: `在低空经济中业务板块中，主要涉及文旅项目、无人机智能化巡检、无人机物流配送，需要寻找合适的技术合作伙伴。

具体需求包括：
1. 文旅项目中的低空表演编排系统开发
2. 无人机智能巡检系统，包括图像识别和异常检测
3. 无人机物流配送的路径规划和调度优化
4. 低空设备的远程监控和管理平台

希望寻找具有无人机技术、计算机视觉和智能调度经验的合作伙伴。`,
    category: '无人机',
    budget: '100-500万',
    timeline: '6-12个月',
    cooperationType: '联合研发'
  },
  {
    id: 'solar-energy',
    title: 'AI驱动的光伏发电智能优化系统',
    description: `能源管理业务板块中，分布式光伏发电项目，如何利用AI智能分析光伏板各角度发电数据，并根据日照光线等因素，自动调整光伏板发电角度，增加发电量，及在恶劣天气中，提高安全生产防范。

具体需求包括：
1. 开发光伏板角度智能调整系统，基于实时环境数据
2. 构建发电效率预测模型，优化日常运行参数
3. 设计恶劣天气预警和防护机制，保障设备安全
4. 开发综合管理平台，实现多站点统一监控

希望寻找具有新能源、AI优化算法和安全管理经验的合作伙伴。`,
    category: '能源管理',
    budget: '100-500万',
    timeline: '6-12个月',
    cooperationType: '技术合作'
  }
]; 