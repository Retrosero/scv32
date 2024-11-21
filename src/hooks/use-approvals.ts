import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useOrders } from './use-orders';
import { useTransactions } from './use-transactions';

export type ApprovalStatus = 'pending' | 'approved' | 'rejected';
export type ApprovalType = 'product' | 'sale' | 'payment' | 'expense' | 'return' | 'order_change';

export type Approval = {
  id: string;
  type: ApprovalType;
  date: string;
  user: string;
  oldData: any;
  newData: any;
  status: ApprovalStatus;
  description?: string;
  amount?: number;
  customer?: {
    id: string;
    name: string;
  };
  processed?: boolean;
};

type ApprovalsState = {
  approvals: Approval[];
  addApproval: (approval: Omit<Approval, 'id' | 'date' | 'status'>) => void;
  updateApprovalStatus: (id: string, status: ApprovalStatus) => void;
  getApprovalsByStatus: (status: ApprovalStatus) => Approval[];
  getApprovalsByType: (type: ApprovalType) => Approval[];
};

export const useApprovals = create<ApprovalsState>()(
  persist(
    (set, get) => ({
      approvals: [],
      
      addApproval: (approval) => {
        const newApproval = {
          ...approval,
          id: `APR${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
          date: new Date().toISOString(),
          status: 'pending' as ApprovalStatus,
        };
        
        set((state) => ({
          approvals: [newApproval, ...state.approvals],
        }));
      },

      updateApprovalStatus: (id, status) => {
        set((state) => ({
          approvals: state.approvals.map((approval) => {
            if (approval.id !== id) return approval;

            // Handle approval based on type
            if (status === 'approved' && !approval.processed) {
              const { addTransaction, deleteTransaction } = useTransactions.getState();
              const { updateOrder, setOrderPendingApproval } = useOrders.getState();

              switch (approval.type) {
                case 'sale':
                  // Add transaction and create order
                  addTransaction({
                    type: 'sale',
                    description: 'Satış',
                    customer: approval.newData.customer,
                    amount: approval.newData.total,
                    items: approval.newData.items,
                    note: approval.newData.note,
                    date: new Date().toISOString(),
                  });

                  // Create order in preparing status
                  const { addOrder } = useOrders.getState();
                  addOrder({
                    status: 'preparing',
                    customer: approval.newData.customer,
                    items: approval.newData.items.map((item: any) => ({
                      productId: item.productId,
                      name: item.name,
                      image: item.image || '',
                      price: item.price,
                      quantity: item.quantity
                    })),
                    totalAmount: approval.newData.total,
                    note: approval.newData.note
                  });
                  break;

                case 'payment':
                  // Add payment transaction
                  addTransaction({
                    type: 'payment',
                    description: 'Tahsilat',
                    customer: approval.newData.customer,
                    amount: approval.newData.total,
                    paymentMethod: approval.newData.payments.map((p: any) => {
                      switch (p.type) {
                        case 'nakit': return 'Nakit';
                        case 'krediKarti': return `Kredi Kartı (${p.data.bank})`;
                        case 'cek': return `Çek (${p.data.bank} - ${p.data.checkNumber})`;
                        case 'senet': return `Senet (${p.data.bondNumber})`;
                        case 'havale': return `Havale (${p.data.bank})`;
                        default: return p.type;
                      }
                    }).join(', '),
                    note: approval.newData.note,
                    date: new Date().toISOString(),
                  });
                  break;

                case 'expense':
                  // Add expense transaction
                  addTransaction({
                    type: 'expense',
                    description: 'Tediye',
                    customer: approval.newData.customer,
                    amount: -approval.newData.total,
                    paymentMethod: approval.newData.payments.map((p: any) => {
                      switch (p.type) {
                        case 'nakit': return 'Nakit';
                        case 'krediKarti': return `Kredi Kartı (${p.data.bank})`;
                        case 'cek': return `Çek (${p.data.bank} - ${p.data.checkNumber})`;
                        case 'senet': return `Senet (${p.data.bondNumber})`;
                        case 'havale': return `Havale (${p.data.bank})`;
                        default: return p.type;
                      }
                    }).join(', '),
                    note: approval.newData.note,
                    date: new Date().toISOString(),
                  });
                  break;

                case 'return':
                  // Add return transaction
                  addTransaction({
                    type: 'return',
                    description: 'İade',
                    customer: approval.newData.customer,
                    amount: approval.newData.total,
                    items: approval.newData.items,
                    note: approval.newData.note,
                    date: new Date().toISOString(),
                  });
                  break;

                case 'order_change':
                  // Delete old transaction if exists
                  if (approval.oldData.transactionId) {
                    deleteTransaction(approval.oldData.transactionId);
                  }

                  // Create new transaction
                  addTransaction({
                    type: 'sale',
                    description: 'Satış (Güncellendi)',
                    customer: approval.newData.customer,
                    amount: approval.newData.totalAmount,
                    items: approval.newData.items,
                    note: approval.newData.note,
                    date: new Date().toISOString(),
                  });

                  // Update order with new quantities
                  const updatedOrder = {
                    ...approval.newData,
                    status: approval.oldData.status, // Preserve original status
                    routeId: approval.oldData.routeId, // Preserve route info
                    routeName: approval.oldData.routeName,
                    routeOrder: approval.oldData.routeOrder,
                    routeDate: approval.oldData.routeDate,
                    pendingApproval: false
                  };

                  updateOrder(approval.newData.id, updatedOrder);
                  break;
              }
            }

            return { ...approval, status, processed: true };
          }),
        }));
      },

      getApprovalsByStatus: (status) => {
        return get().approvals.filter((approval) => approval.status === status);
      },

      getApprovalsByType: (type) => {
        return get().approvals.filter((approval) => approval.type === type);
      },
    }),
    {
      name: 'approvals-storage',
    }
  )
);