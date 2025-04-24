import { Layout } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { formatDate, formatTime, getGreeting } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { useState, useEffect } from "react";
import { AttendanceButton } from "@/components/attendance-button";
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardPage() {
  const { user } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());

  // Update the date every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentDate(new Date());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  // Fetch today's classes
  const { data: todayClasses, isLoading: isLoadingClasses } = useQuery({
    queryKey: ["/api/classes/today"],
    queryFn: async () => {
      const res = await fetch("/api/classes/today");
      if (!res.ok) throw new Error("Failed to fetch today's classes");
      return await res.json();
    },
  });

  // Fetch attendance summary
  const { data: attendanceSummary, isLoading: isLoadingAttendance } = useQuery({
    queryKey: ["/api/attendance/summary"],
    queryFn: async () => {
      const res = await fetch("/api/attendance/summary");
      if (!res.ok) throw new Error("Failed to fetch attendance summary");
      return await res.json();
    },
  });

  const quickLinks = [
    { href: "/resources", icon: "book", iconBg: "bg-green-100 dark:bg-green-900/30", iconColor: "text-green-600 dark:text-green-300", title: "Resources", description: "Study materials" },
    { href: "/events", icon: "event", iconBg: "bg-blue-100 dark:bg-blue-900/30", iconColor: "text-blue-600 dark:text-blue-300", title: "Events", description: "Campus activities" },
    { href: "/counseling", icon: "support_agent", iconBg: "bg-yellow-100 dark:bg-yellow-900/30", iconColor: "text-yellow-600 dark:text-yellow-300", title: "Counseling", description: "Book an appointment" },
    { href: "/chat", icon: "chat", iconBg: "bg-primary bg-opacity-20 dark:bg-primary dark:bg-opacity-30", iconColor: "text-primary", title: "AI Chat", description: "Get assistance" }
  ];

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <Layout
      title="CampusAI"
      subtitle={formatDate(currentDate)}
    >
      {/* Greeting Section */}
      <motion.section
        className="mb-6"
        variants={container}
        initial="hidden"
        animate="show"
      >
        <motion.h2 variants={item} className="text-2xl font-bold text-black dark:text-white">
          {getGreeting()}, {user?.fullName?.split(' ')[0] || "pulkit"}
        </motion.h2>
      </motion.section>

      {/* Today's Classes Card */}
      <motion.section
        className="mb-6"
        variants={container}
        initial="hidden"
        animate="show"
      >
        <motion.div variants={item}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg font-semibold">Today's Classes</CardTitle>
              <Link to="/timetable" className="text-primary hover:text-primary-dark dark:hover:text-primary-light text-sm">
                View All
              </Link>
            </CardHeader>
            <CardContent>
              {isLoadingClasses ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center p-3 rounded-lg border border-gray-100 dark:border-gray-800">
                      <Skeleton className="w-12 h-12 rounded-full mr-3" />
                      <div className="flex-1">
                        <Skeleton className="h-5 w-3/4 mb-2" />
                        <Skeleton className="h-4 w-1/2" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : todayClasses && todayClasses.length > 0 ? (
                <div className="space-y-3">
                  {todayClasses.map((classItem: any) => (
                    <div
                      key={classItem.id}
                      className="flex items-center p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 border border-gray-100 dark:border-gray-800 transition-colors"
                    >
                      <div
                        className="w-12 h-12 rounded-full flex items-center justify-center mr-3"
                        style={{
                          backgroundColor: `${classItem.color}20`,
                          color: classItem.color
                        }}
                      >
                        <span className="material-icons">school</span>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium">{classItem.name}</h4>
                        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                          <span className="material-icons text-xs mr-1">schedule</span>
                          <span>{formatTime(classItem.schedule.startTime)} - {formatTime(classItem.schedule.endTime)}</span>
                          <span className="mx-2">•</span>
                          <span className="material-icons text-xs mr-1">room</span>
                          <span>{classItem.location}</span>
                        </div>
                      </div>

                      <AttendanceButton
                        classId={classItem.id}
                        scheduleId={classItem.schedule.id}
                        date={new Date().toISOString().split('T')[0]}
                        variant="compact"
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                  No classes scheduled for today
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </motion.section>

      {/* Attendance Summary Card */}
      <motion.section
        className="mb-6"
        variants={container}
        initial="hidden"
        animate="show"
      >
        <motion.div variants={item}>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Attendance Summary</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingAttendance ? (
                <div className="grid grid-cols-3 gap-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <Skeleton className="h-7 w-16 mx-auto mb-1" />
                      <Skeleton className="h-4 w-12 mx-auto" />
                    </div>
                  ))}
                </div>
              ) : attendanceSummary ? (
                <div className="grid grid-cols-3 gap-3">
                  <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg text-center transition-colors">
                    <div className="text-2xl font-bold text-primary">{attendanceSummary.overall.toFixed(0)}%</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Overall</div>
                  </div>
                  <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg text-center transition-colors">
                    <div className="text-2xl font-bold text-green-500">{attendanceSummary.present.toFixed(0)}%</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Present</div>
                  </div>
                  <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg text-center transition-colors">
                    <div className="text-2xl font-bold text-red-500">{attendanceSummary.absent.toFixed(0)}%</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Absent</div>
                  </div>
                </div>
              ) : (
                <div className="text-center text-gray-500 dark:text-gray-400">
                  No attendance data available
                </div>
              )}

              <div className="mt-4 flex justify-between items-center pt-2 border-t border-gray-100 dark:border-gray-800">
                <div className="text-xs text-gray-500 dark:text-gray-400">Last updated: {new Date().toLocaleTimeString()}</div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.section>

      {/* Quick Links */}
      <motion.section
        variants={container}
        initial="hidden"
        animate="show"
      >
        <motion.h3 variants={item} className="text-lg font-semibold mb-3 text-black dark:text-white">Quick Links</motion.h3>

        <motion.div
          className="grid grid-cols-2 gap-3"
          variants={container}
        >
          {quickLinks.map((link, index) => (
            <motion.div
              key={index}
              variants={item}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Link href={link.href}>
                <a className="bg-white dark:bg-[#1E1E1E] rounded-xl p-4 shadow-md hover:shadow-lg flex items-center transition-all">
                  <div className={`w-10 h-10 rounded-full ${link.iconBg} flex items-center justify-center ${link.iconColor} mr-3`}>
                    <span className="material-icons">{link.icon}</span>
                  </div>
                  <div>
                    <h4 className="font-medium text-black dark:text-gray-400">{link.title}</h4>
                    <p className="text-xs text-black dark:text-gray-400">{link.description}</p>
                  </div>
                </a>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </motion.section>
    </Layout>
  );
}
