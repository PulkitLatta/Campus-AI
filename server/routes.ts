import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { eq, and, gt, gte, lte, like } from "drizzle-orm";
import { generateChatResponse } from "./openai";
import { 
  insertAttendanceSchema,
  insertCounselingAppointmentSchema,
  insertEventRegistrationSchema,
  insertChatMessageSchema
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication routes
  setupAuth(app);

  // Classes API
  app.get("/api/classes", async (req, res) => {
    try {
      const classes = await storage.getAllClasses();
      res.json(classes);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch classes" });
    }
  });

  app.get("/api/classes/today", async (req, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const today = new Date();
      const dayOfWeek = today.getDay();
      const todayClasses = await storage.getClassesByDay(dayOfWeek);
      
      res.json(todayClasses);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch today's classes" });
    }
  });

  // Schedules API
  app.get("/api/schedules", async (req, res) => {
    try {
      const schedules = await storage.getAllSchedules();
      res.json(schedules);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch schedules" });
    }
  });

  // Attendance API
  app.get("/api/attendance/summary", async (req, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const summary = await storage.getAttendanceSummary(userId);
      res.json(summary);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch attendance summary" });
    }
  });

  app.post("/api/attendance", async (req, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const validatedData = insertAttendanceSchema.parse({
        ...req.body,
        userId,
      });

      const attendance = await storage.createAttendance(validatedData);
      res.status(201).json(attendance);
    } catch (error) {
      res.status(500).json({ message: "Failed to update attendance" });
    }
  });

  // Resources API
  app.get("/api/resources", async (req, res) => {
    try {
      const category = req.query.category as string | undefined;
      const search = req.query.search as string | undefined;
      
      const resources = await storage.getResources(category, search);
      res.json(resources);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch resources" });
    }
  });

  app.get("/api/resources/categories", async (req, res) => {
    try {
      const categories = await storage.getResourceCategories();
      res.json(categories);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch resource categories" });
    }
  });

  // Events API
  app.get("/api/events", async (req, res) => {
    try {
      const events = await storage.getAllEvents();
      res.json(events);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch events" });
    }
  });

  app.get("/api/events/featured", async (req, res) => {
    try {
      const featuredEvent = await storage.getFeaturedEvent();
      res.json(featuredEvent);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch featured event" });
    }
  });

  app.post("/api/events/:eventId/register", async (req, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const eventId = parseInt(req.params.eventId);
      
      const validatedData = insertEventRegistrationSchema.parse({
        userId,
        eventId,
      });

      const registration = await storage.registerForEvent(validatedData);
      res.status(201).json(registration);
    } catch (error) {
      res.status(500).json({ message: "Failed to register for event" });
    }
  });

  // Counselors API
  app.get("/api/counselors", async (req, res) => {
    try {
      const counselors = await storage.getAllCounselors();
      res.json(counselors);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch counselors" });
    }
  });

  // Counseling appointments API
  app.post("/api/counseling/appointments", async (req, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const validatedData = insertCounselingAppointmentSchema.parse({
        ...req.body,
        userId,
      });

      const appointment = await storage.createCounselingAppointment(validatedData);
      res.status(201).json(appointment);
    } catch (error) {
      res.status(500).json({ message: "Failed to book counseling appointment" });
    }
  });

  // Chat API
  app.get("/api/chat/messages", async (req, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const messages = await storage.getChatMessagesByUser(userId);
      res.json(messages);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch chat messages" });
    }
  });

  app.post("/api/chat/messages", async (req, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const validatedData = insertChatMessageSchema.parse({
        ...req.body,
        userId,
        isUserMessage: true,
      });

      const message = await storage.createChatMessage(validatedData);

      // Get user's name for personalized responses
      const user = await storage.getUser(userId);
      const userName = user?.fullName?.split(' ')[0] || "pulkit";
      
      // Generate response using OpenAI
      const aiResponseContent = await generateChatResponse(validatedData.content, userName);
      
      // Store the AI response in the database
      const aiResponse = await storage.createChatMessage({
        userId,
        content: aiResponseContent,
        isUserMessage: false,
      });

      res.status(201).json({ 
        userMessage: message,
        aiResponse
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to send message" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
