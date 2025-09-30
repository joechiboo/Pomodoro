-- Supabase Database Schema for Pomodoro App
-- 在 Supabase Dashboard > SQL Editor 執行此腳本

-- 建立 pomodoro_sessions 資料表
CREATE TABLE IF NOT EXISTS public.pomodoro_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  task_name TEXT NOT NULL,
  duration NUMERIC NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('work', 'break', 'longBreak')),
  completed_at TIMESTAMPTZ NOT NULL,
  date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 建立索引以提升查詢效能
CREATE INDEX IF NOT EXISTS idx_pomodoro_sessions_user_id ON public.pomodoro_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_pomodoro_sessions_date ON public.pomodoro_sessions(date);
CREATE INDEX IF NOT EXISTS idx_pomodoro_sessions_user_date ON public.pomodoro_sessions(user_id, date);

-- 啟用 Row Level Security (RLS)
ALTER TABLE public.pomodoro_sessions ENABLE ROW LEVEL SECURITY;

-- 建立 RLS 政策：使用者只能存取自己的資料
CREATE POLICY "Users can view their own sessions"
  ON public.pomodoro_sessions
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own sessions"
  ON public.pomodoro_sessions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own sessions"
  ON public.pomodoro_sessions
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own sessions"
  ON public.pomodoro_sessions
  FOR DELETE
  USING (auth.uid() = user_id);

-- 建立使用者設定資料表
-- 注意: 時間欄位以秒為單位儲存，前端會轉換為分鐘
CREATE TABLE IF NOT EXISTS public.user_settings (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  work_duration INTEGER DEFAULT 1500, -- 預設 25 分鐘 (25 * 60 秒)
  short_break_duration INTEGER DEFAULT 300, -- 預設 5 分鐘 (5 * 60 秒)
  long_break_duration INTEGER DEFAULT 900, -- 預設 15 分鐘 (15 * 60 秒)
  pomodoros_until_long_break INTEGER DEFAULT 4,
  sound_enabled BOOLEAN DEFAULT true,
  sound_type TEXT DEFAULT 'bell',
  sound_volume NUMERIC DEFAULT 0.5,
  default_task_name TEXT DEFAULT '專注工作',
  last_selected_task TEXT,
  custom_task_list JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 建立索引
CREATE INDEX IF NOT EXISTS idx_user_settings_user_id ON public.user_settings(user_id);

-- 啟用 RLS
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

-- 建立 RLS 政策
CREATE POLICY "Users can view their own settings"
  ON public.user_settings
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own settings"
  ON public.user_settings
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own settings"
  ON public.user_settings
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 建立觸發器：自動更新 updated_at 欄位
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_settings_updated_at
  BEFORE UPDATE ON public.user_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();