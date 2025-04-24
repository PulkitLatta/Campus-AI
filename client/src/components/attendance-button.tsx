import { useState } from "react";
import { cn } from "@/lib/utils";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";

interface AttendanceButtonProps {
  classId: number;
  scheduleId: number;
  date: string; // ISO date string
  initialStatus?: "present" | "absent" | "unmarked";
  variant?: "compact" | "full";
}

export function AttendanceButton({
  classId,
  scheduleId,
  date,
  initialStatus = "unmarked",
  variant = "full"
}: AttendanceButtonProps) {
  const [status, setStatus] = useState<"present" | "absent" | "unmarked">(initialStatus);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const markAttendanceMutation = useMutation({
    mutationFn: async (newStatus: "present" | "absent") => {
      const res = await apiRequest("POST", "/api/attendance", {
        classId,
        scheduleId,
        date,
        status: newStatus,
      });
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Attendance recorded",
        description: `Your attendance has been marked as ${status}`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/attendance/summary"] });
      queryClient.invalidateQueries({ queryKey: ["/api/classes/today"] });
    },
    onError: (error) => {
      toast({
        title: "Failed to record attendance",
        description: error.message,
        variant: "destructive",
      });
      // Reset to original status
      setStatus(initialStatus);
    },
  });

  const handleMarkAttendance = (newStatus: "present" | "absent") => {
    if (newStatus === status) {
      // Toggle off
      setStatus("unmarked");
    } else {
      setStatus(newStatus);
      markAttendanceMutation.mutate(newStatus);
    }
  };

  if (variant === "compact") {
    return (
      <div className="flex shrink-0 ml-2">
        {status === "unmarked" ? (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={cn(
              "attendance-btn border rounded-full py-1 px-3 text-xs font-medium",
              "hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            )}
            onClick={() => setStatus("present")} // Show expanded buttons
          >
            Mark
          </motion.button>
        ) : (
          <div className="flex space-x-1">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={cn(
                "attendance-btn border rounded-full py-1 px-2 text-xs font-medium flex items-center",
                status === "present" && "bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 border-green-500"
              )}
              onClick={() => handleMarkAttendance("present")}
            >
              <span className="material-icons text-xs mr-1">check_circle</span>
              Present
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={cn(
                "attendance-btn border rounded-full py-1 px-2 text-xs font-medium flex items-center",
                status === "absent" && "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border-red-500"
              )}
              onClick={() => handleMarkAttendance("absent")}
            >
              <span className="material-icons text-xs mr-1">cancel</span>
              Absent
            </motion.button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="mt-3 flex space-x-2">
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={cn(
          "attendance-btn border rounded-full py-1 px-3 text-xs font-medium flex items-center",
          status === "present" && "bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 border-green-500"
        )}
        onClick={() => handleMarkAttendance("present")}
      >
        <span className="material-icons text-xs mr-1">check_circle</span>
        Present
      </motion.button>
      
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={cn(
          "attendance-btn border rounded-full py-1 px-3 text-xs font-medium flex items-center",
          status === "absent" && "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border-red-500"
        )}
        onClick={() => handleMarkAttendance("absent")}
      >
        <span className="material-icons text-xs mr-1">cancel</span>
        Absent
      </motion.button>
    </div>
  );
}
