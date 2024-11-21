import { 
  BarChart3, Users, ShoppingCart, Wallet, 
  Package, CreditCard, FileText, AlertCircle,
  Settings, LayoutDashboard, RefreshCcw,
  ClipboardList
} from 'lucide-react';
import { useSettings } from '../hooks/use-settings';
import { cn } from '../lib/utils';
import { useNavigate } from 'react-router-dom';

const metrics = [
  {
    id: 'total-sales',
    label: 'Toplam Satış',
    value: '₺123,456',
    change: '+25%',
    icon: Wallet,
  },
  {
    id: 'daily-sales',
    label: 'Günlük Satış',
    value: '₺12,345',
    change: '+18%',
    icon: BarChart3,
  },
  {
    id: 'total-customers',
    label: 'Toplam Müşteri',
    value: '1,234',
    change: '+12%',
    icon: Users,
  },
  {
    id: 'total-products',
    label: 'Toplam Ürün',
    value: '456',
    change: '+5%',
    icon: Package,
  },
  {
    id: 'pending-approvals',
    label: 'Bekleyen Onaylar',
    value: '8',
    change: '-15%',
    icon: AlertCircle,
  },
  {
    id: 'low-stock',
    label: 'Düşük Stok',
    value: '23',
    change: '-8%',
    icon: Package,
  },
];

const menuCards = [
  { id: 'dashboard', label: 'Ana Sayfa', icon: LayoutDashboard, path: '/dashboard' },
  { id: 'customers', label: 'Müşteriler', icon: Users, path: '/customers' },
  { id: 'sales', label: 'Satış', icon: ShoppingCart, path: '/sales' },
  { id: 'products', label: 'Ürünler', icon: Package, path: '/products' },
  { id: 'payments', label: 'Tahsilat', icon: CreditCard, path: '/payments' },
  { id: 'returns', label: 'İadeler', icon: RefreshCcw, path: '/returns' },
  { id: 'daily-report', label: 'Gün Sonu', icon: FileText, path: '/daily-report' },
  { id: 'approvals', label: 'Onay Bekleyenler', icon: AlertCircle, path: '/approvals' },
  { id: 'inventory', label: 'Sayım', icon: ClipboardList, path: '/inventory/count' },
  { id: 'settings', label: 'Ayarlar', icon: Settings, path: '/settings' },
];

export function DashboardPage() {
  const navigate = useNavigate();
  const { dashboardLayout, dashboardOrder, dashboardCards, dashboardMetrics } = useSettings();

  const orderedMenuCards = [...menuCards]
    .filter(card => dashboardCards[card.id] !== false)
    .sort((a, b) => {
      return dashboardOrder.indexOf(a.id) - dashboardOrder.indexOf(b.id);
    });

  const visibleMetrics = metrics.filter(metric => dashboardMetrics[metric.id] !== false);

  if (dashboardLayout === 'metrics') {
    return (
      <div className="p-2 sm:p-4">
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
          {visibleMetrics.map((metric) => {
            const Icon = metric.icon;
            return (
              <div
                key={metric.id}
                className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                      {metric.label}
                    </p>
                    <p className="text-lg sm:text-2xl font-bold mt-1">{metric.value}</p>
                  </div>
                  <div className="bg-primary-50 dark:bg-primary-900/50 p-2 sm:p-3 rounded-lg">
                    <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-primary-600 dark:text-primary-400" />
                  </div>
                </div>
                <div className="mt-2 sm:mt-4">
                  <span className="text-xs sm:text-sm text-green-600 dark:text-green-400">
                    {metric.change}
                  </span>
                  <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 ml-1">
                    vs geçen ay
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="p-2 sm:p-4">
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 sm:gap-4">
        {orderedMenuCards.map((card) => {
          const Icon = card.icon;
          return (
            <button
              key={card.id}
              onClick={() => navigate(card.path)}
              className={cn(
                "bg-white dark:bg-gray-800 rounded-lg p-4",
                "border border-gray-200 dark:border-gray-700",
                "hover:border-primary-500 dark:hover:border-primary-500",
                "transition-all duration-300",
                "flex flex-col items-center justify-center gap-3",
                "min-h-[120px] sm:min-h-[140px] w-full",
                "group"
              )}
            >
              <div className="p-3 bg-white dark:bg-gray-800 rounded-xl shadow-md group-hover:shadow-lg transition-shadow">
                <Icon className="w-6 h-6 sm:w-8 sm:h-8 text-primary-600 dark:text-primary-400" />
              </div>
              <span className="text-sm sm:text-base font-medium text-gray-900 dark:text-white text-center">
                {card.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}