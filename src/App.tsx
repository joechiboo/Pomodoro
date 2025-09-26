import React, { useState, useEffect } from 'react';
import { Timer } from './components/Timer';
import { Reports } from './components/Reports';
import { Settings } from './components/Settings';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { Button } from './components/ui/button';
import { Settings as SettingsIcon, BarChart3, Timer as TimerIcon } from 'lucide-react';

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
}

const defaultSettings: TimerSettings = {
  workDuration: 25,
  shortBreakDuration: 5,
  longBreakDuration: 15,
  pomodorosUntilLongBreak: 4,
  soundEnabled: true,
  soundVolume: 0.5,
  soundType: 'bell',
};

export default function App() {
  const [sessions, setSessions] = useState<PomodoroSession[]>([]);
  const [settings, setSettings] = useState<TimerSettings>(defaultSettings);
  const [activeTab, setActiveTab] = useState('timer');

  // Load data from localStorage on mount
  useEffect(() => {
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
      setSettings(JSON.parse(savedSettings));
    }
  }, []);

  // Save to localStorage when sessions or settings change
  useEffect(() => {
    localStorage.setItem('pomodoroSessions', JSON.stringify(sessions));
  }, [sessions]);

  useEffect(() => {
    localStorage.setItem('pomodoroSettings', JSON.stringify(settings));
  }, [settings]);

  const addSession = (session: Omit<PomodoroSession, 'id'>) => {
    const newSession: PomodoroSession = {
      ...session,
      id: Date.now().toString(),
    };
    setSessions(prev => [...prev, newSession]);
  };

  const updateSettings = (newSettings: TimerSettings) => {
    setSettings(newSettings);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl mb-2">🍅 Pomodoro Timer</h1>
          <p className="text-muted-foreground">專注工作，提升生產力</p>
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
              sessions={sessions}
            />
          </TabsContent>

          <TabsContent value="reports">
            <Reports sessions={sessions} />
          </TabsContent>

          <TabsContent value="settings">
            <Settings 
              settings={settings} 
              onSettingsChange={updateSettings}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}