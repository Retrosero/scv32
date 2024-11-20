import { useState } from 'react';
import { Search, Barcode, LayoutGrid, List, Table, Edit, Save, X } from 'lucide-react';
import { cn } from '../lib/utils';
import { products } from '../data/products';
import { formatCurrency } from '../lib/utils';
import { useNavigate } from 'react-router-dom';
import { useApprovals } from '../hooks/use-approvals';
import { useAuth } from '../hooks/use-auth';
import { Product } from '../hooks/use-products';

type ViewMode = 'grid' | 'list' | 'table';
type TabType = 'details' | 'prices' | 'reports';

interface ProductCardState {
  [key: string]: {
    activeTab: TabType;
    editMode: boolean;
  };
}

export function ProductsPage() {
  const navigate = useNavigate();
  const { addApproval } = useApprovals();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [itemsPerPage, setItemsPerPage] = useState(25);
  const [productStates, setProductStates] = useState<ProductCardState>({});

  const getProductState = (productId: string) => {
    if (!productStates[productId]) {
      setProductStates(prev => ({
        ...prev,
        [productId]: { activeTab: 'details', editMode: false }
      }));
      return { activeTab: 'details' as TabType, editMode: false };
    }
    return productStates[productId];
  };

  const setProductTab = (productId: string, tab: TabType) => {
    setProductStates(prev => ({
      ...prev,
      [productId]: { ...getProductState(productId), activeTab: tab }
    }));
  };

  const setProductEditMode = (productId: string, editMode: boolean) => {
    setProductStates(prev => ({
      ...prev,
      [productId]: { ...getProductState(productId), editMode }
    }));
  };

  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleEdit = (product: Product) => {
    setProductEditMode(product.id, true);
  };

  const handleSaveEdit = (updatedProduct: Product) => {
    addApproval({
      type: 'product',
      user: user?.name || 'Unknown User',
      oldData: products.find(p => p.id === updatedProduct.id),
      newData: updatedProduct
    });

    setProductEditMode(updatedProduct.id, false);
    navigate('/approvals');
  };

  const renderProductCard = (product: Product) => {
    const { activeTab, editMode } = getProductState(product.id);

    if (editMode) {
      return (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex justify-between items-start mb-4">
            <h3 className="font-medium">Ürün Düzenle</h3>
            <button
              onClick={() => setProductEditMode(product.id, false)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <form onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            const updatedProduct = {
              ...product,
              name: formData.get('name') as string,
              description: formData.get('description') as string,
              price: Number(formData.get('price')),
              stock: Number(formData.get('stock')),
              brand: formData.get('brand') as string,
              category: formData.get('category') as string,
              barcode: formData.get('barcode') as string,
              shelf: formData.get('shelf') as string,
              packaging: formData.get('packaging') as string,
            };
            handleSaveEdit(updatedProduct);
          }}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Ürün Adı</label>
                <input
                  name="name"
                  defaultValue={product.name}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Açıklama</label>
                <textarea
                  name="description"
                  defaultValue={product.description}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Fiyat</label>
                  <input
                    type="number"
                    name="price"
                    defaultValue={product.price}
                    step="0.01"
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Stok</label>
                  <input
                    type="number"
                    name="stock"
                    defaultValue={product.stock}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Marka</label>
                  <input
                    name="brand"
                    defaultValue={product.brand}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Kategori</label>
                  <input
                    name="category"
                    defaultValue={product.category}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700"
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Barkod</label>
                  <input
                    name="barcode"
                    defaultValue={product.barcode}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Raf</label>
                  <input
                    name="shelf"
                    defaultValue={product.shelf}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Ambalaj</label>
                  <input
                    name="packaging"
                    defaultValue={product.packaging}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700"
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                >
                  <Save className="w-4 h-4 inline-block mr-2" />
                  Kaydet
                </button>
              </div>
            </div>
          </form>
        </div>
      );
    }

    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <div className="flex border-b border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setProductTab(product.id, 'details')}
              className={cn(
                'flex-1 px-4 py-2 text-sm font-medium whitespace-nowrap',
                activeTab === 'details'
                  ? 'bg-gray-50 dark:bg-gray-700 border-b-2 border-primary-600'
                  : 'hover:bg-gray-50 dark:hover:bg-gray-700'
              )}
            >
              Detaylar
            </button>
            <button
              onClick={() => setProductTab(product.id, 'prices')}
              className={cn(
                'flex-1 px-4 py-2 text-sm font-medium whitespace-nowrap',
                activeTab === 'prices'
                  ? 'bg-gray-50 dark:bg-gray-700 border-b-2 border-primary-600'
                  : 'hover:bg-gray-50 dark:hover:bg-gray-700'
              )}
            >
              Fiyatlar
            </button>
            <button
              onClick={() => setProductTab(product.id, 'reports')}
              className={cn(
                'flex-1 px-4 py-2 text-sm font-medium whitespace-nowrap',
                activeTab === 'reports'
                  ? 'bg-gray-50 dark:bg-gray-700 border-b-2 border-primary-600'
                  : 'hover:bg-gray-50 dark:hover:bg-gray-700'
              )}
            >
              Raporlar
            </button>
          </div>
        </div>

        {viewMode !== 'table' && (
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-48 object-cover"
          />
        )}
        
        <div className="p-4">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="font-medium">{product.name}</h3>
              <p className="text-sm text-gray-500">Kod: {product.id}</p>
            </div>
            <button
              onClick={() => handleEdit(product)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
            >
              <Edit className="w-4 h-4" />
            </button>
          </div>

          {activeTab === 'details' && (
            <div className="grid grid-cols-[120px,1fr] gap-y-2 text-sm">
              <div className="text-gray-500">Ürün Adı:</div>
              <div>{product.name}</div>
              
              <div className="text-gray-500">Ürün Kodu:</div>
              <div>{product.id}</div>
              
              <div className="text-gray-500">Açıklama:</div>
              <div>{product.description}</div>
              
              <div className="text-gray-500">Marka:</div>
              <div>{product.brand || '-'}</div>
              
              <div className="text-gray-500">Kategori:</div>
              <div>{product.category || '-'}</div>
              
              <div className="text-gray-500">Barkod:</div>
              <div>{product.barcode || '-'}</div>
              
              <div className="text-gray-500">Raf:</div>
              <div>{product.shelf || '-'}</div>
              
              <div className="text-gray-500">Ambalaj:</div>
              <div>{product.packaging || '-'}</div>
            </div>
          )}

          {activeTab === 'prices' && (
            <div className="space-y-2 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Satış Fiyatı</span>
                <span className="font-medium">{formatCurrency(product.price)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Stok</span>
                <span className="font-medium">{product.stock} adet</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Stok Değeri</span>
                <span className="font-medium">{formatCurrency(product.price * product.stock)}</span>
              </div>
            </div>
          )}

          {activeTab === 'reports' && (
            <div className="space-y-2 text-sm">
              <p className="text-gray-500">Son 30 günlük satış: 150 adet</p>
              <p className="text-gray-500">Ortalama günlük satış: 5 adet</p>
              <p className="text-gray-500">Minimum stok seviyesi: 50 adet</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="p-6">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 mb-6">
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
        <button
          className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700"
          title="Barkod Okuyucu"
        >
          <Barcode className="w-5 h-5" />
        </button>
        <select
          value={itemsPerPage}
          onChange={(e) => setItemsPerPage(Number(e.target.value))}
          className="h-10 rounded-lg border border-gray-200 dark:border-gray-700"
        >
          <option value={25}>25 Ürün</option>
          <option value={50}>50 Ürün</option>
          <option value={100}>100 Ürün</option>
        </select>
        <div className="flex gap-1">
          <button
            onClick={() => setViewMode('grid')}
            className={cn(
              'p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700',
              viewMode === 'grid' && 'bg-gray-100 dark:bg-gray-700'
            )}
          >
            <LayoutGrid className="w-5 h-5" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={cn(
              'p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700',
              viewMode === 'list' && 'bg-gray-100 dark:bg-gray-700'
            )}
          >
            <List className="w-5 h-5" />
          </button>
          <button
            onClick={() => setViewMode('table')}
            className={cn(
              'p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700',
              viewMode === 'table' && 'bg-gray-100 dark:bg-gray-700'
            )}
          >
            <Table className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className={cn(
        'grid gap-6',
        viewMode === 'grid' && 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
        viewMode === 'list' && 'grid-cols-1',
        viewMode === 'table' && 'grid-cols-1'
      )}>
        {filteredProducts.map((product) => (
          <div key={product.id}>
            {renderProductCard(product)}
          </div>
        ))}
      </div>
    </div>
  );
}