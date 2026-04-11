"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
// 🔌 坐标已焊死：退两层回到根目录
import { supabase } from '../../components/supabaseClient';
import VisualPill from '../../components/VisualPill';

export default function MedicationLogs() {
    const router = useRouter();
    const [logs, setLogs] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchRealLogs();
    }, []);

    const fetchRealLogs = async () => {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return setIsLoading(false);

            // 🔍 采用“双保险”查询：如果 medicines 关联失败，它不会让整个请求崩溃
            const { data, error } = await supabase
                .from('medicine_logs')
                .select(`
                    id, 
                    taken_at, 
                    medicine_name,
                    medicines ( name, shape, color1, color2 )
                `)
                .eq('user_id', session.user.id)
                .order('taken_at', { ascending: false });

            // 🕵️‍♂️ 关键一步：在浏览器 F12 控制台看这个打印！
            console.log("📡 信号侦测 - 第一条数据:", data?.[0]);

            if (error) {
                console.error("📡 数据库拦截报告:", error.message);
                // 🚑 备用方案：如果带关联的查询失败，尝试只拉取基础日志
                const { data: backupData } = await supabase
                    .from('medicine_logs')
                    .select('*')
                    .eq('user_id', session.user.id)
                    .order('taken_at', { ascending: false });
                if (backupData) processLogs(backupData);
                return;
            }

            if (data) processLogs(data);
        } catch (e) {
            console.error("💥 系统核心崩溃:", e);
        } finally {
            setIsLoading(false);
        }
    };

    // ⚙️ 数据清洗工厂：把杂乱的数据库数据转为 UI 零件
    const processLogs = (rawData: any[]) => {
        const formatted = rawData.map((log: any) => {
            const name = log.medicines?.name || log.medicine_name || '';

            // 🚀 核心逻辑升级：药名识别拥有“最高豁免权”
            // 只要名字对上，哪怕数据库里存的是白片，咱也得给它染成金子！
            let finalShape = log.medicines?.shape || 'round';
            let finalColor1 = log.medicines?.color1 || 'white';
            let finalColor2 = log.medicines?.color2 || null;

            // 🧠 具象化修正层：针对你提到的重点目标进行强制校准
            if (name.includes('鱼肝油')) {
                finalShape = 'oval'; finalColor1 = 'yellow'; finalColor2 = null;
            } else if (name.includes('糖浆')) {
                finalShape = 'syrup'; finalColor1 = 'brown';
            } else if (name.includes('口服液') || name.includes('溶液')) {
                finalShape = 'liquid'; finalColor1 = 'blue';
            } else if (name.includes('胶囊')) {
                finalShape = 'capsule';
                // 如果数据库没存颜色，咱给它上个经典的红白
                if (finalColor1 === 'white') { finalColor1 = 'red'; finalColor2 = 'white'; }
            } else if (name.includes('颗粒') || name.includes('小柴胡')) {
                finalShape = 'granules'; finalColor1 = 'brown';
            } else if (name.includes('喷雾') || name.includes('气雾')) {
                finalShape = 'aerosol'; finalColor1 = 'blue';
            }

            return {
                id: log.id,
                name: name || '未知药品',
                shape: finalShape,
                color1: finalColor1,
                color2: finalColor2,
                time: new Date(log.taken_at).toLocaleString('zh-CN', {
                    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                }),
            };
        });
        setLogs(formatted);
    };

    return (
        <div className="min-h-screen bg-slate-50 text-slate-800 p-6 md:p-10 font-sans">
            <div className="max-w-3xl mx-auto">
                {/* 顶部指挥台 */}
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-3xl font-black italic text-slate-800 tracking-tighter">HISTORY LOGS.</h1>
                    <button onClick={() => router.push('/')} className="px-5 py-2.5 bg-white border border-slate-200 text-slate-500 rounded-2xl hover:bg-slate-100 font-black shadow-sm text-sm">
                        返回主控台
                    </button>
                </div>

                {isLoading ? (
                    <div className="text-center py-20 text-slate-300 font-black animate-pulse">正在同步云端健康档案...</div>
                ) : logs.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-[3rem] border-4 border-dashed border-slate-100">
                        <p className="text-slate-300 font-black">当前战区暂无服药记录</p>
                    </div>
                ) : (
                    <div className="flex flex-col gap-3">
                        {logs.map(log => (
                            <div key={log.id} className="flex items-center justify-between p-5 bg-white rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-md transition-all group">
                                <div className="flex items-center gap-5">
                                    <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                        {/* 🎨 这里根据数据库动态渲染药丸 */}
                                        <VisualPill shape={log.shape} color1={log.color1} color2={log.color2} />
                                    </div>
                                    <div>
                                        <p className="font-black text-slate-800 text-lg tracking-tight">{log.name}</p>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{log.time}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse"></span>
                                    <span className="text-[10px] font-black text-teal-500 uppercase">Synced</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}