
import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
    
    // Apply glitch effect to text elements
    const glitchElements = document.querySelectorAll('.text-glitch');
    glitchElements.forEach(el => {
      el.setAttribute('data-text', el.textContent || '');
    });
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden">
      <div className="absolute inset-0 cyberpunk-grid opacity-20"></div>
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center z-10 glassmorphism p-8 md:p-12 max-w-md mx-auto"
      >
        <motion.h1 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.8 }}
          className="text-6xl md:text-8xl font-heading font-bold text-glitch animate-pulse-glow mb-6"
          data-text="404"
        >
          404
        </motion.h1>
        
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="text-xl font-accent tracking-widest text-gradient mb-8"
        >
          SIGNAL LOST. TRANSMISSION NOT FOUND.
        </motion.p>
        
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.8 }}
        >
          <p className="mb-8 text-muted-foreground font-mono text-sm">
            &gt; The page you're looking for has either been moved to another dimension or doesn't exist in this reality.
          </p>
          
          <Link to="/">
            <Button 
              variant="outline" 
              className="border-accent/50 hover:border-accent hover:bg-accent/10 font-mono tracking-wide"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Return to Home Base
            </Button>
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default NotFound;
