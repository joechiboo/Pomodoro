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
  onUpdateSettings: (settings: TimerSettings) => void;
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

export function Timer({ settings, onSessionComplete, onUpdateSettings, sessions }: TimerProps) {
  const [taskName, setTaskName] = useState(settings.lastSelectedTask || settings.defaultTaskName || '');
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

  const playNotificationSound = async () => {
    if (!settings.soundEnabled) return;

    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();

      // Resume audio context if it's suspended (required for modern browsers)
      if (audioContext.state === 'suspended') {
        await audioContext.resume();
      }

      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      const soundType = settings.soundType || 'bell';
      const volume = settings.soundVolume || 0.5;

      // Different sound patterns based on settings
      switch (soundType) {
        case 'bell':
          oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
          oscillator.frequency.exponentialRampToValueAtTime(400, audioContext.currentTime + 0.3);
          oscillator.type = 'sine';
          break;
        case 'chime':
          oscillator.frequency.setValueAtTime(1200, audioContext.currentTime);
          oscillator.frequency.linearRampToValueAtTime(900, audioContext.currentTime + 0.4);
          oscillator.type = 'sine';
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

      gainNode.gain.setValueAtTime(volume, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.6);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.6);

      // Clean up after sound finishes
      setTimeout(() => {
        try {
          audioContext.close();
        } catch (e) {
          // Ignore errors when closing context
        }
      }, 700);

    } catch (error) {
      console.warn('無法播放提示音效:', error);
    }
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
      setTaskName(settings.defaultTaskName || '專注工作');
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
    setTaskName(settings.lastSelectedTask || settings.defaultTaskName || '');
    cancelAutoStart();
  };

  const updateLastSelectedTask = (task: string) => {
    const updatedSettings = {
      ...settings,
      lastSelectedTask: task
    };
    onUpdateSettings(updatedSettings);
  };

  const progressPercentage = ((getCurrentPhaseDuration() - timeLeft) / getCurrentPhaseDuration()) * 100;

  return (
    <div className="space-y-6">
      <Card className={`transition-all duration-300 ${timeLeft <= 10 && isRunning ? 'ring-2 ring-red-400 shadow-lg shadow-red-100' : ''}`}>
        <CardHeader className="text-center">
          <CardTitle className={`flex items-center justify-center gap-2 transition-colors duration-300 ${
            timeLeft <= 10 && isRunning ? 'text-red-500' : ''
          }`}>
            {getPhaseIcon()}
            {getPhaseLabel()}
            {timeLeft <= 10 && isRunning && (
              <span className="text-sm bg-red-100 text-red-600 px-2 py-1 rounded-full ml-2 animate-pulse">
                最後 {timeLeft} 秒！
              </span>
            )}
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
                      if (e.target.value.trim()) {
                        updateLastSelectedTask(e.target.value.trim());
                      }
                    }}
                    onFocus={() => setShowTaskSuggestions(true)}
                    onBlur={() => setTimeout(() => setShowTaskSuggestions(false), 200)}
                    placeholder={isRunning ? "計時進行中，任務已鎖定" : `輸入你要專注的任務... (預設: ${settings.defaultTaskName || '專注工作'})`}
                    disabled={isRunning || autoStartCountdown > 0}
                    autoComplete="off"
                    className={isRunning ? "bg-gray-50 cursor-not-allowed" : ""}
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
                              updateLastSelectedTask(task);
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
                    <Button variant="outline" disabled={isRunning || autoStartCountdown > 0}>
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56">
                    <div className="px-2 py-1.5 text-sm font-semibold">預設任務類型</div>
                    {defaultTaskTypes.map((type) => (
                      <DropdownMenuItem
                        key={type}
                        onClick={() => {
                          setTaskName(type);
                          updateLastSelectedTask(type);
                        }}
                      >
                        {type}
                      </DropdownMenuItem>
                    ))}
                    {settings.customTaskList && settings.customTaskList.length > 0 && (
                      <>
                        <div className="px-2 py-1.5 text-sm font-semibold border-t mt-1 pt-2">自定義任務</div>
                        {settings.customTaskList.map((task, index) => (
                          <DropdownMenuItem
                            key={index}
                            onClick={() => {
                              setTaskName(task);
                              updateLastSelectedTask(task);
                            }}
                          >
                            {task}
                          </DropdownMenuItem>
                        ))}
                      </>
                    )}
                    {recentTasks.length > 0 && (
                      <>
                        <div className="px-2 py-1.5 text-sm font-semibold border-t mt-1 pt-2">最近使用</div>
                        {recentTasks.slice(0, 5).map((task, index) => (
                          <DropdownMenuItem
                            key={index}
                            onClick={() => {
                              setTaskName(task);
                              updateLastSelectedTask(task);
                            }}
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
            <div className={`text-6xl font-mono transition-all duration-300 ${
              timeLeft <= 10 && isRunning ? 'text-red-500 animate-pulse scale-110' : ''
            }`}>
              {formatTime(timeLeft)}
            </div>

            <Progress
              value={progressPercentage}
              className={`w-full transition-all duration-300 ${
                timeLeft <= 10 && isRunning ? 'border-red-500' : ''
              }`}
            />
            
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