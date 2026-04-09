"use client";
import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import { Trash2, PlusCircle, Package, AlertTriangle, ShieldCheck, Skull, Activity, CheckCircle2, Clock, Settings2 } from 'lucide-react';

export default function MedicineGuide() {
  const [medName, setMedName] = useState('');
  const [stockAmount, setStockAmount] = useState('20');
  const [timesPerDay, setTimesPerDay] = useState('3');
  const [dosePerTime, setDosePerTime] = useState('1');
  const [unit, setUnit] = useState('粒'); // 👈 新增：自定义单位状态
  const [meds, setMeds] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    const { data: m } = await supabase.from('medicines').select('*').order('expired_at', { ascending: true });
    const { data: l } = await supabase.from('medicine_logs').select('*').order('taken_at', { ascending: false }).limit(6);
    setMeds(m || []);
    setLogs(l || []);
  };

  useEffect(() => { fetchData(); }, []);

  const handleAddMed = async () => {
    if (!medName) return alert('统帅，药名还没写！');
    setLoading(true);
    const { error } = await supabase.from('medicines').insert([{ 
      name: medName, 
      expired_at: new Date(Date.now() + 31536000000).toISOString().split('T')[0],
      stock_amount: parseFloat(stockAmount),
      times_per_day: parseInt(timesPerDay),
      dose_per_time: parseFloat(dosePerTime),
      unit: unit, // 👈 存入自定义单位
      category: '补给品'
    }]);
    if (!error) { setMedName(''); fetchData(); }
    setLoading(false);
  };

  const handleTakeMed = async (med: any) => {
    if (med.stock_amount < med.dose_per_time) {
      return alert(`余量不足！当前仅剩 ${med.stock_amount}${med.unit}`);
    }
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
    if (diffDays < 0) return { color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200', label: '已过期' };
    if (stock < (dose * 3)) return { color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-200', label: '余量低' };
    return { color: 'text-teal-600', bg: 'bg-white', border: 'border-slate-100', label: '正常' };
  };

  return (
    <div className="max-w-5xl mx-auto my-6 p-4 md:p-6 bg-[#f8fafc] min-h-screen rounded-[2.5rem] shadow-2xl font-sans text-slate-900">
      {/* 标题 */}
      <div className="mb-8 ml-4">
        <h1 className="text-5xl font-black italic tracking-tighter">LEON PULSE<span className="text-teal-500">.</span></h1>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.5em]">Universal Medical Logic</p>
      </div>

      {/* 战术控制台 */}
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
            <input value={unit} onChange={(e)=>setUnit(e.target.value)} placeholder="粒/ml" className="w-full bg-transparent border-none outline-none font-bold text-teal-600 placeholder:text-slate-300" />
          </div>
          <div className="flex bg-slate-50 rounded-xl p-2 items-center">
            <span className="text-[9px] font-black px-2 text-slate-400">频次/日</span>
            <input type="number" value={timesPerDay} onChange={(e)=>setTimesPerDay(e.target.value)} className="w-full bg-transparent border-none outline-none font-bold" />
          </div>
        </div>
        <button onClick={handleAddMed} className="w-full bg-slate-900 hover:bg-teal-500 text-white font-black py-4 rounded-xl transition-all active:scale-[0.98] shadow-lg">部署新药剂 ➔</button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {meds.map((med) => {
            const st = getStatus(med.expired_at, med.stock_amount, med.dose_per_time);
            return (
              <div key={med.id} className={`p-6 rounded-[2rem] border-2 transition-all group ${st.bg} ${st.border}`}>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className={`text-2xl font-black ${st.color}`}>{med.name}</h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase mt-1 tracking-widest">
                      每日 {med.times_per_day} 次 · 每次 {med.dose_per_time} {med.unit}
                    </p>
                  </div>
                  <button onClick={()=>supabase.from('medicines').delete().eq('id', med.id).then(fetchData)} className="opacity-0 group-hover:opacity-100 text-slate-300 hover:text-red-500 transition-all">
                    <Trash2 size={18} />
                  </button>
                </div>

                <div className="flex items-center justify-between gap-6">
                  <div className="flex-1">
                    <div className="flex justify-between text-[9px] font-black text-slate-400 mb-1">
                      <span>{st.label}</span>
                      <span>{med.stock_amount} {med.unit}</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div className={`h-full transition-all duration-700 ${st.color.replace('text-', 'bg-')}`} style={{ width: `${Math.min((med.stock_amount / (med.dose_per_time * 10)) * 100, 100)}%` }} />
                    </div>
                  </div>
                  <button 
                    onClick={() => handleTakeMed(med)}
                    className="bg-slate-900 text-white px-5 py-3 rounded-xl font-black text-[10px] hover:bg-teal-500 active:scale-90 transition-all shadow-md flex items-center gap-2 whitespace-nowrap"
                  >
                    服用 {med.dose_per_time} {med.unit} {/* 👈 动态按钮文字 */}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* 简洁日志 */}
        <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100">
          <h2 className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em] mb-6 flex items-center gap-2">
            <Clock size={14}/> Recent Logs
          </h2>
          <div className="space-y-4">
            {logs.map((log) => (
              <div key={log.id} className="flex items-center gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-teal-400" />
                <div className="flex-1">
                  <p className="text-xs font-bold text-slate-700">{log.medicine_name}</p>
                  <p className="text-[9px] text-slate-400 font-medium">
                    {new Date(log.taken_at).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}
                  </p>
                </div>
                <CheckCircle2 size={12} className="text-slate-200" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}