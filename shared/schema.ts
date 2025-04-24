import { pgTable, text, serial, integer, boolean, timestamp, date, time } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  fullName: text("full_name").notNull(),
  email: text("email").notNull().unique(),
  role: text("role").default("student").notNull(),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
});

// Classes table
export const classes = pgTable("classes", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  professor: text("professor").notNull(),
  location: text("location").notNull(),
  color: text("color").default("#7C4DFF").notNull(),
});

export const insertClassSchema = createInsertSchema(classes).omit({
  id: true,
});

// Schedule table
export const schedules = pgTable("schedules", {
  id: serial("id").primaryKey(),
  classId: integer("class_id").notNull(),
  dayOfWeek: integer("day_of_week").notNull(), // 0 = Sunday, 1 = Monday, etc.
  startTime: time("start_time").notNull(),
  endTime: time("end_time").notNull(),
});

export const insertScheduleSchema = createInsertSchema(schedules).omit({
  id: true,
});

// Attendance table
export const attendances = pgTable("attendances", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  classId: integer("class_id").notNull(),
  scheduleId: integer("schedule_id").notNull(),
  date: date("date").notNull(),
  status: text("status").notNull(), // "present", "absent", "excused"
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertAttendanceSchema = createInsertSchema(attendances).omit({
  id: true,
  updatedAt: true,
});

// Resources table
export const resources = pgTable("resources", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  type: text("type").notNull(), // "pdf", "video", "article", "book", etc.
  url: text("url").notNull(),
  category: text("category").notNull(),
  description: text("description"),
  fileSize: text("file_size"),
  addedAt: timestamp("added_at").defaultNow().notNull(),
});

export const insertResourceSchema = createInsertSchema(resources).omit({
  id: true,
  addedAt: true,
});

// Events table
export const events = pgTable("events", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  date: date("date").notNull(),
  startTime: time("start_time").notNull(),
  endTime: time("end_time"),
  location: text("location").notNull(),
  imageUrl: text("image_url"),
  isFeatured: boolean("is_featured").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertEventSchema = createInsertSchema(events).omit({
  id: true,
  createdAt: true,
});

// Event tags table
export const eventTags = pgTable("event_tags", {
  id: serial("id").primaryKey(),
  eventId: integer("event_id").notNull(),
  tag: text("tag").notNull(),
});

export const insertEventTagSchema = createInsertSchema(eventTags).omit({
  id: true,
});

// Event registrations table
export const eventRegistrations = pgTable("event_registrations", {
  id: serial("id").primaryKey(),
  eventId: integer("event_id").notNull(),
  userId: integer("user_id").notNull(),
  registeredAt: timestamp("registered_at").defaultNow().notNull(),
});

export const insertEventRegistrationSchema = createInsertSchema(eventRegistrations).omit({
  id: true,
  registeredAt: true,
});

// Counselors table
export const counselors = pgTable("counselors", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  specialty: text("specialty").notNull(),
  bio: text("bio"),
});

export const insertCounselorSchema = createInsertSchema(counselors).omit({
  id: true,
});

// Counseling appointments table
export const counselingAppointments = pgTable("counseling_appointments", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  counselorId: integer("counselor_id"),
  appointmentDate: date("appointment_date").notNull(),
  appointmentTime: time("appointment_time").notNull(),
  type: text("type").notNull(), // "academic", "career", "personal", "mental-health"
  notes: text("notes"),
  status: text("status").default("scheduled").notNull(), // "scheduled", "completed", "cancelled"
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertCounselingAppointmentSchema = createInsertSchema(counselingAppointments).omit({
  id: true,
  createdAt: true,
});

// Chat messages table
export const chatMessages = pgTable("chat_messages", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  content: text("content").notNull(),
  isUserMessage: boolean("is_user_message").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertChatMessageSchema = createInsertSchema(chatMessages).omit({
  id: true,
  createdAt: true,
});

// Export types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Class = typeof classes.$inferSelect;
export type InsertClass = z.infer<typeof insertClassSchema>;

export type Schedule = typeof schedules.$inferSelect;
export type InsertSchedule = z.infer<typeof insertScheduleSchema>;

export type Attendance = typeof attendances.$inferSelect;
export type InsertAttendance = z.infer<typeof insertAttendanceSchema>;

export type Resource = typeof resources.$inferSelect;
export type InsertResource = z.infer<typeof insertResourceSchema>;

export type Event = typeof events.$inferSelect;
export type InsertEvent = z.infer<typeof insertEventSchema>;

export type EventTag = typeof eventTags.$inferSelect;
export type InsertEventTag = z.infer<typeof insertEventTagSchema>;

export type EventRegistration = typeof eventRegistrations.$inferSelect;
export type InsertEventRegistration = z.infer<typeof insertEventRegistrationSchema>;

export type Counselor = typeof counselors.$inferSelect;
export type InsertCounselor = z.infer<typeof insertCounselorSchema>;

export type CounselingAppointment = typeof counselingAppointments.$inferSelect;
export type InsertCounselingAppointment = z.infer<typeof insertCounselingAppointmentSchema>;

export type ChatMessage = typeof chatMessages.$inferSelect;
export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;
