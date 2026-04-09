import { createClient } from '@supabase/supabase-js';

// 这两行会自动读取你刚才在 .env.local 里存的钥匙
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// 导出这个“通信站”，全村的组件都能用了
export const supabase = createClient(supabaseUrl, supabaseAnonKey);