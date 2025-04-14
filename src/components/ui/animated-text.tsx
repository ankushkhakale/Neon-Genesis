
import React, { useEffect } from 'react';
import { motion, useAnimation } from 'framer-motion';

interface AnimatedTextProps {
  text: string;
  className?: string;
  once?: boolean;
  delay?: number;
  staggerChildren?: number;
  highlightIndices?: number[];
}

export function AnimatedText({
  text,
  className = '',
  once = false,
  delay = 0,
  staggerChildren = 0.04,
  highlightIndices = [],
}: AnimatedTextProps) {
  const words = text.split(' ');
  const controls = useAnimation();

  useEffect(() => {
    const startAnimation = async () => {
      await controls.start("hidden");
      await controls.start("visible");
    };

    if (!once) {
      const interval = setInterval(startAnimation, 10000);
      return () => clearInterval(interval);
    }
  }, [controls, once]);

  const container = {
    hidden: { opacity: 0 },
    visible: (i = 1) => ({
      opacity: 1,
      transition: { 
        staggerChildren: staggerChildren, 
        delayChildren: delay 
      },
    }),
  };

  const child = {
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: 'spring',
        damping: 12,
        stiffness: 100,
      },
    },
    hidden: {
      opacity: 0,
      y: 20,
      transition: {
        type: 'spring',
        damping: 12,
        stiffness: 100,
      },
    },
  };

  return (
    <motion.div
      className={`w-full mx-auto flex flex-wrap ${className}`}
      variants={container}
      initial="hidden"
      animate={once ? "visible" : controls}
      viewport={{ once }}
    >
      {words.map((word, index) => {
        const isHighlighted = highlightIndices.includes(index);
        
        return (
          <motion.span
            key={index}
            className={`mr-1.5 ${isHighlighted ? 'text-accent' : ''}`}
            variants={child}
          >
            {word}
          </motion.span>
        );
      })}
    </motion.div>
  );
}
