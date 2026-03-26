"use client";
import React, { useRef, useEffect, useState } from "react";
const cn = (...classes: Array<string | false | null | undefined>) =>
classes.filter(Boolean).join(" ");

export interface ThreeDHoverGalleryProps {
  images?: string[];
  itemWidth?: number;
  itemHeight?: number;
  gap?: number;
  perspective?: number;
  hoverScale?: number;
  transitionDuration?: number;
  backgroundColor?: string;
  grayscaleStrength?: number;
  brightnessLevel?: number;
  activeWidth?: number;
  rotationAngle?: number;
  zDepth?: number;
  enableKeyboardNavigation?: boolean;
  autoPlay?: boolean;
  autoPlayDelay?: number;
  className?: string;
  style?: React.CSSProperties;
  onImageClick?: (index: number, image: string) => void;
  onImageHover?: (index: number, image: string) => void;
  onImageFocus?: (index: number, image: string) => void;
}

const ThreeDHoverGallery: React.FC<ThreeDHoverGalleryProps> = ({
  images = [
  "https://images.pexels.com/photos/26797335/pexels-photo-26797335/free-photo-of-scenic-view-of-mountains.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
  "https://images.pexels.com/photos/12194487/pexels-photo-12194487.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
  "https://images.pexels.com/photos/32423809/pexels-photo-32423809/free-photo-of-aerial-view-of-kayaking-at-robberg-south-africa.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
  "https://images.pexels.com/photos/32296519/pexels-photo-32296519/free-photo-of-rocky-coastline-of-cape-point-with-turquoise-waters.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
  "https://images.pexels.com/photos/32396739/pexels-photo-32396739/free-photo-of-serene-motorcycle-ride-through-bamboo-grove.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
  "https://images.pexels.com/photos/32304900/pexels-photo-32304900/free-photo-of-scenic-view-of-cape-town-s-twelve-apostles.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
  "https://images.pexels.com/photos/32437034/pexels-photo-32437034/free-photo-of-fisherman-holding-freshly-caught-red-drum-fish.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
  "https://images.pexels.com/photos/32469847/pexels-photo-32469847/free-photo-of-deer-drinking-from-natural-water-source-in-wilderness.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"],

  itemWidth = 12,
  itemHeight = 20,
  gap = 1.2,
  perspective = 50,
  hoverScale = 15,
  transitionDuration = 1.25,
  backgroundColor,
  grayscaleStrength = 1,
  brightnessLevel = 0.5,
  activeWidth = 45,
  rotationAngle = 35,
  zDepth = 10,
  enableKeyboardNavigation = true,
  autoPlay = false,
  autoPlayDelay = 3000,
  className,
  style,
  onImageClick,
  onImageHover,
  onImageFocus
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
  const autoPlayRef = useRef<NodeJS.Timeout | null>(null);


  useEffect(() => {
    if (autoPlay && images.length > 0) {

      if (autoPlayRef.current) {
        clearInterval(autoPlayRef.current);
      }
      autoPlayRef.current = setInterval(() => {
        setActiveIndex((prev) => {

          const nextIndex = prev === null ? 0 : (prev + 1) % images.length;
          return nextIndex;
        });
      }, autoPlayDelay);


      return () => {
        if (autoPlayRef.current) {
          clearInterval(autoPlayRef.current);
        }
      };
    }

    if (!autoPlay && autoPlayRef.current) {
      clearInterval(autoPlayRef.current);
      autoPlayRef.current = null;
    }
  }, [autoPlay, autoPlayDelay, images.length]);


  const handleImageClick = (index: number, image: string) => {

    setActiveIndex(activeIndex === index ? null : index);
    onImageClick?.(index, image);
  };


  const handleImageHover = (index: number, image: string) => {

    if (!autoPlay) {
      setActiveIndex(index);
    }
    onImageHover?.(index, image);
  };


  const handleImageLeave = () => {

    if (!autoPlay) {
      setActiveIndex(null);
    }
  };


  const handleImageFocus = (index: number, image: string) => {
    setFocusedIndex(index);
    onImageFocus?.(index, image);
  };


  const handleKeyDown = (event: React.KeyboardEvent, index: number) => {
    if (!enableKeyboardNavigation) return;

    switch (event.key) {
      case "Enter":
      case " ":
        event.preventDefault();
        handleImageClick(index, images[index]);
        break;
      case "ArrowLeft":
        event.preventDefault();

        const prevIndex = index > 0 ? index - 1 : images.length - 1;

        (containerRef.current?.children[prevIndex] as HTMLElement)?.focus();
        break;
      case "ArrowRight":
        event.preventDefault();

        const nextIndex = index < images.length - 1 ? index + 1 : 0;

        (containerRef.current?.children[nextIndex] as HTMLElement)?.focus();
        break;
    }
  };


  const getItemStyle = (index: number): React.CSSProperties => {
    const isActive = activeIndex === index;
    const isFocused = focusedIndex === index;


    const baseWidthPx = 10;

    return {

      width: isActive ?
      `${activeWidth}vw` :
      `calc(${itemWidth}vw + ${baseWidthPx}px)`,

      height: `calc(${itemHeight}vw + ${itemHeight}vh)`,
      backgroundImage: `url(${images[index]})`,
      backgroundSize: "cover",
      backgroundPosition: "center",
      backgroundColor,
      cursor: "pointer",

      filter:
      isActive || isFocused ?
      "inherit" :
      `grayscale(${grayscaleStrength}) brightness(${brightnessLevel})`,

      transform: isActive ?
      `translateZ(calc(${hoverScale}vw + ${hoverScale}vh))` :
      "none",
      transition: `transform ${transitionDuration}s cubic-bezier(.1, .7, 0, 1), filter 3s cubic-bezier(.1, .7, 0, 1), width ${transitionDuration}s cubic-bezier(.1, .7, 0, 1)`,
      willChange: "transform, filter, width",
      zIndex: isActive ? 100 : "auto",
      margin: isActive ? "0 0.45vw" : "0",
      outline: isFocused ? "2px solid #3b82f6" : "none",
      outlineOffset: "2px",
      borderRadius: "0.5rem"
    };
  };

  return (
    <div
      className={cn(
        "flex items-center justify-center min-h-screen w-full overflow-hidden bg-background",
        className
      )}
      style={backgroundColor ? { backgroundColor, ...style } : style}>
      
      <div
        ref={containerRef}


        className="flex justify-center items-center w-full"
        style={{
          perspective: `calc(${perspective}vw + ${perspective}vh)`,
          gap: `${gap}rem`
        }}>
        
        {images.map((image, index) =>
        <div
          key={index}

          className="relative will-change-transform rounded-lg shadow-lg"
          style={getItemStyle(index)}
          tabIndex={enableKeyboardNavigation ? 0 : -1}
          onClick={() => handleImageClick(index, image)}
          onMouseEnter={() => handleImageHover(index, image)}
          onMouseLeave={handleImageLeave}
          onFocus={() => handleImageFocus(index, image)}
          onBlur={() => setFocusedIndex(null)}
          onKeyDown={(e) => handleKeyDown(e, index)}
          role="button"
          aria-label={`Image ${index + 1} of ${images.length}`}
          aria-pressed={activeIndex === index} />

        )}
      </div>
    </div>);

};

export default ThreeDHoverGallery;