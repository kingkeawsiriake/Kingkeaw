import { useState, useMemo } from 'react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  PieChart, 
  Pie, 
  Cell, 
  CartesianGrid,
  BarChart,
  Bar,
  Legend
} from 'recharts';
import { BarChart3, PieChart as PieIcon, TrendingUp, DollarSign } from 'lucide-react';
import { Transaction, ALL_CATEGORIES, formatCurrency } from '../types.ts';

interface AnalyticsChartsProps {
  transactions: Transaction[];
  currentMonth: string; // 'YYYY-MM'
}

const DEFAULT_EXPENSE_COLORS = [
  '#f97316', '#0284c7', '#ec4899', '#8b5cf6', '#6366f1',
  '#ef4444', '#eab308', '#06b6d4', '#d97706', '#64748b'
];

const DEFAULT_INCOME_COLORS = [
  '#10b981', '#059669', '#34d399', '#14b8a6', '#38bdf8', '#64748b'
];

export function AnalyticsCharts({ transactions, currentMonth }: AnalyticsChartsProps) {
  const [activeTab, setActiveTab] = useState<'trend' | 'expensePie' | 'incomePie' | 'comparison'>('trend');

  // Compute daily trend data for the selected month
  const dailyData = useMemo(() => {
    const [yearStr, monthStr] = currentMonth.split('-');
    const year = parseInt(yearStr, 10);
    const month = parseInt(monthStr, 10);
    const daysInMonth = new Date(year, month, 0).getDate();

    const map: Record<number, { day: number; income: number; expense: number; label: string }> = {};
    for (let d = 1; d <= daysInMonth; d++) {
      map[d] = {
        day: d,
        income: 0,
        expense: 0,
        label: `${d}`
      };
    }

    transactions.forEach(t => {
      const parts = t.date.split('-');
      if (parts.length === 3 && parts[0] === yearStr && parts[1] === monthStr) {
        const d = parseInt(parts[2], 10);
        if (map[d]) {
          if (t.type === 'income') {
            map[d].income += t.amount;
          } else {
            map[d].expense += t.amount;
          }
        }
      }
    });

    return Object.values(map);
  }, [transactions, currentMonth]);

  // Compute category breakdown for expenses
  const expenseCategoryData = useMemo(() => {
    const catMap: Record<string, number> = {};
    let total = 0;

    transactions
      .filter(t => t.type === 'expense')
      .forEach(t => {
        catMap[t.category] = (catMap[t.category] || 0) + t.amount;
        total += t.amount;
      });

    return Object.entries(catMap)
      .map(([name, value], idx) => {
        const catObj = ALL_CATEGORIES.find(c => c.name === name);
        return {
          name,
          value,
          percent: total > 0 ? ((value / total) * 100).toFixed(1) : '0',
          color: catObj?.color || DEFAULT_EXPENSE_COLORS[idx % DEFAULT_EXPENSE_COLORS.length]
        };
      })
      .sort((a, b) => b.value - a.value);
  }, [transactions]);

  // Compute category breakdown for income
  const incomeCategoryData = useMemo(() => {
    const catMap: Record<string, number> = {};
    let total = 0;

    transactions
      .filter(t => t.type === 'income')
      .forEach(t => {
        catMap[t.category] = (catMap[t.category] || 0) + t.amount;
        total += t.amount;
      });

    return Object.entries(catMap)
      .map(([name, value], idx) => {
        const catObj = ALL_CATEGORIES.find(c => c.name === name);
        return {
          name,
          value,
          percent: total > 0 ? ((value / total) * 100).toFixed(1) : '0',
          color: catObj?.color || DEFAULT_INCOME_COLORS[idx % DEFAULT_INCOME_COLORS.length]
        };
      })
      .sort((a, b) => b.value - a.value);
  }, [transactions]);

  // Payment method breakdown
  const paymentMethodData = useMemo(() => {
    const pMap: Record<string, { income: number; expense: number }> = {};
    transactions.forEach(t => {
      const pm = t.paymentMethod || 'อื่นๆ';
      if (!pMap[pm]) {
        pMap[pm] = { income: 0, expense: 0 };
      }
      if (t.type === 'income') {
        pMap[pm].income += t.amount;
      } else {
        pMap[pm].expense += t.amount;
      }
    });

    return Object.entries(pMap).map(([name, vals]) => ({
      name,
      income: vals.income,
      expense: vals.expense
    }));
  }, [transactions]);

  const hasData = transactions.length > 0;

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
      {/* Header & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-100">
        <div>
          <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-indigo-600" />
            กราฟวิเคราะห์รายรับ - รายจ่าย
          </h2>
          <p className="text-xs text-slate-500">
            แสดงสถิติและแนวโน้มการเงินประจำเดือน
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 rounded-xl">
          <button
            onClick={() => setActiveTab('trend')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              activeTab === 'trend'
                ? 'bg-white text-indigo-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            แนวโน้มรายวัน
          </button>
          <button
            onClick={() => setActiveTab('expensePie')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              activeTab === 'expensePie'
                ? 'bg-white text-rose-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            สัดส่วนรายจ่าย
          </button>
          <button
            onClick={() => setActiveTab('incomePie')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              activeTab === 'incomePie'
                ? 'bg-white text-emerald-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            สัดส่วนรายรับ
          </button>
          <button
            onClick={() => setActiveTab('comparison')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              activeTab === 'comparison'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            ช่องทางชำระเงิน
          </button>
        </div>
      </div>

      {!hasData ? (
        <div className="py-16 text-center">
          <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center mb-3">
            <BarChart3 className="w-6 h-6" />
          </div>
          <p className="text-sm font-medium text-slate-700">ยังไม่มีข้อมูลสำหรับวิเคราะห์ในเดือนนี้</p>
          <p className="text-xs text-slate-500 mt-1">เพิ่มรายการรายรับหรือรายจ่ายเพื่อดูสถิติและกราฟวิเคราะห์</p>
        </div>
      ) : (
        <div>
          {/* TAB 1: Daily Trend Area Chart */}
          {activeTab === 'trend' && (
            <div>
              <div className="flex items-center justify-end space-x-4 mb-2 text-xs">
                <div className="flex items-center space-x-1.5">
                  <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" />
                  <span className="text-slate-600">รายรับ</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <span className="w-3 h-3 rounded-full bg-rose-500 inline-block" />
                  <span className="text-slate-600">รายจ่าย</span>
                </div>
              </div>

              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={dailyData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                      </linearGradient>
                      <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis 
                      dataKey="day" 
                      tickLine={false} 
                      stroke="#94a3b8" 
                      fontSize={11} 
                      tickFormatter={(val) => `ว.${val}`}
                    />
                    <YAxis 
                      tickLine={false} 
                      axisLine={false} 
                      stroke="#94a3b8" 
                      fontSize={11}
                      tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : `${v}`}
                    />
                    <Tooltip 
                      content={({ active, payload, label }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="bg-slate-900 text-white text-xs rounded-xl p-3 shadow-lg border border-slate-800">
                              <p className="font-semibold mb-1 text-slate-200">วันที่ {label}</p>
                              {payload.map((entry: any) => (
                                <p key={entry.name} className="flex justify-between space-x-4 py-0.5">
                                  <span style={{ color: entry.color }}>
                                    {entry.name === 'income' ? 'รายรับ' : 'รายจ่าย'}:
                                  </span>
                                  <span className="font-medium">{formatCurrency(entry.value)} ฿</span>
                                </p>
                              ))}
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="income" 
                      stroke="#10b981" 
                      strokeWidth={2}
                      fillOpacity={1} 
                      fill="url(#incomeGradient)" 
                    />
                    <Area 
                      type="monotone" 
                      dataKey="expense" 
                      stroke="#f43f5e" 
                      strokeWidth={2}
                      fillOpacity={1} 
                      fill="url(#expenseGradient)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* TAB 2: Expense by Category Donut Chart */}
          {activeTab === 'expensePie' && (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
              {expenseCategoryData.length === 0 ? (
                <div className="col-span-12 py-12 text-center text-slate-500 text-sm">
                  ไม่มีรายการรายจ่ายในเดือนนี้
                </div>
              ) : (
                <>
                  <div className="col-span-12 md:col-span-6 h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={expenseCategoryData}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          innerRadius={55}
                          outerRadius={85}
                          paddingAngle={3}
                        >
                          {expenseCategoryData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip
                          content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                              const data = payload[0].payload;
                              return (
                                <div className="bg-slate-900 text-white text-xs rounded-xl p-2.5 shadow-lg border border-slate-800">
                                  <p className="font-semibold text-slate-200">{data.name}</p>
                                  <p className="text-rose-400 font-bold mt-1">
                                    {formatCurrency(data.value)} ฿ ({data.percent}%)
                                  </p>
                                </div>
                              );
                            }
                            return null;
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Category Legend with List & Percentage */}
                  <div className="col-span-12 md:col-span-6 max-h-64 overflow-y-auto space-y-2 pr-2">
                    {expenseCategoryData.map((cat) => (
                      <div 
                        key={cat.name} 
                        className="flex items-center justify-between text-xs p-2 rounded-xl hover:bg-slate-50 transition border border-transparent hover:border-slate-100"
                      >
                        <div className="flex items-center space-x-2 truncate">
                          <span 
                            className="w-3 h-3 rounded-md shrink-0" 
                            style={{ backgroundColor: cat.color }} 
                          />
                          <span className="text-slate-700 font-medium truncate">{cat.name}</span>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="font-semibold text-slate-900">{formatCurrency(cat.value)} ฿</span>
                          <span className="text-slate-400 ml-1.5 text-[11px]">({cat.percent}%)</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          {/* TAB 3: Income by Category Donut Chart */}
          {activeTab === 'incomePie' && (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
              {incomeCategoryData.length === 0 ? (
                <div className="col-span-12 py-12 text-center text-slate-500 text-sm">
                  ไม่มีรายการรายรับในเดือนนี้
                </div>
              ) : (
                <>
                  <div className="col-span-12 md:col-span-6 h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={incomeCategoryData}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          innerRadius={55}
                          outerRadius={85}
                          paddingAngle={3}
                        >
                          {incomeCategoryData.map((entry, index) => (
                            <Cell key={`cell-income-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip
                          content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                              const data = payload[0].payload;
                              return (
                                <div className="bg-slate-900 text-white text-xs rounded-xl p-2.5 shadow-lg border border-slate-800">
                                  <p className="font-semibold text-slate-200">{data.name}</p>
                                  <p className="text-emerald-400 font-bold mt-1">
                                    {formatCurrency(data.value)} ฿ ({data.percent}%)
                                  </p>
                                </div>
                              );
                            }
                            return null;
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="col-span-12 md:col-span-6 max-h-64 overflow-y-auto space-y-2 pr-2">
                    {incomeCategoryData.map((cat) => (
                      <div 
                        key={cat.name} 
                        className="flex items-center justify-between text-xs p-2 rounded-xl hover:bg-slate-50 transition border border-transparent hover:border-slate-100"
                      >
                        <div className="flex items-center space-x-2 truncate">
                          <span 
                            className="w-3 h-3 rounded-md shrink-0" 
                            style={{ backgroundColor: cat.color }} 
                          />
                          <span className="text-slate-700 font-medium truncate">{cat.name}</span>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="font-semibold text-slate-900">{formatCurrency(cat.value)} ฿</span>
                          <span className="text-slate-400 ml-1.5 text-[11px]">({cat.percent}%)</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          {/* TAB 4: Payment Method Comparison Bar Chart */}
          {activeTab === 'comparison' && (
            <div>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={paymentMethodData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" tickLine={false} stroke="#94a3b8" fontSize={11} />
                    <YAxis 
                      tickLine={false} 
                      axisLine={false} 
                      stroke="#94a3b8" 
                      fontSize={11}
                      tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : `${v}`}
                    />
                    <Tooltip 
                      content={({ active, payload, label }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="bg-slate-900 text-white text-xs rounded-xl p-3 shadow-lg border border-slate-800">
                              <p className="font-semibold mb-1 text-slate-200">{label}</p>
                              {payload.map((entry: any) => (
                                <p key={entry.name} className="flex justify-between space-x-4 py-0.5">
                                  <span style={{ color: entry.color }}>
                                    {entry.name === 'income' ? 'รายรับ' : 'รายจ่าย'}:
                                  </span>
                                  <span className="font-medium">{formatCurrency(entry.value)} ฿</span>
                                </p>
                              ))}
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Legend 
                      formatter={(val) => val === 'income' ? 'รายรับ' : 'รายจ่าย'}
                      wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }}
                    />
                    <Bar dataKey="income" name="income" fill="#10b981" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="expense" name="expense" fill="#f43f5e" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
