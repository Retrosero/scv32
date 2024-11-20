import { useAuth } from '../../hooks/use-auth';
import { LogOut } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '../../lib/utils';

interface NavbarProps {
  className?: string;
}

export function Navbar({ className }: NavbarProps) {
  const { user, logout } = useAuth();

  return (
    <header className={cn("h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700", className)}>
      <div className="h-full px-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link to="/dashboard" className="text-xl font-bold text-primary-600 dark:text-primary-400 hover:opacity-80">
            Gürbüz Oyuncak
          </Link>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-3 pl-4">
            <div className="text-sm">
              <p className="font-medium">{user?.name}</p>
              <p className="text-gray-500 dark:text-gray-400">{user?.email}</p>
            </div>

            <button
              onClick={logout}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
              title="Çıkış Yap"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}