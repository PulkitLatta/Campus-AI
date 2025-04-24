import { ReactNode, useMemo } from 'react';
import { BottomNavigation } from '@/components/ui/bottom-navigation';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { useAuth } from '@/hooks/use-auth';
import { useLocation } from 'wouter';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface LayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
  showBack?: boolean;
  onBack?: () => void;
  padding?: boolean;
}

export function Layout({ 
  children, 
  title, 
  subtitle, 
  showBack = false,
  onBack,
  padding = true
}: LayoutProps) {
  const { user, logoutMutation } = useAuth();
  const [, setLocation] = useLocation();

  const userInitials = useMemo(() => {
    if (!user?.fullName) return "U";
    return user.fullName
      .split(" ")
      .map(name => name[0])
      .join("")
      .toUpperCase();
  }, [user?.fullName]);

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      // Default back behavior
      window.history.back();
    }
  };

  const handleLogout = () => {
    logoutMutation.mutate();
    setLocation("/auth");
  };
  
  return (
    <div className="min-h-screen bg-[#F5FEFD] dark:bg-[#111111] pb-16">
      {/* Header */}
      <motion.header 
        className="bg-white dark:bg-gray-900 px-4 py-3 shadow-sm z-10"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, type: 'spring' }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {showBack && (
              <motion.button 
                onClick={handleBack} 
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
                whileTap={{ scale: 0.9 }}
              >
                <span className="material-icons text-gray-600 dark:text-gray-300">arrow_back</span>
              </motion.button>
            )}

            <div className="flex items-center">
              <svg
                viewBox="0 0 24 24"
                className="h-7 w-7 mr-2 text-primary"
                fill="currentColor"
              >
                <path d="M9 3C6.23858 3 4 5.23858 4 8C4 10.7614 6.23858 13 9 13C11.7614 13 14 10.7614 14 8C14 5.23858 11.7614 3 9 3ZM6 8C6 6.34315 7.34315 5 9 5C10.6569 5 12 6.34315 12 8C12 9.65685 10.6569 11 9 11C7.34315 11 6 9.65685 6 8Z" />
                <path d="M16.9999 3C14.9999 3 14.2499 4 13.9999 5C13.9999 5 13.9999 6 14.9999 6C15.9999 6 15.9999 5 15.9999 5C15.9999 5 15.9999 5 16.9999 5C18.9999 5 18.9999 8 16.9999 8C15.9999 8 15.4999 7.5 15.4999 7.5C15.4999 7.5 14.9999 9 16.9999 9C19.9999 9 20.9999 5 18.4999 3.5C17.9999 3.3 17.4999 3 16.9999 3Z" />
                <path d="M16.9999 17C14.9999 17 14.2499 18 13.9999 19C13.9999 19 13.9999 20 14.9999 20C15.9999 20 15.9999 19 15.9999 19C15.9999 19 15.9999 19 16.9999 19C18.9999 19 18.9999 22 16.9999 22C15.9999 22 15.4999 21.5 15.4999 21.5C15.4999 21.5 14.9999 23 16.9999 23C19.9999 23 20.9999 19 18.4999 17.5C17.9999 17.3 17.4999 17 16.9999 17Z" />
                <path d="M9 15C6.23858 15 4 17.2386 4 20C4 22.7614 6.23858 25 9 25C11.7614 25 14 22.7614 14 20C14 17.2386 11.7614 15 9 15ZM6 20C6 18.3431 7.34315 17 9 17C10.6569 17 12 18.3431 12 20C12 21.6569 10.6569 23 9 23C7.34315 23 6 21.6569 6 20Z" />
              </svg>

              <div>
                <motion.h1 
                  className="font-bold text-xl text-gray-900 dark:text-white"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  {title}
                </motion.h1>
                {subtitle && (
                  <motion.p 
                    className="text-sm text-gray-500 dark:text-gray-400"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    {subtitle}
                  </motion.p>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <ThemeToggle />

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Avatar className="h-9 w-9 bg-primary cursor-pointer">
                  <AvatarFallback className="bg-primary text-white text-sm">
                    {userInitials}
                  </AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem 
                  className="cursor-pointer"
                  onClick={handleLogout}
                >
                  <span className="material-icons mr-2 text-sm">logout</span>
                  <span>Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </motion.header>
      
      {/* Main content */}
      <motion.main 
        className={cn(padding && "p-4", "pb-16")}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        {children}
      </motion.main>
      
      {/* Bottom navigation */}
      <BottomNavigation />
    </div>
  );
}
