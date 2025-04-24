import { 
  users, type User, type InsertUser,
  classes, type Class, type InsertClass,
  schedules, type Schedule, type InsertSchedule,
  attendances, type Attendance, type InsertAttendance,
  resources, type Resource, type InsertResource,
  events, type Event, type InsertEvent,
  eventTags, type EventTag, type InsertEventTag,
  eventRegistrations, type EventRegistration, type InsertEventRegistration,
  counselors, type Counselor, type InsertCounselor,
  counselingAppointments, type CounselingAppointment, type InsertCounselingAppointment,
  chatMessages, type ChatMessage, type InsertChatMessage
} from "@shared/schema";
import { db } from "./db";
import { eq, and, or, gte, lte, like, sql, desc, asc } from "drizzle-orm";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Class methods
  getAllClasses(): Promise<Class[]>;
  getClassById(id: number): Promise<Class | undefined>;
  getClassesByDay(dayOfWeek: number): Promise<(Class & { schedule: Schedule })[]>;
  
  // Schedule methods
  getAllSchedules(): Promise<Schedule[]>;
  getScheduleById(id: number): Promise<Schedule | undefined>;
  
  // Attendance methods
  getAttendanceSummary(userId: number): Promise<{
    overall: number;
    present: number;
    absent: number;
    total: number;
  }>;
  createAttendance(attendance: InsertAttendance): Promise<Attendance>;
  
  // Resource methods
  getResources(category?: string, search?: string): Promise<Resource[]>;
  getResourceCategories(): Promise<string[]>;
  
  // Event methods
  getAllEvents(): Promise<(Event & { tags: string[] })[]>;
  getFeaturedEvent(): Promise<(Event & { tags: string[] }) | undefined>;
  registerForEvent(registration: InsertEventRegistration): Promise<EventRegistration>;
  
  // Counselor methods
  getAllCounselors(): Promise<Counselor[]>;
  
  // Counseling appointment methods
  createCounselingAppointment(appointment: InsertCounselingAppointment): Promise<CounselingAppointment>;
  
  // Chat message methods
  getChatMessagesByUser(userId: number): Promise<ChatMessage[]>;
  createChatMessage(message: InsertChatMessage): Promise<ChatMessage>;
  
  // Session store
  sessionStore: session.SessionStore;
}

export class DatabaseStorage implements IStorage {
  sessionStore: session.SessionStore;

  constructor() {
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000, // 24 hours
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  // Class methods
  async getAllClasses(): Promise<Class[]> {
    return await db.select().from(classes);
  }

  async getClassById(id: number): Promise<Class | undefined> {
    const [classItem] = await db.select().from(classes).where(eq(classes.id, id));
    return classItem;
  }

  async getClassesByDay(dayOfWeek: number): Promise<(Class & { schedule: Schedule })[]> {
    const result = await db
      .select({
        ...classes,
        schedule: schedules
      })
      .from(classes)
      .innerJoin(schedules, eq(classes.id, schedules.classId))
      .where(eq(schedules.dayOfWeek, dayOfWeek))
      .orderBy(schedules.startTime);
    
    return result;
  }

  // Schedule methods
  async getAllSchedules(): Promise<Schedule[]> {
    return await db.select().from(schedules);
  }

  async getScheduleById(id: number): Promise<Schedule | undefined> {
    const [schedule] = await db.select().from(schedules).where(eq(schedules.id, id));
    return schedule;
  }

  // Attendance methods
  async getAttendanceSummary(userId: number): Promise<{
    overall: number;
    present: number;
    absent: number;
    total: number;
  }> {
    const result = await db
      .select({
        total: sql<number>`count(*)`,
        present: sql<number>`sum(case when ${attendances.status} = 'present' then 1 else 0 end)`,
        absent: sql<number>`sum(case when ${attendances.status} = 'absent' then 1 else 0 end)`,
      })
      .from(attendances)
      .where(eq(attendances.userId, userId));
    
    const { total, present, absent } = result[0];
    
    return {
      overall: total > 0 ? (present / total) * 100 : 0,
      present: total > 0 ? (present / total) * 100 : 0,
      absent: total > 0 ? (absent / total) * 100 : 0,
      total,
    };
  }

  async createAttendance(attendance: InsertAttendance): Promise<Attendance> {
    // Check if attendance record already exists and update it
    const [existingAttendance] = await db.select()
      .from(attendances)
      .where(
        and(
          eq(attendances.userId, attendance.userId),
          eq(attendances.classId, attendance.classId),
          eq(attendances.scheduleId, attendance.scheduleId),
          eq(attendances.date, attendance.date)
        )
      );
    
    if (existingAttendance) {
      const [updated] = await db.update(attendances)
        .set({ status: attendance.status, updatedAt: new Date() })
        .where(eq(attendances.id, existingAttendance.id))
        .returning();
      
      return updated;
    }
    
    // Create new attendance record
    const [newAttendance] = await db
      .insert(attendances)
      .values(attendance)
      .returning();
    
    return newAttendance;
  }

  // Resource methods
  async getResources(category?: string, search?: string): Promise<Resource[]> {
    let query = db.select().from(resources);
    
    if (category) {
      query = query.where(eq(resources.category, category));
    }
    
    if (search) {
      query = query.where(
        or(
          like(resources.title, `%${search}%`),
          like(resources.description || '', `%${search}%`)
        )
      );
    }
    
    return await query.orderBy(desc(resources.addedAt));
  }

  async getResourceCategories(): Promise<string[]> {
    const result = await db
      .select({
        category: resources.category
      })
      .from(resources)
      .groupBy(resources.category);
    
    return result.map(r => r.category);
  }

  // Event methods
  async getAllEvents(): Promise<(Event & { tags: string[] })[]> {
    const results = await db.select().from(events).orderBy(asc(events.date));
    
    // Get tags for each event
    const eventsWithTags = await Promise.all(
      results.map(async (event) => {
        const tags = await db
          .select({ tag: eventTags.tag })
          .from(eventTags)
          .where(eq(eventTags.eventId, event.id));
        
        return {
          ...event,
          tags: tags.map(t => t.tag)
        };
      })
    );
    
    return eventsWithTags;
  }

  async getFeaturedEvent(): Promise<(Event & { tags: string[] }) | undefined> {
    const [featuredEvent] = await db
      .select()
      .from(events)
      .where(eq(events.isFeatured, true))
      .limit(1);
    
    if (!featuredEvent) {
      return undefined;
    }
    
    const tags = await db
      .select({ tag: eventTags.tag })
      .from(eventTags)
      .where(eq(eventTags.eventId, featuredEvent.id));
    
    return {
      ...featuredEvent,
      tags: tags.map(t => t.tag)
    };
  }

  async registerForEvent(registration: InsertEventRegistration): Promise<EventRegistration> {
    // Check if already registered
    const [existingRegistration] = await db.select()
      .from(eventRegistrations)
      .where(
        and(
          eq(eventRegistrations.userId, registration.userId),
          eq(eventRegistrations.eventId, registration.eventId)
        )
      );
    
    if (existingRegistration) {
      return existingRegistration;
    }
    
    // Create new registration
    const [newRegistration] = await db
      .insert(eventRegistrations)
      .values(registration)
      .returning();
    
    return newRegistration;
  }

  // Counselor methods
  async getAllCounselors(): Promise<Counselor[]> {
    return await db.select().from(counselors);
  }

  // Counseling appointment methods
  async createCounselingAppointment(appointment: InsertCounselingAppointment): Promise<CounselingAppointment> {
    const [newAppointment] = await db
      .insert(counselingAppointments)
      .values(appointment)
      .returning();
    
    return newAppointment;
  }

  // Chat message methods
  async getChatMessagesByUser(userId: number): Promise<ChatMessage[]> {
    return await db
      .select()
      .from(chatMessages)
      .where(eq(chatMessages.userId, userId))
      .orderBy(asc(chatMessages.createdAt));
  }

  async createChatMessage(message: InsertChatMessage): Promise<ChatMessage> {
    const [newMessage] = await db
      .insert(chatMessages)
      .values(message)
      .returning();
    
    return newMessage;
  }
}

export const storage = new DatabaseStorage();
