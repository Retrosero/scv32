import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type NavigationType = 'sidebar' | 'bottom';
type ViewMode = 'grid' | 'list' | 'list-no-image';
type SortOption = 'name-asc' | 'name-desc' | 'price-asc' | 'price-desc' | 'stock-asc' | 'stock-desc';
type DashboardLayout = 'metrics' | 'cards';
type InventoryViewMode = 'grid' | 'list';

type DashboardVisibility = {
  [key: string]: boolean;
};

type ApprovalSettings = {
  sales: boolean;
  payments: boolean;
  expenses: boolean;
  returns: boolean;
  products: boolean;
};

type SettingsState = {
  navigationType: NavigationType;
  defaultViewMode: ViewMode;
  defaultItemsPerPage: number;
  defaultSortOption: SortOption;
  dashboardLayout: DashboardLayout;
  dashboardOrder: string[];
  dashboardCards: DashboardVisibility;
  dashboardMetrics: DashboardVisibility;
  approvalSettings: ApprovalSettings;
  inventoryViewMode: InventoryViewMode;
  setNavigationType: (type: NavigationType) => void;
  setDefaultViewMode: (mode: ViewMode) => void;
  setDefaultItemsPerPage: (count: number) => void;
  setDefaultSortOption: (option: SortOption) => void;
  setDashboardLayout: (layout: DashboardLayout) => void;
  setDashboardOrder: (order: string[]) => void;
  setDashboardCards: (cards: DashboardVisibility) => void;
  setDashboardMetrics: (metrics: DashboardVisibility) => void;
  setApprovalSettings: (settings: Partial<ApprovalSettings>) => void;
  setInventoryViewMode: (mode: InventoryViewMode) => void;
};

export const useSettings = create<SettingsState>()(
  persist(
    (set) => ({
      navigationType: 'sidebar',
      defaultViewMode: 'grid',
      defaultItemsPerPage: 25,
      defaultSortOption: 'name-asc',
      dashboardLayout: 'metrics',
      dashboardOrder: [
        'dashboard',
        'customers',
        'sales',
        'products',
        'payments',
        'returns',
        'daily-report',
        'approvals',
        'settings'
      ],
      dashboardCards: {},
      dashboardMetrics: {},
      approvalSettings: {
        sales: true,
        payments: true,
        expenses: true,
        returns: true,
        products: true,
      },
      inventoryViewMode: 'grid',
      setNavigationType: (type) => set({ navigationType: type }),
      setDefaultViewMode: (mode) => set({ defaultViewMode: mode }),
      setDefaultItemsPerPage: (count) => set({ defaultItemsPerPage: count }),
      setDefaultSortOption: (option) => set({ defaultSortOption: option }),
      setDashboardLayout: (layout) => set({ dashboardLayout: layout }),
      setDashboardOrder: (order) => set({ dashboardOrder: order }),
      setDashboardCards: (cards) => set({ dashboardCards: cards }),
      setDashboardMetrics: (metrics) => set({ dashboardMetrics: metrics }),
      setApprovalSettings: (settings) => set((state) => ({
        approvalSettings: { ...state.approvalSettings, ...settings }
      })),
      setInventoryViewMode: (mode) => set({ inventoryViewMode: mode }),
    }),
    {
      name: 'settings-storage',
    }
  )
);