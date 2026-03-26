"use client";
import * as React from "react";
import { cn } from "../../lib/utils";
import { motion, AnimatePresence, Variants, Easing } from "framer-motion";


interface TooltipContextType {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  content: React.ReactNode;
  config: TooltipConfig;
  triggerRef: React.MutableRefObject<HTMLElement | null>;
}

interface TooltipConfig {
  side: "top" | "right" | "bottom" | "left";
  align: "center" | "start" | "end";
  sideOffset: number;
  variant: "default" | "info" | "success" | "warning" | "error";
  hideArrow: boolean;
  maxWidth: string | number;
}

const TooltipContext = React.createContext<TooltipContextType | undefined>(undefined);


interface TooltipProps {
  children: React.ReactNode;
  content: React.ReactNode;
  defaultOpen?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  delayDuration?: number;
  hideDelay?: number;
  side?: "top" | "right" | "bottom" | "left";
  align?: "center" | "start" | "end";
  sideOffset?: number;
  variant?: "default" | "info" | "success" | "warning" | "error";
  hideArrow?: boolean;
  maxWidth?: string | number;
  asChild?: boolean;
  disabled?: boolean;
}


const Tooltip: React.FC<TooltipProps> = ({
  children,
  content,
  defaultOpen = false,
  open: controlledOpen,
  onOpenChange,
  delayDuration = 300,
  hideDelay = 100,
  side = "top",
  align = "center",
  sideOffset = 8,
  variant = "default",
  hideArrow = false,
  maxWidth = "20rem",
  asChild = false,
  disabled = false
}) => {

  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(defaultOpen);


  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : uncontrolledOpen;


  const triggerRef = React.useRef<HTMLElement | null>(null);


  const setOpen = React.useCallback((value: boolean | ((prev: boolean) => boolean)) => {
    if (!isControlled) {
      setUncontrolledOpen(value);
    }
    if (onOpenChange) {

      const newValue = typeof value === "function" ? value(open) : value;
      onOpenChange(newValue);
    }
  }, [isControlled, onOpenChange, open]);


  const showTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const hideTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);


  const config = React.useMemo(() => ({
    side,
    align,
    sideOffset,
    variant,
    hideArrow,
    maxWidth
  }), [side, align, sideOffset, variant, hideArrow, maxWidth]);


  React.useEffect(() => {
    return () => {
      if (showTimeoutRef.current) clearTimeout(showTimeoutRef.current);
      if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
    };
  }, []);


  const contextValue = React.useMemo(() => ({
    open,
    setOpen,
    content,
    config,
    triggerRef
  }), [open, setOpen, content, config, triggerRef]);

  return (
    <TooltipContext.Provider value={contextValue}>
      {}
      <div className="relative inline-block">
        {disabled ? children :
        <TooltipTrigger
          delayDuration={delayDuration}
          hideDelay={hideDelay}
          asChild={asChild}
          triggerRef={triggerRef}>
          
            {children}
          </TooltipTrigger>
        }
        {}
        <TooltipContentDisplay />
      </div>
    </TooltipContext.Provider>);

};


interface TooltipTriggerProps {
  children: React.ReactNode;
  delayDuration: number;
  hideDelay: number;
  asChild?: boolean;
  triggerRef: React.MutableRefObject<HTMLElement | null>;
}


const TooltipTrigger = React.forwardRef<HTMLElement, TooltipTriggerProps>(
  ({ children, delayDuration, hideDelay, asChild = false, triggerRef }, ref) => {
    const context = React.useContext(TooltipContext);
    if (!context) {
      throw new Error("TooltipTrigger must be used within a Tooltip");
    }

    const { setOpen } = context;
    const showTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
    const hideTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);


    const handleMouseEnter = () => {
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
        hideTimeoutRef.current = null;
      }

      showTimeoutRef.current = setTimeout(() => {
        setOpen(true);
      }, delayDuration);
    };


    const handleMouseLeave = () => {
      if (showTimeoutRef.current) {
        clearTimeout(showTimeoutRef.current);
        showTimeoutRef.current = null;
      }

      hideTimeoutRef.current = setTimeout(() => {
        setOpen(false);
      }, hideDelay);
    };


    const combinedRef = React.useCallback((node: HTMLElement | null) => {
      if (typeof ref === 'function') {
        ref(node);
      } else if (ref) {
        (ref as React.MutableRefObject<HTMLElement | null>).current = node;
      }
      triggerRef.current = node;
    }, [ref, triggerRef]);


    const triggerProps = {
      ref: combinedRef,
      onMouseEnter: handleMouseEnter,
      onMouseLeave: handleMouseLeave,
      onFocus: handleMouseEnter,
      onBlur: handleMouseLeave
    };


    if (asChild && React.isValidElement(children)) {
      return React.cloneElement(children, triggerProps);
    }


    return (
      <div
        className="inline-block relative"
        {...triggerProps}>
        
        {children}
      </div>);

  }
);
TooltipTrigger.displayName = "TooltipTrigger";



const TooltipContentDisplay = () => {
  const context = React.useContext(TooltipContext);
  if (!context) {
    throw new Error("TooltipContentDisplay must be used within a Tooltip");
  }

  const { open, content, config, triggerRef } = context;
  const [position, setPosition] = React.useState({ x: 0, y: 0 });
  const contentRef = React.useRef<HTMLDivElement | null>(null);


  const getAnimationVariants = React.useCallback((): Variants => {
    const { side } = config;
    const distance = 5;

    return {
      hidden: {
        opacity: 0,
        x: side === 'left' ? distance : side === 'right' ? -distance : 0,
        y: side === 'top' ? distance : side === 'bottom' ? -distance : 0
      },
      visible: {
        opacity: 1,
        x: 0,
        y: 0,
        transition: { duration: 0.15, ease: "easeOut" as Easing }
      },
      exit: {
        opacity: 0,
        transition: { duration: 0.1, ease: "easeIn" as Easing }
      }
    };
  }, [config]);



  const updatePosition = React.useCallback(() => {
    if (!contentRef.current || !triggerRef.current) return;

    const triggerRect = triggerRef.current.getBoundingClientRect();
    const contentRect = contentRef.current.getBoundingClientRect();


    const parentRect = contentRef.current.parentElement!.getBoundingClientRect();


    let x = 0;
    let y = 0;
    const { side, align, sideOffset } = config;


    switch (side) {
      case "top":
        y = triggerRect.top - contentRect.height - sideOffset;
        break;
      case "bottom":
        y = triggerRect.bottom + sideOffset;
        break;
      case "left":
        x = triggerRect.left - contentRect.width - sideOffset;
        break;
      case "right":
        x = triggerRect.right + sideOffset;
        break;
    }


    if (side === "top" || side === "bottom") {
      switch (align) {
        case "start":
          x = triggerRect.left;
          break;
        case "end":
          x = triggerRect.right - contentRect.width;
          break;
        default:
          x = triggerRect.left + triggerRect.width / 2 - contentRect.width / 2;
          break;
      }
    } else if (side === "left" || side === "right") {
      switch (align) {
        case "start":
          y = triggerRect.top;
          break;
        case "end":
          y = triggerRect.bottom - contentRect.height;
          break;
        default:
          y = triggerRect.top + triggerRect.height / 2 - contentRect.height / 2;
          break;
      }
    }



    setPosition({
      x: x - parentRect.left,
      y: y - parentRect.top
    });
  }, [config, triggerRef]);


  React.useEffect(() => {
    if (open) {


      const id = requestAnimationFrame(updatePosition);


      window.addEventListener('resize', updatePosition);
      return () => {
        cancelAnimationFrame(id);
        window.removeEventListener('resize', updatePosition);
      };
    }
  }, [open, updatePosition]);


  const getArrowStyle = React.useCallback(() => {
    const { side, align } = config;
    const arrowSize = 8;
    let style: React.CSSProperties = {
      position: 'absolute',
      width: arrowSize,
      height: arrowSize,
      transform: 'rotate(45deg)',
      zIndex: -1
    };


    switch (side) {
      case "top":
        style.bottom = -arrowSize / 2;
        if (align === 'center') style.left = '50%';else
        if (align === 'start') style.left = '10%';else
        style.right = '10%';
        break;
      case "bottom":
        style.top = -arrowSize / 2;
        if (align === 'center') style.left = '50%';else
        if (align === 'start') style.left = '10%';else
        style.right = '10%';
        break;
      case "left":
        style.right = -arrowSize / 2;
        if (align === 'center') style.top = '50%';else
        if (align === 'start') style.top = '10%';else
        style.bottom = '10%';
        break;
      case "right":
        style.left = -arrowSize / 2;
        if (align === 'center') style.top = '50%';else
        if (align === 'start') style.top = '10%';else
        style.bottom = '10%';
        break;
    }

    if (align !== 'center') {
      if (side === 'top' || side === 'bottom') {
        style.transformOrigin = align === 'start' ? 'left center' : 'right center';
        if (align === 'start') style.transform = 'translateX(50%) rotate(45deg)';else
        style.transform = 'translateX(-50%) rotate(45deg)';
      } else {
        style.transformOrigin = align === 'start' ? 'top center' : 'bottom center';
        if (align === 'start') style.transform = 'translateY(50%) rotate(45deg)';else
        style.transform = 'translateY(-50%) rotate(45deg)';
      }
    }

    return style;
  }, [config]);



  const getVariantClasses = React.useCallback(() => {
    const { variant } = config;

    switch (variant) {
      case 'info':
        return 'bg-blue-500 text-white';
      case 'success':
        return 'bg-green-500 text-white';
      case 'warning':
        return 'bg-yellow-500 text-black';
      case 'error':
        return 'bg-red-500 text-white';
      default:
        return 'bg-popover text-popover-foreground border border-gray-200 dark:border-gray-700';
    }
  }, [config]);


  if (!open) return null;

  return (
    <AnimatePresence>
      {}
      <motion.div
        ref={contentRef}
        style={{
          position: 'absolute',
          top: position.y,
          left: position.x,
          maxWidth: config.maxWidth
        }}
        initial="hidden"
        animate="visible"
        exit="exit"
        variants={getAnimationVariants()}
        className={cn(
          "z-50 rounded px-3 py-1.5 text-xs shadow-md",
          getVariantClasses()
        )}>
        
        {!config.hideArrow &&
        <div
          className={cn(
            "w-2 h-2 absolute",
            getVariantClasses(),
            "before:content-[''] before:absolute before:inset-0 before:bg-inherit before:rounded-sm"
          )}
          style={getArrowStyle()} />

        }
        {content}
      </motion.div>
    </AnimatePresence>);

};


export { Tooltip, TooltipTrigger };


export const Tooltips = Tooltip;


export const TooltipContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  (props, _ref) => {
    console.warn("TooltipContent is deprecated. Use the Tooltip component with content prop instead.");
    return <div {...props} />;
  }
);
TooltipContent.displayName = "TooltipContent";


export const TooltipProvider: React.FC<{children: React.ReactNode;}> = ({ children }) => {
  return <>{children}</>;
};