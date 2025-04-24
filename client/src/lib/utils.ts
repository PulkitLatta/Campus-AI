import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string): string {
  const d = new Date(date);
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(d);
}

export function formatTime(time: string): string {
  // Convert 24-hour time (e.g., "14:00:00") to 12-hour format (e.g., "02:00 PM")
  if (!time) return "";
  
  const [hours, minutes] = time.split(':');
  const hour = parseInt(hours, 10);
  const minute = parseInt(minutes, 10);
  
  const period = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;
  
  return `${displayHour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')} ${period}`;
}

export function getDayOfWeek(): number {
  return new Date().getDay();
}

export function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good Morning";
  if (hour < 18) return "Good Afternoon";
  return "Good Evening";
}

export function parseTimeString(timeString: string): Date {
  const today = new Date();
  const [hours, minutes] = timeString.split(':').map(Number);
  
  const date = new Date(today);
  date.setHours(hours, minutes, 0, 0);
  
  return date;
}

export function isCurrentClass(startTime: string, endTime: string): boolean {
  const now = new Date();
  const start = parseTimeString(startTime);
  const end = parseTimeString(endTime);
  
  return now >= start && now <= end;
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase();
}
