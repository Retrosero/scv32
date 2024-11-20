import { useState, useEffect } from 'react';
import { Search, UserPlus, Filter, Plus, CreditCard, Phone, Mail, MapPin, Eye, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { customers } from '../data/customers';
import { formatCurrency } from '../lib/utils';
import { useCustomer } from '../hooks/use-customer';

export function CustomersPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [showBalances, setShowBalances] = useState(() => {
    const saved = localStorage.getItem('showCustomerBalances');
    return saved ? JSON.parse(saved) : true;
  });
  const navigate = useNavigate();
  const { setSelectedCustomer } = useCustomer();

  useEffect(() => {
    localStorage.setItem('showCustomerBalances', JSON.stringify(showBalances));
  }, [showBalances]);

  const filteredCustomers = customers.filter(
    (customer) =>
      customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.taxNumber.includes(searchQuery) ||
      customer.phone.includes(searchQuery)
  );

  const handleCustomerClick = (customer: typeof customers[0]) => {
    navigate(`/customers/${customer.id}`);
  };

  const handleSaleClick = (customer: typeof customers[0], e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedCustomer(customer);
    navigate('/sales');
  };

  const handlePaymentClick = (customer: typeof customers[0], e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedCustomer(customer);
    navigate('/payments');
  };

  return (
    <div className="p-4 bg-white dark:bg-gray-900 min-h-screen">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Müşteriler</h1>
        <button className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
          <UserPlus className="w-5 h-5" />
          <span>Yeni Müşteri</span>
        </button>
      </div>

      <div className="flex gap-2 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Müşteri ara (isim, telefon)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 h-12 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400"
          />
        </div>
        <button className="px-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
          <Filter className="w-5 h-5" />
        </button>
        <button 
          onClick={() => setShowBalances(!showBalances)}
          className={`px-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 ${
            showBalances ? 'text-primary-600' : 'text-gray-900 dark:text-white'
          }`}
        >
          <Eye className="w-5 h-5" />
        </button>
      </div>

      <div className="space-y-4">
        {filteredCustomers.map((customer) => (
          <div
            key={customer.id}
            onClick={() => handleCustomerClick(customer)}
            className="bg-white dark:bg-gray-800 rounded-lg p-4 cursor-pointer border border-gray-200 dark:border-gray-700"
          >
            <div className="flex justify-between items-start mb-2">
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">{customer.name}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">#{customer.taxNumber}</p>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                <Phone className="w-4 h-4" />
                <span className="text-sm">{customer.phone}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                <Mail className="w-4 h-4" />
                <span className="text-sm">{customer.email}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                <MapPin className="w-4 h-4" />
                <span className="text-sm">{customer.address}</span>
              </div>
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-gray-200 dark:border-gray-700">
              {showBalances && (
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Bakiye</p>
                  <p className={`text-lg font-medium ${customer.balance >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {formatCurrency(customer.balance)}
                  </p>
                </div>
              )}
              <div className="flex gap-2 ml-auto">
                <button
                  onClick={(e) => handleSaleClick(customer, e)}
                  className="flex items-center gap-1 px-3 py-1.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                >
                  <Plus className="w-4 h-4" />
                  <span>Satış</span>
                </button>
                <button 
                  onClick={(e) => handlePaymentClick(customer, e)}
                  className="flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  <CreditCard className="w-4 h-4" />
                  <span>Tahsilat</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}