import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const cnNav = (...classes: (string | false | undefined)[]) => {
  return classes.filter(Boolean).join(' ');
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