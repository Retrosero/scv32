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
              const { addOrder } = useOrders.getState();

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

                case 'order_change':
                  // Delete old transaction
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

                  // Update order status to loading
                  const { updateOrder } = useOrders.getState();
                  updateOrder(approval.newData.id, {
                    items: approval.newData.items,
                    totalAmount: approval.newData.totalAmount,
                    status: 'loading'
                  });
                  break;

                // Handle other approval types...
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