import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import { Play, Pause, RotateCcw, Coffee, Target } from 'lucide-react';
import { TimerSettings, PomodoroSession } from '../App';

interface TimerProps {
  settings: TimerSettings;
  onSessionComplete: (session: Omit<PomodoroSession, 'id'>) => void;
  sessions: PomodoroSession[];
}

type TimerPhase = 'work' | 'shortBreak' | 'longBreak';

export function Timer({ settings, onSessionComplete, sessions }: TimerProps) {
  const [taskName, setTaskName] = useState('');
  const [timeLeft, setTimeLeft] = useState(settings.workDuration * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [currentPhase, setCurrentPhase] = useState<TimerPhase>('work');
  const [sessionCount, setSessionCount] = useState(0);
  const [completedPomodoros, setCompletedPomodoros] = useState(0);
  
  const intervalRef = useRef<NodeJS.Timeout>();
  const notificationPermission = useRef(false);

  // Request notification permission on component mount
  useEffect(() => {
    if ('Notification' in window) {
      Notification.requestPermission().then(permission => {
        notificationPermission.current = permission === 'granted';
      });
    }
  }, []);

  // Reset timer when settings change
  useEffect(() => {
    if (!isRunning) {
      setTimeLeft(settings.workDuration * 60);
      setCurrentPhase('work');
    }
  }, [settings, isRunning]);

  // Count today's completed pomodoros
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    const todayPomodoros = sessions.filter(session => 
      session.date === today && session.type === 'work'
    ).length;
    setCompletedPomodoros(todayPomodoros);
  }, [sessions]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getCurrentPhaseDuration = () => {
    switch (currentPhase) {
      case 'work':
        return settings.workDuration * 60;
      case 'shortBreak':
        return settings.shortBreakDuration * 60;
      case 'longBreak':
        return settings.longBreakDuration * 60;
    }
  };

  const getPhaseLabel = () => {
    switch (currentPhase) {
      case 'work':
        return '工作時間';
      case 'shortBreak':
        return '短休息';
      case 'longBreak':
        return '長休息';
    }
  };

  const getPhaseIcon = () => {
    switch (currentPhase) {
      case 'work':
        return <Target className="w-5 h-5" />;
      case 'shortBreak':
      case 'longBreak':
        return <Coffee className="w-5 h-5" />;
    }
  };

  const showNotification = (title: string, message: string) => {
    if (notificationPermission.current) {
      new Notification(title, {
        body: message,
        icon: '🍅',
      });
    }
  };

  const playNotificationSound = () => {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
    
    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.5);
  };

  const completeSession = () => {
    const now = new Date();
    const session: Omit<PomodoroSession, 'id'> = {
      taskName: currentPhase === 'work' ? taskName : `${getPhaseLabel()}`,
      duration: getCurrentPhaseDuration() / 60,
      type: currentPhase === 'work' ? 'work' : (currentPhase === 'longBreak' ? 'longBreak' : 'break'),
      completedAt: now,
      date: now.toISOString().split('T')[0],
    };
    
    onSessionComplete(session);
    playNotificationSound();
    
    if (currentPhase === 'work') {
      showNotification('工作時間結束！', '休息一下吧 ☕');
      setSessionCount(prev => prev + 1);
      
      // Determine next break type
      const nextPhase = (sessionCount + 1) % settings.pomodorosUntilLongBreak === 0 
        ? 'longBreak' 
        : 'shortBreak';
      
      setCurrentPhase(nextPhase);
      setTimeLeft(nextPhase === 'longBreak' 
        ? settings.longBreakDuration * 60 
        : settings.shortBreakDuration * 60
      );
    } else {
      showNotification('休息時間結束！', '準備開始下一個番茄鐘 🍅');
      setCurrentPhase('work');
      setTimeLeft(settings.workDuration * 60);
    }
  };

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            setIsRunning(false);
            completeSession();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, timeLeft]);

  const startTimer = () => {
    if (currentPhase === 'work' && !taskName.trim()) {
      alert('請輸入任務名稱再開始計時');
      return;
    }
    setIsRunning(true);
  };

  const pauseTimer = () => {
    setIsRunning(false);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setCurrentPhase('work');
    setTimeLeft(settings.workDuration * 60);
    setSessionCount(0);
  };

  const progressPercentage = ((getCurrentPhaseDuration() - timeLeft) / getCurrentPhaseDuration()) * 100;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            {getPhaseIcon()}
            {getPhaseLabel()}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {currentPhase === 'work' && (
            <div className="space-y-2">
              <Label htmlFor="task-name">任務名稱</Label>
              <Input
                id="task-name"
                value={taskName}
                onChange={(e) => setTaskName(e.target.value)}
                placeholder="輸入你要專注的任務..."
                disabled={isRunning}
              />
            </div>
          )}

          <div className="text-center space-y-4">
            <div className="text-6xl font-mono">
              {formatTime(timeLeft)}
            </div>
            
            <Progress value={progressPercentage} className="w-full" />
            
            <div className="flex justify-center gap-4">
              {!isRunning ? (
                <Button onClick={startTimer} size="lg" className="px-8">
                  <Play className="w-5 h-5 mr-2" />
                  開始
                </Button>
              ) : (
                <Button onClick={pauseTimer} variant="secondary" size="lg" className="px-8">
                  <Pause className="w-5 h-5 mr-2" />
                  暫停
                </Button>
              )}
              
              <Button onClick={resetTimer} variant="outline" size="lg">
                <RotateCcw className="w-5 h-5 mr-2" />
                重置
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-mono">{sessionCount}</div>
            <div className="text-sm text-muted-foreground">本輪番茄鐘</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-mono">{completedPomodoros}</div>
            <div className="text-sm text-muted-foreground">今日完成</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-mono">
              {settings.pomodorosUntilLongBreak - (sessionCount % settings.pomodorosUntilLongBreak)}
            </div>
            <div className="text-sm text-muted-foreground">距離長休息</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}