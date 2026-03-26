"use client";
import * as React from "react";
import { cn } from "../../lib/utils";

interface SliderProps {
  defaultValue?: number[];
  value?: number[];
  min?: number;
  max?: number;
  step?: number;
  onValueChange?: (value: number[]) => void;
  disabled?: boolean;
  className?: string;
  showTooltip?: boolean;
  showLabels?: boolean;
  thumbClassName?: string;
  trackClassName?: string;
}

const Slider = React.forwardRef<HTMLDivElement, SliderProps & Omit<React.HTMLAttributes<HTMLDivElement>, keyof SliderProps>>(
  ({
    className,
    defaultValue = [0],
    value,
    min = 0,
    max = 100,
    step = 1,
    onValueChange,
    disabled = false,
    showTooltip = false,
    showLabels = false,
    thumbClassName = "",
    trackClassName = "",
    ...props
  }, ref) => {

    const [values, setValues] = React.useState<number[]>(value !== undefined ? value : defaultValue);

    const [draggingIndex, setDraggingIndex] = React.useState<number | null>(null);

    const [tooltipHoverVisible, setTooltipHoverVisible] = React.useState<boolean>(false);


    const trackRef = React.useRef<HTMLDivElement>(null);


    React.useEffect(() => {
      if (value !== undefined) {
        setValues(value);
      }
    }, [value]);






    const getValuePercent = React.useCallback((val: number) => {
      return (val - min) / (max - min) * 100;
    }, [min, max]);







    const getValueFromClientX = React.useCallback((clientX: number) => {
      const trackRect = trackRef.current?.getBoundingClientRect();
      if (!trackRect) return min;


      const position = clientX - trackRect.left;

      const clampedPosition = Math.max(0, Math.min(trackRect.width, position));


      const percent = clampedPosition / trackRect.width;

      let rawValue = min + percent * (max - min);


      if (step > 0) {
        rawValue = Math.round(rawValue / step) * step;
      }


      return Math.max(min, Math.min(max, rawValue));
    }, [min, max, step]);







    const handlePointerDown = React.useCallback((e: React.PointerEvent, index: number) => {
      if (disabled) return;
      e.preventDefault();

      setDraggingIndex(index);



      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    }, [disabled]);




    const handlePointerMove = React.useCallback((e: PointerEvent) => {
      if (draggingIndex === null || !trackRef.current) return;

      const newValue = getValueFromClientX(e.clientX);

      setValues((prevValues) => {
        const newValues = [...prevValues];
        newValues[draggingIndex] = newValue;


        if (newValues.length > 1) {
          newValues.sort((a, b) => a - b);
        }
        return newValues;
      });




      onValueChange?.([...values].map((val, idx) => idx === draggingIndex ? newValue : val).sort((a, b) => a - b));

    }, [draggingIndex, getValueFromClientX, onValueChange, values]);





    const handlePointerUp = React.useCallback((e: PointerEvent) => {
      if (draggingIndex !== null) {

        (e.target as HTMLElement).releasePointerCapture(e.pointerId);
      }

      setDraggingIndex(null);

      onValueChange?.(values);
    }, [draggingIndex, onValueChange, values]);



    React.useEffect(() => {
      if (draggingIndex !== null) {
        document.addEventListener("pointermove", handlePointerMove);
        document.addEventListener("pointerup", handlePointerUp);
      } else {
        document.removeEventListener("pointermove", handlePointerMove);
        document.removeEventListener("pointerup", handlePointerUp);
      }

      return () => {
        document.removeEventListener("pointermove", handlePointerMove);
        document.removeEventListener("pointerup", handlePointerUp);
      };
    }, [draggingIndex, handlePointerMove, handlePointerUp]);






    const handleTrackClick = React.useCallback((e: React.MouseEvent) => {
      if (disabled || draggingIndex !== null) return;

      const newValue = getValueFromClientX(e.clientX);


      const closestThumbIndex = values.reduce((closestIdx, currentValue, idx) => {
        const closestDiff = Math.abs(values[closestIdx] - newValue);
        const currentDiff = Math.abs(currentValue - newValue);
        return currentDiff < closestDiff ? idx : closestIdx;
      }, 0);

      setValues((prevValues) => {
        const newValues = [...prevValues];
        newValues[closestThumbIndex] = newValue;
        if (newValues.length > 1) {
          newValues.sort((a, b) => a - b);
        }
        return newValues;
      });

      onValueChange?.(values);
    }, [disabled, draggingIndex, getValueFromClientX, onValueChange, values]);







    const handleKeyDown = React.useCallback((e: React.KeyboardEvent, index: number) => {
      if (disabled) return;

      let newValue = values[index];
      const effectiveStep = step > 0 ? step : (max - min) / 100;
      const largeStep = (max - min) / 10;

      switch (e.key) {
        case "ArrowRight":
        case "ArrowUp":
          newValue = Math.min(max, newValue + effectiveStep);
          break;
        case "ArrowLeft":
        case "ArrowDown":
          newValue = Math.max(min, newValue - effectiveStep);
          break;
        case "PageUp":
          newValue = Math.min(max, newValue + largeStep);
          break;
        case "PageDown":
          newValue = Math.max(min, newValue - largeStep);
          break;
        case "Home":
          newValue = min;
          break;
        case "End":
          newValue = max;
          break;
        default:
          return;
      }

      setValues((prevValues) => {
        const newValues = [...prevValues];
        newValues[index] = newValue;
        if (newValues.length > 1) {
          newValues.sort((a, b) => a - b);
        }
        return newValues;
      });

      onValueChange?.(values);
      e.preventDefault();
    }, [disabled, values, min, max, step, onValueChange]);


    const handleThumbMouseEnter = React.useCallback(() => {
      if (!disabled) {
        setTooltipHoverVisible(true);
      }
    }, [disabled]);

    const handleThumbMouseLeave = React.useCallback(() => {
      setTooltipHoverVisible(false);
    }, []);

    return (
      <div
        ref={ref}
        className={cn(
          "relative flex w-full touch-none select-none items-center h-8",
          disabled && "opacity-50 cursor-not-allowed",
          className
        )}
        {...props}>
        
        {showLabels &&
        <div className="absolute w-full flex justify-between text-xs text-muted-foreground -top-2"> {}
            <span>{min}</span>
            <span>{max}</span>
          </div>
        }

        <div
          ref={trackRef}
          className={cn(
            "relative h-2 w-full grow overflow-hidden rounded-full bg-secondary",
            trackClassName
          )}
          onClick={handleTrackClick}>
          
          {}
          {values.length === 1 &&
          <div
            className="absolute h-full bg-primary rounded-full transition-all duration-100 ease-out"
            style={{
              left: 0,
              width: `${getValuePercent(values[0])}%`
            }} />

          }

          {}
          {values.length > 1 &&
          <div
            className="absolute h-full bg-primary rounded-full transition-all duration-100 ease-out"
            style={{
              left: `${getValuePercent(Math.min(...values))}%`,
              width: `${getValuePercent(Math.max(...values)) - getValuePercent(Math.min(...values))}%`
            }} />

          }
        </div>

        {}
        {showTooltip && values.map((value, index) =>
        <div
          key={`tooltip-${index}`}
          className={cn(
            "absolute z-10 flex items-center justify-center",

            tooltipHoverVisible || draggingIndex === index ? "opacity-100" : "opacity-0",
            "transition-opacity duration-200",
            "pointer-events-none -top-8"
          )}
          style={{
            left: `${getValuePercent(value)}%`,
            transform: "translateX(-50%)"
          }}>
          
            <div className="px-2 py-1 text-xs font-semibold text-white dark:text-black bg-primary rounded shadow-sm whitespace-nowrap">
              {Math.round(value * 100) / 100}
            </div>
          </div>
        )}

        {}
        {values.map((value, index) =>
        <div
          key={`thumb-${index}`}
          className={cn(
            "absolute block h-5 w-5 rounded-full border-2 border-primary bg-background shadow-sm",

            "transition-all duration-[50ms] ease-out",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            "hover:scale-110",
            draggingIndex === index && "scale-110 cursor-grabbing",
            disabled ? "cursor-not-allowed" : "cursor-grab",
            thumbClassName
          )}
          style={{
            left: `${getValuePercent(value)}%`,
            top: "50%",
            transform: "translate(-50%, -50%)",
            touchAction: "none"
          }}
          onPointerDown={(e) => handlePointerDown(e, index)}
          onMouseEnter={handleThumbMouseEnter}
          onMouseLeave={handleThumbMouseLeave}
          onKeyDown={(e) => handleKeyDown(e, index)}
          role="slider"
          aria-valuemin={min}
          aria-valuemax={max}
          aria-valuenow={value}
          tabIndex={disabled ? -1 : 0}
          data-disabled={disabled ? "" : undefined} />

        )}
      </div>);

  }
);
Slider.displayName = "Slider";

export { Slider };