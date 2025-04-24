import { motion } from "framer-motion";
import { Resource } from "@shared/schema";

interface ResourceCardProps {
  resource: Resource;
}

export function ResourceCard({ resource }: ResourceCardProps) {
  const fileTypeIcons: Record<string, { icon: string; bgClass: string; textClass: string }> = {
    pdf: {
      icon: "picture_as_pdf",
      bgClass: "bg-red-100 dark:bg-red-900/30",
      textClass: "text-red-600 dark:text-red-300"
    },
    video: {
      icon: "videocam",
      bgClass: "bg-blue-100 dark:bg-blue-900/30",
      textClass: "text-blue-600 dark:text-blue-300"
    },
    book: {
      icon: "book",
      bgClass: "bg-green-100 dark:bg-green-900/30",
      textClass: "text-green-600 dark:text-green-300"
    },
    article: {
      icon: "article",
      bgClass: "bg-yellow-100 dark:bg-yellow-900/30", 
      textClass: "text-yellow-600 dark:text-yellow-300"
    },
    slideshow: {
      icon: "slideshow",
      bgClass: "bg-purple-100 dark:bg-purple-900/30",
      textClass: "text-purple-600 dark:text-purple-300"
    },
    default: {
      icon: "insert_drive_file",
      bgClass: "bg-gray-100 dark:bg-gray-800",
      textClass: "text-gray-600 dark:text-gray-300"
    }
  };

  const fileType = resource.type.toLowerCase();
  const { icon, bgClass, textClass } = fileTypeIcons[fileType] || fileTypeIcons.default;

  // Format the date relative to now
  const formatDate = (date: Date) => {
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return `${Math.floor(diffDays / 365)} years ago`;
  };

  const addedDate = resource.addedAt ? formatDate(new Date(resource.addedAt)) : "Unknown date";

  const handleDownload = () => {
    window.open(resource.url, "_blank");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white dark:bg-[#1E1E1E] rounded-xl p-4 shadow-md flex items-center transition-colors"
      whileHover={{ scale: 1.01 }}
    >
      <div className={`w-10 h-10 rounded-full ${bgClass} flex items-center justify-center ${textClass} mr-3`}>
        <span className="material-icons">{icon}</span>
      </div>
      
      <div className="flex-1 min-w-0">
        <h4 className="font-medium truncate">{resource.title}</h4>
        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
          {fileType.toUpperCase()} • {resource.fileSize || "Unknown size"} • Added {addedDate}
        </p>
      </div>
      
      <motion.button 
        className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        onClick={handleDownload}
        whileTap={{ scale: 0.9 }}
      >
        <span className="material-icons">
          {fileType === "video" ? "play_circle" : "download"}
        </span>
      </motion.button>
    </motion.div>
  );
}
