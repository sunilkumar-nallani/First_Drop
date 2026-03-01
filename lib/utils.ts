import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// =============================================================================
// Utility Functions
// =============================================================================
// This module provides utility functions used throughout the application.
// =============================================================================

/**
 * Combines multiple class names using clsx and merges Tailwind classes using tailwind-merge.
 *
 * This utility is essential for building flexible React components that accept
 * className props. It handles:
 * - Conditional classes (objects, arrays)
 * - Tailwind class conflicts (e.g., 'px-2 px-4' → 'px-4')
 * - Undefined/null values
 *
 * @param inputs - Class values to combine
 * @returns Merged class string
 *
 * @example
 * ```tsx
 * // Basic usage
 * <div className={cn('px-4', 'py-2')} />
 * // Result: 'px-4 py-2'
 *
 * // With conditions
 * <div className={cn('px-4', isActive && 'bg-blue-500')} />
 * // Result when active: 'px-4 bg-blue-500'
 * // Result when inactive: 'px-4'
 *
 * // With className prop
 * function Button({ className, ...props }: ButtonProps) {
 *   return <button className={cn('px-4 py-2', className)} {...props} />;
 * }
 * ```
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/**
 * Formats a date to a human-readable string.
 *
 * @param date - Date to format
 * @param options - Intl.DateTimeFormat options
 * @returns Formatted date string
 *
 * @example
 * ```typescript
 * formatDate(new Date('2024-01-15'))
 * // Result: 'Jan 15, 2024'
 * ```
 */
export function formatDate(
  date: Date | string | number,
  options: Intl.DateTimeFormatOptions = {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }
): string {
  const d = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;
  return new Intl.DateTimeFormat('en-US', options).format(d);
}

/**
 * Formats a number with commas as thousands separators.
 *
 * @param num - Number to format
 * @returns Formatted number string
 *
 * @example
 * ```typescript
 * formatNumber(1234567)
 * // Result: '1,234,567'
 * ```
 */
export function formatNumber(num: number): string {
  return new Intl.NumberFormat('en-US').format(num);
}

/**
 * Truncates text to a specified length with ellipsis.
 *
 * @param text - Text to truncate
 * @param maxLength - Maximum length before truncation
 * @returns Truncated text
 *
 * @example
 * ```typescript
 * truncate('This is a long text', 10)
 * // Result: 'This is a...'
 * ```
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + '...';
}

/**
 * Generates initials from a name.
 *
 * @param name - Name to generate initials from
 * @returns Initials (1-2 characters)
 *
 * @example
 * ```typescript
 * getInitials('John Doe')
 * // Result: 'JD'
 *
 * getInitials('Sarah')
 * // Result: 'S'
 * ```
 */
export function getInitials(name: string): string {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

/**
 * Delays execution for a specified duration.
 *
 * @param ms - Milliseconds to delay
 * @returns Promise that resolves after the delay
 *
 * @example
 * ```typescript
 * await delay(1000); // Wait 1 second
 * ```
 */
export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Safely parses JSON with a fallback value.
 *
 * @param json - JSON string to parse
 * @param fallback - Value to return if parsing fails
 * @returns Parsed value or fallback
 *
 * @example
 * ```typescript
 * safeJsonParse('{"key": "value"}', {})
 * // Result: { key: 'value' }
 *
 * safeJsonParse('invalid json', {})
 * // Result: {}
 * ```
 */
export function safeJsonParse<T>(json: string | null | undefined, fallback: T): T {
  if (!json) return fallback;
  try {
    return JSON.parse(json) as T;
  } catch {
    return fallback;
  }
}

/**
 * Creates a URL-friendly slug from a string.
 *
 * @param text - Text to slugify
 * @returns URL-friendly slug
 *
 * @example
 * ```typescript
 * slugify('Hello World!')
 * // Result: 'hello-world'
 * ```
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Checks if a value is a valid email address.
 *
 * @param email - Email to validate
 * @returns True if valid, false otherwise
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Capitalizes the first letter of a string.
 *
 * @param str - String to capitalize
 * @returns Capitalized string
 *
 * @example
 * ```typescript
 * capitalize('hello')
 * // Result: 'Hello'
 * ```
 */
export function capitalize(str: string): string {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1);
}
