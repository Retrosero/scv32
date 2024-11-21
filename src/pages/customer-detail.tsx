import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Phone, Mail, MapPin, Plus, CreditCard, ArrowLeft } from 'lucide-react';
import { customers } from '../data/customers';
import { useTransactions } from '../hooks/use-transactions';
import { useOrders } from '../hooks/use-orders';
import { formatCurrency } from '../lib/utils';
import { cn } from '../lib/utils';

export function CustomerDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { transactions, getCustomerTransactions, getCustomerStats, getCustomerBalance } = useTransactions();
  const { getOrdersByCustomer } = useOrders();
  const [activeTab, setActiveTab] = useState<'transactions' | 'orders' | 'products' | 'turnover'>('transactions');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const customer = customers.find(c => c.id === id);
  if (!customer) return null;

  const customerTransactions = getCustomerTransactions(id, selectedYear);
  const customerOrders = getOrdersByCustomer(customer.id);
  const balance = getCustomerBalance(customer.id);
  const stats = getCustomerStats(customer.id);

  // Get sold products from transactions
  const soldProducts = customerTransactions
    .filter(t => t.type === 'sale' && t.items)
    .flatMap(t => t.items || [])
    .reduce((acc, item) => {
      const existing = acc.find(p => p.productId === item.productId);
      if (existing) {
        existing.quantity += item.quantity;
        existing.total += item.price * item.quantity;
      } else {
        acc.push({
          productId: item.productId,
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          total: item.price * item.quantity
        });
      }
      return acc;
    }, [] as Array<{
      productId: string;
      name: string;
      quantity: number;
      price: number;
      total: number;
    }>);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
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

        <div className="px-4">
          <div className="flex gap-4 border-b border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setActiveTab('transactions')}
              className={cn(
                'px-4 py-2 font-medium',
                activeTab === 'transactions'
                  ? 'text-primary-600 border-b-2 border-primary-600'
                  : 'text-gray-500 dark:text-gray-400'
              )}
            >
              Hesap Hareketleri
            </button>
            <button
              onClick={() => setActiveTab('orders')}
              className={cn(
                'px-4 py-2 font-medium',
                activeTab === 'orders'
                  ? 'text-primary-600 border-b-2 border-primary-600'
                  : 'text-gray-500 dark:text-gray-400'
              )}
            >
              Siparişler
            </button>
            <button
              onClick={() => setActiveTab('products')}
              className={cn(
                'px-4 py-2 font-medium',
                activeTab === 'products'
                  ? 'text-primary-600 border-b-2 border-primary-600'
                  : 'text-gray-500 dark:text-gray-400'
              )}
            >
              Satılanlar
            </button>
            <button
              onClick={() => setActiveTab('turnover')}
              className={cn(
                'px-4 py-2 font-medium',
                activeTab === 'turnover'
                  ? 'text-primary-600 border-b-2 border-primary-600'
                  : 'text-gray-500 dark:text-gray-400'
              )}
            >
              Ciro
            </button>
          </div>
        </div>
      </div>

      <div className="p-4">
        {activeTab === 'transactions' && (
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700"
              >
                {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left p-4">Tarih</th>
                    <th className="text-left p-4">İşlem</th>
                    <th className="text-left p-4">Açıklama</th>
                    <th className="text-right p-4">Tutar</th>
                    <th className="text-right p-4">Bakiye</th>
                  </tr>
                </thead>
                <tbody>
                  {customerTransactions.map((transaction) => (
                    <tr key={transaction.id} className="border-b border-gray-200 dark:border-gray-700">
                      <td className="p-4">
                        {new Date(transaction.date).toLocaleDateString('tr-TR')}
                      </td>
                      <td className="p-4 capitalize">
                        {transaction.type === 'sale' ? 'Satış' :
                         transaction.type === 'payment' ? 'Tahsilat' :
                         transaction.type === 'return' ? 'İade' : 'Tediye'}
                      </td>
                      <td className="p-4">{transaction.description}</td>
                      <td className={`p-4 text-right ${
                        transaction.type === 'payment' || transaction.type === 'return' ? 'text-green-500' : 'text-red-500'
                      }`}>
                        {transaction.type === 'payment' || transaction.type === 'return' ? '+' : '-'}
                        {formatCurrency(Math.abs(transaction.amount))}
                      </td>
                      <td className="p-4 text-right">
                        {formatCurrency(transaction.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left p-4">Sipariş No</th>
                    <th className="text-left p-4">Tarih</th>
                    <th className="text-center p-4">Durum</th>
                    <th className="text-right p-4">Tutar</th>
                  </tr>
                </thead>
                <tbody>
                  {customerOrders.map((order) => (
                    <tr key={order.id} className="border-b border-gray-200 dark:border-gray-700">
                      <td className="p-4">{order.id}</td>
                      <td className="p-4">
                        {new Date(order.date).toLocaleDateString('tr-TR')}
                      </td>
                      <td className="p-4 text-center">
                        <span className={cn(
                          'px-2 py-1 rounded-full text-xs',
                          order.status === 'preparing' ? 'bg-yellow-100 text-yellow-800' :
                          order.status === 'checking' ? 'bg-blue-100 text-blue-800' :
                          order.status === 'loading' ? 'bg-purple-100 text-purple-800' :
                          order.status === 'ready' ? 'bg-orange-100 text-orange-800' :
                          'bg-green-100 text-green-800'
                        )}>
                          {order.status === 'preparing' ? 'Hazırlanıyor' :
                           order.status === 'checking' ? 'Kontrol Ediliyor' :
                           order.status === 'loading' ? 'Yükleniyor' :
                           order.status === 'ready' ? 'Teslime Hazır' :
                           'Teslim Edildi'}
                        </span>
                      </td>
                      <td className="p-4 text-right">{formatCurrency(order.totalAmount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'products' && (
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left p-4">Ürün</th>
                    <th className="text-right p-4">Birim Fiyat</th>
                    <th className="text-right p-4">Miktar</th>
                    <th className="text-right p-4">Toplam</th>
                  </tr>
                </thead>
                <tbody>
                  {soldProducts.map((product) => (
                    <tr key={product.productId} className="border-b border-gray-200 dark:border-gray-700">
                      <td className="p-4">{product.name}</td>
                      <td className="p-4 text-right">{formatCurrency(product.price)}</td>
                      <td className="p-4 text-right">{product.quantity}</td>
                      <td className="p-4 text-right">{formatCurrency(product.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'turnover' && (
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-medium mb-4">Satışlar</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500">Bu Yıl</p>
                  <p className="text-xl font-bold">{formatCurrency(stats.currentYearSales)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Geçen Yıl</p>
                  <p className="text-xl font-bold">{formatCurrency(stats.lastYearSales)}</p>
                </div>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-medium mb-4">Tahsilatlar</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500">Bu Yıl</p>
                  <p className="text-xl font-bold">{formatCurrency(stats.currentYearPayments)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Geçen Yıl</p>
                  <p className="text-xl font-bold">{formatCurrency(stats.lastYearPayments)}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}