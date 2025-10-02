import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import { Play, Pause, RotateCcw, Coffee, Target, ChevronDown, SkipForward } from 'lucide-react';
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
  const [timeLeft, setTimeLeft] = useState(Math.round(settings.workDuration * 60));
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

  // Get unique recent tasks, excluding those already in custom task list
  const uniqueRecentTasks = useMemo(() => {
    const customSet = new Set(settings.customTaskList || []);
    const defaultSet = new Set(defaultTaskTypes);
    return recentTasks.filter(task => !customSet.has(task) && !defaultSet.has(task));
  }, [recentTasks, settings.customTaskList]);

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
      setTimeLeft(Math.round(settings.workDuration * 60));
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
        return Math.round(settings.workDuration * 60);
      case 'shortBreak':
        return Math.round(settings.shortBreakDuration * 60);
      case 'longBreak':
        return Math.round(settings.longBreakDuration * 60);
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
      const newCount = sessionCount + 1;
      setSessionCount(newCount);

      // Determine next break type
      const nextPhase = newCount % settings.pomodorosUntilLongBreak === 0
        ? 'longBreak'
        : 'shortBreak';

      setCurrentPhase(nextPhase);
      setTimeLeft(Math.round(nextPhase === 'longBreak'
        ? settings.longBreakDuration * 60
        : settings.shortBreakDuration * 60)
      );
      // Automatically start the break
      setIsRunning(true);

    } else {
      showNotification('休息時間結束！', '準備開始下一個番茄鐘 🍅');
      setCurrentPhase('work');
      setTimeLeft(Math.round(settings.workDuration * 60));
      // Don't automatically start work session - let user start manually
    }
  };

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            // Timer is about to complete
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

  // Separate effect to handle timer completion
  useEffect(() => {
    if (timeLeft === 0 && isRunning) {
      setIsRunning(false);
      // Use setTimeout to ensure state updates are processed
      setTimeout(() => {
        completeSession();
      }, 0);
    }
  }, [timeLeft, isRunning, currentPhase, sessionCount, taskName, settings]);

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
    setTimeLeft(Math.round(settings.workDuration * 60));
    setSessionCount(0);
    setTaskName(settings.lastSelectedTask || settings.defaultTaskName || '');
    cancelAutoStart();
  };

  const endBreak = () => {
    // Stop the timer
    setIsRunning(false);
    cancelAutoStart();

    // Complete the current break session
    const now = new Date();
    const session: Omit<PomodoroSession, 'id'> = {
      taskName: getPhaseLabel(),
      duration: (getCurrentPhaseDuration() - timeLeft) / 60, // Actual duration spent
      type: currentPhase === 'longBreak' ? 'longBreak' : 'break',
      completedAt: now,
      date: now.toISOString().split('T')[0],
    };
    onSessionComplete(session);

    // Switch to work phase
    showNotification('休息結束！', '開始新的工作時段 🍅');
    setCurrentPhase('work');
    setTimeLeft(Math.round(settings.workDuration * 60));
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
                  <DropdownMenuTrigger
                    disabled={isRunning || autoStartCountdown > 0}
                    className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2"
                  >
                    <ChevronDown className="h-4 w-4" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    className="w-96 max-h-[70vh] overflow-y-auto p-4 shadow-2xl !border-[3px] !border-solid !border-gray-500 dark:!border-gray-500 bg-white dark:bg-gray-950 z-[100] rounded-2xl"
                    sideOffset={12}
                    align="start"
                    style={{
                      backgroundColor: 'white',
                      border: '3px solid rgb(107, 114, 128)'
                    }}
                  >
                    {/* 自定義任務列表 - 最優先顯示 */}
                    {settings.customTaskList && settings.customTaskList.length > 0 && (
                      <div className="mb-4">
                        <div className="flex items-center gap-2.5 px-3 py-2 mb-3 bg-gradient-to-br from-blue-600 via-blue-500 to-indigo-600 rounded-2xl shadow-lg">
                          <span className="text-2xl filter drop-shadow-sm">⭐</span>
                          <span className="text-base font-extrabold !text-white tracking-wide drop-shadow-sm">自定義任務列表</span>
                        </div>
                        <div className="space-y-2">
                          {settings.customTaskList.map((task, index) => (
                            <DropdownMenuItem
                              key={`custom-${index}`}
                              onClick={() => {
                                setTaskName(task);
                                updateLastSelectedTask(task);
                              }}
                              className="group relative cursor-pointer px-5 py-4 rounded-2xl font-bold text-base text-blue-700 dark:text-blue-300 bg-gradient-to-br from-blue-50 via-blue-100/80 to-indigo-50 dark:from-blue-950/50 dark:via-blue-900/40 dark:to-indigo-950/50 hover:from-blue-100 hover:via-blue-200 hover:to-indigo-100 dark:hover:from-blue-900/70 dark:hover:via-blue-800/60 dark:hover:to-indigo-900/70 data-[highlighted]:from-blue-100 data-[highlighted]:via-blue-200 data-[highlighted]:to-indigo-100 dark:data-[highlighted]:from-blue-900/70 dark:data-[highlighted]:via-blue-800/60 dark:data-[highlighted]:to-indigo-900/70 transition-all duration-300 border-2 border-blue-200 dark:border-blue-800/60 hover:border-blue-400 dark:hover:border-blue-600 data-[highlighted]:border-blue-400 dark:data-[highlighted]:border-blue-600 hover:shadow-2xl hover:shadow-blue-200/50 dark:hover:shadow-blue-900/50 data-[highlighted]:shadow-2xl data-[highlighted]:shadow-blue-200/50 dark:data-[highlighted]:shadow-blue-900/50 hover:-translate-y-1 data-[highlighted]:-translate-y-1 active:translate-y-0 active:shadow-lg overflow-hidden"
                            >
                              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                              <span className="flex items-center gap-4 relative z-10">
                                <span className="flex-shrink-0 w-3 h-3 rounded-full bg-blue-500 shadow-lg shadow-blue-500/50 group-hover:scale-150 group-hover:shadow-xl transition-all duration-300"></span>
                                <span className="flex-1 group-hover:translate-x-1 transition-transform duration-300">{task}</span>
                                <span className="text-xs text-blue-500/60 dark:text-blue-400/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300">→</span>
                              </span>
                            </DropdownMenuItem>
                          ))}
                        </div>
                        <div className="my-5 h-px bg-gradient-to-r from-transparent via-blue-300 dark:via-blue-800 to-transparent" />
                      </div>
                    )}

                    {/* 最近使用 - 第二優先 */}
                    {uniqueRecentTasks.length > 0 && (
                      <div className="mb-4">
                        <div className="flex items-center gap-2.5 px-3 py-2 mb-3 bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200 dark:from-gray-800 dark:via-gray-700 dark:to-gray-800 rounded-xl shadow-md">
                          <span className="text-xl">🕐</span>
                          <span className="text-sm font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wider">最近使用</span>
                        </div>
                        <div className="space-y-1.5">
                          {uniqueRecentTasks.slice(0, 5).map((task, index) => (
                            <DropdownMenuItem
                              key={`recent-${index}`}
                              onClick={() => {
                                setTaskName(task);
                                updateLastSelectedTask(task);
                              }}
                              className="group cursor-pointer px-5 py-3.5 rounded-xl font-semibold text-sm text-gray-700 dark:text-gray-200 bg-gray-50 dark:bg-gray-900/50 hover:bg-gradient-to-r hover:from-gray-100 hover:to-gray-200 dark:hover:from-gray-800 dark:hover:to-gray-700 data-[highlighted]:bg-gradient-to-r data-[highlighted]:from-gray-100 data-[highlighted]:to-gray-200 dark:data-[highlighted]:from-gray-800 dark:data-[highlighted]:to-gray-700 transition-all duration-200 border border-gray-200 dark:border-gray-800 hover:border-gray-400 dark:hover:border-gray-600 data-[highlighted]:border-gray-400 dark:data-[highlighted]:border-gray-600 hover:shadow-lg data-[highlighted]:shadow-lg hover:-translate-y-0.5 data-[highlighted]:-translate-y-0.5 active:translate-y-0"
                            >
                              <span className="flex items-center gap-3.5">
                                <span className="flex-shrink-0 w-2 h-2 rounded-full bg-gray-400 dark:bg-gray-500 group-hover:scale-150 group-hover:bg-gray-600 dark:group-hover:bg-gray-300 transition-all duration-200 shadow-sm"></span>
                                <span className="flex-1 group-hover:translate-x-0.5 transition-transform duration-200">{task}</span>
                                <span className="text-xs text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity duration-200">→</span>
                              </span>
                            </DropdownMenuItem>
                          ))}
                        </div>
                        <div className="my-5 h-px bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-700 to-transparent" />
                      </div>
                    )}

                    {/* 推薦任務類型 - 最後顯示 */}
                    <div>
                      <div className="flex items-center gap-2.5 px-3 py-2 mb-3 bg-gray-100 dark:bg-gray-900/50 rounded-xl">
                        <span className="text-xl">📋</span>
                        <span className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">推薦任務類型</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        {defaultTaskTypes.map((type) => (
                          <DropdownMenuItem
                            key={`default-${type}`}
                            onClick={() => {
                              setTaskName(type);
                              updateLastSelectedTask(type);
                            }}
                            className="group cursor-pointer px-4 py-3 rounded-xl text-sm font-medium text-center text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/30 hover:text-gray-900 dark:hover:text-gray-100 data-[highlighted]:text-gray-900 dark:data-[highlighted]:text-gray-100 hover:bg-gradient-to-br hover:from-gray-100 hover:to-gray-200 dark:hover:from-gray-800/80 dark:hover:to-gray-700/80 data-[highlighted]:bg-gradient-to-br data-[highlighted]:from-gray-100 data-[highlighted]:to-gray-200 dark:data-[highlighted]:from-gray-800/80 dark:data-[highlighted]:to-gray-700/80 transition-all duration-200 border border-gray-200 dark:border-gray-800 hover:border-gray-400 dark:hover:border-gray-600 data-[highlighted]:border-gray-400 dark:data-[highlighted]:border-gray-600 hover:shadow-md data-[highlighted]:shadow-md hover:scale-105 data-[highlighted]:scale-105 active:scale-100"
                          >
                            <span className="block truncate">{type}</span>
                          </DropdownMenuItem>
                        ))}
                      </div>
                    </div>
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

              {currentPhase !== 'work' && (
                <Button onClick={endBreak} variant="default" size="lg">
                  <SkipForward className="w-5 h-5 mr-2" />
                  結束休息
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