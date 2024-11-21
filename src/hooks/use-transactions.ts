import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useProducts } from './use-products';

export type TransactionType = 'sale' | 'payment' | 'expense' | 'return';

export type Transaction = {
  id: string;
  date: string;
  type: TransactionType;
  description: string;
  customer: {
    id: string;
    name: string;
    taxNumber: string;
    address: string;
    phone: string;
  };
  amount: number;
  items?: Array<{
    productId: string;
    name: string;
    quantity: number;
    price: number;
    note?: string;
  }>;
  paymentMethod?: string;
  note?: string;
  discount?: number;
  year?: number;
};

type TransactionsState = {
  transactions: Transaction[];
  addTransaction: (transaction: Omit<Transaction, 'id' | 'date'>) => void;
  deleteTransaction: (id: string) => void;
  getTransactionsByDate: (date: string) => Transaction[];
  getTransactionsByType: (type: TransactionType) => Transaction[];
  getTransactionsByYear: (year: number) => Transaction[];
  getCustomerTransactions: (customerId: string, year?: number) => Transaction[];
  getCustomerBalance: (customerId: string) => number;
  getCustomerStats: (customerId: string) => {
    currentYearSales: number;
    lastYearSales: number;
    currentYearPayments: number;
    lastYearPayments: number;
  };
};

export const useTransactions = create<TransactionsState>()(
  persist(
    (set, get) => ({
      transactions: [],
      
      addTransaction: (transaction) => {
        const { updateProduct } = useProducts.getState();
        const currentYear = new Date().getFullYear();

        console.log('Adding transaction:', transaction); // Debug log

        // Update product stock for sales
        if (transaction.type === 'sale' && transaction.items) {
          console.log('Processing sale items for stock update'); // Debug log
          transaction.items.forEach(item => {
            console.log('Decreasing stock for:', item.productId, item.quantity); // Debug log
            updateProduct(item.productId, 'decreaseStock', item.quantity);
          });
        }

        // Update product stock for returns
        if (transaction.type === 'return' && transaction.items) {
          console.log('Processing return items for stock update'); // Debug log
          transaction.items.forEach(item => {
            console.log('Increasing stock for:', item.productId, item.quantity); // Debug log
            updateProduct(item.productId, 'increaseStock', item.quantity);
          });
        }

        set((state) => ({
          transactions: [{
            ...transaction,
            id: `TRX${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
            date: new Date().toISOString(),
            year: currentYear,
            amount: transaction.type === 'return' ? Math.abs(transaction.amount) : transaction.amount,
          }, ...state.transactions],
        }));
      },

      deleteTransaction: (id) => {
        const transaction = get().transactions.find(t => t.id === id);
        const { updateProduct } = useProducts.getState();

        if (transaction?.items) {
          if (transaction.type === 'sale') {
            transaction.items.forEach(item => {
              updateProduct(item.productId, 'increaseStock', item.quantity);
            });
          } else if (transaction.type === 'return') {
            transaction.items.forEach(item => {
              updateProduct(item.productId, 'decreaseStock', item.quantity);
            });
          }
        }

        set((state) => ({
          transactions: state.transactions.filter(t => t.id !== id)
        }));
      },

      getTransactionsByDate: (date) => {
        return get().transactions.filter(
          (transaction) => transaction.date.split('T')[0] === date
        );
      },

      getTransactionsByType: (type) => {
        return get().transactions.filter(t => t.type === type);
      },

      getTransactionsByYear: (year) => {
        return get().transactions.filter(
          (transaction) => new Date(transaction.date).getFullYear() === year
        );
      },

      getCustomerTransactions: (customerId, year) => {
        return get().transactions.filter(t => {
          const matchesCustomer = t.customer.id === customerId;
          if (year) {
            return matchesCustomer && new Date(t.date).getFullYear() === year;
          }
          return matchesCustomer;
        });
      },

      getCustomerBalance: (customerId) => {
        return get().transactions
          .filter(t => t.customer.id === customerId)
          .reduce((balance, t) => {
            switch (t.type) {
              case 'sale':
                return balance - t.amount;
              case 'payment':
                return balance + t.amount;
              case 'return':
                return balance + t.amount;
              case 'expense':
                return balance - t.amount;
              default:
                return balance;
            }
          }, 0);
      },

      getCustomerStats: (customerId) => {
        const currentYear = new Date().getFullYear();
        const lastYear = currentYear - 1;
        const transactions = get().transactions.filter(t => t.customer.id === customerId);

        return {
          currentYearSales: transactions
            .filter(t => t.type === 'sale' && new Date(t.date).getFullYear() === currentYear)
            .reduce((sum, t) => sum + t.amount, 0),
          lastYearSales: transactions
            .filter(t => t.type === 'sale' && new Date(t.date).getFullYear() === lastYear)
            .reduce((sum, t) => sum + t.amount, 0),
          currentYearPayments: transactions
            .filter(t => t.type === 'payment' && new Date(t.date).getFullYear() === currentYear)
            .reduce((sum, t) => sum + t.amount, 0),
          lastYearPayments: transactions
            .filter(t => t.type === 'payment' && new Date(t.date).getFullYear() === lastYear)
            .reduce((sum, t) => sum + t.amount, 0),
        };
      },
    }),
    {
      name: 'transactions-storage',
    }
  )
);