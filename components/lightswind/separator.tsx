
import * as React from "react";
import { cn } from "../../lib/utils";

interface SeparatorProps extends React.HTMLAttributes<HTMLDivElement> {

  orientation?: "horizontal" | "vertical";

  decorative?: boolean;

  thickness?: "thin" | "default" | "thick";

  lineStyle?: "solid" | "dashed" | "dotted";

  variant?: "default" | "muted" | "accent" | "primary";
}

const Separator = React.forwardRef<HTMLDivElement, SeparatorProps>(
  ({
    className,
    orientation = "horizontal",
    decorative = true,
    thickness = "default",
    lineStyle = "solid",
    variant = "default",
    ...props
  }, ref) => {

    const thicknessClasses = {
      thin: orientation === "horizontal" ? "h-px" : "w-px",
      default: orientation === "horizontal" ? "h-[1px]" : "w-[1px]",
      thick: orientation === "horizontal" ? "h-0.5" : "w-0.5"
    };


    const styleClasses = {
      solid: "border-0",
      dashed: lineStyle === "dashed" ? orientation === "horizontal" ? "border-t-0 border-l-0 border-r-0 border-b border-dashed" : "border-t-0 border-b-0 border-r-0 border-l border-dashed" : "",
      dotted: lineStyle === "dotted" ? orientation === "horizontal" ? "border-t-0 border-l-0 border-r-0 border-b border-dotted" : "border-t-0 border-b-0 border-r-0 border-l border-dotted" : ""
    };


    const variantClasses = {
      default: "bg-primary/20",
      muted: "bg-muted",
      accent: "bg-accent",
      primary: "bg-primary/20"
    };

    return (
      <div
        ref={ref}
        role={decorative ? "none" : "separator"}
        aria-orientation={decorative ? undefined : orientation}
        className={cn(
          "shrink-0",
          thicknessClasses[thickness],
          orientation === "horizontal" ? "w-full" : "h-full",
          variantClasses[variant],
          styleClasses[lineStyle],
          className
        )}
        {...props} />);


  }
);
Separator.displayName = "Separator";

export { Separator };