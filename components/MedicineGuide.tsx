"use client";
import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import { Trash2, PlusCircle, Package, AlertTriangle, ShieldCheck, Skull, Search, Info, CheckCircle2, Clock } from 'lucide-react';

export default function MedicineGuide() {
  const [medName, setMedName] = useState('');
  const [dosage, setDosage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [meds, setMeds] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchMeds = async () => {
    const { data, error } = await supabase
      .from('medicines')
      .select('*')
      .order('expired_at', { ascending: true });
    if (error) console.error('取货失败:', error);
    else setMeds(data || []);
  };

  useEffect(() => { fetchMeds(); }, []);

  const filteredMeds = meds.filter(m => m.name.toLowerCase().includes(searchTerm.toLowerCase()));

  const handleAddMed = async () => {
    if (!medName) return alert('统帅，药名还没写呢！');
    setLoading(true);
    const today = new Date();
    let expiryDate = new Date();
    if (medName.includes('眼药水') || medName.includes('滴眼液')) expiryDate.setDate(today.getDate() + 28);
    else if (medName.includes('瓶')) expiryDate.setMonth(today.getMonth() + 6);
    else expiryDate.setFullYear(today.getFullYear() + 1);

    const { error } = await supabase.from('medicines').insert([{ 
      name: medName, 
      expired_at: expiryDate.toISOString().split('T')[0],
      dosage: dosage,
      category: medName.includes('眼药水') ? '液体' : '片剂'
    }]);

    if (!error) { setMedName(''); setDosage(''); fetchMeds(); }
    setLoading(false);
  };

  // 🚀 新增：服药打卡函数
  const handleTakeMed = async (id: string) => {
    const now = new Date().toISOString();
    const { error } = await supabase
      .from('medicines')
      .update({ last_taken_at: now })
      .eq('id', id);
    
    if (error) alert('打卡失败');
    else fetchMeds(); // 刷新显示最新时间
  };

  const handleDelete = async (id: string) => {
    if (confirm('确定扔掉吗？')) {
      await supabase.from('medicines').delete().eq('id', id);
      fetchMeds();
    }
  };

  // 计算距离上次服药多久了
  const getTimeSinceLastTaken = (lastTaken: string) => {
    if (!lastTaken) return '从未服药';
    const last = new Date(lastTaken);
    const now = new Date();
    const diffMs = now.getTime() - last.getTime();
    const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    if (diffHrs > 24) return `${Math.floor(diffHrs / 24)} 天前`;
    if (diffHrs > 0) return `${diffHrs} 小时 ${diffMins} 分钟前`;
    return `${diffMins} 分钟前`;
  };

  const getStatus = (expiryDate: string) => {
    const today = new Date();
    today.setHours(0,0,0,0);
    const exp = new Date(expiryDate);
    const diffDays = Math.ceil((exp.getTime() - today.getTime()) / 86400000);
    if (diffDays < 0) return { style: 'bg-red-50 border-red-200', text: 'text-red-600', icon: <Skull size={14} />, label: '已过期' };
    if (diffDays <= 30) return { style: 'bg-orange-50 border-orange-200', text: 'text-orange-600', icon: <AlertTriangle size={14} />, label: `剩 ${diffDays} 天` };
    return { style: 'bg-white border-slate-100 hover:shadow-xl', text: 'text-slate-800', icon: <ShieldCheck size={14} />, label: '安全' };
  };

  return (
    <div className="max-w-4xl mx-auto my-12 p-8 bg-slate-50 min-h-screen rounded-3xl shadow-2xl border border-slate-200 font-sans">
      <div className="text-center mb-10">
        <h2 className="text-4xl font-black text-slate-900 mb-2 tracking-tight">LEON PULSE</h2>
        <div className="flex justify-center gap-2">
          <span className="bg-slate-900 text-white text-[10px] px-2 py-0.5 rounded uppercase font-bold tracking-widest">Medical Hub</span>
          <span className="bg-teal-500 text-white text-[10px] px-2 py-0.5 rounded uppercase font-bold tracking-widest">Smart Core</span>
        </div>
      </div>

      {/* 录入面板 */}
      <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 mb-8">
        <div className="space-y-4">
          <input value={medName} onChange={(e)=>setMedName(e.target.value)} placeholder="药品名称..." className="w-full p-4 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-teal-500 outline-none font-bold text-lg text-slate-800" />
          <input value={dosage} onChange={(e)=>setDosage(e.target.value)} placeholder="用法说明..." className="w-full p-4 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-teal-500 outline-none text-sm text-slate-500" />
          <button onClick={handleAddMed} disabled={loading} className="w-full bg-slate-900 hover:bg-teal-600 text-white font-black py-4 rounded-2xl transition-all flex items-center justify-center gap-2">
            {loading ? 'SYNCING...' : <><PlusCircle size={20} /> 添加到我的库存</>}
          </button>
        </div>
      </div>

      <div className="relative mb-8">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
        <input value={searchTerm} onChange={(e)=>setSearchTerm(e.target.value)} placeholder="搜索药品清单..." className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-teal-500" />
      </div>

      {/* 列表 */}
      <div className="grid grid-cols-1 gap-4">
        {filteredMeds.map((med) => {
          const status = getStatus(med.expired_at);
          return (
            <div key={med.id} className={`group relative flex flex-col p-6 rounded-[2rem] transition-all border-2 ${status.style}`}>
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h4 className={`text-2xl font-black ${status.text}`}>{med.name}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2 py-0.5 bg-slate-100 rounded-md">{med.category}</span>
                    <span className={`flex items-center gap-1 text-[10px] font-bold uppercase ${status.text}`}>{status.icon} {status.label}</span>
                  </div>
                </div>
                <button onClick={() => handleDelete(med.id)} className="p-2 text-slate-200 hover:text-red-500 transition-colors"><Trash2 size={20} /></button>
              </div>

              {med.dosage && (
                <div className="mb-6 p-4 bg-slate-50/50 rounded-2xl text-sm text-slate-600 border border-slate-100 italic">
                   “{med.dosage}”
                </div>
              )}

              <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-100/50">
                <div className="flex flex-col">
                  <span className="text-[9px] text-slate-400 font-bold uppercase mb-1">上次服药</span>
                  <div className="flex items-center gap-1 text-slate-700 font-bold text-sm">
                    <Clock size={14} className="text-teal-500" /> {getTimeSinceLastTaken(med.last_taken_at)}
                  </div>
                </div>
                
                <button 
                  onClick={() => handleTakeMed(med.id)}
                  className="bg-slate-900 hover:bg-teal-500 text-white px-6 py-3 rounded-xl font-bold text-xs flex items-center gap-2 transition-all active:scale-95 shadow-lg shadow-slate-200"
                >
                  <CheckCircle2 size={16} /> 刚才吃过了
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}