import { create } from 'zustand';
import { persist } from 'zustand/middleware';

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
};

type TransactionsState = {
  transactions: Transaction[];
  addTransaction: (transaction: Omit<Transaction, 'id' | 'date'>) => void;
  deleteTransaction: (id: string) => void;
  getTransactionsByDate: (date: string) => Transaction[];
};

export const useTransactions = create<TransactionsState>()(
  persist(
    (set, get) => ({
      transactions: [],
      
      addTransaction: (transaction) => {
        set((state) => ({
          transactions: [...state.transactions, {
            ...transaction,
            id: `TRX${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
            date: new Date().toISOString(),
          }],
        }));
      },

      deleteTransaction: (id) => {
        set((state) => ({
          transactions: state.transactions.filter(t => t.id !== id)
        }));
      },

      getTransactionsByDate: (date) => {
        return get().transactions.filter(
          (transaction) => transaction.date.split('T')[0] === date
        );
      },
    }),
    {
      name: 'transactions-storage',
    }
  )
);