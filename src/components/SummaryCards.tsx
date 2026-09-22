import { TrendingUp, TrendingDown, PiggyBank, Target, Edit3 } from 'lucide-react';
import { formatCurrency } from '../types.ts';

interface SummaryCardsProps {
  totalIncome: number;
  totalExpense: number;
  budgetAmount: number;
  onOpenBudgetModal: () => void;
}

export function SummaryCards({ 
  totalIncome, 
  totalExpense, 
  budgetAmount, 
  onOpenBudgetModal 
}: SummaryCardsProps) {
  const netBalance = totalIncome - totalExpense;
  const savingsRate = totalIncome > 0 ? Math.max(0, Math.round((netBalance / totalIncome) * 100)) : 0;
  
  // Budget progress
  const budgetUsagePercent = budgetAmount > 0 
    ? Math.min(100, Math.round((totalExpense / budgetAmount) * 100)) 
    : 0;
  const budgetRemaining = budgetAmount - totalExpense;
  const isOverBudget = budgetAmount > 0 && totalExpense > budgetAmount;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Total Income */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs relative overflow-hidden group">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            รายรับรวม
          </span>
          <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <TrendingUp className="w-4 h-4" />
          </div>
        </div>
        <div className="space-y-1">
          <p className="text-2xl font-bold text-emerald-600 tracking-tight">
            +{formatCurrency(totalIncome)} <span className="text-xs font-normal text-slate-500">฿</span>
          </p>
          <p className="text-xs text-slate-500">
            ยอดรายรับทั้งหมดในเดือนนี้
          </p>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-emerald-500 rounded-b-2xl opacity-80" />
      </div>

      {/* 2. Total Expense */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs relative overflow-hidden group">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            รายจ่ายรวม
          </span>
          <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
            <TrendingDown className="w-4 h-4" />
          </div>
        </div>
        <div className="space-y-1">
          <p className="text-2xl font-bold text-rose-600 tracking-tight">
            -{formatCurrency(totalExpense)} <span className="text-xs font-normal text-slate-500">฿</span>
          </p>
          <p className="text-xs text-slate-500">
            ยอดรายจ่ายทั้งหมดในเดือนนี้
          </p>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-rose-500 rounded-b-2xl opacity-80" />
      </div>

      {/* 3. Net Balance */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs relative overflow-hidden group">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            คงเหลือสุทธิ
          </span>
          <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
            netBalance >= 0 ? 'bg-indigo-50 text-indigo-600' : 'bg-amber-50 text-amber-600'
          }`}>
            <PiggyBank className="w-4 h-4" />
          </div>
        </div>
        <div className="space-y-1">
          <p className={`text-2xl font-bold tracking-tight ${
            netBalance >= 0 ? 'text-slate-900' : 'text-amber-600'
          }`}>
            {netBalance >= 0 ? '+' : ''}{formatCurrency(netBalance)} <span className="text-xs font-normal text-slate-500">฿</span>
          </p>
          <p className="text-xs text-slate-500 flex items-center space-x-1">
            <span>อัตราการออม:</span>
            <span className={`font-semibold ${savingsRate > 20 ? 'text-emerald-600' : 'text-slate-700'}`}>
              {savingsRate}%
            </span>
          </p>
        </div>
        <div className={`absolute bottom-0 left-0 right-0 h-1 rounded-b-2xl ${
          netBalance >= 0 ? 'bg-indigo-600' : 'bg-amber-500'
        }`} />
      </div>

      {/* 4. Monthly Budget */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs relative overflow-hidden group">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-1">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              งบประมาณ
            </span>
            <button
              onClick={onOpenBudgetModal}
              title="ตั้งค่างบประมาณ"
              className="text-slate-400 hover:text-indigo-600 p-0.5 rounded transition"
            >
              <Edit3 className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="w-8 h-8 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center">
            <Target className="w-4 h-4" />
          </div>
        </div>

        {budgetAmount > 0 ? (
          <div className="space-y-2">
            <div className="flex items-baseline justify-between">
              <span className={`text-sm font-bold ${isOverBudget ? 'text-rose-600' : 'text-slate-800'}`}>
                ใช้ไป {budgetUsagePercent}%
              </span>
              <span className="text-xs text-slate-500">
                {isOverBudget ? 'เกินงบ ' : 'เหลือ '}
                <span className={`font-medium ${isOverBudget ? 'text-rose-600' : 'text-slate-700'}`}>
                  {formatCurrency(Math.abs(budgetRemaining))} ฿
                </span>
              </span>
            </div>
            
            {/* Progress Bar */}
            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
              <div 
                className={`h-2 rounded-full transition-all duration-500 ${
                  isOverBudget 
                    ? 'bg-rose-500' 
                    : budgetUsagePercent > 80 
                    ? 'bg-amber-500' 
                    : 'bg-indigo-600'
                }`}
                style={{ width: `${Math.min(100, (totalExpense / budgetAmount) * 100)}%` }}
              />
            </div>
            <p className="text-[11px] text-slate-400 text-right">
              เป้าหมาย: {formatCurrency(budgetAmount)} ฿
            </p>
          </div>
        ) : (
          <div className="py-1">
            <p className="text-sm font-medium text-slate-700">ยังไม่ได้ตั้งงบ</p>
            <button
              onClick={onOpenBudgetModal}
              className="mt-1.5 text-xs text-indigo-600 hover:text-indigo-800 font-medium inline-flex items-center"
            >
              + ตั้งค่างบประมาณเดือนนี้
            </button>
          </div>
        )}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-violet-500 rounded-b-2xl opacity-80" />
      </div>
    </div>
  );
}
