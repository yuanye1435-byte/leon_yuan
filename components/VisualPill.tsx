import React from 'react';
import { Pipette, Pill, Beaker, Syringe, Wind, Droplets } from 'lucide-react';

interface VisualPillProps {
    shape: 'round' | 'capsule' | 'oval' | 'syrup' | 'liquid' | 'ointment' | 'granules' | 'aerosol' | 'injection';
    color1: string;
    color2?: string | null;
}

const VisualPill: React.FC<VisualPillProps> = ({ shape, color1, color2 }) => {
    // 🎨 医疗级调色盘映射
    const colorMap: Record<string, string> = {
        white: 'from-white to-slate-200 border-slate-300',
        red: 'from-red-400 to-red-600 border-red-700',
        blue: 'from-blue-400 to-blue-600 border-blue-700',
        green: 'from-emerald-400 to-emerald-600 border-emerald-700',
        pink: 'from-pink-300 to-pink-500 border-pink-600',
        orange: 'from-orange-400 to-orange-600 border-orange-700',
        yellow: 'from-amber-300 via-yellow-400 to-orange-400 border-amber-500', // 更加通透的金黄色
        brown: 'from-amber-800 to-amber-950 border-amber-900'
    };

    const c1 = colorMap[color1] || colorMap.white;
    const c2 = color2 ? colorMap[color2] : c1;

    // 💡 视觉矩阵：针对不同形态的严格建模
    switch (shape) {
        case 'capsule': // 💊 胶囊
            return (
                <div className="w-9 h-4 rounded-full overflow-hidden flex border shadow-sm transform -rotate-45 relative">
                    <div className={`w-1/2 h-full bg-gradient-to-br ${c1}`}></div>
                    <div className={`w-1/2 h-full bg-gradient-to-br ${c2} border-l border-white/30`}></div>
                    <div className="absolute top-0.5 left-1 right-1 h-1 bg-white/30 rounded-full blur-[1px]"></div>
                </div>
            );
        case 'round': // ⚪ 片剂 (圆形)
            return (
                <div className={`w-7 h-7 rounded-full border-2 bg-gradient-to-br ${c1} shadow-sm flex items-center justify-center relative`}>
                    <div className="w-full h-[1px] bg-black/5 absolute"></div>
                    <div className="w-[1px] h-full bg-black/5 absolute"></div>
                </div>
            );
        // 确保 oval (椭圆) 的比例更具象
        case 'oval':
            return (
                <div className={`w-10 h-6 rounded-[100%] border-2 bg-gradient-to-br ${c1} shadow-md flex items-center justify-center relative overflow-hidden`}>
                    {/* 增加一道液态反光，模拟软胶囊的晶莹感 */}
                    <div className="absolute top-1 left-2 right-2 h-1.5 bg-white/40 rounded-full blur-[1px]"></div>
                </div>
            );
        case 'syrup': // 🧴 糖浆 (褐色药瓶+汤匙)
            return (
                <div className="relative flex items-end">
                    <div className={`w-5 h-8 rounded-sm border-2 bg-gradient-to-br ${colorMap.brown} relative shadow-sm`}>
                        <div className="w-full h-2 bg-white/20 mt-1"></div> {/* 标签 */}
                    </div>
                    <Pipette size={14} className="text-slate-400 -ml-1 mb-1" />
                </div>
            );
        case 'liquid': // 🧪 口服液 (小安瓿瓶)
            return (
                <div className={`w-3 h-8 rounded-t-full rounded-b-md border-2 bg-gradient-to-br ${c1} shadow-sm relative flex flex-col items-center`}>
                    <div className="w-full h-1 bg-white/40 mt-2"></div>
                </div>
            );
        case 'ointment': // 🧴 软膏 (药膏管)
            return (
                <div className="flex items-center">
                    <div className={`w-8 h-3 bg-gradient-to-r ${c1} border rounded-l-sm relative overflow-hidden`}>
                        <div className="absolute right-0 w-1 h-full bg-black/10"></div>
                    </div>
                    <div className="w-1.5 h-1.5 bg-slate-400 rounded-full -ml-0.5"></div>
                </div>
            );
        case 'granules': // ✉️ 冲剂 (铝箔袋)
            return (
                <div className={`w-7 h-8 bg-gradient-to-br from-slate-100 to-slate-300 border-2 border-slate-400 rounded-sm shadow-sm flex items-center justify-center relative overflow-hidden`}>
                    <div className="w-full h-full opacity-10 flex flex-wrap gap-0.5 p-1 font-black">....</div>
                    <div className="absolute bottom-0 w-full h-1 bg-teal-400/50"></div>
                </div>
            );
        case 'aerosol': // 💨 气雾剂 (喷雾器)
            return (
                <div className="relative">
                    <Wind className="text-blue-400 absolute -top-2 -right-2 animate-pulse" size={12} />
                    <div className="w-5 h-8 bg-slate-200 border-2 border-slate-400 rounded-sm relative">
                        <div className="w-3 h-2 bg-slate-400 absolute -bottom-1 -left-2 rounded-sm"></div>
                    </div>
                </div>
            );
        case 'injection': // 💉 针剂 (注射器)
            return (
                <div className="flex items-center -rotate-45">
                    <div className="w-1 h-3 bg-slate-300"></div>
                    <div className="w-8 h-2.5 bg-white/80 border border-slate-400 relative">
                        <div className={`absolute inset-0 bg-gradient-to-r ${c1} opacity-40`}></div>
                        <div className="flex gap-0.5 px-0.5 h-full items-center">
                            {[1, 2, 3].map(i => <div key={i} className="w-[1px] h-1 bg-slate-400"></div>)}
                        </div>
                    </div>
                    <div className="w-1.5 h-4 bg-slate-400 rounded-sm"></div>
                </div>
            );
        default:
            return <Pill size={24} className="text-slate-300" />;
    }
};

export default VisualPill;