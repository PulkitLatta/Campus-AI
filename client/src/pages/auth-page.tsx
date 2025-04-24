import { useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { LoginData, RegisterData } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

// Login form schema
const loginSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

// Register form schema
const registerSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(6, "Password must be at least 6 characters"),
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export default function AuthPage() {
  const [selectedTab, setSelectedTab] = useState<"login" | "register">("login");
  const { user, loginMutation, registerMutation, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  // Define login form
  const loginForm = useForm<LoginData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "pulkit",
      password: "",
    },
  });

  // Define register form
  const registerForm = useForm<RegisterData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "pulkit",
      password: "",
      confirmPassword: "",
      fullName: "Pulkit",
      email: "pulkit@campus.edu",
      role: "student",
    },
  });

  // If user is already logged in, redirect to dashboard
  useEffect(() => {
    if (user) {
      setLocation("/");
    }
  }, [user, setLocation]);

  // Handle login form submission
  const onLoginSubmit = (values: LoginData) => {
    loginMutation.mutate(values);
  };

  // Handle register form submission
  const onRegisterSubmit = (values: RegisterData) => {
    registerMutation.mutate(values);
  };

  // If still checking authentication status, show loading
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#F5FEFD] dark:bg-[#111111]">
      {/* Main content */}
      <div className="flex flex-col md:flex-row w-full">
        {/* Left side - Auth forms */}
        <div className="flex-1 flex flex-col p-4 md:p-8 justify-center">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center">
              <svg
                viewBox="0 0 24 24"
                className="h-10 w-10 mr-2 text-primary"
                fill="currentColor"
              >
                <path d="M9 3C6.23858 3 4 5.23858 4 8C4 10.7614 6.23858 13 9 13C11.7614 13 14 10.7614 14 8C14 5.23858 11.7614 3 9 3ZM6 8C6 6.34315 7.34315 5 9 5C10.6569 5 12 6.34315 12 8C12 9.65685 10.6569 11 9 11C7.34315 11 6 9.65685 6 8Z" />
                <path d="M16.9999 3C14.9999 3 14.2499 4 13.9999 5C13.9999 5 13.9999 6 14.9999 6C15.9999 6 15.9999 5 15.9999 5C15.9999 5 15.9999 5 16.9999 5C18.9999 5 18.9999 8 16.9999 8C15.9999 8 15.4999 7.5 15.4999 7.5C15.4999 7.5 14.9999 9 16.9999 9C19.9999 9 20.9999 5 18.4999 3.5C17.9999 3.3 17.4999 3 16.9999 3Z" />
                <path d="M16.9999 17C14.9999 17 14.2499 18 13.9999 19C13.9999 19 13.9999 20 14.9999 20C15.9999 20 15.9999 19 15.9999 19C15.9999 19 15.9999 19 16.9999 19C18.9999 19 18.9999 22 16.9999 22C15.9999 22 15.4999 21.5 15.4999 21.5C15.4999 21.5 14.9999 23 16.9999 23C19.9999 23 20.9999 19 18.4999 17.5C17.9999 17.3 17.4999 17 16.9999 17Z" />
                <path d="M9 15C6.23858 15 4 17.2386 4 20C4 22.7614 6.23858 25 9 25C11.7614 25 14 22.7614 14 20C14 17.2386 11.7614 15 9 15ZM6 20C6 18.3431 7.34315 17 9 17C10.6569 17 12 18.3431 12 20C12 21.6569 10.6569 23 9 23C7.34315 23 6 21.6569 6 20Z" />
              </svg>
              <h1 className="text-2xl font-bold text-black dark:text-white">CampusAI</h1>
              </div>
            <ThemeToggle />
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="w-full max-w-md mx-auto">
              <CardHeader>
                <CardTitle className="text-2xl text-center">Welcome to CampusAI</CardTitle>
                <CardDescription className="text-center">
                  Your smart campus companion app
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs value={selectedTab} onValueChange={(value) => setSelectedTab(value as "login" | "register")}>
                  <TabsList className="grid w-full grid-cols-2 mb-4">
                    <TabsTrigger value="login">Login</TabsTrigger>
                    <TabsTrigger value="register">Register</TabsTrigger>
                  </TabsList>

                  {/* Login Form */}
                  <TabsContent value="login">
                    <Form {...loginForm}>
                      <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                        <FormField
                          control={loginForm.control}
                          name="username"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Username</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Enter your username"
                                  {...field}
                                  disabled={loginMutation.isPending}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={loginForm.control}
                          name="password"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Password</FormLabel>
                              <FormControl>
                                <Input
                                  type="password"
                                  placeholder="Enter your password"
                                  {...field}
                                  disabled={loginMutation.isPending}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <Button
                          type="submit"
                          className="w-full"
                          disabled={loginMutation.isPending}
                        >
                          {loginMutation.isPending ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Logging in
                            </>
                          ) : "Login"}
                        </Button>
                      </form>
                    </Form>
                  </TabsContent>

                  {/* Register Form */}
                  <TabsContent value="register">
                    <Form {...registerForm}>
                      <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
                        <FormField
                          control={registerForm.control}
                          name="fullName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Full Name</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Enter your full name"
                                  {...field}
                                  disabled={registerMutation.isPending}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={registerForm.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email</FormLabel>
                              <FormControl>
                                <Input
                                  type="email"
                                  placeholder="Enter your email"
                                  {...field}
                                  disabled={registerMutation.isPending}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={registerForm.control}
                          name="username"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Username</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Choose a username"
                                  {...field}
                                  disabled={registerMutation.isPending}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={registerForm.control}
                          name="password"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Password</FormLabel>
                              <FormControl>
                                <Input
                                  type="password"
                                  placeholder="Create a password"
                                  {...field}
                                  disabled={registerMutation.isPending}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={registerForm.control}
                          name="confirmPassword"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Confirm Password</FormLabel>
                              <FormControl>
                                <Input
                                  type="password"
                                  placeholder="Confirm your password"
                                  {...field}
                                  disabled={registerMutation.isPending}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <Button
                          type="submit"
                          className="w-full"
                          disabled={registerMutation.isPending}
                        >
                          {registerMutation.isPending ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Registering
                            </>
                          ) : "Register"}
                        </Button>
                      </form>
                    </Form>
                  </TabsContent>
                </Tabs>
              </CardContent>
              <CardFooter className="flex flex-col space-y-2">
                <div className="text-sm text-center text-gray-500 dark:text-gray-400">
                  {selectedTab === "login" ? (
                    <span>Don't have an account? <Button variant="link" className="p-0 h-auto" onClick={() => setSelectedTab("register")}>Register</Button></span>
                  ) : (
                    <span>Already have an account? <Button variant="link" className="p-0 h-auto" onClick={() => setSelectedTab("login")}>Login</Button></span>
                  )}
                </div>
              </CardFooter>
            </Card>
          </motion.div>
        </div>

        {/* Right side - Hero section */}
        <div className="hidden md:flex md:w-1/2 bg-primary items-center justify-center p-8">
          <div className="max-w-md text-white">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="space-y-6"
            >
              <h2 className="text-3xl font-bold">Your Smart Campus Companion</h2>
              <p className="text-white/90">
                CampusAI helps you manage your academic life efficiently with features like:
              </p>

              <ul className="space-y-4">
                {[
                  { icon: "calendar_today", title: "Class Timetable", description: "Keep track of your schedule and never miss a class" },
                  { icon: "how_to_reg", title: "Attendance Tracking", description: "Monitor your attendance and stay on top of your academic requirements" },
                  { icon: "book", title: "Learning Resources", description: "Access study materials and resources for all your courses" },
                  { icon: "event", title: "Campus Events", description: "Stay updated with all the events happening on campus" },
                  { icon: "chat", title: "AI Assistance", description: "Get instant help with your academic queries" },
                ].map((feature, index) => (
                  <motion.li
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + (index * 0.1) }}
                    className="flex items-start"
                  >
                    <span className="material-icons bg-white/10 p-2 rounded-full mr-3">
                      {feature.icon}
                    </span>
                    <div>
                      <h3 className="font-semibold">{feature.title}</h3>
                      <p className="text-white/70 text-sm">{feature.description}</p>
                    </div>
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
