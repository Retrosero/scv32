import { formatCurrency } from '../../lib/utils';

interface ApprovalDetailProps {
  approval: any;
}

export function ApprovalDetail({ approval }: ApprovalDetailProps) {
  switch (approval.type) {
    case 'sale':
      return (
        <div id="approval-detail" className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="font-medium mb-2">Müşteri Bilgileri</h3>
              <p>{approval.newData.customer.name}</p>
              <p className="text-sm text-gray-500">{approval.newData.customer.address}</p>
              <p className="text-sm text-gray-500">Tel: {approval.newData.customer.phone}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Tarih</p>
              <p>{new Date(approval.date).toLocaleDateString('tr-TR')}</p>
            </div>
          </div>

          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left">Ürün</th>
                <th className="text-right">Birim Fiyat</th>
                <th className="text-right">Miktar</th>
                <th className="text-right">Toplam</th>
              </tr>
            </thead>
            <tbody>
              {approval.newData.items.map((item: any, index: number) => (
                <tr key={index} className="border-b">
                  <td>{item.name}</td>
                  <td className="text-right">{formatCurrency(item.price)}</td>
                  <td className="text-right">{item.quantity}</td>
                  <td className="text-right">{formatCurrency(item.price * item.quantity)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              {approval.newData.discount > 0 && (
                <tr className="text-green-600">
                  <td colSpan={3} className="text-right">İskonto ({approval.newData.discount}%)</td>
                  <td className="text-right">
                    -{formatCurrency(approval.newData.total * (approval.newData.discount / 100))}
                  </td>
                </tr>
              )}
              <tr className="font-bold">
                <td colSpan={3} className="text-right">Toplam</td>
                <td className="text-right">{formatCurrency(approval.newData.total)}</td>
              </tr>
            </tfoot>
          </table>

          {approval.newData.note && (
            <div>
              <h3 className="font-medium mb-2">Not</h3>
              <p className="text-sm text-gray-500">{approval.newData.note}</p>
            </div>
          )}
        </div>
      );

    case 'order_change':
      return (
        <div id="approval-detail" className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="font-medium mb-2">Müşteri Bilgileri</h3>
              <p>{approval.customer.name}</p>
              <p className="text-sm text-gray-500">{approval.newData.customer.address}</p>
              <p className="text-sm text-gray-500">Tel: {approval.newData.customer.phone}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Tarih</p>
              <p>{new Date(approval.date).toLocaleDateString('tr-TR')}</p>
              <p className="text-sm text-gray-500 mt-2">Sipariş No</p>
              <p>{approval.newData.id}</p>
            </div>
          </div>

          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left">Ürün</th>
                <th className="text-center">İstenen</th>
                <th className="text-center">Yeni</th>
                <th className="text-right">Birim Fiyat</th>
                <th className="text-right">Yeni Toplam</th>
              </tr>
            </thead>
            <tbody>
              {approval.newData.items.map((item: any, index: number) => {
                const oldItem = approval.oldData.items.find((i: any) => i.productId === item.productId);
                return (
                  <tr key={index} className="border-b">
                    <td>{item.name}</td>
                    <td className="text-center">{oldItem?.quantity}</td>
                    <td className="text-center">{item.quantity}</td>
                    <td className="text-right">{formatCurrency(item.price)}</td>
                    <td className="text-right">{formatCurrency(item.price * item.quantity)}</td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="font-bold">
                <td colSpan={4} className="text-right">Eski Toplam</td>
                <td className="text-right">{formatCurrency(approval.oldData.totalAmount)}</td>
              </tr>
              <tr className="font-bold">
                <td colSpan={4} className="text-right">Yeni Toplam</td>
                <td className="text-right">{formatCurrency(approval.newData.totalAmount)}</td>
              </tr>
            </tfoot>
          </table>

          {approval.newData.note && (
            <div>
              <h3 className="font-medium mb-2">Not</h3>
              <p className="text-sm text-gray-500">{approval.newData.note}</p>
            </div>
          )}
        </div>
      );

    default:
      return null;
  }
}