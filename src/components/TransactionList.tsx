import { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  Trash2, 
  Edit2, 
  Download, 
  Plus, 
  ReceiptText, 
  CreditCard,
  CalendarDays,
  FileSpreadsheet,
  ChevronDown
} from 'lucide-react';
import { 
  Transaction, 
  TransactionType, 
  formatCurrency, 
  formatThaiDate, 
  ALL_CATEGORIES 
} from '../types.ts';
import { CategoryIcon } from './CategoryIcon.tsx';
import { exportMonthTransactionsToCsv } from '../utils/exportCsv.ts';

interface TransactionListProps {
  transactions: Transaction[];
  onAddNew: () => void;
  onEdit: (tx: Transaction) => void;
  onDelete: (id: string) => Promise<void>;
  currentMonthName: string;
  currentMonthKey?: string;
  onNotify?: (message: string, type?: 'success' | 'info' | 'error') => void;
}

export function TransactionList({
  transactions,
  onAddNew,
  onEdit,
  onDelete,
  currentMonthName,
  currentMonthKey,
  onNotify
}: TransactionListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | TransactionType>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showExportOptions, setShowExportOptions] = useState(false);

  // Filter logic
  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      // Type match
      if (typeFilter !== 'all' && t.type !== typeFilter) {
        return false;
      }
      // Category match
      if (categoryFilter !== 'all' && t.category !== categoryFilter) {
        return false;
      }
      // Search term
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const matchNote = t.note?.toLowerCase().includes(q);
        const matchCat = t.category.toLowerCase().includes(q);
        const matchMethod = t.paymentMethod?.toLowerCase().includes(q);
        if (!matchNote && !matchCat && !matchMethod) {
          return false;
        }
      }
      return true;
    });
  }, [transactions, typeFilter, categoryFilter, searchTerm]);

  // Group by date (descending)
  const groupedByDate = useMemo(() => {
    const groups: { date: string; items: Transaction[]; dayIncome: number; dayExpense: number }[] = [];
    const dateMap: Record<string, { items: Transaction[]; dayIncome: number; dayExpense: number }> = {};

    // Sort items by createdAt descending
    const sorted = [...filteredTransactions].sort((a, b) => {
      if (b.date !== a.date) {
        return b.date.localeCompare(a.date);
      }
      return b.createdAt - a.createdAt;
    });

    sorted.forEach((t) => {
      if (!dateMap[t.date]) {
        dateMap[t.date] = { items: [], dayIncome: 0, dayExpense: 0 };
        groups.push({ date: t.date, items: dateMap[t.date].items, dayIncome: 0, dayExpense: 0 });
      }
      dateMap[t.date].items.push(t);
      if (t.type === 'income') {
        dateMap[t.date].dayIncome += t.amount;
      } else {
        dateMap[t.date].dayExpense += t.amount;
      }
    });

    // update totals in groups
    groups.forEach((g) => {
      g.dayIncome = dateMap[g.date].dayIncome;
      g.dayExpense = dateMap[g.date].dayExpense;
    });

    return groups;
  }, [filteredTransactions]);

  const handleDelete = async (id: string) => {
    if (window.confirm('คุณแน่ใจหรือไม่ว่าต้องการลบรายการนี้?')) {
      try {
        setDeletingId(id);
        await onDelete(id);
      } finally {
        setDeletingId(null);
      }
    }
  };

  const isFiltered = filteredTransactions.length !== transactions.length;

  const handleExportAll = () => {
    if (transactions.length === 0) {
      onNotify?.('ไม่มีรายการธุรกรรมในเดือนนี้สำหรับส่งออก', 'info');
      return;
    }
    const success = exportMonthTransactionsToCsv(transactions, {
      monthName: currentMonthName,
      yearMonth: currentMonthKey || 'current_month'
    });
    if (success) {
      onNotify?.(`ส่งออกไฟล์ CSV ประจำเดือน ${currentMonthName} เรียบร้อยแล้ว (${transactions.length} รายการ)`, 'success');
    }
    setShowExportOptions(false);
  };

  const handleExportFiltered = () => {
    if (filteredTransactions.length === 0) {
      onNotify?.('ไม่มีรายการที่ตรงกับตัวกรองสำหรับส่งออก', 'info');
      return;
    }
    const success = exportMonthTransactionsToCsv(filteredTransactions, {
      monthName: `${currentMonthName} (เฉพาะผลการค้นหา/กรอง)`,
      yearMonth: `${currentMonthKey || 'current_month'}_filtered`
    });
    if (success) {
      onNotify?.(`ส่งออกรายการที่กรอง (${filteredTransactions.length} รายการ) เรียบร้อยแล้ว`, 'success');
    }
    setShowExportOptions(false);
  };

  const handleExportClick = () => {
    if (transactions.length === 0) {
      onNotify?.('ไม่มีรายการธุรกรรมในเดือนนี้สำหรับส่งออก', 'info');
      return;
    }
    if (isFiltered && filteredTransactions.length > 0) {
      setShowExportOptions((prev) => !prev);
    } else {
      handleExportAll();
    }
  };

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
      {/* Top Header & Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5 pb-4 border-b border-slate-100">
        <div>
          <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
            <ReceiptText className="w-5 h-5 text-indigo-600" />
            รายการธุรกรรม
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium">
              {filteredTransactions.length} รายการ
            </span>
          </h2>
          <p className="text-xs text-slate-500">
            รายการบันทึกรายรับและรายจ่ายประจำเดือน
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {transactions.length > 0 && (
            <div className="relative">
              <button
                id="export-csv-btn"
                onClick={handleExportClick}
                className="inline-flex items-center px-3.5 py-2 text-xs font-semibold text-slate-700 hover:text-indigo-700 bg-slate-100 hover:bg-indigo-50 border border-slate-200/80 rounded-xl transition cursor-pointer active:scale-95"
                title="ส่งออกไฟล์ CSV (เปิดด้วย Excel, Google Sheets)"
              >
                <Download className="w-3.5 h-3.5 mr-1.5 text-slate-500" />
                <span>ส่งออก CSV</span>
                {isFiltered && (
                  <ChevronDown className="w-3.5 h-3.5 ml-1 text-slate-400" />
                )}
              </button>

              {/* Dropdown menu when filtered */}
              {showExportOptions && (
                <div 
                  className="absolute right-0 mt-1.5 w-64 bg-white rounded-2xl shadow-xl border border-slate-200 p-2 z-30 animate-in fade-in zoom-in-95 duration-150"
                  onMouseLeave={() => setShowExportOptions(false)}
                >
                  <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 border-b border-slate-100 mb-1">
                    เลือกรูปแบบการส่งออก CSV
                  </div>
                  <button
                    onClick={handleExportAll}
                    className="w-full text-left px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 rounded-xl flex items-center justify-between font-medium cursor-pointer"
                  >
                    <span>รายการทั้งหมดของเดือน</span>
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                      {transactions.length} รายการ
                    </span>
                  </button>
                  <button
                    onClick={handleExportFiltered}
                    disabled={filteredTransactions.length === 0}
                    className="w-full text-left px-3 py-2 text-xs text-indigo-700 hover:bg-indigo-50 rounded-xl flex items-center justify-between font-medium cursor-pointer disabled:opacity-40"
                  >
                    <span>เฉพาะที่ค้นหา/กรอง</span>
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700">
                      {filteredTransactions.length} รายการ
                    </span>
                  </button>
                </div>
              )}
            </div>
          )}

          <button
            id="add-transaction-btn"
            onClick={onAddNew}
            className="inline-flex items-center px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-xl shadow-xs transition cursor-pointer"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            บันทึกรายการ
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 mb-5">
        {/* Search */}
        <div className="sm:col-span-5 relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="ค้นหาหมวดหมู่, บันทึก หรือช่องทางชำระ..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-700"
          />
        </div>

        {/* Type Filter */}
        <div className="sm:col-span-4 flex p-1 bg-slate-100 rounded-xl">
          <button
            onClick={() => setTypeFilter('all')}
            className={`flex-1 py-1 text-xs font-medium rounded-lg transition ${
              typeFilter === 'all'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            ทั้งหมด
          </button>
          <button
            onClick={() => setTypeFilter('expense')}
            className={`flex-1 py-1 text-xs font-medium rounded-lg transition ${
              typeFilter === 'expense'
                ? 'bg-white text-rose-600 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            รายจ่าย
          </button>
          <button
            onClick={() => setTypeFilter('income')}
            className={`flex-1 py-1 text-xs font-medium rounded-lg transition ${
              typeFilter === 'income'
                ? 'bg-white text-emerald-600 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            รายรับ
          </button>
        </div>

        {/* Category Filter */}
        <div className="sm:col-span-3">
          <select
            aria-label="เลือกหมวดหมู่"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full py-2 px-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-700"
          >
            <option value="all">หมวดหมู่ทั้งหมด</option>
            {ALL_CATEGORIES.map((c) => (
              <option key={c.id} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Transaction List content */}
      {groupedByDate.length === 0 ? (
        <div className="py-16 text-center">
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-500 mx-auto flex items-center justify-center mb-3">
            <ReceiptText className="w-7 h-7" />
          </div>
          <h3 className="text-sm font-semibold text-slate-800">
            {transactions.length === 0 ? 'ยังไม่มีรายการในเดือนนี้' : 'ไม่พบรายการที่ตรงกับเงื่อนไขการค้นหา'}
          </h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            {transactions.length === 0
              ? 'เริ่มต้นบันทึกรายรับหรือรายจ่ายรายการแรกเพื่อติดตามการเงินของคุณได้อย่างเป็นระบบ'
              : 'ลองปรับเปลี่ยนคำค้นหา หรือรีเซ็ตตัวกรองเพื่อดูรายการทั้งหมด'}
          </p>
          {transactions.length === 0 && (
            <button
              onClick={onAddNew}
              className="mt-4 inline-flex items-center px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition"
            >
              <Plus className="w-4 h-4 mr-1" />
              บันทึกรายการแรก
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {groupedByDate.map((group) => (
            <div key={group.date} className="space-y-2">
              {/* Date Header with Daily Subtotal */}
              <div className="flex items-center justify-between px-2 py-1 bg-slate-50/80 rounded-xl border border-slate-100">
                <div className="flex items-center space-x-2">
                  <CalendarDays className="w-3.5 h-3.5 text-slate-400" />
                  <span className="text-xs font-bold text-slate-700">
                    {formatThaiDate(group.date)}
                  </span>
                </div>
                <div className="flex items-center space-x-3 text-[11px]">
                  {group.dayIncome > 0 && (
                    <span className="text-emerald-600 font-medium">
                      +{formatCurrency(group.dayIncome)} ฿
                    </span>
                  )}
                  {group.dayExpense > 0 && (
                    <span className="text-rose-600 font-medium">
                      -{formatCurrency(group.dayExpense)} ฿
                    </span>
                  )}
                </div>
              </div>

              {/* Transactions in this date */}
              <div className="space-y-1.5">
                {group.items.map((tx) => {
                  const catDef = ALL_CATEGORIES.find((c) => c.name === tx.category);
                  const isIncome = tx.type === 'income';

                  return (
                    <div
                      key={tx.id}
                      className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 border border-slate-100 transition group"
                    >
                      {/* Left: Icon & Details */}
                      <div className="flex items-center space-x-3 min-w-0">
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                          style={{
                            backgroundColor: catDef?.bgColor || '#f1f5f9',
                            color: catDef?.color || '#475569'
                          }}
                        >
                          <CategoryIcon categoryName={tx.category} size={20} />
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center space-x-2">
                            <span className="font-semibold text-xs sm:text-sm text-slate-800 truncate">
                              {tx.category}
                            </span>
                            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-medium bg-slate-100 text-slate-600">
                              <CreditCard className="w-2.5 h-2.5 mr-1 text-slate-400" />
                              {tx.paymentMethod || 'เงินสด'}
                            </span>
                          </div>
                          {tx.note && (
                            <p className="text-xs text-slate-500 truncate mt-0.5">
                              {tx.note}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Right: Amount & Actions */}
                      <div className="flex items-center space-x-3 shrink-0 ml-3">
                        <div className="text-right">
                          <span
                            className={`font-bold text-sm sm:text-base ${
                              isIncome ? 'text-emerald-600' : 'text-rose-600'
                            }`}
                          >
                            {isIncome ? '+' : '-'}{formatCurrency(tx.amount)} ฿
                          </span>
                        </div>

                        {/* Action buttons on hover */}
                        <div className="flex items-center space-x-1 opacity-80 group-hover:opacity-100 transition">
                          <button
                            onClick={() => onEdit(tx)}
                            title="แก้ไข"
                            className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(tx.id)}
                            disabled={deletingId === tx.id}
                            title="ลบ"
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition disabled:opacity-50"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
