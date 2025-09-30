import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { PomodoroSession, TimerSettings } from '../App';
import { useAuth } from '../contexts/AuthContext';

export function useSupabaseSync() {
  const { user } = useAuth();
  const [syncing, setSyncing] = useState(false);

  // Sync sessions to Supabase
  const syncSessionToSupabase = async (session: PomodoroSession) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('pomodoro_sessions')
        .insert({
          id: session.id,
          user_id: user.id,
          task_name: session.taskName,
          duration: session.duration,
          type: session.type,
          completed_at: session.completedAt,
          date: session.date,
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error syncing session to Supabase:', error);
    }
  };

  // Load sessions from Supabase
  const loadSessionsFromSupabase = async (): Promise<PomodoroSession[]> => {
    if (!user) return [];

    try {
      setSyncing(true);
      const { data, error } = await supabase
        .from('pomodoro_sessions')
        .select('*')
        .eq('user_id', user.id)
        .order('completed_at', { ascending: false });

      if (error) throw error;

      return (data || []).map((item) => ({
        id: item.id,
        taskName: item.task_name,
        duration: item.duration,
        type: item.type,
        completedAt: new Date(item.completed_at),
        date: item.date,
      }));
    } catch (error) {
      console.error('Error loading sessions from Supabase:', error);
      return [];
    } finally {
      setSyncing(false);
    }
  };

  // Delete session from Supabase
  const deleteSessionFromSupabase = async (sessionId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('pomodoro_sessions')
        .delete()
        .eq('id', sessionId)
        .eq('user_id', user.id);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting session from Supabase:', error);
    }
  };

  // Delete multiple sessions from Supabase
  const deleteSessionsFromSupabase = async (sessionIds: string[]) => {
    if (!user || sessionIds.length === 0) return;

    try {
      const { error } = await supabase
        .from('pomodoro_sessions')
        .delete()
        .in('id', sessionIds)
        .eq('user_id', user.id);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting sessions from Supabase:', error);
    }
  };

  // Save settings to Supabase
  const saveSettingsToSupabase = async (settings: TimerSettings) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('user_settings')
        .upsert({
          user_id: user.id,
          work_duration: settings.workDuration,
          short_break_duration: settings.shortBreakDuration,
          long_break_duration: settings.longBreakDuration,
          pomodoros_until_long_break: settings.pomodorosUntilLongBreak,
          sound_enabled: settings.soundEnabled,
          sound_type: settings.soundType,
          sound_volume: settings.soundVolume,
          default_task_name: settings.defaultTaskName,
          last_selected_task: settings.lastSelectedTask,
          custom_task_list: settings.customTaskList || [],
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error saving settings to Supabase:', error);
    }
  };

  // Load settings from Supabase
  const loadSettingsFromSupabase = async (): Promise<TimerSettings | null> => {
    if (!user) return null;

    try {
      setSyncing(true);
      const { data, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No settings found, return null
          return null;
        }
        throw error;
      }

      return {
        workDuration: data.work_duration,
        shortBreakDuration: data.short_break_duration,
        longBreakDuration: data.long_break_duration,
        pomodorosUntilLongBreak: data.pomodoros_until_long_break,
        soundEnabled: data.sound_enabled,
        soundType: data.sound_type,
        soundVolume: data.sound_volume,
        defaultTaskName: data.default_task_name,
        lastSelectedTask: data.last_selected_task,
        customTaskList: data.custom_task_list,
      };
    } catch (error) {
      console.error('Error loading settings from Supabase:', error);
      return null;
    } finally {
      setSyncing(false);
    }
  };

  return {
    syncing,
    syncSessionToSupabase,
    loadSessionsFromSupabase,
    deleteSessionFromSupabase,
    deleteSessionsFromSupabase,
    saveSettingsToSupabase,
    loadSettingsFromSupabase,
  };
}