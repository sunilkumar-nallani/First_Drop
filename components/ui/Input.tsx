import React, { InputHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

// =============================================================================
// Input Component
// =============================================================================
// A reusable input component with label and error message support.
// Built with Tailwind CSS and supports all native input attributes.
// =============================================================================

/**
 * Input component props
 */
export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  /** Label text displayed above the input */
  label?: string;
  /** Error message displayed below the input */
  error?: string;
  /** Helper text displayed below the input (when no error) */
  helperText?: string;
  /** Full width input */
  fullWidth?: boolean;
}

/**
 * Input component - Form text input with label and error handling
 *
 * @example
 * ```tsx
 * // Basic input
 * <Input label="Email" type="email" placeholder="you@example.com" />
 *
 * // With error
 * <Input
 *   label="Password"
 *   type="password"
 *   error="Password must be at least 8 characters"
 * />
 *
 * // With helper text
 * <Input
 *   label="Username"
 *   helperText="This will be visible to other users"
 * />
 *
 * // Required field
 * <Input label="Name" required />
 *
 * // Disabled
 * <Input label="Email" value="user@example.com" disabled />
 *
 * // Full width
 * <Input label="Search" fullWidth placeholder="Search..." />
 * ```
 */
const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      helperText,
      fullWidth = false,
      className,
      id,
      required,
      disabled,
      ...props
    },
    ref
  ) => {
    // Generate a unique ID if not provided
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

    // Determine if we have helper text or error to show
    const hasHelper = !!helperText && !error;
    const hasError = !!error;

    return (
      <div className={cn(fullWidth ? 'w-full' : '')}>
        {/* Label */}
        {label && (
          <label
            htmlFor={inputId}
            className={cn(
              'block text-sm font-medium mb-1',
              disabled ? 'text-neutral-400' : 'text-neutral-700',
              required && "after:content-['*'] after:ml-0.5 after:text-neutral-900"
            )}
          >
            {label}
          </label>
        )}

        {/* Input field */}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            // Base styles
            'block rounded-lg border shadow-sm text-neutral-900 placeholder-neutral-400',
            'transition-colors duration-200',
            'focus:outline-none focus:ring-2 focus:ring-offset-0',
            // Size
            'px-4 py-3 text-base',
            // Width
            fullWidth ? 'w-full' : '',
            // Error state
            hasError
              ? 'border-neutral-300 focus:border-neutral-900 focus:ring-neutral-900/10 bg-neutral-50'
              : 'border-neutral-200 focus:border-neutral-900 focus:ring-neutral-900/10 bg-white',
            // Disabled state
            disabled && 'bg-neutral-50 text-neutral-500 cursor-not-allowed',
            className
          )}
          disabled={disabled}
          aria-invalid={hasError}
          aria-describedby={
            hasError
              ? `${inputId}-error`
              : hasHelper
                ? `${inputId}-helper`
                : undefined
          }
          {...props}
        />

        {/* Error message */}
        {hasError && (
          <p
            id={`${inputId}-error`}
            className="mt-1.5 text-sm text-neutral-900 flex items-center"
            role="alert"
          >
            <svg
              className="w-4 h-4 mr-1.5 flex-shrink-0"
              fill="currentColor"
              viewBox="0 0 20 20"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            {error}
          </p>
        )}

        {/* Helper text */}
        {hasHelper && (
          <p
            id={`${inputId}-helper`}
            className="mt-1.5 text-sm text-neutral-500"
          >
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

// Display name for debugging
Input.displayName = 'Input';

export default Input;
