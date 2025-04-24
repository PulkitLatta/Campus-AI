import { Layout } from "@/components/layout";
import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { formatTime } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { AttendanceButton } from "@/components/attendance-button";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Clock,
  Sparkles,
  Brain,
  Users,
  BookOpen,
  Bell,
  Calendar,
  AlarmClock,
  Target
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const DAYS = [
  { name: "Mon", fullName: "Monday", value: 1 },
  { name: "Tue", fullName: "Tuesday", value: 2 },
  { name: "Wed", fullName: "Wednesday", value: 3 },
  { name: "Thu", fullName: "Thursday", value: 4 },
  { name: "Fri", fullName: "Friday", value: 5 },
  { name: "Sat", fullName: "Saturday", value: 6 },
  { name: "Sun", fullName: "Sunday", value: 0 },
];

type TimerStatus = "idle" | "started" | "waiting" | "stopped";

interface StudySlot {
  time: string;
  activity: string;
  intensity: string;
  color: string;
  status: TimerStatus;
  elapsedTime: number;
  startTimestamp?: number;
}

export default function TimetablePage() {
  const today = new Date();
  const currentDay = today.getDay();
  const [selectedDay, setSelectedDay] = useState(currentDay === 0 ? 1 : currentDay);
  const [showStudyPlanner, setShowStudyPlanner] = useState(false);
  const [showStudyGroups, setShowStudyGroups] = useState(false);
  const [joinedGroups, setJoinedGroups] = useState<number[]>([]);
  const [studyPlanSlots, setStudyPlanSlots] = useState<StudySlot[]>([]);
  const { toast } = useToast();

  const dates = DAYS.map(day => {
    const date = new Date(today);
    const diff = day.value - today.getDay();
    date.setDate(today.getDate() + diff);
    return date.getDate();
  });

  const { data: dayClasses, isLoading } = useQuery({
    queryKey: ["/api/classes/day", selectedDay],
    queryFn: async () => {
      const res = await fetch(`/api/classes/day?day=${selectedDay}`);
      if (!res.ok) throw new Error("Failed to fetch classes");
      return await res.json();
    },
  });

  const handleStart = (index: number) => {
    setStudyPlanSlots(prev => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        status: "started",
        startTimestamp: Date.now(),
        elapsedTime: updated[index].elapsedTime || 0
      };
      toast({
        title: "Study Session Started",
        description: `Started study plan "${updated[index].activity}"`,
        variant: "default",
      });
      return updated;
    });
  };

  const handleWait = (index: number) => {
    setStudyPlanSlots(prev => {
      const updated = [...prev];
      if (updated[index].startTimestamp) {
        updated[index] = {
          ...updated[index],
          status: "waiting",
          startTimestamp: Date.now()
        };
      }
      return updated;
    });
  };

  const handleResume = (index: number) => {
    setStudyPlanSlots(prev => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        status: "started",
        startTimestamp: Date.now()
      };
      return updated;
    });
  };

  const handleStop = (index: number) => {
    setStudyPlanSlots(prev => {
      const updated = [...prev];
    
      updated[index] = {
        ...updated[index],
        status: "stopped",
      };

      toast({
        title: "Study Session Completed",
        description: `You studied "${updated[index].activity}" for 0min.`,
        variant: "default",
      });

      setTimeout(() => {
        setStudyPlanSlots(prev => {
          const reset = [...prev];
          reset[index] = {
            ...reset[index],
            status: "idle",
            elapsedTime: 0,
            startTimestamp: undefined
          };
          return reset;
        });
      }, 2000);

      return updated;
    });
  };

  const handleDaySelect = (day: number) => {
    setSelectedDay(day);
  };

  const generateStudyPlan = () => {
    setShowStudyPlanner(true);
    toast({
      title: "AI Study Plan Generated for pulkit",
      description: "Your personalized study schedule has been created based on your class timetable.",
      variant: "default",
    });
  };

  const findStudyGroups = () => {
    setShowStudyGroups(true);
    toast({
      title: "Study Groups Found",
      description: "We've found 3 study groups that match your courses and schedule.",
      variant: "default",
    });
  };

  const emergencyNotification = () => {
    toast({
      title: "Emergency Notification Sent",
      description: "Campus security has been notified. Help is on the way.",
      variant: "destructive",
    });
  };

  const studyPlan = [
    { time: "7:00 AM - 8:30 AM", activity: "Review Calculus (Chapter 7)", intensity: "High", color: "#FF5252" },
    { time: "10:00 AM - 11:00 AM", activity: "Database Systems Practice", intensity: "Medium", color: "#4CAF50" },
    { time: "2:00 PM - 3:30 PM", activity: "AI Algorithms (Focus: Neural Networks)", intensity: "High", color: "#FF5252" },
    { time: "6:00 PM - 7:00 PM", activity: "Language Studies Vocabulary", intensity: "Low", color: "#FFC107" },
  ];

  useEffect(() => {
    setStudyPlanSlots(
      studyPlan.map(slot => ({
        ...slot,
        status: "idle" as TimerStatus,
        elapsedTime: 0
      }))
    );
  }, []);

  const studyGroups = [
    {
      name: "Advanced Programming",
      members: 5,
      meetingTime: "Tuesdays, 5-7 PM",
      focus: "Object-Oriented Design",
      color: "#673AB7",
      matchScore: 97
    },
    {
      name: "Data Science Circle",
      members: 7,
      meetingTime: "Wednesdays, 4-6 PM",
      focus: "Machine Learning Algorithms",
      color: "#2196F3",
      matchScore: 92
    },
    {
      name: "Math Support Group",
      members: 4,
      meetingTime: "Thursdays, 6-8 PM",
      focus: "Calculus & Linear Algebra",
      color: "#E91E63",
      matchScore: 89
    },
  ];

  return (
    <Layout title="Timetable" subtitle="Your class schedule">
  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 bg-[#F5FEFD] dark:bg-[#111111]">        <div className="md:col-span-3">
          <motion.section
            className="mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex flex-nowrap overflow-x-auto pb-2 -mx-1 hide-scrollbar">
              {DAYS.map((day, index) => (
                <motion.div
                  key={day.value}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    variant={selectedDay === day.value ? "default" : "outline"}
                    className={cn(
                      "flex-shrink-0 mx-1 px-4 py-2 rounded-full shadow-sm text-sm transition-all",
                      selectedDay === day.value && "bg-primary hover:bg-primary scale-110"
                    )}
                    onClick={() => handleDaySelect(day.value)}
                  >
                    <div className="text-center">
                      <div className="text-xs uppercase text-gray-500 dark:text-gray-400">
                        {day.name}
                      </div>
                      <div className="font-semibold">{dates[index]}</div>
                    </div>
                  </Button>
                </motion.div>
              ))}
            </div>
          </motion.section>

          <motion.section
            className="relative pb-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="absolute left-[39px] top-0 bottom-0 w-[2px] bg-primary/20"></div>

            {isLoading ? (
              <div className="space-y-6">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="relative pl-16">
                    <Skeleton className="absolute left-0 top-0 w-10 h-6" />
                    <Skeleton className="absolute left-10 top-2 w-6 h-6 rounded-full" />
                    <Skeleton className="h-40 w-full rounded-xl" />
                  </div>
                ))}
              </div>
            ) : dayClasses && dayClasses.length > 0 ? (
              <div className="space-y-6">
                {dayClasses.map((classItem: any, index: number) => (
                  <motion.div
                    key={classItem.id}
                    className="relative pl-16"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{
                      delay: index * 0.1,
                      type: "spring",
                      stiffness: 260,
                      damping: 20
                    }}
                  >
                    <div className="absolute left-0 top-0 w-10 text-right text-xs text-gray-500 dark:text-gray-400 pr-3 pt-1">
                      {formatTime(classItem.schedule.startTime).split(' ')[0]}
                    </div>

                    <motion.div
                      className="absolute left-10 top-2 w-6 h-6 rounded-full border-4 border-white dark:border-[#111111] z-10"
                      style={{ backgroundColor: classItem.color || '#7C4DFF' }}
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: index * 0.1 + 0.2 }}
                    ></motion.div>

                    <motion.div
                      className="bg-white dark:bg-[#1E1E1E] rounded-xl shadow-md p-4 border-l-4 transition-all"
                      style={{ borderLeftColor: classItem.color || '#7C4DFF' }}
                      whileHover={{
                        scale: 1.02,
                        boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold">{classItem.name}</h3>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {formatTime(classItem.schedule.startTime)} - {formatTime(classItem.schedule.endTime)}
                        </span>
                      </div>

                      <div className="mt-2 flex items-center text-sm text-gray-600 dark:text-gray-400">
                        <span className="material-icons text-xs mr-1">room</span>
                        <span>{classItem.location}</span>
                        <span className="mx-2">•</span>
                        <span className="material-icons text-xs mr-1">person</span>
                        <span>{classItem.professor || "Prof. Johnson"}</span>
                      </div>

                      <div className="mt-3 flex justify-between items-center">
                        <AttendanceButton
                          classId={classItem.id}
                          scheduleId={classItem.schedule.id}
                          date={new Date().toISOString().split('T')[0]}
                        />

                        <motion.div
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <Button
                            variant="outline"
                            size="sm"
                            className="ml-2"
                            onClick={() => {
                              navigator.clipboard.writeText(
                                `Class: ${classItem.name}\nTime: ${formatTime(classItem.schedule.startTime)} - ${formatTime(classItem.schedule.endTime)}\nLocation: ${classItem.location}`
                              );
                              toast({
                                title: "Class details copied",
                                description: "The class details have been copied to your clipboard.",
                              });
                            }}
                          >
                            <span className="material-icons text-xs mr-1">content_copy</span>
                            Copy
                          </Button>
                        </motion.div>
                      </div>
                    </motion.div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <motion.div
                className="py-10 text-center text-gray-500 dark:text-gray-400"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <span className="material-icons text-4xl mb-2">event_busy</span>
                <h3 className="font-medium text-lg">No Classes Scheduled</h3>
                <p className="text-sm">There are no classes scheduled for this day.</p>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <Button
                    variant="outline"
                    className="mt-6"
                    onClick={generateStudyPlan}
                  >
                    <Brain className="mr-2 h-4 w-4" />
                    Generate AI Study Plan
                  </Button>
                </motion.div>
              </motion.div>
            )}
          </motion.section>
        </div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3, type: "spring", stiffness: 100 }}
          className="flex flex-col gap-4"
        >
          <Card className="h-auto">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center">
                <Sparkles className="mr-2 h-5 w-5 text-primary" />
                Smart Tools
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    className="w-full justify-start"
                    variant="outline"
                    onClick={generateStudyPlan}
                  >
                    <Brain className="mr-2 h-4 w-4" />
                    AI Study Planner
                  </Button>
                </motion.div>

                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    className="w-full justify-start"
                    variant="outline"
                    onClick={findStudyGroups}
                  >
                    <Users className="mr-2 h-4 w-4" />
                    Find Study Groups
                  </Button>
                </motion.div>

                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    className="w-full justify-start"
                    variant="destructive"
                    onClick={emergencyNotification}
                  >
                    <Bell className="mr-2 h-4 w-4" />
                    Emergency Alert
                  </Button>
                </motion.div>
              </div>
            </CardContent>
          </Card>

          <Card className="h-auto">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center">
                <Calendar className="mr-2 h-5 w-5 text-primary" />
                Today's Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <BookOpen className="h-4 w-4 mr-2 text-primary" />
                  <span className="text-sm">Classes</span>
                </div>
                <Badge variant="outline">{dayClasses?.length || 0} classes</Badge>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <AlarmClock className="h-4 w-4 mr-2 text-primary" />
                  <span className="text-sm">Study Time</span>
                </div>
                <Badge variant="outline">4 hours</Badge>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Target className="h-4 w-4 mr-2 text-primary" />
                  <span className="text-sm">Focus Score</span>
                </div>
                <Badge variant="outline">85%</Badge>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <AnimatePresence>
        {showStudyPlanner && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ type: "spring", stiffness: 300, damping: 24 }}
          >
            <Card className="mb-6 overflow-hidden border-primary/20">
              <CardHeader className="pb-2 bg-primary/5">
                <CardTitle className="text-lg flex items-center">
                  <Brain className="mr-2 h-5 w-5 text-primary" />
                  AI-Generated Study Planner
                  <Badge className="ml-2" variant="outline">Personalized</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="space-y-3">
                  {studyPlanSlots.map((slot, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center p-3 rounded-lg border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow transition-all"
                      whileHover={{ scale: 1.01, borderColor: slot.color + "40" }}
                    >
                      <div
                        className="w-12 h-12 rounded-full flex items-center justify-center mr-3 text-white"
                        style={{ backgroundColor: slot.color }}
                      >
                        <Clock className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mt-1">
                          <span>{slot.time}</span>
                          <span className="mx-2">•</span>
                          <Badge variant={
                            slot.intensity === "High" ? "destructive" :
                              slot.intensity === "Medium" ? "default" :
                                "outline"
                          }>
                            {slot.intensity} Intensity
                          </Badge>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {slot.status === "started" ? (
                          <>
                            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                              <Button
                                size="sm"
                                variant="outline"
                                className="hover:bg-red-500 hover:text-white"
                                onClick={() => handleStop(index)}
                              >
                                Stop
                              </Button>
                            </motion.div>
                            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                              <Button
                                size="sm"
                                variant="outline"
                                className="hover:bg-yellow-400 hover:text-black"
                                onClick={() => handleWait(index)}
                              >
                                Wait
                              </Button>
                            </motion.div>
                          </>
                        ) : slot.status === "waiting" ? (
                          <>
                            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                              <Button
                                size="sm"
                                variant="outline"
                                className="hover:bg-red-500 hover:text-white"
                                onClick={() => handleStop(index)}
                              >
                                Stop
                              </Button>
                            </motion.div>
                            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                              <Button
                                size="sm"
                                variant="outline"
                                className="hover:bg-green-500 hover:text-white"
                                onClick={() => handleResume(index)}
                              >
                                Resume
                              </Button>
                            </motion.div>
                          </>
                        ) : (
                          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                            <Button
                              size="sm"
                              variant="outline"
                              className="hover:bg-green-500 hover:text-white"
                              onClick={() => handleStart(index)}
                              disabled={slot.status === "stopped"}
                            >
                              {slot.status === "stopped" ? "Resetting..." : "Start"}
                            </Button>
                          </motion.div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-4 text-center">
                  <span className="flex items-center justify-center">
                    <Sparkles className="h-3 w-3 mr-1 text-primary" />
                    This plan is optimized based on your learning patterns
                  </span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showStudyGroups && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ type: "spring", stiffness: 300, damping: 24 }}
          >
            <Card className="mb-6 overflow-hidden border-primary/20">
              <CardHeader className="pb-2 bg-primary/5">
                <CardTitle className="text-lg flex items-center">
                  <Users className="mr-2 h-5 w-5 text-primary" />
                  Matched Study Groups
                  <Badge className="ml-2" variant="outline">AI-Powered Matching</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="space-y-3">
                  {studyGroups.map((group, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center p-3 rounded-lg border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow transition-all"
                      whileHover={{ scale: 1.01, borderColor: group.color + "40" }}
                    >
                      <div
                        className="w-12 h-12 rounded-full flex items-center justify-center mr-3 text-white"
                        style={{ backgroundColor: group.color }}
                      >
                        <Users className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center">
                          <h4 className="font-medium">{group.name}</h4>
                          <Badge
                            className="ml-2"
                            variant={group.matchScore > 95 ? "default" : "outline"}
                          >
                            {group.matchScore}% Match
                          </Badge>
                        </div>
                        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                          <span>{group.members} members</span>
                          <span className="mx-2">•</span>
                          <span>{group.meetingTime}</span>
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          Focus: {group.focus}
                        </div>
                      </div>
                      <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                        <Button
                          size="sm"
                          variant={joinedGroups.includes(index) ? "outline" : "default"}
                          onClick={() => {
                            setJoinedGroups((prev) => {
                              const isAlreadyJoined = prev.includes(index);
                              const newGroups = isAlreadyJoined
                                ? prev.filter((i) => i !== index)
                                : [...prev, index];

                              if (!isAlreadyJoined) {
                                toast({
                                  title: "Group Joined",
                                  description: `You've successfully joined the ${group.name} group.`,
                                  variant: "default",
                                });
                              }

                              return newGroups;
                            });
                          }}
                        >
                          {joinedGroups.includes(index) ? "Joined" : "Join"}
                        </Button>
                      </motion.div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </Layout>
  );
}