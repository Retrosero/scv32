import { useState, useEffect, useRef } from 'react';
import { Search, Download } from 'lucide-react';
import { useTransactions } from '../hooks/use-transactions';
import { formatCurrency } from '../lib/utils';
import { cn } from '../lib/utils';
import { TransactionPreview } from '../components/daily-report/transaction-preview';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import html2canvas from 'html2canvas';

type TabType = 'all' | 'sales' | 'payments' | 'expenses' | 'returns';
type SortField = 'date' | 'id' | 'type' | 'customer' | 'amount';
type SortDirection = 'asc' | 'desc';

export function DailyReportPage() {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedType, setSelectedType] = useState<TabType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null);
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [showExportMenu, setShowExportMenu] = useState(false);
  const exportMenuRef = useRef<HTMLDivElement>(null);
  const { transactions } = useTransactions();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (exportMenuRef.current && !exportMenuRef.current.contains(event.target as Node)) {
        setShowExportMenu(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Filter transactions by date and type
  const filteredTransactions = transactions
    .filter(transaction => transaction.date.split('T')[0] === selectedDate)
    .filter(transaction => {
      if (selectedType === 'all') return true;
      switch (selectedType) {
        case 'sales':
          return transaction.type === 'sale';
        case 'payments':
          return transaction.type === 'payment';
        case 'expenses':
          return transaction.type === 'expense';
        case 'returns':
          return transaction.type === 'return';
        default:
          return true;
      }
    })
    .filter(transaction =>
      transaction.customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      transaction.id.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case 'date':
          comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
          break;
        case 'id':
          comparison = a.id.localeCompare(b.id);
          break;
        case 'type':
          comparison = a.type.localeCompare(b.type);
          break;
        case 'customer':
          comparison = a.customer.name.localeCompare(b.customer.name);
          break;
        case 'amount':
          comparison = Math.abs(a.amount) - Math.abs(b.amount);
          break;
      }
      return sortDirection === 'asc' ? comparison : -comparison;
    });

  // Calculate totals for the selected date
  const totals = transactions
    .filter(transaction => transaction.date.split('T')[0] === selectedDate)
    .reduce(
      (acc, transaction) => {
        const amount = Math.abs(transaction.amount);
        switch (transaction.type) {
          case 'sale':
            acc.sales += amount;
            break;
          case 'payment':
            acc.payments += amount;
            break;
          case 'expense':
            acc.expenses += amount;
            break;
          case 'return':
            acc.returns += amount;
            break;
        }
        return acc;
      },
      { sales: 0, payments: 0, expenses: 0, returns: 0 }
    );

  const exportToExcel = () => {
    const data = filteredTransactions.map(t => ({
      'İşlem No': t.id,
      'Tarih': new Date(t.date).toLocaleDateString('tr-TR'),
      'Tür': t.type === 'sale' ? 'Satış' : 
             t.type === 'payment' ? 'Tahsilat' : 
             t.type === 'return' ? 'İade' : 'Tediye',
      'Müşteri': t.customer.name,
      'Tutar': formatCurrency(Math.abs(t.amount)),
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Hesap Hareketleri');
    XLSX.writeFile(wb, `hesap-hareketleri-${selectedDate}.xlsx`);
    setShowExportMenu(false);
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    
    const tableColumn = ['İşlem No', 'Tarih', 'Tür', 'Müşteri', 'Tutar'];
    const tableRows = filteredTransactions.map(t => [
      t.id,
      new Date(t.date).toLocaleDateString('tr-TR'),
      t.type === 'sale' ? 'Satış' : 
      t.type === 'payment' ? 'Tahsilat' : 
      t.type === 'return' ? 'İade' : 'Tediye',
      t.customer.name,
      formatCurrency(Math.abs(t.amount)),
    ]);

    (doc as any).autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 20,
      theme: 'grid',
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: { fillColor: [37, 99, 235] },
    });

    doc.save(`hesap-hareketleri-${selectedDate}.pdf`);
    setShowExportMenu(false);
  };

  const exportToPNG = async () => {
    const element = document.getElementById('transactions-table');
    if (!element) return;

    const canvas = await html2canvas(element);
    const link = document.createElement('a');
    link.download = `hesap-hareketleri-${selectedDate}.png`;
    link.href = canvas.toDataURL();
    link.click();
    setShowExportMenu(false);
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Gün Sonu Raporu</h1>
        <div className="relative" ref={exportMenuRef}>
          <button
            onClick={() => setShowExportMenu(!showExportMenu)}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            <Download className="w-5 h-5" />
            İndir
          </button>
          {showExportMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-10">
              <button
                onClick={exportToExcel}
                className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                Excel
              </button>
              <button
                onClick={exportToPDF}
                className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                PDF
              </button>
              <button
                onClick={exportToPNG}
                className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                PNG
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-500">Toplam Satış</p>
          <p className="text-responsive font-bold">{formatCurrency(totals.sales)}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-500">Toplam Tahsilat</p>
          <p className="text-responsive font-bold">{formatCurrency(totals.payments)}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-500">Toplam Tediye</p>
          <p className="text-responsive font-bold">{formatCurrency(totals.expenses)}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-500">Toplam İade</p>
          <p className="text-responsive font-bold">{formatCurrency(totals.returns)}</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="İşlem ara..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 h-10 rounded-lg border border-gray-200 dark:border-gray-700"
          />
        </div>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="w-48 px-4 h-10 rounded-lg border border-gray-200 dark:border-gray-700"
        />
      </div>

      <div className="flex gap-4 mb-6 overflow-x-auto py-2">
        {(['all', 'sales', 'payments', 'expenses', 'returns'] as const).map((type) => (
          <button
            key={type}
            onClick={() => setSelectedType(type)}
            className={cn(
              'px-4 py-2 rounded-lg whitespace-nowrap',
              selectedType === type
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 dark:bg-gray-700'
            )}
          >
            {type === 'all' ? 'Tümü' :
             type === 'sales' ? 'Satışlar' :
             type === 'payments' ? 'Tahsilatlar' :
             type === 'expenses' ? 'Tediyeler' : 'İadeler'}
          </button>
        ))}
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="overflow-x-auto">
          <table className="w-full" id="transactions-table">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left p-4">İşlem No</th>
                <th className="text-left p-4">Tarih</th>
                <th className="text-left p-4">Tür</th>
                <th className="text-left p-4">Müşteri</th>
                <th className="text-right p-4">Tutar</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.map((transaction) => (
                <tr 
                  key={transaction.id} 
                  onClick={() => setSelectedTransaction(transaction)}
                  className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                >
                  <td className="p-4">{transaction.id}</td>
                  <td className="p-4">{new Date(transaction.date).toLocaleString('tr-TR')}</td>
                  <td className="p-4">
                    {transaction.type === 'sale' ? 'Satış' :
                     transaction.type === 'payment' ? 'Tahsilat' :
                     transaction.type === 'return' ? 'İade' : 'Tediye'}
                  </td>
                  <td className="p-4">
                    <div>
                      <p className="font-medium">{transaction.customer.name}</p>
                      <p className="text-sm text-gray-500">{transaction.customer.phone}</p>
                    </div>
                  </td>
                  <td className="p-4 text-right">{formatCurrency(Math.abs(transaction.amount))}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selectedTransaction && (
        <TransactionPreview
          transaction={selectedTransaction}
          onClose={() => setSelectedTransaction(null)}
          onPrint={() => {
            const printContent = document.getElementById('transaction-content');
            if (!printContent) return;

            const printWindow = window.open('', '_blank');
            if (!printWindow) return;

            printWindow.document.write(`
              <html>
                <head>
                  <title>İşlem Detayı</title>
                  <style>
                    body { font-family: system-ui, -apple-system, sans-serif; }
                    table { width: 100%; border-collapse: collapse; }
                    th, td { padding: 8px; text-align: left; border-bottom: 1px solid #ddd; }
                    @media print {
                      .no-print { display: none; }
                    }
                  </style>
                </head>
                <body>
                  ${printContent.innerHTML}
                </body>
              </html>
            `);
            printWindow.document.close();
            printWindow.print();
          }}
        />
      )}
    </div>
  );
}