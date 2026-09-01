import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const lazy = <T>(fn: () => T): (() => T) => {
  let cached: T | null = null;
  return () => {
    if (cached === null) {
      cached = fn();
    }
    return cached;
  };
};