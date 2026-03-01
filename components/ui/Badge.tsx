import React, { HTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

// =============================================================================
// Badge Component
// =============================================================================
// A reusable badge/pill component for labels, tags, and status indicators.
// =============================================================================

/**
 * Badge variant styles
 */
export type BadgeVariant =
  | 'default'
  | 'primary'
  | 'secondary'
  | 'success'
  | 'warning'
  | 'danger'
  | 'outline';

/**
 * Badge size options
 */
export type BadgeSize = 'sm' | 'md';

/**
 * Badge component props
 */
export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  /** Visual style variant */
  variant?: BadgeVariant;
  /** Size of the badge */
  size?: BadgeSize;
}

/**
 * Badge component - Small label/pill for tags and status
 *
 * @example
 * ```tsx
 * // Default badge
 * <Badge>New</Badge>
 *
 * // Primary badge
 * <Badge variant="primary">Featured</Badge>
 *
 * // Success badge
 * <Badge variant="success">Active</Badge>
 *
 * // Warning badge
 * <Badge variant="warning">Pending</Badge>
 *
 * // Danger badge
 * <Badge variant="danger">Closed</Badge>
 *
 * // Outline badge
 * <Badge variant="outline">Draft</Badge>
 *
 * // Small badge
 * <Badge size="sm">Tag</Badge>
 * ```
 */
const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ children, variant = 'default', size = 'md', className, ...props }, ref) => {
    // Variant-specific styles
    const variantStyles: Record<BadgeVariant, string> = {
      default: 'bg-neutral-100 text-neutral-800',
      primary: 'bg-neutral-900/10 text-neutral-900',
      secondary: 'bg-neutral-800 text-white',
      success: 'bg-emerald-100 text-emerald-800',
      warning: 'bg-amber-100 text-amber-800',
      danger: 'bg-rose-100 text-rose-800',
      outline: 'bg-transparent border border-neutral-300 text-neutral-700',
    };

    // Size-specific styles
    const sizeStyles: Record<BadgeSize, string> = {
      sm: 'px-2 py-0.5 text-xs',
      md: 'px-3 py-1 text-sm',
    };

    return (
      <span
        ref={ref}
        className={cn(
          // Base styles
          'inline-flex items-center font-medium rounded-full',
          // Variant styles
          variantStyles[variant],
          // Size styles
          sizeStyles[size],
          className
        )}
        {...props}
      >
        {children}
      </span>
    );
  }
);

// Display name for debugging
Badge.displayName = 'Badge';

export default Badge;
