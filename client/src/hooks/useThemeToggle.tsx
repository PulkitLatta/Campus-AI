import { useState, useEffect } from 'react';

export const useThemeToggle = () => {
  const [isDark, setIsDark] = useState<boolean>(false);
  
  // Initialize on mount
  useEffect(() => {
    // Check localStorage first
    const storedTheme = localStorage.getItem('theme');
    if (storedTheme) {
      setIsDark(storedTheme === 'dark');
      document.documentElement.classList.toggle('dark', storedTheme === 'dark');
    } else {
      // Check system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setIsDark(prefersDark);
      document.documentElement.classList.toggle('dark', prefersDark);
    }
  }, []);
  
  // Toggle theme function
  const toggle = () => {
    const newIsDark = !isDark;
    setIsDark(newIsDark);
    
    // Update DOM and localStorage
    document.documentElement.classList.toggle('dark', newIsDark);
    localStorage.setItem('theme', newIsDark ? 'dark' : 'light');
  };
  
  return {
    isDark,
    toggle,
    currentTheme: isDark ? 'dark' : 'light'
  };
};
