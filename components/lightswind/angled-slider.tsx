"use client";

import React, { useRef, useEffect, useState } from "react";
import {
  motion,
  useAnimation,
  useMotionValue,
  animate,
  Variants } from
"framer-motion";
import { cn } from "@/lib/utils";
import Image from "next/image";

interface AngledSliderProps {



  items: {
    id: string | number;
    url: string;
    alt?: string;
    title?: string;
  }[];




  speed?: number;




  direction?: "left" | "right";




  containerHeight?: string;




  cardWidth?: string;




  gap?: string;




  angle?: number;




  hoverScale?: number;
  className?: string;
}

const cardVariants: Variants = {
  offHover: (angle: number) => ({
    rotateY: angle,
    z: 60,
    opacity: 0.9,
    scale: 1,
    zIndex: 30,
    transition: {
      type: "spring",
      mass: 3,
      stiffness: 400,
      damping: 50
    }
  }),
  onHover: (hoverScale: number) => ({
    rotateY: 0,
    z: 120,
    opacity: 1,
    scale: hoverScale,
    zIndex: 50,
    transition: {
      type: "spring",
      mass: 3,
      stiffness: 400,
      damping: 50
    }
  })
};

const AngledCard = ({
  item,
  angle,
  hoverScale,
  cardWidth





}: {item: any;angle: number;hoverScale: number;cardWidth: string;}) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      className="relative flex-shrink-0 group overflow-visible cursor-pointer"
      style={{
        width: cardWidth,
        height: "100%",
        transformStyle: "preserve-3d"
      }}
      custom={isHovered ? hoverScale : angle}
      variants={cardVariants}
      initial="offHover"
      animate={isHovered ? "onHover" : "offHover"}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}>
      
      {}
      <div
        className="relative h-full w-full overflow-hidden border border-white/10 bg-muted 
            min-h-[300px] shadow-2xl">

        
        <Image
          src={item.url}
          alt={item.alt || "Slider Image"}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-110" />
        
        {}
        {item.title &&
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100">
            <h3 className="text-lg font-bold">{item.title}</h3>
          </div>
        }
      </div>
    </motion.div>);

};

export const AngledSlider = ({
  items,
  speed = 40,
  direction = "left",
  containerHeight = "400px",
  cardWidth = "300px",
  gap = "40px",
  angle = 20,
  hoverScale = 1.05,
  className
}: AngledSliderProps) => {
  const [width, setWidth] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const x = useMotionValue(0);
  const [isHovered, setIsHovered] = useState(false);



  const duplicatedItems = [...items, ...items, ...items];

  useEffect(() => {
    const calculateWidth = () => {


      const numWidth = parseInt(
        cardWidth?.toString().replace("px", "") || "300"
      );
      const numGap = parseInt(gap?.toString().replace("px", "") || "40");

      if (!isNaN(numWidth) && !isNaN(numGap)) {
        const calculatedWidth = (numWidth + numGap) * items.length;
        setWidth(calculatedWidth);
      } else if (containerRef.current) {
        const scrollWidth = containerRef.current.scrollWidth;
        setWidth(scrollWidth / 3);
      }
    };

    calculateWidth();
    window.addEventListener("resize", calculateWidth);
    return () => window.removeEventListener("resize", calculateWidth);
  }, [items, cardWidth, gap]);

  useEffect(() => {
    if (width <= 0) return;

    const startX = direction === "left" ? 0 : -width;
    const endX = direction === "left" ? -width : 0;

    if (isHovered) return;

    const runAnimation = () => {
      const currentX = x.get();
      const totalDist = width;
      const dist = Math.abs(endX - currentX);
      const duration = speed * (dist / totalDist);

      const controls = animate(x, endX, {
        duration: duration,
        ease: "linear",
        onComplete: () => {
          x.set(startX);
          runAnimation();
        }
      });
      return controls;
    };

    const animation = runAnimation();

    return () => {
      animation.stop();
    };
  }, [width, speed, direction, isHovered, x]);

  return (
    <div
      className={cn(
        "relative w-full overflow-hidden bg-background py-10 perspective-1000",
        className
      )}
      style={{
        height: containerHeight,
        perspective: "1000px"
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}>
      
      <motion.div
        ref={containerRef}
        className="flex items-center"
        style={{ x, gap, transformStyle: "preserve-3d" }}>
        
        {duplicatedItems.map((item, index) =>
        <AngledCard
          key={`${item.id}-${index}`}
          item={item}
          angle={angle}
          hoverScale={hoverScale}
          cardWidth={cardWidth} />

        )}
      </motion.div>
    </div>);

};