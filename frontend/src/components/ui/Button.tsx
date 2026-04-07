import React from 'react';

// Ghana Government Brand Button Components
// Following GSFP (Ghana School Feeding Programme) brand guidelines

// Primary Button - Main CTAs (Donate, Primary Actions)
export const PrimaryButton = ({
  children,
  className = '',
  onClick,
  disabled = false,
  type = 'button' as const,
  ...props
}) => {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`bg-ghana-primary-600 hover:bg-ghana-primary-700 disabled:bg-ghana-neutral-400 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

// Secondary Button - Supporting Actions (Learn More, View Details)
export const SecondaryButton = ({
  children,
  className = '',
  onClick,
  disabled = false,
  type = 'button' as const,
  ...props
}) => {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`bg-ghana-secondary-600 hover:bg-ghana-secondary-700 disabled:bg-ghana-neutral-400 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

// Outline Button - Less prominent actions (Optional, Filter buttons)
export const OutlineButton = ({
  children,
  className = '',
  onClick,
  disabled = false,
  type = 'button' as const,
  ...props
}) => {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`border-2 border-ghana-primary-600 text-ghana-primary-600 hover:bg-ghana-primary-600 hover:text-white disabled:border-ghana-neutral-400 disabled:text-ghana-neutral-400 font-medium py-2 px-4 rounded-lg transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

// Text Button - Minimal actions (Links, subtle CTAs)
export const TextButton = ({
  children,
  className = '',
  onClick,
  disabled = false,
  type = 'button' as const,
  ...props
}) => {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`text-ghana-primary-600 hover:text-ghana-primary-700 disabled:text-ghana-neutral-400 font-medium transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

// Link Button - Navigation links styled as buttons
export const LinkButton = ({
  children,
  to,
  href,
  className = '',
  onClick,
  disabled = false,
  ...props
}) => {
  const Component = to ? 'a' : 'button';
  const linkProps = to ? { href: to } : href ? { href } : {};

  return (
    <Component
      onClick={onClick}
      disabled={disabled}
      className={`text-ghana-primary-600 hover:text-ghana-primary-700 disabled:text-ghana-neutral-400 font-medium transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-50 inline-flex items-center ${className}`}
      {...linkProps}
      {...props}
    >
      {children}
    </Component>
  );
};

// Social Button - For social media links
export const SocialButton = ({
  children,
  href,
  className = '',
  onClick,
  disabled = false,
  ...props
}) => {
  return (
    <a
      href={href}
      onClick={onClick}
      className={`bg-ghana-neutral-200 hover:bg-ghana-primary-600 text-ghana-neutral-600 hover:text-white p-3 rounded-full transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      {...props}
    >
      {children}
    </a>
  );
};

// Filter Button - For category/filter selections
export const FilterButton = ({
  children,
  active = false,
  className = '',
  onClick,
  disabled = false,
  ...props
}) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`px-6 py-2 rounded-full font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
        active
          ? 'bg-ghana-primary-600 text-white shadow-lg'
          : 'bg-white text-ghana-neutral-600 hover:bg-ghana-primary-50 hover:text-ghana-primary-600 border border-ghana-neutral-200'
      } ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

// Loading Button - For async actions
export const LoadingButton = ({
  children,
  loading = false,
  loadingText = 'Loading...',
  className = '',
  onClick,
  disabled = false,
  type = 'button' as const,
  variant = 'primary',
  ...props
}) => {
  const baseClasses = 'font-medium py-3 px-6 rounded-lg transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-50 flex items-center justify-center';

  const variantClasses = {
    primary: 'bg-ghana-primary-600 hover:bg-ghana-primary-700 disabled:bg-ghana-neutral-400 text-white',
    secondary: 'bg-ghana-secondary-600 hover:bg-ghana-secondary-700 disabled:bg-ghana-neutral-400 text-white',
    outline: 'border-2 border-ghana-primary-600 text-ghana-primary-600 hover:bg-ghana-primary-600 hover:text-white disabled:border-ghana-neutral-400 disabled:text-ghana-neutral-400'
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {loading ? (
        <>
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
          {loadingText}
        </>
      ) : (
        children
      )}
    </button>
  );
};

export default {
  PrimaryButton,
  SecondaryButton,
  OutlineButton,
  TextButton,
  LinkButton,
  SocialButton,
  FilterButton,
  LoadingButton
};
