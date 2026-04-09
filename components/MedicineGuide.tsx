"use client";
import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import { Trash2, PlusCircle, Package } from 'lucide-react';

export default function MedicineGuide() {
  const [medName, setMedName] = useState('');
  const [meds, setMeds] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchMeds = async () => {
    const { data, error } = await supabase
      .from('medicines')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) console.error('取货失败:', error);
    else setMeds(data || []);
  };

  useEffect(() => {
    fetchMeds();
  }, []);

  const calculateExpiry = (name: string) => {
    const today = new Date();
    if (name.includes('眼药水') || name.includes('滴眼液')) {
      today.setDate(today.getDate() + 28);
    } else if (name.includes('瓶')) {
      today.setMonth(today.getMonth() + 6);
    } else {
      today.setFullYear(today.getFullYear() + 1);
    }
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
        category: medName.includes('眼药水') ? '液体' : '片剂'
      }]);

    if (error) alert('存入失败：' + error.message);
    else {
      setMedName('');
      fetchMeds();
    }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('确定要扔掉这个药品吗？')) return;
    const { error } = await supabase.from('medicines').delete().eq('id', id);
    if (error) alert('删除失败');
    else fetchMeds();
  };

  return (
    <div className="max-w-4xl mx-auto my-12 p-8 bg-white rounded-3xl shadow-2xl border border-slate-100">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-extrabold text-slate-900 mb-2 flex justify-center items-center gap-2">
          <Package className="text-teal-500" /> 莱昂脉冲 · 智能药箱
        </h2>
        <p className="text-slate-500 text-sm">云端实时同步 · 智能到期提醒</p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-12">
        <input 
          type="text" 
          value={medName}
          onChange={(e) => setMedName(e.target.value)}
          placeholder="输入药品名称（如：左氧氟沙星滴眼液）"
          className="flex-1 p-4 rounded-xl border-2 border-slate-100 focus:border-teal-500 outline-none transition-all text-slate-800"
        />
        <button 
          onClick={handleAddMed}
          disabled={loading}
          className="bg-slate-900 hover:bg-teal-600 text-white font-bold py-4 px-8 rounded-xl transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
        >
          {loading ? '同步中...' : <><PlusCircle size={20} /> 确认入库</>}
        </button>
      </div>

      <div className="space-y-4">
        <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
          📦 我的库存清单
          <span className="text-sm font-normal text-slate-400">({meds.length} 件)</span>
        </h3>
        
        <div className="grid gap-3">
          {meds.map((med) => (
            <div key={med.id} className="group flex items-center justify-between p-4 bg-slate-50 rounded-2xl hover:bg-white hover:shadow-xl transition-all border border-transparent hover:border-teal-100">
              <div className="flex items-center gap-4">
                <div className={`w-2 h-12 rounded-full ${med.name.includes('眼药水') ? 'bg-blue-400' : 'bg-teal-400'}`} />
                <div>
                  <div className="font-bold text-slate-800 text-lg">{med.name}</div>
                  <div className="text-xs text-slate-400 uppercase tracking-widest">类别：{med.category}</div>
                </div>
              </div>
              
              <div className="flex items-center gap-6">
                <div className="text-right">
                  <div className="text-[10px] text-slate-400 uppercase font-bold tracking-tighter text-right">EXPIRY DATE</div>
                  <div className="font-mono font-bold text-red-500 text-lg leading-none">{med.expired_at}</div>
                </div>
                <button 
                  onClick={() => handleDelete(med.id)}
                  className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-100"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}