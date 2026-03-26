import React, { useState, useEffect, useCallback, useRef, CSSProperties } from 'react';



export interface SliderItemData {
  title: string;
  num: string;
  imageUrl: string;
  data?: any;
}

interface ThreeDSliderProps {
  items: SliderItemData[];
  speedWheel?: number;
  speedDrag?: number;
  containerStyle?: CSSProperties;
  onItemClick?: (item: SliderItemData, index: number) => void;
}



interface SliderItemProps {
  item: SliderItemData;
  index: number;
  onClick: () => void;
}


const SliderItem = React.forwardRef<HTMLDivElement, SliderItemProps>(({ item, onClick }, ref) => {
  return (
    <div
      ref={ref}
      className="absolute top-1/2 left-1/2 cursor-pointer select-none rounded-xl 
                shadow-2xl bg-black transform-origin-[0%_100%] pointer-events-auto
                w-[var(--width)] h-[var(--height)]
                -mt-[calc(var(--height)/2)] -ml-[calc(var(--width)/2)]
                overflow-hidden will-change-transform"




      style={{
        '--width': 'clamp(150px, 30vw, 300px)',
        '--height': 'clamp(200px, 40vw, 400px)',
        transition: 'none',
        display: 'block'
      } as CSSProperties & {[key: string]: any;}}
      onClick={onClick}>
      
            <div
        className="slider-item-content absolute inset-0 z-10 transition-opacity duration-300 ease-out will-change-opacity"
        style={{ opacity: 1 }}>
        
                {}
                <div className="absolute inset-0 z-10 bg-gradient-to-b from-black/30 via-transparent via-50% to-black/50"></div>

                {}
                <div className="absolute z-10 text-white bottom-5 left-5 text-[clamp(20px,3vw,30px)] drop-shadow-md">
                    {item.title}
                </div>

                {}
                <div className="absolute z-10 text-white top-2.5 left-5 text-[clamp(20px,10vw,80px)]">
                    {item.num}
                </div>

                {}
                <img
          src={item.imageUrl}
          alt={item.title}
          className="w-full h-full object-cover pointer-events-none"
          loading="lazy"
          decoding="async" />
        
            </div>
        </div>);

});

SliderItem.displayName = 'SliderItem';



const ThreeDSlider: React.FC<ThreeDSliderProps> = ({
  items,
  speedWheel = 0.05,
  speedDrag = -0.15,
  containerStyle = {},
  onItemClick
}) => {

  const progressRef = useRef(50);
  const targetProgressRef = useRef(50);
  const isDownRef = useRef(false);
  const startXRef = useRef(0);
  const isHoveringRef = useRef(false);
  const rafRef = useRef<number | null>(null);


  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const numItems = items.length;





  const update = useCallback(() => {
    if (!itemRefs.current.length) return;

    const progress = progressRef.current;
    const clamped = Math.max(0, Math.min(progress, 100));


    const activeFloat = clamped / 100 * (numItems - 1);

    itemRefs.current.forEach((el, index) => {
      if (!el) return;


      const denominator = numItems > 1 ? numItems - 1 : 1;


      const activeRatio = index - activeFloat;



      const x = activeRatio * 120;
      const y = activeRatio * 20;
      const rotate = activeRatio * 15;










      const normalizedRatio = activeRatio / denominator;












      const ratio = (index - activeFloat) / denominator;

      const tx = ratio * 800;
      const ty = ratio * 200;
      const rot = ratio * 120;

      const zIndex = Math.round(numItems - Math.abs(index - activeFloat));





      const dist = Math.abs(index - activeFloat);
      const z = numItems - dist;


      const opacity = z / numItems * 3 - 2;



      el.style.transform = `translate3d(${tx}%, ${ty}%, 0) rotate(${rot}deg)`;
      el.style.zIndex = Math.round(z * 10).toString();


      const inner = el.querySelector('.slider-item-content') as HTMLElement;
      if (inner) {
        inner.style.opacity = Math.max(0, Math.min(1, opacity)).toString();
      }
    });

    rafRef.current = requestAnimationFrame(update);
  }, [numItems]);


  useEffect(() => {
    rafRef.current = requestAnimationFrame(update);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [update]);




  const handleWheel = useCallback((e: WheelEvent) => {
    if (!isHoveringRef.current) return;

    const wheelProgress = e.deltaY * speedWheel;
    const current = progressRef.current;
    const next = current + wheelProgress;


    if (next < 0 && e.deltaY < 0 || next > 100 && e.deltaY > 0) {

      return;
    }

    e.preventDefault();
    e.stopPropagation();
    progressRef.current = Math.max(0, Math.min(100, next));

  }, [speedWheel]);

  const getClientX = (e: MouseEvent | TouchEvent) => {
    if ('touches' in e) return e.touches[0].clientX;
    return (e as MouseEvent).clientX;
  };

  const handleMouseDown = useCallback((e: MouseEvent | TouchEvent) => {
    isDownRef.current = true;
    const x = getClientX(e);
    if (x !== undefined) startXRef.current = x;
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent | TouchEvent) => {
    if (!isDownRef.current) return;

    const x = getClientX(e);
    if (x === undefined) return;

    const diff = (x - startXRef.current) * speedDrag;
    const current = progressRef.current;
    const next = Math.max(0, Math.min(100, current + diff));

    progressRef.current = next;
    startXRef.current = x;
  }, [speedDrag]);

  const handleMouseUp = useCallback(() => {
    isDownRef.current = false;
  }, []);

  const handleClick = useCallback((item: SliderItemData, index: number) => {



    const denominator = numItems > 1 ? numItems - 1 : 1;
    progressRef.current = index / denominator * 100;

    if (onItemClick) onItemClick(item, index);
  }, [numItems, onItemClick]);



  useEffect(() => {
    const wheelOpts = { passive: false };
    document.addEventListener('wheel', handleWheel, wheelOpts);
    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('touchstart', handleMouseDown, { passive: true });
    document.addEventListener('touchmove', handleMouseMove, { passive: true });
    document.addEventListener('touchend', handleMouseUp);

    return () => {
      document.removeEventListener('wheel', handleWheel);
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('touchstart', handleMouseDown);
      document.removeEventListener('touchmove', handleMouseMove);
      document.removeEventListener('touchend', handleMouseUp);
    };
  }, [handleWheel, handleMouseDown, handleMouseMove, handleMouseUp]);

  return (
    <div
      className="relative w-full h-screen overflow-hidden bg-black"
      style={containerStyle}
      onMouseEnter={() => isHoveringRef.current = true}
      onMouseLeave={() => isHoveringRef.current = false}>
      
            <div className="relative z-10 h-[80vh] overflow-hidden pointer-events-none scale-[0.75] w-full">
                {items.map((item, index) =>
        <SliderItem
          key={`slider-item-${index}`}
          ref={(el) => {itemRefs.current[index] = el;}}
          item={item}
          index={index}
          onClick={() => handleClick(item, index)} />

        )}
            </div>
            {}
            <div className="absolute inset-0 z-0 pointer-events-none">
                <div className="absolute top-0 left-[90px] w-[10px] h-full border border-y-0 border-white/15"></div>
                <div className="absolute bottom-0 left-[30px] text-white/40 rotate-[-90deg] transform-origin-[0%_10%] text-[9px] uppercase leading-relaxed">
                    Code With Muhilan
                </div>
            </div>
        </div>);

};

export default ThreeDSlider;