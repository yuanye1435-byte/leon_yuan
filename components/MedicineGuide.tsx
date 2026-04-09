"use client";
import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import { Trash2, PlusCircle, Package, AlertTriangle, ShieldCheck, Skull, Search, Info } from 'lucide-react';

export default function MedicineGuide() {
  const [medName, setMedName] = useState('');
  const [dosage, setDosage] = useState(''); // 👈 新增：用法备注状态
  const [searchTerm, setSearchTerm] = useState(''); // 👈 新增：搜索状态
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

  // 过滤逻辑：根据搜索词筛选药品
  const filteredMeds = meds.filter(m => 
    m.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const calculateExpiry = (name: string) => {
    const today = new Date();
    if (name.includes('眼药水') || name.includes('滴眼液')) today.setDate(today.getDate() + 28);
    else if (name.includes('瓶')) today.setMonth(today.getMonth() + 6);
    else today.setFullYear(today.getFullYear() + 1);
    return today.toISOString().split('T')[0];
  };

  const handleAddMed = async () => {
    if (!medName) return alert('统帅，药名还没写呢！');
    setLoading(true);
    const expiryDate = calculateExpiry(medName);
    const { error } = await supabase
      .from('medicines')
      .insert([{ 
        name: medName, 
        expired_at: expiryDate,
        dosage: dosage, // 👈 存入用法备注
        category: medName.includes('眼药水') ? '液体' : '片剂'
      }]);

    if (error) alert('失败：' + error.message);
    else {
      setMedName('');
      setDosage('');
      fetchMeds();
    }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('确定扔掉吗？')) return;
    await supabase.from('medicines').delete().eq('id', id);
    fetchMeds();
  };

  const getStatus = (expiryDate: string) => {
    const today = new Date();
    today.setHours(0,0,0,0);
    const exp = new Date(expiryDate);
    const diffDays = Math.ceil((exp.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return { style: 'bg-red-50 border-red-200', text: 'text-red-600', icon: <Skull size={14} />, label: '已过期' };
    if (diffDays <= 30) return { style: 'bg-orange-50 border-orange-200', text: 'text-orange-600', icon: <AlertTriangle size={14} />, label: `剩 ${diffDays} 天` };
    return { style: 'bg-white border-slate-100 hover:shadow-lg', text: 'text-slate-800', icon: <ShieldCheck size={14} />, label: '安全' };
  };

  return (
    <div className="max-w-4xl mx-auto my-12 p-8 bg-slate-50 min-h-screen rounded-3xl shadow-2xl border border-slate-200">
      {/* 头部状态面板 */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 text-center">
          <div className="text-2xl font-black text-slate-800">{meds.length}</div>
          <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">总库存</div>
        </div>
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-orange-100 text-center">
          <div className="text-2xl font-black text-orange-500">
            {meds.filter(m => {
              const d = Math.ceil((new Date(m.expired_at).getTime() - new Date().getTime()) / 86400000);
              return d >= 0 && d <= 30;
            }).length}
          </div>
          <div className="text-[10px] text-orange-400 font-bold uppercase tracking-widest">即将过期</div>
        </div>
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-red-100 text-center">
          <div className="text-2xl font-black text-red-500">
            {meds.filter(m => new Date(m.expired_at) < new Date()).length}
          </div>
          <div className="text-[10px] text-red-400 font-bold uppercase tracking-widest">已失效</div>
        </div>
      </div>

      {/* 战术输入区 */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 mb-8">
        <div className="flex flex-col gap-4">
          <input 
            type="text" 
            value={medName}
            onChange={(e) => setMedName(e.target.value)}
            placeholder="💊 药品名称（如：布洛芬）"
            className="w-full p-4 rounded-xl bg-slate-50 border-none focus:ring-2 focus:ring-teal-500 outline-none transition-all text-lg font-bold"
          />
          <input 
            type="text" 
            value={dosage}
            onChange={(e) => setDosage(e.target.value)}
            placeholder="📝 用法说明（如：一日三次，一次一片，饭后）"
            className="w-full p-4 rounded-xl bg-slate-50 border-none focus:ring-2 focus:ring-teal-500 outline-none transition-all text-sm text-slate-600"
          />
          <button 
            onClick={handleAddMed}
            disabled={loading}
            className="w-full bg-slate-900 hover:bg-teal-600 text-white font-black py-4 rounded-xl transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
          >
            {loading ? '正在同步数据...' : <><PlusCircle size={20} /> 立即录入药箱</>}
          </button>
        </div>
      </div>

      {/* 智能搜索栏 */}
      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
        <input 
          type="text" 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="快速搜寻药品..."
          className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-teal-500 outline-none transition-all text-sm"
        />
      </div>

      {/* 列表区 */}
      <div className="space-y-3">
        {filteredMeds.map((med) => {
          const status = getStatus(med.expired_at);
          return (
            <div key={med.id} className={`group flex flex-col p-5 rounded-3xl transition-all border ${status.style}`}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${status.text.replace('text-', 'bg-')}`} />
                  <span className={`text-xl font-black ${status.text}`}>{med.name}</span>
                </div>
                <button onClick={() => handleDelete(med.id)} className="opacity-0 group-hover:opacity-100 p-2 text-slate-300 hover:text-red-500 transition-all">
                  <Trash2 size={18} />
                </button>
              </div>

              {med.dosage && (
                <div className="flex items-start gap-2 mb-4 p-3 bg-white/50 rounded-xl border border-slate-100/50">
                  <Info size={14} className="text-slate-400 mt-1 shrink-0" />
                  <p className="text-sm text-slate-600 leading-relaxed font-medium">{med.dosage}</p>
                </div>
              )}

              <div className="flex items-center justify-between border-t border-slate-100 pt-3">
                <span className="flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter bg-white border border-slate-100 shadow-sm">
                  {status.icon} {status.label}
                </span>
                <div className="text-right">
                  <div className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">有效期至</div>
                  <div className={`font-mono font-bold ${status.text}`}>{med.expired_at}</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}