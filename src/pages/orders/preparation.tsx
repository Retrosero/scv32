import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useOrders } from '../../hooks/use-orders';
import { useAuth } from '../../hooks/use-auth';
import { Plus, Minus, Check } from 'lucide-react';
import { cn } from '../../lib/utils';

function QuantityInput({ value, onChange }: { value: number; onChange: (value: number) => void }) {
  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => onChange(Math.max(0, value - 1))}
        className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
      >
        <Minus className="w-5 h-5" />
      </button>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(Math.max(0, parseInt(e.target.value) || 0))}
        className="w-16 px-2 py-1 text-center rounded-lg border border-gray-200 dark:border-gray-700"
        min="0"
      />
      <button
        onClick={() => onChange(value + 1)}
        className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
      >
        <Plus className="w-5 h-5" />
      </button>
    </div>
  );
}

export function OrderPreparationPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { getOrderById, updateOrder, updateOrderItem } = useOrders();

  const order = getOrderById(id!);
  if (!order) return null;

  const canEditQuantity = order.status === 'preparing' || order.status === 'checking' || order.status === 'loading';

  const getItemStatus = (item: any) => {
    const collectedQty = item.collectedQuantity || 0;
    if (collectedQty === item.quantity) return 'complete';
    if (collectedQty > item.quantity) return 'excess';
    if (collectedQty < item.quantity) return 'insufficient';
    return 'pending';
  };

  const handleComplete = () => {
    if (!order) return;

    const nextStatus = 
      order.status === 'preparing' ? 'checking' :
      order.status === 'checking' ? 'loading' :
      order.status === 'loading' ? 'ready' :
      order.status === 'ready' ? 'delivered' :
      order.status;

    const updates: any = {
      status: nextStatus,
    };

    if (order.status === 'preparing') {
      updates.preparedBy = user?.name;
      updates.preparationEndDate = new Date().toISOString();
    } else if (order.status === 'checking') {
      updates.checkedBy = user?.name;
      updates.checkEndDate = new Date().toISOString();
    } else if (order.status === 'loading') {
      updates.loadedBy = user?.name;
      updates.loadingEndDate = new Date().toISOString();
    } else if (order.status === 'ready') {
      updates.deliveredBy = user?.name;
      updates.deliveryDate = new Date().toISOString();
    }

    updateOrder(order.id, updates);
    navigate('/orders?status=' + nextStatus);
  };

  return (
    <div className="p-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 mb-6">
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold">Sipariş #{order.id}</h2>
              <span className={cn(
                'px-2 py-0.5 text-xs rounded-full',
                order.status === 'preparing' ? 'bg-yellow-100 text-yellow-800' :
                order.status === 'checking' ? 'bg-blue-100 text-blue-800' :
                order.status === 'loading' ? 'bg-purple-100 text-purple-800' :
                order.status === 'ready' ? 'bg-orange-100 text-orange-800' :
                'bg-green-100 text-green-800'
              )}>
                {order.status === 'preparing' ? 'Hazırlanıyor' :
                 order.status === 'checking' ? 'Kontrol Ediliyor' :
                 order.status === 'loading' ? 'Yükleniyor' :
                 order.status === 'ready' ? 'Teslime Hazır' :
                 'Teslim Edildi'}
              </span>
            </div>
            <p className="text-sm text-gray-500">
              {new Date(order.date).toLocaleString('tr-TR')}
            </p>
          </div>
          {canEditQuantity && (
            <button
              onClick={handleComplete}
              className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
            >
              <Check className="w-5 h-5" />
              <span>Tamamla</span>
            </button>
          )}
        </div>

        <div className="mt-4">
          <h3 className="font-medium mb-2">Müşteri Bilgileri</h3>
          <p className="font-medium">{order.customer.name}</p>
          <p className="text-sm text-gray-500">{order.customer.address}</p>
          <p className="text-sm text-gray-500">Tel: {order.customer.phone}</p>
        </div>
      </div>

      <div className="space-y-4">
        {order.items.map((item) => {
          const status = getItemStatus(item);
          return (
            <div
              key={item.productId}
              className={cn(
                "bg-white dark:bg-gray-800 rounded-lg border p-4",
                status === 'complete' ? "border-green-500" :
                status === 'excess' ? "border-yellow-500" :
                status === 'insufficient' ? "border-red-500" :
                "border-gray-200 dark:border-gray-700"
              )}
            >
              <div className="flex items-center gap-4">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-16 h-16 object-cover rounded-lg"
                />
                <div className="flex-1">
                  <h3 className="font-medium">{item.name}</h3>
                  <p className="text-sm text-gray-500">İstenen: {item.quantity}</p>
                  {item.collectedQuantity !== undefined && (
                    <p className={cn(
                      "text-sm",
                      status === 'complete' ? "text-green-600" :
                      status === 'excess' ? "text-yellow-600" :
                      status === 'insufficient' ? "text-red-600" :
                      "text-gray-500"
                    )}>
                      Toplanan: {item.collectedQuantity}
                    </p>
                  )}
                </div>
                {canEditQuantity && (
                  <QuantityInput
                    value={item.collectedQuantity || 0}
                    onChange={(newValue) => {
                      updateOrderItem(order.id, item.productId, {
                        collectedQuantity: newValue
                      });
                    }}
                  />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}