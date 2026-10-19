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
    primary: "bg-[#382322] hover:bg-[#261615] text-[#FFEBAA] border-2 border-[#382322] shadow-[2px_2px_0_#382322] dark:bg-[#FFEBAA] dark:hover:bg-[#fff0c2] dark:text-[#261615] dark:border-[#FFEBAA] dark:shadow-[2px_2px_0_#000] active:translate-x-[1px] active:translate-y-[1px]",
    secondary: "bg-[#FFEBAA] hover:bg-[#fff2cc] text-[#261615] border-2 border-[#382322] shadow-[2px_2px_0_#382322] dark:bg-[#2D1C1B] dark:hover:bg-[#382322] dark:text-[#FFEBAA] dark:border-[#FFEBAA]/50 dark:shadow-[2px_2px_0_#000]",
    accept: "bg-emerald-600 hover:bg-emerald-500 text-white font-semibold border-2 border-emerald-900 shadow-[2px_2px_0_#064e3b]",
    reject: "bg-rose-600 hover:bg-rose-500 text-white font-semibold border-2 border-rose-900 shadow-[2px_2px_0_#881337]",
    outline: "bg-transparent hover:bg-[#382322]/10 text-[#261615] dark:text-[#FDEBDE] border-2 border-[#382322] dark:border-[#FDEBDE]/30 dark:hover:bg-white/5",
    subtle: "bg-[#FAF0E6] dark:bg-[#281B1A] hover:bg-[#F5D7C2] dark:hover:bg-[#33201F] text-[#261615] dark:text-[#FDEBDE] border border-[#382322]/20 dark:border-[#FDEBDE]/20",
    ghost: "bg-transparent hover:bg-[#382322]/10 dark:hover:bg-white/10 text-[#382322] dark:text-[#FDEBDE]",
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
