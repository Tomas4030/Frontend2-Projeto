
import { cn } from "../../lib/utils";
import * as React from "react";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {

  variant?: "default" | "circle" | "rounded" | "square";

  width?: string | number;

  height?: string | number;

  animation?: "pulse" | "wave" | "none";

  shimmer?: boolean;

  count?: number;
}

function Skeleton({
  className,
  variant = "default",
  width,
  height,
  animation = "pulse",
  shimmer = false,
  count = 1,
  ...props
}: SkeletonProps) {

  const variantClasses = {
    default: "rounded-md",
    circle: "rounded-full",
    rounded: "rounded-xl",
    square: "rounded-none"
  };


  const animationClasses = {
    pulse: "animate-pulse",
    wave: "animate-shimmer",
    none: ""
  };


  const style: React.CSSProperties = {
    width: width !== undefined ? typeof width === "number" ? `${width}px` : width : undefined,
    height: height !== undefined ? typeof height === "number" ? `${height}px` : height : undefined,
    ...props.style
  };


  if (count > 1) {
    return (
      <div className={cn("flex flex-col gap-2", className)} {...props}>
        {Array.from({ length: count }).map((_, index) =>
        <div
          key={index}
          className={cn(
            "bg-muted relative overflow-hidden",
            variantClasses[variant],
            animationClasses[animation],
            shimmer && "before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent"
          )}
          style={style} />

        )}
      </div>);

  }

  return (
    <div
      className={cn(
        "bg-primary/20 relative overflow-hidden",
        variantClasses[variant],
        animationClasses[animation],
        shimmer && "before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent",
        className
      )}
      style={style}
      {...props} />);


}


function TemplateCardSkeleton() {
  return (
    <div className="rounded-lg border   bg-card overflow-hidden shadow-sm">
      <div className="space-y-3">
        {}
        <Skeleton className="h-48 w-full rounded-t-lg rounded-b-none" shimmer />
        
        {}
        <div className="p-4 space-y-3">
          {}
          <Skeleton className="h-6 w-3/4" shimmer />
          
          {}
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" shimmer />
            <Skeleton className="h-4 w-5/6" shimmer />
          </div>
          
          {}
          <div className="flex flex-wrap gap-2 pt-2">
            <Skeleton className="h-5 w-16 rounded-full" shimmer />
            <Skeleton className="h-5 w-20 rounded-full" shimmer />
            <Skeleton className="h-5 w-14 rounded-full" shimmer />
          </div>
          
          {}
          <div className="flex justify-between items-center pt-3">
            <Skeleton className="h-6 w-20" shimmer />
            <Skeleton className="h-9 w-28 rounded-md" shimmer />
          </div>
        </div>
      </div>
    </div>);

}

export { Skeleton, TemplateCardSkeleton };