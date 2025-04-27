import { ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * CSS sınıflarını birleştiren yardımcı fonksiyon
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
} 