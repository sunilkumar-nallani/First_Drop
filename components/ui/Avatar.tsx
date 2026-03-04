'use client';

import React, { ImgHTMLAttributes, forwardRef, useState } from 'react';
import { cn, getInitials } from '@/lib/utils';

// =============================================================================
// Avatar Component
// =============================================================================
// A reusable avatar component that displays a profile photo or initials.
// Falls back to generated initials when no photo is available.
// =============================================================================

/**
 * Avatar size options
 */
export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

/**
 * Avatar component props
 */
export interface AvatarProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src'> {
  /** URL of the profile photo */
  src?: string | null;
  /** User's name (used for initials fallback) */
  name: string;
  /** Size of the avatar */
  size?: AvatarSize;
  /** Custom background color for initials */
  bgColor?: string;
}

/**
 * Avatar component - Profile photo with initials fallback
 *
 * @example
 * ```tsx
 * // With photo
 * <Avatar src="https://example.com/photo.jpg" name="John Doe" />
 *
 * // Without photo (shows initials)
 * <Avatar name="John Doe" />
 *
 * // Different sizes
 * <Avatar name="John" size="xs" />
 * <Avatar name="John" size="sm" />
 * <Avatar name="John" size="md" />
 * <Avatar name="John" size="lg" />
 * <Avatar name="John" size="xl" />
 *
 * // Custom background color
 * <Avatar name="John" bgColor="bg-blue-500" />
 * ```
 */
const Avatar = forwardRef<HTMLDivElement, AvatarProps>(
  (
    { src, name, size = 'md', bgColor, className, alt, ...props },
    ref
  ) => {
    const [imgError, setImgError] = useState(false);

    // Size-specific styles
    const sizeStyles: Record<AvatarSize, string> = {
      xs: 'w-6 h-6 text-xs',
      sm: 'w-8 h-8 text-sm',
      md: 'w-12 h-12 text-base',
      lg: 'w-16 h-16 text-xl',
      xl: 'w-24 h-24 text-2xl',
    };

    // Generate initials from name
    const initials = getInitials(name);

    // Generate a consistent background color based on name if not provided
    const getBgColor = () => {
      if (bgColor) return bgColor;

      // Generate color based on first character of name
      const colors = [
        'bg-red-500',
        'bg-orange-500',
        'bg-amber-500',
        'bg-green-500',
        'bg-emerald-500',
        'bg-teal-500',
        'bg-cyan-500',
        'bg-blue-500',
        'bg-indigo-500',
        'bg-violet-500',
        'bg-purple-500',
        'bg-fuchsia-500',
        'bg-pink-500',
        'bg-rose-500',
      ];

      const charCode = name.charCodeAt(0) || 0;
      return colors[charCode % colors.length];
    };

    // If there's a photo URL and it hasn't errored, render the image
    if (src && !imgError) {
      return (
        <div
          ref={ref}
          className={cn(
            'relative inline-block rounded-full overflow-hidden bg-neutral-100',
            sizeStyles[size],
            className
          )}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={src}
            alt={alt || `${name}'s profile photo`}
            className="w-full h-full object-cover"
            onError={() => {
              // If image fails to load, show initials fallback
              setImgError(true);
            }}
            {...props}
          />
        </div>
      );
    }

    // No photo or image failed to load - render initials
    return (
      <div
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center rounded-full text-white font-semibold',
          sizeStyles[size],
          getBgColor(),
          className
        )}
        role="img"
        aria-label={`${name}'s avatar`}
      >
        {initials}
      </div>
    );
  }
);

// Display name for debugging
Avatar.displayName = 'Avatar';

export default Avatar;
