import React from 'react';
import { Calendar, Clock, QrCode, Trash2 } from 'lucide-react';
import { formatJapaneseDate } from '../lib/utils';

export function RecordCard({ record, onEdit, onShowQR, onDelete }) {
  return (
    <div
      onClick={onEdit}
      className="group bg-surface p-6 rounded-2xl border border-border shadow-sm hover:shadow-md transition-all relative overflow-hidden cursor-pointer"
    >
      <div className="absolute top-0 left-0 w-1.5 h-full bg-primary/20 group-hover:bg-primary transition-colors" />
      
      <div className="flex flex-col gap-4">
        {/* Row 1: Label */}
        <div>
          <span className="text-lg font-black text-primary tracking-tight">
            {record.label || '(無題)'}
          </span>
        </div>

        {/* Row 2: Date, Time */}
        <div className="flex items-center gap-3 border-y border-border/50 py-3">
          <span className="text-[11px] font-bold text-slate-500 font-mono tracking-tight bg-white px-2 py-1 rounded border border-border shadow-sm flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-primary" />
            {formatJapaneseDate(record.date)}
          </span>
          {record.registeredAt && (
            <span className="text-[10px] font-bold text-slate-400 uppercase bg-white/50 px-2 py-1 rounded border border-border/50 flex items-center gap-1.5">
              <Clock className="w-3 h-3" />
              {new Date(record.registeredAt).toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })}
            </span>
          )}
        </div>

        {/* Row 3: Stats & Actions */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-8">
            <div className="flex flex-col">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">処理点数</span>
              <span className="text-2xl font-black text-base-text">{record.count}<small className="text-xs opacity-40 font-bold ml-1">点</small></span>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">所要時間</span>
              <span className="text-2xl font-black text-base-text">{record.hours.toFixed(1)}<small className="text-xs opacity-40 font-bold ml-1">h</small></span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button 
              onClick={(e) => {
                e.stopPropagation();
                onShowQR();
              }}
              className="p-2.5 bg-white text-slate-300 hover:text-primary hover:border-primary/30 border border-border rounded-xl transition-all shadow-sm"
              title="QRコード生成"
            >
              <QrCode className="w-4 h-4" />
            </button>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              className="p-2.5 bg-white text-slate-300 hover:text-accent hover:border-accent/30 border border-border rounded-xl transition-all shadow-sm"
              title="削除"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
