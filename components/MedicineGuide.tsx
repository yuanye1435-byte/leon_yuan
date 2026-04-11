// MedicineGuide.tsx 顶部
"use client";
// npm run dev
import { useRouter } from 'next/navigation';
import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from './supabaseClient';
import { motion, Reorder, useDragControls } from 'framer-motion';
// import { Trash2, Activity, CheckCircle2, Clock, Target, ShoppingCart, Flame, BarChart3, HeartPulse, LogOut, KeyRound, User, ShieldCheck, Radar, PackagePlus, Download, Timer, Eye, EyeOff, History, UserX, Pin } from 'lucide-react';
import { Trash2, Activity, CheckCircle2, Clock, Target, ShoppingCart, Flame, BarChart3, HeartPulse, LogOut, KeyRound, User, ShieldCheck, Radar, PackagePlus, Download, Timer, Eye, EyeOff, History, UserX, Menu, Pin } from 'lucide-react';
import PinyinMatch from 'pinyin-match'; // 🚀 新增：挂载拼音匹配引擎
// 🚀 从外部武备库挂载模块
import { CONFLICT_MATRIX, MEDICINE_DB } from '../constants/tacticalData';
import { playSciFiSound, speakTacticalVoice } from '../utils/audioEngine';


// 🚀 独立的可拖拽药品卡片组件
// 🚀 1. 定义战术参数规格书 (TypeScript Interface)
interface DraggableMedCardProps {
    med: any;
    stealth: boolean;
    isSelected: boolean;
    todayCount: number;
    isCompleted: boolean;
    radar: any;
    isLowAmmo: boolean;
    toggleSelection: (id: string) => void;
    openRefillModal: (med: any) => void;
    handleDeleteClick: (id: string) => void;
    armedId: string | null;
    handleTakeMedClick: (med: any) => void;
}

// 🚀 2. 带有类型约束的药品卡片组件 (FC 表示 Function Component)
// 🚀 2. 带有类型约束的药品卡片组件 (滑动抽屉终极版)
// 🚀 带有类型约束的药品卡片组件 (磁吸阈值防卡死版)
const DraggableMedCard: React.FC<DraggableMedCardProps> = ({
    med, stealth, isSelected, todayCount, isCompleted, radar, isLowAmmo, toggleSelection, openRefillModal, handleDeleteClick, armedId, handleTakeMedClick
}) => {
    const dragControls = useDragControls();
    // 🚨 核心新增：独立的抽屉状态记忆开关
    const [isDrawerOpen, setIsDrawerOpen] = React.useState(false);

    return (
        <Reorder.Item
            value={med}
            id={med.id}
            dragListener={false}
            dragControls={dragControls}
            whileDrag={{ scale: 1.02, zIndex: 50 }}
            className="mb-4 relative"
        >
            {/* 📌 战术图钉标识 */}
            {med.is_pinned && (
                <div className="absolute -top-3 -right-3 w-8 h-8 bg-teal-500 rounded-full flex items-center justify-center shadow-lg border-2 border-white z-30 text-white transform rotate-12">
                    <Pin size={16} className="fill-current" />
                </div>
            )}

            {/* 🛡️ 抽屉底盘 */}
            <div className={`relative w-full rounded-[2rem] overflow-hidden transition-colors duration-500 ${isSelected ? 'bg-teal-500 shadow-lg shadow-teal-500/20' : 'bg-slate-200 shadow-inner'}`}>

                {/* ⚙️ 底层抽屉：动作面板 */}
                <div className="absolute inset-y-0 right-0 w-[100px] flex items-center justify-center">
                    <button
                        onClick={() => {
                            toggleSelection(med.id);
                            setIsDrawerOpen(false); // 🚨 体验优化：点完锁定后，抽屉瞬间自动收回！
                        }}
                        className="w-full h-full flex flex-col items-center justify-center text-white hover:bg-black/10 transition-all active:scale-95"
                    >
                        <CheckCircle2 size={32} className={isSelected ? 'text-white drop-shadow-md' : 'text-slate-400'} />
                        <span className="text-[11px] font-black mt-2 tracking-widest">{isSelected ? '已取消' : '点击锁定'}</span>
                    </button>
                </div>

                {/* 🚀 顶层装甲：主界面卡片 (搭载边缘吸附与滑动阈值) */}
                <motion.div
                    drag="x"
                    dragConstraints={{ left: -100, right: 0 }}
                    dragElastic={0.1}
                    animate={{ x: isDrawerOpen ? -100 : 0 }} // 🚨 强制状态接管：绝不允许停在中间！
                    onDragEnd={(e, { offset, velocity }) => {
                        // 🚨 物理阈值引擎：判定用户的滑动意图
                        if (isDrawerOpen) {
                            // 如果已经是打开状态，往右滑(关)的距离超过 40px，或者往右甩的速度够快，就关上
                            if (offset.x > 40 || velocity.x > 400) setIsDrawerOpen(false);
                        } else {
                            // 如果是关闭状态，往左滑(开)的距离超过 40px，或者往左甩的速度够快，就弹开
                            if (offset.x < -40 || velocity.x < -400) setIsDrawerOpen(true);
                        }
                    }}
                    className={`p-6 rounded-[2rem] border-2 bg-white relative z-10 w-full transition-colors ${isSelected ? 'border-teal-400' : med.is_pinned ? 'border-teal-300' : 'border-slate-100 hover:border-teal-200'}`}
                >
                    <div className="flex justify-between items-start mb-6">
                        <div className="flex items-center gap-2">
                            {/* 🖐️ 三条杠无边界拖拽手柄 */}
                            <div
                                className="p-2 -ml-4 cursor-grab active:cursor-grabbing text-slate-300 hover:text-teal-500 transition-all touch-none select-none"
                                onPointerDown={(e) => {
                                    e.stopPropagation();
                                    e.preventDefault();
                                    dragControls.start(e);
                                }}
                            >
                                <Menu size={20} />
                            </div>

                            <div>
                                <div className="flex items-center gap-2">
                                    <h3 className={`text-2xl font-black transition-colors duration-300 ${isCompleted && !med.is_pinned ? 'text-slate-300' : 'text-slate-800'} ${stealth ? 'blur-md select-none' : ''}`}>
                                        {stealth ? '••••••••' : med.name}
                                    </h3>

                                    {/* 💡 电竞级状态指示灯：带有 GPU 物理占位，杜绝排版错位 */}
                                    <div className="relative w-5 h-5 flex items-center justify-center shrink-0">
                                        <div className={`absolute w-1.5 h-1.5 rounded-full bg-slate-300 transition-all duration-300 ease-out will-change-transform ${isSelected ? 'opacity-0 scale-50' : 'opacity-100 scale-100 animate-pulse'
                                            }`}></div>
                                        <CheckCircle2 size={18} className={`absolute text-teal-500 shadow-sm rounded-full transition-all duration-300 ease-out will-change-transform ${isSelected ? 'opacity-100 scale-100' : 'opacity-0 scale-50'
                                            }`} />
                                    </div>
                                </div>
                                {!stealth && med.times_per_day > 0 && (
                                    <div className="mt-2">
                                        <span className="text-[10px] font-black text-slate-400 uppercase">进度 {todayCount}/{med.times_per_day}</span>
                                        <div className="flex gap-1.5 w-40 mt-1">
                                            {Array.from({ length: med.times_per_day }).map((_, i) => (
                                                <div key={i} className={`h-1.5 flex-1 rounded-sm ${i < todayCount ? 'bg-teal-500 shadow-[0_0_5px_rgba(20,184,166,0.6)]' : 'bg-slate-100'}`} />
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* 右侧操作区 (补药 / 删除) */}
                        <div className="flex flex-col gap-2 w-24 items-end">
                            <button onClick={() => openRefillModal(med)} className={`p-2 rounded-2xl border flex items-center justify-center gap-2 ${isLowAmmo ? 'bg-red-50 text-red-500 border-red-200 animate-pulse' : 'bg-slate-50 text-slate-300 border-slate-100'}`}>
                                <PackagePlus size={18} /> {isLowAmmo && <span className="text-[9px] font-black">补药</span>}
                            </button>
                            <button onClick={() => handleDeleteClick(med.id)} className={`p-2 rounded-2xl flex items-center justify-center gap-2 ${armedId === med.id ? 'bg-red-500 text-white animate-pulse' : 'bg-slate-50 text-slate-300 hover:text-red-500 border border-slate-100'}`}>
                                <Trash2 size={18} /> {armedId === med.id && <span className="text-[9px] font-black">确认?</span>}
                            </button>
                        </div>
                    </div>

                    {/* 底部雷达与确认用药区 */}
                    <div className="flex flex-wrap items-center justify-between gap-4 border-t pt-4">
                        <div className="flex gap-6">
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] font-black text-slate-400 uppercase">余量</span>
                                <div className={`px-3 py-1 rounded-full border text-xs font-black ${isLowAmmo ? 'bg-red-50 text-red-600 border-red-200' : 'bg-slate-50 text-slate-700 border-slate-100'}`}>{med.stock_amount} {med.unit}</div>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] font-black text-slate-400 uppercase">雷达</span>
                                <div className={`px-3 py-1 rounded-full border text-[10px] font-black flex items-center gap-1.5 ${radar.bg} ${radar.color}`}>
                                    <Timer size={12} /> {radar.text}
                                </div>
                            </div>
                        </div>
                        {/* 🚨 底部执行区：急救特权 vs 常规打卡 */}
                        {!isCompleted ? (
                            med.times_per_day === 0 ? (
                                // 🩸 频次为0：触发急救专用 UI
                                <button onClick={() => handleTakeMedClick(med)} className={`px-4 py-3 rounded-2xl font-black text-[10px] uppercase transition-all shadow-md flex items-center gap-1 ${todayCount > 0 ? 'bg-red-900 text-red-200 border border-red-800' : 'bg-red-500 text-white hover:bg-red-600 shadow-[0_0_15px_rgba(239,68,68,0.4)] animate-pulse'}`}>
                                    {todayCount > 0 ? `🚨 已执行急救 (${todayCount}次) - 再次记录` : `🚨 紧急服用 ${med.dose_per_time}${med.unit}`}
                                </button>
                            ) : (
                                // 🟢 频次>0：常规吃药 UI
                                <button onClick={() => handleTakeMedClick(med)} className={`px-6 py-3 rounded-2xl font-black text-[10px] uppercase transition-all shadow-md ${radar.allow ? 'bg-slate-900 text-white hover:bg-teal-500' : 'bg-orange-500 text-white hover:bg-orange-600'}`}>
                                    确认用药 {med.dose_per_time}{med.unit}
                                </button>
                            )
                        ) : (
                            // 🛡️ 常规药打卡完成 UI
                            <div className="px-6 py-3 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100 font-black text-[10px] flex items-center gap-2">
                                <ShieldCheck size={14} /> 今日已达标
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>
        </Reorder.Item>
    );
};

// --- 🛠️ 主机甲核心：MedicineGuide ---
export default function MedicineGuide() {
    // 🚀 核心新增：急救弹窗控制中心 (放在 MedicineGuide 函数内部顶部)
    const [sosAlertMed, setSosAlertMed] = useState<any>(null);
    const router = useRouter();
    // 1. 🧠 【指挥中心】状态记忆区
    const [session, setSession] = useState<any>(null);
    // 🛡️ 新增：记录是否完成了第一次身份检查
    const [isInitialLoading, setIsInitialLoading] = useState(true);
    // 🛡️ A.E.G.I.S. 神盾拦截状态
    const [conflictAlert, setConflictAlert] = useState<{ med: any, msg: string } | null>(null);
    const [overrideTimer, setOverrideTimer] = useState(5); // 5秒强制越权倒计时
    const [meds, setMeds] = useState<any[]>([]);
    const [logs, setLogs] = useState<any[]>([]);
    // 🧠 上帝模式记录仪：存下用户强制修改的日期颜色
    const [dotOverrides, setDotOverrides] = useState<Record<string, string>>({});

    // 🚀 全息裸眼 3D 引擎组件
    const TiltCard = ({ children, className }: { children: React.ReactNode, className?: string }) => {
        const [transform, setTransform] = useState("perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)");
        const [glare, setGlare] = useState({ x: 50, y: 50, opacity: 0 });

        const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            // 计算偏转轴心与角度 (最大偏转 20 度，打造深邃的空间感)
            const rotateX = -((y / rect.height) - 0.5) * 20;
            const rotateY = ((x / rect.width) - 0.5) * 20;

            // 触发 3D 偏转，并产生轻微的物理悬浮放大 (1.02倍)
            setTransform(`perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`);
            // 计算流体高光的光源跟随坐标
            setGlare({ x: (x / rect.width) * 100, y: (y / rect.height) * 100, opacity: 1 });
        };

        const handleMouseLeave = () => {
            // 鼠标移出，弹簧物理回弹归位
            setTransform("perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)");
            setGlare({ x: 50, y: 50, opacity: 0 });
        };

        return (
            <div
                className={`relative transition-all duration-200 ease-out will-change-transform ${className}`}
                style={{ transform, transformStyle: "preserve-3d" }}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
            >
                {/* 💫 动态流体液态玻璃高光层 */}
                <div
                    className="absolute inset-0 z-50 pointer-events-none transition-opacity duration-300"
                    style={{
                        opacity: glare.opacity,
                        background: `radial-gradient(circle at ${glare.x}% ${glare.y}%, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0) 60%)`,
                        borderRadius: 'inherit' // 完美贴合卡片圆角
                    }}
                />
                {children}
            </div>
        );
    };


    // 👆 手动变色逻辑：点一下换一个颜色，最后恢复真实数据
    const handleDotClick = (dateStr: string) => {
        setDotOverrides(prev => {
            const current = prev[dateStr];
            let next = 'green';
            if (current === 'green') next = 'yellow';
            else if (current === 'yellow') next = 'red';
            else if (current === 'red') next = 'grey';
            else if (current === 'grey') next = ''; // 恢复真实数据

            if (!next) {
                const newState = { ...prev };
                delete newState[dateStr];
                return newState;
            }
            return { ...prev, [dateStr]: next };
        });
    };
    const [loading, setLoading] = useState(false);
    const [authLoading, setAuthLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isSignUp, setIsSignUp] = useState(false);


    // 药名表单状态
    const [medName, setMedName] = useState('');
    // 💡 神经索接口：对接 Supabase 中央药典
    const [globalMeds, setGlobalMeds] = useState<any[]>([]); // 存整个药典
    const [searchQuery, setSearchQuery] = useState('');      // 搜索框的字
    const [showDropdown, setShowDropdown] = useState(false); // 下拉菜单开关
    const [activeCategory, setActiveCategory] = useState(MEDICINE_DB[0].category);
    const [stockAmount, setStockAmount] = useState('20');
    const [timesPerDay, setTimesPerDay] = useState('3');
    const [dosePerTime, setDosePerTime] = useState('1');
    const [unit, setUnit] = useState('粒');
    const [showUnitDrop, setShowUnitDrop] = useState(false); // 🚀 新增：全息单位矩阵开关    

    // 战术功能状态
    const [selectedIds, setSelectedIds] = useState<any[]>([]);
    const [showFireModal, setShowFireModal] = useState(false);
    const [isRefillOpen, setIsRefillOpen] = useState(false);
    const [selectedMed, setSelectedMed] = useState<any>(null);
    const [refillValue, setRefillValue] = useState('20');
    const [stealth, setStealth] = useState(false);
    const [retroMed, setRetroMed] = useState<any>(null);
    const [cooldownMed, setCooldownMed] = useState<any>(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [toast, setToast] = useState<{ msg: string, show: boolean }>({ msg: '', show: false });
    const [nowTime, setNowTime] = useState(new Date());
    const [armedId, setArmedId] = useState<string | null>(null);

    // 2. 📊 【战情分析】Memo 逻辑
    const tacticalStats = useMemo(() => {
        let totalTargets = 0, destroyedTargets = 0, readyCount = 0;
        if (meds.length > 0) {
            meds.forEach(med => {
                if (med.times_per_day > 0) {
                    totalTargets += med.times_per_day;
                    const todayCount = logs.filter(l => l.medicine_id === med.id && new Date(l.taken_at).toDateString() === new Date().toDateString()).length;
                    destroyedTargets += todayCount;
                    if (todayCount < med.times_per_day) readyCount++;
                }
            });
        }
        const hitRate = totalTargets > 0 ? Math.round((destroyedTargets / totalTargets) * 100) : 100;
        let defcon = { level: 5, color: 'text-emerald-400', bg: 'bg-emerald-500', status: '今日用药已完成', glow: 'shadow-[0_0_20px_rgba(52,211,153,0.3)]' };
        if (readyCount > 3) defcon = { level: 1, color: 'text-red-500', bg: 'bg-red-600', status: '多项用药未完成', glow: 'shadow-[0_0_30px_rgba(239,68,68,0.5)] animate-pulse' };
        else if (readyCount > 0) defcon = { level: 3, color: 'text-amber-400', bg: 'bg-amber-500', status: '当前少量待用药', glow: 'shadow-[0_0_20px_rgba(251,191,36,0.3)]' };
        return { totalTargets, destroyedTargets, hitRate, defcon };
    }, [meds, logs]);

    const currentStreak = useMemo(() => {
        if (logs.length === 0) return 0;
        const uniqueDays = [...new Set(logs.map(log => log.taken_at.split('T')[0]))].sort().reverse();
        let streak = 0, checkDate = new Date();
        for (let i = 0; i < uniqueDays.length; i++) {
            const logDateStr = uniqueDays[i];
            const checkStr = checkDate.toISOString().split('T')[0];
            if (i === 0 && logDateStr !== checkStr) {
                checkDate.setDate(checkDate.getDate() - 1);
                if (logDateStr !== checkDate.toISOString().split('T')[0]) return streak;
            }
            if (logDateStr === checkDate.toISOString().split('T')[0]) { streak++; checkDate.setDate(checkDate.getDate() - 1); }
            else break;
        }
        return streak;
    }, [logs]);

    // 3. 🛰️ 【实时监听】Effects
    useEffect(() => {
        // ... 原有的计时器代码 ...

        // 修改这里：拿到 session 后，把初始加载状态设为 false
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setIsInitialLoading(false); // 🔑 身份确认完毕，可以开门了
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            setIsInitialLoading(false); // 🔑 状态变化时也确保关闭加载
        });

        // ... 原有的 return 逻辑 ...
    }, []);

    useEffect(() => {
        if (session) {
            fetchData();
            // 🚀 启动时，黑入中央数据库把药典拉下来！
            supabase.from('global_pharmacy').select('*').then(({ data }) => {
                if (data) setGlobalMeds(data);
            });
        }
    }, [session]);
    const fetchData = async () => {
        // 🛑 绝对防御：如果没有获取到当前特工的身份坐标，直接切断检索！
        if (!session?.user?.id) return;

        // 🎯 精准定向扫描：只拉取 user_id 等于当前登录账号的数据
        // 🛠️ 修改后的 fetchData 片段
        const { data: m } = await supabase
            .from('medicines')
            .select('*')
            .eq('user_id', session.user.id)
            // 🎯 核心改变：按自定义排序坐标从小到大排列
            .order('sort_order', { ascending: true });

        const { data: l } = await supabase
            .from('medicine_logs')
            .select('*')
            .eq('user_id', session.user.id)
            .order('taken_at', { ascending: false })
            .limit(100);

        setMeds(m || []);
        setLogs(l || []);

    };

    // 🧠 拖拽排序同步神经
    // 🧠 拖拽排序同步神经 (修复重绘风暴版)
    const handleReorder = async (newOrder: any[], isPinnedGroup: boolean) => {
        // 🚀 核心修复：必须在本地先把每个元素的 sort_order 属性更新了！
        // 否则渲染时 sort() 函数又会把它排回老样子，导致疯狂卡顿和回弹！
        const updatedOrder = newOrder.map((med, index) => ({
            ...med,
            sort_order: index
        }));

        // 1. 瞬间更新本地 UI，阵型立刻锁定，绝对不反弹
        setMeds(prev => {
            const others = prev.filter(m => !!m.is_pinned !== isPinnedGroup);
            return [...others, ...updatedOrder];
        });

        // 2. 后台静默同步给 Supabase
        try {
            const promises = updatedOrder.map((med) =>
                supabase.from('medicines').update({ sort_order: med.sort_order }).eq('id', med.id)
            );
            await Promise.all(promises);
        } catch (error) {
            console.error("📡 排序同步失败:", error);
        }
    };
    const unlockAudio = () => {
        try {
            const AudioContext = (window as any).AudioContext || (window as any).webkitAudioContext;
            if (AudioContext) new AudioContext().resume();
            if ('speechSynthesis' in window) window.speechSynthesis.speak(new SpeechSynthesisUtterance(''));
        } catch (e) { console.log('音频权限夺取失败'); }
    };

    const toggleSelectAll = () => {
        const readyIds = meds.filter(m => getTodayProgress(m.id) < m.times_per_day).map(m => m.id);
        setSelectedIds(selectedIds.length === readyIds.length && readyIds.length > 0 ? [] : readyIds);
    };

    const toggleSelection = (id: string) => {
        setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
    };

    const handleSalvoFire = () => {
        const targets = meds.filter(m => selectedIds.includes(m.id) && getTodayProgress(m.id) < m.times_per_day);
        if (targets.length === 0) return alert('🛡️ 统帅，名单中没有可执行的目标！');
        setShowFireModal(true);
    };

    const togglePinSelected = async () => {
        if (selectedIds.length === 0) return;
        // 逻辑：如果选中的全都是已置顶的，就取消置顶；否则统统置顶
        const selectedMeds = meds.filter(m => selectedIds.includes(m.id));
        const willPin = !selectedMeds.every(m => m.is_pinned);

        try {
            const promises = selectedMeds.map(med =>
                supabase.from('medicines').update({ is_pinned: willPin }).eq('id', med.id)
            );
            await Promise.all(promises);
            setSelectedIds([]); // 操作完清空选中状态
            fetchData();
            playSciFiSound('success');
            showTacticalToast(`已${willPin ? '置顶' : '取消置顶'} ${selectedMeds.length} 个目标。`);
        } catch (error) {
            alert('💥 核心数据库拦截了请求，置顶失败！');
        }
    };

    const executeSalvo = async () => {
        const targets = meds.filter(m => selectedIds.includes(m.id) && getTodayProgress(m.id) < m.times_per_day);
        try {
            const promises = targets.map(med => supabase.from('medicine_logs').insert([{
                medicine_id: med.id, medicine_name: med.name, user_id: session.user.id, taken_at: new Date().toISOString()
            }]));
            // 更新库存逻辑
            const stockUpdates = targets.map(med => supabase.from('medicines').update({
                stock_amount: med.stock_amount - med.dose_per_time, last_taken_at: new Date().toISOString()
            }).eq('id', med.id));

            await Promise.all([...promises, ...stockUpdates]);
            setSelectedIds([]); setShowFireModal(false); fetchData();
            playSciFiSound('success');
            speakTacticalVoice(`全阵列齐射完毕。${targets.length} 个目标已清除。`);
        } catch (error) { alert('💥 火控系统异常！'); }
    };

    const handleTakeMedClick = (med: any) => {

        // 🚨 S.O.S 急救协议：无视一切冷却和冲突，立刻记录并弹窗！
        if (med.times_per_day === 0) {
            executeTakeMed(med, new Date()); // 瞬间扣除库存+写入日志
            setSosAlertMed(med); // 召唤 120 弹窗
            return;
        }
        // 1. 🛑 神盾拦截扫描：调出今天的作战日志
        const todayLogs = logs.filter(log => new Date(log.taken_at).toDateString() === new Date().toDateString());

        let triggerConflict = null;

        // 2. 匹配弹药类型：当前这颗药属于哪个高危组？
        const currentGroup = CONFLICT_MATRIX.find(matrix => matrix.keywords.some(kw => med.name.includes(kw)));

        if (currentGroup) {
            // 3. 雷达回波扫描：今天有没有吃过同组的、但名字不一样的药？
            const conflictingLog = todayLogs.find(log =>
                log.medicine_id !== med.id &&  // 不是这颗药本身
                currentGroup.keywords.some(kw => log.medicine_name.includes(kw))
            );

            if (conflictingLog) {
                // 💥 触发死锁！
                triggerConflict = {
                    med: med,
                    msg: `${currentGroup.alertMsg}\n\n今日已服用 "${conflictingLog.medicine_name}"`
                };
            }
        }

        // 4. 执行拦截协议！
        if (triggerConflict) {
            setConflictAlert(triggerConflict);
            setOverrideTimer(5); // 重置 5 秒保险栓
            playSciFiSound('warning');
            // if (typeof speakTacticalVoice !== 'undefined') {
            //     speakTacticalVoice('警告！侦测到高危交叉火力，火控系统已锁定！');
            // }

            // 启动 5 秒强制冷静倒计时
            let timeLeft = 5;
            const timer = setInterval(() => {
                timeLeft -= 1;
                setOverrideTimer(timeLeft);
                if (timeLeft <= 0) clearInterval(timer);
            }, 1000);
            return; // ⛔ 强行截断，下面的原代码不执行了
        }

        // 5. 没冲突？放行！走原来的雷达和回溯逻辑
        const radar = getRadarInfo(med.last_taken_at, med.times_per_day);

        // 💛 新增：柔性冷却期提醒（警告但不锁死）
        if (radar.status === 'STANDBY') {
            // 💛 柔性冷却期提醒（替换掉丑陋的 window.confirm）
            if (radar.status === 'STANDBY') {
                playSciFiSound('warning'); // 或者换成柔和的提示音
                setCooldownMed(med); // 👈 直接把药塞进状态里，召唤咱们自己画的弹窗！
                return;
            }
        }
        // 下面保留原有的 OVERDUE 判断...
        if (radar.status === 'OVERDUE') {
            setRetroMed(med);
            playSciFiSound('warning');
        } else {
            executeTakeMed(med, new Date());
        }
    };

    const executeTakeMed = async (med: any, executionTime: Date) => {
        if (med.stock_amount < med.dose_per_time) {
            playSciFiSound('warning');
            showTacticalToast(`警告！${stealth ? '机密目标' : med.name} 余量不足！`);
            return;
        }
        try {
            await supabase.from('medicines').update({ last_taken_at: executionTime.toISOString(), stock_amount: med.stock_amount - med.dose_per_time }).eq('id', med.id);
            await supabase.from('medicine_logs').insert([{ medicine_id: med.id, medicine_name: med.name, user_id: session.user.id, taken_at: executionTime.toISOString() }]);
            setRetroMed(null); fetchData(); playSciFiSound('success');
            showTacticalToast(`战术动作确认。${stealth ? '机密目标' : med.name} 已记录。`);
            speakTacticalVoice(stealth ? '静默协议执行。' : `${med.name} 已执行。`);
        } catch (e) { console.error(e); }
    };

    const confirmRetroactive = () => {
        if (!retroMed) return;
        const lastDate = new Date(retroMed.last_taken_at || new Date());
        const idealTime = new Date(lastDate.getTime() + (24 / retroMed.times_per_day) * 60 * 60 * 1000);
        executeTakeMed(retroMed, idealTime);
    };

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault(); setAuthLoading(true);
        if (isSignUp) {
            const { error } = await supabase.auth.signUp({ email, password });
            if (error) { speakTacticalVoice('警告，注册受阻。'); alert(error.message); }
            else { speakTacticalVoice('坐标建立。欢迎接入。'); alert('注册成功！'); }
        } else {
            const { error } = await supabase.auth.signInWithPassword({ email, password });
            if (error) { speakTacticalVoice('权限拒绝。'); alert(error.message); }
            else { playSciFiSound('login'); setTimeout(() => speakTacticalVoice('身份确认。欢迎回舱。'), 600); }
        }
        setAuthLoading(false);
    };

    const handleLogout = async () => {
        speakTacticalVoice('系统休眠。祝您好运。');
        await supabase.auth.signOut();
        setMeds([]); setLogs([]);
    };

    // 1. 触发弹窗的函数 (绑在注销按钮上)
    const handleDeleteAccount = () => {
        setShowDeleteModal(true); // 唤醒咱们的高定弹窗
    };

    // 2. 真正执行清除的函数 (绑在弹窗的"确认清除"按钮上)
    const executeDeleteAccount = async () => {
        try {
            const { error } = await supabase.rpc('delete_self_account');
            if (error) throw error;

            await supabase.auth.signOut();
            setSession(null);
            setMeds([]);
            setLogs([]);
            setShowDeleteModal(false);
            // 注销成功后回到登录页，这里留一个最基础的 alert 提示即可
            alert('身份已注销，坐标已抹除。欢迎下次重新接入。');
        } catch (error) {
            console.error('自毁程序执行失败:', error);
            alert('💥 核心数据库拦截了请求，注销失败！');
        }
    };

    const handleAddMed = async () => {
        if (!medName) return alert('药名不可为空！');

        let autoShape = 'round';
        let autoColor1 = 'white';
        let autoColor2 = null;

        // 🔬 提升预测精度
        const name = medName.trim();
        if (name.includes('鱼肝油')) {
            autoShape = 'oval'; autoColor1 = 'yellow';
        } else if (name.includes('糖浆')) {
            autoShape = 'syrup'; autoColor1 = 'brown';
        } else if (name.includes('口服液') || name.includes('溶液')) {
            autoShape = 'liquid'; autoColor1 = 'blue';
        } else if (name.includes('胶囊')) {
            autoShape = 'capsule'; autoColor1 = 'red'; autoColor2 = 'white';
        } else if (name.includes('颗粒') || name.includes('冲剂') || name.includes('小柴胡')) {
            autoShape = 'granules'; autoColor1 = 'brown';
        } else if (name.includes('喷雾') || name.includes('气雾')) {
            autoShape = 'aerosol'; autoColor1 = 'blue';
        }
        const { error } = await supabase.from('medicines').insert([{
            name: medName,
            expired_at: new Date(Date.now() + 31536000000).toISOString().split('T')[0],
            stock_amount: parseFloat(stockAmount),
            times_per_day: parseInt(timesPerDay),
            dose_per_time: parseFloat(dosePerTime),
            unit: unit,
            user_id: session.user.id,
            shape: autoShape,
            color1: autoColor1,
            color2: autoColor2,
            // 🚨 S.O.S 生命通道特权：只要频次为 0（急救药），入库即自动置顶！
            is_pinned: parseInt(timesPerDay) === 0
        }]);

        if (!error) {
            setMedName('');
            fetchData();
            playSciFiSound('success');
            speakTacticalVoice(`${medName} 已成功归档。`);
        }
    };

    const openRefillModal = (med: any) => { setSelectedMed(med); setRefillValue('20'); setIsRefillOpen(true); playSciFiSound('success'); };
    const confirmRefill = async () => {
        if (!selectedMed || isNaN(Number(refillValue))) return;
        const newStock = selectedMed.stock_amount + Number(refillValue);
        await supabase.from('medicines').update({ stock_amount: newStock }).eq('id', selectedMed.id);
        fetchData(); setIsRefillOpen(false); playSciFiSound('login');
        showTacticalToast(`补给完毕：现存 ${newStock}`);
    };

    const handleDeleteClick = (id: string) => {
        if (armedId === id) { supabase.from('medicines').delete().eq('id', id).then(fetchData); setArmedId(null); playSciFiSound('warning'); }
        else { setArmedId(id); playSciFiSound('login'); setTimeout(() => setArmedId(curr => curr === id ? null : curr), 3000); }
    };

    const handleExportData = () => {
        if (logs.length === 0) return alert('无日志可供导出！');
        const headers = "药品名,执行时间\n";
        const csvContent = logs.map(l => `${l.medicine_name},${new Date(l.taken_at).toLocaleString('zh-CN')}`).join("\n");
        const blob = new Blob(["\ufeff" + headers + csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = `战术日志_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
    };

    const showTacticalToast = (msg: string) => { setToast({ msg, show: true }); setTimeout(() => setToast({ msg: '', show: false }), 3000); };

    // 辅助计算
    const getTodayProgress = (medId: string) => logs.filter(log => log.medicine_id === medId && new Date(log.taken_at).toDateString() === new Date().toDateString()).length;
    const getRadarInfo = (last: string, times: number) => {
        if (times === 0) return { status: 'SOS', text: '急救待命', color: 'text-purple-500', bg: 'bg-purple-50', allow: true };
        if (!last) return { status: 'READY', text: '随时可执行', color: 'text-teal-500', bg: 'bg-teal-50', allow: true };
        const next = new Date(new Date(last).getTime() + (24 / times) * 60 * 60 * 1000);
        if (nowTime >= next) return { status: 'OVERDUE', text: `已超时 ${Math.floor((nowTime.getTime() - next.getTime()) / 3600000)}小时`, color: 'text-red-500', bg: 'bg-red-50', allow: true };
        const diff = next.getTime() - nowTime.getTime();
        return { status: 'STANDBY', text: `距下次用药 ${Math.floor(diff / 3600000)}小时 ${Math.floor((diff % 3600000) / 60000)}分`, color: 'text-orange-500', bg: 'bg-orange-50', allow: false };
    };


    // 🚀 核心拦截逻辑：如果还在检查身份，显示一个干净的背景，绝不显示登录框
    if (isInitialLoading) {
        return (
            <div className="min-h-screen bg-slate-900 flex items-center justify-center">
                {/* 这里可以放个极简的 loading，或者干脆空着 */}
                <div className="w-8 h-8 border-4 border-teal-500/20 border-t-teal-500 rounded-full animate-spin"></div>
            </div>
        );
    }

    // 只有明确检查完身份，且确实没登录，才显示登录页
    if (!session) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-900 p-4">
                {/* ... 你的登录页代码 ... */}
            </div>
        );
    }

    // 5. 🚪 【鉴权拦截】
    if (!session) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-900 p-4">
                <div className="bg-white p-10 rounded-[3rem] shadow-2xl w-full max-w-md border-4 border-slate-800">
                    <div className="text-center mb-10">
                        <h1 className="text-5xl font-black italic tracking-tighter text-slate-900">LEON<span className="text-teal-500">.</span></h1>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.4em] mt-2">Central Authorization</p>
                    </div>
                    <form onSubmit={handleAuth} className="space-y-4">
                        <div className="relative">
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="指挥官邮箱" className="w-full pl-12 pr-4 py-4 rounded-2xl bg-slate-50 border-none outline-none focus:ring-2 focus:ring-teal-400 font-bold" />
                        </div>
                        <div className="relative">
                            <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required placeholder="安全密钥" className="w-full pl-12 pr-4 py-4 rounded-2xl bg-slate-50 border-none outline-none focus:ring-2 focus:ring-teal-400 font-bold" />
                        </div>
                        <button type="submit" disabled={authLoading} className="w-full bg-slate-900 hover:bg-teal-500 text-white font-black py-4 rounded-2xl transition-all shadow-lg mt-4">
                            {authLoading ? '验证中...' : (isSignUp ? '注册新坐标' : '接入主控制台 ➔')}
                        </button>
                    </form>
                    <div className="text-center mt-6">
                        <button onClick={() => setIsSignUp(!isSignUp)} className="text-xs font-bold text-slate-400 hover:text-teal-500">{isSignUp ? '已有通行证？立即接入' : '没有通行证？申请注册'}</button>
                    </div>
                </div>
            </div>
        );
    }

    // 🚀 将数据严格分为“置顶区”和“常规区”，并按记录好的 sort_order 排序
    const pinnedMeds = meds
        .filter(m => m.is_pinned)
        .sort((a, b) => a.sort_order - b.sort_order);

    const unpinnedMeds = meds
        .filter(m => !m.is_pinned)
        .sort((a, b) => a.sort_order - b.sort_order);

    // 6. 🚀 【主界面渲染】
    return (
        <div className="max-w-6xl mx-auto my-6 p-4 md:p-8 bg-[#f1f5f9] min-h-screen rounded-[2.5rem] shadow-2xl font-sans relative">
            {/* 顶部 Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-4 pr-2">
                <div>
                    <h1 className="text-5xl font-black italic tracking-tighter text-slate-900">LEON PULSE<span className="text-teal-500"> .</span></h1>
                    {/* 找到 Header 里的 email 展示位 */}
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.5em] mt-1">
                        Operator: <span className={`text-teal-500 transition-all ${stealth ? 'blur-sm select-none' : ''}`}>
                            {stealth ? 'COMMANDER_CONFIDENTIAL' : session?.user?.email}
                        </span>
                    </p>
                </div>
                <div className="flex items-center gap-6 pt-2 md:pt-0">
                    <button onClick={() => setStealth(!stealth)} className={`${stealth ? 'text-orange-500' : 'text-slate-400'} hover:text-teal-400 flex items-center gap-2 text-[10px] font-black uppercase`}>
                        {stealth ? <EyeOff size={14} /> : <Eye size={14} />} 防窥
                    </button>
                    <button onClick={handleExportData} className="text-teal-500 hover:text-teal-400 flex items-center gap-2 text-[10px] font-black uppercase">
                        <Download size={14} /> 导出日志
                    </button>
                    <button onClick={handleLogout} className="text-slate-400 hover:text-red-500 flex items-center gap-2 text-[10px] font-black uppercase">
                        <LogOut size={14} /> 断开连接
                    </button>
                    {/* 🧨 新增：账号注销按钮 */}
                    <button onClick={handleDeleteAccount} className="text-red-400 hover:text-red-600 flex items-center gap-2 text-[10px] font-black uppercase transition-all">
                        <UserX size={14} /> 账号注销
                    </button>
                </div>
            </div>

            {/* 仪表盘统计：三位一体全景雷达 */}
            <div className="mb-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6">
                {/* 📊 卡片 1：战区歼灭率 (高定丰满版) */}
                <TiltCard className="md:col-span-1 lg:col-span-3 bg-white rounded-[2rem] p-6 md:p-8 shadow-sm border border-slate-50 flex flex-col justify-between min-h-[240px] relative overflow-hidden transition-all hover:border-teal-100 hover:shadow-lg group">
                    {/* 🌟 巨型全息负空间水印 */}
                    <div className="absolute -right-10 -bottom-10 opacity-[0.03] pointer-events-none transition-transform duration-700 group-hover:scale-110 group-hover:opacity-[0.05]">
                        <Target size={240} className="text-teal-500" />
                    </div>

                    <div className="flex items-center gap-2 text-slate-500 relative z-10">
                        <span className="text-teal-400 text-xl">🎯</span>
                        <span className="text-xs font-black tracking-widest uppercase text-slate-400">今日达成率</span>
                    </div>

                    <div className="mt-auto relative z-10 flex flex-col gap-3 pt-6">
                        <div className="flex items-baseline gap-1">
                            <span className={`text-7xl xl:text-8xl font-black text-teal-400 italic tracking-tighter drop-shadow-sm transition-all ${stealth ? 'blur-lg select-none' : ''}`}>
                                {stealth ? '88' : tacticalStats.hitRate}
                            </span>
                            <span className="text-3xl font-black text-teal-400 opacity-80">%</span>
                        </div>
                        {/* 📊 底部增加实体进度条，压住视觉重心 */}
                        <div className="flex flex-col gap-2 w-full pr-4">
                            <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-teal-400 shadow-[0_0_8px_rgba(45,212,191,0.5)] transition-all duration-1000 ease-out"
                                    style={{ width: `${stealth ? 88 : tacticalStats.hitRate}%` }}
                                />
                            </div>
                            <div className="text-[10px] font-bold text-slate-400 tracking-tight">
                                已服用 {tacticalStats.destroyedTargets} / 计划 {tacticalStats.totalTargets} 次
                            </div>
                        </div>
                    </div>
                </TiltCard>

                {/* 🔥 卡片 2：战术连胜记录 (高定丰满版) */}
                <TiltCard className="md:col-span-1 lg:col-span-3 bg-white rounded-[2rem] p-6 md:p-8 shadow-sm border border-slate-50 flex flex-col justify-between min-h-[240px] relative overflow-hidden transition-all hover:border-orange-100 hover:shadow-lg group">
                    {/* 🌟 巨型全息负空间水印 */}
                    <div className="absolute -right-6 -bottom-6 opacity-[0.03] pointer-events-none transition-transform duration-700 group-hover:scale-110 group-hover:opacity-[0.05]">
                        <Flame size={240} className="text-orange-500" />
                    </div>

                    <div className="flex items-center gap-2 text-slate-500 relative z-10">
                        <span className="text-orange-400 text-xl">🔥</span>
                        <span className="text-xs font-black tracking-widest uppercase text-slate-400">健康连胜</span>
                    </div>

                    <div className="mt-auto relative z-10 flex flex-col gap-3 pt-6">
                        <div className="flex items-baseline gap-2">
                            <span className={`text-7xl xl:text-8xl font-black text-slate-800 italic tracking-tighter drop-shadow-sm transition-all ${stealth ? 'blur-lg select-none' : ''}`}>
                                {stealth ? '8' : currentStreak}
                            </span>
                            <span className="text-lg font-black text-slate-400 uppercase tracking-widest">Days</span>
                        </div>
                        {/* 🔥 底部增加连胜阵列灯，压住视觉重心 */}
                        <div className="flex flex-col gap-2 w-full pr-4">
                            <div className="flex gap-1.5 h-1.5">
                                {Array.from({ length: 5 }).map((_, i) => (
                                    <div
                                        key={i}
                                        className={`flex-1 rounded-full transition-all duration-500 ${i < Math.min(currentStreak, 5) ? 'bg-orange-400 shadow-[0_0_6px_rgba(251,146,60,0.5)]' : 'bg-slate-100'}`}
                                    />
                                ))}
                            </div>
                            <div className="text-[10px] font-bold text-orange-400/80 tracking-tight">
                                {currentStreak > 0 ? "保持节奏，离健康更近一步！" : "健康需坚持，明天记得打卡哦"}
                            </div>
                        </div>
                    </div>
                </TiltCard>
                {/* 📈 卡片 3：当月服药热力追踪 (适老化清晰版) */}
                <div className="md:col-span-2 lg:col-span-6 bg-white rounded-[2rem] p-6 md:p-8 shadow-sm border border-slate-50 flex flex-col justify-between min-h-[160px] transition-all hover:border-indigo-100 hover:shadow-lg">

                    {/* 标题与图例 */}
                    <TiltCard className="flex flex-col gap-4 mb-6">
                        <div className="flex items-center justify-between text-slate-500">
                            <div className="flex items-center gap-2">
                                <span className="text-indigo-400 text-lg">📅</span>
                                <span className="text-xs font-black tracking-widest uppercase text-slate-500">本月热力追踪</span>
                            </div>
                        </div>
                        {/* 🏷️ 图例放大版：间距拉开，圆点加大 */}
                        <div className="flex flex-wrap gap-3 text-[11px] md:text-xs font-bold text-slate-500">
                            <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-emerald-400 shadow-sm"></div>全量用药</div>
                            <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-amber-400 shadow-sm"></div>少量漏用</div>
                            <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-red-400 shadow-sm"></div>严重异常</div>
                            <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-slate-200 shadow-sm"></div>未开始/无效</div>
                        </div>
                    </TiltCard>

                    {/* 月历矩阵 */}
                    <div className="flex-1 flex items-center justify-center w-full relative z-10">
                        {/* 间隔调大 (gap-2)，防止胖手指误触 */}
                        <div className="grid grid-cols-7 gap-2 md:gap-3 w-full">
                            {(() => {
                                const bjNow = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Shanghai" }));
                                const year = bjNow.getFullYear();
                                const month = bjNow.getMonth();
                                const todayStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(bjNow.getDate()).padStart(2, '0')}`;
                                const daysInMonth = new Date(year, month + 1, 0).getDate();
                                const firstLogDate = logs.length > 0 ? logs[logs.length - 1].taken_at.split('T')[0] : todayStr;

                                return Array.from({ length: daysInMonth }).map((_, i) => {
                                    const day = i + 1;
                                    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

                                    let status = 'future';
                                    if (dateStr > todayStr) status = 'future';
                                    else if (dateStr < firstLogDate) status = 'grey';
                                    else {
                                        const dayLogs = logs.filter(log => log.taken_at.startsWith(dateStr));
                                        if (dayLogs.length === 0) status = dateStr === todayStr ? 'grey' : 'red';
                                        else if (dayLogs.length >= meds.length) status = 'green';
                                        else status = 'yellow';
                                    }

                                    const finalStatus = dotOverrides[dateStr] || status;

                                    // 🎨 状态样式映射 (全面放大)
                                    let dotColor = 'bg-slate-100/50';
                                    let glow = '';
                                    let textStyle = 'text-slate-400 font-bold';

                                    if (finalStatus === 'green') {
                                        dotColor = 'bg-emerald-400';
                                        glow = 'shadow-[0_0_8px_rgba(52,211,153,0.5)] scale-110';
                                        textStyle = 'text-emerald-700 font-black';
                                    } else if (finalStatus === 'yellow') {
                                        dotColor = 'bg-amber-400';
                                        glow = 'shadow-[0_0_8px_rgba(251,191,36,0.5)]';
                                        textStyle = 'text-amber-700 font-black';
                                    } else if (finalStatus === 'red') {
                                        dotColor = 'bg-red-400';
                                        glow = 'shadow-[0_0_8px_rgba(248,113,113,0.5)]';
                                        textStyle = 'text-red-700 font-black';
                                    } else if (finalStatus === 'grey') {
                                        dotColor = 'bg-slate-200';
                                        textStyle = 'text-slate-300 line-through';
                                    }

                                    return (
                                        <div
                                            key={day}
                                            title={`${dateStr} (点击修改状态)`}
                                            onClick={() => handleDotClick(dateStr)}
                                            // 🚀 核心修改：改为带实体背景的微型卡片，上下排列，增大触控区
                                            className="aspect-square rounded-xl md:rounded-2xl flex flex-col items-center justify-center gap-1.5 cursor-pointer transition-all hover:bg-slate-50 border border-slate-100 hover:border-teal-200 group relative bg-white shadow-sm hover:shadow-md"
                                        >
                                            {/* 顶部指示灯 */}
                                            <div className={`w-3 h-3 md:w-3.5 md:h-3.5 rounded-full z-10 transition-all duration-300 ${dotColor} ${glow}`} />

                                            {/* 底部高清晰数字 */}
                                            <span className={`text-[11px] md:text-sm z-0 transition-all leading-none ${textStyle}`}>
                                                {day}
                                            </span>
                                        </div>
                                    );
                                });
                            })()}
                        </div>
                    </div>
                </div>

            </div>
            {/* ==================== 🚀 智能补给部署舱 (直连 Supabase) ==================== */}
            <div className="bg-white p-6 rounded-[2rem] shadow-sm mb-10 border border-slate-100 flex flex-col gap-6 relative z-50">
                <div className="flex items-center gap-2 mb-2">
                    <PackagePlus size={16} className="text-teal-500" />
                    <span className="text-xs font-black text-slate-400 uppercase tracking-widest">中央药典检索终端</span>
                </div>

                {/* 1. 🌐 智能检索火控雷达 */}
                <div className="relative">
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => {
                            setSearchQuery(e.target.value);
                            setMedName(e.target.value); // 允许手打没在库里的新药
                            setShowDropdown(true);
                        }}
                        onFocus={() => setShowDropdown(true)}
                        placeholder="输入药品名称、拼音或分类检索中央数据库..."
                        className="w-full p-4 rounded-xl bg-slate-50 border-2 border-transparent focus:border-teal-400 outline-none font-bold text-slate-800 shadow-inner transition-all"
                    />

                    {/* ⚡ 全息下拉联想面板 */}
                    {showDropdown && searchQuery.length > 0 && (
                        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-slate-100 max-h-64 overflow-y-auto custom-scrollbar overflow-hidden z-[100]">
                            {(() => {
                                // 💡 提取过滤逻辑，避免重复计算
                                const matchedMeds = globalMeds.filter(med => {
                                    const query = searchQuery.toLowerCase();
                                    // 1. 原生汉字或分类直接匹配
                                    if (med.med_name.includes(query) || med.category_sub?.includes(query)) return true;
                                    // 2. 🚀 拼音匹配引擎：支持 "blf" (首字母), "buluofen" (全拼), 甚至同音错别字
                                    if (PinyinMatch.match(med.med_name, query)) return true;
                                    return false;
                                });

                                return matchedMeds.length > 0 ? (
                                    matchedMeds.slice(0, 10).map(med => (
                                        <div
                                            key={med.id}
                                            onClick={() => {
                                                // 🎯 一键锁定！参数自动填装！
                                                setSearchQuery(med.med_name);
                                                setMedName(med.med_name);
                                                setUnit(med.default_unit);
                                                setDosePerTime(med.default_dose?.toString() || '1');
                                                setTimesPerDay(med.default_times?.toString() || '3');
                                                setShowDropdown(false);
                                                playSciFiSound('success');
                                            }}
                                            className="p-3 border-b border-slate-50 hover:bg-teal-50 cursor-pointer transition-all flex items-center justify-between group"
                                        >
                                            <div className="flex flex-col">
                                                <span className="font-black text-slate-700 group-hover:text-teal-700">{med.med_name}</span>
                                                <span className="text-[10px] text-slate-400 uppercase tracking-widest">{med.category_sub}</span>
                                            </div>
                                            <div className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded-md group-hover:bg-teal-100 group-hover:text-teal-600">
                                                单次 {med.default_dose}{med.default_unit} x {med.default_times}次/日
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="p-4 text-center text-xs font-bold text-slate-400">
                                        ⚠️ 未在药典找到匹配项，可直接点击“确认添加药品”手动入库。
                                    </div>
                                );
                            })()}
                        </div>
                    )}
                </div>

                {/* 2. 🎛️ 精准参数核准 (自动带出，也可强行手改) + 全息单位矩阵 + 防弹数值装甲 */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 relative z-40">

                    {/* ① 单次剂量 (拦截负数与零) */}
                    <div className="flex bg-slate-50 rounded-xl p-2 items-center focus-within:ring-2 focus-within:ring-teal-400 transition-all">
                        <span className="text-[9px] font-black px-2 text-slate-400 whitespace-nowrap">单次剂量</span>
                        <input
                            type="number" min="0.1" step="any"
                            value={dosePerTime}
                            onChange={(e) => { if (Number(e.target.value) >= 0) setDosePerTime(e.target.value); }}
                            onBlur={() => { if (Number(dosePerTime) <= 0) setDosePerTime('1'); }}
                            className="w-full bg-transparent border-none outline-none font-bold text-slate-800 text-center"
                        />
                    </div>

                    {/* ② 计量单位 (Combobox 全息矩阵) */}
                    <div className="flex bg-slate-50 rounded-xl p-2 items-center focus-within:ring-2 focus-within:ring-teal-400 transition-all relative">
                        <span className="text-[9px] font-black px-2 text-slate-400 whitespace-nowrap">计量单位</span>
                        <input
                            value={unit}
                            onChange={(e) => setUnit(e.target.value)}
                            onFocus={() => setShowUnitDrop(true)}
                            onBlur={() => setTimeout(() => setShowUnitDrop(false), 200)} // 延迟200ms关闭，防止点击矩阵时失焦
                            className="w-full bg-transparent border-none outline-none font-bold text-teal-600 text-center relative z-10"
                        />
                        {/* ⚡ 展开的九宫格快选矩阵 */}
                        {showUnitDrop && (
                            <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-100 shadow-2xl rounded-xl p-2 z-[100] grid grid-cols-4 gap-1">
                                {['粒', '片', '包', '支', 'ml', '滴', '贴', '喷', '针', '袋', '盒', '盖'].map(u => (
                                    <button
                                        key={u}
                                        onClick={() => { setUnit(u); setShowUnitDrop(false); }}
                                        className="text-[10px] font-black text-slate-500 bg-slate-50 hover:bg-teal-500 hover:text-white rounded-md py-2 transition-all shadow-sm active:scale-95"
                                    >
                                        {u}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* ③ 每日频次 (拦截负数、小数与零) */}
                    <div className="flex bg-slate-50 rounded-xl p-2 items-center focus-within:ring-2 focus-within:ring-teal-400 transition-all">
                        <span className="text-[9px] font-black px-2 text-slate-400 whitespace-nowrap">每日频次</span>
                        <input
                            type="number" min="1" step="1"
                            value={timesPerDay}
                            onChange={(e) => setTimesPerDay(e.target.value.replace(/[^0-9]/g, ''))} // 正则物理过滤一切非数字
                            onBlur={() => { if (Number(timesPerDay) <= 0) setTimesPerDay('3'); }}
                            className="w-full bg-transparent border-none outline-none font-bold text-slate-800 text-center"
                        />
                    </div>

                    {/* ④ 入库总余量 (拦截负数与零) */}
                    <div className="flex bg-slate-50 rounded-xl p-2 items-center focus-within:ring-2 focus-within:ring-teal-400 shadow-sm border-2 border-teal-100 transition-all">
                        <span className="text-[9px] font-black px-2 text-teal-600 whitespace-nowrap">入库总余量</span>
                        <input
                            type="number" min="1"
                            value={stockAmount}
                            onChange={(e) => { if (Number(e.target.value) >= 0) setStockAmount(e.target.value); }}
                            onBlur={() => { if (Number(stockAmount) <= 0) setStockAmount('20'); }}
                            className="w-full bg-transparent border-none outline-none font-black text-teal-600 text-center text-lg"
                        />
                    </div>
                </div>

                <button
                    onClick={() => {
                        handleAddMed();
                        setSearchQuery(''); // 部署成功后，自动清空雷达扫描框
                    }}
                    className="w-full bg-slate-900 hover:bg-teal-500 text-white font-black py-4 rounded-xl transition-all shadow-md active:scale-95 flex items-center justify-center gap-2"
                >
                    确认添加药品 ➔
                </button>
            </div>

            {/* 主执行面板 */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    {/* DEFCON 战报区 */}
                    <div className={`mb-8 bg-white rounded-[2.5rem] p-6 border border-slate-100 transition-all ${tacticalStats.defcon.glow}`}>
                        <div className="flex flex-col xl:flex-row justify-between items-center gap-6">
                            <div className="flex items-center gap-5 w-full xl:w-auto">
                                {/* 📅 动态日历图标 (自动获取系统当天的号数) */}
                                <div className={`w-16 h-16 rounded-2xl border flex flex-col items-center justify-center bg-slate-50 transition-all ${tacticalStats.defcon.color}`}>
                                    <span className="text-[10px] font-black uppercase opacity-60">
                                        TODAY
                                    </span>
                                    <span className="text-3xl font-black leading-none mt-0.5">
                                        {new Date().getDate()}
                                    </span>
                                </div>
                                {/* 🌟 修复后：今日用药概览 标题区 (增加 flex-wrap 和 whitespace-nowrap) */}
                                <div className="flex flex-col justify-center">
                                    <div className="flex flex-wrap items-center gap-3">
                                        <h2 className="text-2xl font-black text-slate-800 tracking-tight whitespace-nowrap">今日用药概览</h2>
                                        <span className={`text-[10px] px-3 py-1.5 rounded-full ${tacticalStats.defcon.bg} text-white font-black whitespace-nowrap shadow-sm`}>
                                            {tacticalStats.defcon.status}
                                        </span>
                                    </div>
                                    <p className="text-slate-400 text-[10px] font-black tracking-widest uppercase mt-1">Daily Health Dashboard</p>
                                </div>
                            </div>
                            <div className="flex-1 w-full xl:w-auto bg-slate-50/50 rounded-2xl p-5 border border-slate-100 flex flex-col justify-center">
                                <div className="flex justify-between items-end mb-3">
                                    <span className="text-slate-400 text-[10px] font-black uppercase">今日用药进度</span>
                                    {/* 🎯 找到战情中枢显示百分比的地方 */}
                                    <span className={`text-3xl font-black text-teal-500 leading-none tabular-nums drop-shadow-sm transition-all ${stealth ? 'blur-lg select-none' : ''
                                        }`}>
                                        {/* 🔒 逻辑：防窥开启时显示 88，关闭时显示真实数据 */}
                                        {stealth ? '88' : tacticalStats.hitRate}%
                                    </span>
                                </div>
                                <div className="h-2.5 w-full bg-slate-200 rounded-full flex gap-1 p-0.5">
                                    {Array.from({ length: Math.max(tacticalStats.totalTargets, 1) }).map((_, i) => (
                                        <div key={i} className={`h-full flex-1 rounded-full ${i < tacticalStats.destroyedTargets ? 'bg-teal-500 shadow-[0_0_8px_rgba(20,184,166,0.4)]' : 'bg-slate-200'}`} />
                                    ))}
                                </div>
                            </div>
                            <div className="shrink-0 w-full xl:w-auto flex flex-col items-end gap-2">
                                <div className="flex justify-between items-center w-full px-1 gap-2">
                                    <div className="text-[10px] font-black uppercase text-slate-400 flex items-center gap-2">
                                        <div className={`w-2 h-2 rounded-full ${selectedIds.length > 0 ? 'bg-teal-500 animate-pulse' : 'bg-slate-300'}`} />
                                        Locked: {selectedIds.length}
                                    </div>
                                    <div className="flex gap-2">
                                        {/* 📌 新增：置顶/取消按钮 */}
                                        <button onClick={togglePinSelected} disabled={selectedIds.length === 0} className={`text-[9px] font-black uppercase px-3 py-1 rounded-md border transition-all ${selectedIds.length > 0 ? 'border-teal-400 text-teal-600 hover:bg-teal-50 shadow-sm' : 'border-slate-200 text-slate-300'}`}>
                                            置顶/取消
                                        </button>
                                        <button onClick={toggleSelectAll} className="text-[9px] font-black uppercase px-2 py-1 rounded-md border border-slate-200 text-slate-400 hover:text-teal-600 transition-all">
                                            {selectedIds.length > 0 ? '取消全选' : '全选待服'}
                                        </button>
                                    </div>
                                </div>
                                <button onClick={handleSalvoFire} disabled={selectedIds.length === 0} className={`w-full xl:w-auto px-8 py-4 rounded-2xl font-black text-sm uppercase transition-all flex items-center justify-center gap-2 ${selectedIds.length > 0 ? 'bg-teal-500 text-white shadow-lg hover:bg-teal-400 cursor-pointer' : 'bg-slate-100 text-slate-300 cursor-not-allowed'}`}>
                                    <CheckCircle2 size={20} /> 一键全阵列齐射
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* 药品列表 */}
                    {/* 药品列表 (自带置顶排序算法) */}
                    {/* 🧲 药品列表：双轨重力排序引擎 (替换你发我的那一整块) */}
                    {/* 🧲 药品列表：双轨重力排序引擎 (替换 1085-1141 行) */}
                    {(() => {
                        // 1. 逻辑分流：将数据严格分为“置顶区”和“常规区”，并按 sort_order 物理坐标排序
                        const pinnedMeds = meds
                            .filter(m => m.is_pinned)
                            .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));

                        const unpinnedMeds = meds
                            .filter(m => !m.is_pinned)
                            .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));

                        return (
                            <div className="flex flex-col gap-2">
                                {/* 轨道 A：置顶专属重力场 */}
                                <Reorder.Group axis="y" values={pinnedMeds} onReorder={(newOrder) => handleReorder(newOrder, true)}>
                                    {pinnedMeds.map(med => (
                                        <DraggableMedCard
                                            key={med.id}
                                            med={med}
                                            stealth={stealth}
                                            isSelected={selectedIds.includes(med.id)}
                                            todayCount={getTodayProgress(med.id)}
                                            isCompleted={med.times_per_day > 0 && getTodayProgress(med.id) >= med.times_per_day} radar={getRadarInfo(med.last_taken_at, med.times_per_day)}
                                            isLowAmmo={(med.times_per_day > 0) && (med.stock_amount / (med.times_per_day * med.dose_per_time) <= 3)} toggleSelection={toggleSelection}
                                            openRefillModal={openRefillModal}
                                            handleDeleteClick={handleDeleteClick}
                                            armedId={armedId}
                                            handleTakeMedClick={handleTakeMedClick}
                                        />
                                    ))}
                                </Reorder.Group>

                                {/* 轨道 B：常规执行重力场 */}
                                <Reorder.Group axis="y" values={unpinnedMeds} onReorder={(newOrder) => handleReorder(newOrder, false)}>
                                    {unpinnedMeds.map(med => (
                                        <DraggableMedCard
                                            key={med.id}
                                            med={med}
                                            stealth={stealth}
                                            isSelected={selectedIds.includes(med.id)}
                                            todayCount={getTodayProgress(med.id)}
                                            isCompleted={med.times_per_day > 0 && getTodayProgress(med.id) >= med.times_per_day} radar={getRadarInfo(med.last_taken_at, med.times_per_day)}
                                            isLowAmmo={med.times_per_day > 0 ? (med.stock_amount <= med.times_per_day * med.dose_per_time * 3) : (med.stock_amount <= med.dose_per_time * 2)} toggleSelection={toggleSelection}
                                            openRefillModal={openRefillModal}
                                            handleDeleteClick={handleDeleteClick}
                                            armedId={armedId}
                                            handleTakeMedClick={handleTakeMedClick}
                                        />
                                    ))}
                                </Reorder.Group>
                            </div>
                        );
                    })()}
                </div>

                {/* 右侧记录 */}
                <div className="space-y-4">
                    <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 ml-2"><Clock size={16} /> 实时用药记录</h2>
                    <button
                        onClick={() => router.push('/arsenal')}
                        className="text-[10px] font-black uppercase text-teal-500 hover:text-teal-400 flex items-center gap-1 transition-all"
                    >
                        进入全息日志大屏 ➔
                    </button>
                    <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100 min-h-[400px] max-h-[800px] overflow-y-auto">
                        <div className="space-y-4">
                            {logs.slice(0, 15).map((log) => (
                                <div key={log.id} className="flex items-start gap-3 border-b border-slate-50 pb-3">
                                    <div className="w-1.5 h-1.5 mt-1.5 rounded-full bg-teal-400" />
                                    {/* 找到右侧 logs.slice(0, 15).map 循环内部 */}
                                    <div className="flex-1">
                                        <p className={`text-xs font-black text-slate-800 transition-all ${stealth ? 'blur-sm select-none' : ''}`}>
                                            {stealth ? 'CLASSIFIED_LOG' : log.medicine_name}
                                        </p>
                                        <p className="text-[9px] text-slate-400 font-bold uppercase mt-0.5">
                                            {new Date(log.taken_at).toLocaleString('zh-CN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* ==================== 🚨 A.E.G.I.S. 交叉火力拦截弹窗 ==================== */}
            {conflictAlert && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-red-950/90 backdrop-blur-lg">
                    <div className="relative bg-slate-900 rounded-[3rem] p-8 w-full max-w-md border-4 border-red-600 shadow-[0_0_100px_rgba(239,68,68,0.4)]">

                        {/* 顶部高危爆闪灯 */}
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-1.5 bg-red-500 rounded-b-full shadow-[0_0_20px_rgba(239,68,68,1)] animate-pulse" />

                        <div className="text-center mb-8 mt-4">
                            <div className="inline-block p-5 rounded-full bg-red-500 text-white mb-6 shadow-[0_0_40px_rgba(239,68,68,0.8)] animate-pulse">
                                <ShieldCheck size={56} />
                            </div>
                            <h3 className="text-3xl font-black italic text-red-500 uppercase tracking-widest drop-shadow-md">用药冲突安全预警</h3>
                            <p className="text-sm font-bold text-slate-300 mt-6 whitespace-pre-line leading-relaxed px-4">
                                {conflictAlert.msg}
                            </p>
                        </div>

                        <div className="flex flex-col gap-4">
                            <button
                                onClick={() => setConflictAlert(null)}
                                className="bg-slate-800 hover:bg-slate-700 text-white py-5 rounded-2xl font-black text-sm border-2 border-slate-700 transition-all"
                            >
                                🛡️ 取消本次用药
                            </button>
                            <button
                                disabled={overrideTimer > 0}
                                onClick={() => {
                                    // 🔪 强行越权，暴力执行！
                                    setConflictAlert(null);
                                    executeTakeMed(conflictAlert.med, new Date());
                                }}
                                className={`py-5 rounded-2xl font-black text-sm transition-all ${overrideTimer > 0
                                    ? 'bg-slate-900 text-slate-600 border-2 border-red-900/30 cursor-not-allowed'
                                    : 'bg-red-600 hover:bg-red-500 text-white shadow-[0_0_30px_rgba(239,68,68,0.6)] border-2 border-red-500'
                                    }`}
                            >
                                {overrideTimer > 0 ? `🚨 强行越权锁定 (${overrideTimer}s)` : '⚠️ 了解风险，确认用药'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showFireModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
                    <div className="bg-white rounded-[2rem] w-full max-w-sm shadow-2xl border border-slate-100 overflow-hidden transform transition-all scale-100">
                        <div className="bg-slate-50 p-6 pb-5 border-b border-slate-100 flex flex-col items-center gap-3">
                            <div className="w-14 h-14 rounded-full bg-teal-100 flex items-center justify-center relative shadow-inner">
                                <div className="absolute inset-0 rounded-full border-2 border-teal-400 animate-ping opacity-25" />
                                <CheckCircle2 size={28} className="text-teal-600" />
                            </div>
                            <h2 className="text-xl font-black text-slate-800 tracking-widest uppercase">确认齐射指令</h2>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="flex justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                <span>Locked Targets</span>
                                <span className="text-teal-500 bg-teal-50 px-2 py-1 rounded-md">{selectedIds.length} 项</span>
                            </div>
                            <div className="max-h-[30vh] overflow-y-auto space-y-2">
                                {meds.filter(m => selectedIds.includes(m.id) && getTodayProgress(m.id) < m.times_per_day).map(med => (
                                    <div key={med.id} className="flex items-center gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100">
                                        <div className="w-2 h-2 rounded-full bg-teal-400 shadow-sm" />
                                        <span className="font-bold text-slate-700 text-sm truncate">{stealth ? '【隐藏模式目标】' : med.name}</span>
                                    </div>
                                ))}
                            </div>
                            <div className="pt-2 text-center">
                                <span className="text-[10px] font-bold text-slate-500 bg-slate-50 px-4 py-2 rounded-xl inline-block">执行后今日进度将全面 <span className="text-teal-500 font-black">+1</span></span>
                            </div>
                        </div>
                        <div className="p-4 bg-slate-50/50 flex gap-3">
                            <button onClick={() => setShowFireModal(false)} className="flex-1 py-4 rounded-xl font-black text-xs text-slate-400 border border-slate-200 hover:bg-white transition-all">取消待命</button>
                            <button onClick={executeSalvo} className="flex-1 py-4 rounded-xl font-black text-xs text-white bg-teal-500 shadow-lg hover:bg-teal-400 transition-all">确定执行</button>
                        </div>
                    </div>
                </div>
            )}

            {isRefillOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                    <div className="relative bg-white rounded-[3rem] p-8 w-full max-w-sm border-4 border-slate-800 shadow-2xl">
                        <div className="text-center mb-6">
                            <div className="inline-block p-3 rounded-2xl bg-teal-50 text-teal-500 mb-4"><PackagePlus size={32} /></div>
                            <h3 className="text-2xl font-black italic text-slate-900 uppercase">药品库存补充</h3>
                            <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest">
                                Target: <span className={`text-teal-500 transition-all ${stealth ? 'blur-sm select-none' : ''}`}>
                                    {stealth ? 'CLASSIFIED_TARGET' : selectedMed?.name}
                                </span>
                            </p>                        </div>
                        <div className="bg-slate-50 p-4 rounded-2xl border-2 border-transparent focus-within:border-teal-400 transition-all mb-8">
                            <span className="text-[9px] font-black text-slate-400 uppercase block mb-1">补充数量 ({selectedMed?.unit})</span>
                            <input type="number" autoFocus value={refillValue} onChange={(e) => setRefillValue(e.target.value)} className="w-full bg-transparent border-none outline-none text-2xl font-black text-slate-800" />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <button onClick={() => setIsRefillOpen(false)} className="py-4 rounded-2xl font-black text-xs uppercase text-slate-400 hover:bg-slate-50 transition-all">取消</button>
                            <button onClick={confirmRefill} className="bg-slate-900 hover:bg-teal-500 text-white py-4 rounded-2xl font-black text-xs uppercase shadow-lg">确认空投 ➔</button>
                        </div>
                    </div>
                </div>
            )}

            {retroMed && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md">
                    <div className="relative bg-slate-900 rounded-[3rem] p-8 w-full max-w-md border-2 border-red-500/50 shadow-2xl">
                        <div className="text-center mb-8">
                            <div className="inline-block p-4 rounded-full bg-red-500/10 text-red-500 mb-4 animate-pulse"><History size={36} /></div>
                            <h3 className="text-xl font-black italic text-white uppercase tracking-widest">用药记录补充</h3>
                            <p className="text-xs font-bold text-slate-400 mt-2">探测到 <span className="text-teal-400">{stealth ? '【机密目标】' : retroMed.name}</span> 严重超时。<br />您是刚刚执行了操作，还是为了补录错过的记录？</p>
                        </div>
                        <div className="flex flex-col gap-4">
                            <button onClick={() => executeTakeMed(retroMed, new Date())} className="bg-slate-800 hover:bg-slate-700 text-white py-4 rounded-2xl font-black text-sm border border-slate-700">🕒 刚刚用药 (按此刻时间记录)</button>
                            <button onClick={confirmRetroactive} className="bg-red-500 hover:bg-red-600 text-white py-4 rounded-2xl font-black text-sm shadow-lg">⚡ 补录过往记录 (按原计划时间补齐)</button>
                        </div>
                    </div>
                </div>
            )}
            {/* ==================== 💛 温馨服药间隔提醒弹窗 ==================== */}
            {cooldownMed && (
                <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm transition-opacity">
                    <div className="bg-white rounded-[2.5rem] p-8 w-full max-w-sm shadow-2xl border border-slate-50 transform transition-all scale-100 text-center">

                        {/* 顶部温和图标 */}
                        <div className="inline-block p-4 rounded-full bg-orange-50 text-orange-500 mb-6">
                            <Timer size={36} />
                        </div>

                        {/* 标题与正文 */}
                        <h3 className="text-xl font-black text-slate-800 tracking-tight mb-3">服药间隔提醒</h3>
                        <p className="text-xs font-bold text-slate-500 leading-relaxed mb-8">
                            距离上次记录的时间较近，通常建议您再等等。
                            <br /><br />
                            如果您是遵医嘱调整用药，或正在补录漏记的数据，请点击「继续服药」。
                        </p>

                        {/* 柔性操作按钮 */}
                        <div className="flex gap-3">
                            <button
                                onClick={() => setCooldownMed(null)}
                                className="flex-1 py-4 rounded-2xl font-black text-xs text-slate-500 bg-slate-50 hover:bg-slate-100 transition-all"
                            >
                                取消
                            </button>
                            <button
                                onClick={() => {
                                    executeTakeMed(cooldownMed, new Date());
                                    setCooldownMed(null);
                                }}
                                className="flex-1 py-4 rounded-2xl font-black text-xs text-white bg-orange-400 hover:bg-orange-500 shadow-lg shadow-orange-500/20 transition-all"
                            >
                                继续服药
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {/* ==================== 🚨 高定版账号注销确认弹窗 ==================== */}
            {showDeleteModal && (
                <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md transition-opacity">
                    <div className="bg-white rounded-[2.5rem] p-8 w-full max-w-sm shadow-2xl border border-red-50 transform transition-all scale-100 text-center">

                        {/* 顶部危险图标 */}
                        <div className="inline-block p-4 rounded-full bg-red-50 text-red-500 mb-6">
                            <UserX size={36} />
                        </div>

                        {/* 标题与正文 (医疗关怀向文案修正) */}
                        <h3 className="text-xl font-black text-slate-800 tracking-tight mb-3">确认注销账号？</h3>
                        <p className="text-xs font-bold text-slate-500 leading-relaxed mb-8 px-2">
                            执行注销将永久抹除您的身份信息、所有药品库存及历史用药记录。
                            <br /><br />
                            <span className="text-red-500 font-black">此操作不可逆，请谨慎决定。</span>
                        </p>

                        {/* 柔性操作按钮 */}
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowDeleteModal(false)}
                                className="flex-1 py-4 rounded-2xl font-black text-xs text-slate-500 bg-slate-50 hover:bg-slate-100 transition-all"
                            >
                                暂不注销
                            </button>
                            <button
                                onClick={executeDeleteAccount}
                                className="flex-1 py-4 rounded-2xl font-black text-xs text-white bg-red-500 hover:bg-red-600 shadow-lg shadow-red-500/30 transition-all"
                            >
                                确认清除
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ==================== 🚨 S.O.S 生命通道弹窗 ==================== */}
            {sosAlertMed && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-red-950/90 backdrop-blur-xl transition-opacity">
                    <div className="bg-slate-900 rounded-[3rem] p-8 w-full max-w-sm shadow-[0_0_80px_rgba(239,68,68,0.5)] border-4 border-red-600 text-center relative overflow-hidden">
                        {/* 警报灯特效 */}
                        <div className="absolute top-0 left-0 w-full h-2 bg-red-500 animate-pulse" />
                        <div className="inline-block p-5 rounded-full bg-red-500/20 text-red-500 mb-6">
                            <HeartPulse size={48} className="animate-bounce" />
                        </div>
                        <h3 className="text-2xl font-black text-white tracking-widest uppercase mb-2">已记录急救操作</h3>
                        <p className="text-sm font-bold text-red-400 mb-6">目标：{stealth ? '【机密药物】' : sosAlertMed.name}</p>
                        <p className="text-xs font-bold text-slate-300 leading-relaxed mb-8">
                            如果服用后症状未缓解，请务必立刻就医！
                        </p>
                        <div className="flex flex-col gap-4">
                            <a href="tel:120" onClick={() => setSosAlertMed(null)} className="w-full py-5 rounded-2xl font-black text-lg text-white bg-red-600 hover:bg-red-500 shadow-lg flex items-center justify-center gap-2">
                                📞 拨打 120 急救
                            </a>
                            <button onClick={() => setSosAlertMed(null)} className="w-full py-4 rounded-2xl font-black text-xs text-slate-400 border-2 border-slate-700">
                                我已安全 / 仅记录数据
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
} // <--- 只有这一个大门，彻底关闭组件！