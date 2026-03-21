import React, { useMemo, useState, useEffect } from "react";
import { motion, useSpring, useMotionValue, useTransform } from "framer-motion";

const Dot = ({ dot, smoothX, smoothY }) => {
  const x = useTransform(smoothX, (v) => v * dot.factor);
  const y = useTransform(smoothY, (v) => v * dot.factor);

  return (
    <motion.div
      className="absolute rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.2)]"
      style={{
        width: dot.size,
        height: dot.size,
        top: `${dot.top}%`,
        left: `${dot.left}%`,
        opacity: dot.opacity,
        x,
        y,
      }}
      animate={{
        scale: [1, 1.2, 1],
        opacity: [dot.opacity, dot.opacity * 1.5, dot.opacity],
      }}
      transition={{
        duration: dot.duration,
        repeat: Infinity,
        delay: dot.delay,
        ease: "easeInOut",
      }}
    />
  );
};

const FloatingDots = () => {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Smooth springs for the parallax
  const springConfig = { damping: 25, stiffness: 150 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);

  useEffect(() => {
    const handleMouseMove = (e) => {
      const { clientX, clientY } = e;
      const x = (clientX / window.innerWidth - 0.5) * 50;
      const y = (clientY / window.innerHeight - 0.5) * 50;
      mouseX.set(x);
      mouseY.set(y);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [mouseX, mouseY]);

  const dots = useMemo(() => {
    return Array.from({ length: 40 }).map((_, i) => ({
      id: i,
      size: Math.random() * 4 + 1,
      top: Math.random() * 100,
      left: Math.random() * 100,
      duration: Math.random() * 20 + 20,
      delay: Math.random() * 10,
      opacity: Math.random() * 0.3 + 0.1,
      factor: Math.random() * 2 + 1, // Depth factor for parallax
    }));
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-brand-accent/5 rounded-full blur-[120px]"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/5 rounded-full blur-[100px]"></div>
      
      {dots.map((dot) => (
        <Dot key={dot.id} dot={dot} smoothX={smoothX} smoothY={smoothY} />
      ))}
    </div>
  );
};

export default FloatingDots;
