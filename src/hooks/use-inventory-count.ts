import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { products } from '../data/products';

export type CountedProduct = {
  id: string;
  name: string;
  code: string;
  barcode?: string;
  currentStock: number;
  countedStock: number;
  countedDepartments: string[];
  countDate: string;
  image: string;
  price?: number;
};

export type InventoryList = {
  id: string;
  name: string;
  description?: string;
  date: string;
  status: 'in-progress' | 'completed';
  items: CountedProduct[];
  departments: string[];
  totalItems: number;
  totalValue: number;
  completedBy?: string;
  completedDate?: string;
  note?: string;
  productIds: string[]; // Added to store the list of product IDs
};

type InventoryCountState = {
  counts: InventoryList[];
  addCount: (product: CountedProduct, listId?: string) => void;
  createList: (name: string, description: string, productIds: string[]) => string;
  addToList: (listId: string, product: CountedProduct) => void;
  getCounts: () => InventoryList[];
  getList: (id: string) => InventoryList | undefined;
  completeCount: (listId: string, completedBy: string, note?: string) => void;
  updateCount: (listId: string, updatedProduct: CountedProduct) => void;
  getActiveCount: (listId?: string) => InventoryList | undefined;
  deleteList: (listId: string) => void;
};

export const useInventoryCount = create<InventoryCountState>()(
  persist(
    (set, get) => ({
      counts: [],
      
      addCount: (product, listId) => {
        let activeCount = get().getActiveCount(listId);
        
        if (!activeCount) {
          const newListId = get().createList('Yeni Sayım', '', []);
          activeCount = get().getList(newListId);
        }

        if (activeCount) {
          const existingProduct = activeCount.items.find(item => 
            item.id === product.id && 
            item.countedDepartments[0] === product.countedDepartments[0]
          );
          
          if (existingProduct) {
            get().updateCount(activeCount.id, product);
          } else {
            get().addToList(activeCount.id, product);
          }
        }
      },

      createList: (name, description, productIds) => {
        const newList: InventoryList = {
          id: `LIST${Math.random().toString(36).substr(2, 9)}`,
          name,
          description,
          date: new Date().toISOString(),
          status: 'in-progress',
          items: [],
          departments: [],
          totalItems: 0,
          totalValue: 0,
          productIds, // Store the product IDs
        };

        set(state => ({
          counts: [newList, ...state.counts]
        }));

        return newList.id;
      },

      addToList: (listId, product) => {
        set(state => ({
          counts: state.counts.map(list =>
            list.id === listId
              ? {
                  ...list,
                  items: [...list.items, product],
                  departments: Array.from(new Set([
                    ...list.departments,
                    ...(product.countedDepartments || [])
                  ])),
                  totalItems: list.items.length + 1,
                  totalValue: list.totalValue + (product.countedStock * (product.price || 0))
                }
              : list
          )
        }));
      },

      updateCount: (listId, updatedProduct) => {
        set(state => ({
          counts: state.counts.map(list =>
            list.id === listId
              ? {
                  ...list,
                  items: list.items.map(item =>
                    item.id === updatedProduct.id && 
                    item.countedDepartments[0] === item.countedDepartments[0]
                      ? {
                          ...updatedProduct,
                          countDate: new Date().toISOString()
                        }
                      : item
                  ),
                  departments: Array.from(new Set([
                    ...list.departments,
                    ...(updatedProduct.countedDepartments || [])
                  ]))
                }
              : list
          )
        }));
      },

      getCounts: () => get().counts,

      getList: (id) => get().counts.find(c => c.id === id),

      getActiveCount: (listId) => {
        if (listId) {
          return get().counts.find(c => c.id === listId && c.status === 'in-progress');
        }
        return get().counts.find(c => c.status === 'in-progress');
      },

      completeCount: (listId, completedBy, note) => {
        set(state => ({
          counts: state.counts.map(list =>
            list.id === listId
              ? {
                  ...list,
                  status: 'completed',
                  completedBy,
                  completedDate: new Date().toISOString(),
                  note,
                }
              : list
          )
        }));
      },

      deleteList: (listId) => {
        set(state => ({
          counts: state.counts.filter(list => list.id !== listId)
        }));
      },
    }),
    {
      name: 'inventory-count-storage',
    }
  )
);