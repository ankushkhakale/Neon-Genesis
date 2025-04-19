
import { motion } from 'framer-motion';

const PlanetarySystem = () => {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none" style={{ zIndex: -1 }}>
      {/* Central Sun */}
      <motion.div
        className="absolute"
        style={{
          top: '50%',
          right: '15%',
          width: '100px',
          height: '100px',
          background: 'radial-gradient(circle, rgba(249,115,22,1) 0%, rgba(249,115,22,0.7) 50%, transparent 70%)',
          boxShadow: '0 0 50px rgba(249,115,22,0.5), 0 0 100px rgba(249,115,22,0.3)',
          borderRadius: '50%',
        }}
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.8, 1, 0.8],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "linear"
        }}
      />

      {/* Planet 1 - Mercury-like */}
      <motion.div
        className="absolute"
        style={{
          top: '50%',
          right: '15%',
          width: '180px',
          height: '180px',
          border: '1px solid rgba(139, 92, 246, 0.2)',
          borderRadius: '50%',
          transformOrigin: 'center',
        }}
        animate={{
          rotate: 360
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "linear"
        }}
      >
        <motion.div
          className="absolute"
          style={{
            top: '-10px',
            left: '50%',
            width: '20px',
            height: '20px',
            background: 'radial-gradient(circle, rgba(156,163,175,1) 0%, rgba(156,163,175,0.7) 50%, transparent 70%)',
            borderRadius: '50%',
            boxShadow: '0 0 10px rgba(156,163,175,0.5)',
          }}
          animate={{
            rotate: 360
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "linear"
          }}
        />
      </motion.div>

      {/* Planet 2 - Venus-like */}
      <motion.div
        className="absolute"
        style={{
          top: '50%',
          right: '15%',
          width: '280px',
          height: '280px',
          border: '1px solid rgba(139, 92, 246, 0.2)',
          borderRadius: '50%',
          transformOrigin: 'center',
        }}
        animate={{
          rotate: 360
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "linear"
        }}
      >
        <motion.div
          className="absolute"
          style={{
            top: '-15px',
            left: '50%',
            width: '30px',
            height: '30px',
            background: 'radial-gradient(circle, rgba(234,168,76,1) 0%, rgba(234,168,76,0.7) 50%, transparent 70%)',
            borderRadius: '50%',
            boxShadow: '0 0 15px rgba(234,168,76,0.5)',
          }}
          animate={{
            rotate: 360
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "linear"
          }}
        />
      </motion.div>

      {/* Planet 3 - Earth-like */}
      <motion.div
        className="absolute"
        style={{
          top: '50%',
          right: '15%',
          width: '380px',
          height: '380px',
          border: '1px solid rgba(139, 92, 246, 0.2)',
          borderRadius: '50%',
          transformOrigin: 'center',
        }}
        animate={{
          rotate: 360
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "linear"
        }}
      >
        <motion.div
          className="absolute"
          style={{
            top: '-20px',
            left: '50%',
            width: '40px',
            height: '40px',
            background: 'radial-gradient(circle, rgba(14,165,233,1) 0%, rgba(14,165,233,0.7) 50%, transparent 70%)',
            borderRadius: '50%',
            boxShadow: '0 0 20px rgba(14,165,233,0.5)',
          }}
          animate={{
            rotate: 360
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "linear"
          }}
        />
      </motion.div>

      {/* Planet 4 - Mars-like */}
      <motion.div
        className="absolute"
        style={{
          top: '50%',
          right: '15%',
          width: '480px',
          height: '480px',
          border: '1px solid rgba(139, 92, 246, 0.2)',
          borderRadius: '50%',
          transformOrigin: 'center',
        }}
        animate={{
          rotate: 360
        }}
        transition={{
          duration: 30,
          repeat: Infinity,
          ease: "linear"
        }}
      >
        <motion.div
          className="absolute"
          style={{
            top: '-15px',
            left: '50%',
            width: '30px',
            height: '30px',
            background: 'radial-gradient(circle, rgba(234,56,76,1) 0%, rgba(234,56,76,0.7) 50%, transparent 70%)',
            borderRadius: '50%',
            boxShadow: '0 0 15px rgba(234,56,76,0.5)',
          }}
          animate={{
            rotate: 360
          }}
          transition={{
            duration: 7,
            repeat: Infinity,
            ease: "linear"
          }}
        />
      </motion.div>
    </div>
  );
};

export default PlanetarySystem;
