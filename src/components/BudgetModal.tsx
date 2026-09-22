import { useState, useEffect } from 'react';
import { X, Check, Target } from 'lucide-react';
import { formatThaiMonthYear, formatCurrency } from '../types.ts';

interface BudgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentMonth: string; // 'YYYY-MM'
  currentBudget: number;
  onSaveBudget: (month: string, amount: number) => Promise<void>;
}

export function BudgetModal({
  isOpen,
  onClose,
  currentMonth,
  currentBudget,
  onSaveBudget
}: BudgetModalProps) {
  const [amount, setAmount] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setAmount(currentBudget > 0 ? currentBudget.toString() : '');
    }
  }, [isOpen, currentBudget]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(amount);
    try {
      setSubmitting(true);
      await onSaveBudget(currentMonth, isNaN(val) ? 0 : val);
      onClose();
    } catch (err) {
      console.error('Save budget error:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-100 overflow-hidden p-6 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-violet-50 text-violet-600 flex items-center justify-center">
              <Target className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                ตั้งค่างบประมาณประจำเดือน
              </h3>
              <p className="text-xs text-slate-500">
                {formatThaiMonthYear(currentMonth)}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              งบประมาณรายจ่ายเป้าหมาย (บาท)
            </label>
            <div className="relative">
              <input
                type="number"
                step="any"
                min="0"
                placeholder="เช่น 15000"
                autoFocus
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full text-xl font-bold px-4 py-2.5 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 pr-12"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-semibold">
                ฿
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              ระบบจะแสดงแถบเตือนเมื่อยอดรายจ่ายเข้าใกล้หรือเกินงบประมาณนี้
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {[10000, 15000, 20000, 30000, 50000].map((quick) => (
              <button
                key={quick}
                type="button"
                onClick={() => setAmount(quick.toString())}
                className="px-2.5 py-1 text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition"
              >
                {formatCurrency(quick)} ฿
              </button>
            ))}
          </div>

          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center px-5 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition disabled:opacity-70"
            >
              <Check className="w-4 h-4 mr-1.5" />
              {submitting ? 'กำลังบันทึก...' : 'บันทึกงบประมาณ'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
