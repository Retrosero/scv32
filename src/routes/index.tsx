import { Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from '../components/layout';
import { LoginPage } from '../pages/login';
import { DashboardPage } from '../pages/dashboard';
import { CustomersPage } from '../pages/customers';
import { CustomerDetailPage } from '../pages/customer-detail';
import { SalesPage } from '../pages/sales';
import { PaymentsPage } from '../pages/payments';
import { DailyReportPage } from '../pages/daily-report';
import { SettingsPage } from '../pages/settings';
import { ProductsPage } from '../pages/products';
import { ApprovalsPage } from '../pages/approvals';
import { ReturnsPage } from '../pages/returns';
import { InventoryCountPage } from '../pages/inventory/count';
import { InventoryListsPage } from '../pages/inventory/lists';
import { CompletedInventoryPage } from '../pages/inventory/completed';
import { OrdersPage } from '../pages/orders/index';
import { OrderPreparationPage } from '../pages/orders/preparation';
import { OrderRoutePage } from '../pages/orders/route';
import { OrderDeliveryPage } from '../pages/orders/delivery';
import { CompletedDeliveriesPage } from '../pages/orders/completed-deliveries';
import { useAuth } from '../hooks/use-auth';

export function AppRoutes() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/customers" element={<CustomersPage />} />
        <Route path="/customers/:id" element={<CustomerDetailPage />} />
        <Route path="/sales" element={<SalesPage />} />
        <Route path="/payments" element={<PaymentsPage />} />
        <Route path="/daily-report" element={<DailyReportPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/approvals" element={<ApprovalsPage />} />
        <Route path="/returns" element={<ReturnsPage />} />
        <Route path="/inventory/count" element={<InventoryCountPage />} />
        <Route path="/inventory/lists" element={<InventoryListsPage />} />
        <Route path="/inventory/completed" element={<CompletedInventoryPage />} />
        <Route path="/orders" element={<OrdersPage />} />
        <Route path="/orders/preparation/:id" element={<OrderPreparationPage />} />
        <Route path="/orders/route" element={<OrderRoutePage />} />
        <Route path="/orders/delivery" element={<OrderDeliveryPage />} />
        <Route path="/orders/completed-deliveries" element={<CompletedDeliveriesPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}