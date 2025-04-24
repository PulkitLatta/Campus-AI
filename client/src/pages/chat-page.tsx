import { Layout } from "@/components/layout";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SendIcon } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";

interface ChatMessage {
  id: number;
  userId: number;
  content: string;
  isUserMessage: boolean;
  createdAt: string;
}

export default function ChatPage() {
  const { user } = useAuth();
  const [message, setMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  // Fetch chat history
  const { data: chatMessages, isLoading } = useQuery({
    queryKey: ["/api/chat/messages"],
    queryFn: async () => {
      const res = await fetch("/api/chat/messages");
      if (!res.ok) throw new Error("Failed to fetch chat messages");
      return await res.json();
    },
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      const res = await apiRequest("POST", "/api/chat/messages", { content });
      return await res.json();
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["/api/chat/messages"], (oldData: ChatMessage[] = []) => {
        return [...oldData, data.userMessage, data.aiResponse];
      });
    },
  });

  const handleSendMessage = () => {
    if (!message.trim()) return;
    
    sendMessageMutation.mutate(message);
    setMessage("");
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSendMessage();
    }
  };

  // Scroll to bottom of chat when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatMessages]);

  return (
    <Layout title="AI Chat" subtitle="Get assistance" padding={false}>
      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 bg-[#F5FEFD] dark:bg-[#111111]" style={{ height: "calc(100vh - 180px)" }}>
        <div className="space-y-4 max-w-lg mx-auto">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className={`flex ${i % 2 === 0 ? "justify-start" : "justify-end"}`}>
                <Skeleton className={`rounded-lg ${i % 2 === 0 ? "rounded-tl-none" : "rounded-tr-none"} h-16 w-4/5`} />
              </div>
            ))
          ) : chatMessages && chatMessages.length > 0 ? (
            <AnimatePresence initial={false}>
              {chatMessages.map((msg: ChatMessage) => (
                <motion.div
                  key={msg.id}
                  className={`flex ${msg.isUserMessage ? "justify-end" : "justify-start"}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div
                    className={cn(
                      "rounded-lg p-3 max-w-[80%] shadow-sm",
                      msg.isUserMessage
                        ? "bg-primary text-white rounded-tr-none"
                        : "bg-white dark:bg-[#1E1E1E] rounded-tl-none"
                    )}
                  >
                    <p className="text-sm">{msg.content}</p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          ) : (
            // Default welcome message if no chat history
            <motion.div
              className="flex justify-start"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="bg-white dark:bg-[#1E1E1E] rounded-lg rounded-tl-none shadow-sm p-3 max-w-[80%]">
                <p className="text-sm">
                  👋 Hello{user?.fullName ? `, ${user.fullName.split(' ')[0]}` : ', pulkit'}! I'm your AI campus assistant. How can I help you today?
                </p>
              </div>
            </motion.div>
          )}
          
          {/* This gives us a target to scroll to */}
          <div ref={messagesEndRef} />
        </div>
      </div>
      
      {/* Chat Input */}
      <div className="p-3 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
        <div className="flex items-center max-w-lg mx-auto">
          <Input
            type="text"
            placeholder="Type your message..."
            className="flex-1 bg-gray-100 dark:bg-gray-800 rounded-full"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyPress}
            disabled={sendMessageMutation.isPending}
          />
          <Button
            className="ml-2 rounded-full w-10 h-10 p-0 flex items-center justify-center"
            onClick={handleSendMessage}
            disabled={!message.trim() || sendMessageMutation.isPending}
          >
            {sendMessageMutation.isPending ? (
              <div className="animate-spin h-4 w-4 border-2 border-white border-opacity-50 border-t-transparent rounded-full" />
            ) : (
              <SendIcon className="h-4 w-4" />
            )}
          </Button>
        </div>
        
        <div className="mt-2 text-xs text-center text-gray-500 dark:text-gray-400">
          Powered by AI - Responses may not always be accurate
        </div>
      </div>
    </Layout>
  );
}
