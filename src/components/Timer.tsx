import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import { Play, Pause, RotateCcw, Coffee, Target, ChevronDown } from 'lucide-react';
import { TimerSettings, PomodoroSession } from '../App';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from './ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from './ui/popover';

interface TimerProps {
  settings: TimerSettings;
  onSessionComplete: (session: Omit<PomodoroSession, 'id'>) => void;
  sessions: PomodoroSession[];
}

type TimerPhase = 'work' | 'shortBreak' | 'longBreak';

const defaultTaskTypes = [
  '編程開發',
  '文檔撰寫',
  '會議討論',
  '學習研究',
  '設計創作',
  '測試除錯',
  '郵件處理',
  '專案規劃',
  '代碼審查',
  '休息放鬆'
];

export function Timer({ settings, onSessionComplete, sessions }: TimerProps) {
  const [taskName, setTaskName] = useState('');
  const [timeLeft, setTimeLeft] = useState(settings.workDuration * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [currentPhase, setCurrentPhase] = useState<TimerPhase>('work');
  const [sessionCount, setSessionCount] = useState(0);
  const [completedPomodoros, setCompletedPomodoros] = useState(0);
  const [autoStartCountdown, setAutoStartCountdown] = useState(0);
  const [recentTasks, setRecentTasks] = useState<string[]>([]);
  const [showTaskSuggestions, setShowTaskSuggestions] = useState(false);

  const intervalRef = useRef<NodeJS.Timeout>();
  const countdownRef = useRef<NodeJS.Timeout>();
  const notificationPermission = useRef(false);

  // Request notification permission on component mount and load recent tasks
  useEffect(() => {
    if ('Notification' in window) {
      Notification.requestPermission().then(permission => {
        notificationPermission.current = permission === 'granted';
      });
    }

    // Load recent tasks from localStorage
    const savedRecentTasks = localStorage.getItem('recentTasks');
    if (savedRecentTasks) {
      setRecentTasks(JSON.parse(savedRecentTasks));
    }
  }, []);

  // Update recent tasks when a new task is added
  const updateRecentTasks = (task: string) => {
    if (!task.trim()) return;

    setRecentTasks(prev => {
      const filtered = prev.filter(t => t !== task);
      const updated = [task, ...filtered].slice(0, 10); // Keep only 10 recent tasks
      localStorage.setItem('recentTasks', JSON.stringify(updated));
      return updated;
    });
  };

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
    if (!settings.soundEnabled) return;

    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    // Different sound patterns based on settings
    switch (settings.soundType) {
      case 'bell':
        oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(400, audioContext.currentTime + 0.3);
        break;
      case 'chime':
        oscillator.frequency.setValueAtTime(1200, audioContext.currentTime);
        oscillator.frequency.linearRampToValueAtTime(900, audioContext.currentTime + 0.2);
        break;
      case 'digital':
        oscillator.frequency.setValueAtTime(600, audioContext.currentTime);
        oscillator.type = 'square';
        break;
      case 'soft':
        oscillator.frequency.setValueAtTime(440, audioContext.currentTime);
        oscillator.type = 'sine';
        break;
    }

    gainNode.gain.setValueAtTime(settings.soundVolume, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.5);
  };

  const startAutoStartCountdown = (seconds: number) => {
    setAutoStartCountdown(seconds);

    const countdown = () => {
      setAutoStartCountdown(prev => {
        if (prev <= 1) {
          setIsRunning(true);
          return 0;
        }
        return prev - 1;
      });
    };

    // 立即開始倒數，然後每秒更新
    countdownRef.current = setInterval(countdown, 1000);

    // 設定自動清理
    setTimeout(() => {
      if (countdownRef.current) {
        clearInterval(countdownRef.current);
      }
    }, seconds * 1000 + 100);
  };

  const cancelAutoStart = () => {
    if (countdownRef.current) {
      clearInterval(countdownRef.current);
    }
    setAutoStartCountdown(0);
  };

  const completeSession = () => {
    const now = new Date();
    const sessionTaskName = currentPhase === 'work' ? taskName : `${getPhaseLabel()}`;
    const session: Omit<PomodoroSession, 'id'> = {
      taskName: sessionTaskName,
      duration: getCurrentPhaseDuration() / 60,
      type: currentPhase === 'work' ? 'work' : (currentPhase === 'longBreak' ? 'longBreak' : 'break'),
      completedAt: now,
      date: now.toISOString().split('T')[0],
    };

    onSessionComplete(session);
    playNotificationSound();

    // Update recent tasks if it's a work session
    if (currentPhase === 'work' && taskName) {
      updateRecentTasks(taskName);
    }

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

      // 5秒倒數後自動開始休息階段
      startAutoStartCountdown(5);
    } else {
      showNotification('休息時間結束！', '準備開始下一個番茄鐘 🍅');
      setCurrentPhase('work');
      setTimeLeft(settings.workDuration * 60);

      // 5秒倒數後自動開始下一個工作階段
      startAutoStartCountdown(5);
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
    cancelAutoStart();
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
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <Input
                    id="task-name"
                    value={taskName}
                    onChange={(e) => {
                      setTaskName(e.target.value);
                      setShowTaskSuggestions(true);
                    }}
                    onFocus={() => setShowTaskSuggestions(true)}
                    onBlur={() => setTimeout(() => setShowTaskSuggestions(false), 200)}
                    placeholder="輸入你要專注的任務..."
                    disabled={isRunning}
                    autoComplete="off"
                  />
                  {showTaskSuggestions && taskName && (
                    <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-auto">
                      {recentTasks
                        .filter(task => task.toLowerCase().includes(taskName.toLowerCase()))
                        .slice(0, 5)
                        .map((task, index) => (
                          <div
                            key={index}
                            className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                            onClick={() => {
                              setTaskName(task);
                              setShowTaskSuggestions(false);
                            }}
                          >
                            {task}
                          </div>
                        ))}
                    </div>
                  )}
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" disabled={isRunning}>
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56">
                    <div className="px-2 py-1.5 text-sm font-semibold">預設任務類型</div>
                    {defaultTaskTypes.map((type) => (
                      <DropdownMenuItem
                        key={type}
                        onClick={() => setTaskName(type)}
                      >
                        {type}
                      </DropdownMenuItem>
                    ))}
                    {recentTasks.length > 0 && (
                      <>
                        <div className="px-2 py-1.5 text-sm font-semibold border-t mt-1 pt-2">最近使用</div>
                        {recentTasks.slice(0, 5).map((task, index) => (
                          <DropdownMenuItem
                            key={index}
                            onClick={() => setTaskName(task)}
                          >
                            {task}
                          </DropdownMenuItem>
                        ))}
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          )}

          <div className="text-center space-y-4">
            <div className="text-6xl font-mono">
              {formatTime(timeLeft)}
            </div>
            
            <Progress value={progressPercentage} className="w-full" />
            
            {autoStartCountdown > 0 && (
              <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="text-center">
                  <div className="text-lg font-semibold text-yellow-800">
                    {currentPhase === 'work' ? '準備開始下一個番茄鐘' : '準備開始休息'}
                  </div>
                  <div className="text-3xl font-mono text-yellow-600 my-2">
                    {autoStartCountdown}
                  </div>
                  <Button onClick={cancelAutoStart} variant="outline" size="sm">
                    取消自動開始
                  </Button>
                </div>
              </div>
            )}

            <div className="flex justify-center gap-4">
              {!isRunning && autoStartCountdown === 0 ? (
                <Button onClick={startTimer} size="lg" className="px-8">
                  <Play className="w-5 h-5 mr-2" />
                  開始
                </Button>
              ) : isRunning ? (
                <Button onClick={pauseTimer} variant="secondary" size="lg" className="px-8">
                  <Pause className="w-5 h-5 mr-2" />
                  暫停
                </Button>
              ) : null}

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
            <div className="mt-2">
              <Progress value={(sessionCount % settings.pomodorosUntilLongBreak) / settings.pomodorosUntilLongBreak * 100} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-mono">{completedPomodoros}</div>
            <div className="text-sm text-muted-foreground">今日完成</div>
            <div className="mt-2 flex justify-center gap-1">
              {Array.from({ length: Math.min(completedPomodoros, 8) }, (_, i) => (
                <div key={i} className="w-2 h-2 bg-primary rounded-full" />
              ))}
              {completedPomodoros > 8 && (
                <span className="text-xs text-muted-foreground ml-1">+{completedPomodoros - 8}</span>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-mono">
              {settings.pomodorosUntilLongBreak - (sessionCount % settings.pomodorosUntilLongBreak)}
            </div>
            <div className="text-sm text-muted-foreground">距離長休息</div>
            <div className="mt-2 flex justify-center gap-1">
              {Array.from({ length: settings.pomodorosUntilLongBreak }, (_, i) => (
                <div
                  key={i}
                  className={`w-3 h-3 rounded-full ${
                    i < (sessionCount % settings.pomodorosUntilLongBreak)
                      ? 'bg-primary'
                      : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}