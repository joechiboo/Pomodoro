import React, { useState, useEffect } from 'react';
import { Timer } from './components/Timer';
import { Reports } from './components/Reports';
import { Settings } from './components/Settings';
import { Auth } from './components/Auth';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { Button } from './components/ui/button';
import { Settings as SettingsIcon, BarChart3, Timer as TimerIcon, LogOut, LogIn, Loader2, CloudOff } from 'lucide-react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { useSupabaseSync } from './hooks/useSupabaseSync';

export interface PomodoroSession {
  id: string;
  taskName: string;
  duration: number;
  type: 'work' | 'break' | 'longBreak';
  completedAt: Date;
  date: string;
}

export interface TimerSettings {
  workDuration: number;
  shortBreakDuration: number;
  longBreakDuration: number;
  pomodorosUntilLongBreak: number;
  soundEnabled: boolean;
  soundVolume: number;
  soundType: 'bell' | 'chime' | 'digital' | 'soft';
  defaultTaskName: string;
  lastSelectedTask: string;
  customTaskList: string[];
}

const defaultSettings: TimerSettings = {
  workDuration: 25,
  shortBreakDuration: 5,
  longBreakDuration: 15,
  pomodorosUntilLongBreak: 4,
  soundEnabled: true,
  soundVolume: 0.5,
  soundType: 'bell',
  defaultTaskName: '專注工作',
  lastSelectedTask: '',
  customTaskList: [],
};

function AppContent() {
  const { user, loading: authLoading, signOut } = useAuth();
  const {
    syncing,
    syncSessionToSupabase,
    loadSessionsFromSupabase,
    deleteSessionFromSupabase,
    deleteSessionsFromSupabase,
    saveSettingsToSupabase,
    loadSettingsFromSupabase,
  } = useSupabaseSync();

  const [sessions, setSessions] = useState<PomodoroSession[]>([]);
  const [settings, setSettings] = useState<TimerSettings>(defaultSettings);
  const [activeTab, setActiveTab] = useState('timer');
  const [initialLoading, setInitialLoading] = useState(true);
  const [offlineMode, setOfflineMode] = useState(false);

  // Load data from Supabase or localStorage on mount
  useEffect(() => {
    const loadData = async () => {
      if (user && !offlineMode) {
        // Load from Supabase for authenticated users
        const [supabaseSessions, supabaseSettings] = await Promise.all([
          loadSessionsFromSupabase(),
          loadSettingsFromSupabase(),
        ]);

        if (supabaseSessions.length > 0) {
          setSessions(supabaseSessions);
        } else {
          // First time login - check if there are sessions in localStorage to migrate
          const localSessions = localStorage.getItem('pomodoroSessions');
          if (localSessions) {
            const parsedSessions = JSON.parse(localSessions).map((session: any) => ({
              ...session,
              completedAt: new Date(session.completedAt),
            }));
            setSessions(parsedSessions);

            // Sync local sessions to Supabase
            for (const session of parsedSessions) {
              await syncSessionToSupabase(session);
            }
          }
        }

        if (supabaseSettings) {
          setSettings(supabaseSettings);
        } else {
          // First time login - check if there are settings in localStorage to migrate
          const localSettings = localStorage.getItem('pomodoroSettings');
          let settingsToSave = defaultSettings;

          if (localSettings) {
            const parsedLocalSettings = JSON.parse(localSettings);
            settingsToSave = {
              ...defaultSettings,
              ...parsedLocalSettings,
            };
            setSettings(settingsToSave);
          }

          // Save settings to Supabase
          await saveSettingsToSupabase(settingsToSave);
        }
      } else {
        // Load from localStorage for guest users or offline mode
        const savedSessions = localStorage.getItem('pomodoroSessions');
        const savedSettings = localStorage.getItem('pomodoroSettings');

        if (savedSessions) {
          const parsedSessions = JSON.parse(savedSessions).map((session: any) => ({
            ...session,
            completedAt: new Date(session.completedAt),
          }));
          setSessions(parsedSessions);
        }

        if (savedSettings) {
          const parsedSettings = JSON.parse(savedSettings);
          setSettings({
            ...defaultSettings,
            ...parsedSettings,
          });
        }
      }

      setInitialLoading(false);
    };

    loadData();
  }, [user, offlineMode]);

  // Save to localStorage for guest users or offline mode
  useEffect(() => {
    if ((!user || offlineMode) && !initialLoading) {
      localStorage.setItem('pomodoroSessions', JSON.stringify(sessions));
    }
  }, [sessions, user, offlineMode, initialLoading]);

  useEffect(() => {
    if ((!user || offlineMode) && !initialLoading) {
      localStorage.setItem('pomodoroSettings', JSON.stringify(settings));
    }
  }, [settings, user, offlineMode, initialLoading]);

  const addSession = async (session: Omit<PomodoroSession, 'id'>) => {
    const newSession: PomodoroSession = {
      ...session,
      id: crypto.randomUUID(),
    };
    setSessions((prev) => [...prev, newSession]);

    // Sync to Supabase if user is logged in and not in offline mode
    if (user && !offlineMode) {
      await syncSessionToSupabase(newSession);
    }
  };

  const deleteSession = async (sessionId: string) => {
    setSessions((prev) => prev.filter((session) => session.id !== sessionId));

    // Delete from Supabase if user is logged in and not in offline mode
    if (user && !offlineMode) {
      await deleteSessionFromSupabase(sessionId);
    }
  };

  const clearTodaySessions = async () => {
    const today = new Date().toISOString().split('T')[0];
    const todaySessionIds = sessions
      .filter((session) => session.date === today)
      .map((session) => session.id);

    setSessions((prev) => prev.filter((session) => session.date !== today));

    // Delete from Supabase if user is logged in and not in offline mode
    if (user && !offlineMode) {
      await deleteSessionsFromSupabase(todaySessionIds);
    }
  };

  const updateSettings = async (newSettings: TimerSettings) => {
    setSettings(newSettings);

    // Save to Supabase if user is logged in and not in offline mode
    if (user && !offlineMode) {
      await saveSettingsToSupabase(newSettings);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    // Clear local state on sign out
    setSessions([]);
    setSettings(defaultSettings);
  };

  if (authLoading || initialLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const handleSkipLogin = () => {
    setOfflineMode(true);
    setInitialLoading(false);
  };

  if (!user && !offlineMode) {
    return <Auth onSkip={handleSkipLogin} />;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="text-center mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex-1" />
            <h1 className="text-4xl">🍅 Pomodoro Timer</h1>
            <div className="flex-1 flex justify-end">
              {offlineMode ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setOfflineMode(false);
                    window.location.reload();
                  }}
                >
                  <LogIn className="w-4 h-4 mr-2" />
                  登入
                </Button>
              ) : (
                <Button variant="outline" size="sm" onClick={handleSignOut}>
                  <LogOut className="w-4 h-4 mr-2" />
                  登出
                </Button>
              )}
            </div>
          </div>
          <p className="text-muted-foreground">
            專注工作，提升生產力
            {user && user.email && ` · ${user.email}`}
          </p>
          {syncing && !offlineMode && (
            <p className="text-xs text-muted-foreground mt-2">
              <Loader2 className="w-3 h-3 inline animate-spin mr-1" />
              同步中...
            </p>
          )}
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="timer" className="flex items-center gap-2">
              <TimerIcon className="w-4 h-4" />
              計時器
            </TabsTrigger>
            <TabsTrigger value="reports" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              報表
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <SettingsIcon className="w-4 h-4" />
              設定
            </TabsTrigger>
          </TabsList>

          <TabsContent value="timer">
            <Timer
              settings={settings}
              onSessionComplete={addSession}
              onUpdateSettings={updateSettings}
              sessions={sessions}
            />
          </TabsContent>

          <TabsContent value="reports">
            <Reports
              sessions={sessions}
              onDeleteSession={deleteSession}
              onClearTodaySessions={clearTodaySessions}
            />
          </TabsContent>

          <TabsContent value="settings">
            <Settings settings={settings} onSettingsChange={updateSettings} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}