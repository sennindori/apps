import React from 'react';
import { Trash2 } from 'lucide-react';
import { formatJapaneseDate } from '../../lib/utils';

export function DeleteModal({ record, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-6">
      <div 
        onClick={onCancel}
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
      />
      <div
        className="bg-white p-8 rounded-[40px] shadow-2xl relative z-10 w-full max-w-sm flex flex-col gap-6"
      >
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center">
            <Trash2 className="w-8 h-8 text-accent" />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-black text-slate-800">実績の削除</h3>
            <p className="text-sm font-bold text-slate-400">この記録を削除してもよろしいですか？<br/>この操作は取り消せません。</p>
          </div>
        </div>

        <div className="bg-surface p-4 rounded-2xl border border-border">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">対象データ</p>
          <p className="font-black text-primary">{record.label}</p>
          <p className="text-sm font-bold text-slate-500">{formatJapaneseDate(record.date)} — {record.count}点 / {record.hours}h</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <button 
            onClick={onCancel}
            className="py-4 bg-slate-50 text-slate-500 font-bold rounded-2xl hover:bg-slate-100 transition-all"
          >
            いいえ
          </button>
          <button 
            onClick={onConfirm}
            className="py-4 bg-accent text-white font-bold rounded-2xl shadow-lg shadow-accent/20 hover:brightness-105 active:scale-[0.98] transition-all"
          >
            削除する
          </button>
        </div>
      </div>
    </div>
  );
}
