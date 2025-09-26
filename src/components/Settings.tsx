import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Separator } from './ui/separator';
import { Badge } from './ui/badge';
import { Switch } from './ui/switch';
import { Slider } from './ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Settings as SettingsIcon, Clock, Coffee, RotateCcw, Save, Volume2, Bell } from 'lucide-react';
import { TimerSettings } from '../App';

interface SettingsProps {
  settings: TimerSettings;
  onSettingsChange: (settings: TimerSettings) => void;
}

export function Settings({ settings, onSettingsChange }: SettingsProps) {
  const [localSettings, setLocalSettings] = useState<TimerSettings>({
    ...settings,
    soundEnabled: settings.soundEnabled ?? true,
    soundVolume: settings.soundVolume ?? 0.5,
    soundType: settings.soundType ?? 'bell',
  });
  const [hasChanges, setHasChanges] = useState(false);

  const handleChange = (field: keyof TimerSettings, value: number) => {
    // Input validation
    let validatedValue = value;

    switch (field) {
      case 'workDuration':
        validatedValue = Math.max(1, Math.min(120, value));
        break;
      case 'shortBreakDuration':
        validatedValue = Math.max(1, Math.min(30, value));
        break;
      case 'longBreakDuration':
        validatedValue = Math.max(1, Math.min(60, value));
        break;
      case 'pomodorosUntilLongBreak':
        validatedValue = Math.max(1, Math.min(10, value));
        break;
    }

    const newSettings = { ...localSettings, [field]: validatedValue };
    setLocalSettings(newSettings);
    setHasChanges(true);
  };

  const getFieldError = (field: keyof TimerSettings, value: number) => {
    switch (field) {
      case 'workDuration':
        if (value < 1 || value > 120) return '工作時間須在 1-120 分鐘之間';
        break;
      case 'shortBreakDuration':
        if (value < 1 || value > 30) return '短休息須在 1-30 分鐘之間';
        break;
      case 'longBreakDuration':
        if (value < 1 || value > 60) return '長休息須在 1-60 分鐘之間';
        break;
      case 'pomodorosUntilLongBreak':
        if (value < 1 || value > 10) return '間隔須在 1-10 番茄鐘之間';
        break;
    }
    return null;
  };

  const handleSave = () => {
    onSettingsChange(localSettings);
    setHasChanges(false);
  };

  const handleReset = () => {
    const defaultSettings: TimerSettings = {
      workDuration: 25,
      shortBreakDuration: 5,
      longBreakDuration: 15,
      pomodorosUntilLongBreak: 4,
      soundEnabled: true,
      soundVolume: 0.5,
      soundType: 'bell',
    };
    setLocalSettings(defaultSettings);
    setHasChanges(true);
  };

  const handleSoundSettingChange = (field: string, value: any) => {
    const newSettings = { ...localSettings, [field]: value };
    setLocalSettings(newSettings);
    setHasChanges(true);
  };

  const testSound = async () => {
    if (!localSettings.soundEnabled) return;

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

      const soundType = localSettings.soundType || 'bell';
      const volume = localSettings.soundVolume || 0.5;

      // Different sound patterns based on type
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
      console.warn('無法播放測試音效:', error);
      alert('無法播放音效，可能因為瀏覽器限制。請確保已允許網站播放音效。');
    }
  };

  const presets = [
    {
      name: '經典番茄鐘',
      settings: { workDuration: 25, shortBreakDuration: 5, longBreakDuration: 15, pomodorosUntilLongBreak: 4, soundEnabled: true, soundVolume: 0.5, soundType: 'bell' as const },
    },
    {
      name: '短時專注',
      settings: { workDuration: 15, shortBreakDuration: 3, longBreakDuration: 10, pomodorosUntilLongBreak: 4, soundEnabled: true, soundVolume: 0.5, soundType: 'bell' as const },
    },
    {
      name: '長時專注',
      settings: { workDuration: 45, shortBreakDuration: 10, longBreakDuration: 30, pomodorosUntilLongBreak: 3, soundEnabled: true, soundVolume: 0.5, soundType: 'bell' as const },
    },
    {
      name: '學習模式',
      settings: { workDuration: 50, shortBreakDuration: 10, longBreakDuration: 20, pomodorosUntilLongBreak: 2, soundEnabled: true, soundVolume: 0.5, soundType: 'bell' as const },
    },
    {
      name: '測試模式',
      settings: { workDuration: 0.1, shortBreakDuration: 0.05, longBreakDuration: 0.12, pomodorosUntilLongBreak: 2, soundEnabled: true, soundVolume: 0.5, soundType: 'bell' as const },
    },
  ];

  const formatDuration = (minutes: number): string => {
    if (minutes < 1) {
      return `${Math.round(minutes * 60)}秒`;
    }
    return `${minutes}分`;
  };

  const applyPreset = (preset: TimerSettings) => {
    setLocalSettings(preset);
    setHasChanges(true);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <SettingsIcon className="w-5 h-5" />
            計時器設定
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="work-duration" className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                工作時間
                <span className="text-sm text-muted-foreground">(分鐘, 1-120)</span>
              </Label>
              <Input
                id="work-duration"
                type="number"
                min="1"
                max="120"
                value={localSettings.workDuration}
                onChange={(e) => handleChange('workDuration', parseInt(e.target.value) || 25)}
                className={getFieldError('workDuration', localSettings.workDuration) ? 'border-red-500' : ''}
              />
              {getFieldError('workDuration', localSettings.workDuration) && (
                <p className="text-sm text-red-500">{getFieldError('workDuration', localSettings.workDuration)}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="short-break" className="flex items-center gap-2">
                <Coffee className="w-4 h-4" />
                短休息
                <span className="text-sm text-muted-foreground">(分鐘, 1-30)</span>
              </Label>
              <Input
                id="short-break"
                type="number"
                min="1"
                max="30"
                value={localSettings.shortBreakDuration}
                onChange={(e) => handleChange('shortBreakDuration', parseInt(e.target.value) || 5)}
                className={getFieldError('shortBreakDuration', localSettings.shortBreakDuration) ? 'border-red-500' : ''}
              />
              {getFieldError('shortBreakDuration', localSettings.shortBreakDuration) && (
                <p className="text-sm text-red-500">{getFieldError('shortBreakDuration', localSettings.shortBreakDuration)}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="long-break" className="flex items-center gap-2">
                <Coffee className="w-4 h-4" />
                長休息
                <span className="text-sm text-muted-foreground">(分鐘, 1-60)</span>
              </Label>
              <Input
                id="long-break"
                type="number"
                min="1"
                max="60"
                value={localSettings.longBreakDuration}
                onChange={(e) => handleChange('longBreakDuration', parseInt(e.target.value) || 15)}
                className={getFieldError('longBreakDuration', localSettings.longBreakDuration) ? 'border-red-500' : ''}
              />
              {getFieldError('longBreakDuration', localSettings.longBreakDuration) && (
                <p className="text-sm text-red-500">{getFieldError('longBreakDuration', localSettings.longBreakDuration)}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="pomodoros-until-long" className="flex items-center gap-2">
                <RotateCcw className="w-4 h-4" />
                長休息間隔
                <span className="text-sm text-muted-foreground">(番茄鐘數, 1-10)</span>
              </Label>
              <Input
                id="pomodoros-until-long"
                type="number"
                min="1"
                max="10"
                value={localSettings.pomodorosUntilLongBreak}
                onChange={(e) => handleChange('pomodorosUntilLongBreak', parseInt(e.target.value) || 4)}
                className={getFieldError('pomodorosUntilLongBreak', localSettings.pomodorosUntilLongBreak) ? 'border-red-500' : ''}
              />
              {getFieldError('pomodorosUntilLongBreak', localSettings.pomodorosUntilLongBreak) && (
                <p className="text-sm text-red-500">{getFieldError('pomodorosUntilLongBreak', localSettings.pomodorosUntilLongBreak)}</p>
              )}
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <h3 className="font-medium">快速設定</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {presets.map((preset) => (
                <Button
                  key={preset.name}
                  variant="outline"
                  onClick={() => applyPreset(preset.settings)}
                  className="justify-start h-auto p-4"
                >
                  <div className="text-left">
                    <div className="font-medium">{preset.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {formatDuration(preset.settings.workDuration)}工作 / {formatDuration(preset.settings.shortBreakDuration)}休息 / {formatDuration(preset.settings.longBreakDuration)}長休息
                    </div>
                  </div>
                </Button>
              ))}
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <h3 className="font-medium">當前設定預覽</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-3 bg-muted rounded-lg">
                <div className="text-lg font-mono">{formatDuration(localSettings.workDuration)}</div>
                <div className="text-xs text-muted-foreground">工作時間</div>
              </div>
              <div className="text-center p-3 bg-muted rounded-lg">
                <div className="text-lg font-mono">{formatDuration(localSettings.shortBreakDuration)}</div>
                <div className="text-xs text-muted-foreground">短休息</div>
              </div>
              <div className="text-center p-3 bg-muted rounded-lg">
                <div className="text-lg font-mono">{formatDuration(localSettings.longBreakDuration)}</div>
                <div className="text-xs text-muted-foreground">長休息</div>
              </div>
              <div className="text-center p-3 bg-muted rounded-lg">
                <div className="text-lg font-mono">{localSettings.pomodorosUntilLongBreak}</div>
                <div className="text-xs text-muted-foreground">長休息間隔</div>
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button onClick={handleSave} disabled={!hasChanges} className="flex items-center gap-2">
              <Save className="w-4 h-4" />
              儲存設定
            </Button>
            <Button onClick={handleReset} variant="outline" className="flex items-center gap-2">
              <RotateCcw className="w-4 h-4" />
              重置為預設值
            </Button>
          </div>

          {hasChanges && (
            <div className="text-sm text-muted-foreground">
              * 有未儲存的變更
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            音效設定
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="sound-enabled" className="flex items-center gap-2">
                <Volume2 className="w-4 h-4" />
                啟用音效提示
              </Label>
              <Switch
                id="sound-enabled"
                checked={localSettings.soundEnabled}
                onCheckedChange={(checked) => handleSoundSettingChange('soundEnabled', checked)}
              />
            </div>

            {localSettings.soundEnabled && (
              <>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    音量
                    <span className="text-sm text-muted-foreground">({Math.round((localSettings.soundVolume || 0.5) * 100)}%)</span>
                  </Label>
                  <Slider
                    value={[localSettings.soundVolume || 0.5]}
                    onValueChange={([value]) => handleSoundSettingChange('soundVolume', value)}
                    min={0}
                    max={1}
                    step={0.1}
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <Label>音效類型</Label>
                  <Select
                    value={localSettings.soundType || 'bell'}
                    onValueChange={(value) => handleSoundSettingChange('soundType', value)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="選擇音效類型" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bell">鐘聲</SelectItem>
                      <SelectItem value="chime">風鈴</SelectItem>
                      <SelectItem value="digital">數位音</SelectItem>
                      <SelectItem value="soft">柔和音</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  onClick={testSound}
                  className="w-full"
                >
                  <Volume2 className="w-4 h-4 mr-2" />
                  測試音效
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>使用提示</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-start gap-3">
            <Badge variant="outline">🍅</Badge>
            <div className="text-sm">
              <strong>番茄工作法：</strong>專注工作 25 分鐘，然後休息 5 分鐘。每 4 個番茄鐘後進行一次長休息。
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Badge variant="outline">🔔</Badge>
            <div className="text-sm">
              <strong>通知提醒：</strong>建議開啟瀏覽器通知功能，以便在計時結束時收到提醒。
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Badge variant="outline">📊</Badge>
            <div className="text-sm">
              <strong>數據追蹤：</strong>所有完成的番茄鐘都會自動記錄，可在報表頁面查看詳細統計。
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Badge variant="outline">⚙️</Badge>
            <div className="text-sm">
              <strong>個人化設定：</strong>根據你的工作習慣調整時間長度，找到最適合的專注節奏。
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}