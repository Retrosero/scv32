import { Outlet } from 'react-router-dom';
import { Sidebar } from './sidebar';
import { Navbar } from './navbar';
import { BottomNav } from './bottom-nav';
import { useSettings } from '../../hooks/use-settings';
import { cn } from '../../lib/utils';
import { useState } from 'react';

export function Layout() {
  const { navigationType } = useSettings();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleContentClick = () => {
    if (window.innerWidth < 1024) {
      setIsSidebarOpen(false);
    }
  };

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark">
      <Navbar className="fixed top-0 left-0 right-0 z-50" />
      <div className="flex pt-16 min-h-[calc(100vh-4rem)]">
        {navigationType === 'sidebar' && (
          <Sidebar isOpen={isSidebarOpen} onOpenChange={setIsSidebarOpen} />
        )}
        <main 
          className={cn(
            'flex-1 transition-all duration-300 overflow-hidden',
            navigationType === 'bottom' ? 'pb-20' : '',
            isSidebarOpen && 'lg:ml-64'
          )}
          onClick={handleContentClick}
        >
          <div className="container mx-auto px-2 sm:px-4">
            <Outlet />
          </div>
        </main>
      </div>
      {navigationType === 'bottom' && <BottomNav />}
    </div>
  );
}