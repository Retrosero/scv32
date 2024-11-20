import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Phone, Mail, MapPin, Plus, CreditCard, ArrowLeft } from 'lucide-react';
import { customers } from '../data/customers';
import { useTransactions } from '../hooks/use-transactions';
import { formatCurrency } from '../lib/utils';
import { Search } from 'lucide-react';
import { TransactionPreview } from '../components/daily-report/transaction-preview';
import { OrderPreview } from '../components/orders/order-preview';

export function CustomerDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { transactions } = useTransactions();
  const [activeTab, setActiveTab] = useState<'transactions' | 'orders' | 'products'>('transactions');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);

  const customer = customers.find(c => c.id === id);
  if (!customer) return null;

  const customerTransactions = transactions.filter(t => t.customer.id === id);

  // Calculate total balance
  const balance = customerTransactions.reduce((sum, transaction) => {
    if (transaction.type === 'sale') return sum - transaction.amount;
    if (transaction.type === 'payment') return sum + transaction.amount;
    return sum;
  }, 0);

  // Get all products purchased by customer
  const purchasedProducts = customerTransactions
    .filter(transaction => transaction.type === 'sale' && transaction.items)
    .flatMap(transaction => {
      const date = transaction.date;
      return (transaction.items || []).map(item => ({
        ...item,
        date
      }));
    })
    .reduce((acc, item) => {
      const existing = acc.find(p => p.productId === item.productId);
      if (existing) {
        existing.purchases.push({
          date: item.date,
          quantity: item.quantity,
          price: item.price
        });
      } else {
        acc.push({
          productId: item.productId,
          name: item.name,
          purchases: [{
            date: item.date,
            quantity: item.quantity,
            price: item.price
          }]
        });
      }
      return acc;
    }, [] as Array<{
      productId: string;
      name: string;
      purchases: Array<{
        date: string;
        quantity: number;
        price: number;
      }>;
    }>);

  const filteredProducts = purchasedProducts.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.productId.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handlePrint = (content: string) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>Detay</title>
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
          ${content}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="px-4 py-6">
          <button
            onClick={() => navigate('/customers')}
            className="flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Müşteriler</span>
          </button>

          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{customer.name}</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">#{customer.taxNumber}</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => navigate('/sales')}
                className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
              >
                <Plus className="w-4 h-4" />
                <span>Satış</span>
              </button>
              <button
                onClick={() => navigate('/payments')}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                <CreditCard className="w-4 h-4" />
                <span>Tahsilat</span>
              </button>
            </div>
          </div>

          <div className="mt-4 space-y-2">
            <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
              <Phone className="w-4 h-4" />
              <span>{customer.phone}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
              <Mail className="w-4 h-4" />
              <span>{customer.email}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
              <MapPin className="w-4 h-4" />
              <span>{customer.address}</span>
            </div>
          </div>

          <div className="mt-6 flex items-center gap-8">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Bakiye</p>
              <p className={`text-2xl font-bold ${balance >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {formatCurrency(balance)}
              </p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="px-4">
          <div className="flex gap-4 border-b border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setActiveTab('transactions')}
              className={`px-4 py-2 font-medium ${
                activeTab === 'transactions'
                  ? 'text-primary-600 border-b-2 border-primary-600'
                  : 'text-gray-500 dark:text-gray-400'
              }`}
            >
              Hesap Hareketleri
            </button>
            <button
              onClick={() => setActiveTab('orders')}
              className={`px-4 py-2 font-medium ${
                activeTab === 'orders'
                  ? 'text-primary-600 border-b-2 border-primary-600'
                  : 'text-gray-500 dark:text-gray-400'
              }`}
            >
              Siparişler
            </button>
            <button
              onClick={() => setActiveTab('products')}
              className={`px-4 py-2 font-medium ${
                activeTab === 'products'
                  ? 'text-primary-600 border-b-2 border-primary-600'
                  : 'text-gray-500 dark:text-gray-400'
              }`}
            >
              Satılanlar
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {activeTab === 'transactions' && (
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left p-4">Tarih</th>
                    <th className="text-left p-4">İşlem</th>
                    <th className="text-left p-4">Açıklama</th>
                    <th className="text-right p-4">Tutar</th>
                  </tr>
                </thead>
                <tbody>
                  {customerTransactions.map((transaction) => (
                    <tr 
                      key={transaction.id} 
                      onClick={() => setSelectedTransaction(transaction)}
                      className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                    >
                      <td className="p-4">
                        {new Date(transaction.date).toLocaleDateString('tr-TR')}
                      </td>
                      <td className="p-4 capitalize">
                        {transaction.type === 'sale' ? 'Satış' :
                         transaction.type === 'payment' ? 'Tahsilat' : 'Tediye'}
                      </td>
                      <td className="p-4">{transaction.description}</td>
                      <td className={`p-4 text-right ${
                        transaction.type === 'payment' ? 'text-green-500' : 'text-red-500'
                      }`}>
                        {transaction.type === 'payment' ? '+' : '-'}
                        {formatCurrency(Math.abs(transaction.amount))}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="space-y-4">
            {customerTransactions
              .filter(t => t.type === 'sale')
              .map((order) => (
                <div
                  key={order.id}
                  onClick={() => setSelectedOrder(order)}
                  className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">Sipariş #{order.id}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(order.date).toLocaleDateString('tr-TR')}
                      </p>
                    </div>
                    <p className="text-lg font-bold">{formatCurrency(order.amount)}</p>
                  </div>
                  
                  {order.items && (
                    <div className="space-y-2">
                      {order.items.map((item, index) => (
                        <div key={index} className="flex justify-between text-sm">
                          <span className="text-gray-600 dark:text-gray-300">
                            {item.name} × {item.quantity}
                          </span>
                          <span className="text-gray-900 dark:text-white">
                            {formatCurrency(item.price * item.quantity)}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
          </div>
        )}

        {activeTab === 'products' && (
          <>
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Ürün ara..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      <th className="text-left p-4">Tarih</th>
                      <th className="text-left p-4">Ürün Kodu</th>
                      <th className="text-left p-4">Ürün Adı</th>
                      <th className="text-right p-4">Adet</th>
                      <th className="text-right p-4">Birim Fiyat</th>
                      <th className="text-right p-4">Toplam</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProducts.flatMap(product =>
                      product.purchases.map((purchase, index) => (
                        <tr key={`${product.productId}-${index}`} className="border-b border-gray-200 dark:border-gray-700">
                          <td className="p-4">{new Date(purchase.date).toLocaleDateString('tr-TR')}</td>
                          <td className="p-4">{product.productId}</td>
                          <td className="p-4">{product.name}</td>
                          <td className="p-4 text-right">{purchase.quantity}</td>
                          <td className="p-4 text-right">{formatCurrency(purchase.price)}</td>
                          <td className="p-4 text-right">{formatCurrency(purchase.price * purchase.quantity)}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Transaction Preview */}
      {selectedTransaction && (
        <TransactionPreview
          transaction={selectedTransaction}
          onClose={() => setSelectedTransaction(null)}
          onPrint={() => {
            const content = document.getElementById('transaction-content');
            if (content) handlePrint(content.innerHTML);
          }}
        />
      )}

      {/* Order Preview */}
      {selectedOrder && (
        <OrderPreview
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onPrint={() => {
            const content = document.getElementById('order-content');
            if (content) handlePrint(content.innerHTML);
          }}
        />
      )}
    </div>
  );
}