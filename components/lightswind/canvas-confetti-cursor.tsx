"use client";
import React, { useEffect, useRef } from "react";

export interface CanvasConfettiCursorProps {



  colors?: string[];



  minSize?: number;



  maxSize?: number;



  particleCount?: number;



  frequency?: number;



  fillParent?: boolean;



  overlayOpacity?: number;



  decay?: number;



  onExplosion?: (x: number, y: number) => void;



  enabled?: boolean;



  style?: React.CSSProperties;



  className?: string;
}

export const CanvasConfettiCursor: React.FC<CanvasConfettiCursorProps> = ({
  colors = ["#FF3F8E", "#04C2C9", "#2E55C1", "#F9D423"],
  minSize = 2,
  maxSize = 7,
  particleCount = 40,
  frequency = 50,
  fillParent = false,
  overlayOpacity = 1,
  decay = 0.98,
  onExplosion,
  enabled = true,
  style,
  className
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mousePos = useRef({
    x: window.innerWidth / 2,
    y: window.innerHeight / 2
  });
  const particles = useRef<any[]>([]);
  const animId = useRef<number | undefined>(undefined);
  const intervalRef = useRef<number | undefined>(undefined);
  const parentRef = useRef<HTMLDivElement | null>(null);


  const resizeCanvas = () => {
    if (!canvasRef.current) return;
    if (fillParent && parentRef.current) {
      canvasRef.current.width = parentRef.current.offsetWidth;
      canvasRef.current.height = parentRef.current.offsetHeight;
    } else {
      canvasRef.current.width = window.innerWidth;
      canvasRef.current.height = window.innerHeight;
    }
  };

  useEffect(() => {
    resizeCanvas();
    if (!fillParent) {
      window.addEventListener("resize", resizeCanvas);
    }
    return () => {
      if (!fillParent) {
        window.removeEventListener("resize", resizeCanvas);
      }
    };
  }, [fillParent]);


  useEffect(() => {
    if (!enabled) return;
    let disposed = false;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    let parentOffsetX = 0;
    let parentOffsetY = 0;
    if (fillParent && parentRef.current) {
      const rect = parentRef.current.getBoundingClientRect();
      parentOffsetX = rect.left;
      parentOffsetY = rect.top;
    }

    class Particle {
      x: number;
      y: number;
      size: number;
      color: string;
      speedX: number;
      speedY: number;
      constructor(
      x: number,
      y: number,
      size: number,
      color: string,
      speedX: number,
      speedY: number)
      {
        this.x = x;
        this.y = y;
        this.size = size;
        this.color = color;
        this.speedX = speedX;
        this.speedY = speedY;
      }
      update() {
        this.x += this.speedX;
        this.y += this.speedY;
        this.size *= decay;
      }
      draw(ctx: CanvasRenderingContext2D) {
        ctx.globalAlpha = overlayOpacity;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.closePath();
        ctx.fill();
        ctx.globalAlpha = 1;
      }
    }

    const animate = () => {
      if (disposed || !canvasRef.current) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.current = particles.current.filter((p) => {
        p.update();
        p.draw(ctx);
        return p.size > 0.5;
      });
      animId.current = requestAnimationFrame(animate);
    };

    animate();
    return () => {
      disposed = true;
      animId.current && cancelAnimationFrame(animId.current);
      particles.current = [];
    };

  }, [decay, overlayOpacity, fillParent, enabled]);

  useEffect(() => {
    if (!enabled) return;

    function moveHandler(event: Event) {
      let x = 0,
        y = 0;
      const mouseEvent = event as MouseEvent;
      const touchEvent = event as TouchEvent;
      if ("touches" in event && touchEvent.touches[0]) {
        x = touchEvent.touches[0].clientX;
        y = touchEvent.touches[0].clientY;
      } else if ("clientX" in event) {
        x = mouseEvent.clientX;
        y = mouseEvent.clientY;
      }
      if (fillParent && parentRef.current) {
        const rect = parentRef.current.getBoundingClientRect();
        x -= rect.left;
        y -= rect.top;
      }
      mousePos.current = { x, y };
    }

    const target = fillParent && parentRef.current ? parentRef.current : window;
    target.addEventListener("mousemove", moveHandler);
    target.addEventListener("touchmove", moveHandler);
    return () => {
      target.removeEventListener("mousemove", moveHandler);
      target.removeEventListener("touchmove", moveHandler);
    };
  }, [fillParent, enabled]);


  useEffect(() => {
    if (!enabled) return;
    function createExplosion(x: number, y: number) {
      if (!canvasRef.current) return;
      for (let i = 0; i < particleCount; i++) {
        const size = Math.random() * (maxSize - minSize) + minSize;
        const color = colors[Math.floor(Math.random() * colors.length)];
        const speedX = (Math.random() * 2 - 1) * 2;
        const speedY = (Math.random() * 2 - 1) * 2;
        particles.current.push(
          new class {
            x = x;
            y = y;
            size = size;
            color = color;
            speedX = speedX;
            speedY = speedY;
            update() {
              this.x += this.speedX;
              this.y += this.speedY;
              this.size *= decay;
            }
            draw(ctx: CanvasRenderingContext2D) {
              ctx.globalAlpha = overlayOpacity;
              ctx.fillStyle = this.color;
              ctx.beginPath();
              ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
              ctx.closePath();
              ctx.fill();
              ctx.globalAlpha = 1;
            }
          }()
        );
      }
      if (typeof onExplosion === "function") onExplosion(x, y);
    }
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = window.setInterval(() => {
      createExplosion(mousePos.current.x, mousePos.current.y);
    }, frequency);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [
  colors,
  minSize,
  maxSize,
  particleCount,
  frequency,
  decay,
  onExplosion,
  enabled,
  fillParent,
  overlayOpacity]
  );

  if (!enabled) return null;
  return (
    <div
      ref={parentRef}
      style={
      fillParent ?
      { position: "relative", width: "100%", height: "100%" } :
      { position: "fixed", inset: 0, pointerEvents: "none", zIndex: 50 }
      }>
      
      <canvas
        ref={canvasRef}
        style={{
          position: fillParent ? "absolute" : "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          pointerEvents: fillParent ? "auto" : "none",
          background: "transparent",
          zIndex: 50,
          ...style
        }}
        className={className} />
      
    </div>);

};