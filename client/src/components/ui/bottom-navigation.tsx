import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", icon: "dashboard", label: "Dashboard" },
  { href: "/timetable", icon: "calendar_today", label: "Timetable" },
  { href: "/resources", icon: "book", label: "Resources" },
  { href: "/events", icon: "event", label: "Events" },
  { href: "/chat", icon: "chat", label: "Chat" },
];

export function BottomNavigation() {
  const [location] = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 shadow-lg border-t border-gray-200 dark:border-gray-800 z-20">
      <div className="flex justify-around px-2 py-2">
        {navItems.map((item) => {
          const isActive = item.href === location || 
                          (item.href === "/" && location === "") ||
                          (item.href !== "/" && location.startsWith(item.href));
          
          return (
            <Link 
              key={item.href} 
              href={item.href} 
              className={cn(
                "flex flex-col items-center p-2 relative transition-colors",
                isActive ? "text-primary" : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300"
              )}
            >
              <span className="material-icons">{item.icon}</span>
              <span className="text-xs mt-1">{item.label}</span>
              
              {isActive && (
                <motion.span
                  layoutId="bottomNavIndicator"
                  className="absolute bottom-0 w-1.5 h-1.5 rounded-full bg-primary"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.2 }}
                />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
