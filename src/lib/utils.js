export function getLocalDate() {
  return new Date().toLocaleDateString('sv-SE');
}

export function recordToDataString(record) {
  return `${record.count}\n${record.hours}`;
}

export function formatJapaneseDate(dateString) {
  const d = new Date(dateString);
  const weekDays = ['日', '月', '火', '水', '木', '金', '土'];
  return `${d.getMonth() + 1}/${d.getDate()} (${weekDays[d.getDay()]})`;
}

export function getYearDisplay(dateString) {
  const d = new Date(dateString);
  const westernYear = d.getFullYear();
  const eraYear = new Intl.DateTimeFormat('ja-JP-u-ca-japanese', { era: 'long', year: 'numeric' }).format(d);
  return `${westernYear}-${eraYear}`;
}

export function getMonthDayDisplay(dateString) {
  const d = new Date(dateString);
  const weekDays = ['日', '月', '火', '水', '木', '金', '土'];
  return `${d.getMonth() + 1}月${d.getDate()}日 (${weekDays[d.getDay()]})`;
}
