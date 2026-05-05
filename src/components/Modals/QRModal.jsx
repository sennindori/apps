import React from 'react';
import { formatJapaneseDate, recordToDataString } from '../../lib/utils';
import { QR } from '../QR';

export function QRModal({ record, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
      <div 
        onClick={onClose}
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
      />
      <div
        className="bg-white p-8 rounded-[40px] shadow-2xl relative z-10 w-full max-w-sm flex flex-col items-center gap-6"
      >
        <div className="text-center space-y-2">
          <h3 className="text-xl font-black text-primary">{record.label || '実績データ'}</h3>
          <p className="text-sm font-bold text-slate-400">{formatJapaneseDate(record.date)}の実績を転記用QR化</p>
        </div>

        <div className="bg-surface p-6 rounded-3xl border border-border shadow-inner">
          <QR 
            value={`${recordToDataString(record)}`}
            size={200}
            color="#00A99D"
          />
        </div>

        <div className="grid grid-cols-2 gap-4 w-full">
          <div className="bg-surface p-4 rounded-2xl border border-border text-center">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">点数</p>
            <p className="text-xl font-black text-base-text">{record.count}点</p>
          </div>
          <div className="bg-surface p-4 rounded-2xl border border-border text-center">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">所要時間</p>
            <p className="text-xl font-black text-base-text">{record.hours}h</p>
          </div>
        </div>

        <div className="w-full space-y-3">
          <p className="text-[10px] text-center text-slate-400 font-medium leading-relaxed">
            PCでスキャンしてスプレッドシート等に貼り付けると、<br/>
            点数と時間が自動で2つの行に分かれます。
          </p>
          <button 
            onClick={onClose}
            className="w-full py-4 bg-primary text-white font-bold rounded-2xl shadow-lg shadow-primary/20 hover:brightness-105 active:scale-[0.98] transition-all"
          >
            閉じる
          </button>
        </div>
      </div>
    </div>
  );
}
