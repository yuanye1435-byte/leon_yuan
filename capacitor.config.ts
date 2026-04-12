import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.xiaoye.dej', // 保持你现在的 ID
  appName: '德江智慧用药',
  webDir: 'out',
  // server: {
  //   /* 🚀 关键：把地址换成你刚才查到的物理 IP */
  //   url: 'http://192.168.1.58:3000', 
  //   cleartext: true // 允许安卓访问非加密的网页
  // }
};

export default config;