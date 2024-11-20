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
  updateProduct: (product: Product) => void;
};

export const useProducts = create<ProductsState>()(
  persist(
    (set) => ({
      products: initialProducts,
      updateProduct: (updatedProduct) => {
        set((state) => ({
          products: state.products.map((product) =>
            product.id === updatedProduct.id ? updatedProduct : product
          ),
        }));
      },
    }),
    {
      name: 'products-storage',
    }
  )
);