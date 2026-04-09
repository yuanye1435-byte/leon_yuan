"use client";

import { motion } from "framer-motion";
import { AlertTriangle, TrendingDown, Activity, ShieldCheck } from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-red-100">
      {/* 顶部 Hero 区 */}
      <section className="relative pt-32 pb-20 px-6 overflow-hidden">
        {/* 背景光晕 */}
        <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_50%_-20%,#e2e8f0,transparent)]" />
        
        <div className="relative z-10 max-w-5xl mx-auto text-center">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-200/50 border border-slate-300/30 text-[10px] font-mono tracking-widest text-slate-500 uppercase mb-8"
          >
            <ShieldCheck size={12} /> Cyber Medical Defense
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-6xl md:text-8xl font-black tracking-tighter mb-8 leading-[0.9]"
          >
            过期药物 <br />
            <span className="text-red-500 italic uppercase">Silent Killer.</span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="max-w-xl mx-auto text-slate-500 text-lg font-light leading-relaxed mb-12"
          >
            不仅仅是药效减弱。化学结构的降解将产生未知的细胞毒性，
            为你的肝肾代谢系统埋下致命伏笔。
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="flex flex-wrap justify-center gap-4"
          >
            <button className="px-10 py-4 bg-slate-900 text-white text-sm font-bold rounded-full hover:bg-red-600 transition-all active:scale-95 will-change-transform">
              立即扫描药箱
            </button>
            {/* 注意：这里的闭合标签现在是正确的 motion.div 了 */}
          </motion.div> 
        </div>
      </section>

      {/* 演示卡片区 */}
      <section className="max-w-5xl mx-auto px-6 pb-32">
        <div className="grid md:grid-cols-2 gap-6">
          <HazardCard 
            title="肝脏代谢过载" 
            description="变质成分在解毒过程中产生高浓度自由基，直接诱发肝细胞坏死。"
            severity="high"
            metric="-42% 酶活性"
          />
          <HazardCard 
            title="肾小球滤过损伤" 
            description="大分子降解产物堆积在肾小管，造成不可逆的机械性堵塞。"
            severity="medium"
            metric="+18% 血肌酐"
          />
        </div>
      </section>
    </main>
  );
}

// 内部卡片组件
function HazardCard({ title, description, severity, metric }: any) {
  return (
    <motion.div 
      whileHover={{ y: -5 }}
      className="p-8 rounded-3xl bg-white border border-slate-200/60 shadow-sm hover:shadow-2xl hover:shadow-red-500/10 transition-all group cursor-default"
    >
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-6 ${severity === 'high' ? 'bg-red-50 text-red-500' : 'bg-amber-50 text-amber-500'}`}>
        {severity === 'high' ? <AlertTriangle size={24} strokeWidth={1.5} /> : <Activity size={24} strokeWidth={1.5} />}
      </div>
      <h3 className="text-2xl font-bold mb-3 tracking-tight text-slate-800">{title}</h3>
      <p className="text-slate-500 text-sm leading-relaxed mb-8 font-light">{description}</p>
      <div className="flex items-center justify-between pt-6 border-t border-slate-50">
        <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">Metabolism Data</span>
        <span className={`font-mono font-bold ${severity === 'high' ? 'text-red-500' : 'text-amber-500'}`}>{metric}</span>
      </div>
    </motion.div>
  );
}