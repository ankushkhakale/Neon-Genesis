
import { useRef, useState, useEffect } from "react";
import { motion, useInView, useAnimation } from "framer-motion";

interface RevealProps {
  children: React.ReactNode;
  width?: "fit-content" | "100%";
  className?: string;
  delay?: number;
  once?: boolean;
  direction?: "up" | "down" | "left" | "right";
  duration?: number;
}

export function Reveal({ 
  children, 
  width = "fit-content", 
  className = "", 
  delay = 0.25,
  once = true,
  direction = "up",
  duration = 0.5
}: RevealProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once, margin: "-10% 0px -10% 0px" });
  const controls = useAnimation();
  const [hasPlayed, setHasPlayed] = useState(false);

  useEffect(() => {
    if (isInView && !hasPlayed) {
      controls.start("visible");
      if (once) {
        setHasPlayed(true);
      }
    }
    if (!isInView && !once && hasPlayed) {
      controls.start("hidden");
    }
  }, [isInView, controls, once, hasPlayed]);

  const getDirectionVariants = () => {
    switch (direction) {
      case "up":
        return {
          hidden: { opacity: 0, y: 75 },
          visible: { opacity: 1, y: 0 }
        };
      case "down":
        return {
          hidden: { opacity: 0, y: -75 },
          visible: { opacity: 1, y: 0 }
        };
      case "left":
        return {
          hidden: { opacity: 0, x: -75 },
          visible: { opacity: 1, x: 0 }
        };
      case "right":
        return {
          hidden: { opacity: 0, x: 75 },
          visible: { opacity: 1, x: 0 }
        };
      default:
        return {
          hidden: { opacity: 0, y: 75 },
          visible: { opacity: 1, y: 0 }
        };
    }
  };
  
  return (
    <div ref={ref} style={{ position: "relative", width, overflow: "hidden" }} className={className}>
      <motion.div
        variants={getDirectionVariants()}
        initial="hidden"
        animate={controls}
        transition={{ 
          duration, 
          delay,
          type: "spring",
          stiffness: 70,
          damping: 15
        }}
      >
        {children}
      </motion.div>
    </div>
  );
}
