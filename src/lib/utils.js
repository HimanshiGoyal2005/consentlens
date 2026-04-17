<<<<<<< HEAD
export function cn (...classes) {
  return classes.filter(Boolean).join(' ')
=======
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
>>>>>>> 53c6c9d6bf99bdb0d230294a571ddaf7a088ad26
}
