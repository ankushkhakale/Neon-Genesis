
import { motion } from 'framer-motion';

const BlackHole = () => {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      {/* Black Hole Core */}
      <motion.div
        className="absolute"
        style={{
          top: '50%',
          right: '15%',
          width: '150px',
          height: '150px',
          background: 'radial-gradient(circle, rgba(0,0,0,1) 0%, rgba(26,31,44,0.8) 50%, transparent 70%)',
          boxShadow: '0 0 100px rgba(139, 92, 246, 0.3), 0 0 200px rgba(139, 92, 246, 0.2)',
          borderRadius: '50%',
          zIndex: 0
        }}
        animate={{
          scale: [1, 1.2, 1],
          rotate: [0, 360],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "linear"
        }}
      />
      
      {/* Light Ring Effect */}
      <motion.div
        className="absolute"
        style={{
          top: '50%',
          right: '15%',
          width: '200px',
          height: '200px',
          border: '2px solid rgba(139, 92, 246, 0.3)',
          borderRadius: '50%',
          zIndex: 0
        }}
        animate={{
          scale: [1, 1.5, 1],
          opacity: [0.5, 0.2, 0.5],
          rotate: [0, -360],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "linear"
        }}
      />
      
      {/* Outer Glow */}
      <motion.div
        className="absolute"
        style={{
          top: '50%',
          right: '15%',
          width: '300px',
          height: '300px',
          background: 'radial-gradient(circle, rgba(139,92,246,0.1) 0%, transparent 70%)',
          borderRadius: '50%',
          zIndex: 0
        }}
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.3, 0.1, 0.3],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "linear"
        }}
      />
    </div>
  );
};

export default BlackHole;
