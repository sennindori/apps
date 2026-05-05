import React, { useState, useEffect, useMemo } from 'react';
import { 
  Calendar, 
  Tag, 
  Hash, 
  Clock, 
  Plus, 
  Trash2, 
  QrCode,
  Settings2, 
  ChevronRight,
  TrendingUp,
  Box,
  CheckCircle2,
  Delete,
  X
} from 'lucide-react';
import QRious from 'qrious';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

function QR({ value, size = 200, color = "#00A99D" }: { value: string, size?: number, color?: string }) {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);

  React.useEffect(() => {
    if (canvasRef.current) {
      new QRious({
        element: canvasRef.current,
        value: value,
        size: size,
        foreground: color,
        background: 'transparent',
        level: 'H'
      });
    }
  }, [value, size, color]);

  return <canvas ref={canvasRef} className="max-w-full h-auto" />;
}

interface Record {
  id: string;
  date: string;
  label: string;
  count: number;
  hours: number;
  registeredAt: string; // 登録時刻
}

const DEFAULT_LABELS = ['事務作業', '会議', 'メール', '開発', '休憩'];

export default function App() {
  // --- State ---
  const [labels, setLabels] = useState<string[]>(() => {
    const saved = localStorage.getItem('biz_tracker_labels');
    return saved ? JSON.parse(saved) : DEFAULT_LABELS;
  });

  const [records, setRecords] = useState<Record[]>(() => {
    const saved = localStorage.getItem('biz_tracker_records');
    return saved ? JSON.parse(saved) : [];
  });

  const getLocalDate = () => {
    return new Date().toLocaleDateString('sv-SE');
  };

  const [date, setDate] = useState(getLocalDate());
  const [label, setLabel] = useState(labels[0]);
  const [countInput, setCountInput] = useState('0');
  const [hours, setHours] = useState<number>(0.5);
  const [isManualHours, setIsManualHours] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [qrRecord, setQrRecord] = useState<Record | null>(null);
  const [editingRecord, setEditingRecord] = useState<Record | null>(null);
  const [recordToDelete, setRecordToDelete] = useState<Record | null>(null);
  const [editCountInput, setEditCountInput] = useState('');
  const [editHours, setEditHours] = useState(0);
  const [editDate, setEditDate] = useState('');

  const count = parseInt(countInput) || 0;

  // --- Persistence ---
  useEffect(() => {
    localStorage.setItem('biz_tracker_labels', JSON.stringify(labels));
  }, [labels]);

  useEffect(() => {
    localStorage.setItem('biz_tracker_records', JSON.stringify(records));
  }, [records]);

  // Sync label selection if labels change
  useEffect(() => {
    if (!labels.includes(label)) {
      setLabel(labels[0]);
    }
  }, [labels, label]);

  // --- Actions ---
  const handleAddRecord = () => {
    if (!date || !label || count <= 0) return;

    const now = new Date().toISOString();

    setRecords(prev => {
      const existingIndex = prev.findIndex(r => r.date === date && r.label === label);
      
      if (existingIndex > -1) {
        const newRecords = [...prev];
        newRecords[existingIndex] = {
          ...newRecords[existingIndex],
          count: newRecords[existingIndex].count + count,
          hours: Number((newRecords[existingIndex].hours + hours).toFixed(1)),
          registeredAt: now // 合算時は最新の登録時刻に更新
        };
        return newRecords;
      }

      return [
        ...prev,
        {
          id: crypto.randomUUID(),
          date,
          label,
          count,
          hours,
          registeredAt: now
        }
      ];
    });

    // Success Feedback
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 2000);

    // Reset some fields
    setCountInput('0');
    setHours(0.5);
    setIsManualHours(false);
    setDate(getLocalDate());
  };

  const handleConfirmDelete = () => {
    if (recordToDelete) {
      setRecords(prev => prev.filter(r => r.id !== recordToDelete.id));
      setRecordToDelete(null);
    }
  };

  const handleEditClick = (record: Record) => {
    setEditingRecord(record);
    setEditCountInput(record.count.toString());
    setEditHours(record.hours);
    setEditDate(record.date);
  };

  const handleUpdateRecord = () => {
    if (!editingRecord) return;
    const newCount = parseInt(editCountInput) || 0;
    if (newCount <= 0) return;

    setRecords(prev => prev.map(r => 
      r.id === editingRecord.id 
        ? { ...r, count: newCount, hours: editHours, date: editDate }
        : r
    ));
    setEditingRecord(null);
  };

  const updateLabel = (index: number, value: string) => {
    const newLabels = [...labels];
    newLabels[index] = value;
    setLabels(newLabels);
  };

  const handleKeypadPress = (key: string) => {
    setCountInput(prev => {
      if (key === 'clear') return '1';
      if (key === 'back') {
        if (prev.length <= 1) return '0';
        return prev.slice(0, -1);
      }
      if (prev === '0') return key;
      if (prev.length >= 4) return prev; // Limit to 4 digits
      return prev + key;
    });
  };

  // --- Derived ---
  const today = getLocalDate();

  const sortedRecords = useMemo(() => {
    return [...records].sort((a, b) => b.date.localeCompare(a.date));
  }, [records]);

  const stats = useMemo(() => {
    const todayRecords = records.filter(r => r.date === today);
    const totalHours = todayRecords.reduce((sum, r) => sum + r.hours, 0);
    const totalCount = todayRecords.reduce((sum, r) => sum + r.count, 0);
    
    // Find most recent registration overall
    const lastReg = records.length > 0 
      ? Math.max(...records.map(r => new Date(r.registeredAt).getTime()))
      : null;

    // Chart data for circular progress (8 hour max)
    const chartData = [
      { name: 'Completed', value: Math.min(totalHours, 8) },
      { name: 'Remaining', value: Math.max(0, 8 - totalHours) }
    ];
    
    const isOverLimit = totalHours > 8;
    
    return { 
      totalHours, 
      totalCount, 
      chartData, 
      isOverLimit,
      lastRegisteredAt: lastReg,
      hasTodayRecords: todayRecords.length > 0
    };
  }, [records, today]);

  // Suggested hours based on time since last registration
  useEffect(() => {
    const updateSuggestedHours = () => {
      if (!isManualHours) {
        // If first registration of the day, default to 1.0
        if (!stats.hasTodayRecords) {
          setHours(1.0);
          return;
        }

        if (stats.lastRegisteredAt) {
          const now = new Date().getTime();
          const diffMs = now - stats.lastRegisteredAt;
          const diffHrs = diffMs / (1000 * 60 * 60);
          
          // Round to nearest 0.5, clamped between 0.5 and 8.0
          let suggested = 0.5;
          if (diffHrs > 0 && diffHrs <= 12) {
            suggested = Math.round(diffHrs * 2) / 2;
            if (suggested < 0.5) suggested = 0.5;
            if (suggested > 8.0) suggested = 8.0;
          } else if (diffHrs > 12) {
            // More than 12 hours since last registro usually means a fresh start
            suggested = 1.0;
          }
          setHours(suggested);
        }
      }
    };

    updateSuggestedHours();
    const interval = setInterval(updateSuggestedHours, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [stats.lastRegisteredAt, isManualHours, records.length]);

  return (
    <div className="max-w-4xl mx-auto px-6 py-12 md:py-16">
      {/* Header */}
      <header className="mb-12 flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div>
          <div className="flex items-center gap-4 mb-3">
            <div className="p-3 bg-primary rounded-2xl shadow-lg shadow-primary/10">
              <TrendingUp className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-primary">作業メモ電卓</h1>
          </div>
          <p className="text-slate-500 font-medium ml-1">日々の業務成果を確実に記録するメモ</p>
        </div>
        
        {/* Today's Summary Card */}
        <div className="bg-surface p-7 rounded-[32px] border border-border shadow-md shadow-slate-100 flex flex-col md:flex-row md:items-center gap-8 min-w-[280px]">
          <div className="flex-1 space-y-5">
            <div className="flex items-center gap-4 border-b border-border/80 pb-5">
              <div className="p-2.5 bg-white rounded-xl border border-border shadow-sm">
                <Calendar className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">{getYearDisplay(today)}</p>
                <p className="text-2xl font-black text-primary tracking-tight leading-none">{getMonthDayDisplay(today)}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-x-8 gap-y-4">
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  <Clock className="w-3 h-3" />
                  所要時間
                </div>
                <p className="text-3xl font-black text-primary leading-none">
                  {stats.totalHours.toFixed(1)}<small className="text-xs font-bold opacity-40 ml-1">h</small>
                </p>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  <Box className="w-3 h-3" />
                  実績点数
                </div>
                <p className="text-3xl font-black text-primary leading-none">
                  {stats.totalCount}<small className="text-xs font-bold opacity-40 ml-1">点</small>
                </p>
              </div>
              {stats.lastRegisteredAt && (
                <div className="col-span-2 pt-2 border-t border-border/50 flex items-center justify-between">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">前回登録</span>
                  <span className="text-[11px] font-black text-slate-500 font-mono bg-white px-2 py-0.5 rounded border border-border/50">
                    {new Date(stats.lastRegisteredAt).toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })}
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
                  data={stats.chartData}
                  innerRadius={38}
                  outerRadius={50}
                  paddingAngle={0}
                  dataKey="value"
                  startAngle={90}
                  endAngle={-270}
                  stroke="none"
                >
                  <Cell fill={stats.isOverLimit ? "#FF7F50" : "#00A99D"} />
                  <Cell fill="#E2E8F0" />
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className={`text-[10px] font-bold tracking-widest uppercase ${stats.isOverLimit ? 'text-accent' : 'text-slate-400'}`}>
                {stats.isOverLimit ? 'Over' : 'Goal'}
              </span>
              <span className={`text-sm font-black ${stats.isOverLimit ? 'text-accent' : 'text-primary'}`}>
                8h
              </span>
            </div>
          </div>
        </div>
      </header>

      <main className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left Column: Inputs */}
        <div className="lg:col-span-5 space-y-8">
          {/* Settings Toggle */}
          <button 
            onClick={() => setIsSettingsOpen(!isSettingsOpen)}
            className="w-full flex items-center justify-between p-5 bg-surface border border-border rounded-2xl text-base-text hover:border-primary/30 hover:bg-white transition-all shadow-sm"
          >
            <div className="flex items-center gap-3 font-semibold">
              <Settings2 className="w-5 h-5 text-primary" />
              カテゴリ名称の編集
            </div>
            <ChevronRight className={`w-5 h-5 transition-transform ${isSettingsOpen ? 'rotate-90' : ''}`} />
          </button>

          {/* Settings Content */}
          {isSettingsOpen && (
            <div className="bg-surface p-5 rounded-2xl border border-border space-y-3 mb-8">
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

          {/* Registration Form */}
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
                
                {/* Count Display */}
                <div className="w-full p-5 mb-5 bg-white border border-border rounded-2xl flex items-center justify-between shadow-inner">
                  <span className="text-slate-400 text-[11px] font-bold font-mono tracking-widest uppercase">Input Points</span>
                  <span className="text-4xl font-black text-primary font-mono">{countInput}</span>
                </div>

                {/* Ten-Key Pad */}
                <div className="grid grid-cols-3 gap-2.5">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                    <KeypadButton key={num} onClick={() => handleKeypadPress(num.toString())}>
                      {num}
                    </KeypadButton>
                  ))}
                  <KeypadButton 
                    onClick={() => handleKeypadPress('clear')} 
                    className="bg-white text-accent hover:border-accent/30"
                  >
                    <X className="w-5 h-5" />
                  </KeypadButton>
                  <KeypadButton onClick={() => handleKeypadPress('0')}>
                    0
                  </KeypadButton>
                  <KeypadButton 
                    onClick={() => handleKeypadPress('back')} 
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
                onClick={handleAddRecord}
                disabled={count === 0}
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
        </div>

        {/* Right Column: History */}
        <div className="lg:col-span-7">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-base-text flex items-center gap-3">
              <Calendar className="w-6 h-6 text-primary" />
              実績ログ一覧
            </h2>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{records.length} 点のデータ</span>
          </div>

          <div className="space-y-6">
            {sortedRecords.length > 0 ? (
              sortedRecords.map((record) => (
                <div
                  key={record.id}
                  onClick={() => handleEditClick(record)}
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
                            setQrRecord(record);
                          }}
                          className="p-2.5 bg-white text-slate-300 hover:text-primary hover:border-primary/30 border border-border rounded-xl transition-all shadow-sm"
                          title="QRコード生成"
                        >
                          <QrCode className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setRecordToDelete(record);
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
              ))
            ) : (
              <div className="py-24 text-center bg-surface rounded-3xl border-2 border-dashed border-border shadow-inner">
                <div className="bg-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm border border-border">
                  <TrendingUp className="w-8 h-8 text-slate-200" />
                </div>
                <p className="text-slate-500 font-bold italic">データはまだ登録されていません</p>
                <p className="text-slate-400 text-sm mt-2">日々の業務実績を上のフォームから登録しましょう</p>
              </div>
            )}
          </div>
        </div>
      </main>

      <footer className="mt-20 mb-12 flex flex-col items-center gap-8">
        <div className="bg-surface p-6 rounded-3xl border border-border shadow-lg flex flex-col items-center gap-4">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest text-center">Mobile Access</p>
          <div className="bg-white p-3 rounded-2xl border border-border shadow-inner">
            <QR 
              value={window.location.origin} 
              size={140}
              color="#00A99D"
            />
          </div>
          <p className="text-[11px] font-mono text-slate-400 max-w-[200px] break-all text-center leading-relaxed">
            {window.location.origin}
          </p>
        </div>

        <div className="text-center text-slate-400 text-xs font-bold tracking-widest uppercase opacity-60">
          &copy; {new Date().getFullYear()} 作業メモ電卓 — シンプルで確実な業務実績管理
        </div>
      </footer>

      {/* QR Code Modal */}
      {qrRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
          <div 
            onClick={() => setQrRecord(null)}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          />
          <div
            className="bg-white p-8 rounded-[40px] shadow-2xl relative z-10 w-full max-w-sm flex flex-col items-center gap-6"
          >
            <div className="text-center space-y-2">
              <h3 className="text-xl font-black text-primary">{qrRecord.label || '実績データ'}</h3>
              <p className="text-sm font-bold text-slate-400">{formatJapaneseDate(qrRecord.date)}の実績を転記用QR化</p>
            </div>

            <div className="bg-surface p-6 rounded-3xl border border-border shadow-inner">
              <QR 
                value={`${recordToDataString(qrRecord)}`}
                size={200}
                color="#00A99D"
              />
            </div>

            <div className="grid grid-cols-2 gap-4 w-full">
              <div className="bg-surface p-4 rounded-2xl border border-border text-center">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">点数</p>
                <p className="text-xl font-black text-base-text">{qrRecord.count}点</p>
              </div>
              <div className="bg-surface p-4 rounded-2xl border border-border text-center">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">所要時間</p>
                <p className="text-xl font-black text-base-text">{qrRecord.hours}h</p>
              </div>
            </div>

            <div className="w-full space-y-3">
              <p className="text-[10px] text-center text-slate-400 font-medium leading-relaxed">
                PCでスキャンしてスプレッドシート等に貼り付けると、<br/>
                点数と時間が自動で2つの行に分かれます。
              </p>
              <button 
                onClick={() => setQrRecord(null)}
                className="w-full py-4 bg-primary text-white font-bold rounded-2xl shadow-lg shadow-primary/20 hover:brightness-105 active:scale-[0.98] transition-all"
              >
                閉じる
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Record Modal */}
      {editingRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
          <div 
            onClick={() => setEditingRecord(null)}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          />
          <div
            className="bg-white p-8 rounded-[40px] shadow-2xl relative z-10 w-full max-w-sm flex flex-col gap-6"
          >
            <div className="text-center space-y-2">
              <h3 className="text-xl font-black text-primary">実績の修正</h3>
              <p className="text-sm font-bold text-slate-400">{editingRecord.label} ({formatJapaneseDate(editingRecord.date)})</p>
            </div>

            <div className="space-y-6">
              <div>
                <label className="flex items-center gap-2 text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                  <Calendar className="w-3.5 h-3.5 text-primary" />
                  日付の変更
                </label>
                <input 
                  type="date"
                  value={editDate}
                  onChange={(e) => setEditDate(e.target.value)}
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
                    value={editCountInput}
                    onChange={(e) => setEditCountInput(e.target.value)}
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
                  <span className="font-black text-lg text-primary">{editHours.toFixed(1)}h</span>
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max="12" 
                  step="0.5" 
                  value={editHours}
                  onChange={(e) => setEditHours(parseFloat(e.target.value))}
                  className="w-full h-4 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-primary"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-2">
              <button 
                onClick={() => setEditingRecord(null)}
                className="py-4 bg-slate-50 text-slate-500 font-bold rounded-2xl hover:bg-slate-100 transition-all"
              >
                キャンセル
              </button>
              <button 
                onClick={handleUpdateRecord}
                className="py-4 bg-primary text-white font-bold rounded-2xl shadow-lg shadow-primary/20 hover:brightness-105 active:scale-[0.98] transition-all"
              >
                保存する
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {recordToDelete && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-6">
          <div 
            onClick={() => setRecordToDelete(null)}
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
              <p className="font-black text-primary">{recordToDelete.label}</p>
              <p className="text-sm font-bold text-slate-500">{formatJapaneseDate(recordToDelete.date)} — {recordToDelete.count}点 / {recordToDelete.hours}h</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={() => setRecordToDelete(null)}
                className="py-4 bg-slate-50 text-slate-500 font-bold rounded-2xl hover:bg-slate-100 transition-all"
              >
                いいえ
              </button>
              <button 
                onClick={handleConfirmDelete}
                className="py-4 bg-accent text-white font-bold rounded-2xl shadow-lg shadow-accent/20 hover:brightness-105 active:scale-[0.98] transition-all"
              >
                削除する
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function recordToDataString(record: Record) {
  // 点数 [改行] 時間
  return `${record.count}\n${record.hours}`;
}

function KeypadButton({ children, onClick, className = "" }: { children: React.ReactNode, onClick: () => void, className?: string }) {
  return (
    <button
      onClick={onClick}
      className={`h-14 flex items-center justify-center bg-white border border-border rounded-2xl text-xl font-bold text-base-text shadow-sm active:scale-95 active:bg-slate-50 active:border-primary transition-all ${className}`}
    >
      {children}
    </button>
  );
}

function formatJapaneseDate(dateString: string) {
  const d = new Date(dateString);
  const weekDays = ['日', '月', '火', '水', '木', '金', '土'];
  return `${d.getMonth() + 1}/${d.getDate()} (${weekDays[d.getDay()]})`;
}

function getYearDisplay(dateString: string) {
  const d = new Date(dateString);
  const westernYear = d.getFullYear();
  const eraYear = new Intl.DateTimeFormat('ja-JP-u-ca-japanese', { era: 'long', year: 'numeric' }).format(d);
  return `${westernYear}-${eraYear}`;
}

function getMonthDayDisplay(dateString: string) {
  const d = new Date(dateString);
  const weekDays = ['日', '月', '火', '水', '木', '金', '土'];
  return `${d.getMonth() + 1}月${d.getDate()}日 (${weekDays[d.getDay()]})`;
}
