import React from 'react';
import { motion, useMotionValue as motionValue, useSpring, useTransform } from 'framer-motion';
import { Users, Package, Calendar } from 'lucide-react';

const features = [
  {
    title: 'Volunteer Management',
    description: 'Track volunteers, skills and availability. Mobilize the right people for the right tasks instantly. Our smart matching system ensures every volunteer is utilized efficiently.',
    icon: <Users className="w-8 h-8 md:w-10 md:h-10 text-accent-cyan" />,
    gradient: 'from-accent-cyan/20 to-transparent',
    border: 'group-hover:border-accent-cyan/30',
    glow: 'group-hover:shadow-[0_0_30px_rgba(45,212,191,0.15)]',
  },
  {
    title: 'Resource Inventory',
    description: 'Manage food, medicines and supplies. Prevent shortages with real-time tracking of crucial life-saving materials and automated low-stock alerts across crisis zones.',
    icon: <Package className="w-8 h-8 md:w-10 md:h-10 text-accent-purple" />,
    gradient: 'from-accent-purple/20 to-transparent',
    border: 'group-hover:border-accent-purple/30',
    glow: 'group-hover:shadow-[0_0_30px_rgba(168,85,247,0.15)]',
  },
  {
    title: 'Event Coordination',
    description: 'Create events and assign volunteers. From local food drives to large-scale disaster response operations, orchestrate every detail and ensure seamless field execution.',
    icon: <Calendar className="w-8 h-8 md:w-10 md:h-10 text-accent-blue" />,
    gradient: 'from-accent-blue/20 to-transparent',
    border: 'group-hover:border-accent-blue/30',
    glow: 'group-hover:shadow-[0_0_30px_rgba(59,130,246,0.15)]',
  }
];

// Animation variants for staggered children
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.1,
    }
  }
};

const cardVariants = {
  hidden: { opacity: 0, y: 40, scale: 0.95 },
  visible: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 20,
      mass: 1
    }
  }
};

// Text staggering inside the card
const textContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.1 }
  }
};

const textItemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.4, ease: "easeOut" }
  }
};

// Custom 3D Tilt Card Component
const FeatureCard = ({ feature, index }) => {
  // Extract base color for the structural glow
  let glowColorStr = 'rgba(59,130,246,0.2)'; // Default Blue
  if (index === 0) glowColorStr = 'rgba(45,212,191,0.2)'; // Cyan
  if (index === 1) glowColorStr = 'rgba(168,85,247,0.2)'; // Purple

  const x = motionValue(0);
  const y = motionValue(0);

  const mouseXSpring = useSpring(x);
  const mouseYSpring = useSpring(y);

  // Maximum rotation in degrees
  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["10deg", "-10deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-10deg", "10deg"]);

  // Spotlight coordinates
  const spotlightX = useSpring(motionValue(0));
  const spotlightY = useSpring(motionValue(0));
  const spotlightOpacity = useSpring(motionValue(0));

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    // Calculate mouse position relative to card center (-0.5 to 0.5)
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;

    x.set(xPct);
    y.set(yPct);

    // Update Spotlight positional pixels
    spotlightX.set(mouseX);
    spotlightY.set(mouseY);
    spotlightOpacity.set(1);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
    spotlightOpacity.set(0);
  };

  return (
    <motion.div
      variants={cardVariants}
      style={{
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
        "--glow-color": glowColorStr
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`group relative flex flex-col items-center text-center rounded-[2rem] border border-black/5 dark:border-white/5 bg-white/60 dark:bg-bg-card/40 backdrop-blur-xl p-8 md:p-10 transition-shadow duration-300 cursor-pointer shadow-lg ${feature.border}`}
    >
      {/* 3D Content Container to pop elements forward */}
      <div style={{ transform: "translateZ(50px)", transformStyle: "preserve-3d", width: '100%' }}>
        
        {/* Dynamic Glassmorphic Spotlight tracing the cursor */}
        <motion.div
          className="pointer-events-none absolute inset-0 z-0 rounded-[2rem] opacity-0 mix-blend-overlay transition-opacity duration-300"
          style={{
            background: useTransform(
              [spotlightX, spotlightY],
              ([sx, sy]) => `radial-gradient(400px circle at ${sx}px ${sy}px, rgba(255,255,255,0.4), transparent 50%)`
            ),
            opacity: spotlightOpacity,
          }}
        />

        {/* Structural Glow Ambient */}
        <div className={`absolute inset-0 rounded-[2rem] bg-gradient-to-b from-white/40 to-white/0 dark:from-white/5 dark:to-transparent ${feature.glow} opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none -z-10`} />

        {/* Icon Container */}
        <motion.div 
          className="mx-auto mb-8 relative z-10 w-max"
          whileHover={{ scale: 1.1, rotateZ: [0, -5, 5, 0] }}
          transition={{ type: "spring", stiffness: 400, damping: 10 }}
        >
          <div className="inline-flex p-5 md:p-6 rounded-2xl bg-bg-secondary border border-black/5 dark:border-white/5 shadow-inner relative overflow-hidden">
            <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-40 blur-xl`} />
            <div className="relative z-10" style={{ transform: "translateZ(20px)" }}>
              {feature.icon}
            </div>
          </div>
          <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-gradient-to-br ${feature.gradient} rounded-full blur-[30px] opacity-0 group-hover:opacity-40 transition-opacity duration-500`} />
        </motion.div>

        {/* Texts */}
        <motion.div 
          variants={textContainerVariants}
          className="flex flex-col flex-grow relative z-10"
          style={{ transform: "translateZ(30px)" }}
        >
          <motion.h3 
            variants={textItemVariants}
            className="font-outfit text-2xl md:text-3xl font-bold text-text-primary mb-4"
          >
            {feature.title}
          </motion.h3>
          <motion.p 
            variants={textItemVariants}
            className="text-text-secondary text-base leading-relaxed"
          >
            {feature.description}
          </motion.p>
        </motion.div>

      </div>
    </motion.div>
  );
};

export default function Features() {
  return (
    <section id="features" className="relative py-24 md:py-32 bg-bg-primary overflow-hidden">
      
      {/* Premium Background Orbs */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-accent-primary/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-accent-secondary/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Moving Glowing Gradient Lines (Futuristic Effect) */}
      <div className="absolute inset-0 pointer-events-none opacity-50 overflow-hidden mix-blend-screen">
        {/* Horizontal Scanner */}
        <motion.div
          animate={{
            y: ['-100%', '200%'],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "linear",
          }}
          className="absolute left-0 right-0 h-[2px] w-[200%] -ml-[50%] bg-gradient-to-r from-transparent via-accent-cyan/60 to-transparent shadow-[0_0_20px_rgba(45,212,191,0.5)]"
        />
        {/* Vertical Sweeper */}
        <motion.div
          animate={{
            x: ['-100vw', '100vw'],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear",
          }}
          className="absolute top-0 bottom-0 w-[2px] h-[200%] -mt-[50%] bg-gradient-to-b from-transparent via-accent-purple/60 to-transparent shadow-[0_0_20px_rgba(168,85,247,0.5)]"
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12">
        
        {/* Section Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-16 md:mb-24"
        >
          <h2 className="font-outfit text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-text-primary tracking-tight">
            Powerful Tools for <br className="hidden md:block"/>
            <span className="text-gradient">Modern NGOs</span>
          </h2>
          <p className="text-text-secondary text-lg md:text-xl leading-relaxed">
            A complete operating system for impact. Streamline your operations, manage resources, and mobilize volunteers from a single, intelligent platform.
          </p>
        </motion.div>

        {/* Features Grid with 3D Tilt Cards */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          style={{ perspective: 1200 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10"
        >
          {features.map((feature, index) => (
            <FeatureCard key={index} feature={feature} index={index} />
          ))}
        </motion.div>
      </div>
    </section>
  );
}
