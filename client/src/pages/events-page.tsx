import { Layout } from "@/components/layout";
import { useQuery } from "@tanstack/react-query";
import { EventCard } from "@/components/event-card";
import { motion, AnimatePresence } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { 
  Calendar, 
  MapPin, 
  Clock, 
  CalendarDays, 
  Users, 
  Share2, 
  TagIcon,
  Star,
  Calendar as CalendarIcon
} from "lucide-react";

// Sample events when no real data is available
const SAMPLE_EVENTS = [
  {
    id: 1,
    title: "Campus Technology Expo",
    description: "Explore the latest innovations in educational technology with demos, workshops, and guest speakers.",
    date: new Date(new Date().setDate(new Date().getDate() + 7)).toISOString(),
    startTime: "10:00",
    endTime: "16:00",
    location: "Main Auditorium",
    imageUrl: "",
    tags: ["Tech", "Workshop", "Networking"],
    registrationStatus: "open",
    color: "#4CAF50" // Green
  },
  {
    id: 2,
    title: "Career Fair 2025",
    description: "Meet representatives from leading companies in tech, finance, and healthcare sectors.",
    date: new Date(new Date().setDate(new Date().getDate() + 14)).toISOString(),
    startTime: "09:00",
    endTime: "17:00",
    location: "Student Center",
    imageUrl: "",
    tags: ["Career", "Professional", "Networking"],
    registrationStatus: "open",
    color: "#2196F3" // Blue
  },
  {
    id: 3,
    title: "AI and ML Workshop",
    description: "Hands-on workshop learning practical applications of artificial intelligence and machine learning.",
    date: new Date(new Date().setDate(new Date().getDate() + 3)).toISOString(),
    startTime: "13:00",
    endTime: "17:00",
    location: "CS Building, Room 105",
    imageUrl: "",
    tags: ["AI", "Workshop", "Technical"],
    registrationStatus: "open",
    color: "#9C27B0" // Purple
  }
];

// Featured event (to show when no real data is available)
const SAMPLE_FEATURED_EVENT = {
  id: 100,
  title: "Annual Campus Hackathon 2025",
  description: "Join 48 hours of coding, innovation, and fun! Work in teams to solve real-world problems and win amazing prizes.",
  date: new Date(new Date().setDate(new Date().getDate() + 21)).toISOString(),
  startTime: "09:00",
  endTime: "21:00",
  location: "Innovation Hub",
  imageUrl: "",
  tags: ["Hackathon", "Coding", "Teamwork", "Innovation"],
  registrationStatus: "open",
  featured: true,
  color: "#FF5722" // Deep Orange
};

export default function EventsPage() {
  const [showDetails, setShowDetails] = useState<number | null>(null);
  const [isRegistering, setIsRegistering] = useState(false);
  const [eventFilters, setEventFilters] = useState<string[]>([]);
  const [showSampleData, setShowSampleData] = useState(false);
  const { toast } = useToast();

  // Fetch all events
  const { data: events, isLoading: isLoadingEvents } = useQuery({
    queryKey: ["/api/events"],
    queryFn: async () => {
      const res = await fetch("/api/events");
      if (!res.ok) throw new Error("Failed to fetch events");
      return await res.json();
    },
    onSuccess: (data) => {
      if (!data || data.length === 0) {
        setShowSampleData(true);
      }
    }
  });

  // Fetch featured event
  const { data: featuredEvent, isLoading: isLoadingFeatured } = useQuery({
    queryKey: ["/api/events/featured"],
    queryFn: async () => {
      const res = await fetch("/api/events/featured");
      if (!res.ok) throw new Error("Failed to fetch featured event");
      return await res.json();
    }
  });

  // Show sample data if no events are found
  useEffect(() => {
    if (!isLoadingEvents && (!events || events.length === 0)) {
      setShowSampleData(true);
    }
  }, [events, isLoadingEvents]);

  // Format date for display
  const formatEventDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return {
      month: date.toLocaleString('default', { month: 'short' }).toUpperCase(),
      day: date.getDate().toString(),
      year: date.getFullYear().toString(),
      full: date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
    };
  };

  // Filter tags from all events
  const getAllTags = () => {
    if (events && events.length > 0) {
      const allTags = events.flatMap((event: any) => event.tags || []);
      return [...new Set(allTags)];
    } else if (showSampleData) {
      const allTags = SAMPLE_EVENTS.flatMap(event => event.tags);
      return [...new Set(allTags)];
    }
    return [];
  };

  // Toggle tag filter
  const toggleTagFilter = (tag: string) => {
    if (eventFilters.includes(tag)) {
      setEventFilters(eventFilters.filter(t => t !== tag));
    } else {
      setEventFilters([...eventFilters, tag]);
    }
  };

  // Filter events based on tags
  const getFilteredEvents = () => {
    const eventsToFilter = events && events.length > 0 ? events : showSampleData ? SAMPLE_EVENTS : [];
    
    if (eventFilters.length === 0) {
      return eventsToFilter;
    }
    
    return eventsToFilter.filter((event: any) => {
      const eventTags = event.tags || [];
      return eventFilters.some(tag => eventTags.includes(tag));
    });
  };

  // Register for an event
  const registerForEvent = (eventId: number, eventTitle: string) => {
    setIsRegistering(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsRegistering(false);
      toast({
        title: "Registration Successful!",
        description: `You've been registered for ${eventTitle}`,
      });
    }, 1000);
  };

  // Share event
  const shareEvent = (eventTitle: string) => {
    navigator.clipboard.writeText(`Check out this event: ${eventTitle}`);
    toast({
      title: "Event Shared!",
      description: "Event details copied to clipboard",
    });
  };

  // Container animation
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  // Item animation
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 260,
        damping: 20
      }
    }
  };

  const renderEventDetails = (event: any) => {
    const { full: fullDate } = formatEventDate(event.date);
    
    return (
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: 'auto' }}
        exit={{ opacity: 0, height: 0 }}
        transition={{ duration: 0.3 }}
        className="mt-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-semibold text-sm mb-2">About This Event</h4>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              {event.description || "Join us for this exciting campus event!"}
            </p>
            
            <div className="mt-4 space-y-2">
              <div className="flex items-center text-sm">
                <CalendarDays className="h-4 w-4 mr-2 text-primary" />
                <span>{fullDate}</span>
              </div>
              <div className="flex items-center text-sm">
                <Clock className="h-4 w-4 mr-2 text-primary" />
                <span>{event.startTime.slice(0, 5)} - {event.endTime?.slice(0, 5) || "TBD"}</span>
              </div>
              <div className="flex items-center text-sm">
                <MapPin className="h-4 w-4 mr-2 text-primary" />
                <span>{event.location}</span>
              </div>
              <div className="flex items-center text-sm">
                <Users className="h-4 w-4 mr-2 text-primary" />
                <span>Capacity: {event.capacity || "Unlimited"}</span>
              </div>
            </div>
          </div>
          
          <div>
            <h4 className="font-semibold text-sm mb-2">Registration</h4>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-100 dark:border-gray-700">
              <div className="mb-4">
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">
                  Status:
                </p>
                <Badge className="bg-green-500">
                  {event.registrationStatus || "Open"}
                </Badge>
              </div>
              
              <div className="flex flex-col space-y-2">
                <Button 
                  className="w-full"
                  onClick={() => registerForEvent(event.id, event.title)}
                  disabled={isRegistering}
                >
                  {isRegistering ? "Registering..." : "Register Now"}
                </Button>
                
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => shareEvent(event.title)}
                >
                  <Share2 className="h-4 w-4 mr-2" />
                  Share Event
                </Button>
              </div>
            </div>
            
            {event.tags && event.tags.length > 0 && (
              <div className="mt-4">
                <h4 className="font-semibold text-sm mb-2">Tags</h4>
                <div className="flex flex-wrap gap-1">
                  {event.tags.map((tag: string, idx: number) => (
                    <Badge 
                      key={idx} 
                      variant="outline" 
                      className="bg-primary/10 hover:bg-primary/20"
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <Layout title="Events" subtitle="Campus activities">
      {/* Event Filters */}
      <motion.section 
        className="mb-6"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold flex items-center">
            <TagIcon className="h-5 w-5 mr-2 text-primary" />
            Event Categories
          </h3>
        </div>
        
        <div className="flex flex-wrap gap-2">
          {getAllTags().map((tag: string, index) => (
            <motion.div
              key={tag}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                variant={eventFilters.includes(tag) ? "default" : "outline"}
                size="sm"
                className="rounded-full"
                onClick={() => toggleTagFilter(tag)}
              >
                {tag}
              </Button>
            </motion.div>
          ))}
          
          {eventFilters.length > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                variant="ghost"
                size="sm"
                className="rounded-full text-gray-500"
                onClick={() => setEventFilters([])}
              >
                Clear Filters
              </Button>
            </motion.div>
          )}
        </div>
      </motion.section>
      
      {/* Featured Event */}
      <motion.section 
        className="mb-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {isLoadingFeatured ? (
          <Skeleton className="h-56 w-full rounded-xl" />
        ) : (featuredEvent || (showSampleData && SAMPLE_FEATURED_EVENT)) ? (
          <motion.div
            className="relative rounded-xl overflow-hidden shadow-lg"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
            whileHover={{ scale: 1.02 }}
          >
            <div className="h-56 bg-gradient-to-r from-primary/70 via-purple-600/70 to-blue-500/70 relative">
              {(featuredEvent?.imageUrl || SAMPLE_FEATURED_EVENT.imageUrl) ? (
                <img 
                  src={featuredEvent?.imageUrl || SAMPLE_FEATURED_EVENT.imageUrl} 
                  alt={featuredEvent?.title || SAMPLE_FEATURED_EVENT.title} 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="absolute inset-0 overflow-hidden">
                  <div className="absolute top-1/4 left-1/4 w-20 h-20 bg-white/10 rounded-full transform scale-150 blur-xl"></div>
                  <div className="absolute top-1/3 right-1/4 w-32 h-32 bg-primary/20 rounded-full transform scale-100 blur-xl"></div>
                  <div className="absolute bottom-1/4 left-1/3 w-16 h-16 bg-blue-500/20 rounded-full transform scale-150 blur-xl"></div>
                </div>
              )}
              
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent flex flex-col justify-end p-6">
                <div className="flex items-center mb-3">
                  <motion.div
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2, type: "spring" }}
                  >
                    <Badge className="bg-primary text-white px-3 py-1 rounded-full flex items-center mr-2">
                      <Star className="h-3 w-3 mr-1" />
                      Featured
                    </Badge>
                  </motion.div>
                  
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <Badge className="bg-white/20 text-white px-3 py-1 rounded-full">
                      {new Date(featuredEvent?.date || SAMPLE_FEATURED_EVENT.date).toLocaleDateString()}
                    </Badge>
                  </motion.div>
                </div>
                
                <motion.h2 
                  className="text-white font-bold text-2xl mb-2"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  {featuredEvent?.title || SAMPLE_FEATURED_EVENT.title}
                </motion.h2>
                
                <motion.p 
                  className="text-white/80 text-sm mb-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  {featuredEvent?.description || SAMPLE_FEATURED_EVENT.description}
                </motion.p>
                
                <motion.div 
                  className="flex items-center gap-4 mb-3"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <div className="flex items-center text-white/90 text-sm">
                    <Clock className="h-4 w-4 mr-1" />
                    <span>{(featuredEvent?.startTime || SAMPLE_FEATURED_EVENT.startTime).slice(0, 5)}</span>
                  </div>
                  <div className="flex items-center text-white/90 text-sm">
                    <MapPin className="h-4 w-4 mr-1" />
                    <span>{featuredEvent?.location || SAMPLE_FEATURED_EVENT.location}</span>
                  </div>
                </motion.div>
                
                <motion.div
                  className="flex gap-3 mt-1"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <Button className="px-6">Register Now</Button>
                  <Button variant="outline" className="bg-transparent text-white border-white/50 hover:bg-white/10 hover:text-white">
                    Learn More
                  </Button>
                </motion.div>
              </div>
            </div>
          </motion.div>
        ) : null}
      </motion.section>
      
      {/* Events List */}
      <motion.section
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center">
            <CalendarIcon className="h-5 w-5 mr-2 text-primary" />
            Upcoming Events
          </h3>
          
          <Badge variant="outline" className="text-xs px-2">
            {getFilteredEvents().length} events
          </Badge>
        </div>
        
        {isLoadingEvents ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-32 w-full rounded-xl" />
            ))}
          </div>
        ) : getFilteredEvents().length > 0 ? (
          <div className="space-y-4">
            <AnimatePresence>
              {getFilteredEvents().map((event: any, index: number) => {
                const { month, day, year } = formatEventDate(event.date);
                const isSelected = showDetails === event.id;
                
                return (
                  <motion.div 
                    key={event.id}
                    variants={itemVariants}
                    layoutId={`event-${event.id}`}
                  >
                    <Card className="overflow-hidden border-none shadow-md hover:shadow-lg transition-all">
                      <CardContent className="p-0">
                        <div 
                          className="p-4 border-l-4 transition-all relative"
                          style={{ borderLeftColor: event.color || '#7C4DFF' }}
                        >
                          {/* Hover effect gradient overlay */}
                          <div 
                            className="absolute inset-0 bg-gradient-to-r opacity-0 hover:opacity-10 transition-opacity duration-300"
                            style={{ 
                              backgroundImage: `linear-gradient(to right, ${event.color || '#7C4DFF'}40, transparent)` 
                            }}
                          ></div>
                          
                          <div className="flex">
                            {/* Date Box */}
                            <div 
                              className="text-center mr-4 flex flex-col items-center justify-center min-w-20 h-20 rounded-lg"
                              style={{ 
                                backgroundColor: `${event.color || '#7C4DFF'}20`,
                                color: event.color || '#7C4DFF'
                              }}
                            >
                              <span className="text-xs font-semibold uppercase">{month}</span>
                              <span className="text-2xl font-bold">{day}</span>
                              <span className="text-xs">{year}</span>
                            </div>
                            
                            {/* Event Info */}
                            <div className="flex-1">
                              <div className="flex items-start justify-between">
                                <div>
                                  <h3 className="font-semibold text-lg">{event.title}</h3>
                                  <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mt-1">
                                    <Clock className="h-3 w-3 mr-1" />
                                    <span>{event.startTime.slice(0, 5)}{event.endTime ? ` - ${event.endTime.slice(0, 5)}` : ''}</span>
                                    <span className="mx-2">•</span>
                                    <MapPin className="h-3 w-3 mr-1" />
                                    <span>{event.location}</span>
                                  </div>
                                </div>
                                
                                <motion.div 
                                  whileHover={{ scale: 1.05 }} 
                                  whileTap={{ scale: 0.95 }}
                                >
                                  <Button size="sm" onClick={() => setShowDetails(isSelected ? null : event.id)}>
                                    {isSelected ? "Hide Details" : "View Details"}
                                  </Button>
                                </motion.div>
                              </div>
                              
                              {/* Event tags */}
                              <div className="flex flex-wrap gap-1 mt-2">
                                {(event.tags || []).map((tag: string, idx: number) => (
                                  <Badge 
                                    key={idx} 
                                    variant="outline" 
                                    className="text-xs"
                                  >
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          </div>
                          
                          {/* Expanded details */}
                          <AnimatePresence>
                            {isSelected && renderEventDetails(event)}
                          </AnimatePresence>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        ) : (
          <motion.div 
            className="py-10 text-center text-gray-500 dark:text-gray-400"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <span className="material-icons text-4xl mb-2">event_busy</span>
            <h3 className="font-medium text-lg">No Events Found</h3>
            {eventFilters.length > 0 ? (
              <p className="text-sm mb-4">No events match your selected filters</p>
            ) : (
              <p className="text-sm mb-4">Check back later for new events</p>
            )}
            
            {eventFilters.length > 0 && (
              <Button 
                variant="outline" 
                onClick={() => setEventFilters([])}
              >
                Clear Filters
              </Button>
            )}
          </motion.div>
        )}
      </motion.section>
    </Layout>
  );
}
