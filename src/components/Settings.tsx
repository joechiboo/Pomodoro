import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Separator } from './ui/separator';
import { Badge } from './ui/badge';
import { Settings as SettingsIcon, Clock, Coffee, RotateCcw, Save } from 'lucide-react';
import { TimerSettings } from '../App';

interface SettingsProps {
  settings: TimerSettings;
  onSettingsChange: (settings: TimerSettings) => void;
}

export function Settings({ settings, onSettingsChange }: SettingsProps) {
  const [localSettings, setLocalSettings] = useState<TimerSettings>(settings);
  const [hasChanges, setHasChanges] = useState(false);

  const handleChange = (field: keyof TimerSettings, value: number) => {
    const newSettings = { ...localSettings, [field]: value };
    setLocalSettings(newSettings);
    setHasChanges(true);
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
    };
    setLocalSettings(defaultSettings);
    setHasChanges(true);
  };

  const presets = [
    {
      name: '經典番茄鐘',
      settings: { workDuration: 25, shortBreakDuration: 5, longBreakDuration: 15, pomodorosUntilLongBreak: 4 },
    },
    {
      name: '短時專注',
      settings: { workDuration: 15, shortBreakDuration: 3, longBreakDuration: 10, pomodorosUntilLongBreak: 4 },
    },
    {
      name: '長時專注',
      settings: { workDuration: 45, shortBreakDuration: 10, longBreakDuration: 30, pomodorosUntilLongBreak: 3 },
    },
    {
      name: '學習模式',
      settings: { workDuration: 50, shortBreakDuration: 10, longBreakDuration: 20, pomodorosUntilLongBreak: 2 },
    },
    {
      name: '測試模式',
      settings: { workDuration: 0.1, shortBreakDuration: 0.05, longBreakDuration: 0.12, pomodorosUntilLongBreak: 2 },
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
                工作時間 (分鐘)
              </Label>
              <Input
                id="work-duration"
                type="number"
                min="1"
                max="120"
                value={localSettings.workDuration}
                onChange={(e) => handleChange('workDuration', parseInt(e.target.value) || 25)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="short-break" className="flex items-center gap-2">
                <Coffee className="w-4 h-4" />
                短休息 (分鐘)
              </Label>
              <Input
                id="short-break"
                type="number"
                min="1"
                max="30"
                value={localSettings.shortBreakDuration}
                onChange={(e) => handleChange('shortBreakDuration', parseInt(e.target.value) || 5)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="long-break" className="flex items-center gap-2">
                <Coffee className="w-4 h-4" />
                長休息 (分鐘)
              </Label>
              <Input
                id="long-break"
                type="number"
                min="1"
                max="60"
                value={localSettings.longBreakDuration}
                onChange={(e) => handleChange('longBreakDuration', parseInt(e.target.value) || 15)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="pomodoros-until-long" className="flex items-center gap-2">
                <RotateCcw className="w-4 h-4" />
                長休息間隔 (番茄鐘數)
              </Label>
              <Input
                id="pomodoros-until-long"
                type="number"
                min="1"
                max="10"
                value={localSettings.pomodorosUntilLongBreak}
                onChange={(e) => handleChange('pomodorosUntilLongBreak', parseInt(e.target.value) || 4)}
              />
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