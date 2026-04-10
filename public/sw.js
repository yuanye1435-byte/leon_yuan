// 这是一个基础的 Service Worker，为了让安卓识别 PWA
self.addEventListener('install', (e) => {
  console.log('[Service Worker] Install');
});

self.addEventListener('fetch', (e) => {
  // 保持空逻辑即可，保证安装校验通过
});