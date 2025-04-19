
import { motion } from 'framer-motion';

const MeteorShower = () => {
  // Generate multiple meteors with different positions and delays
  const meteors = Array.from({ length: 30 }).map((_, index) => ({
    id: index,
    delay: Math.random() * 3,
    duration: 0.8 + Math.random() * 1,
    top: Math.random() * 100,
    left: 40 + Math.random() * 60,
  }));

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      {meteors.map((meteor) => (
        <motion.div
          key={meteor.id}
          initial={{
            opacity: 0,
            top: `${meteor.top}%`,
            left: `${meteor.left}%`,
            scale: 0.5,
          }}
          animate={{
            opacity: [0, 1, 0],
            top: [`${meteor.top}%`, `${meteor.top + 20}%`],
            left: [`${meteor.left}%`, `${meteor.left - 40}%`],
            scale: [0.5, 1, 0.5],
          }}
          transition={{
            duration: meteor.duration,
            delay: meteor.delay,
            repeat: Infinity,
            repeatDelay: Math.random() * 2 + 1,
          }}
          className="absolute h-1 w-20 bg-gradient-to-r from-transparent via-accent to-transparent rotate-[25deg] rounded-full"
          style={{
            boxShadow: '0 0 20px rgba(139, 92, 246, 0.8), 0 0 40px rgba(139, 92, 246, 0.6)',
          }}
        />
      ))}
    </div>
  );
};

export default MeteorShower;
