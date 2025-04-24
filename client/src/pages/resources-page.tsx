import { Layout } from "@/components/layout";
import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { ResourceCard } from "@/components/resource-card";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Resource } from "@shared/schema";
import { 
  Search, 
  BookOpen, 
  FileText, 
  Video, 
  Link2, 
  Clock, 
  Download,
  Filter, 
  ArrowUpRight,
  BookMarked 
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

// Sample resource categories with icons when there is no data
const RESOURCE_CATEGORIES = [
  { name: "eBooks", icon: <BookOpen className="h-4 w-4" /> },
  { name: "Documents", icon: <FileText className="h-4 w-4" /> },
  { name: "Videos", icon: <Video className="h-4 w-4" /> },
  { name: "Links", icon: <Link2 className="h-4 w-4" /> },
];

// Sample featured resources when there is no data
const FEATURED_RESOURCES = [
  {
    id: 1,
    title: "Advanced Programming Concepts",
    description: "A comprehensive guide to OOP and functional programming",
    category: "eBooks",
    url: "#",
    createdAt: new Date("2022-09-12").toISOString(),
    type: "PDF",
    size: "12.5 MB"
  },
  {
    id: 2,
    title: "Database Systems Lecture Notes",
    description: "Complete notes from Prof. Smith's database course",
    category: "Documents",
    url: "#",
    createdAt: new Date("2022-08-23").toISOString(),
    type: "DOC",
    size: "8.2 MB"
  },
  {
    id: 3,
    title: "Introduction to AI and ML",
    description: "Video tutorial series from Stanford University",
    category: "Videos",
    url: "#",
    createdAt: new Date("2022-07-18").toISOString(),
    type: "MP4",
    size: "256 MB"
  }
];

export default function ResourcesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [showSampleData, setShowSampleData] = useState(false);
  const { toast } = useToast();

  // Fetch all resources
  const { data: resources, isLoading: isLoadingResources } = useQuery({
    queryKey: ["/api/resources", selectedCategory, searchQuery],
    queryFn: async () => {
      let url = "/api/resources";
      const params = new URLSearchParams();
      
      if (selectedCategory) {
        params.append("category", selectedCategory);
      }
      
      if (searchQuery) {
        params.append("search", searchQuery);
      }
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }
      
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch resources");
      return await res.json();
    },
  });

  // Fetch all categories
  const { data: categories, isLoading: isLoadingCategories } = useQuery({
    queryKey: ["/api/resources/categories"],
    queryFn: async () => {
      const res = await fetch("/api/resources/categories");
      if (!res.ok) throw new Error("Failed to fetch categories");
      return await res.json();
    },
    onSuccess: (data) => {
      // If no categories are returned, show sample data
      if (!data || data.length === 0) {
        setShowSampleData(true);
      }
    }
  });

  // Show sample data if no resources are found
  useEffect(() => {
    if (!isLoadingResources && (!resources || resources.length === 0)) {
      setShowSampleData(true);
    }
  }, [resources, isLoadingResources]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // The query will be re-fetched due to the search term being in the queryKey
    toast({
      title: "Searching resources...",
      description: searchQuery ? `Looking for "${searchQuery}"` : "Showing all resources",
    });
  };

  const handleCategoryChange = (category: string | null) => {
    setSelectedCategory(category === selectedCategory ? null : category);
  };

  const handleResourceAction = (action: string, resource: any) => {
    switch (action) {
      case 'download':
        toast({
          title: "Downloading Resource",
          description: `Starting download for ${resource.title}`,
        });
        break;
      case 'save':
        toast({
          title: "Resource Saved",
          description: `${resource.title} has been saved to your bookmarks`,
        });
        break;
      case 'share':
        navigator.clipboard.writeText(`Check out this resource: ${resource.title}`);
        toast({
          title: "Link Copied",
          description: "Resource link copied to clipboard",
        });
        break;
      default:
        break;
    }
  };

  // Group resources by category
  const resourcesByCategory: Record<string, Resource[]> = {};
  
  if (resources && resources.length > 0) {
    resources.forEach((resource: Resource) => {
      if (!resourcesByCategory[resource.category]) {
        resourcesByCategory[resource.category] = [];
      }
      resourcesByCategory[resource.category].push(resource);
    });
  } else if (showSampleData) {
    // Group sample resources by category when no real data
    FEATURED_RESOURCES.forEach((resource) => {
      if (!resourcesByCategory[resource.category]) {
        resourcesByCategory[resource.category] = [];
      }
      resourcesByCategory[resource.category].push(resource as unknown as Resource);
    });
  }

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

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

  const getCategoryIcon = (category: string) => {
    const found = RESOURCE_CATEGORIES.find(c => c.name.toLowerCase() === category.toLowerCase());
    return found ? found.icon : <BookMarked className="h-4 w-4" />;
  };

  return (
    <Layout title="Resources" subtitle="Learning materials">
      {/* Hero Section */}
      <motion.section 
        className="mb-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-none overflow-hidden">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-center">
              <div className="flex-1">
                <motion.h2 
                  className="text-2xl font-bold mb-2"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  Find the Perfect Study Material
                </motion.h2>
                <motion.p 
                  className="text-gray-600 dark:text-gray-300 mb-4"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  Access thousands of resources to enhance your learning
                </motion.p>
                
                <motion.div 
                  className="relative"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <form onSubmit={handleSearch}>
                    <Input
                      type="text"
                      placeholder="Search for books, documents, videos..."
                      className={cn(
                        "w-full bg-black dark:bg-gray-900 rounded-full pl-10 pr-4 py-6 focus:outline-none focus:ring-2 focus:ring-primary shadow-md transition-all duration-300",
                        isSearchFocused && "pr-24"
                      )}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onFocus={() => setIsSearchFocused(true)}
                      onBlur={() => setIsSearchFocused(false)}
                    />
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    
                    <AnimatePresence>
                      {isSearchFocused && (
                        <motion.div
                          initial={{ opacity: 0, x: 10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 10 }}
                          className="absolute right-2 top-1/2 transform -translate-y-1/2"
                        >
                          <Button type="submit" size="sm" className="rounded-full">
                            Search
                          </Button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </form>
                </motion.div>
              </div>
              
              <motion.div 
                className="hidden md:block" 
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 }}
              >
                <div className="relative w-40 h-40">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-primary/20 rounded-lg transform rotate-12"></div>
                  <div className="absolute bottom-0 left-0 w-20 h-20 bg-primary/30 rounded-lg transform -rotate-12"></div>
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-primary">
                    <BookOpen className="w-16 h-16" />
                  </div>
                </div>
              </motion.div>
            </div>
          </CardContent>
        </Card>
      </motion.section>
      
      {/* Categories */}
      <motion.section 
        className="mb-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold text-black dark:text-white">Categories</h3>          
        <Button 
            variant="ghost" 
            size="sm" 
            className="flex items-center gap-1"
            onClick={() => setSelectedCategory(null)}
          >
            <Filter className="h-4 w-4" />
            {selectedCategory ? "Clear filter" : "All categories"}
          </Button>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {isLoadingCategories ? (
            Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-24 rounded-xl" />
            ))
          ) : (
            (categories?.length > 0 ? categories : RESOURCE_CATEGORIES.map(c => c.name)).map((category: string, index) => (
              <motion.div
                key={category}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                <Button
                  variant={selectedCategory === category ? "default" : "outline"}
                  className={cn(
                    "w-full h-24 flex flex-col items-center justify-center gap-2 rounded-xl shadow-sm",
                    selectedCategory === category && "bg-primary text-primary-foreground"
                  )}
                  onClick={() => handleCategoryChange(category)}
                >
                  <div className={cn(
                    "text-2xl",
                    selectedCategory === category ? "text-primary-foreground" : "text-primary"
                  )}>
                    {getCategoryIcon(category)}
                  </div>
                  <span className="text-black dark:text-white">{category}</span>                
                  </Button>
              </motion.div>
            ))
          )}
        </div>
      </motion.section>
      
      {/* Resource List */}
      <motion.section
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {isLoadingResources ? (
          <>
            <Skeleton className="h-7 w-40 mb-3" />
            <div className="space-y-3 mb-6">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-24 w-full rounded-xl" />
              ))}
            </div>
            <Skeleton className="h-7 w-40 mb-3" />
            <div className="space-y-3">
              {Array.from({ length: 2 }).map((_, i) => (
                <Skeleton key={i} className="h-24 w-full rounded-xl" />
              ))}
            </div>
          </>
        ) : (Object.keys(resourcesByCategory).length > 0) ? (
          Object.entries(resourcesByCategory).map(([category, resources], categoryIndex) => (
            <motion.div 
              key={category}
              className="mb-8"
              variants={itemVariants}
            >
              <div className="flex items-center mb-3">
                <div className="mr-2 text-primary">
                  {getCategoryIcon(category)}
                </div>
<h3 className="text-lg font-semibold text-black dark:text-white">{category}</h3>                <Badge variant="outline" className="ml-2">{resources.length}</Badge>
              </div>
              
              <div className="space-y-3">
                <AnimatePresence>
                  {resources.map((resource, index) => (
                    <motion.div
                      key={resource.id}
                      variants={itemVariants}
                      layoutId={`resource-${resource.id}`}
                      className="relative bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden border border-gray-100 dark:border-gray-700 p-4 hover:shadow-md transition-all"
                      whileHover={{ 
                        y: -5,
                        boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)"
                      }}
                    >
                      <div className="flex items-start">
                        <div className="hidden sm:flex items-center justify-center w-12 h-12 rounded-lg mr-4 bg-primary/10 text-black dark:text-white">
                          {resource.type === "PDF" ? <FileText className="h-6 w-6 " /> : 
                           resource.type === "DOC" ? <FileText className="h-6 w-6 " /> :
                           resource.type === "MP4" ? <Video className="h-6 w-6 " /> :
                           <Link2 className="h-6 w-6" />}
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-start justify-between">
                          <h4 className="font-semibold text-lg text-black dark:text-white">{resource.title}</h4>                            
                          <Badge variant="outline" className="ml-2 text-black dark:text-white">{resource.type || "FILE"}</Badge>                          </div>
                          
                          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            {resource.description}
                          </p>
                          
                          <div className="flex items-center mt-2 text-xs text-gray-500">
                            <Clock className="h-3 w-3 mr-1" />
                            <span>{new Date(resource.createdAt).toLocaleDateString()}</span>
                            {resource.size && (
                              <>
                                <span className="mx-2">•</span>
                                <span>{resource.size}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex justify-end gap-2 mt-2">
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="rounded-full"
                            onClick={() => handleResourceAction('download', resource)}
                          >
                            <Download className="h-4 w-4 mr-1" />
                            Download
                          </Button>
                        </motion.div>
                        
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                          <Button 
                            variant="default" 
                            size="sm"
                            className="rounded-full"
                            onClick={() => window.open(resource.url, '_blank')}
                          >
                            <ArrowUpRight className="h-4 w-4 mr-1" />
                            Open
                          </Button>
                        </motion.div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </motion.div>
          ))
        ) : (
          <motion.div 
            className="py-10 text-center text-gray-500 dark:text-gray-400"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <span className="material-icons text-4xl mb-2">search_off</span>
            <h3 className="font-medium text-lg">No Resources Found</h3>
            <p className="text-sm mb-6">
              {searchQuery
                ? `No resources matching "${searchQuery}"`
                : selectedCategory
                ? `No resources in the ${selectedCategory} category`
                : "No resources available"}
            </p>
            
            <Button 
              variant="outline" 
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory(null);
              }}
            >
              Clear Search
            </Button>
          </motion.div>
        )}
      </motion.section>
    </Layout>
  );
}
