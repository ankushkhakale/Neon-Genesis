
import { motion } from 'framer-motion';

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
        </motion.div>
        <motion.h2 
          className="mt-6 text-xl font-bold text-[#8B5CF6]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          NEON GENESIS
        </motion.h2>
        <motion.div
          className="mt-2 text-[#0EA5E9] text-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          System Initializing...
        </motion.div>
      </motion.div>
    </div>
  );
}
