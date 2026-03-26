"use client";

import * as React from "react";
import { cn } from "../../lib/utils";

interface ScrollAreaProps extends React.HTMLAttributes<HTMLDivElement> {

  viewportRef?: React.RefObject<HTMLDivElement>;

  maxHeight?: string | number;

  showScrollbars?: boolean;

  scrollable?: boolean;

  orientation?: "vertical" | "horizontal" | "both";

  smooth?: boolean;

  theme?: "default" | "minimal" | "none";
}

const ScrollArea = React.forwardRef<HTMLDivElement, ScrollAreaProps>(
  ({
    className,
    children,
    viewportRef,
    maxHeight,
    showScrollbars = true,
    scrollable = true,
    orientation = "vertical",
    smooth = false,
    theme = "default",
    ...props
  }, ref) => {
    const internalRef = React.useRef<HTMLDivElement>(null);
    const resolvedRef = viewportRef || internalRef;

    const style: React.CSSProperties = {
      maxHeight: maxHeight !== undefined ? typeof maxHeight === "number" ? `${maxHeight}px` : maxHeight : undefined,
      ...props.style
    };


    const orientationClasses = {
      vertical: "overflow-y-auto overflow-x-hidden",
      horizontal: "overflow-x-auto overflow-y-hidden",
      both: "overflow-auto"
    };


    const themeClasses = {
      default: "themed-scrollbar",
      minimal: "minimal-scrollbar",
      none: "scrollbar-none"
    };

    return (
      <div
        ref={ref}
        className={cn("relative overflow-hidden", className)}
        style={style}
        {...props}>
        
        <div
          ref={resolvedRef}
          className={cn(
            "h-full w-full rounded-[inherit]",
            scrollable ? orientationClasses[orientation] : "overflow-hidden",
            smooth && "scroll-smooth",
            showScrollbars ? themeClasses[theme] : "scrollbar-none"
          )}>
          
          {children}
        </div>
      </div>);

  }
);
ScrollArea.displayName = "ScrollArea";

interface ScrollBarProps extends React.HTMLAttributes<HTMLDivElement> {

  orientation?: "vertical" | "horizontal";

  size?: "thin" | "default" | "thick";

  visible?: boolean;
}

const ScrollBar = React.forwardRef<HTMLDivElement, ScrollBarProps>(
  ({
    className,
    orientation = "vertical",
    size = "default",
    visible = false,
    ...props
  }, ref) => {

    const sizeClasses = {
      thin: orientation === "vertical" ? "w-1" : "h-1",
      default: orientation === "vertical" ? "w-1.5" : "h-1.5",
      thick: orientation === "vertical" ? "w-2" : "h-2"
    };

    return (
      <div
        ref={ref}
        className={cn(
          "flex touch-none select-none transition-all",
          orientation === "vertical" ?
          `h-full ${sizeClasses[size]} border-l border-l-transparent p-[1px]` :
          `${sizeClasses[size]} flex-col border-t border-t-transparent p-[1px]`,
          visible ? "opacity-100" : "opacity-0 hover:opacity-100",
          className
        )}
        {...props}>
        
        <div className="relative flex-1 rounded-full bg-primary/50 hover:bg-primary transition-all duration-150" />
      </div>);

  }
);
ScrollBar.displayName = "ScrollBar";

export { ScrollArea, ScrollBar };