import React from 'react';

export default function MedicineGuide() {
  return (
    <div className="max-w-4xl mx-auto my-12 p-6 md:p-12 bg-white text-gray-800 rounded-3xl shadow-xl border border-gray-100">
      
      {/* 头部高能预警 */}
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-5xl font-extrabold text-slate-900 tracking-tight mb-4">
          药盒上的有效期 <span className="text-red-500">≠</span> 使用期
        </h2>
        <p className="text-lg text-slate-600 font-medium">
          一旦拆封，环境正在加速药品的“死亡”。
        </p>
      </div>

      {/* 核心红线 - 三大件 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="bg-orange-50 p-8 rounded-2xl border-t-4 border-orange-400">
          <div className="text-4xl mb-4">💊</div>
          <h3 className="text-xl font-bold mb-2">瓶装药片 / 胶囊</h3>
          <div className="text-3xl font-black text-orange-600 mb-2">3 - 6 个月</div>
          <p className="text-sm text-slate-600 font-medium">反复开盖带入湿气，变色粘连立刻丢弃。</p>
        </div>

        <div className="bg-red-50 p-8 rounded-2xl border-t-4 border-red-500 relative">
          <div className="text-4xl mb-4">💧</div>
          <h3 className="text-xl font-bold mb-2">眼药水 / 鼻喷雾</h3>
          <div className="text-3xl font-black text-red-600 mb-2">仅限 4 周</div>
          <p className="text-sm text-slate-600 font-medium">瓶口极易滋生细菌，超期不管剩多少必须扔。</p>
        </div>

        <div className="bg-teal-50 p-8 rounded-2xl border-t-4 border-teal-500">
          <div className="text-4xl mb-4">🛡️</div>
          <h3 className="text-xl font-bold mb-2">独立铝箔包装</h3>
          <div className="text-3xl font-black text-teal-700 mb-2">最安全</div>
          <p className="text-sm text-slate-600 font-medium">未破损前按药盒日期，撕开后务必防潮密封。</p>
        </div>
      </div>

      {/* 底部行动呼吁 */}
      <div className="bg-slate-900 text-white rounded-2xl p-8 text-center flex flex-col md:flex-row items-center justify-between">
        <div className="text-left mb-6 md:mb-0">
          <h4 className="text-xl font-bold mb-2 text-white">☠️ 过期药不治病，只伤身</h4>
          <p className="text-slate-400 text-sm font-medium">延误病情 / 毒性倍增 / 污染水源。请立即清理您的药箱。</p>
        </div>
        <button className="bg-teal-500 hover:bg-teal-400 text-white font-bold py-3 px-8 rounded-full transition-all shadow-lg">
          守护家人健康 ➔
        </button>
      </div>
    </div>
  );
}