import React, { useState } from 'react';
import { Calendar, Hash, Clock } from 'lucide-react';
import { formatJapaneseDate } from '../../lib/utils';

export function EditModal({ record, onSave, onCancel }) {
  const [countInput, setCountInput] = useState(record.count.toString());
  const [hours, setHours] = useState(record.hours);
  const [date, setDate] = useState(record.date);

  const handleSave = () => {
    const newCount = parseInt(countInput) || 0;
    if (newCount <= 0) return;
    onSave(newCount, hours, date);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
      <div 
        onClick={onCancel}
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
      />
      <div
        className="bg-white p-8 rounded-[40px] shadow-2xl relative z-10 w-full max-w-sm flex flex-col gap-6"
      >
        <div className="text-center space-y-2">
          <h3 className="text-xl font-black text-primary">実績の修正</h3>
          <p className="text-sm font-bold text-slate-400">{record.label} ({formatJapaneseDate(record.date)})</p>
        </div>

        <div className="space-y-6">
          <div>
            <label className="flex items-center gap-2 text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2">
              <Calendar className="w-3.5 h-3.5 text-primary" />
              日付の変更
            </label>
            <input 
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full p-4 bg-surface border border-border rounded-2xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-bold text-slate-700"
            />
          </div>

          <div>
            <label className="flex items-center gap-2 text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2">
              <Hash className="w-3.5 h-3.5 text-primary" />
              処理点数
            </label>
            <div className="flex items-center gap-3">
              <input 
                type="number"
                value={countInput}
                onChange={(e) => setCountInput(e.target.value)}
                className="w-full p-4 bg-surface border border-border rounded-2xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-black text-2xl text-primary"
              />
              <span className="font-bold text-slate-400">点</span>
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="flex items-center gap-2 text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                <Clock className="w-3.5 h-3.5 text-primary" />
                所要時間 (h)
              </label>
              <span className="font-black text-lg text-primary">{hours.toFixed(1)}h</span>
            </div>
            <input 
              type="range" 
              min="0" 
              max="12" 
              step="0.5" 
              value={hours}
              onChange={(e) => setHours(parseFloat(e.target.value))}
              className="w-full h-4 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-primary"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mt-2">
          <button 
            onClick={onCancel}
            className="py-4 bg-slate-50 text-slate-500 font-bold rounded-2xl hover:bg-slate-100 transition-all"
          >
            キャンセル
          </button>
          <button 
            onClick={handleSave}
            className="py-4 bg-primary text-white font-bold rounded-2xl shadow-lg shadow-primary/20 hover:brightness-105 active:scale-[0.98] transition-all"
          >
            保存する
          </button>
        </div>
      </div>
    </div>
  );
}
