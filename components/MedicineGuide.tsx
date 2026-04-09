"use client";
import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from './supabaseClient';
import { Trash2, Activity, CheckCircle2, Clock, Target, ShoppingCart, Flame, BarChart3, HeartPulse, LogOut, KeyRound, User, ShieldCheck, Radar, PackagePlus, Download, Timer, Eye, EyeOff, History } from 'lucide-react';

// 🚀 黑科技 1：三相音频合成器 (声呐 & 震动)
const playSciFiSound = (type: 'login' | 'success' | 'warning') => {
    try {
        const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
        if (!AudioContext) return;
        const ctx = new AudioContext();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain); gain.connect(ctx.destination);

        if (type === 'login') {
            osc.type = 'sine'; osc.frequency.setValueAtTime(200, ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(1000, ctx.currentTime + 0.4);
            gain.gain.setValueAtTime(0, ctx.currentTime); gain.gain.linearRampToValueAtTime(0.15, ctx.currentTime + 0.1);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
            osc.start(); osc.stop(ctx.currentTime + 0.5);
            if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate([60, 80, 60]);
        } else if (type === 'success') {
            osc.type = 'sine'; osc.frequency.setValueAtTime(800, ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.1);
            gain.gain.setValueAtTime(0.1, ctx.currentTime); gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
            osc.start(); osc.stop(ctx.currentTime + 0.15);
            if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate([30, 50, 30]);
        } else {
            osc.type = 'square'; osc.frequency.setValueAtTime(150, ctx.currentTime);
            gain.gain.setValueAtTime(0.1, ctx.currentTime); gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
            osc.start(); osc.stop(ctx.currentTime + 0.4);
            if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate([100, 50, 100]);
        }
    } catch (e) { console.log('音频引擎未激活'); }
};

// 🚀 黑科技 2：【雅典娜】A.I. 战术语音播报引擎
const speakTacticalVoice = (text: string) => {
    try {
        if (!('speechSynthesis' in window)) return;
        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'zh-CN';

        // 🚀 调音核心：
        utterance.rate = 1.1;  // 别太快，太快像赶集，1.1 这种不急不慢的节奏才有压迫感
        utterance.pitch = 0.5; // 重点在这里！把音调强行压到 0.5。
        // 只要音调够低，就算是超市播报员也能听出点“赛博判官”的冷峻感。
        utterance.volume = 1;

        window.speechSynthesis.speak(utterance);
    } catch (e) { console.log('语音副官未激活'); }
};

export default function MedicineGuide() {
    const [session, setSession] = useState<any>(null);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isSignUp, setIsSignUp] = useState(false);
    const [authLoading, setAuthLoading] = useState(false);

    const [medName, setMedName] = useState('');
    const [stockAmount, setStockAmount] = useState('20');
    const [timesPerDay, setTimesPerDay] = useState('3');
    const [dosePerTime, setDosePerTime] = useState('1');
    const [unit, setUnit] = useState('粒');
    const [meds, setMeds] = useState<any[]>([]);
    // --- 这里的代码粘在 const [meds...] 下面 ---
    // 1. 之前加的：补给弹窗开关（控制那个📦图标的弹窗）
    const [isRefillOpen, setIsRefillOpen] = useState(false);
    const [selectedMed, setSelectedMed] = useState<any>(null);
    const [refillValue, setRefillValue] = useState('20');

    // 2. 刚才新加的：战术通知开关
    const [toast, setToast] = useState<{ msg: string, show: boolean }>({ msg: '', show: false });

    // 3. 🚀 现在这一步要加的：
    const [stealth, setStealth] = useState(false);   // 幽灵防窥开关（控制模糊效果）
    const [retroMed, setRetroMed] = useState<any>(null); // 量子回溯开关（控制那个红光补录弹窗）

    // 战术通知辅助函数
    const showTacticalToast = (msg: string) => {
        setToast({ msg, show: true });
        setTimeout(() => setToast({ msg: '', show: false }), 3000);
    };
    const [logs, setLogs] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    // 🚀 战术雷达：全局时间心跳 (每分钟刷新倒计时)
    const [nowTime, setNowTime] = useState(new Date());
    useEffect(() => {
        const timer = setInterval(() => setNowTime(new Date()), 60000);
        return () => clearInterval(timer);
    }, []);


    useEffect(() => {
        // 🚀 核心破解：只要手指一碰到屏幕，立刻强行解锁音频！
        window.addEventListener('touchstart', unlockAudio, { once: true });
        window.addEventListener('click', unlockAudio, { once: true });

        // 下面是你原来的代码
        supabase.auth.getSession().then(({ data: { session } }) => setSession(session));
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => setSession(session));

        if ('serviceWorker' in navigator) {
            window.addEventListener('load', function () {
                navigator.serviceWorker.register('/sw.js').catch(err => console.log('SW error', err));
            });
        }
        return () => subscription.unsubscribe();
    }, []);

    useEffect(() => { if (session) fetchData(); }, [session]);

    const fetchData = async () => {
        const { data: m } = await supabase.from('medicines').select('*').order('expired_at', { ascending: true });
        const { data: l } = await supabase.from('medicine_logs').select('*').order('taken_at', { ascending: false }).limit(100);
        setMeds(m || []); setLogs(l || []);
    };

    // 🚀 黑科技 3：强行夺取手机音频通道
    const unlockAudio = () => {
        try {
            // 1. 解锁 Web Audio API (为了滴滴的电子音效)
            const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
            if (AudioContext) {
                const ctx = new AudioContext();
                ctx.resume();
            }

            // 2. 解锁 SpeechSynthesis (为了雅典娜的语音)
            if ('speechSynthesis' in window) {
                // 播报一段绝对无声的空白字符
                const silentUtterance = new SpeechSynthesisUtterance('');
                window.speechSynthesis.speak(silentUtterance);
            }
        } catch (e) { console.log('音频权限夺取失败'); }
    };

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault(); setAuthLoading(true);
        if (isSignUp) {
            const { error } = await supabase.auth.signUp({ email, password });
            if (error) {
                speakTacticalVoice('警告，注册受阻。'); alert(error.message);
            } else {
                speakTacticalVoice('坐标建立完毕。赛博特工已就位。'); alert('注册成功！');
            }
        } else {
            const { error } = await supabase.auth.signInWithPassword({ email, password });
            if (error) {
                speakTacticalVoice('权限拒绝。请检查密钥。'); alert('登录失败：' + error.message);
            } else {
                playSciFiSound('login');
                // 延迟0.6秒播报，等机甲启动音效响完，更有感觉
                setTimeout(() => speakTacticalVoice('身份确认。欢迎回舱，指挥官。'), 600);
            }
        }
        setAuthLoading(false);
    };

    const handleLogout = async () => {
        speakTacticalVoice('系统休眠。指挥官，祝您好运。');
        await supabase.auth.signOut();
        setMeds([]); setLogs([]);
    };

    const handleAddMed = async () => {
        if (!medName) return alert('药名不可为空！');
        setLoading(true);
        const { error } = await supabase.from('medicines').insert([{
            name: medName, expired_at: new Date(Date.now() + 31536000000).toISOString().split('T')[0],
            stock_amount: parseFloat(stockAmount), times_per_day: parseInt(timesPerDay), dose_per_time: parseFloat(dosePerTime),
            unit: unit, user_id: session.user.id
        }]);
        if (!error) {
            setMedName(''); fetchData(); playSciFiSound('success');
            speakTacticalVoice(`补给已空投。${medName} 入库成功。`);
        }
        setLoading(false);
    };

    // 🚀 硬菜 1：紧急空投 (一键补充库存)
    // --- 把旧的 handleRefill 换成下面这两个 ---
    const openRefillModal = (med: any) => {
        setSelectedMed(med);
        setRefillValue('20');
        setIsRefillOpen(true);
        playSciFiSound('success');
    };

    const confirmRefill = async () => {
        if (!selectedMed || isNaN(Number(refillValue))) return;
        const newStock = selectedMed.stock_amount + Number(refillValue);
        await supabase.from('medicines').update({ stock_amount: newStock }).eq('id', selectedMed.id);
        fetchData();
        setIsRefillOpen(false);
        playSciFiSound('login');
        showTacticalToast(`补给完毕：${selectedMed.name} 现存 ${newStock}`);
    };

    // 🚀 硬菜 2：机密数据撤离 (导出 Excel/CSV 给医生看)
    const handleExportData = () => {
        if (logs.length === 0) return alert('当前无战术日志可供撤离！');

        // 生成 CSV 格式数据
        const headers = "药品名,执行时间,操作员\n";
        const csvContent = logs.map(l => {
            const date = new Date(l.taken_at).toLocaleString('zh-CN');
            return `${l.medicine_name},${date},${session?.user?.email}`;
        }).join("\n");

        // 强制下载
        const blob = new Blob(["\ufeff" + headers + csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = `LeonPulse_战术日志_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
        playSciFiSound('login');
    };



    // 🚀 1. 动作拦截器 (判断是否需要时光倒流)
    const handleTakeMedClick = (med: any) => {
        const radar = getRadarInfo(med.last_taken_at, med.times_per_day);
        if (radar.status === 'OVERDUE') {
            setRetroMed(med); // 触发量子回溯警告窗
            playSciFiSound('warning');
        } else {
            executeTakeMed(med, new Date()); // 正常执行
        }
    };

    // 🚀 2. 核心处决逻辑 (带全频段静默处理)
    const executeTakeMed = async (med: any, executionTime: Date) => {
        // 定义脱敏代号
        const displayName = stealth ? '【机密目标】' : med.name;

        if (med.stock_amount < med.dose_per_time) {
            playSciFiSound('warning');
            showTacticalToast(`警告！${displayName} 余量不足！`);
            // 语音也得闭嘴
            if (typeof speakTacticalVoice !== 'undefined') speakTacticalVoice(`警告！${stealth ? '目标' : med.name}余量不足。`);
            return;
        }
        playSciFiSound('success');

        const remainingAmount = med.stock_amount - med.dose_per_time;
        await supabase.from('medicines').update({ last_taken_at: executionTime.toISOString(), stock_amount: remainingAmount }).eq('id', med.id);
        await supabase.from('medicine_logs').insert([{ medicine_id: med.id, medicine_name: med.name, user_id: session.user.id, taken_at: executionTime.toISOString() }]);

        setRetroMed(null); fetchData();

        // 弹窗脱敏
        showTacticalToast(`战术动作确认。${displayName} 已记录。`);

        // 🎙️ 语音播报脱敏 (雅典娜闭嘴模式)
        if (typeof speakTacticalVoice !== 'undefined') {
            if (stealth) {
                speakTacticalVoice('静默协议执行。目标已清除。'); // 帅爆的代号语音
            } else {
                speakTacticalVoice(`确认。${med.name} 已执行。`);
            }
        }
    };

    // 🚀 3. 启动量子回溯 (补算错过的完美时间点)
    const confirmRetroactive = () => {
        if (!retroMed) return;
        const lastDate = new Date(retroMed.last_taken_at || new Date());
        const idealTime = new Date(lastDate.getTime() + (24 / retroMed.times_per_day) * 60 * 60 * 1000);
        executeTakeMed(retroMed, idealTime);
    };

    const currentStreak = useMemo(() => {
        if (logs.length === 0) return 0;
        const uniqueDays = [...new Set(logs.map(log => log.taken_at.split('T')[0]))].sort().reverse();
        let streak = 0, checkDate = new Date();
        for (let i = 0; i < uniqueDays.length; i++) {
            const logDateStr = uniqueDays[i];
            if (i === 0 && logDateStr !== checkDate.toISOString().split('T')[0]) {
                checkDate.setDate(checkDate.getDate() - 1);
                if (logDateStr !== checkDate.toISOString().split('T')[0]) return streak;
            }
            if (logDateStr === checkDate.toISOString().split('T')[0]) { streak++; checkDate.setDate(checkDate.getDate() - 1); }
            else break;
        }
        return streak;
    }, [logs]);

    const last7DaysHeatmap = useMemo(() => {
        return Array.from({ length: 7 }).map((_, i) => {
            const d = new Date(); d.setDate(d.getDate() - (6 - i));
            const dateStr = d.toISOString().split('T')[0];
            const count = logs.filter(l => l.taken_at.startsWith(dateStr)).length;
            return { date: dateStr, count, day: d.toLocaleDateString('en-US', { weekday: 'short' }) };
        });
    }, [logs]);

    const getDepletionInfo = (stock: number, times: number, dose: number) => {
        const dailyConsumption = times * dose;
        if (dailyConsumption === 0 || stock <= 0) return { daysLeft: 0, text: '已枯竭', color: 'text-red-500', bg: 'bg-red-500/10' };

        const daysLeft = Math.floor(stock / dailyConsumption);
        if (daysLeft <= 3) return { daysLeft, text: `预警: 仅剩 ${daysLeft} 天`, color: 'text-orange-500', bg: 'bg-orange-500/10' };
        if (daysLeft <= 7) return { daysLeft, text: `将于 ${daysLeft} 天后耗尽`, color: 'text-yellow-600', bg: 'bg-yellow-500/10' };
        return { daysLeft, text: `储备充足 (${daysLeft}天)`, color: 'text-teal-600', bg: 'bg-teal-500/10' };
    };

    // 🚀 核心逻辑：战术冷却雷达计算
    const getRadarInfo = (lastTakenAt: string, timesPerDay: number) => {
        if (!lastTakenAt) return { status: 'READY', text: '随时可执行', color: 'text-teal-500', bg: 'bg-teal-50', allow: true };

        const lastDate = new Date(lastTakenAt);
        const intervalHours = 24 / timesPerDay;
        const nextDate = new Date(lastDate.getTime() + intervalHours * 60 * 60 * 1000);

        if (nowTime >= nextDate) {
            const overdueHrs = Math.floor((nowTime.getTime() - nextDate.getTime()) / (1000 * 60 * 60));
            return { status: 'OVERDUE', text: `已超时 ${overdueHrs} 小时`, color: 'text-red-500', bg: 'bg-red-50', allow: true, pulse: true };
        } else {
            const diffMs = nextDate.getTime() - nowTime.getTime();
            const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
            const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
            return { status: 'STANDBY', text: `冷却中 ${diffHrs}h ${diffMins}m`, color: 'text-orange-500', bg: 'bg-orange-50', allow: false };
        }
    };

    const getTodayProgress = (medId: string) => logs.filter(log => log.medicine_id === medId && new Date(log.taken_at).toDateString() === new Date().toDateString()).length;

    if (!session) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-900 p-4 font-sans">
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
                        <button type="submit" disabled={authLoading} className="w-full bg-slate-900 hover:bg-teal-500 text-white font-black py-4 rounded-2xl transition-all shadow-lg active:scale-95 mt-4">
                            {authLoading ? '验证中...' : (isSignUp ? '注册新坐标' : '接入主控制台 ➔')}
                        </button>
                    </form>
                    <div className="text-center mt-6">
                        <button onClick={() => setIsSignUp(!isSignUp)} className="text-xs font-bold text-slate-400 hover:text-teal-500 transition-colors">{isSignUp ? '已有通行证？立即接入' : '没有通行证？申请注册'}</button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto my-6 p-4 md:p-8 bg-[#f1f5f9] min-h-screen rounded-[2.5rem] shadow-2xl font-sans relative">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-4 pr-2">
                <div>
                    <h1 className="text-5xl font-black italic tracking-tighter text-slate-900">LEON PULSE<span className="text-teal-500">.</span></h1>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.5em] mt-1">Operator: <span className="text-teal-500">{session?.user?.email}</span></p>
                </div>
                {/* 🚀 这里的 div 把两个按钮包在了一起 */}
                <div className="flex items-center gap-6 pt-2 md:pt-0">
                    {/* 🚀 1. 防窥开关 (它是独立的！) */}
                    <button
                        onClick={(e) => {
                            e.stopPropagation(); // 这里的 e.stopPropagation() 是双保险，严防死守冒泡
                            setStealth(!stealth);
                        }}
                        className={`${stealth ? 'text-orange-500' : 'text-slate-400'} hover:text-teal-400 flex items-center gap-2 text-[10px] font-black uppercase transition-all whitespace-nowrap`}
                    >
                        {stealth ? <EyeOff size={14} /> : <Eye size={14} />} 防窥
                    </button>

                    {/* 🚀 2. 导出日志 (它也是独立的！) */}
                    <button
                        onClick={handleExportData}
                        className="text-teal-500 hover:text-teal-400 flex items-center gap-2 text-[10px] font-black uppercase transition-all whitespace-nowrap"
                    >
                        <Download size={14} /> 导出日志
                    </button>

                    {/* 🚀 3. 断开连接 */}
                    <button
                        onClick={handleLogout}
                        className="text-slate-400 hover:text-red-500 flex items-center gap-2 text-[10px] font-black uppercase transition-all whitespace-nowrap"
                    >
                        <LogOut size={14} /> 断开连接
                    </button>
                </div>
            </div>

            <div className="mb-10 grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-slate-900 rounded-[2rem] p-6 shadow-xl text-white relative overflow-hidden flex flex-col justify-between">
                    <div className="absolute -right-10 -top-10 opacity-10"><HeartPulse size={120} /></div>
                    <div className="flex items-center gap-2 text-slate-400 mb-4 text-xs font-bold uppercase tracking-widest"><Activity size={16} /> 核心运转率</div>
                    <div><div className="text-6xl font-black italic tracking-tighter text-teal-400">{meds.length === 0 ? '0' : Math.min(100, Math.round((logs.length / (meds.length * 3 * 7)) * 100))}%</div></div>
                </div>
                <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100 flex flex-col justify-between">
                    <div className="flex items-center gap-2 text-slate-400 mb-4 text-xs font-bold uppercase tracking-widest"><Flame size={16} className="text-orange-500" /> 战术连胜</div>
                    <div className="flex items-end gap-3"><div className="text-6xl font-black italic tracking-tighter text-slate-800">{currentStreak}</div><div className="text-sm font-bold text-slate-400 mb-2">DAYS</div></div>
                </div>
                <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100">
                    <div className="flex items-center gap-2 text-slate-400 mb-4 text-xs font-bold uppercase tracking-widest"><BarChart3 size={16} className="text-teal-500" /> 行动热力矩阵</div>
                    <div className="flex gap-2 h-16 items-end justify-between">
                        {last7DaysHeatmap.map((day, i) => {
                            let bg = 'bg-slate-100'; if (day.count > 0) bg = 'bg-teal-200'; if (day.count > 2) bg = 'bg-teal-400'; if (day.count > 4) bg = 'bg-teal-600';
                            return (
                                <div key={i} className="flex flex-col items-center gap-2 w-full">
                                    <div className={`w-full rounded-md transition-all duration-500 ${bg}`} style={{ height: Math.max(12, Math.min(day.count * 10, 48)) + 'px' }} />
                                    <span className="text-[9px] font-black text-slate-400 uppercase">{day.day}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            <div className="bg-white p-6 rounded-[2rem] shadow-sm mb-10 border border-slate-100">
                <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-4">
                    <input value={medName} onChange={(e) => setMedName(e.target.value)} placeholder="药品名" className="col-span-2 lg:col-span-1 p-4 rounded-xl bg-slate-50 border-none outline-none focus:ring-2 focus:ring-teal-400 font-bold" />
                    <div className="flex bg-slate-50 rounded-xl p-2 items-center"><span className="text-[9px] font-black px-2 text-slate-400">总量</span><input type="number" value={stockAmount} onChange={(e) => setStockAmount(e.target.value)} className="w-full bg-transparent border-none outline-none font-bold" /></div>
                    <div className="flex bg-slate-50 rounded-xl p-2 items-center"><span className="text-[9px] font-black px-2 text-slate-400">剂量</span><input type="number" value={dosePerTime} onChange={(e) => setDosePerTime(e.target.value)} className="w-full bg-transparent border-none outline-none font-bold" /></div>
                    <div className="flex bg-slate-50 rounded-xl p-2 items-center"><span className="text-[9px] font-black px-2 text-slate-400">单位</span><input value={unit} onChange={(e) => setUnit(e.target.value)} className="w-full bg-transparent border-none outline-none font-bold text-teal-600" /></div>
                    <div className="flex bg-slate-50 rounded-xl p-2 items-center"><span className="text-[9px] font-black px-2 text-slate-400">频次/日</span><input type="number" value={timesPerDay} onChange={(e) => setTimesPerDay(e.target.value)} className="w-full bg-transparent border-none outline-none font-bold" /></div>
                </div>
                <button onClick={handleAddMed} className="w-full bg-slate-900 hover:bg-teal-500 text-white font-black py-4 rounded-xl transition-all active:scale-[0.98]">部署新补给 ➔</button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-2 ml-2"><Target size={16} /> 今日执行面板</h2>
                    {meds.map((med) => {
                        const todayCount = getTodayProgress(med.id);
                        const isCompleted = todayCount >= med.times_per_day;
                        const depletion = getDepletionInfo(med.stock_amount, med.times_per_day, med.dose_per_time);
                        const radar = getRadarInfo(med.last_taken_at, med.times_per_day);

                        return (
                            <div key={med.id} className="p-6 rounded-[2rem] border-2 transition-all bg-white border-slate-100 hover:border-teal-200">
                                <div className="flex justify-between items-start mb-6">
                                    <div>
                                        <h3 className={`text-2xl font-black text-slate-800 flex items-center gap-2 transition-all duration-500 ${stealth ? 'blur-md opacity-60 select-none' : ''}`}>{med.name} {isCompleted && <CheckCircle2 size={20} className="text-emerald-500" />}</h3>
                                        <div className="mt-3">
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">今日进度 {todayCount}/{med.times_per_day}</span>
                                            <div className="flex gap-1.5 w-48">
                                                {Array.from({ length: med.times_per_day }).map((_, i) => (
                                                    <div key={i} className={`h-2 flex-1 rounded-sm transition-all duration-500 ${i < todayCount ? 'bg-teal-500 shadow-[0_0_8px_rgba(20,184,166,0.6)]' : 'bg-slate-200'}`} />
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    {/* 🚀 这是新的双按钮面板 */}
                                    <div className="flex flex-col gap-3">
                                        <button onClick={() => openRefillModal(med)} className="text-slate-300 hover:text-teal-500 transition-all bg-slate-50 p-2 rounded-lg" title="呼叫补给">
                                            <PackagePlus size={18} />
                                        </button>
                                        <button onClick={() => supabase.from('medicines').delete().eq('id', med.id).then(fetchData)} className="text-slate-300 hover:text-red-500 transition-all bg-slate-50 p-2 rounded-lg" title="销毁记录">
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>

                                {/* 🚀 升级后的战术底盘 */}
                                <div className="flex items-center justify-between gap-4 border-t border-slate-100/50 pt-4 mt-4">
                                    <div className="flex flex-col gap-2">
                                        {/* 余量警告 */}
                                        <div className="flex items-center gap-2">
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest w-12">余量</span>
                                            <span className="text-[12px] font-black text-slate-800">{med.stock_amount} <span className="text-[9px] text-slate-400">{med.unit}</span></span>
                                            <span className={`flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded-full ${depletion.bg} ${depletion.color} w-fit`}>
                                                <Radar size={10} /> {depletion.text}
                                            </span>
                                        </div>
                                        {/* 冷却雷达 */}
                                        {!isCompleted && (
                                            <div className="flex items-center gap-2">
                                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest w-12">雷达</span>
                                                <span className={`flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded-md ${radar.bg} ${radar.color} ${radar.pulse ? 'animate-pulse' : ''} border border-current`}>
                                                    <Timer size={10} /> {radar.text}
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    {/* 发射按钮动态化 */}
                                    {isCompleted ? (
                                        <div className="bg-emerald-50 text-emerald-600 px-6 py-4 rounded-2xl font-black text-[10px] flex items-center gap-2 border border-emerald-200"><ShieldCheck size={16} /> 今日已达标</div>
                                    ) : (
                                        <button
                                            onClick={() => handleTakeMedClick(med)}
                                            // 🚀 如果在冷却中，按钮变橙色并警告；否则是黑色
                                            className={`${radar.allow ? 'bg-slate-900 hover:bg-teal-500' : 'bg-orange-500 hover:bg-orange-600'} text-white px-6 py-4 rounded-2xl font-black text-[10px] active:scale-95 transition-all shadow-md flex items-center gap-2`}
                                        >
                                            {/* // 🚀 寻找原本的按钮文案，替换成这个： */}
                                            {radar.allow
                                                ? `确认${['支', '针', 'ml'].includes(med.unit) ? '注射' : '服用'} ${med.dose_per_time}${med.unit}`
                                                : `强制越权${['支', '针', 'ml'].includes(med.unit) ? '注射' : '服用'}`
                                            }
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className="space-y-4">
                    <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-2 ml-2"><Clock size={16} /> 实时流水</h2>
                    <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100 min-h-[400px]">
                        <div className="space-y-5">
                            {logs.slice(0, 8).map((log) => (
                                <div key={log.id} className="flex items-start gap-3 border-b border-slate-50 pb-3">
                                    <div className="w-2 h-2 mt-1.5 rounded-full bg-teal-400 shadow-[0_0_5px_rgba(20,184,166,0.5)]" />
                                    <div className="flex-1">
                                        <p className="text-xs font-black text-slate-800">{log.medicine_name}</p>
                                        <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">
                                            {new Date(log.taken_at).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                {/* --- 粘在倒数第二个 </div> 之前 --- */}

                {/* 🚀 战术通知 (Toast) */}
                {toast.show && (
                    <div className="fixed top-10 left-1/2 -translate-x-1/2 z-[100] transition-all">
                        <div className="bg-slate-900 border-2 border-teal-500/50 text-white px-8 py-3 rounded-full shadow-[0_0_20px_rgba(20,184,166,0.3)] flex items-center gap-3 backdrop-blur-md">
                            <div className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
                            <span className="text-[10px] font-black italic tracking-widest uppercase">{toast.msg}</span>
                        </div>
                    </div>
                )}

                {/* 🚀 量子回溯模态框 (这是你要找的那坨代码，如果没搜到，就直接粘这儿！) */}
                {retroMed && (
                    <div className="fixed inset-0 z-[95] flex items-center justify-center p-4">
                        <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-md" onClick={() => setRetroMed(null)} />
                        <div className="relative bg-slate-900 rounded-[3rem] p-8 w-full max-w-md border-2 border-red-500/50 shadow-[0_0_50px_rgba(239,68,68,0.2)]">
                            <div className="text-center mb-8">
                                <div className="inline-block p-4 rounded-full bg-red-500/10 text-red-500 mb-4 animate-pulse">
                                    <History size={36} />
                                </div>
                                <h3 className="text-xl font-black italic text-white uppercase tracking-widest">时间线修正请求</h3>
                                <p className="text-xs font-bold text-slate-400 mt-2">
                                    {/* 🔒 这里就是你要修复的防窥逻辑！ */}
                                    探测到 <span className="text-teal-400">{stealth ? '【机密目标】' : retroMed.name}</span> 严重超时。<br />
                                    您是刚刚执行了操作，还是为了补录错过的记录？
                                </p>
                            </div>
                            <div className="flex flex-col gap-4">
                                <button onClick={() => executeTakeMed(retroMed, new Date())} className="bg-slate-800 hover:bg-slate-700 text-white py-4 rounded-2xl font-black text-sm transition-all border border-slate-700">
                                    🕒 刚刚才吃 (按此刻时间记录)
                                </button>
                                <button onClick={confirmRetroactive} className="bg-red-500 hover:bg-red-600 text-white py-4 rounded-2xl font-black text-sm transition-all shadow-lg">
                                    ⚡ 量子回溯 (自动补录到完美时间点)
                                </button>
                            </div>
                        </div>
                    </div>
                )}
                {/* 这里才是原本文件的最后两个 </div> */}
            </div>
        </div>
    );
}
