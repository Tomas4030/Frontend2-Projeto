"use client";
import * as React from "react";
import { createPortal } from "react-dom";
import { cn } from "../../lib/utils";
import { X } from "lucide-react";
import { motion, AnimatePresence, HTMLMotionProps } from "framer-motion";

interface DrawerContextValue {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const DrawerContext = React.createContext<DrawerContextValue | undefined>(
  undefined
);

function useDrawerContext() {
  const context = React.useContext(DrawerContext);
  if (!context) {
    throw new Error("useDrawerContext must be used within a Drawer");
  }
  return context;
}

interface DrawerProps {
  children: React.ReactNode;
  defaultOpen?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const Drawer = ({
  children,
  defaultOpen = false,
  open: controlledOpen,
  onOpenChange
}: DrawerProps) => {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(defaultOpen);

  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : uncontrolledOpen;

  const setOpen = React.useCallback(
    (value: React.SetStateAction<boolean>) => {
      if (!isControlled) {
        setUncontrolledOpen(value);
      }

      if (onOpenChange) {
        const nextValue = typeof value === "function" ? value(open) : value;
        onOpenChange(nextValue);
      }
    },
    [isControlled, onOpenChange, open]
  );

  return (
    <DrawerContext.Provider value={{ open, setOpen }}>
      {children}
    </DrawerContext.Provider>);

};

interface DrawerTriggerProps extends
  React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
}

const DrawerTrigger = React.forwardRef<HTMLButtonElement, DrawerTriggerProps>(
  ({ children, ...props }, ref) => {
    const { setOpen } = useDrawerContext();

    return (
      <button ref={ref} type="button" onClick={() => setOpen(true)} {...props}>
        {children}
      </button>);

  }
);
DrawerTrigger.displayName = "DrawerTrigger";


type OmittedDrawerContentHTMLAttributes = Omit<
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


interface DrawerContentProps extends OmittedDrawerContentHTMLAttributes {

  className?: string;
}

const DrawerContent = React.forwardRef<HTMLDivElement, DrawerContentProps>(
  ({ children, className, ...props }, ref) => {
    const { open, setOpen } = useDrawerContext();


    return createPortal(
      <AnimatePresence>
        {open &&
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-end mx-auto">
            {}
            <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm "
            onClick={() => setOpen(false)}
            aria-hidden="true" />
          

            {}
            <motion.div
            ref={ref}
            initial={{ y: "100%" }}
            animate={{ y: "0%" }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className={cn(
              "relative z-50 w-full mx-auto rounded-t-md bg-background shadow-lg",
              className
            )}
            role="dialog"
            aria-modal="true"
            {...props as HTMLMotionProps<"div">}>
            
              <div className="mx-auto my-2 h-1.5 w-16 rounded-full bg-muted" />
              {children}
              <button
              onClick={() => setOpen(false)}
              className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none"
              aria-label="Close drawer">
              
                <X className="h-4 w-4" />
                <span className="sr-only">Close drawer</span>
              </button>
            </motion.div>
          </div>
        }
      </AnimatePresence>,
      document.body
    );
  }
);
DrawerContent.displayName = "DrawerContent";


const DrawerClose = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>>(
  ({ children, ...props }, ref) => {
    const { setOpen } = useDrawerContext();

    return (
      <button ref={ref} type="button" onClick={() => setOpen(false)} {...props}>
      {children}
    </button>);

  });
DrawerClose.displayName = "DrawerClose";

const DrawerHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) =>
<div
  className={cn(
    "flex flex-col space-y-2 text-center sm:text-left p-4",
    className
  )}
  {...props} />;


DrawerHeader.displayName = "DrawerHeader";

const DrawerFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) =>
<div
  className={cn(
    "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 p-4",
    className
  )}
  {...props} />;


DrawerFooter.displayName = "DrawerFooter";

const DrawerTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) =>
  <h3
    ref={ref}
    className={cn("text-lg font-semibold text-foreground", className)}
    {...props} />

);
DrawerTitle.displayName = "DrawerTitle";

const DrawerDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) =>
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props} />

);
DrawerDescription.displayName = "DrawerDescription";

export {
  Drawer,
  DrawerTrigger,
  DrawerContent,
  DrawerClose,
  DrawerHeader,
  DrawerFooter,
  DrawerTitle,
  DrawerDescription };