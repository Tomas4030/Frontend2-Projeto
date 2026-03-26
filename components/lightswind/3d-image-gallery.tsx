"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  motion,
  AnimatePresence,
  useMotionValue } from
"framer-motion";


export interface Image3DGalleryProps {
  images?: string[];
  width?: number;
  height?: number;
  spacing?: number;
  rotationAngle?: number;
  borderRadius?: number;
  autoRotate?: boolean;
  autoRotateSpeed?: number;
  className?: string;
  style?: React.CSSProperties;
  onImageClick?: (index: number) => void;
}





const ThreeDImageGallery: React.FC<Image3DGalleryProps> = ({

  images = [
  "https://images.pexels.com/photos/2514035/pexels-photo-2514035.jpeg?auto=compress&cs=tinysrgb&w=800",
  "https://images.pexels.com/photos/816608/pexels-photo-816608.jpeg?auto=compress&cs=tinysrgb&w=800",
  "https://images.pexels.com/photos/1271620/pexels-photo-1271620.jpeg?auto=compress&cs=tinysrgb&w=800",
  "https://images.pexels.com/photos/1779487/pexels-photo-1779487.jpeg?auto=compress&cs=tinysrgb&w=800",
  "https://images.pexels.com/photos/1105666/pexels-photo-1105666.jpeg?auto=compress&cs=tinysrgb&w=800"],

  width = 800,
  height = 300,
  spacing = 1.5,
  rotationAngle = 0.1,
  borderRadius = 0.1,
  autoRotate = false,
  autoRotateSpeed = 0.3,
  className = "",
  style = {},
  onImageClick
}) => {

  const [activeIndex, setActiveIndex] = useState(Math.floor(images.length / 2));

  const containerRef = useRef<HTMLDivElement>(null);


  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);


  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null;
    if (autoRotate) {

      intervalId = setInterval(() => {
        setActiveIndex((prev) => (prev + 1) % images.length);
      }, autoRotateSpeed * 1000);
    }


    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [autoRotate, autoRotateSpeed, images.length]);


  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {

    const { left, top, width, height } =
    e.currentTarget.getBoundingClientRect();

    const x = e.clientX - left;
    const y = e.clientY - top;



    const rotateYVal = (x / width - 0.5) * 20;
    const rotateXVal = (y / height - 0.5) * -20;


    rotateX.set(rotateXVal);
    rotateY.set(rotateYVal);
  };


  const handleMouseLeave = () => {

    rotateX.set(0);
    rotateY.set(0);
  };

  return (

    <motion.div
      ref={containerRef}
      className={`relative flex items-center justify-center ${className}`}
      style={{
        width,
        height,
        perspective: 1200,
        transformStyle: "preserve-3d",
        ...style
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}>
      
      {}
      <motion.div
        style={{
          rotateX,
          rotateY,
          transformStyle: "preserve-3d"
        }}
        className="relative">
        
        {}
        <AnimatePresence initial={false}>
          {images.map((img, index) => {

            const offset = index - activeIndex;

            const scale = index === activeIndex ? 1 : 0.8;

            const zIndex = -Math.abs(offset);

            const x = offset * spacing * 200;

            const rotateYImage = offset * -rotationAngle * 180;

            return (

              <motion.div
                key={img}
                className="absolute rounded-lg overflow-hidden shadow-xl cursor-pointer"
                style={{
                  width: 200,
                  height: 280,
                  borderRadius: `${borderRadius * 100}px`,
                  zIndex
                }}

                animate={{
                  x,
                  scale,
                  rotateY: rotateYImage,
                  opacity: Math.abs(offset) > 2 ? 0 : 1,
                  filter:
                  index === activeIndex ? "brightness(1)" : "brightness(0.7)"
                }}

                transition={{ type: "spring", stiffness: 150, damping: 20 }}

                onClick={() => {

                  if (index !== activeIndex) return setActiveIndex(index);

                  onImageClick?.(index);
                }}>
                
                {}
                <img
                  src={img}
                  alt={`gallery-image-${index}`}
                  className="w-full h-full object-cover"

                  onError={(e) => {
                    e.currentTarget.src = `https://placehold.co/200x280/cccccc/333333?text=Image+Error`;
                    e.currentTarget.onerror = null;
                  }} />
                
              </motion.div>);

          })}
        </AnimatePresence>
      </motion.div>
    </motion.div>);

};

export default ThreeDImageGallery;