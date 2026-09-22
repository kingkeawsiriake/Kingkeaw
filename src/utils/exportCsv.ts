import { Transaction, formatThaiDate, formatCurrency } from '../types.ts';

interface ExportCsvOptions {
  monthName: string;
  yearMonth: string;
  totalIncome?: number;
  totalExpense?: number;
}

/**
 * Escapes a field for CSV format following RFC 4180
 */
function escapeCsvField(field: string | number | undefined | null): string {
  if (field === undefined || field === null) {
    return '""';
  }
  const str = String(field);
  // If the field contains comma, quote, or newline, surround with quotes and escape internal quotes
  if (str.includes('"') || str.includes(',') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return `"${str}"`;
}

/**
 * Generates and triggers download of transactions as a CSV file with UTF-8 BOM
 */
export function exportMonthTransactionsToCsv(
  transactions: Transaction[],
  options: ExportCsvOptions
): boolean {
  if (!transactions || transactions.length === 0) {
    return false;
  }

  // Sort transactions by date ascending, then createdAt ascending for chronological export
  const sorted = [...transactions].sort((a, b) => {
    if (a.date !== b.date) {
      return a.date.localeCompare(b.date);
    }
    return a.createdAt - b.createdAt;
  });

  const totalIncome = options.totalIncome ?? sorted
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = options.totalExpense ?? sorted
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const netBalance = totalIncome - totalExpense;

  const headers = [
    'ลำดับ',
    'วันที่ (YYYY-MM-DD)',
    'วันที่ (ไทย)',
    'ประเภท',
    'หมวดหมู่',
    'จำนวนเงิน (บาท)',
    'ช่องทางชำระเงิน',
    'บันทึกช่วยจำ'
  ];

  const rows: string[][] = sorted.map((tx, idx) => [
    String(idx + 1),
    tx.date,
    formatThaiDate(tx.date),
    tx.type === 'income' ? 'รายรับ' : 'รายจ่าย',
    tx.category,
    tx.amount.toFixed(2),
    tx.paymentMethod || 'เงินสด',
    tx.note || ''
  ]);

  // Summary section
  const summaryRows = [
    [],
    ['--- สรุปยอดรวมประจำเดือน ---', '', '', '', '', '', '', ''],
    ['เดือนที่สรุป:', options.monthName, '', '', '', '', '', ''],
    ['จำนวนรายการทั้งหมด:', `${sorted.length} รายการ`, '', '', '', '', '', ''],
    ['รายรับรวม (บาท):', '', '', '', '', totalIncome.toFixed(2), '', ''],
    ['รายจ่ายรวม (บาท):', '', '', '', '', totalExpense.toFixed(2), '', ''],
    ['คงเหลือสุทธิ (บาท):', '', '', '', '', netBalance.toFixed(2), '', ''],
    ['ส่งออกข้อมูลเมื่อ:', new Date().toLocaleString('th-TH'), '', '', '', '', '', '']
  ];

  const csvRows = [
    headers.map(escapeCsvField).join(','),
    ...rows.map(row => row.map(escapeCsvField).join(',')),
    ...summaryRows.map(row => row.map(escapeCsvField).join(','))
  ];

  // Prepend UTF-8 BOM (\uFEFF) so Excel on Windows/Mac detects UTF-8 correctly
  const csvContent = '\uFEFF' + csvRows.join('\r\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  
  // Safe filename
  const sanitizedMonth = options.yearMonth.replace(/[^a-zA-Z0-9_-]/g, '_');
  link.setAttribute('download', `kingkeaw_transactions_${sanitizedMonth}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  return true;
}
