import { motion } from 'motion/react';

function mulberry32(seed: number) {
  let t = seed >>> 0;
  return () => {
    t += 0x6D2B79F5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

export function SpaceLoadingScreen() {
  return (
    <div className="fixed inset-0 bg-black flex items-center justify-center overflow-hidden">
      {/* Subtle stars - matching the intro */}
      <div className="absolute inset-0">
        {[...Array(100)].map((_, i) => {
          const rand = mulberry32(i + 1);
          const left = rand() * 100;
          const top = rand() * 100;
          const width = rand() * 2 + 0.5;
          const height = rand() * 2 + 0.5;
          const duration = 3 + rand() * 4;
          const delay = rand() * 3;

          return (
            <motion.div
              key={i}
              className="absolute bg-white rounded-full"
              style={{
                left: `${left}%`,
                top: `${top}%`,
                width: `${width}px`,
                height: `${height}px`,
              }}
              animate={{
                opacity: [0.3, 0.8, 0.3],
              }}
              transition={{
                duration,
                repeat: Infinity,
                delay,
                ease: "easeInOut",
              }}
            />
          );
        })}
      </div>

      {/* Central loading spinner */}
      <div className="relative z-10">
        {/* Minimal spinner with cyan accent */}
        <div className="relative w-40 h-40">
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-gray-800"
            style={{
              borderTopColor: '#0D8570',
              borderRightColor: '#0D8570',
            }}
            animate={{ rotate: 360 }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "linear",
            }}
          />
          
          {/* Inner ring */}
          <motion.div
            className="absolute inset-6 rounded-full border-2 border-gray-900"
            style={{
              borderBottomColor: '#0D8570',
              borderLeftColor: '#0D8570',
            }}
            animate={{ rotate: -360 }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "linear",
            }}
          />
          
          {/* Center dot */}
          <div className="absolute inset-0 flex items-center justify-center">
            {/* Outer glow layers */}
            <motion.div
              className="absolute w-16 h-16 rounded-full"
              style={{ 
                background: 'radial-gradient(circle, rgba(13, 133, 112, 0.3) 0%, rgba(13, 133, 112, 0.1) 50%, transparent 70%)',
              }}
              animate={{
                scale: [1, 1.3, 1],
                opacity: [0.6, 1, 0.6],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
            
            {/* Middle glow */}
            <motion.div
              className="absolute w-10 h-10 rounded-full"
              style={{ 
                background: 'radial-gradient(circle, rgba(13, 133, 112, 0.5) 0%, rgba(13, 133, 112, 0.2) 60%, transparent 80%)',
                filter: 'blur(4px)',
              }}
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.7, 1, 0.7],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
            
            {/* Inner bright glow */}
            <motion.div
              className="absolute w-6 h-6 rounded-full"
              style={{ 
                background: 'radial-gradient(circle, rgba(13, 133, 112, 0.9) 0%, rgba(13, 133, 112, 0.5) 50%, transparent 70%)',
                filter: 'blur(2px)',
              }}
              animate={{
                scale: [1, 1.1, 1],
                opacity: [0.8, 1, 0.8],
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
            
            {/* Core orb */}
            <motion.div
              className="w-3 h-3 rounded-full relative"
              style={{ 
                backgroundColor: '#0D8570',
                boxShadow: '0 0 10px rgba(13, 133, 112, 0.8), 0 0 20px rgba(13, 133, 112, 0.5), 0 0 30px rgba(13, 133, 112, 0.3)',
              }}
              animate={{
                scale: [1, 1.2, 1],
                boxShadow: [
                  '0 0 10px rgba(13, 133, 112, 0.8), 0 0 20px rgba(13, 133, 112, 0.5), 0 0 30px rgba(13, 133, 112, 0.3)',
                  '0 0 15px rgba(13, 133, 112, 1), 0 0 30px rgba(13, 133, 112, 0.7), 0 0 45px rgba(13, 133, 112, 0.5)',
                  '0 0 10px rgba(13, 133, 112, 0.8), 0 0 20px rgba(13, 133, 112, 0.5), 0 0 30px rgba(13, 133, 112, 0.3)',
                ],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          </div>
        </div>
      </div>

      {/* Occasional shooting star - very subtle */}
      {[...Array(2)].map((_, i) => (
        <motion.div
          key={`shooting-${i}`}
          className="absolute w-0.5 h-0.5 rounded-full"
          style={{
            left: `${20 + i * 40}%`,
            top: `${10 + i * 30}%`,
            backgroundColor: '#0D8570',
            boxShadow: '0 0 8px rgba(13, 133, 112, 0.6), -30px 0 20px rgba(13, 133, 112, 0.2)',
          }}
          animate={{
            x: [0, 300],
            y: [0, 300],
            opacity: [0, 0.8, 0],
          }}
          transition={{
            duration: 2.5,
            repeat: Infinity,
            delay: i * 6 + 2,
            ease: "easeOut",
            repeatDelay: 8,
          }}
        />
      ))}
    </div>
  );
}