"use client";
import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import { Trash2, PlusCircle, Package, AlertTriangle, ShieldCheck, Skull, Search, Info, CheckCircle2, Clock, BatteryMedium, Inbox } from 'lucide-react';

export default function MedicineGuide() {
  const [medName, setMedName] = useState('');
  const [dosage, setDosage] = useState('');
  const [stockAmount, setStockAmount] = useState('10'); // 👈 默认10片
  const [searchTerm, setSearchTerm] = useState('');
  const [meds, setMeds] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchMeds = async () => {
    const { data, error } = await supabase.from('medicines').select('*').order('expired_at', { ascending: true });
    if (!error) setMeds(data || []);
  };

  useEffect(() => { fetchMeds(); }, []);

  const handleAddMed = async () => {
    if (!medName) return alert('药名还没写呢！');
    setLoading(true);
    const today = new Date();
    let expiryDate = new Date();
    if (medName.includes('眼药水')) expiryDate.setDate(today.getDate() + 28);
    else expiryDate.setFullYear(today.getFullYear() + 1);

    const { error } = await supabase.from('medicines').insert([{ 
      name: medName, 
      expired_at: expiryDate.toISOString().split('T')[0],
      dosage: dosage,
      stock_amount: parseInt(stockAmount), // 存入初始库存
      category: medName.includes('眼药水') ? '液体' : '片剂'
    }]);

    if (!error) { setMedName(''); setDosage(''); setStockAmount('10'); fetchMeds(); }
    setLoading(false);
  };

  // 🚀 核心升级：打卡即扣库存
  const handleTakeMed = async (med: any) => {
    if (med.stock_amount <= 0) return alert('这药已经空仓了！请尽快补充！');
    
    const now = new Date().toISOString();
    const { error } = await supabase
      .from('medicines')
      .update({ 
        last_taken_at: now,
        stock_amount: med.stock_amount - 1 // 👈 自动减1
      })
      .eq('id', med.id);
    
    if (!error) fetchMeds();
  };

  const getStatus = (expiryDate: string, stock: number) => {
    const today = new Date(); today.setHours(0,0,0,0);
    const diffDays = Math.ceil((new Date(expiryDate).getTime() - today.getTime()) / 86400000);
    
    if (stock <= 3) return { color: 'text-rose-600', bg: 'bg-rose-50', border: 'border-rose-200', label: '库存告急' };
    if (diffDays < 0) return { color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200', label: '已过期' };
    if (diffDays <= 30) return { color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-200', label: '临期预警' };
    return { color: 'text-emerald-600', bg: 'bg-white', border: 'border-slate-100', label: '状态良好' };
  };

  return (
    <div className="max-w-4xl mx-auto my-12 p-6 md:p-10 bg-[#f8fafc] min-h-screen rounded-[3rem] shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-white">
      {/* 状态总览 */}
      <div className="flex justify-between items-end mb-10">
        <div>
          <h1 className="text-5xl font-black text-slate-900 tracking-tighter italic">PULSE.</h1>
          <p className="text-slate-400 font-bold text-xs mt-1 uppercase tracking-[0.2em]">Leon Pulse Intelligence</p>
        </div>
        <div className="flex gap-2">
          <div className="bg-white px-4 py-2 rounded-2xl shadow-sm border border-slate-100">
            <span className="block text-[9px] text-slate-400 font-bold uppercase tracking-widest">Active Meds</span>
            <span className="text-xl font-black text-slate-800">{meds.length}</span>
          </div>
        </div>
      </div>

      {/* 录入区：更紧凑的 UI */}
      <div className="bg-white p-6 rounded-[2.5rem] shadow-xl shadow-slate-200/50 mb-10 border border-slate-50">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <input value={medName} onChange={(e)=>setMedName(e.target.value)} placeholder="药品名称" className="p-4 rounded-2xl bg-slate-50 border-none outline-none focus:ring-2 focus:ring-emerald-400 font-bold" />
          <input value={stockAmount} type="number" onChange={(e)=>setStockAmount(e.target.value)} placeholder="初始粒数" className="p-4 rounded-2xl bg-slate-50 border-none outline-none focus:ring-2 focus:ring-emerald-400 font-bold" />
        </div>
        <input value={dosage} onChange={(e)=>setDosage(e.target.value)} placeholder="用法备注（如：早晚各一粒）" className="w-full p-4 rounded-2xl bg-slate-50 border-none outline-none focus:ring-2 focus:ring-emerald-400 text-sm mb-4" />
        <button onClick={handleAddMed} className="w-full bg-slate-900 hover:bg-emerald-500 text-white font-black py-4 rounded-2xl transition-all shadow-lg shadow-slate-200 active:scale-95">确认入库 ➔</button>
      </div>

      {/* 列表渲染 */}
      <div className="space-y-6">
        {meds.filter(m => m.name.toLowerCase().includes(searchTerm.toLowerCase())).map((med) => {
          const st = getStatus(med.expired_at, med.stock_amount);
          const stockPercent = Math.min((med.stock_amount / 20) * 100, 100); // 假设20片满格

          return (
            <div key={med.id} className={`group relative p-6 rounded-[2.5rem] transition-all border-2 ${st.bg} ${st.border}`}>
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-4">
                  <div className={`p-4 rounded-2xl ${st.color.replace('text-', 'bg-').replace('600', '100')} ${st.color}`}>
                    <Package size={24} />
                  </div>
                  <div>
                    <h3 className={`text-2xl font-black tracking-tight ${st.color}`}>{med.name}</h3>
                    <p className="text-xs text-slate-400 font-medium">EXP: {med.expired_at}</p>
                  </div>
                </div>
                <button onClick={()=>supabase.from('medicines').delete().eq('id', med.id).then(fetchMeds)} className="opacity-0 group-hover:opacity-100 p-2 text-slate-300 hover:text-red-500 transition-all"><Trash2 size={18} /></button>
              </div>

              {/* 🔋 库存进度条 */}
              <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[10px] font-black text-slate-400 uppercase flex items-center gap-1"><BatteryMedium size={12}/> 库存余量</span>
                  <span className={`text-sm font-black ${st.color}`}>{med.stock_amount} 粒</span>
                </div>
                <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div className={`h-full transition-all duration-500 ${st.color.replace('text-', 'bg-')}`} style={{ width: `${(med.stock_amount / 20) * 100}%` }} />
                </div>
              </div>

              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-slate-500">
                  <Clock size={14} />
                  <span className="text-xs font-bold uppercase tracking-tighter">
                    {med.last_taken_at ? '上次服药：' + new Date(med.last_taken_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '今日未服'}
                  </span>
                </div>
                <button 
                  onClick={() => handleTakeMed(med)}
                  className="bg-white border-2 border-slate-900 hover:bg-slate-900 hover:text-white px-6 py-3 rounded-2xl font-black text-xs transition-all active:scale-95 shadow-md flex items-center gap-2"
                >
                  <CheckCircle2 size={16} /> 服用 1 粒
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}