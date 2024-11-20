import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type OrderStatus = 'preparing' | 'checking' | 'loading' | 'ready' | 'delivered';

export type OrderItem = {
  productId: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
  collectedQuantity?: number;
};

export type Order = {
  id: string;
  date: string;
  status: OrderStatus;
  customer: {
    id: string;
    name: string;
    taxNumber: string;
    address: string;
    phone: string;
  };
  items: OrderItem[];
  totalAmount: number;
  note?: string;
  preparedBy?: string;
  preparationEndDate?: string;
  checkedBy?: string;
  checkEndDate?: string;
  loadedBy?: string;
  loadingEndDate?: string;
  deliveredBy?: string;
  deliveryDate?: string;
};

type OrdersState = {
  orders: Order[];
  addOrder: (order: Omit<Order, 'id' | 'date'>) => void;
  updateOrder: (orderId: string, updates: Partial<Order>) => void;
  updateOrderItem: (orderId: string, productId: string, updates: Partial<OrderItem>) => void;
  getOrdersByStatus: (status: OrderStatus) => Order[];
  getOrderById: (id: string) => Order | undefined;
  getStatusCounts: () => Record<OrderStatus, number>;
};

export const useOrders = create<OrdersState>()(
  persist(
    (set, get) => ({
      orders: [],
      
      addOrder: (order) => {
        const newOrder = {
          ...order,
          id: `ORD${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
          date: new Date().toISOString(),
        };
        
        set((state) => ({
          orders: [newOrder, ...state.orders],
        }));
      },

      updateOrder: (orderId, updates) => {
        set((state) => ({
          orders: state.orders.map((order) =>
            order.id === orderId
              ? { ...order, ...updates }
              : order
          ),
        }));
      },

      updateOrderItem: (orderId, productId, updates) => {
        set((state) => ({
          orders: state.orders.map((order) =>
            order.id === orderId
              ? {
                  ...order,
                  items: order.items.map((item) =>
                    item.productId === productId
                      ? { ...item, ...updates }
                      : item
                  ),
                }
              : order
          ),
        }));
      },

      getOrdersByStatus: (status) => {
        return get().orders.filter((order) => order.status === status);
      },

      getOrderById: (id) => {
        return get().orders.find((order) => order.id === id);
      },

      getStatusCounts: () => {
        const orders = get().orders;
        return {
          preparing: orders.filter(o => o.status === 'preparing').length,
          checking: orders.filter(o => o.status === 'checking').length,
          loading: orders.filter(o => o.status === 'loading').length,
          ready: orders.filter(o => o.status === 'ready').length,
          delivered: orders.filter(o => o.status === 'delivered').length,
        };
      },
    }),
    {
      name: 'orders-storage',
    }
  )
);