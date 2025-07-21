import React from "react";
import { cn } from "../../lib/utils";
import { Button as ShadcnButton } from "../ui/button";
import { Input as ShadcnInput } from "../ui/input";
import { Card as ShadcnCard, CardContent, CardHeader, CardTitle, CardDescription } from "../ui/card";
import { Alert as ShadcnAlert, AlertDescription } from "../ui/alert";

// Layout Components
export const Box = ({ children, className, bg, color, p, px, py, m, mx, my, w, h, display, flexDirection, alignItems, justifyContent, gap, borderRadius, border, borderColor, ...props }) => {
  const bgClass = bg === "gray.900" ? "bg-card" : 
                  bg === "gray.800" ? "bg-secondary" : 
                  bg === "#0088CD" ? "bg-brand" :
                  bg ? `bg-[${bg}]` : "";

  const colorClass = color === "white" ? "text-foreground" :
                     color === "gray.400" ? "text-muted-foreground" :
                     color === "#0088CD" ? "text-brand" :
                     color ? `text-[${color}]` : "";

  const displayClass = display === "flex" ? "flex" : display || "";
  const flexDirClass = flexDirection === "column" ? "flex-col" : 
                       flexDirection === "row" ? "flex-row" : "";
  const alignClass = alignItems === "center" ? "items-center" :
                     alignItems === "start" ? "items-start" :
                     alignItems === "end" ? "items-end" : "";
  const justifyClass = justifyContent === "center" ? "justify-center" :
                       justifyContent === "between" ? "justify-between" :
                       justifyContent === "start" ? "justify-start" : "";

  const gapClass = typeof gap === "number" ? `gap-${gap}` : gap || "";
  const paddingClass = p ? `p-${p}` : "";
  const paddingXClass = px ? `px-${px}` : "";
  const paddingYClass = py ? `py-${py}` : "";
  const marginClass = m ? `m-${m}` : "";
  const marginXClass = mx ? `mx-${mx}` : "";
  const marginYClass = my ? `my-${my}` : "";
  const widthClass = w?.base ? `w-full md:w-${w.md}` : w ? `w-${w}` : "";
  const heightClass = h?.base ? `h-${h.base} md:h-${h.md}` : h ? `h-${h}` : "";
  const borderClass = border ? "border" : "";
  const borderColorClass = borderColor === "gray.700" ? "border-border" : borderColor || "";
  const roundedClass = borderRadius === "lg" ? "rounded-lg" : borderRadius || "";

  return (
    <div 
      className={cn(
        bgClass, colorClass, displayClass, flexDirClass, alignClass, justifyClass,
        gapClass, paddingClass, paddingXClass, paddingYClass, marginClass, marginXClass, marginYClass,
        widthClass, heightClass, borderClass, borderColorClass, roundedClass,
        className
      )} 
      {...props}
    >
      {children}
    </div>
  );
};

export const Container = ({ children, className, maxW, ...props }) => (
  <div className={cn("container mx-auto px-4", className)} {...props}>
    {children}
  </div>
);

export const Flex = ({ children, className, direction, align, justify, gap, wrap, ...props }) => {
  const dirClass = direction === "column" ? "flex-col" : "flex-row";
  const alignClass = align === "center" ? "items-center" : align === "start" ? "items-start" : "";
  const justifyClass = justify === "center" ? "justify-center" : justify === "between" ? "justify-between" : "";
  const gapClass = typeof gap === "number" ? `gap-${gap}` : gap || "";
  const wrapClass = wrap ? "flex-wrap" : "";

  return (
    <div className={cn("flex", dirClass, alignClass, justifyClass, gapClass, wrapClass, className)} {...props}>
      {children}
    </div>
  );
};

export const VStack = ({ children, className, spacing, align, ...props }) => (
  <div className={cn("flex flex-col", `gap-${spacing || 4}`, align === "stretch" ? "items-stretch" : "items-center", className)} {...props}>
    {children}
  </div>
);

export const HStack = ({ children, className, spacing, align, justify, ...props }) => (
  <div className={cn("flex items-center", `gap-${spacing || 4}`, justify === "between" ? "justify-between" : "", className)} {...props}>
    {children}
  </div>
);

export const SimpleGrid = ({ children, className, columns, spacing, ...props }) => {
  const colClass = typeof columns === "object" ? 
    `grid-cols-${columns.base} md:grid-cols-${columns.md}` :
    `grid-cols-${columns}`;
  const gapClass = `gap-${spacing || 4}`;

  return (
    <div className={cn("grid", colClass, gapClass, className)} {...props}>
      {children}
    </div>
  );
};

// Typography Components
export const Text = ({ children, className, as = "p", fontSize, fontWeight, color, mb, mt, textAlign, ...props }) => {
  const Component = as;
  
  const sizeClass = typeof fontSize === "object" ? 
    `text-${fontSize.base} md:text-${fontSize.md}` :
    fontSize === "sm" ? "text-sm" :
    fontSize === "lg" ? "text-lg" :
    fontSize === "xl" ? "text-xl" :
    fontSize === "2xl" ? "text-2xl" : "";

  const weightClass = fontWeight === "bold" ? "font-bold" :
                      fontWeight === "semibold" ? "font-semibold" :
                      fontWeight === "medium" ? "font-medium" : "";

  const colorClass = color === "white" ? "text-foreground" :
                     color === "gray.400" ? "text-muted-foreground" :
                     color === "gray.600" ? "text-muted-foreground" :
                     color === "#0088CD" ? "text-brand" :
                     color ? `text-[${color}]` : "";

  const marginBClass = mb ? `mb-${mb}` : "";
  const marginTClass = mt ? `mt-${mt}` : "";
  const textAlignClass = textAlign === "center" ? "text-center" : "";

  return (
    <Component 
      className={cn(sizeClass, weightClass, colorClass, marginBClass, marginTClass, textAlignClass, className)} 
      {...props}
    >
      {children}
    </Component>
  );
};

export const Heading = ({ children, className, size, color, textAlign, ...props }) => {
  const sizeClass = size === "lg" ? "text-3xl" :
                    size === "md" ? "text-2xl" :
                    size === "sm" ? "text-xl" : "text-2xl";

  const colorClass = color === "white" ? "text-foreground" :
                     color === "#0088CD" ? "text-brand" : "";

  const textAlignClass = textAlign === "center" ? "text-center" : "";

  return (
    <h2 className={cn("font-bold", sizeClass, colorClass, textAlignClass, className)} {...props}>
      {children}
    </h2>
  );
};

// Form Components
export const Button = ({ children, className, bg, color, variant, size, leftIcon, rightIcon, isLoading, loadingText, isDisabled, ...props }) => {
  let shadcnVariant = "default";
  
  if (bg === "#0088CD" || color === "#0088CD") {
    shadcnVariant = "brand";
  } else if (bg === "gray.800") {
    shadcnVariant = "secondary";
  } else if (variant) {
    shadcnVariant = variant;
  }

  const shadcnSize = size === "lg" ? "lg" : size === "sm" ? "sm" : "default";

  return (
    <ShadcnButton 
      variant={shadcnVariant} 
      size={shadcnSize}
      disabled={isDisabled || isLoading}
      className={className}
      {...props}
    >
      {leftIcon && <span className="mr-2">{leftIcon}</span>}
      {isLoading ? loadingText || "Loading..." : children}
      {rightIcon && <span className="ml-2">{rightIcon}</span>}
    </ShadcnButton>
  );
};

export const Input = ({ className, placeholder, value, onChange, type, isDisabled, ...props }) => (
  <ShadcnInput 
    type={type}
    placeholder={placeholder}
    value={value}
    onChange={onChange}
    disabled={isDisabled}
    className={className}
    {...props}
  />
);

// Data Display Components
export const Card = ({ children, className, bg, borderColor, ...props }) => {
  const bgClass = bg === "gray.900" ? "bg-card" : "";
  const borderClass = borderColor === "gray.700" ? "border-border" : "";

  return (
    <ShadcnCard className={cn(bgClass, borderClass, className)} {...props}>
      {children}
    </ShadcnCard>
  );
};

export const CardBody = ({ children, className, ...props }) => (
  <CardContent className={className} {...props}>
    {children}
  </CardContent>
);

export const CardHeader = ({ children, className, ...props }) => (
  <CardHeader className={className} {...props}>
    {children}
  </CardHeader>
);

// Feedback Components
export const Alert = ({ children, className, status, ...props }) => {
  const variant = status === "error" ? "destructive" :
                  status === "warning" ? "warning" :
                  status === "success" ? "success" : "default";

  return (
    <ShadcnAlert variant={variant} className={className} {...props}>
      <AlertDescription>
        {children}
      </AlertDescription>
    </ShadcnAlert>
  );
};

export const Badge = ({ children, className, colorScheme, size, ...props }) => {
  const colorClass = colorScheme === "blue" ? "bg-blue-600 text-white" :
                     colorScheme === "green" ? "bg-green-600 text-white" :
                     colorScheme === "red" ? "bg-red-600 text-white" :
                     colorScheme === "yellow" ? "bg-yellow-600 text-white" : "bg-secondary text-secondary-foreground";

  const sizeClass = size === "sm" ? "text-xs px-2 py-1" : "text-sm px-3 py-1";

  return (
    <span className={cn("inline-block rounded-full font-medium", colorClass, sizeClass, className)} {...props}>
      {children}
    </span>
  );
};

export const Spinner = ({ className, size, ...props }) => (
  <div className={cn("animate-spin rounded-full border-2 border-current border-t-transparent", 
    size === "sm" ? "h-4 w-4" : "h-6 w-6", className)} {...props} />
);

// Media Components
export const Image = ({ src, alt, className, h, w, objectFit, ...props }) => {
  const heightClass = typeof h === "object" ? 
    `h-${h.base} md:h-${h.md}` :
    h ? `h-${h}` : "";

  const widthClass = typeof w === "object" ? 
    `w-${w.base} md:w-${w.md}` :
    w ? `w-${w}` : "";

  const objectFitClass = objectFit === "contain" ? "object-contain" :
                         objectFit === "cover" ? "object-cover" : "";

  return (
    <img 
      src={src} 
      alt={alt} 
      className={cn(heightClass, widthClass, objectFitClass, className)} 
      {...props} 
    />
  );
};

// Other Components
export const Icon = ({ as: IconComponent, className, color, ...props }) => {
  const colorClass = color === "#0088CD" ? "text-brand" : color ? `text-[${color}]` : "";
  
  return (
    <IconComponent className={cn(colorClass, className)} {...props} />
  );
};

export const Divider = ({ className, ...props }) => (
  <div className={cn("border-b border-border", className)} {...props} />
);

export const Select = ({ children, className, value, onChange, placeholder, bg, borderColor, color, ...props }) => {
  const bgClass = bg === "gray.700" ? "bg-secondary" : "";
  const borderClass = borderColor === "gray.600" ? "border-border" : "";
  const colorClass = color === "white" ? "text-foreground" : "";

  return (
    <select 
      value={value}
      onChange={onChange}
      className={cn(
        "flex h-10 w-full rounded-md border border-input px-3 py-2 text-sm ring-offset-background",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        "disabled:cursor-not-allowed disabled:opacity-50",
        bgClass, borderClass, colorClass, className
      )}
      {...props}
    >
      {placeholder && <option value="">{placeholder}</option>}
      {children}
    </select>
  );
};

export const Textarea = ({ className, placeholder, value, onChange, bg, borderColor, color, ...props }) => {
  const bgClass = bg === "gray.700" ? "bg-secondary" : "";
  const borderClass = borderColor === "gray.600" ? "border-border" : "";
  const colorClass = color === "white" ? "text-foreground" : "";

  return (
    <textarea
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className={cn(
        "flex min-h-[80px] w-full rounded-md border border-input px-3 py-2 text-sm ring-offset-background",
        "placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2",
        "focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        bgClass, borderClass, colorClass, className
      )}
      {...props}
    />
  );
};

export const Progress = ({ value, className, size, colorScheme, ...props }) => {
  const sizeClass = size === "sm" ? "h-2" : "h-3";
  const colorClass = colorScheme === "blue" ? "bg-blue-600" : "bg-primary";

  return (
    <div className={cn("w-full bg-secondary rounded-full overflow-hidden", sizeClass, className)} {...props}>
      <div 
        className={cn("h-full transition-all", colorClass)}
        style={{ width: `${value}%` }}
      />
    </div>
  );
};

// Field wrapper for form inputs
export const Field = ({ children, className, ...props }) => (
  <div className={cn("space-y-2", className)} {...props}>
    {children}
  </div>
);