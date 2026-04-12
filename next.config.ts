import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* 🚀 核心：开启静态导出模式 */
  output: 'export', 
  
  /* 💡 如果你用了图片优化组件 Image，可能还需要加这一行防止报错 */
  images: {
    unoptimized: true,
  },
};

export default nextConfig;