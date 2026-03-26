
import * as React from "react";
import { cn } from "../../lib/utils";

interface AspectRatioProps extends React.HTMLAttributes<HTMLDivElement> {

  ratio?: number;

  preset?: "square" | "video" | "portrait" | "widescreen" | "ultrawide" | "golden";

  rounded?: boolean;

  bordered?: boolean;

  objectFit?: "cover" | "contain" | "fill" | "none" | "scale-down";
}

const AspectRatio = React.forwardRef<HTMLDivElement, AspectRatioProps>(
  ({
    className,
    ratio: propRatio,
    preset,
    rounded = false,
    bordered = false,
    objectFit,
    style,
    ...props
  }, ref) => {

    const presetRatios = {
      square: 1,
      video: 16 / 9,
      portrait: 3 / 4,
      widescreen: 16 / 9,
      ultrawide: 21 / 9,
      golden: 1.618
    };


    const ratio = propRatio || (preset ? presetRatios[preset] : 1);

    return (
      <div
        ref={ref}
        style={{
          position: "relative",
          width: "100%",
          paddingBottom: `${1 / ratio * 100}%`,
          ...style
        }}
        className={cn(
          "overflow-hidden",
          rounded && "rounded-md",
          bordered && "border  ",
          className
        )}
        {...props}>
        
        {props.children &&
        <div
          className={cn(
            "absolute inset-0 h-full w-full",
            objectFit && `[&>img]:object-${objectFit} [&>video]:object-${objectFit}`
          )}>
          
            {props.children}
          </div>
        }
      </div>);

  }
);
AspectRatio.displayName = "AspectRatio";

export { AspectRatio };