import { useState, useEffect, useMemo } from 'react';
import { motion } from 'motion/react';
import { 
  auth, 
  db, 
  onAuthStateChanged, 
  collection, 
  doc, 
  setDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot, 
  type User 
} from './firebase.ts';
import { 
  Transaction, 
  formatThaiMonthYear, 
  formatCurrency, 
  THAI_MONTHS 
} from './types.ts';
import { Navbar } from './components/Navbar.tsx';
import { MonthSelector } from './components/MonthSelector.tsx';
import { SummaryCards } from './components/SummaryCards.tsx';
import { AnalyticsCharts } from './components/AnalyticsCharts.tsx';
import { TransactionList } from './components/TransactionList.tsx';
import { TransactionModal } from './components/TransactionModal.tsx';
import { BudgetModal } from './components/BudgetModal.tsx';
import { exportMonthTransactionsToCsv } from './utils/exportCsv.ts';
import { 
  Plus, 
  Sparkles, 
  Cloud, 
  Info, 
  CheckCircle2, 
  AlertCircle,
  ShieldCheck,
  Zap
} from 'lucide-react';

const STORAGE_KEY_TRANSACTIONS = 'kingkeaw_offline_transactions';
const STORAGE_KEY_BUDGETS = 'kingkeaw_offline_budgets';

// Initial sample data if no data exists
const generateInitialTransactions = (yearMonth: string): Transaction[] => {
  return [
    {
      id: 'init-1',
      type: 'income',
      amount: 45000,
      category: 'เงินเดือน',
      date: `${yearMonth}-01`,
      note: 'เงินเดือนประจำเดือน',
      paymentMethod: 'โอนเงิน/พร้อมเพย์',
      createdAt: Date.now() - 86400000 * 20
    },
    {
      id: 'init-2',
      type: 'expense',
      amount: 12500,
      category: 'ที่อยู่อาศัย',
      date: `${yearMonth}-02`,
      note: 'ค่าเช่าห้องพัก / คอนโด',
      paymentMethod: 'โอนเงิน/พร้อมเพย์',
      createdAt: Date.now() - 86400000 * 19
    },
    {
      id: 'init-3',
      type: 'expense',
      amount: 1450,
      category: 'บิลและค่าน้ำค่าไฟ',
      date: `${yearMonth}-05`,
      note: 'ค่าน้ำ ค่าไฟ ค่าอินเทอร์เน็ต',
      paymentMethod: 'โอนเงิน/พร้อมเพย์',
      createdAt: Date.now() - 86400000 * 16
    },
    {
      id: 'init-4',
      type: 'expense',
      amount: 320,
      category: 'อาหารและเครื่องดื่ม',
      date: `${yearMonth}-10`,
      note: 'ชาบูมื้อเย็นกับเพื่อนร่วมงาน',
      paymentMethod: 'บัตรเครดิต/เดบิต',
      createdAt: Date.now() - 86400000 * 11
    },
    {
      id: 'init-5',
      type: 'expense',
      amount: 250,
      category: 'การเดินทาง',
      date: `${yearMonth}-15`,
      note: 'เติมเงินบัตร BTS รถไฟฟ้า',
      paymentMethod: 'เงินสด',
      createdAt: Date.now() - 86400000 * 6
    },
    {
      id: 'init-6',
      type: 'income',
      amount: 5000,
      category: 'ธุรกิจส่วนตัว / ค้าขาย',
      date: `${yearMonth}-18`,
      note: 'รายได้เสริมขายของออนไลน์',
      paymentMethod: 'โอนเงิน/พร้อมเพย์',
      createdAt: Date.now() - 86400000 * 3
    },
    {
      id: 'init-7',
      type: 'expense',
      amount: 890,
      category: 'ช้อปปิ้ง',
      date: `${yearMonth}-20`,
      note: 'ซื้อของใช้และเสื้อผ้า',
      paymentMethod: 'โอนเงิน/พร้อมเพย์',
      createdAt: Date.now() - 86400000 * 1
    }
  ];
};

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);

  // Current selected month: 'YYYY-MM'
  const [currentMonth, setCurrentMonth] = useState<string>(() => {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    return `${y}-${m}`;
  });

  const [allTransactions, setAllTransactions] = useState<Transaction[]>([]);
  const [monthlyBudgets, setMonthlyBudgets] = useState<Record<string, number>>({});
  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'info' | 'error'; text: string } | null>(null);

  const showToast = (text: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // 1. Auth Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoadingAuth(false);
      if (currentUser) {
        showToast(`ยินดีต้อนรับคุณ ${currentUser.displayName || currentUser.email}`, 'info');
      }
    });
    return () => unsubscribe();
  }, []);

  // 2. Data Synchronization (Firebase or Local)
  useEffect(() => {
    if (loadingAuth) return;

    if (user) {
      // User is logged in: sync with Firestore
      const txCollectionRef = collection(db, 'users', user.uid, 'transactions');
      const unsubscribeTx = onSnapshot(
        txCollectionRef,
        (snapshot) => {
          const items: Transaction[] = [];
          snapshot.forEach((d) => {
            const data = d.data();
            items.push({
              id: d.id,
              type: data.type || 'expense',
              amount: Number(data.amount) || 0,
              category: data.category || 'อื่นๆ',
              date: data.date || '',
              note: data.note || '',
              paymentMethod: data.paymentMethod || 'โอนเงิน/พร้อมเพย์',
              createdAt: data.createdAt || Date.now()
            });
          });

          // If brand new user has 0 transactions, offer initial template
          if (items.length === 0 && !localStorage.getItem(`seeded_${user.uid}`)) {
            const seedItems = generateInitialTransactions(currentMonth);
            seedItems.forEach(async (it) => {
              const { id, ...rest } = it;
              await addDoc(txCollectionRef, rest);
            });
            localStorage.setItem(`seeded_${user.uid}`, 'true');
          } else {
            setAllTransactions(items);
          }
        },
        (error) => {
          console.error('Firestore snapshot error:', error);
          showToast('ไม่สามารถเชื่อมต่อ Firebase ได้ กำลังใช้โหมดสำรอง', 'error');
        }
      );

      // Budgets listener
      const budgetDocRef = doc(db, 'users', user.uid, 'budgets', currentMonth);
      const unsubscribeBudget = onSnapshot(budgetDocRef, (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          setMonthlyBudgets((prev) => ({
            ...prev,
            [currentMonth]: Number(data.amount) || 0
          }));
        }
      });

      return () => {
        unsubscribeTx();
        unsubscribeBudget();
      };
    } else {
      // Guest mode: load from LocalStorage
      const saved = localStorage.getItem(STORAGE_KEY_TRANSACTIONS);
      if (saved) {
        try {
          setAllTransactions(JSON.parse(saved));
        } catch {
          const init = generateInitialTransactions(currentMonth);
          setAllTransactions(init);
          localStorage.setItem(STORAGE_KEY_TRANSACTIONS, JSON.stringify(init));
        }
      } else {
        const init = generateInitialTransactions(currentMonth);
        setAllTransactions(init);
        localStorage.setItem(STORAGE_KEY_TRANSACTIONS, JSON.stringify(init));
      }

      const savedBudgets = localStorage.getItem(STORAGE_KEY_BUDGETS);
      if (savedBudgets) {
        try {
          setMonthlyBudgets(JSON.parse(savedBudgets));
        } catch {
          setMonthlyBudgets({ [currentMonth]: 25000 });
        }
      } else {
        setMonthlyBudgets({ [currentMonth]: 25000 });
      }
    }
  }, [user, loadingAuth, currentMonth]);

  // Filter transactions belonging to currentMonth (YYYY-MM)
  const monthTransactions = useMemo(() => {
    return allTransactions.filter((t) => t.date.startsWith(currentMonth));
  }, [allTransactions, currentMonth]);

  // Calculations for currentMonth
  const totalIncome = useMemo(() => {
    return monthTransactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
  }, [monthTransactions]);

  const totalExpense = useMemo(() => {
    return monthTransactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
  }, [monthTransactions]);

  const currentBudget = monthlyBudgets[currentMonth] || 0;

  // Handlers for Save/Edit/Delete
  const handleSaveTransaction = async (
    data: Omit<Transaction, 'id' | 'createdAt'>,
    id?: string
  ) => {
    if (user) {
      // Save to Firebase Firestore
      if (id) {
        const txDoc = doc(db, 'users', user.uid, 'transactions', id);
        await updateDoc(txDoc, {
          ...data,
          updatedAt: Date.now()
        });
        showToast('อัปเดตรายการเรียบร้อยแล้ว');
      } else {
        const txCollection = collection(db, 'users', user.uid, 'transactions');
        await addDoc(txCollection, {
          ...data,
          createdAt: Date.now()
        });
        showToast('บันทึกรายการขึ้น Firebase สำเร็จ');
      }
    } else {
      // Guest local storage
      let updated: Transaction[];
      if (id) {
        updated = allTransactions.map((t) =>
          t.id === id ? { ...t, ...data } : t
        );
        showToast('อัปเดตรายการเรียบร้อยแล้ว');
      } else {
        const newTx: Transaction = {
          ...data,
          id: 'tx-' + Date.now(),
          createdAt: Date.now()
        };
        updated = [newTx, ...allTransactions];
        showToast('บันทึกรายการเรียบร้อย');
      }
      setAllTransactions(updated);
      localStorage.setItem(STORAGE_KEY_TRANSACTIONS, JSON.stringify(updated));
    }
  };

  const handleDeleteTransaction = async (id: string) => {
    if (user) {
      const txDoc = doc(db, 'users', user.uid, 'transactions', id);
      await deleteDoc(txDoc);
      showToast('ลบรายการจาก Firebase เรียบร้อยแล้ว');
    } else {
      const updated = allTransactions.filter((t) => t.id !== id);
      setAllTransactions(updated);
      localStorage.setItem(STORAGE_KEY_TRANSACTIONS, JSON.stringify(updated));
      showToast('ลบรายการเรียบร้อยแล้ว');
    }
  };

  const handleSaveBudget = async (month: string, amount: number) => {
    if (user) {
      const budgetDoc = doc(db, 'users', user.uid, 'budgets', month);
      await setDoc(budgetDoc, { amount, updatedAt: Date.now() }, { merge: true });
      showToast(`บันทึกงบประมาณประจำเดือน ${formatThaiMonthYear(month)} เรียบร้อย`);
    } else {
      const updated = { ...monthlyBudgets, [month]: amount };
      setMonthlyBudgets(updated);
      localStorage.setItem(STORAGE_KEY_BUDGETS, JSON.stringify(updated));
      showToast(`บันทึกงบประมาณประจำเดือน ${formatThaiMonthYear(month)} เรียบร้อย`);
    }
  };

  const handleOpenAdd = () => {
    setEditingTransaction(null);
    setIsTxModalOpen(true);
  };

  const handleOpenEdit = (tx: Transaction) => {
    setEditingTransaction(tx);
    setIsTxModalOpen(true);
  };

  const handleExportCurrentMonthCsv = () => {
    if (monthTransactions.length === 0) {
      showToast('ไม่มีรายการธุรกรรมในเดือนนี้สำหรับส่งออก', 'info');
      return;
    }
    const success = exportMonthTransactionsToCsv(monthTransactions, {
      monthName: formatThaiMonthYear(currentMonth),
      yearMonth: currentMonth,
      totalIncome,
      totalExpense
    });
    if (success) {
      showToast(`ส่งออกไฟล์ CSV ประจำเดือน ${formatThaiMonthYear(currentMonth)} สำเร็จแล้ว (${monthTransactions.length} รายการ)`, 'success');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-4 z-50 flex items-center space-x-2 px-4 py-2.5 rounded-2xl shadow-xl bg-slate-900 text-white text-xs sm:text-sm animate-in fade-in slide-in-from-top-3 duration-200">
          {toastMessage.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
          {toastMessage.type === 'info' && <Info className="w-4 h-4 text-sky-400 shrink-0" />}
          {toastMessage.type === 'error' && <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Main Navbar */}
      <Navbar user={user} loadingAuth={loadingAuth} />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Project Header Banner / Notice */}
        {!user && (
          <div className="bg-gradient-to-r from-indigo-50 via-white to-indigo-50/50 rounded-2xl p-4 border border-indigo-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
            <div className="flex items-start space-x-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                <Cloud className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                  เชื่อมต่อระบบคลาวด์ Firebase ของ kingkeaw project
                  <span className="text-[11px] font-normal px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700">
                    โปรเจค: symmetric-liberty-98chg
                  </span>
                </h2>
                <p className="text-xs text-slate-600 mt-0.5">
                  เข้าสู่ระบบด้วย Gmail เพื่อจัดเก็บข้อมูลรายรับรายจ่ายของคุณอย่างปลอดภัยบน Firebase Firestore และซิงค์ได้ทุกอุปกรณ์
                </p>
              </div>
            </div>
            <div className="shrink-0 flex items-center space-x-2">
              <span className="text-xs text-slate-500 hidden md:inline-block">โหมดทดลองใช้งาน</span>
            </div>
          </div>
        )}

        {/* Month Selector & Quick Actions */}
        <MonthSelector 
          currentMonth={currentMonth} 
          onChangeMonth={(newMonth) => setCurrentMonth(newMonth)}
          onExportCsv={handleExportCurrentMonthCsv}
          hasTransactions={monthTransactions.length > 0}
        />

        {/* 4 Summary Cards (Income, Expense, Net Balance, Budget) */}
        <SummaryCards
          totalIncome={totalIncome}
          totalExpense={totalExpense}
          budgetAmount={currentBudget}
          onOpenBudgetModal={() => setIsBudgetModalOpen(true)}
        />

        {/* Analytics & Graphs Section */}
        <AnalyticsCharts
          transactions={monthTransactions}
          currentMonth={currentMonth}
        />

        {/* Transaction History & Records Table */}
        <TransactionList
          transactions={monthTransactions}
          onAddNew={handleOpenAdd}
          onEdit={handleOpenEdit}
          onDelete={handleDeleteTransaction}
          currentMonthName={formatThaiMonthYear(currentMonth)}
          currentMonthKey={currentMonth}
          onNotify={showToast}
        />
      </main>

      {/* Floating Action Button with Smooth Idle Pulse Animation */}
      <div className="fixed bottom-6 right-6 z-30 flex items-center group">
        <div className="relative flex items-center justify-center">
          {/* Outer Ambient Pulse Wave 1 */}
          <motion.span
            className="absolute -inset-2 rounded-full bg-indigo-500/30 pointer-events-none"
            animate={{
              scale: [1, 1.45, 1.75],
              opacity: [0.75, 0.25, 0],
            }}
            transition={{
              duration: 2.8,
              repeat: Infinity,
              ease: "easeOut",
            }}
          />

          {/* Outer Ambient Pulse Wave 2 (staggered delay for continuous smooth breathing) */}
          <motion.span
            className="absolute -inset-1.5 rounded-full bg-indigo-600/35 pointer-events-none"
            animate={{
              scale: [1, 1.3, 1.55],
              opacity: [0.8, 0.3, 0],
            }}
            transition={{
              duration: 2.8,
              repeat: Infinity,
              ease: "easeOut",
              delay: 1.4,
            }}
          />

          {/* Floating Action Button with Idle Breathing and Hover interaction */}
          <motion.button
            id="floating-add-btn"
            onClick={handleOpenAdd}
            aria-label="บันทึกรายการ"
            className="relative z-10 flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-tr from-indigo-600 via-indigo-600 to-indigo-500 text-white shadow-xl shadow-indigo-500/40 border border-indigo-300/30 cursor-pointer focus:outline-none focus:ring-4 focus:ring-indigo-300/50 select-none"
            animate={{
              scale: [1, 1.05, 1],
              boxShadow: [
                "0 10px 25px -5px rgba(79, 70, 229, 0.45), 0 8px 10px -6px rgba(79, 70, 229, 0.35)",
                "0 20px 32px -4px rgba(79, 70, 229, 0.65), 0 10px 14px -5px rgba(79, 70, 229, 0.45)",
                "0 10px 25px -5px rgba(79, 70, 229, 0.45), 0 8px 10px -6px rgba(79, 70, 229, 0.35)",
              ],
            }}
            transition={{
              duration: 2.8,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            whileHover={{
              scale: 1.12,
              boxShadow: "0 22px 36px -4px rgba(79, 70, 229, 0.7), 0 12px 18px -5px rgba(79, 70, 229, 0.5)",
            }}
            whileTap={{
              scale: 0.94,
            }}
          >
            <Plus className="w-7 h-7 transition-transform duration-300 group-hover:rotate-90" />

            {/* Tooltip on hover */}
            <span className="pointer-events-none opacity-0 group-hover:opacity-100 absolute right-16 px-3 py-1.5 rounded-xl bg-slate-900/90 backdrop-blur-xs text-white text-xs font-medium whitespace-nowrap shadow-lg transition-all duration-200 flex items-center gap-1.5">
              <span>บันทึกรายการ</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-white/20 font-mono text-slate-200">
                +
              </span>
            </span>
          </motion.button>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-200/80 bg-white py-6 mt-12 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="font-medium text-slate-700">
            kingkeaw project &copy; 2026 — ระบบจัดการรายรับรายจ่ายส่วนบุคคล
          </p>
          <div className="flex items-center space-x-2 text-[11px] text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Firebase Firestore Database & Authentication</span>
          </div>
        </div>
      </footer>

      {/* Add / Edit Transaction Modal */}
      <TransactionModal
        isOpen={isTxModalOpen}
        onClose={() => {
          setIsTxModalOpen(false);
          setEditingTransaction(null);
        }}
        onSave={handleSaveTransaction}
        editingTransaction={editingTransaction}
        defaultDate={`${currentMonth}-01`}
      />

      {/* Monthly Budget Modal */}
      <BudgetModal
        isOpen={isBudgetModalOpen}
        onClose={() => setIsBudgetModalOpen(false)}
        currentMonth={currentMonth}
        currentBudget={currentBudget}
        onSaveBudget={handleSaveBudget}
      />
    </div>
  );
}
