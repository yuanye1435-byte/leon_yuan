"use client";
import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import { Trash2, PlusCircle, Package, AlertTriangle, ShieldCheck, Skull, Activity, CheckCircle2, Clock, Target, ShoppingCart } from 'lucide-react';

export default function MedicineGuide() {
  const [medName, setMedName] = useState('');
  const [stockAmount, setStockAmount] = useState('20');
  const [timesPerDay, setTimesPerDay] = useState('3');
  const [dosePerTime, setDosePerTime] = useState('1');
  const [unit, setUnit] = useState('粒');
  const [meds, setMeds] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    const { data: m } = await supabase.from('medicines').select('*').order('expired_at', { ascending: true });
    // 抓取更多日志用于计算今日进度
    const { data: l } = await supabase.from('medicine_logs').select('*').order('taken_at', { ascending: false }).limit(50);
    setMeds(m || []);
    setLogs(l || []);
  };

  useEffect(() => { fetchData(); }, []);

  const handleAddMed = async () => {
    if (!medName) return alert('统帅，总得给个名字吧！');
    setLoading(true);
    const { error } = await supabase.from('medicines').insert([{ 
      name: medName, 
      expired_at: new Date(Date.now() + 31536000000).toISOString().split('T')[0],
      stock_amount: parseFloat(stockAmount),
      times_per_day: parseInt(timesPerDay),
      dose_per_time: parseFloat(dosePerTime),
      unit: unit,
      category: '战术补给'
    }]);
    if (!error) { setMedName(''); fetchData(); }
    setLoading(false);
  };

  const handleTakeMed = async (med: any) => {
    if (med.stock_amount < med.dose_per_time) return alert(`余量不足！请先呼叫补给！`);
    
    const now = new Date().toISOString();
    await supabase.from('medicines').update({ 
      last_taken_at: now, 
      stock_amount: med.stock_amount - med.dose_per_time 
    }).eq('id', med.id);
    
    await supabase.from('medicine_logs').insert([{ medicine_id: med.id, medicine_name: med.name }]);
    fetchData();
  };

  const getStatus = (expiryDate: string, stock: number, dose: number) => {
    const diffDays = Math.ceil((new Date(expiryDate).getTime() - new Date().getTime()) / 86400000);
    if (diffDays < 0) return { color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200', label: '已过期', isWarning: true };
    if (stock < (dose * 3)) return { color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-200', label: '急需补给', isWarning: true };
    return { color: 'text-teal-600', bg: 'bg-white', border: 'border-slate-100', label: '库存充足', isWarning: false };
  };

  // 🧠 核心算法：计算今日已服药次数
  const getTodayProgress = (medId: string) => {
    const todayStr = new Date().toDateString();
    const todayLogs = logs.filter(log => 
      log.medicine_id === medId && 
      new Date(log.taken_at).toDateString() === todayStr
    );
    return todayLogs.length;
  };

  return (
    <div className="max-w-5xl mx-auto my-6 p-4 md:p-6 bg-[#f1f5f9] min-h-screen rounded-[2.5rem] shadow-2xl font-sans">
      <div className="mb-10 flex justify-between items-end">
        <div>
          <h1 className="text-5xl font-black italic tracking-tighter text-slate-900">LEON PULSE<span className="text-teal-500">.</span></h1>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.5em] mt-1">Daily Mission Control</p>
        </div>
      </div>

      <div className="bg-white p-6 md:p-8 rounded-[2rem] shadow-xl mb-10 border border-white">
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 左侧主要面板 */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-2 ml-2">
            <Target size={16}/> 今日执行面板
          </h2>
          {meds.map((med) => {
            const st = getStatus(med.expired_at, med.stock_amount, med.dose_per_time);
            const todayCount = getTodayProgress(med.id);
            const isCompleted = todayCount >= med.times_per_day; // 今日任务是否完成

            return (
              <div key={med.id} className={`p-6 rounded-[2rem] border-2 transition-all ${st.bg} ${st.border}`}>
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className={`text-2xl font-black ${st.color} flex items-center gap-2`}>
                      {med.name} 
                      {isCompleted && <CheckCircle2 size={20} className="text-emerald-500" />}
                    </h3>
                    
                    {/* 🚀 今日进度条指示器 */}
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
                    <span className="text-[10px] font-black text-slate-400 mb-1 uppercase tracking-widest">
                      余量: <span className={st.color}>{med.stock_amount} {med.unit}</span>
                    </span>
                    
                    {/* 🚀 一键补给呼叫 (当触发警告时显示) */}
                    {st.isWarning && (
                      <a href={`https://search.jd.com/Search?keyword=${med.name}`} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-[10px] font-black text-orange-500 hover:text-orange-600 bg-orange-100 px-2 py-1 rounded-md transition-all">
                        <ShoppingCart size={12}/> 呼叫一键补货
                      </a>
                    )}
                  </div>
                  
                  {/* 智能按钮 */}
                  {isCompleted ? (
                     <div className="bg-emerald-50 text-emerald-600 px-6 py-3 rounded-xl font-black text-[10px] flex items-center gap-2 border border-emerald-200">
                       <ShieldCheck size={16} /> 今日已达标
                     </div>
                  ) : (
                    <button 
                      onClick={() => handleTakeMed(med)}
                      className="bg-slate-900 text-white px-6 py-3 rounded-xl font-black text-[10px] hover:bg-teal-500 active:scale-95 transition-all shadow-md flex items-center gap-2"
                    >
                      服用 {med.dose_per_time} {med.unit}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* 右侧日志流 */}
        <div className="space-y-4">
           <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-2 ml-2">
            <Activity size={16}/> 实时流水
          </h2>
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