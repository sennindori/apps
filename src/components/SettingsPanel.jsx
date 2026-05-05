import React from 'react';
import { Settings2, ChevronRight, Tag } from 'lucide-react';

export function SettingsPanel({ isOpen, setIsOpen, labels, updateLabel }) {
  return (
    <div className="space-y-4">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-5 bg-surface border border-border rounded-2xl text-base-text hover:border-primary/30 hover:bg-white transition-all shadow-sm"
      >
        <div className="flex items-center gap-3 font-semibold">
          <Settings2 className="w-5 h-5 text-primary" />
          カテゴリ名称の編集
        </div>
        <ChevronRight className={`w-5 h-5 transition-transform ${isOpen ? 'rotate-90' : ''}`} />
      </button>

      {isOpen && (
        <div className="bg-surface p-5 rounded-2xl border border-border space-y-3">
          {labels.map((lbl, idx) => (
            <div key={idx} className="relative">
              <input
                type="text"
                value={lbl}
                onFocus={() => updateLabel(idx, '')}
                onChange={(e) => updateLabel(idx, e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white border border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm font-medium"
                placeholder={`名称 ${idx + 1} を入力...`}
              />
              <Tag className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
