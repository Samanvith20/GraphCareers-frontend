import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const normalizeSkill = (skill: string) =>
  skill
    .toLowerCase()
    .replace(/\./g, "")      // react.js → reactjs
    .replace(/\s+/g, " ")    // extra spaces
    .trim();
