"use client";
import { motion, Easing } from "framer-motion";
import { cn } from "../../lib/utils";
import { useState, useEffect } from "react";

interface TopStickyBarProps {




  show?: boolean;





  showOnScroll?: boolean;




  scrollThreshold?: number;



  children: React.ReactNode;




  className?: string;




  duration?: number;




  ease?: Easing | Easing[];




  initialY?: number;




  visibleY?: number;




  hiddenY?: number;
}

const TopStickyBar = ({
  show: externalShow = false,
  showOnScroll = false,
  scrollThreshold = 200,
  children,
  className,
  duration = 0.4,
  ease = "easeInOut",
  initialY = -50,
  visibleY = 0,
  hiddenY = -50
}: TopStickyBarProps) => {
  const [internalShow, setInternalShow] = useState(externalShow);


  useEffect(() => {
    if (!showOnScroll) {
      setInternalShow(externalShow);
      return;
    }

    const handleScroll = () => {
      if (window.scrollY > scrollThreshold) {
        setInternalShow(true);
      } else {
        setInternalShow(false);
      }
    };

    window.addEventListener("scroll", handleScroll);

    handleScroll();

    return () => window.
    removeEventListener("scroll", handleScroll);
  }, [showOnScroll, scrollThreshold, externalShow]);


  const finalShow = showOnScroll ? internalShow : externalShow;

  return (
    <motion.div
      initial={{ y: initialY, opacity: 0 }}
      animate={{
        y: finalShow ? visibleY : hiddenY,
        opacity: finalShow ? 1 : 0
      }}
      transition={{ duration, ease }}
      className={cn(
        "fixed top-0 left-0 w-full z-[60] bg-gray-800 text-white py-1 text-sm text-center shadow-md",
        className
      )}>
      
      {children}
    </motion.div>);

};

export default TopStickyBar;