
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

const PlanetarySystem = () => {
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight
  });

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Calculate dimensions based on window size
  const sunSize = Math.min(windowSize.width, windowSize.height) * 0.12;
  const orbitMultiplier = Math.min(windowSize.width, windowSize.height) * 0.0025;

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none" style={{ zIndex: -1 }}>
      {/* Starfield Background */}
      <div className="absolute inset-0" style={{
        background: 'radial-gradient(circle at center, #1A1F2C 0%, #030712 100%)',
        opacity: 0.4
      }} />

      <div className="absolute inset-0">
        {/* Random stars */}
        {[...Array(150)].map((_, i) => (
          <div 
            key={i}
            className="absolute rounded-full"
            style={{
              width: Math.random() * 2 + 1 + 'px',
              height: Math.random() * 2 + 1 + 'px',
              backgroundColor: `rgba(255, 255, 255, ${Math.random() * 0.7 + 0.3})`,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              boxShadow: `0 0 ${Math.random() * 6 + 2}px rgba(255, 255, 255, ${Math.random() * 0.5 + 0.5})`,
              animation: `twinkle ${Math.random() * 5 + 2}s ease-in-out infinite alternate`
            }}
          />
        ))}
      </div>

      {/* Central Sun */}
      <motion.div
        className="absolute"
        style={{
          top: '50%',
          right: '10%',
          width: `${sunSize}px`,
          height: `${sunSize}px`,
          background: 'radial-gradient(circle, rgba(255,215,0,1) 0%, rgba(249,115,22,1) 40%, rgba(239,68,68,0.7) 70%, transparent 90%)',
          boxShadow: `
            0 0 ${sunSize * 0.2}px rgba(255,215,0,0.2),
            0 0 ${sunSize * 0.4}px rgba(249,115,22,0.2),
            0 0 ${sunSize * 0.8}px rgba(239,68,68,0.1)
          `,
          borderRadius: '50%',
          transform: 'translate(50%, -50%)',
          filter: 'blur(1px)',
          zIndex: 1,
        }}
        animate={{
          scale: [1, 1.05, 1],
          opacity: [0.9, 1, 0.9],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        {/* Sun surface details */}
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              width: `${Math.random() * 30 + 10}%`,
              height: `${Math.random() * 30 + 10}%`,
              border: '1px solid rgba(255,140,0,0.5)',
              top: `${Math.random() * 70 + 15}%`,
              left: `${Math.random() * 70 + 15}%`,
              transform: 'translate(-50%, -50%)',
              opacity: 0.3,
            }}
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{
              duration: Math.random() * 5 + 3,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        ))}
      </motion.div>

      {/* Mercury - Closest to sun */}
      <motion.div
        className="absolute"
        style={{
          top: '50%',
          right: '10%',
          width: `${orbitMultiplier * 100}px`,
          height: `${orbitMultiplier * 100}px`,
          border: '1px solid rgba(255, 255, 255, 0.07)',
          borderRadius: '50%',
          transform: 'translate(50%, -50%)',
        }}
        animate={{
          rotate: 360
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "linear"
        }}
      >
        <motion.div
          className="absolute"
          style={{
            top: '0%',
            left: '50%',
            width: `${orbitMultiplier * 8}px`,
            height: `${orbitMultiplier * 8}px`,
            background: 'radial-gradient(circle, rgba(170,170,170,1) 0%, rgba(100,100,100,0.8) 50%, rgba(80,80,80,0.5) 70%, transparent 90%)',
            borderRadius: '50%',
            boxShadow: '0 0 10px rgba(170,170,170,0.3)',
            transform: 'translate(-50%, -50%)',
          }}
          animate={{
            rotate: 360,
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "linear"
          }}
        >
          <motion.div
            className="absolute inset-0 rounded-full"
            style={{
              background: 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.3) 0%, transparent 20%)',
            }}
          />
        </motion.div>
      </motion.div>

      {/* Venus */}
      <motion.div
        className="absolute"
        style={{
          top: '50%',
          right: '10%',
          width: `${orbitMultiplier * 160}px`,
          height: `${orbitMultiplier * 160}px`,
          border: '1px solid rgba(255, 255, 255, 0.07)',
          borderRadius: '50%',
          transform: 'translate(50%, -50%)',
        }}
        animate={{
          rotate: 360
        }}
        transition={{
          duration: 16,
          repeat: Infinity,
          ease: "linear"
        }}
      >
        <motion.div
          className="absolute"
          style={{
            top: '0%',
            left: '50%',
            width: `${orbitMultiplier * 15}px`,
            height: `${orbitMultiplier * 15}px`,
            background: 'radial-gradient(circle, rgba(234,175,76,1) 0%, rgba(200,140,60,0.8) 50%, rgba(180,120,40,0.5) 70%, transparent 90%)',
            borderRadius: '50%',
            boxShadow: '0 0 10px rgba(234,175,76,0.3)',
            transform: 'translate(-50%, -50%)',
          }}
          animate={{
            rotate: -360,
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "linear"
          }}
        >
          <motion.div
            className="absolute inset-0 rounded-full"
            style={{
              background: 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.4) 0%, transparent 30%)',
            }}
          />
          {/* Venus cloud patterns */}
          <motion.div
            className="absolute inset-0 rounded-full overflow-hidden opacity-30"
            animate={{
              rotate: 360
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "linear"
            }}
          >
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="absolute bg-white rounded-full opacity-40"
                style={{
                  width: '100%',
                  height: `${Math.random() * 40 + 10}%`,
                  top: `${Math.random() * 80}%`,
                  left: '0%',
                  filter: 'blur(2px)',
                }}
              />
            ))}
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Earth */}
      <motion.div
        className="absolute"
        style={{
          top: '50%',
          right: '10%',
          width: `${orbitMultiplier * 220}px`,
          height: `${orbitMultiplier * 220}px`,
          border: '1px solid rgba(255, 255, 255, 0.07)',
          borderRadius: '50%',
          transform: 'translate(50%, -50%)',
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
            top: '0%',
            left: '50%',
            width: `${orbitMultiplier * 18}px`,
            height: `${orbitMultiplier * 18}px`,
            background: 'radial-gradient(circle, rgba(14,165,233,1) 0%, rgba(15,118,168,0.8) 50%, rgba(10,80,120,0.5) 70%, transparent 90%)',
            borderRadius: '50%',
            boxShadow: '0 0 15px rgba(14,165,233,0.3)',
            transform: 'translate(-50%, -50%)',
          }}
          animate={{
            rotate: 360,
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "linear"
          }}
        >
          {/* Earth continents */}
          <motion.div
            className="absolute inset-0 rounded-full overflow-hidden"
            animate={{
              rotate: 360
            }}
            transition={{
              duration: 24,
              repeat: Infinity,
              ease: "linear"
            }}
          >
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="absolute bg-green-200 rounded-md opacity-40"
                style={{
                  width: `${Math.random() * 60 + 20}%`,
                  height: `${Math.random() * 40 + 10}%`,
                  top: `${Math.random() * 80}%`,
                  left: `${Math.random() * 80}%`,
                  transform: 'rotate(45deg)',
                  filter: 'blur(2px)',
                }}
              />
            ))}
          </motion.div>
          {/* Earth atmosphere highlight */}
          <motion.div
            className="absolute inset-0 rounded-full"
            style={{
              background: 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.5) 0%, transparent 40%)',
              borderRadius: '50%',
            }}
          />
          
          {/* Moon */}
          <motion.div
            className="absolute"
            style={{
              width: `${orbitMultiplier * 5}px`,
              height: `${orbitMultiplier * 5}px`,
              background: 'radial-gradient(circle, rgba(200,200,200,1) 0%, rgba(150,150,150,0.8) 50%, transparent 90%)',
              borderRadius: '50%',
              boxShadow: '0 0 5px rgba(200,200,200,0.3)',
            }}
            animate={{
              rotate: 360,
              x: [`${orbitMultiplier * 25}px`, `${orbitMultiplier * 25}px`],
              y: [0, 0],
            }}
            transition={{
              rotate: {
                duration: 10,
                repeat: Infinity,
                ease: "linear"
              },
              x: {
                duration: 5,
                repeat: Infinity,
                ease: "linear"
              },
              y: {
                duration: 5,
                repeat: Infinity,
                ease: "linear"
              }
            }}
          >
            <motion.div
              className="absolute inset-0 rounded-full"
              style={{
                background: 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.5) 0%, transparent 40%)',
              }}
            />
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Mars */}
      <motion.div
        className="absolute"
        style={{
          top: '50%',
          right: '10%',
          width: `${orbitMultiplier * 280}px`,
          height: `${orbitMultiplier * 280}px`,
          border: '1px solid rgba(255, 255, 255, 0.07)',
          borderRadius: '50%',
          transform: 'translate(50%, -50%)',
        }}
        animate={{
          rotate: 360
        }}
        transition={{
          duration: 32,
          repeat: Infinity,
          ease: "linear"
        }}
      >
        <motion.div
          className="absolute"
          style={{
            top: '0%',
            left: '50%',
            width: `${orbitMultiplier * 14}px`,
            height: `${orbitMultiplier * 14}px`,
            background: 'radial-gradient(circle, rgba(234,88,12,1) 0%, rgba(180,60,10,0.8) 50%, rgba(150,40,10,0.5) 70%, transparent 90%)',
            borderRadius: '50%',
            boxShadow: '0 0 15px rgba(234,88,12,0.3)',
            transform: 'translate(-50%, -50%)',
          }}
          animate={{
            rotate: 360,
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "linear"
          }}
        >
          <motion.div
            className="absolute inset-0 rounded-full"
            style={{
              background: 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.3) 0%, transparent 30%)',
            }}
          />
          {/* Mars surface details */}
          <motion.div
            className="absolute inset-0 rounded-full overflow-hidden opacity-50"
            animate={{
              rotate: 360
            }}
            transition={{
              duration: 28,
              repeat: Infinity,
              ease: "linear"
            }}
          >
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="absolute bg-orange-800 rounded-full"
                style={{
                  width: `${Math.random() * 30 + 10}%`,
                  height: `${Math.random() * 30 + 10}%`,
                  top: `${Math.random() * 80}%`,
                  left: `${Math.random() * 80}%`,
                  filter: 'blur(1px)',
                }}
              />
            ))}
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Jupiter */}
      <motion.div
        className="absolute"
        style={{
          top: '50%',
          right: '10%',
          width: `${orbitMultiplier * 380}px`,
          height: `${orbitMultiplier * 380}px`,
          border: '1px solid rgba(255, 255, 255, 0.07)',
          borderRadius: '50%',
          transform: 'translate(50%, -50%)',
        }}
        animate={{
          rotate: 360
        }}
        transition={{
          duration: 60,
          repeat: Infinity,
          ease: "linear"
        }}
      >
        <motion.div
          className="absolute"
          style={{
            top: '0%',
            left: '50%',
            width: `${orbitMultiplier * 35}px`,
            height: `${orbitMultiplier * 35}px`,
            background: 'radial-gradient(circle, rgba(221,168,103,1) 0%, rgba(193,132,72,0.8) 50%, rgba(150,100,50,0.5) 70%, transparent 90%)',
            borderRadius: '50%',
            boxShadow: '0 0 20px rgba(221,168,103,0.3)',
            transform: 'translate(-50%, -50%)',
          }}
          animate={{
            rotate: 360,
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "linear"
          }}
        >
          {/* Jupiter bands */}
          <motion.div
            className="absolute inset-0 rounded-full overflow-hidden"
          >
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="absolute w-full"
                style={{
                  height: `${6 + i * 3}%`,
                  top: `${10 + i * 15}%`,
                  left: '0%',
                  background: i % 2 === 0 ? 'rgba(150,100,70,0.5)' : 'rgba(230,190,140,0.4)',
                  filter: 'blur(2px)',
                }}
              />
            ))}
            {/* Great Red Spot */}
            <motion.div
              className="absolute bg-red-500 rounded-full opacity-60"
              style={{
                width: '25%',
                height: '15%',
                top: '40%',
                left: '60%',
                filter: 'blur(2px)',
              }}
              animate={{
                x: [0, 10, 0],
              }}
              transition={{
                duration: 10,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          </motion.div>
          <motion.div
            className="absolute inset-0 rounded-full"
            style={{
              background: 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.3) 0%, transparent 30%)',
            }}
          />
        </motion.div>
      </motion.div>

      {/* Asteroid belt */}
      <motion.div
        className="absolute"
        style={{
          top: '50%',
          right: '10%',
          width: `${orbitMultiplier * 330}px`,
          height: `${orbitMultiplier * 330}px`,
          transform: 'translate(50%, -50%)',
          opacity: 0.4,
        }}
      >
        {[...Array(60)].map((_, i) => {
          const angle = Math.random() * Math.PI * 2;
          const distance = 145 + Math.random() * 40;
          return (
            <motion.div
              key={i}
              className="absolute bg-gray-300 rounded-sm"
              style={{
                width: `${Math.random() * 3 + 1}px`,
                height: `${Math.random() * 3 + 1}px`,
                left: `${distance * Math.cos(angle) + 50}%`,
                top: `${distance * Math.sin(angle) + 50}%`,
                boxShadow: '0 0 2px rgba(255,255,255,0.5)',
              }}
              animate={{
                rotate: 360,
                x: [0, Math.random() * 10 - 5, 0],
                y: [0, Math.random() * 10 - 5, 0],
              }}
              transition={{
                rotate: {
                  duration: 100 + Math.random() * 100,
                  repeat: Infinity,
                  ease: "linear"
                },
                x: {
                  duration: 5 + Math.random() * 5,
                  repeat: Infinity,
                  ease: "easeInOut"
                },
                y: {
                  duration: 5 + Math.random() * 5,
                  repeat: Infinity,
                  ease: "easeInOut"
                }
              }}
            />
          );
        })}
      </motion.div>
    </div>
  );
};

export default PlanetarySystem;
