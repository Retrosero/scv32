import { useState } from 'react';
import { useTheme } from '../providers/theme-provider';
import { useSettings } from '../hooks/use-settings';
import { Sun, Moon, Sidebar, Menu, LayoutDashboard, LayoutGrid, List, Table, GripVertical, ClipboardCheck } from 'lucide-react';
import { cn } from '../lib/utils';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

const menuCards = [
  { id: 'dashboard', label: 'Dashboard', visible: true },
  { id: 'customers', label: 'Müşteriler', visible: true },
  { id: 'sales', label: 'Satış', visible: true },
  { id: 'products', label: 'Ürünler', visible: true },
  { id: 'payments', label: 'Tahsilat', visible: true },
  { id: 'daily-report', label: 'Gün Sonu', visible: true },
  { id: 'approvals', label: 'Onay Bekleyenler', visible: true },
  { id: 'settings', label: 'Ayarlar', visible: true },
];

const metrics = [
  { id: 'total-sales', label: 'Toplam Satış', visible: true },
  { id: 'daily-sales', label: 'Günlük Satış', visible: true },
  { id: 'total-customers', label: 'Toplam Müşteri', visible: true },
  { id: 'total-products', label: 'Toplam Ürün', visible: true },
  { id: 'pending-approvals', label: 'Bekleyen Onaylar', visible: true },
  { id: 'low-stock', label: 'Düşük Stok', visible: true },
];

type TabType = 'appearance' | 'sales' | 'dashboard' | 'approvals' | 'inventory';

export function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const { 
    navigationType, 
    setNavigationType,
    defaultViewMode,
    setDefaultViewMode,
    defaultItemsPerPage,
    setDefaultItemsPerPage,
    defaultSortOption,
    setDefaultSortOption,
    dashboardLayout,
    setDashboardLayout,
    dashboardOrder,
    setDashboardOrder,
    approvalSettings,
    setApprovalSettings,
    setDashboardCards,
    setDashboardMetrics,
    dashboardCards,
    dashboardMetrics,
    inventoryViewMode,
    setInventoryViewMode,
  } = useSettings();

  const [activeTab, setActiveTab] = useState<TabType>('appearance');

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;

    const items = Array.from(dashboardOrder);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setDashboardOrder(items);
  };

  const handleCardVisibilityChange = (cardId: string) => {
    setDashboardCards({
      ...dashboardCards,
      [cardId]: !dashboardCards[cardId]
    });
  };

  const handleMetricVisibilityChange = (metricId: string) => {
    setDashboardMetrics({
      ...dashboardMetrics,
      [metricId]: !dashboardMetrics[metricId]
    });
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Ayarlar</h1>

      <div className="flex gap-4 border-b border-gray-200 dark:border-gray-700 mb-6">
        <button
          onClick={() => setActiveTab('appearance')}
          className={cn(
            'px-4 py-2 font-medium',
            activeTab === 'appearance'
              ? 'text-primary-600 border-b-2 border-primary-600'
              : 'text-gray-500 dark:text-gray-400'
          )}
        >
          Görünüm
        </button>
        <button
          onClick={() => setActiveTab('sales')}
          className={cn(
            'px-4 py-2 font-medium',
            activeTab === 'sales'
              ? 'text-primary-600 border-b-2 border-primary-600'
              : 'text-gray-500 dark:text-gray-400'
          )}
        >
          Satış Sayfası
        </button>
        <button
          onClick={() => setActiveTab('dashboard')}
          className={cn(
            'px-4 py-2 font-medium',
            activeTab === 'dashboard'
              ? 'text-primary-600 border-b-2 border-primary-600'
              : 'text-gray-500 dark:text-gray-400'
          )}
        >
          Dashboard
        </button>
        <button
          onClick={() => setActiveTab('approvals')}
          className={cn(
            'px-4 py-2 font-medium',
            activeTab === 'approvals'
              ? 'text-primary-600 border-b-2 border-primary-600'
              : 'text-gray-500 dark:text-gray-400'
          )}
        >
          Onay Ayarları
        </button>
        <button
          onClick={() => setActiveTab('inventory')}
          className={cn(
            'px-4 py-2 font-medium',
            activeTab === 'inventory'
              ? 'text-primary-600 border-b-2 border-primary-600'
              : 'text-gray-500 dark:text-gray-400'
          )}
        >
          Sayım
        </button>
      </div>

      <div className="max-w-2xl space-y-6">
        {activeTab === 'appearance' && (
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold mb-4">Görünüm</h2>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                  Tema
                </label>
                <div className="flex gap-4">
                  <button
                    onClick={() => setTheme('light')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${
                      theme === 'light'
                        ? 'border-primary-600 text-primary-600 bg-primary-50 dark:bg-primary-900/50'
                        : 'border-gray-200 dark:border-gray-700'
                    }`}
                  >
                    <Sun className="w-5 h-5" />
                    <span>Açık</span>
                  </button>
                  <button
                    onClick={() => setTheme('dark')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${
                      theme === 'dark'
                        ? 'border-primary-600 text-primary-600 bg-primary-50 dark:bg-primary-900/50'
                        : 'border-gray-200 dark:border-gray-700'
                    }`}
                  >
                    <Moon className="w-5 h-5" />
                    <span>Koyu</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                  Navigasyon Tipi
                </label>
                <div className="flex gap-4">
                  <button
                    onClick={() => setNavigationType('sidebar')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${
                      navigationType === 'sidebar'
                        ? 'border-primary-600 text-primary-600 bg-primary-50 dark:bg-primary-900/50'
                        : 'border-gray-200 dark:border-gray-700'
                    }`}
                  >
                    <Sidebar className="w-5 h-5" />
                    <span>Kenar Çubuğu</span>
                  </button>
                  <button
                    onClick={() => setNavigationType('bottom')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${
                      navigationType === 'bottom'
                        ? 'border-primary-600 text-primary-600 bg-primary-50 dark:bg-primary-900/50'
                        : 'border-gray-200 dark:border-gray-700'
                    }`}
                  >
                    <Menu className="w-5 h-5" />
                    <span>Alt Menü</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'sales' && (
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold mb-4">Satış Sayfası Ayarları</h2>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                  Varsayılan Görünüm
                </label>
                <div className="flex gap-4">
                  <button
                    onClick={() => setDefaultViewMode('grid')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${
                      defaultViewMode === 'grid'
                        ? 'border-primary-600 text-primary-600 bg-primary-50 dark:bg-primary-900/50'
                        : 'border-gray-200 dark:border-gray-700'
                    }`}
                  >
                    <LayoutGrid className="w-5 h-5" />
                    <span>Izgara</span>
                  </button>
                  <button
                    onClick={() => setDefaultViewMode('list')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${
                      defaultViewMode === 'list'
                        ? 'border-primary-600 text-primary-600 bg-primary-50 dark:bg-primary-900/50'
                        : 'border-gray-200 dark:border-gray-700'
                    }`}
                  >
                    <List className="w-5 h-5" />
                    <span>Liste</span>
                  </button>
                  <button
                    onClick={() => setDefaultViewMode('list-no-image')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${
                      defaultViewMode === 'list-no-image'
                        ? 'border-primary-600 text-primary-600 bg-primary-50 dark:bg-primary-900/50'
                        : 'border-gray-200 dark:border-gray-700'
                    }`}
                  >
                    <Table className="w-5 h-5" />
                    <span>Tablo</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                  Sayfa Başına Ürün Sayısı
                </label>
                <select
                  value={defaultItemsPerPage}
                  onChange={(e) => setDefaultItemsPerPage(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700"
                >
                  <option value={25}>25</option>
                  <option value={100}>100</option>
                  <option value={250}>250</option>
                  <option value={500}>500</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                  Varsayılan Sıralama
                </label>
                <select
                  value={defaultSortOption}
                  onChange={(e) => setDefaultSortOption(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700"
                >
                  <option value="name-asc">İsim (A-Z)</option>
                  <option value="name-desc">İsim (Z-A)</option>
                  <option value="price-asc">Fiyat (Düşük-Yüksek)</option>
                  <option value="price-desc">Fiyat (Yüksek-Düşük)</option>
                  <option value="stock-asc">Stok (Az-Çok)</option>
                  <option value="stock-desc">Stok (Çok-Az)</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'dashboard' && (
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold mb-4">Dashboard Ayarları</h2>
            
            <div className="space-y-6">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                  Görünüm Tipi
                </label>
                <div className="flex gap-4">
                  <button
                    onClick={() => setDashboardLayout('metrics')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${
                      dashboardLayout === 'metrics'
                        ? 'border-primary-600 text-primary-600 bg-primary-50 dark:bg-primary-900/50'
                        : 'border-gray-200 dark:border-gray-700'
                    }`}
                  >
                    <LayoutDashboard className="w-5 h-5" />
                    <span>Metrikler</span>
                  </button>
                  <button
                    onClick={() => setDashboardLayout('cards')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${
                      dashboardLayout === 'cards'
                        ? 'border-primary-600 text-primary-600 bg-primary-50 dark:bg-primary-900/50'
                        : 'border-gray-200 dark:border-gray-700'
                    }`}
                  >
                    <LayoutGrid className="w-5 h-5" />
                    <span>Kartlar</span>
                  </button>
                </div>
              </div>

              {dashboardLayout === 'metrics' && (
                <div>
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Görünür Metrikler
                  </h3>
                  <div className="space-y-2">
                    {metrics.map((metric) => (
                      <label key={metric.id} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={dashboardMetrics[metric.id] ?? true}
                          onChange={() => handleMetricVisibilityChange(metric.id)}
                          className="rounded border-gray-300 text-primary-600 shadow-sm focus:border-primary-300 focus:ring focus:ring-primary-200 focus:ring-opacity-50"
                        />
                        <span className="ml-2">{metric.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {dashboardLayout === 'cards' && (
                <div>
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Görünür Kartlar
                  </h3>
                  <div className="space-y-2">
                    {menuCards.map((card) => (
                      <label key={card.id} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={dashboardCards[card.id] ?? true}
                          onChange={() => handleCardVisibilityChange(card.id)}
                          className="rounded border-gray-300 text-primary-600 shadow-sm focus:border-primary-300 focus:ring focus:ring-primary-200 focus:ring-opacity-50"
                        />
                        <span className="ml-2">{card.label}</span>
                      </label>
                    ))}
                  </div>

                  <div className="mt-4">
                    <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Kart Sıralaması
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                      Kartları sürükleyerek sıralayın
                    </p>
                    <DragDropContext onDragEnd={handleDragEnd}>
                      <Droppable droppableId="dashboard-cards">
                        {(provided) => (
                          <div
                            {...provided.droppableProps}
                            ref={provided.innerRef}
                            className="space-y-2"
                          >
                            {dashboardOrder
                              .filter(cardId => dashboardCards[cardId] !== false)
                              .map((cardId, index) => {
                                const card = menuCards.find(c => c.id === cardId);
                                if (!card) return null;
                                
                                return (
                                  <Draggable key={card.id} draggableId={card.id} index={index}>
                                    {(provided) => (
                                      <div
                                        ref={provided.innerRef}
                                        {...provided.draggableProps}
                                        className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-700"
                                      >
                                        <div {...provided.dragHandleProps} className="text-gray-400">
                                          <GripVertical className="w-5 h-5" />
                                        </div>
                                        <span className="font-medium">{card.label}</span>
                                      </div>
                                    )}
                                  </Draggable>
                                );
                            })}
                            {provided.placeholder}
                          </div>
                        )}
                      </Droppable>
                    </DragDropContext>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'approvals' && (
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold mb-4">Onay Ayarları</h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                  İşlem Onayları
                </label>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="sales-approval"
                      checked={approvalSettings.sales}
                      onChange={(e) => setApprovalSettings({ ...approvalSettings, sales: e.target.checked })}
                      className="h-4 w-4 text-primary-600 rounded border-gray-300"
                    />
                    <label htmlFor="sales-approval" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                      Satışlar onaya gönderilsin
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="payments-approval"
                      checked={approvalSettings.payments}
                      onChange={(e) => setApprovalSettings({ ...approvalSettings, payments: e.target.checked })}
                      className="h-4 w-4 text-primary-600 rounded border-gray-300"
                    />
                    <label htmlFor="payments-approval" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                      Tahsilatlar onaya gönderilsin
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="expenses-approval"
                      checked={approvalSettings.expenses}
                      onChange={(e) => setApprovalSettings({ ...approvalSettings, expenses: e.target.checked })}
                      className="h-4 w-4 text-primary-600 rounded border-gray-300"
                    />
                    <label htmlFor="expenses-approval" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                      Tediyeler onaya gönderilsin
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="returns-approval"
                      checked={approvalSettings.returns}
                      onChange={(e) => setApprovalSettings({ ...approvalSettings, returns: e.target.checked })}
                      className="h-4 w-4 text-primary-600 rounded border-gray-300"
                    />
                    <label htmlFor="returns-approval" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                      İadeler onaya gönderilsin
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="products-approval"
                      checked={approvalSettings.products}
                      onChange={(e) => setApprovalSettings({ ...approvalSettings, products: e.target.checked })}
                      className="h-4 w-4 text-primary-600 rounded border-gray-300"
                    />
                    <label htmlFor="products-approval" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                      Ürün değişiklikleri onaya gönderilsin
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'inventory' && (
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold mb-4">Sayım Ayarları</h2>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                  Varsayılan Görünüm
                </label>
                <div className="flex gap-4">
                  <button
                    onClick={() => setInventoryViewMode('grid')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${
                      inventoryViewMode === 'grid'
                        ? 'border-primary-600 text-primary-600 bg-primary-50 dark:bg-primary-900/50'
                        : 'border-gray-200 dark:border-gray-700'
                    }`}
                  >
                    <LayoutGrid className="w-5 h-5" />
                    <span>Resimli</span>
                  </button>
                  <button
                    onClick={() => setInventoryViewMode('list')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${
                      inventoryViewMode === 'list'
                        ? 'border-primary-600 text-primary-600 bg-primary-50 dark:bg-primary-900/50'
                        : 'border-gray-200 dark:border-gray-700'
                    }`}
                  >
                    <List className="w-5 h-5" />
                    <span>Liste</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}