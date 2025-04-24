import { useThemeToggle } from "@/hooks/useThemeToggle";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const { isDark, toggle } = useThemeToggle();
  
  return (
    <Button
      variant="outline"
      size="icon"
      className="rounded-full"
      onClick={toggle}
    >
      <motion.span
        animate={{ rotate: isDark ? 0 : 180 }}
        transition={{ duration: 0.5, type: "spring" }}
        className="material-icons text-gray-600 dark:text-gray-300"
      >
        {isDark ? "light_mode" : "dark_mode"}
      </motion.span>
    </Button>
  );
}
