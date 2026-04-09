"use client";
import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from './supabaseClient';
import { 
  Trash2, Activity, CheckCircle2, Clock, Target, 
  ShoppingCart, Flame, BarChart3, HeartPulse, 
  LogOut, KeyRound, User, ShieldCheck, 
  Skull, AlertTriangle, Package 
} from 'lucide-react';

export default function MedicineGuide() {
  // 🔐 身份验证状态
  const [session, setSession] = useState<any>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);

  // 📦 核心数据状态
  const [medName, setMedName] = useState('');
  const [stockAmount, setStockAmount] = useState('20');
  const [timesPerDay, setTimesPerDay] = useState('3');
  const [dosePerTime, setDosePerTime] = useState('1');
  const [unit, setUnit] = useState('粒');
  const [meds, setMeds] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // 📡 监听登录状态
// 🔐 1. 监听登录状态 + 注册赛博守卫 (只在启动时运行一次)
  useEffect(() => {
    // 原有的登录逻辑
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    // 🚀 核心：在这里注册 Service Worker
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', function() {
        navigator.serviceWorker.register('/sw.js').then(function(reg) {
          console.log('✅ 守卫已就位:', reg.scope);
        }).catch(function(err) {
          console.log('❌ 守卫罢工:', err);
        });
      });
    }

    return () => subscription.unsubscribe();
  }, []); // 👈 这里的空括号保证它只运行一次

  // 📡 只有登录了才去拉取属于自己的数据
  useEffect(() => {
    if (session) fetchData();
  }, [session]);

  const fetchData = async () => {
    const { data: m } = await supabase.from('medicines').select('*').order('expired_at', { ascending: true });
    const { data: l } = await supabase.from('medicine_logs').select('*').order('taken_at', { ascending: false }).limit(100);
    setMeds(m || []);
    setLogs(l || []);
  };

  // 🔐 登录/注册逻辑
  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    if (isSignUp) {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) alert(error.message);
      else alert('注册成功！赛博特工已就位！');
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) alert('登录失败：' + error.message);
    }
    setAuthLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setMeds([]); setLogs([]);
  };

  const handleAddMed = async () => {
    if (!medName) return alert('药名不可为空！');
    setLoading(true);
    const { error } = await supabase.from('medicines').insert([{ 
      name: medName, 
      expired_at: new Date(Date.now() + 31536000000).toISOString().split('T')[0],
      stock_amount: parseFloat(stockAmount),
      times_per_day: parseInt(timesPerDay),
      dose_per_time: parseFloat(dosePerTime),
      unit: unit,
      user_id: session.user.id // 👈 打上主人的烙印
    }]);
    if (!error) { setMedName(''); fetchData(); }
    setLoading(false);
  };

  const handleTakeMed = async (med: any) => {
    if (med.stock_amount < med.dose_per_time) return alert(`余量不足！请先呼叫补给！`);
    const now = new Date().toISOString();
    await supabase.from('medicines').update({ last_taken_at: now, stock_amount: med.stock_amount - med.dose_per_time }).eq('id', med.id);
    await supabase.from('medicine_logs').insert([{ medicine_id: med.id, medicine_name: med.name, user_id: session.user.id }]); // 👈 日志也打上烙印
    fetchData();
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
    return Array.from({length: 7}).map((_, i) => {
      const d = new Date(); d.setDate(d.getDate() - (6 - i));
      const dateStr = d.toISOString().split('T')[0];
      const count = logs.filter(l => l.taken_at.startsWith(dateStr)).length;
      return { date: dateStr, count, day: d.toLocaleDateString('en-US', { weekday: 'short' }) };
    });
  }, [logs]);

  const getStatus = (expiryDate: string, stock: number, dose: number) => {
    const diffDays = Math.ceil((new Date(expiryDate).getTime() - new Date().getTime()) / 86400000);
    if (diffDays < 0) return { color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200', isWarning: true };
    if (stock < (dose * 3)) return { color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-200', isWarning: true };
    return { color: 'text-teal-600', bg: 'bg-white', border: 'border-slate-100', isWarning: false };
  };
  const getTodayProgress = (medId: string) => logs.filter(log => log.medicine_id === medId && new Date(log.taken_at).toDateString() === new Date().toDateString()).length;

  // 🛡️ 如果未登录，展示“安检大门”
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
              <input type="email" value={email} onChange={e=>setEmail(e.target.value)} required placeholder="指挥官邮箱 (Email)" className="w-full pl-12 pr-4 py-4 rounded-2xl bg-slate-50 border-none outline-none focus:ring-2 focus:ring-teal-400 font-bold" />
            </div>
            <div className="relative">
              <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input type="password" value={password} onChange={e=>setPassword(e.target.value)} required placeholder="安全密钥 (Password)" className="w-full pl-12 pr-4 py-4 rounded-2xl bg-slate-50 border-none outline-none focus:ring-2 focus:ring-teal-400 font-bold" />
            </div>
            <button type="submit" disabled={authLoading} className="w-full bg-slate-900 hover:bg-teal-500 text-white font-black py-4 rounded-2xl transition-all shadow-lg active:scale-95 mt-4">
              {authLoading ? '验证中...' : (isSignUp ? '注册新坐标' : '接入主控制台 ➔')}
            </button>
          </form>
          <div className="text-center mt-6">
            <button onClick={() => setIsSignUp(!isSignUp)} className="text-xs font-bold text-slate-400 hover:text-teal-500 transition-colors">
              {isSignUp ? '已有通行证？立即接入' : '没有通行证？申请注册'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 🚀 如果已登录，展示指挥控制台
  return (
    <div className="max-w-6xl mx-auto my-6 p-4 md:p-8 bg-[#f1f5f9] min-h-screen rounded-[2.5rem] shadow-2xl font-sans relative">
      
      {/* 登出按钮 */}
      <button onClick={handleLogout} className="absolute top-8 right-8 text-slate-400 hover:text-red-500 flex items-center gap-2 text-[10px] font-black uppercase transition-all">
        <LogOut size={14} /> 断开连接
      </button>

      {/* 战术指挥舱 */}
      <div className="mb-10 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-3 flex justify-between items-end mb-2">
          <div>
            <h1 className="text-5xl font-black italic tracking-tighter text-slate-900">LEON PULSE<span className="text-teal-500">.</span></h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.5em] mt-1">
               Operator: <span className="text-teal-500">{session.user.email}</span>
            </p>
          </div>
        </div>

        {/* 卡片保留 */}
        <div className="bg-slate-900 rounded-[2rem] p-6 shadow-xl text-white relative overflow-hidden flex flex-col justify-between">
          <div className="absolute -right-10 -top-10 opacity-10"><HeartPulse size={120} /></div>
          <div className="flex items-center gap-2 text-slate-400 mb-4 text-xs font-bold uppercase tracking-widest"><Activity size={16}/> 核心运转率</div>
          <div>
            <div className="text-6xl font-black italic tracking-tighter text-teal-400">{meds.length === 0 ? '0' : Math.min(100, Math.round((logs.length / (meds.length * 3 * 7)) * 100))}%</div>
          </div>
        </div>
        <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100 flex flex-col justify-between">
          <div className="flex items-center gap-2 text-slate-400 mb-4 text-xs font-bold uppercase tracking-widest"><Flame size={16} className="text-orange-500"/> 战术连胜</div>
          <div className="flex items-end gap-3">
            <div className="text-6xl font-black italic tracking-tighter text-slate-800">{currentStreak}</div>
            <div className="text-sm font-bold text-slate-400 mb-2">DAYS</div>
          </div>
        </div>
        <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100">
          <div className="flex items-center gap-2 text-slate-400 mb-4 text-xs font-bold uppercase tracking-widest"><BarChart3 size={16} className="text-teal-500"/> 行动热力矩阵</div>
          <div className="flex gap-2 h-16 items-end justify-between">
            {last7DaysHeatmap.map((day, i) => {
              let bg = 'bg-slate-100';
              if (day.count > 0) bg = 'bg-teal-200';
              if (day.count > 2) bg = 'bg-teal-400';
              if (day.count > 4) bg = 'bg-teal-600';
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

      {/* 录入区 */}
      <div className="bg-white p-6 rounded-[2rem] shadow-sm mb-10 border border-slate-100">
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-4">
          <input value={medName} onChange={(e)=>setMedName(e.target.value)} placeholder="药品名" className="col-span-2 lg:col-span-1 p-4 rounded-xl bg-slate-50 border-none outline-none focus:ring-2 focus:ring-teal-400 font-bold" />
          <div className="flex bg-slate-50 rounded-xl p-2 items-center">
            <span className="text-[9px] font-black px-2 text-slate-400">总量</span>
            <input type="number" value={stockAmount} onChange={(e)=>setStockAmount(e.target.value)} className="w-full bg-transparent border-none outline-none font-bold" />
          </div>
          <div className="flex bg-slate-50 rounded-xl p-2 items-center">
            <span className="text-[9px] font-black px-2 text-slate-400">剂量</span>
            <input type="number" value={dosePerTime} onChange={(e)=>setDosePerTime(e.target.value)} className="w-full bg-transparent border-none outline-none font-bold" />
          </div>
          <div className="flex bg-slate-50 rounded-xl p-2 items-center">
            <span className="text-[9px] font-black px-2 text-slate-400">单位</span>
            <input value={unit} onChange={(e)=>setUnit(e.target.value)} className="w-full bg-transparent border-none outline-none font-bold text-teal-600" />
          </div>
          <div className="flex bg-slate-50 rounded-xl p-2 items-center">
            <span className="text-[9px] font-black px-2 text-slate-400">频次/日</span>
            <input type="number" value={timesPerDay} onChange={(e)=>setTimesPerDay(e.target.value)} className="w-full bg-transparent border-none outline-none font-bold" />
          </div>
        </div>
        <button onClick={handleAddMed} className="w-full bg-slate-900 hover:bg-teal-500 text-white font-black py-4 rounded-xl transition-all active:scale-[0.98]">添加战术目标 ➔</button>
      </div>

      {/* 列表与日志 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-2 ml-2"><Target size={16}/> 今日执行面板</h2>
          {meds.map((med) => {
            const st = getStatus(med.expired_at, med.stock_amount, med.dose_per_time);
            const todayCount = getTodayProgress(med.id);
            const isCompleted = todayCount >= med.times_per_day;

            return (
              <div key={med.id} className={`p-6 rounded-[2rem] border-2 transition-all ${st.bg} ${st.border}`}>
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className={`text-2xl font-black ${st.color} flex items-center gap-2`}>{med.name} {isCompleted && <CheckCircle2 size={20} className="text-emerald-500" />}</h3>
                    <div className="mt-3">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">今日进度 {todayCount}/{med.times_per_day}</span>
                      <div className="flex gap-1.5 w-48">
                        {Array.from({ length: med.times_per_day }).map((_, i) => (
                          <div key={i} className={`h-2 flex-1 rounded-sm transition-all duration-500 ${i < todayCount ? 'bg-teal-500 shadow-[0_0_8px_rgba(20,184,166,0.6)]' : 'bg-slate-200'}`} />
                        ))}
                      </div>
                    </div>
                  </div>
                  <button onClick={()=>supabase.from('medicines').delete().eq('id', med.id).then(fetchData)} className="text-slate-300 hover:text-red-500 transition-all"><Trash2 size={18} /></button>
                </div>
                <div className="flex items-center justify-between gap-4 border-t border-slate-100/50 pt-4">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black text-slate-400 mb-1 uppercase tracking-widest">余量: <span className={st.color}>{med.stock_amount} {med.unit}</span></span>
                    {st.isWarning && (
                      <a href={`https://search.jd.com/Search?keyword=${med.name}`} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-[10px] font-black text-orange-500 hover:text-orange-600 bg-orange-100 px-2 py-1 rounded-md transition-all">
                        <ShoppingCart size={12}/> 呼叫一键补货
                      </a>
                    )}
                  </div>
                  {isCompleted ? (
                     <div className="bg-emerald-50 text-emerald-600 px-6 py-3 rounded-xl font-black text-[10px] flex items-center gap-2 border border-emerald-200"><ShieldCheck size={16} /> 今日已达标</div>
                  ) : (
                    <button onClick={() => handleTakeMed(med)} className="bg-slate-900 text-white px-6 py-3 rounded-xl font-black text-[10px] hover:bg-teal-500 active:scale-95 transition-all shadow-md flex items-center gap-2">服用 {med.dose_per_time} {med.unit}</button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="space-y-4">
           <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-2 ml-2"><Clock size={16}/> 实时流水</h2>
          <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100 min-h-[400px]">
            <div className="space-y-5">
              {logs.slice(0, 8).map((log) => (
                <div key={log.id} className="flex items-start gap-3 border-b border-slate-50 pb-3">
                  <div className="w-2 h-2 mt-1.5 rounded-full bg-teal-400 shadow-[0_0_5px_rgba(20,184,166,0.5)]" />
                  <div className="flex-1">
                    <p className="text-xs font-black text-slate-800">{log.medicine_name}</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">
                      {new Date(log.taken_at).toLocaleString([], {month:'short', day:'numeric', hour:'2-digit', minute:'2-digit'})}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}