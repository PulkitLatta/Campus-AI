import { motion } from "framer-motion";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface EventCardProps {
  id: number;
  date: string;
  month: string;
  day: string;
  year: string;
  title: string;
  tags: string[];
  startTime: string;
  endTime?: string;
  location: string;
  backgroundColor?: string;
}

export function EventCard({
  id,
  date,
  month,
  day,
  year,
  title,
  tags,
  startTime,
  endTime,
  location,
  backgroundColor = "bg-primary-light"
}: EventCardProps) {
  const [isRegistered, setIsRegistered] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const registerMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", `/api/events/${id}/register`);
      return await res.json();
    },
    onSuccess: () => {
      setIsRegistered(true);
      toast({
        title: "Registration successful",
        description: "You have successfully registered for this event",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
    },
    onError: (error) => {
      toast({
        title: "Registration failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleRegister = () => {
    if (isRegistered) return;
    registerMutation.mutate();
  };

  const tagColors: Record<string, string> = {
    career: "bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300",
    networking: "bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300",
    art: "bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300",
    workshop: "bg-pink-100 dark:bg-pink-900/40 text-pink-700 dark:text-pink-300",
    environment: "bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300",
    campus: "bg-teal-100 dark:bg-teal-900/40 text-teal-700 dark:text-teal-300",
    default: "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
  };

  return (
    <motion.div 
      className="bg-white dark:bg-[#1E1E1E] rounded-xl shadow-md overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -4 }}
    >
      <div className="flex">
        <div className={`w-24 ${backgroundColor} flex-shrink-0 flex flex-col items-center justify-center text-white p-2`}>
          <span className="text-xs font-medium">{month}</span>
          <span className="text-2xl font-bold">{day}</span>
          <span className="text-xs">{year}</span>
        </div>
        
        <div className="p-4 flex-1">
          <h4 className="font-semibold">{title}</h4>
          
          <div className="flex flex-wrap gap-1 mt-1 mb-2">
            {tags.map((tag, index) => (
              <span 
                key={index} 
                className={`px-2 py-0.5 rounded-full text-xs ${tagColors[tag.toLowerCase()] || tagColors.default}`}
              >
                {tag}
              </span>
            ))}
          </div>
          
          <div className="flex flex-wrap gap-3 text-xs text-gray-500 dark:text-gray-400">
            <div className="flex items-center">
              <span className="material-icons text-xs mr-1">schedule</span>
              <span>{startTime}{endTime ? ` - ${endTime}` : ""}</span>
            </div>
            
            <div className="flex items-center">
              <span className="material-icons text-xs mr-1">room</span>
              <span>{location}</span>
            </div>
          </div>
          
          <Button
            className="mt-3 px-4 py-1 rounded-full text-sm font-medium shadow-sm"
            onClick={handleRegister}
            disabled={isRegistered || registerMutation.isPending}
            variant={isRegistered ? "outline" : "default"}
          >
            {registerMutation.isPending ? "Registering..." : isRegistered ? "Registered" : "Register"}
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
