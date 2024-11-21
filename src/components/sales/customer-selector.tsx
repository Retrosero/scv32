import { Search } from 'lucide-react';
import { useState } from 'react';
import { customers } from '../../data/customers';
import { useNavigate } from 'react-router-dom';
import { useTransactions } from '../../hooks/use-transactions';
import { formatCurrency } from '../../lib/utils';

interface CustomerSelectorProps {
  onSelect: (customer: typeof customers[0]) => void;
}

export function CustomerSelector({ onSelect }: CustomerSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const { getCustomerBalance } = useTransactions();

  const filteredCustomers = customers.filter(
    (customer) =>
      customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.taxNumber.includes(searchQuery)
  );

  return (
    <div 
      className="fixed inset-0 bg-black/50 flex items-center justify-center p-2 sm:p-4 z-50"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          navigate('/dashboard');
        }
      }}
    >
      <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-2xl p-3 sm:p-6">
        <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-6 text-gray-900 dark:text-gray-100">Müşteri Seçimi</h2>

        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Müşteri ara (isim veya vergi no)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 h-10 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            autoFocus
          />
        </div>

        <div className="max-h-[60vh] overflow-auto mt-3">
          {filteredCustomers.map((customer) => {
            const balance = getCustomerBalance(customer.id);
            
            return (
              <button
                key={customer.id}
                onClick={() => onSelect(customer)}
                className="w-full text-left p-2 rounded-lg mb-1 sm:mb-2 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                <div className="font-medium text-gray-900 dark:text-gray-100">{customer.name}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  VN: {customer.taxNumber} - Bakiye: {formatCurrency(balance)}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">{customer.address}</div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}