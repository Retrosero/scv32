import { useState } from 'react';
import { Search, ShoppingCart } from 'lucide-react';
import { useCustomer } from '../hooks/use-customer';
import { useCart } from '../hooks/use-cart';
import { CustomerSelector } from '../components/sales/customer-selector';
import { CustomerInfo } from '../components/sales/customer-info';
import { ViewModeSelector } from '../components/sales/view-mode-selector';
import { ProductFilters } from '../components/sales/product-filters';
import { FloatingCart } from '../components/sales/floating-cart';
import { products } from '../data/products';
import { formatCurrency } from '../lib/utils';
import { QuantityInput } from '../components/sales/quantity-input';

type ViewMode = 'grid' | 'list' | 'list-no-image';
type SortOption = 'name-asc' | 'name-desc' | 'price-asc' | 'price-desc' | 'stock-asc' | 'stock-desc';

export function SalesPage() {
  const { selectedCustomer, setSelectedCustomer } = useCustomer();
  const { items: cartItems, addItem } = useCart();
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [sortOption, setSortOption] = useState<SortOption>('name-asc');
  const [itemsPerPage, setItemsPerPage] = useState(25);
  const [showCart, setShowCart] = useState(false);

  const filteredProducts = products
    .filter(product =>
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.id.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      switch (sortOption) {
        case 'name-asc':
          return a.name.localeCompare(b.name);
        case 'name-desc':
          return b.name.localeCompare(a.name);
        case 'price-asc':
          return a.price - b.price;
        case 'price-desc':
          return b.price - a.price;
        case 'stock-asc':
          return a.stock - b.stock;
        case 'stock-desc':
          return b.stock - a.stock;
        default:
          return 0;
      }
    });

  const renderProductGrid = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {filteredProducts.map((product) => {
        const cartItem = cartItems.find(item => item.productId === product.id);
        return (
          <div
            key={product.id}
            className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden"
          >
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-48 object-cover"
            />
            <div className="p-4">
              <div className="mb-2">
                <h3 className="font-medium">{product.name}</h3>
                <p className="text-sm text-gray-500">{product.description}</p>
              </div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold">{formatCurrency(product.price)}</span>
                <span className="text-sm text-gray-500">Stok: {product.stock}</span>
              </div>
              <div className="flex items-center justify-between">
                <QuantityInput
                  value={cartItem?.quantity || 0}
                  onChange={(quantity) => addItem(product.id, quantity)}
                  max={product.stock}
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );

  const renderProductList = () => (
    <div className="space-y-4">
      {filteredProducts.map((product) => {
        const cartItem = cartItems.find(item => item.productId === product.id);
        return (
          <div
            key={product.id}
            className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4"
          >
            <div className="flex gap-4">
              {viewMode === 'list' && (
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-24 h-24 object-cover rounded-lg"
                />
              )}
              <div className="flex-1">
                <div className="flex justify-between mb-2">
                  <div>
                    <h3 className="font-medium">{product.name}</h3>
                    <p className="text-sm text-gray-500">{product.description}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{formatCurrency(product.price)}</p>
                    <p className="text-sm text-gray-500">Stok: {product.stock}</p>
                  </div>
                </div>
                <div className="flex justify-end">
                  <QuantityInput
                    value={cartItem?.quantity || 0}
                    onChange={(quantity) => addItem(product.id, quantity)}
                    max={product.stock}
                  />
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );

  return (
    <div className="p-6">
      {!selectedCustomer ? (
        <CustomerSelector onSelect={setSelectedCustomer} />
      ) : (
        <>
          <div className="mb-6">
            <CustomerInfo
              customer={selectedCustomer}
              onEdit={() => setSelectedCustomer(null)}
            />
          </div>

          <div className="flex flex-wrap gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Ürün ara..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 h-10 rounded-lg border border-gray-200 dark:border-gray-700"
              />
            </div>

            <ViewModeSelector value={viewMode} onChange={setViewMode} />

            <ProductFilters
              onSortChange={setSortOption}
              onItemsPerPageChange={setItemsPerPage}
              itemsPerPage={itemsPerPage}
            />

            {cartItems.length > 0 && (
              <button
                onClick={() => setShowCart(true)}
                className="relative p-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                <ShoppingCart className="w-5 h-5" />
                <span className="absolute -top-2 -right-2 w-5 h-5 bg-primary-600 text-white text-xs rounded-full flex items-center justify-center">
                  {cartItems.length}
                </span>
              </button>
            )}
          </div>

          {viewMode === 'grid' ? renderProductGrid() : renderProductList()}

          {showCart && (
            <FloatingCart onClose={() => setShowCart(false)} />
          )}
        </>
      )}
    </div>
  );
}