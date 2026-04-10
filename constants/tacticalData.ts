// 文件路径: constants/tacticalData.ts

// 🚨 A.E.G.I.S. 神盾预警矩阵 (交叉火力排斥库)
export const CONFLICT_MATRIX = [
    {
        groupId: 'NSAIDs',
        keywords: ['布洛芬', '对乙酰氨基酚', '泰诺', '美林', '感冒灵', '快克', '洛索洛芬', '双氯芬酸', '连花清瘟'],
        alertMsg: '🚨 致命冲突：侦测到同类解热镇痛药交叉！\n叠加使用极易导致急性肝衰竭或胃出血！'
    },
    {
        groupId: 'Antibiotics',
        keywords: ['头孢', '阿莫西林', '甲硝唑', '左氧氟沙星', '阿奇霉素', '罗红霉素'],
        alertMsg: '⚠️ 抗生素叠加警告：侦测到多重抗生素交叉！\n极易引发严重不良反应或菌群崩溃！(服药期间严禁饮酒)'
    },
    {
        groupId: 'Stomach',
        keywords: ['奥美拉唑', '雷贝拉唑', '多潘立酮', '健胃消食片', '达喜', '蒙脱石散'],
        alertMsg: '⚠️ 靶向冲突：多种胃药混用可能导致胃酸抑制过度或药效互相抵消！'
    }
];

// 📦 内置战术微型药典
export const MEDICINE_DB = [
    {
        category: "🤒 感冒发烧",
        items: [
            { name: "布洛芬缓释胶囊", unit: "粒", times: 2, dose: 1 },
            { name: "对乙酰氨基酚片", unit: "片", times: 3, dose: 1 },
            { name: "连花清瘟胶囊", unit: "粒", times: 3, dose: 4 },
            { name: "999感冒灵颗粒", unit: "包", times: 3, dose: 1 },
            { name: "复方氨酚烷胺片", unit: "片", times: 2, dose: 1 }
        ]
    },
    {
        category: "💊 消炎抗感染",
        items: [
            { name: "阿莫西林胶囊", unit: "粒", times: 3, dose: 2 },
            { name: "头孢克肟分散片", unit: "片", times: 2, dose: 1 },
            { name: "罗红霉素胶囊", unit: "粒", times: 2, dose: 1 },
            { name: "左氧氟沙星片", unit: "片", times: 1, dose: 1 }
        ]
    },
    {
        category: "🍵 肠胃消化",
        items: [
            { name: "健胃消食片", unit: "片", times: 3, dose: 3 },
            { name: "奥美拉唑肠溶胶囊", unit: "粒", times: 2, dose: 1 },
            { name: "蒙脱石散", unit: "包", times: 3, dose: 1 },
            { name: "多潘立酮片(吗丁啉)", unit: "片", times: 3, dose: 1 }
        ]
    },
    {
        category: "🤧 过敏/外用",
        items: [
            { name: "氯雷他定片", unit: "片", times: 1, dose: 1 },
            { name: "盐酸西缇利嗪片", unit: "片", times: 1, dose: 1 },
            { name: "红霉素软膏", unit: "支", times: 2, dose: 1 },
            { name: "创可贴", unit: "片", times: 0, dose: 1 }
        ]
    },
    {
        category: "🍎 保健/慢病",
        items: [
            { name: "复合维生素B片", unit: "片", times: 1, dose: 1 },
            { name: "碳酸钙D3片", unit: "片", times: 1, dose: 1 },
            { name: "降压药(自定义)", unit: "片", times: 1, dose: 1 },
            { name: "降糖药(自定义)", unit: "片", times: 1, dose: 1 }
        ]
    }
];