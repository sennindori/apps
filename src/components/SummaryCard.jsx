import React from 'react';
import { Calendar, Clock, Box } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { getYearDisplay, getMonthDayDisplay } from '../lib/utils';

export function SummaryCard({ 
  date, 
  totalHours, 
  totalCount, 
  chartData, 
  isOverLimit, 
  lastRegisteredAt 
}) {
  return (
    <div className="bg-surface p-7 rounded-[32px] border border-border shadow-md shadow-slate-100 flex flex-col md:flex-row md:items-center gap-8 min-w-[280px]">
      <div className="flex-1 space-y-5">
        <div className="flex items-center gap-4 border-b border-border/80 pb-5">
          <div className="p-2.5 bg-white rounded-xl border border-border shadow-sm">
            <Calendar className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">{getYearDisplay(date)}</p>
            <p className="text-2xl font-black text-primary tracking-tight leading-none">{getMonthDayDisplay(date)}</p>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-x-8 gap-y-4">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              <Clock className="w-3 h-3" />
              所要時間
            </div>
            <p className="text-3xl font-black text-primary leading-none">
              {totalHours.toFixed(1)}<small className="text-xs font-bold opacity-40 ml-1">h</small>
            </p>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              <Box className="w-3 h-3" />
              実績点数
            </div>
            <p className="text-3xl font-black text-primary leading-none">
              {totalCount}<small className="text-xs font-bold opacity-40 ml-1">点</small>
            </p>
          </div>
          {lastRegisteredAt && (
            <div className="col-span-2 pt-2 border-t border-border/50 flex items-center justify-between">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">前回登録</span>
              <span className="text-[11px] font-black text-slate-500 font-mono bg-white px-2 py-0.5 rounded border border-border/50">
                {new Date(lastRegisteredAt).toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Chart Section */}
      <div className="w-32 h-32 relative flex-shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              innerRadius={38}
              outerRadius={50}
              paddingAngle={0}
              dataKey="value"
              startAngle={90}
              endAngle={-270}
              stroke="none"
            >
              <Cell fill={isOverLimit ? "#FF7F50" : "#00A99D"} />
              <Cell fill="#E2E8F0" />
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className={`text-[10px] font-bold tracking-widest uppercase ${isOverLimit ? 'text-accent' : 'text-slate-400'}`}>
            {isOverLimit ? 'Over' : 'Goal'}
          </span>
          <span className={`text-sm font-black ${isOverLimit ? 'text-accent' : 'text-primary'}`}>
            8h
          </span>
        </div>
      </div>
    </div>
  );
}
