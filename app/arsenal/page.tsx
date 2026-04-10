"use client";
import { useRouter } from 'next/navigation'; // 🚀 跃迁引擎核心

export default function LogsTerminal() {
    const router = useRouter();

    return (
        <div className="min-h-screen bg-slate-900 text-white p-10 font-sans">
            <h1 className="text-4xl font-black italic text-teal-500 mb-6">ALL COMBAT LOGS.</h1>
            <p className="text-slate-400">这里是辽阔的新战区，你可以随便塞几百条数据...</p>
            
            {/* 🚀 返回主控台的按钮 */}
            <button 
                onClick={() => router.push('/')} 
                className="mt-10 px-6 py-3 border border-teal-500 text-teal-400 rounded-xl hover:bg-teal-500 hover:text-white transition-all font-black"
            >
                🛬 跃迁返回主页面
            </button>
        </div>
    );
}