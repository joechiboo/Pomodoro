import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { Calendar, Search, TrendingUp, Clock, Target, Trash2, X } from 'lucide-react';
import { PomodoroSession } from '../App';

interface ReportsProps {
  sessions: PomodoroSession[];
  onDeleteSession?: (sessionId: string) => void;
  onClearTodaySessions?: () => void;
}

export function Reports({ sessions, onDeleteSession, onClearTodaySessions }: ReportsProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('daily');

  const filteredSessions = useMemo(() => {
    if (!searchTerm) return sessions;
    return sessions.filter(session => 
      session.taskName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [sessions, searchTerm]);

  // Daily Report Data
  const dailyData = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const todaySessions = filteredSessions.filter(session => session.date === today);
    
    const workSessions = todaySessions.filter(session => session.type === 'work');
    const totalPomodoros = workSessions.length;
    const totalWorkTime = workSessions.reduce((sum, session) => sum + session.duration, 0);
    
    const taskBreakdown = workSessions.reduce((acc, session) => {
      acc[session.taskName] = (acc[session.taskName] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const hourlyBreakdown = todaySessions.reduce((acc, session) => {
      const hour = new Date(session.completedAt).getHours();
      acc[hour] = (acc[hour] || 0) + 1;
      return acc;
    }, {} as Record<number, number>);

    return {
      totalPomodoros,
      totalWorkTime,
      taskBreakdown,
      hourlyBreakdown,
      sessions: todaySessions,
    };
  }, [filteredSessions]);

  // Weekly Report Data
  const weeklyData = useMemo(() => {
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay());
    weekStart.setHours(0, 0, 0, 0);

    const weekSessions = filteredSessions.filter(session => {
      const sessionDate = new Date(session.date + 'T00:00:00');
      return sessionDate >= weekStart;
    });

    const dailyBreakdown = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(weekStart);
      date.setDate(weekStart.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];
      const dayName = ['日', '一', '二', '三', '四', '五', '六'][i];
      
      const daySessions = weekSessions.filter(session => session.date === dateStr && session.type === 'work');
      
      return {
        day: dayName,
        date: dateStr,
        pomodoros: daySessions.length,
        workTime: daySessions.reduce((sum, session) => sum + session.duration, 0),
      };
    });

    const taskStats = weekSessions
      .filter(session => session.type === 'work')
      .reduce((acc, session) => {
        acc[session.taskName] = (acc[session.taskName] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

    return {
      dailyBreakdown,
      taskStats,
      totalPomodoros: weekSessions.filter(s => s.type === 'work').length,
    };
  }, [filteredSessions]);

  // Monthly Report Data
  const monthlyData = useMemo(() => {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    
    const monthSessions = filteredSessions.filter(session => {
      const sessionDate = new Date(session.date + 'T00:00:00');
      return sessionDate >= monthStart;
    });

    const weeklyBreakdown = Array.from({ length: 5 }, (_, weekIndex) => {
      const weekStart = new Date(monthStart);
      weekStart.setDate(monthStart.getDate() + weekIndex * 7);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);

      const weekSessions = monthSessions.filter(session => {
        const sessionDate = new Date(session.date + 'T00:00:00');
        return sessionDate >= weekStart && sessionDate <= weekEnd;
      }).filter(session => session.type === 'work');

      return {
        week: `第${weekIndex + 1}週`,
        pomodoros: weekSessions.length,
        workTime: weekSessions.reduce((sum, session) => sum + session.duration, 0),
      };
    }).filter(week => week.pomodoros > 0);

    const taskCategories = monthSessions
      .filter(session => session.type === 'work')
      .reduce((acc, session) => {
        acc[session.taskName] = (acc[session.taskName] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

    return {
      weeklyBreakdown,
      taskCategories,
      totalPomodoros: monthSessions.filter(s => s.type === 'work').length,
    };
  }, [filteredSessions]);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            生產力報表
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 mb-4">
            <Search className="w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="搜尋任務名稱..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="daily">日報表</TabsTrigger>
              <TabsTrigger value="weekly">週報表</TabsTrigger>
              <TabsTrigger value="monthly">月報表</TabsTrigger>
            </TabsList>

            <TabsContent value="daily" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-4 text-center">
                    <Target className="w-8 h-8 mx-auto mb-2 text-blue-500" />
                    <div className="text-2xl font-mono">{dailyData.totalPomodoros}</div>
                    <div className="text-sm text-muted-foreground">今日番茄鐘</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <Clock className="w-8 h-8 mx-auto mb-2 text-green-500" />
                    <div className="text-2xl font-mono">{Math.round(dailyData.totalWorkTime)}分</div>
                    <div className="text-sm text-muted-foreground">專注時間</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <Calendar className="w-8 h-8 mx-auto mb-2 text-purple-500" />
                    <div className="text-2xl font-mono">{Object.keys(dailyData.taskBreakdown).length}</div>
                    <div className="text-sm text-muted-foreground">任務類型</div>
                  </CardContent>
                </Card>
              </div>

              {Object.keys(dailyData.taskBreakdown).length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>任務分布</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={Object.entries(dailyData.taskBreakdown).map(([task, count]) => ({
                            name: task,
                            value: count,
                          }))}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {Object.entries(dailyData.taskBreakdown).map((_, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              )}

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0">
                  <CardTitle>今日時程</CardTitle>
                  {dailyData.sessions.length > 0 && onClearTodaySessions && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={onClearTodaySessions}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      清除全部
                    </Button>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {dailyData.sessions.map((session, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg group">
                        <div className="flex items-center gap-3">
                          <Badge variant={session.type === 'work' ? 'default' : 'secondary'}>
                            {session.type === 'work' ? '工作' : '休息'}
                          </Badge>
                          <span>{session.taskName}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="text-sm text-muted-foreground">
                            {new Date(session.completedAt).toLocaleTimeString('zh-TW', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </div>
                          {onDeleteSession && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onDeleteSession(session.id)}
                              className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive"
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                    {dailyData.sessions.length === 0 && (
                      <div className="text-center text-muted-foreground py-8">
                        今天還沒有完成任何番茄鐘
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="weekly" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>本週趨勢</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={weeklyData.dailyBreakdown}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="day" />
                      <YAxis />
                      <Tooltip
                        labelFormatter={(value) => `星期${value}`}
                        formatter={(value: number, name: string) => [
                          value,
                          name === 'pomodoros' ? '番茄鐘數' : '工作時間(分鐘)'
                        ]}
                      />
                      <Bar dataKey="pomodoros" fill="#8884d8" name="pomodoros" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>本週任務統計</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {Object.entries(weeklyData.taskStats)
                      .sort(([,a], [,b]) => b - a)
                      .map(([task, count]) => (
                        <div key={task} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                          <span>{task}</span>
                          <Badge>{count} 個番茄鐘</Badge>
                        </div>
                      ))}
                    {Object.keys(weeklyData.taskStats).length === 0 && (
                      <div className="text-center text-muted-foreground py-8">
                        本週還沒有完成任何番茄鐘
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="monthly" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>本月每週進度</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={monthlyData.weeklyBreakdown}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="week" />
                      <YAxis />
                      <Tooltip />
                      <Line 
                        type="monotone" 
                        dataKey="pomodoros" 
                        stroke="#8884d8" 
                        strokeWidth={2}
                        name="番茄鐘數"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>本月任務類別占比</CardTitle>
                </CardHeader>
                <CardContent>
                  {Object.keys(monthlyData.taskCategories).length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={Object.entries(monthlyData.taskCategories).map(([task, count]) => ({
                            name: task,
                            value: count,
                          }))}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {Object.entries(monthlyData.taskCategories).map((_, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="text-center text-muted-foreground py-8">
                      本月還沒有完成任何番茄鐘
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}