
import { useState, useEffect, lazy, Suspense } from 'react';
import { motion } from 'framer-motion';
import { Button } from './ui/button';
import { AnimatedText } from './ui/animated-text';
import { ArrowRight, Code, Terminal } from 'lucide-react';
import { JoinTeamModal } from './join-team-modal';
import { useIsMobile } from '@/hooks/use-mobile';

// Lazy load heavy components
const MeteorShower = lazy(() => import('./meteor-shower'));
const PlanetarySystem = lazy(() => import('./planetary-system'));

export function Hero() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentRole, setCurrentRole] = useState(0);
  const isMobile = useIsMobile();
  
  const roles = [
    "UI/UX Designers",
    "AI Engineers", 
    "Frontend Developers",
    "Backend Developers",
    "Full Stack Developers"
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentRole((prev) => (prev + 1) % roles.length);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const scrollToPortfolio = () => {
    const element = document.getElementById('portfolio');
    if (!element) return;
    
    window.scrollTo({
      top: element.offsetTop - 80,
      behavior: 'smooth'
    });
  };

  return (
    <section id="home" className="min-h-screen flex items-center justify-center pt-16 md:pt-20 pb-16 relative overflow-hidden">
      {/* Background grid with reduced opacity */}
      <div className="absolute inset-0 cyberpunk-grid opacity-10"></div>
      
      {/* Add Planetary System effect - conditionally rendered based on device */}
      <Suspense fallback={null}>
        {!isMobile && <PlanetarySystem />}
      </Suspense>
      
      {/* Add enhanced Meteor Shower effect - conditionally rendered based on device */}
      <Suspense fallback={null}>
        <MeteorShower />
      </Suspense>
      
      {/* Animated orbs with reduced opacity */}
      <motion.div 
        className="absolute -top-20 -left-20 w-72 md:w-96 h-72 md:h-96 bg-primary/5 rounded-full filter blur-3xl opacity-10"
        animate={{
          x: [0, 50, 0],
          y: [0, 25, 0],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          repeatType: "reverse"
        }}
      />
      
      <motion.div 
        className="absolute -bottom-40 -right-20 w-72 md:w-96 h-72 md:h-96 bg-accent/5 rounded-full filter blur-3xl opacity-20"
        animate={{
          x: [0, -50, 0],
          y: [0, -25, 0],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          repeatType: "reverse"
        }}
      />
      
      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex flex-col space-y-4 md:space-y-6"
          >
            <div className="space-y-2">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="glassmorphism inline-block py-1 px-3 text-sm font-medium text-accent rounded-full"
              >
                <Code className="inline mr-1 w-4 h-4" />
                <motion.span
                  key={currentRole}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5 }}
                >
                  {roles[currentRole]}
                </motion.span>
              </motion.div>
              <h1 className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold tracking-tighter text-foreground">
                WHERE CODE MEETS CREATIVITY
              </h1>
            </div>
            <AnimatedText
              text="We are Neon Genesis, a team of passionate developers willing to do anything for coding. We create the future through innovation and technology."
              className="text-base md:text-lg text-muted-foreground"
              once={true}
            />
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <Button 
                size={isMobile ? "default" : "lg"} 
                className="group bg-accent hover:bg-accent/90 neon-border animate-pulse-glow"
                onClick={scrollToPortfolio}
              >
                Explore Projects
                <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Button>
              <Button 
                size={isMobile ? "default" : "lg"} 
                variant="outline" 
                className="border-accent/50 hover:border-accent hover:bg-accent/10"
                onClick={() => setIsModalOpen(true)}
              >
                Join Our Team
              </Button>
            </motion.div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="relative flex justify-center"
          >
            <div className="relative w-full max-w-lg">
              <div className="absolute top-0 -left-4 w-56 sm:w-72 h-56 sm:h-72 bg-accent/30 rounded-full filter blur-3xl opacity-30 animate-float" />
              <div className="absolute -bottom-24 right-0 w-56 sm:w-72 h-56 sm:h-72 bg-primary/30 rounded-full filter blur-3xl opacity-30 animate-float" style={{ animationDelay: "2s" }} />
              <motion.div
                className="glassmorphism rounded-xl overflow-hidden neon-border animate-pulse-glow p-1"
                initial={{ y: 20 }}
                animate={{ y: 0 }}
                transition={{
                  repeat: Infinity,
                  repeatType: "reverse",
                  duration: 4,
                  ease: "easeInOut"
                }}
              >
                <div className="bg-black/80 rounded-lg p-4">
                  <div className="flex items-center mb-3">
                    <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500 mr-2"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    <div className="ml-auto flex items-center text-xs text-muted-foreground">
                      <Terminal className="w-4 h-4 mr-1" /> neongenesis.terminal
                    </div>
                  </div>
                  <div className="font-mono text-xs sm:text-sm text-green-400">
                    <p className="mb-1">$ <span className="animate-text-flicker">initialize neon_genesis</span></p>
                    <p className="mb-1 text-blue-400">Loading team assets...</p>
                    <p className="mb-1 text-purple-400">Compiling creative algorithms...</p>
                    <p className="mb-1 text-yellow-400">Syncing neural networks...</p>
                    <p className="mb-1 text-accent">Ready for innovation.</p>
                    <p className="flex items-center">
                      $ <span className="w-2 h-4 bg-white ml-1 animate-pulse"></span>
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
      
      <JoinTeamModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
      />
    </section>
  );
}
