import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { products as initialProducts } from '../data/products';

export type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  image: string;
  brand?: string;
  category?: string;
  barcode?: string;
  shelf?: string;
  packaging?: string;
};

type ProductsState = {
  products: Product[];
  updateProduct: (productId: string, action: 'update' | 'increaseStock' | 'decreaseStock', payload: any) => void;
  getProduct: (productId: string) => Product | undefined;
};

export const useProducts = create<ProductsState>()(
  persist(
    (set, get) => ({
      products: initialProducts,
      
      updateProduct: (productId, action, payload) => {
        console.log('Updating product:', productId, action, payload); // Debug log
        
        set((state) => ({
          products: state.products.map((product) => {
            if (product.id !== productId) return product;

            let updatedProduct;
            switch (action) {
              case 'update':
                updatedProduct = { ...product, ...payload };
                break;
              case 'increaseStock':
                updatedProduct = { ...product, stock: product.stock + payload };
                break;
              case 'decreaseStock':
                updatedProduct = { ...product, stock: Math.max(0, product.stock - payload) };
                break;
              default:
                return product;
            }
            
            console.log('Product updated:', updatedProduct); // Debug log
            return updatedProduct;
          }),
        }));
      },

      getProduct: (productId) => {
        return get().products.find(p => p.id === productId);
      },
    }),
    {
      name: 'products-storage',
    }
  )
);