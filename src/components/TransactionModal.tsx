import { useState, useEffect } from 'react';
import { X, Plus, Check, Calendar, CreditCard, FileText } from 'lucide-react';
import { 
  Transaction, 
  TransactionType, 
  PaymentMethod, 
  EXPENSE_CATEGORIES, 
  INCOME_CATEGORIES,
  PAYMENT_METHODS 
} from '../types.ts';
import { CategoryIcon } from './CategoryIcon.tsx';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Omit<Transaction, 'id' | 'createdAt'>, id?: string) => Promise<void>;
  editingTransaction?: Transaction | null;
  defaultDate?: string;
}

export function TransactionModal({
  isOpen,
  onClose,
  onSave,
  editingTransaction,
  defaultDate
}: TransactionModalProps) {
  const [type, setType] = useState<TransactionType>('expense');
  const [amount, setAmount] = useState<string>('');
  const [category, setCategory] = useState<string>('');
  const [date, setDate] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('โอนเงิน/พร้อมเพย์');
  const [note, setNote] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      if (editingTransaction) {
        setType(editingTransaction.type);
        setAmount(editingTransaction.amount.toString());
        setCategory(editingTransaction.category);
        setDate(editingTransaction.date);
        setPaymentMethod(editingTransaction.paymentMethod || 'โอนเงิน/พร้อมเพย์');
        setNote(editingTransaction.note || '');
      } else {
        setType('expense');
        setAmount('');
        const todayStr = new Date().toISOString().split('T')[0];
        setDate(defaultDate || todayStr);
        setCategory(EXPENSE_CATEGORIES[0].name);
        setPaymentMethod('โอนเงิน/พร้อมเพย์');
        setNote('');
      }
      setError(null);
    }
  }, [isOpen, editingTransaction, defaultDate]);

  // When type changes, default category to first of that type
  const handleTypeChange = (newType: TransactionType) => {
    setType(newType);
    if (newType === 'expense') {
      setCategory(EXPENSE_CATEGORIES[0].name);
    } else {
      setCategory(INCOME_CATEGORIES[0].name);
    }
  };

  const handleAddAmount = (addVal: number) => {
    const current = parseFloat(amount) || 0;
    setAmount((current + addVal).toString());
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setError('กรุณาระบุจำนวนเงินที่ถูกต้อง (มากกว่า 0)');
      return;
    }
    if (!category) {
      setError('กรุณาเลือกหมวดหมู่');
      return;
    }
    if (!date) {
      setError('กรุณาเลือกวันที่');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      await onSave(
        {
          type,
          amount: numAmount,
          category,
          date,
          paymentMethod,
          note: note.trim()
        },
        editingTransaction ? editingTransaction.id : undefined
      );
      onClose();
    } catch (err: any) {
      console.error('Save transaction error:', err);
      setError(err.message || 'เกิดข้อผิดพลาดในการบันทึกข้อมูล');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const currentCategories = type === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div 
        id="transaction-modal"
        className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-100 overflow-hidden transform transition-all animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-3">
          <h3 className="text-lg font-bold text-slate-900">
            {editingTransaction ? 'แก้ไขรายการ' : 'บันทึกรายการใหม่'}
          </h3>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Transaction Type Selector (Expense vs Income) */}
        <div className="px-6 py-2">
          <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-2xl">
            <button
              type="button"
              onClick={() => handleTypeChange('expense')}
              className={`py-2 text-sm font-semibold rounded-xl transition cursor-pointer ${
                type === 'expense'
                  ? 'bg-white text-rose-600 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              รายจ่าย (-)
            </button>
            <button
              type="button"
              onClick={() => handleTypeChange('income')}
              className={`py-2 text-sm font-semibold rounded-xl transition cursor-pointer ${
                type === 'income'
                  ? 'bg-white text-emerald-600 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              รายรับ (+)
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 pt-2">
          {error && (
            <div className="p-3 text-xs bg-rose-50 text-rose-700 rounded-xl border border-rose-100">
              {error}
            </div>
          )}

          {/* Amount Input with Quick Buttons */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              จำนวนเงิน (บาท) *
            </label>
            <div className="relative">
              <input
                id="amount-input"
                type="number"
                step="any"
                min="0"
                placeholder="0.00"
                autoFocus
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full text-2xl font-bold px-4 py-2.5 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 pr-12"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-semibold">
                ฿
              </span>
            </div>

            {/* Quick Add Buttons */}
            <div className="flex flex-wrap items-center gap-1.5 mt-2">
              {[50, 100, 500, 1000].map((val) => (
                <button
                  type="button"
                  key={val}
                  onClick={() => handleAddAmount(val)}
                  className="px-2.5 py-1 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
                >
                  +{val}
                </button>
              ))}
              {amount && (
                <button
                  type="button"
                  onClick={() => setAmount('')}
                  className="px-2 py-1 text-xs text-rose-500 hover:bg-rose-50 rounded-lg transition ml-auto"
                >
                  ล้าง
                </button>
              )}
            </div>
          </div>

          {/* Category Picker Grid */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">
              หมวดหมู่ *
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-48 overflow-y-auto pr-1">
              {currentCategories.map((cat) => {
                const isSelected = category === cat.name;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategory(cat.name)}
                    className={`flex items-center space-x-2 p-2 rounded-xl border text-left transition ${
                      isSelected 
                        ? 'border-indigo-600 bg-indigo-50/70 text-indigo-900 font-semibold ring-1 ring-indigo-600'
                        : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <div 
                      className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                      style={{ backgroundColor: cat.bgColor, color: cat.color }}
                    >
                      <CategoryIcon categoryName={cat.name} size={15} />
                    </div>
                    <span className="text-xs truncate">{cat.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Date & Payment Method */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                วันที่ *
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-700"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                ช่องทางชำระเงิน
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-700"
              >
                {PAYMENT_METHODS.map((pm) => (
                  <option key={pm} value={pm}>
                    {pm}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Note / Memo */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              บันทึกช่วยจำ (ถ้ามี)
            </label>
            <input
              type="text"
              placeholder="เช่น ซื้อกาแฟสดยามเช้า, เงินเดือนประจำเดือน"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-700"
            />
          </div>

          {/* Submit Action */}
          <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition"
            >
              ยกเลิก
            </button>
            <button
              id="save-transaction-btn"
              type="submit"
              disabled={submitting}
              className={`inline-flex items-center px-6 py-2 text-sm font-medium text-white rounded-xl shadow-xs transition disabled:opacity-70 ${
                type === 'expense' ? 'bg-rose-600 hover:bg-rose-700' : 'bg-emerald-600 hover:bg-emerald-700'
              }`}
            >
              <Check className="w-4 h-4 mr-1.5" />
              {submitting ? 'กำลังบันทึก...' : editingTransaction ? 'อัปเดตรายการ' : 'บันทึกรายการ'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
