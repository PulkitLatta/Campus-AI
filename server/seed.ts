import { scrypt, randomBytes } from "crypto";
import { promisify } from "util";
import { db } from "./db";
import { storage } from "./storage";
import { users, classes, schedules, resources, events, eventTags, counselors } from "@shared/schema";

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

export async function seedDatabase() {
  console.log("Seeding database...");

  // Check if users already exist
  const existingUsers = await db.select().from(users);
  if (existingUsers.length > 0) {
    console.log("Database already has users. Skipping seed.");
    return;
  }

  // Create test user
  const hashedPassword = await hashPassword("password123");
  await storage.createUser({
    username: "pulkit",
    password: hashedPassword,
    email: "pulkit@campus.edu",
    fullName: "Pulkit",
    role: "student",
  });

  console.log("Database seeded successfully!");
}