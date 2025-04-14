
import { motion } from 'framer-motion';
import { Button } from './ui/button';
import { AnimatedText } from './ui/animated-text';
import { ArrowRight } from 'lucide-react';

export function Hero() {
  return (
    <section id="home" className="min-h-screen flex items-center justify-center pt-20 pb-16">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex flex-col space-y-6"
          >
            <div className="space-y-2">
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="inline-block py-1 px-3 text-sm font-medium text-accent bg-accent/10 rounded-full"
              >
                Creative Design Agency
              </motion.span>
              <h1 className="font-bold">
                <AnimatedText
                  text="Creating Digital Experiences That Inspire"
                  className="leading-tight"
                />
              </h1>
            </div>
            <AnimatedText
              text="We craft stunning digital experiences that captivate your audience and elevate your brand."
              className="text-lg text-muted-foreground"
              once={true}
            />
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <Button size="lg" className="group">
                Get Started
                <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Button>
              <Button size="lg" variant="outline">
                Our Work
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
              <div className="absolute top-0 -left-4 w-72 h-72 bg-accent/30 rounded-full filter blur-3xl opacity-30 animate-float" />
              <div className="absolute -bottom-24 right-0 w-72 h-72 bg-accent/30 rounded-full filter blur-3xl opacity-30 animate-float" style={{ animationDelay: "2s" }} />
              <motion.div
                initial={{ y: 20 }}
                animate={{ y: 0 }}
                transition={{
                  repeat: Infinity,
                  repeatType: "reverse",
                  duration: 2,
                  ease: "easeInOut"
                }}
                className="relative"
              >
                <img
                  src="https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&q=80&w=2070"
                  alt="Digital workspace"
                  className="rounded-lg shadow-2xl"
                />
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
