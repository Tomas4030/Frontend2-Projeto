"use client";

import React, { useState, useCallback, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence, TargetAndTransition } from 'framer-motion';
import { cn } from '../../lib/utils';

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  image: string;
  bio?: string;
}

export interface TeamCarouselProps {

  members: TeamMember[];

  title?: string;

  titleSize?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';

  titleColor?: string;

  background?: string;

  cardWidth?: number;

  cardHeight?: number;

  cardRadius?: number;

  showArrows?: boolean;

  showDots?: boolean;

  keyboardNavigation?: boolean;

  touchNavigation?: boolean;

  animationDuration?: number;

  autoPlay?: number;

  pauseOnHover?: boolean;

  visibleCards?: number;

  sideCardScale?: number;

  sideCardOpacity?: number;

  grayscaleEffect?: boolean;

  className?: string;

  cardClassName?: string;

  titleClassName?: string;

  infoPosition?: 'bottom' | 'overlay' | 'none';

  infoTextColor?: string;

  infoBackground?: string;

  onMemberChange?: (member: TeamMember, index: number) => void;

  onCardClick?: (member: TeamMember, index: number) => void;

  initialIndex?: number;
}

export const TeamCarousel: React.FC<TeamCarouselProps> = ({
  members,
  title = "OUR TEAM",
  titleSize = "2xl",
  titleColor = "rgba(0, 76, 255, 1)",
  background,
  cardWidth = 280,
  cardHeight = 380,
  cardRadius = 20,
  showArrows = true,
  showDots = true,
  keyboardNavigation = true,
  touchNavigation = true,
  animationDuration = 800,
  autoPlay = 0,
  pauseOnHover = true,
  visibleCards = 2,
  sideCardScale = 0.9,
  sideCardOpacity = 0.8,
  grayscaleEffect = true,
  className,
  cardClassName,
  titleClassName,
  infoPosition = "bottom",
  infoTextColor = "rgb(8, 42, 123)",
  infoBackground = "transparent",
  onMemberChange,
  onCardClick,
  initialIndex = 0
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [direction, setDirection] = useState(0);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);

  const totalMembers = members.length;

  const paginate = useCallback(
    (newDirection: number) => {
      if (totalMembers === 0) return;
      setDirection(newDirection);
      const nextIndex = (currentIndex + newDirection + totalMembers) % totalMembers;
      setCurrentIndex(nextIndex);
      onMemberChange?.(members[nextIndex], nextIndex);
    },
    [currentIndex, totalMembers, members, onMemberChange]
  );

  const wrapIndex = (index: number) => {
    return (index + totalMembers) % totalMembers;
  };

  const calculatePosition = (index: number) => {
    const activeIndex = currentIndex;
    const diff = wrapIndex(index - activeIndex);

    if (diff === 0) return 'center';
    if (diff <= visibleCards) return `right-${diff}`;
    if (diff >= totalMembers - visibleCards) return `left-${totalMembers - diff}`;
    return 'hidden';
  };


  const getVariantStyles = (position: string): TargetAndTransition => {





    const transition = {
      duration: animationDuration / 1000,



      ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number]
    };

    switch (position) {
      case 'center':
        return {
          zIndex: 10,
          opacity: 1,
          scale: 1.1,
          x: 0,
          filter: 'grayscale(0%)',
          pointerEvents: 'auto',
          transition
        };
      case 'right-1':
        return {
          zIndex: 5,
          opacity: sideCardOpacity,
          scale: sideCardScale,
          x: cardWidth * 0.7,
          filter: grayscaleEffect ? 'grayscale(100%)' : 'grayscale(0%)',
          pointerEvents: 'auto',
          transition
        };
      case 'right-2':
        return {
          zIndex: 1,
          opacity: sideCardOpacity * 0.7,
          scale: sideCardScale * 0.9,
          x: cardWidth * 1.4,
          filter: grayscaleEffect ? 'grayscale(100%)' : 'grayscale(0%)',
          pointerEvents: 'auto',
          transition
        };
      case 'left-1':
        return {
          zIndex: 5,
          opacity: sideCardOpacity,
          scale: sideCardScale,
          x: -cardWidth * 0.7,
          filter: grayscaleEffect ? 'grayscale(100%)' : 'grayscale(0%)',
          pointerEvents: 'auto',
          transition
        };
      case 'left-2':
        return {
          zIndex: 1,
          opacity: sideCardOpacity * 0.7,
          scale: sideCardScale * 0.9,
          x: -cardWidth * 1.4,
          filter: grayscaleEffect ? 'grayscale(100%)' : 'grayscale(0%)',
          pointerEvents: 'auto',
          transition
        };
      default:
        return {
          zIndex: 0,
          opacity: 0,
          scale: 0.8,
          x: direction > 0 ? cardWidth * (visibleCards + 1) : -cardWidth * (visibleCards + 1),
          pointerEvents: 'none',
          filter: grayscaleEffect ? 'grayscale(100%)' : 'grayscale(0%)',
          transition
        };
    }
  };


  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (autoPlay > 0) {
      interval = setInterval(() => {
        paginate(1);
      }, autoPlay);
    }

    const carouselContainer = document.getElementById('team-carousel-container');

    const handleMouseEnter = () => {
      if (pauseOnHover && autoPlay > 0) clearInterval(interval);
    };

    const handleMouseLeave = () => {
      if (pauseOnHover && autoPlay > 0) {
        interval = setInterval(() => {
          paginate(1);
        }, autoPlay);
      }
    };

    if (carouselContainer && pauseOnHover && autoPlay > 0) {
      carouselContainer.addEventListener('mouseenter', handleMouseEnter);
      carouselContainer.addEventListener('mouseleave', handleMouseLeave);
    }

    return () => {
      clearInterval(interval);
      if (carouselContainer && pauseOnHover && autoPlay > 0) {
        carouselContainer.removeEventListener('mouseenter', handleMouseEnter);
        carouselContainer.removeEventListener('mouseleave', handleMouseLeave);
      }
    };
  }, [autoPlay, paginate, pauseOnHover]);


  useEffect(() => {
    if (!keyboardNavigation) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        paginate(-1);
      } else if (e.key === 'ArrowRight') {
        paginate(1);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [keyboardNavigation, paginate]);


  const handleTouchStart = (e: React.TouchEvent) => {
    if (!touchNavigation) return;
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchNavigation) return;
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchNavigation) return;

    const swipeThreshold = 50;
    const diff = touchStart - touchEnd;

    if (Math.abs(diff) > swipeThreshold) {
      if (diff > 0) {
        paginate(1);
      } else {
        paginate(-1);
      }
    }
  };

  const titleSizeClasses = {
    sm: 'text-4xl',
    md: 'text-5xl',
    lg: 'text-6xl',
    xl: 'text-7xl',
    '2xl': 'text-8xl'
  };

  return (
    <div
      id="team-carousel-container"
      className={cn(`min-h-screen flex flex-col items-center justify-center overflow-hidden relative 
        transparent`, className)}
      style={{ background: background }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}>
      
      {}
      {title &&
      <h2
        className={cn(
          "font-black uppercase tracking-tight absolute top-12 left-1/2 transform -translate-x-1/2 pointer-events-none whitespace-nowrap",
          titleSizeClasses[titleSize],
          titleClassName
        )}
        style={{
          color: 'transparent',
          background: `linear-gradient(to bottom, ${titleColor}75 40%, transparent 76%)`,
          WebkitBackgroundClip: 'text',
          backgroundClip: 'text'
        }}>
        
          {title}
        </h2>
      }

      {}
      <div
        className="w-full max-w-6xl relative mt-20"
        style={{
          height: cardHeight + 100,
          perspective: '1000px'
        }}>
        
        {}
        {showArrows &&
        <>
            <motion.button
            onClick={() => paginate(-1)}
            className="absolute left-5 top-1/2 transform -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white w-10 h-10 rounded-full flex items-center justify-center z-20 transition-all duration-300 hover:scale-110"
            whileTap={{ scale: 0.9 }}>
            
              <ChevronLeft className="w-6 h-6" />
            </motion.button>
            <motion.button
            onClick={() => paginate(1)}
            className="absolute right-5 top-1/2 transform -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white w-10 h-10 rounded-full flex items-center justify-center z-20 transition-all duration-300 hover:scale-110"
            whileTap={{ scale: 0.9 }}>
            
              <ChevronRight className="w-6 h-6" />
            </motion.button>
          </>
        }

        {}
        <div
          className="w-full h-full flex justify-center items-center relative"
          style={{ transformStyle: 'preserve-3d' }}>
          
          <AnimatePresence initial={false} custom={direction}>
            {members.map((member, index) => {
              const position = calculatePosition(index);
              const isCurrent = index === currentIndex;

              if (position === 'hidden' && !isCurrent) return null;

              return (
                <motion.div
                  key={member.id}
                  className={cn(
                    "absolute bg-white overflow-hidden shadow-2xl cursor-pointer",
                    cardClassName
                  )}
                  style={{
                    width: cardWidth,
                    height: cardHeight,
                    borderRadius: cardRadius,
                    top: '50%',
                    left: '50%',
                    marginLeft: -cardWidth / 2,
                    marginTop: -cardHeight / 2
                  }}
                  initial={getVariantStyles('hidden')}
                  animate={getVariantStyles(position)}
                  exit={getVariantStyles('hidden')}
                  onClick={() => {
                    if (!isCurrent) {
                      const newDirection = index > currentIndex ? 1 : -1;
                      setDirection(newDirection);
                      setCurrentIndex(index);
                      onMemberChange?.(members[index], index);
                    }
                    onCardClick?.(member, index);
                  }}>
                  
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-full h-full object-cover" />
                  

                  {}
                  {infoPosition === 'overlay' &&
                  <div
                    className="absolute bottom-0 left-0 right-0 p-4 text-center"
                    style={{
                      background: infoBackground || "linear-gradient(transparent, rgba(0,0,0,0.8))",
                      color: infoTextColor
                    }}>
                    
                      <h3 className="text-lg font-bold">{member.name}</h3>
                      <p className="text-sm opacity-90">{member.role}</p>
                    </div>
                  }
                </motion.div>);

            })}
          </AnimatePresence>
        </div>
      </div>

      {}
      {infoPosition === 'bottom' && members[currentIndex] &&
      <motion.div
        key={members[currentIndex].id + "-info"}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
        className="text-center mt-10">
        
          <h2
          className="text-4xl font-bold mb-3 relative inline-block"
          style={{ color: infoTextColor }}>
          
            {members[currentIndex].name}
            <span
            className="absolute top-full left-0 w-full h-0.5 mt-2"
            style={{ background: infoTextColor }} />
          
          </h2>
          <p
          className="text-xl font-medium opacity-80 uppercase tracking-wider"
          style={{ color: infoTextColor }}>
          
            {members[currentIndex].role}
          </p>
          {members[currentIndex].bio &&
        <p className="text-base mt-4 max-w-lg mx-auto opacity-70">
              {members[currentIndex].bio}
            </p>
        }
        </motion.div>
      }

      {}
      {showDots &&
      <div className="flex justify-center gap-3 mt-15 ">
          {members.map((_, index) =>
        <motion.button
          key={index}
          onClick={() => {
            if (index !== currentIndex) {
              const newDirection = index > currentIndex ? 1 : -1;
              setDirection(newDirection);
              setCurrentIndex(index);
              onMemberChange?.(members[index], index);
            }
          }}
          className={cn(
            "w-3 h-3 rounded-full transition-all duration-300",
            index === currentIndex ?
            "scale-125" :
            "hover:scale-110"
          )}
          style={{
            background: index === currentIndex ?
            infoTextColor :
            `${infoTextColor}40`
          }}
          whileTap={{ scale: 0.9 }} />

        )}
        </div>
      }
    </div>);

};

export default TeamCarousel;