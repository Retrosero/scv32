import { useState } from 'react';
import { Search, Check, X } from 'lucide-react';
import { useApprovals, ApprovalStatus, ApprovalType } from '../hooks/use-approvals';
import { formatCurrency } from '../lib/utils';
import { cn } from '../lib/utils';

type TabType = 'all' | 'sales' | 'payments' | 'expenses' | 'returns' | 'products' | 'orders';

export function ApprovalsPage() {
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const { approvals, updateApprovalStatus } = useApprovals();

  const tabs: TabType[] = [
    'all',
    'sales',
    'payments',
    'expenses',
    'returns',
    'products',
    'orders'
  ];

  const pendingCounts = {
    all: approvals.filter(a => a.status === 'pending').length,
    sales: approvals.filter(a => a.status === 'pending' && a.type === 'sale').length,
    payments: approvals.filter(a => a.status === 'pending' && a.type === 'payment').length,
    expenses: approvals.filter(a => a.status === 'pending' && a.type === 'expense').length,
    returns: approvals.filter(a => a.status === 'pending' && a.type === 'return').length,
    products: approvals.filter(a => a.status === 'pending' && a.type === 'product').length,
    orders: approvals.filter(a => a.status === 'pending' && a.type === 'order_change').length,
  };

  const filteredApprovals = approvals
    .filter(approval => 
      activeTab === 'all' || approval.type === activeTab
    )
    .filter(approval =>
      !searchQuery ||
      approval.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      approval.customer?.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

  const renderApprovalDetail = (approval: any) => {
    switch (approval.type) {
      case 'sale':
        return (
          <div id="approval-detail" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="font-medium mb-2">Müşteri Bilgileri</h3>
                <p>{approval.newData.customer.name}</p>
                <p className="text-sm text-gray-500">{approval.newData.customer.address}</p>
                <p className="text-sm text-gray-500">Tel: {approval.newData.customer.phone}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Tarih</p>
                <p>{new Date(approval.date).toLocaleDateString('tr-TR')}</p>
              </div>
            </div>

            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left">Ürün</th>
                  <th className="text-right">Birim Fiyat</th>
                  <th className="text-right">Miktar</th>
                  <th className="text-right">Toplam</th>
                </tr>
              </thead>
              <tbody>
                {approval.newData.items.map((item: any, index: number) => (
                  <tr key={index} className="border-b">
                    <td>{item.name}</td>
                    <td className="text-right">{formatCurrency(item.price)}</td>
                    <td className="text-right">{item.quantity}</td>
                    <td className="text-right">{formatCurrency(item.price * item.quantity)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                {approval.newData.discount > 0 && (
                  <tr className="text-green-600">
                    <td colSpan={3} className="text-right">İskonto ({approval.newData.discount}%)</td>
                    <td className="text-right">
                      -{formatCurrency(approval.newData.total * (approval.newData.discount / 100))}
                    </td>
                  </tr>
                )}
                <tr className="font-bold">
                  <td colSpan={3} className="text-right">Toplam</td>
                  <td className="text-right">{formatCurrency(approval.newData.total)}</td>
                </tr>
              </tfoot>
            </table>

            {approval.newData.note && (
              <div>
                <h3 className="font-medium mb-2">Not</h3>
                <p className="text-sm text-gray-500">{approval.newData.note}</p>
              </div>
            )}
          </div>
        );

      case 'order_change':
        return (
          <div id="approval-detail" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="font-medium mb-2">Müşteri Bilgileri</h3>
                <p>{approval.customer.name}</p>
                <p className="text-sm text-gray-500">{approval.newData.customer.address}</p>
                <p className="text-sm text-gray-500">Tel: {approval.newData.customer.phone}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Tarih</p>
                <p>{new Date(approval.date).toLocaleDateString('tr-TR')}</p>
                <p className="text-sm text-gray-500 mt-2">Sipariş No</p>
                <p>{approval.newData.id}</p>
              </div>
            </div>

            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left">Ürün</th>
                  <th className="text-center">İstenen</th>
                  <th className="text-center">Yeni</th>
                  <th className="text-right">Birim Fiyat</th>
                  <th className="text-right">Yeni Toplam</th>
                </tr>
              </thead>
              <tbody>
                {approval.newData.items.map((item: any, index: number) => {
                  const oldItem = approval.oldData.items.find((i: any) => i.productId === item.productId);
                  return (
                    <tr key={index} className="border-b">
                      <td>{item.name}</td>
                      <td className="text-center">{oldItem?.quantity}</td>
                      <td className="text-center">{item.quantity}</td>
                      <td className="text-right">{formatCurrency(item.price)}</td>
                      <td className="text-right">{formatCurrency(item.price * item.quantity)}</td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="font-bold">
                  <td colSpan={4} className="text-right">Eski Toplam</td>
                  <td className="text-right">{formatCurrency(approval.oldData.totalAmount)}</td>
                </tr>
                <tr className="font-bold">
                  <td colSpan={4} className="text-right">Yeni Toplam</td>
                  <td className="text-right">{formatCurrency(approval.newData.totalAmount)}</td>
                </tr>
              </tfoot>
            </table>

            {approval.newData.note && (
              <div>
                <h3 className="font-medium mb-2">Not</h3>
                <p className="text-sm text-gray-500">{approval.newData.note}</p>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Onay Bekleyenler</h1>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {[
          { id: 'all', label: 'Tümü', count: pendingCounts.all },
          { id: 'sales', label: 'Satışlar', count: pendingCounts.sales },
          { id: 'payments', label: 'Tahsilatlar', count: pendingCounts.payments },
          { id: 'expenses', label: 'Tediyeler', count: pendingCounts.expenses },
          { id: 'returns', label: 'İadeler', count: pendingCounts.returns },
          { id: 'products', label: 'Ürün Değişiklikleri', count: pendingCounts.products },
          { id: 'orders', label: 'Siparişler', count: pendingCounts.orders },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as TabType)}
            className={cn(
              'px-4 py-2 rounded-lg relative',
              activeTab === tab.id
                ? 'bg-primary-600 text-white'
                : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700'
            )}
          >
            {tab.label}
            {tab.count > 0 && (
              <span className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Onay ara..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 h-10 rounded-lg border border-gray-200 dark:border-gray-700"
        />
      </div>

      <div className="space-y-4">
        {filteredApprovals.map((approval) => (
          <div
            key={approval.id}
            className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4"
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className={cn(
                    'px-2 py-0.5 text-xs rounded-full',
                    approval.status === 'pending'
                      ? 'bg-yellow-100 text-yellow-800'
                      : approval.status === 'approved'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  )}>
                    {approval.status === 'pending' ? 'Bekliyor' :
                     approval.status === 'approved' ? 'Onaylandı' : 'Reddedildi'}
                  </span>
                  <span className="text-sm text-gray-500">
                    {new Date(approval.date).toLocaleString('tr-TR')}
                  </span>
                </div>
                <p className="font-medium mt-1">{approval.description}</p>
                <p className="text-sm text-gray-500">İsteyen: {approval.user}</p>
              </div>
              {approval.status === 'pending' && (
                <div className="flex gap-2">
                  <button
                    onClick={() => updateApprovalStatus(approval.id, 'approved')}
                    className="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/50 rounded-lg"
                  >
                    <Check className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => updateApprovalStatus(approval.id, 'rejected')}
                    className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/50 rounded-lg"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              )}
            </div>

            {renderApprovalDetail(approval)}
          </div>
        ))}
      </div>
    </div>
  );
}