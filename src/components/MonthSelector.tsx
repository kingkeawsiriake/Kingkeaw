import { ChevronLeft, ChevronRight, Calendar, Download } from 'lucide-react';
import { formatThaiMonthYear, THAI_MONTHS } from '../types.ts';

interface MonthSelectorProps {
  currentMonth: string; // 'YYYY-MM'
  onChangeMonth: (newMonth: string) => void;
  onExportCsv?: () => void;
  hasTransactions?: boolean;
}

export function MonthSelector({ 
  currentMonth, 
  onChangeMonth,
  onExportCsv,
  hasTransactions = false
}: MonthSelectorProps) {
  const [yearStr, monthStr] = currentMonth.split('-');
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10);

  const handlePrev = () => {
    let newYear = year;
    let newMonth = month - 1;
    if (newMonth < 1) {
      newMonth = 12;
      newYear -= 1;
    }
    onChangeMonth(`${newYear}-${String(newMonth).padStart(2, '0')}`);
  };

  const handleNext = () => {
    let newYear = year;
    let newMonth = month + 1;
    if (newMonth > 12) {
      newMonth = 1;
      newYear += 1;
    }
    onChangeMonth(`${newYear}-${String(newMonth).padStart(2, '0')}`);
  };

  const handleToday = () => {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    onChangeMonth(`${y}-${m}`);
  };

  // Generate list of years (current year - 3 to current year + 2)
  const currentYearNum = new Date().getFullYear();
  const yearOptions = [currentYearNum - 2, currentYearNum - 1, currentYearNum, currentYearNum + 1];

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs">
      <div className="flex items-center space-x-2">
        <button
          id="prev-month-btn"
          onClick={handlePrev}
          title="เดือนก่อนหน้า"
          className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition active:scale-95"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-2 px-3 py-1 bg-slate-50 border border-slate-200 rounded-xl">
          <Calendar className="w-4 h-4 text-indigo-600" />
          <span className="font-semibold text-slate-800 text-sm md:text-base">
            {formatThaiMonthYear(currentMonth)}
          </span>
        </div>

        <button
          id="next-month-btn"
          onClick={handleNext}
          title="เดือนถัดไป"
          className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition active:scale-95"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      <div className="flex items-center space-x-2">
        <select
          aria-label="เลือกเดือน"
          value={month}
          onChange={(e) => {
            const m = String(e.target.value).padStart(2, '0');
            onChangeMonth(`${year}-${m}`);
          }}
          className="text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          {THAI_MONTHS.map((name, idx) => (
            <option key={name} value={idx + 1}>
              {name}
            </option>
          ))}
        </select>

        <select
          aria-label="เลือกปี"
          value={year}
          onChange={(e) => {
            onChangeMonth(`${e.target.value}-${String(month).padStart(2, '0')}`);
          }}
          className="text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          {yearOptions.map((y) => (
            <option key={y} value={y}>
              {y + 543} ({y})
            </option>
          ))}
        </select>

        <button
          onClick={handleToday}
          className="text-xs sm:text-sm font-medium text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-xl transition"
        >
          เดือนนี้
        </button>

        {onExportCsv && (
          <button
            id="month-export-csv-btn"
            onClick={onExportCsv}
            disabled={!hasTransactions}
            title={hasTransactions ? `ส่งออกข้อมูลเดือนนี้เป็นไฟล์ Excel/CSV` : 'ไม่มีรายการในเดือนนี้'}
            className="inline-flex items-center text-xs sm:text-sm font-medium text-slate-700 hover:text-indigo-600 bg-slate-100 hover:bg-indigo-50 border border-slate-200/90 px-3 py-1.5 rounded-xl transition disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 mr-1.5 text-slate-500" />
            <span>ส่งออก CSV</span>
          </button>
        )}
      </div>
    </div>
  );
}
