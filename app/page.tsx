"use client";
// 🚀 核心纠偏：从 app 文件夹跳出一层 (../) 到达根目录，再拐进 components 找到主控台
import MedicineGuide from '../components/MedicineGuide';

export default function Home() {
    return (
        <main>
            {/* 唤醒你的 3D 拟真主控台 */}
            <MedicineGuide />
        </main>
    );
}