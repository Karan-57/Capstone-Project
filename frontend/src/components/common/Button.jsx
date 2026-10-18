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
    primary: "bg-[#3C2415] hover:bg-[#2B1810] text-[#F7F5F0] shadow-sm",
    secondary: "bg-[#F0EDE5] hover:bg-[#EAE6DF] text-[#3C2415] border border-[#DDD9CE]",
    accept: "bg-[#55745C] hover:bg-[#48634E] text-white font-medium shadow-sm",
    reject: "bg-[#A34F45] hover:bg-[#8F443B] text-white font-medium shadow-sm",
    outline: "bg-transparent hover:bg-[#F0EDE5] text-[#3C2415] border border-[#E5E0D7]",
    subtle: "bg-[#F0EDE5] hover:bg-[#EAE6DF] text-[#3C2415] border border-[#E5E0D7]",
    ghost: "bg-transparent hover:bg-[#F0EDE5] text-[#77736D] hover:text-[#3C2415]",
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
