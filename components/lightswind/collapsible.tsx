"use client";
import * as React from "react";
import { cn } from "../../lib/utils";
import { motion, AnimatePresence, HTMLMotionProps } from "framer-motion";

interface CollapsibleContextValue {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  disabled?: boolean;
}

const CollapsibleContext = React.createContext<
  CollapsibleContextValue | undefined>(
  undefined);

interface CollapsibleProps extends React.HTMLAttributes<HTMLDivElement> {
  open?: boolean;
  defaultOpen?: boolean;
  disabled?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const Collapsible = React.forwardRef<HTMLDivElement, CollapsibleProps>(
  (
  {
    children,
    open,
    defaultOpen = false,
    disabled = false,
    onOpenChange,
    className,
    ...props
  },
  ref) =>
  {
    const [isOpen, setIsOpen] = React.useState(defaultOpen);

    const isControlled = open !== undefined;
    const currentOpen = isControlled ? open : isOpen;

    const handleOpenChange = React.useCallback(
      (value: boolean) => {
        if (disabled) return;
        if (!isControlled) {
          setIsOpen(value);
        }
        onOpenChange?.(value);
      },
      [disabled, isControlled, onOpenChange]
    );

    return (
      <CollapsibleContext.Provider
        value={{ open: currentOpen!, onOpenChange: handleOpenChange, disabled }}>
        
               {" "}
        <div
          ref={ref}
          className={cn("", className)}
          data-state={currentOpen ? "open" : "closed"}
          data-disabled={disabled ? "" : undefined}
          {...props}>
          
                    {children}       {" "}
        </div>
             {" "}
      </CollapsibleContext.Provider>);

  }
);
Collapsible.displayName = "Collapsible";

interface CollapsibleTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
}

const CollapsibleTrigger = React.forwardRef<
  HTMLButtonElement,
  CollapsibleTriggerProps>(
  ({ className, children, asChild = false, ...props }, ref) => {
    const context = React.useContext(CollapsibleContext);
    if (!context) {
      throw new Error("CollapsibleTrigger must be used within a Collapsible");
    }

    const { open, onOpenChange, disabled } = context;

    const handleClick = () => {
      onOpenChange(!open);
    };

    if (asChild) {
      return (
        <>
                 {" "}
        {React.Children.map(children, (child) => {
            if (React.isValidElement(child)) {
              const childProps = child.props as Record<string, unknown>;
              return React.cloneElement(child, {
                ...childProps,
                ref,
                onClick: (e: React.MouseEvent) => {
                  handleClick();
                  if (typeof childProps.onClick === "function") {
                    childProps.onClick(e);
                  }
                },
                disabled: disabled || childProps.disabled,
                "data-state": open ? "open" : "closed",
                "data-disabled": disabled ? "" : undefined,
                "aria-expanded": open
              } as React.Attributes);
            }
            return child;
          })}
      </>);

    }

    return (
      <button
        ref={ref}
        type="button"
        disabled={disabled}
        onClick={handleClick}
        className={cn("", className)}
        data-state={open ? "open" : "closed"}
        data-disabled={disabled ? "" : undefined}
        aria-expanded={open}
        {...props}>
        
      {children}
    </button>);

  });
CollapsibleTrigger.displayName = "CollapsibleTrigger";


type OmittedHTMLAttributes = Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "onAnimationStart" |
  "onAnimationEnd" |
  "onAnimationIteration" |
  "onTransitionEnd" |
  "onDrag" |
  "onDragEnd" |
  "onDragEnter" |
  "onDragExit" |
  "onDragLeave" |
  "onDragOver" |
  "onDragStart" |
  "onDrop" |
  "onMouseDown" |
  "onMouseEnter" |
  "onMouseLeave" |
  "onMouseMove" |
  "onMouseOut" |
  "onMouseOver" |
  "onMouseUp" |
  "onTouchCancel" |
  "onTouchEnd" |
  "onTouchMove" |
  "onTouchStart" |
  "onPointerDown" |
  "onPointerMove" |
  "onPointerUp" |
  "onPointerCancel" |
  "onPointerEnter" |
  "onPointerLeave" |
  "onPointerOver" |
  "onPointerOut" |
  "onGotPointerCapture" |
  "onLostPointerCapture">;


interface CollapsibleContentProps extends OmittedHTMLAttributes {
  forceMount?: boolean;
}

const CollapsibleContent = React.forwardRef<
  HTMLDivElement,
  CollapsibleContentProps>(
  ({ className, children, forceMount, ...props }, ref) => {
    const context = React.useContext(CollapsibleContext);
    if (!context) {
      throw new Error("CollapsibleContent must be used within a Collapsible");
    }

    const { open } = context;
    const contentRef = React.useRef<HTMLDivElement>(null);


    React.useImperativeHandle(ref, () => contentRef.current!);

    return (
      <AnimatePresence initial={false}>
      {" "}
      {}       {" "}
      {(open || forceMount) &&
        <motion.div
          key="collapsible-content"
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          style={{ overflow: "hidden" }}




          className={cn(
            "overflow-hidden",
            className
          )}
          data-state={open ? "open" : "closed"}

          {...props as HTMLMotionProps<"div">}>
          
                     {" "}
          <div ref={contentRef} className="pb-4">
            {" "}
            {}
                          {children}           {" "}
          </div>
                   {" "}
        </motion.div>
        }
           {" "}
    </AnimatePresence>);

  });
CollapsibleContent.displayName = "CollapsibleContent";

export { Collapsible, CollapsibleTrigger, CollapsibleContent };