import { useState } from 'react';
import { Search, Filter, Printer, Eye, FileSpreadsheet, FileText, ArrowUp, ArrowDown } from 'lucide-react';
import { formatCurrency } from '../lib/utils';
import { useTransactions } from '../hooks/use-transactions';
import { TransactionPreview } from '../components/daily-report/transaction-preview';
import { cn } from '../lib/utils';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

type TransactionType = 'all' | 'sale' | 'payment' | 'expense';
type SortField = 'date' | 'id' | 'type' | 'customer' | 'amount';
type SortDirection = 'asc' | 'desc';

export function DailyReportPage() {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedType, setSelectedType] = useState<TransactionType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null);
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const { transactions, getTransactionsByDate } = useTransactions();

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const dailyTransactions = getTransactionsByDate(selectedDate)
    .filter(transaction => 
      selectedType === 'all' || transaction.type === selectedType
    )
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
          comparison = a.amount - b.amount;
          break;
      }
      return sortDirection === 'asc' ? comparison : -comparison;
    });

  const totals = dailyTransactions.reduce(
    (acc, transaction) => {
      const amount = transaction.amount;
      switch (transaction.type) {
        case 'sale':
          acc.sales += amount;
          break;
        case 'payment':
          acc.payments += amount;
          break;
        case 'expense':
          acc.expenses += Math.abs(amount);
          break;
      }
      return acc;
    },
    { sales: 0, payments: 0, expenses: 0 }
  );

  const exportToExcel = () => {
    const data = dailyTransactions.map(t => ({
      'İşlem No': t.id,
      'Tarih': new Date(t.date).toLocaleString('tr-TR'),
      'Tür': t.type === 'sale' ? 'Satış' : t.type === 'payment' ? 'Tahsilat' : 'Tediye',
      'Müşteri': t.customer.name,
      'Tutar': formatCurrency(Math.abs(t.amount)),
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Hesap Hareketleri');
    XLSX.writeFile(wb, `hesap-hareketleri-${selectedDate}.xlsx`);
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    
    const tableColumn = ['İşlem No', 'Tarih', 'Tür', 'Müşteri', 'Tutar'];
    const tableRows = dailyTransactions.map(t => [
      t.id,
      new Date(t.date).toLocaleString('tr-TR'),
      t.type === 'sale' ? 'Satış' : t.type === 'payment' ? 'Tahsilat' : 'Tediye',
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
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? 
      <ArrowUp className="w-4 h-4 inline-block ml-1" /> : 
      <ArrowDown className="w-4 h-4 inline-block ml-1" />;
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Gün Sonu Raporu</h1>
        <div className="flex gap-2">
          <button
            onClick={exportToExcel}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            <FileSpreadsheet className="w-5 h-5" />
            Excel
          </button>
          <button
            onClick={exportToPDF}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            <FileText className="w-5 h-5" />
            PDF
          </button>
          <button
            onClick={() => {
              const printContent = document.getElementById('report-content');
              if (printContent) {
                const printWindow = window.open('', '_blank');
                if (printWindow) {
                  printWindow.document.write(`
                    <html>
                      <head>
                        <title>Gün Sonu Raporu</title>
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
                }
              }
            }}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            <Printer className="w-5 h-5" />
            Yazdır
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-4 mb-6">
        <div className="flex-1 min-w-[200px]">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700"
          />
        </div>
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="İşlem ara..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700"
          />
        </div>
        <div className="flex gap-2">
          {(['all', 'sale', 'payment', 'expense'] as const).map((type) => (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              className={cn(
                'px-4 py-2 rounded-lg',
                selectedType === type
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700'
              )}
            >
              {type === 'all' ? 'Tümü' :
               type === 'sale' ? 'Satışlar' :
               type === 'payment' ? 'Tahsilatlar' : 'Tediyeler'}
            </button>
          ))}
        </div>
      </div>

      <div id="report-content">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-500">Toplam Satış</p>
            <p className="text-2xl font-bold">{formatCurrency(totals.sales)}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-500">Toplam Tahsilat</p>
            <p className="text-2xl font-bold">{formatCurrency(totals.payments)}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-500">Toplam Tediye</p>
            <p className="text-2xl font-bold">{formatCurrency(totals.expenses)}</p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th 
                    className="text-left p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
                    onClick={() => handleSort('id')}
                  >
                    İşlem No
                    <SortIcon field="id" />
                  </th>
                  <th 
                    className="text-left p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
                    onClick={() => handleSort('date')}
                  >
                    Tarih
                    <SortIcon field="date" />
                  </th>
                  <th 
                    className="text-left p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
                    onClick={() => handleSort('type')}
                  >
                    Tür
                    <SortIcon field="type" />
                  </th>
                  <th 
                    className="text-left p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
                    onClick={() => handleSort('customer')}
                  >
                    Müşteri
                    <SortIcon field="customer" />
                  </th>
                  <th 
                    className="text-right p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
                    onClick={() => handleSort('amount')}
                  >
                    Tutar
                    <SortIcon field="amount" />
                  </th>
                  <th className="text-center p-4 no-print">İşlemler</th>
                </tr>
              </thead>
              <tbody>
                {dailyTransactions.map((transaction) => (
                  <tr 
                    key={transaction.id} 
                    className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                    onClick={() => setSelectedTransaction(transaction)}
                  >
                    <td className="p-4">{transaction.id}</td>
                    <td className="p-4">{new Date(transaction.date).toLocaleString('tr-TR')}</td>
                    <td className="p-4 capitalize">
                      {transaction.type === 'sale' ? 'Satış' :
                       transaction.type === 'payment' ? 'Tahsilat' : 'Tediye'}
                    </td>
                    <td className="p-4">
                      <div>
                        <p className="font-medium">{transaction.customer.name}</p>
                        <p className="text-sm text-gray-500">{transaction.customer.phone}</p>
                      </div>
                    </td>
                    <td className="p-4 text-right">{formatCurrency(Math.abs(transaction.amount))}</td>
                    <td className="p-4 no-print">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedTransaction(transaction);
                          }}
                          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                          title="Görüntüle"
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedTransaction(transaction);
                          }}
                          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                          title="Yazdır"
                        >
                          <Printer className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {selectedTransaction && (
        <TransactionPreview
          transaction={selectedTransaction}
          onClose={() => setSelectedTransaction(null)}
          onPrint={() => {
            const printContent = document.getElementById('transaction-content');
            if (printContent) {
              const printWindow = window.open('', '_blank');
              if (printWindow) {
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
              }
            }
          }}
        />
      )}
    </div>
  );
}