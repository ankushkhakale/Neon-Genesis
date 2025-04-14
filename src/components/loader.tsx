
import { motion } from 'framer-motion';
import { Code, Cpu } from 'lucide-react';

export function Loader() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black">
      <motion.div
        className="flex flex-col items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div 
          className="relative w-24 h-24"
        >
          <motion.div 
            className="absolute inset-0 border-4 border-t-[#8B5CF6] border-[#8B5CF6]/30 rounded-full"
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
          />
          <motion.div 
            className="absolute inset-2 border-4 border-t-[#F97316] border-[#F97316]/20 rounded-full"
            animate={{ rotate: -360 }}
            transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
          />
          <motion.div 
            className="absolute inset-4 border-4 border-t-[#0EA5E9] border-[#0EA5E9]/20 rounded-full"
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 2.5, ease: "linear" }}
          />
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <Cpu className="w-8 h-8 text-accent animate-pulse" />
          </motion.div>
        </motion.div>
        <motion.h2 
          className="mt-6 text-xl font-bold text-gradient glitch-text"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          data-text="NEON GENESIS"
        >
          NEON GENESIS
        </motion.h2>
        <motion.div
          className="mt-2 text-[#0EA5E9] text-sm font-mono"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          <motion.div
            animate={{
              opacity: [0, 1, 1, 0],
              transition: { repeat: Infinity, duration: 2 }
            }}
          >
            System Initializing<span className="dots">...</span>
          </motion.div>
        </motion.div>
        
        <motion.div 
          className="mt-6 flex space-x-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          <motion.div 
            className="h-1 w-16 bg-primary/30 rounded-full overflow-hidden"
          >
            <motion.div 
              className="h-full bg-primary"
              initial={{ width: 0 }}
              animate={{ width: "100%" }}
              transition={{ duration: 2 }}
            />
          </motion.div>
          <motion.div 
            className="h-1 w-16 bg-secondary/30 rounded-full overflow-hidden"
          >
            <motion.div 
              className="h-full bg-secondary"
              initial={{ width: 0 }}
              animate={{ width: "100%" }}
              transition={{ duration: 1.7, delay: 0.3 }}
            />
          </motion.div>
          <motion.div 
            className="h-1 w-16 bg-accent/30 rounded-full overflow-hidden"
          >
            <motion.div 
              className="h-full bg-accent"
              initial={{ width: 0 }}
              animate={{ width: "100%" }}
              transition={{ duration: 1.5, delay: 0.6 }}
            />
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
}
