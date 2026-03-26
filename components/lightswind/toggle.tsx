"use client";

import * as React from "react";
import { cn } from "../../lib/utils";


const toggleVariants = {
  variant: {
    default: "bg-transparent",
    outline: "border   bg-transparent hover:bg-accent hover:text-accent-foreground"
  },
  size: {
    default: "h-10 px-3",
    sm: "h-9 px-2.5",
    lg: "h-11 px-5"
  }
};

export interface ToggleProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof toggleVariants.variant;
  size?: keyof typeof toggleVariants.size;
  pressed?: boolean;
  defaultPressed?: boolean;
  onPressedChange?: (pressed: boolean) => void;
}

const Toggle = React.forwardRef<HTMLButtonElement, ToggleProps>(
  ({
    className,
    variant = "default",
    size = "default",
    children,
    pressed,
    defaultPressed = false,
    onPressedChange,
    ...props
  }, ref) => {

    const [isPressed, setIsPressed] = React.useState(defaultPressed);


    const isControlled = pressed !== undefined;
    const dataState = isControlled ? pressed : isPressed;

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {

      if (!isControlled) {
        setIsPressed(!isPressed);
      }


      onPressedChange?.(!dataState);


      props.onClick?.(event);
    };

    return (
      <button
        ref={ref}
        type="button"
        aria-pressed={dataState}
        data-state={dataState ? "on" : "off"}
        className={cn(
          "inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors hover:bg-muted hover:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=on]:bg-accent data-[state=on]:text-accent-foreground",
          toggleVariants.variant[variant],
          toggleVariants.size[size],
          className
        )}
        onClick={handleClick}
        {...props}>
        
        {children}
      </button>);

  }
);
Toggle.displayName = "Toggle";

export { Toggle, toggleVariants };