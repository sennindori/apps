import React from 'react';

export function KeypadButton({ children, onClick, className = "" }) {
  return (
    <button
      onClick={onClick}
      className={`h-14 flex items-center justify-center bg-white border border-border rounded-2xl text-xl font-bold text-base-text shadow-sm active:scale-95 active:bg-slate-50 active:border-primary transition-all ${className}`}
    >
      {children}
    </button>
  );
}
