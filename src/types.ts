export type TransactionType = 'income' | 'expense';

export type PaymentMethod = 'เงินสด' | 'โอนเงิน/พร้อมเพย์' | 'บัตรเครดิต/เดบิต' | 'อื่นๆ';

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  category: string;
  date: string; // YYYY-MM-DD
  note?: string;
  paymentMethod: PaymentMethod;
  createdAt: number;
}

export interface CategoryDef {
  id: string;
  name: string;
  iconName: string;
  color: string;
  bgColor: string;
  type: TransactionType;
}

export interface MonthlyBudget {
  month: string; // YYYY-MM
  amount: number;
}

export const EXPENSE_CATEGORIES: CategoryDef[] = [
  { id: 'food', name: 'อาหารและเครื่องดื่ม', iconName: 'Utensils', color: '#f97316', bgColor: '#ffedd5', type: 'expense' },
  { id: 'transport', name: 'การเดินทาง', iconName: 'Car', color: '#0284c7', bgColor: '#e0f2fe', type: 'expense' },
  { id: 'shopping', name: 'ช้อปปิ้ง', iconName: 'ShoppingBag', color: '#ec4899', bgColor: '#fce7f3', type: 'expense' },
  { id: 'bills', name: 'บิลและค่าน้ำค่าไฟ', iconName: 'Receipt', color: '#8b5cf6', bgColor: '#ede9fe', type: 'expense' },
  { id: 'housing', name: 'ที่อยู่อาศัย', iconName: 'Home', color: '#6366f1', bgColor: '#e0e7ff', type: 'expense' },
  { id: 'health', name: 'สุขภาพและการรักษา', iconName: 'HeartPulse', color: '#ef4444', bgColor: '#fee2e2', type: 'expense' },
  { id: 'entertainment', name: 'บันเทิงและพักผ่อน', iconName: 'Gamepad2', color: '#eab308', bgColor: '#fef9c3', type: 'expense' },
  { id: 'education', name: 'การศึกษาและหนังสือ', iconName: 'GraduationCap', color: '#06b6d4', bgColor: '#cffafe', type: 'expense' },
  { id: 'pet', name: 'สัตว์เลี้ยง', iconName: 'Dog', color: '#d97706', bgColor: '#fef3c7', type: 'expense' },
  { id: 'other_exp', name: 'อื่นๆ', iconName: 'MoreHorizontal', color: '#64748b', bgColor: '#f1f5f9', type: 'expense' }
];

export const INCOME_CATEGORIES: CategoryDef[] = [
  { id: 'salary', name: 'เงินเดือน', iconName: 'Briefcase', color: '#10b981', bgColor: '#d1fae5', type: 'income' },
  { id: 'business', name: 'ธุรกิจส่วนตัว / ค้าขาย', iconName: 'Store', color: '#059669', bgColor: '#a7f3d0', type: 'income' },
  { id: 'bonus', name: 'โบนัส / เงินพิเศษ', iconName: 'Sparkles', color: '#34d399', bgColor: '#ecfdf5', type: 'income' },
  { id: 'investment', name: 'การลงทุนและดอกเบี้ย', iconName: 'TrendingUp', color: '#14b8a6', bgColor: '#ccfbf1', type: 'income' },
  { id: 'gift', name: 'ของขวัญ / เงินช่วยเหลือ', iconName: 'Gift', color: '#38bdf8', bgColor: '#e0f2fe', type: 'income' },
  { id: 'other_inc', name: 'รายรับอื่นๆ', iconName: 'PlusCircle', color: '#64748b', bgColor: '#f1f5f9', type: 'income' }
];

export const ALL_CATEGORIES = [...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES];

export const PAYMENT_METHODS: PaymentMethod[] = [
  'โอนเงิน/พร้อมเพย์',
  'เงินสด',
  'บัตรเครดิต/เดบิต',
  'อื่นๆ'
];

export const THAI_MONTHS = [
  'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน',
  'พฤษภาคม', 'มิถุนายน', 'กรกฎาคม', 'สิงหาคม',
  'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
];

export function formatThaiDate(dateStr: string): string {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;
  const year = parseInt(parts[0], 10) + 543; // Buddhist Era
  const monthIdx = parseInt(parts[1], 10) - 1;
  const day = parseInt(parts[2], 10);
  return `${day} ${THAI_MONTHS[monthIdx] || ''} ${year}`;
}

export function formatThaiMonthYear(yearMonthStr: string): string {
  if (!yearMonthStr) return '';
  const parts = yearMonthStr.split('-');
  if (parts.length !== 2) return yearMonthStr;
  const year = parseInt(parts[0], 10) + 543;
  const monthIdx = parseInt(parts[1], 10) - 1;
  return `${THAI_MONTHS[monthIdx] || ''} ${year}`;
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('th-TH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
}
