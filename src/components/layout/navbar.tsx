import { Link } from 'react-router-dom';
import { cn } from '../../lib/utils';

interface NavbarProps {
  className?: string;
}

export function Navbar({ className }: NavbarProps) {
  return (
    <header className={cn("h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700", className)}>
      <div className="h-full px-4 flex items-center">
        <Link to="/dashboard" className="text-xl font-bold text-primary-600 dark:text-primary-400 hover:opacity-80">
          Gürbüz Oyuncak
        </Link>
      </div>
    </header>
  );
}