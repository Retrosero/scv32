import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  ShoppingCart,
  FileText,
  Wallet, 
  Settings,
  ChevronRight,
  ChevronLeft,
  Menu,
  Package,
  AlertCircle,
  RefreshCcw,
  ClipboardList,
  PackageCheck
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useState, useEffect } from 'react';
import { useApprovals } from '../../hooks/use-approvals';
import { useOrders } from '../../hooks/use-orders';
import { useInventoryCount } from '../../hooks/use-inventory-count';

interface SidebarProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function Sidebar({ isOpen, onOpenChange }: SidebarProps) {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const [expandedItem, setExpandedItem] = useState<string | null>(null);
  const { approvals } = useApprovals();
  const { getStatusCounts } = useOrders();
  const { getCounts } = useInventoryCount();

  const pendingApprovalsCount = approvals.filter(a => a.status === 'pending').length;
  const orderCounts = getStatusCounts();
  const pendingListsCount = getCounts().filter(list => list.status === 'in-progress').length;

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
    { icon: Users, label: 'Müşteriler', path: '/customers' },
    { icon: ShoppingCart, label: 'Satış', path: '/sales' },
    { icon: Package, label: 'Ürünler', path: '/products' },
    { icon: Wallet, label: 'Ödemeler', path: '/payments' },
    { icon: RefreshCcw, label: 'İadeler', path: '/returns' },
    { icon: FileText, label: 'Gün Sonu', path: '/daily-report' },
    { icon: AlertCircle, label: 'Onay Bekleyenler', path: '/approvals', count: pendingApprovalsCount },
    { 
      icon: PackageCheck, 
      label: 'Siparişler', 
      path: '/orders',
      count: orderCounts.preparing + orderCounts.checking + orderCounts.loading + orderCounts.ready,
      subItems: [
        { label: 'Hazırlanacak', path: '/orders?status=preparing', count: orderCounts.preparing },
        { label: 'Kontrol Edilecek', path: '/orders?status=checking', count: orderCounts.checking },
        { label: 'Yüklenecek', path: '/orders?status=loading', count: orderCounts.loading },
        { label: 'Teslim Edilecek', path: '/orders?status=ready', count: orderCounts.ready },
        { label: 'Teslim Edilenler', path: '/orders?status=delivered' }
      ]
    },
    { 
      icon: ClipboardList, 
      label: 'Sayım', 
      path: '/inventory',
      count: pendingListsCount,
      subItems: [
        { label: 'Sayım Yap', path: '/inventory/count' },
        { label: 'Sayım Listeleri', path: '/inventory/lists', count: pendingListsCount },
        { label: 'Tamamlananlar', path: '/inventory/completed' }
      ]
    },
    { icon: Settings, label: 'Ayarlar', path: '/settings' },
  ];

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (!mobile) {
        onOpenChange(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [onOpenChange]);

  const sidebarContent = (
    <aside 
      className={cn(
        'bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-all duration-300',
        isMobile ? (isOpen ? 'w-72' : 'w-0') : (collapsed ? 'w-16' : 'w-64'),
        'fixed top-16 bottom-0 left-0 z-40'
      )}
    >
      <div className={cn(
        'h-full overflow-y-auto',
        isMobile && !isOpen && 'invisible'
      )}>
        <nav className="p-4 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.subItems 
              ? item.subItems.some(sub => location.pathname + location.search === sub.path)
              : location.pathname === item.path;
            const hasSubItems = item.subItems && item.subItems.length > 0;
            const isExpanded = expandedItem === item.path;

            return (
              <div key={item.path}>
                <Link
                  to={hasSubItems ? '#' : item.path}
                  onClick={(e) => {
                    if (hasSubItems) {
                      e.preventDefault();
                      setExpandedItem(isExpanded ? null : item.path);
                    }
                  }}
                  className={cn(
                    'flex items-center justify-between px-3 py-2 rounded-lg transition-colors whitespace-nowrap',
                    'hover:bg-gray-100 dark:hover:bg-gray-700',
                    isActive && 'bg-primary-50 dark:bg-primary-900 text-primary-600 dark:text-primary-400'
                  )}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    {(!collapsed || isMobile) && (
                      <span className="font-medium">{item.label}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {(!collapsed || isMobile) && item.count > 0 && (
                      <span className="px-2 py-0.5 text-xs bg-red-500 text-white rounded-full">
                        {item.count}
                      </span>
                    )}
                    {(!collapsed || isMobile) && hasSubItems && (
                      <ChevronRight className={cn(
                        "w-4 h-4 transition-transform",
                        isExpanded && "transform rotate-90"
                      )} />
                    )}
                  </div>
                </Link>
                {hasSubItems && isExpanded && (!collapsed || isMobile) && (
                  <div className="ml-8 mt-2 space-y-1">
                    {item.subItems.map((subItem) => (
                      <Link
                        key={subItem.path}
                        to={subItem.path}
                        className={cn(
                          'flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors',
                          'hover:bg-gray-100 dark:hover:bg-gray-700',
                          location.pathname + location.search === subItem.path && 'bg-primary-50 dark:bg-primary-900 text-primary-600 dark:text-primary-400'
                        )}
                      >
                        <span>{subItem.label}</span>
                        {subItem.count > 0 && (
                          <span className="px-2 py-0.5 text-xs bg-red-500 text-white rounded-full">
                            {subItem.count}
                          </span>
                        )}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {!isMobile && (
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="absolute bottom-4 right-0 translate-x-1/2 p-2 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg hover:bg-gray-100 dark:hover:bg-gray-700 z-10"
          >
            {collapsed ? (
              <ChevronRight className="w-5 h-5" />
            ) : (
              <ChevronLeft className="w-5 h-5" />
            )}
          </button>
        )}
      </div>
    </aside>
  );

  return (
    <>
      {isMobile && (
        <button
          onClick={() => onOpenChange(true)}
          className={cn(
            "fixed bottom-4 left-4 z-50 p-3 bg-primary-600 text-white rounded-full shadow-lg hover:bg-primary-700",
            isOpen && "hidden"
          )}
        >
          <Menu className="w-6 h-6" />
        </button>
      )}
      {sidebarContent}
      <div className={cn(
        'w-64 flex-shrink-0 transition-all duration-300',
        collapsed && 'w-16',
        isMobile && 'hidden'
      )} />
    </>
  );
}