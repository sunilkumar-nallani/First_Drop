import React, { HTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

// =============================================================================
// Card Component
// =============================================================================
// A reusable card component for containing content.
// Provides consistent styling with shadow, padding, and border radius.
// =============================================================================

/**
 * Card component props
 */
export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  /** Remove default padding */
  noPadding?: boolean;
  /** Remove hover effect */
  noHover?: boolean;
  /** Add border */
  bordered?: boolean;
}

/**
 * Card component - Container for grouping related content
 *
 * @example
 * ```tsx
 * // Basic card
 * <Card>
 *   <h3>Card Title</h3>
 *   <p>Card content goes here.</p>
 * </Card>
 *
 * // Card without padding (for custom layouts)
 * <Card noPadding>
 *   <img src="..." alt="..." />
 *   <div className="p-6">
 *     <h3>Title</h3>
 *   </div>
 * </Card>
 *
 * // Card with border
 * <Card bordered>
 *   <p>Bordered card content</p>
 * </Card>
 *
 * // Card without hover effect
 * <Card noHover>
 *   <p>Static card content</p>
 * </Card>
 *
 * // Custom className
 * <Card className="bg-blue-50">
 *   <p>Custom styled card</p>
 * </Card>
 * ```
 */
const Card = forwardRef<HTMLDivElement, CardProps>(
  (
    {
      children,
      noPadding = false,
      noHover = false,
      bordered = false,
      className,
      ...props
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={cn(
          // Base styles
          'bg-white rounded-2xl shadow-card',
          'transition-shadow duration-200',
          // Padding
          !noPadding && 'p-6',
          // Hover effect
          !noHover && 'hover:shadow-card-hover',
          // Border
          bordered && 'border border-neutral-200',
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

// Display name for debugging
Card.displayName = 'Card';

export default Card;
