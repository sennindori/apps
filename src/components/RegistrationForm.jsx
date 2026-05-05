import React from 'react';
import { Calendar, Tag, Hash, Clock, Plus, CheckCircle2, X, Delete } from 'lucide-react';
import { KeypadButton } from './KeypadButton';

export function RegistrationForm({
  date, setDate, label, setLabel, labels, countInput, onKeypadPress, hours, setHours, setIsManualHours, onAdd, showSuccess, disabled
}) {
  return (
    <section className="bg-surface p-8 rounded-[32px] border border-border shadow-md shadow-slate-100 space-y-8">
      <div className="space-y-6">
        <div>
          <label className="flex items-center gap-2 text-sm font-bold text-base-text mb-2.5">
            <Calendar className="w-4 h-4 text-primary" />
            対象の作業日
          </label>
          <input 
            type="date" 
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full p-4 bg-white border border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-medium"
          />
        </div>

        <div>
          <label className="flex items-center gap-2 text-sm font-bold text-base-text mb-2.5">
            <Tag className="w-4 h-4 text-primary" />
            業務カテゴリ
          </label>
          <select 
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            className="w-full p-4 bg-white border border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-medium cursor-pointer"
          >
            {labels.map((l, idx) => (
              <option key={idx} value={l}>{l || `(未設定ラベル ${idx + 1})`}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="flex items-center gap-2 text-sm font-bold text-base-text mb-2.5">
            <Hash className="w-4 h-4 text-primary" />
            処理点数
          </label>
          
          <div className="w-full p-5 mb-5 bg-white border border-border rounded-2xl flex items-center justify-between shadow-inner">
            <span className="text-slate-400 text-[11px] font-bold font-mono tracking-widest uppercase">Input Points</span>
            <span className="text-4xl font-black text-primary font-mono">{countInput}</span>
          </div>

          <div className="grid grid-cols-3 gap-2.5">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
              <KeypadButton key={num} onClick={() => onKeypadPress(num.toString())}>
                {num}
              </KeypadButton>
            ))}
            <KeypadButton 
              onClick={() => onKeypadPress('clear')} 
              className="bg-white text-accent hover:border-accent/30"
            >
              <X className="w-5 h-5" />
            </KeypadButton>
            <KeypadButton onClick={() => onKeypadPress('0')}>
              0
            </KeypadButton>
            <KeypadButton 
              onClick={() => onKeypadPress('back')} 
              className="bg-white text-accent hover:border-accent/30"
            >
              <Delete className="w-5 h-5" />
            </KeypadButton>
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-4">
            <label className="flex items-center gap-2 text-sm font-bold text-base-text">
              <Clock className="w-4 h-4 text-primary" />
              所要時間 (Hour)
            </label>
            <span className="px-4 py-1.5 bg-white text-primary font-black rounded-lg text-xl ring-1 ring-border shadow-sm">
              {hours.toFixed(1)}h
            </span>
          </div>
          <input 
            type="range" 
            min="0" 
            max="8" 
            step="0.5" 
            value={hours}
            onChange={(e) => {
              setHours(parseFloat(e.target.value));
              setIsManualHours(true);
            }}
            className="w-full h-6 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-primary"
          />
          <div className="flex justify-between mt-3 px-1 text-[11px] uppercase tracking-wider font-bold text-slate-400">
            <span>0h</span>
            <span>2h</span>
            <span>4h</span>
            <span>6h</span>
            <span>8h</span>
          </div>
        </div>
      </div>

      <div className="relative pt-4">
        <button 
          onClick={onAdd}
          disabled={disabled}
          className={`w-full py-5 font-bold rounded-2xl shadow-xl transition-all flex items-center justify-center gap-3 active:scale-[0.98] ${
            showSuccess 
            ? 'bg-emerald-600 text-white shadow-emerald-200' 
            : 'bg-primary hover:brightness-105 disabled:opacity-30 disabled:grayscale text-white shadow-primary/20'
          }`}
        >
          {showSuccess ? (
            <>
              <CheckCircle2 className="w-6 h-6 animate-bounce" />
              記録が完了しました
            </>
          ) : (
            <>
              <Plus className="w-6 h-6" />
              業務実績を登録する
            </>
          )}
        </button>
      </div>
    </section>
  );
}
