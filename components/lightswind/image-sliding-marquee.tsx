"use client";
import React, { useRef, useEffect } from "react";
import { motion, useAnimationFrame } from "framer-motion";

interface ImageMarqueeProps {
  images: string[];
  speed?: number;
  direction?: "left" | "right";
  imageWidth?: string;
  imageHeight?: string;
  imageMarginX?: string;
}

const ImageMarquee: React.FC<ImageMarqueeProps> = ({
  images,
  speed = 50,
  direction = "left",

  imageWidth = "w-[240px] sm:w-[300px] md:w-[360px]",

  imageHeight = "h-[160px] sm:h-[200px] md:h-[240px]",

  imageMarginX = "mx-1 sm:mx-2"
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const x = useRef(0);


  useEffect(() => {
    if (containerRef.current) {
      const initialScrollWidth = containerRef.current.scrollWidth;
      if (initialScrollWidth > 0) {
        const singleSetWidth = initialScrollWidth / 2;
        if (direction === "right") {
          x.current = -singleSetWidth;
        } else {
          x.current = 0;
        }

        containerRef.current.style.transform = `translateX(${x.current}px)`;
      }
    }
  }, [direction, images]);

  useAnimationFrame((t, delta) => {
    if (containerRef.current) {
      const fullContentWidth = containerRef.current.scrollWidth;


      if (fullContentWidth === 0) return;

      const singleSetWidth = fullContentWidth / 2;
      const moveBy = speed * delta / 1000;

      if (direction === "left") {
        x.current -= moveBy;

        if (x.current <= -singleSetWidth) {
          x.current = 0;
        }
      } else {

        x.current += moveBy;


        if (x.current >= 0) {
          x.current = -singleSetWidth;
        }
      }

      containerRef.current.style.transform = `translateX(${x.current}px)`;
    }
  });

  const allImages = [...images, ...images];

  return (
    <div className=" w-full relative">
      <div
        ref={containerRef}
        className="flex w-max"
        style={{
          willChange: "transform"
        }}>
        
        {allImages.map((src, idx) =>
        <div
          key={idx}
          className={`${imageWidth} ${imageHeight} ${imageMarginX} flex-shrink-0 
    transform hover:scale-125 transition-transform duration-300 
    border border-white/20 hover:border-blue-500/40 p-2 
    rounded-xl shadow-lg backdrop-blur-md 
    bg-gray-200/60 dark:bg-white/5`}>
          
            <motion.img
            src={src}
            alt={`marquee-image-${idx}`}

            className="w-full h-full object-contain rounded-xl shadow-lg bg-black"
            draggable={false} />
          
          </div>
        )}
      </div>
    </div>);

};

export default ImageMarquee;