import React from 'react';

export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  disabled = false,
  onClick,
  type = 'button',
  icon: Icon,
  ...props
}) => {
  const baseStyles = "inline-flex items-center justify-center font-medium transition-all duration-150 active:scale-[0.98] select-none rounded-xl focus:outline-none disabled:opacity-50 disabled:pointer-events-none";

  const sizeStyles = {
    xs: "text-xs px-2.5 py-1 gap-1 rounded-lg",
    sm: "text-xs px-3 py-1.5 gap-1.5 rounded-lg",
    md: "text-sm px-4 py-2 gap-2 rounded-xl",
    lg: "text-base px-5 py-2.5 gap-2.5 rounded-xl",
  };

  const variantStyles = {
    primary: "bg-purple-600 hover:bg-purple-500 text-white shadow-md shadow-purple-900/30",
    secondary: "bg-purple-900/30 hover:bg-purple-800/40 text-purple-300 border border-purple-600/30",
    accept: "bg-emerald-600 hover:bg-emerald-500 text-white font-medium shadow-sm shadow-emerald-950",
    reject: "bg-rose-600 hover:bg-rose-500 text-white font-medium shadow-sm shadow-rose-950",
    outline: "bg-transparent hover:bg-white/[0.05] text-slate-300 hover:text-white border border-white/[0.12]",
    subtle: "bg-white/[0.05] hover:bg-white/[0.08] text-slate-300 hover:text-white border border-white/[0.06]",
    ghost: "bg-transparent hover:bg-white/[0.06] text-slate-400 hover:text-slate-100",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {Icon && <Icon className="w-4 h-4 shrink-0" />}
      {children}
    </button>
  );
};

export default Button;
