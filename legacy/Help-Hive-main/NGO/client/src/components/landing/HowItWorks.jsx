import React, { useRef } from 'react';
import { motion, useScroll, useTransform, useSpring, useReducedMotion } from 'framer-motion';
import { UserPlus, PackageSearch, CalendarCheck } from 'lucide-react';

const steps = [
  {
    id: 'step-1',
    title: 'Register Volunteers',
    description: 'Collect skills, contact & availability — onboard volunteers fast.',
    icon: <UserPlus className="w-6 h-6 md:w-8 md:h-8 text-white" />,
    gradient: 'from-[#00F0FF] to-[#0080FF]', // Cyan to Blue
    shadowColor: 'rgba(0,240,255,0.2)',
  },
  {
    id: 'step-2',
    title: 'Add Resources',
    description: 'Track food, medicine, clothes — set low stock alerts.',
    icon: <PackageSearch className="w-6 h-6 md:w-8 md:h-8 text-white" />,
    gradient: 'from-[#0080FF] to-[#8A2BE2]', // Blue to Indigo
    shadowColor: 'rgba(0,128,255,0.2)',
  },
  {
    id: 'step-3',
    title: 'Create Events & Assign',
    description: 'Spin up events and auto-suggest volunteers by skills.',
    icon: <CalendarCheck className="w-6 h-6 md:w-8 md:h-8 text-white" />,
    gradient: 'from-[#8A2BE2] to-[#FF00FF]', // Indigo to Violet
    shadowColor: 'rgba(138,43,226,0.2)',
  }
];

export default function HowItWorks() {
  const containerRef = useRef(null);
  const prefersReducedMotion = useReducedMotion();

  // Scroll tracking for the SVG Line
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start center", "end center"]
  });

  // Spring animation for smooth SVG drawing
  const pathLength = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  // Parallax background blob moving opposite to scroll
  const backgroundY = useTransform(scrollYProgress, [0, 1], ['0%', '-30%']);

  // Animation variants for standard entry
  const cardVariants = {
    hidden: { opacity: 0, y: prefersReducedMotion ? 0 : 24, scale: prefersReducedMotion ? 1 : 0.98 },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: { duration: 0.5, ease: "easeOut" }
    }
  };

  const textContainerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.1 }
    }
  };

  const textVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
  };

  return (
    <section 
      id="how-it-works" 
      aria-labelledby="how-it-works-title" 
      ref={containerRef}
      className="relative py-24 md:py-40 bg-bg-primary overflow-hidden"
    >
      {/* Parallax Background Blob */}
      {!prefersReducedMotion && (
        <motion.div 
          style={{ y: backgroundY }}
          className="absolute top-1/4 left-1/2 -translate-x-1/2 w-full max-w-[800px] h-[800px] rounded-full bg-gradient-to-b from-[#00F0FF]/5 via-[#8A2BE2]/5 to-[#FF00FF]/5 blur-[120px] pointer-events-none"
        />
      )}

      <div className="relative z-10 max-w-6xl mx-auto px-6 md:px-12">
        <header className="text-center mb-20 md:mb-32">
          <motion.h2 
            id="how-it-works-title"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            className="font-outfit text-3xl md:text-5xl lg:text-6xl font-bold text-text-primary tracking-tight"
          >
            How <span className="text-gradient">HelpHive</span> Works
          </motion.h2>
        </header>

        <div className="relative">
          {/* Animated Curved SVG Connector (Desktop & Mobile) */}
          <div className="absolute left-[23px] md:left-1/2 top-0 bottom-0 w-[4px] md:w-[600px] -ml-[2px] md:-ml-[300px] z-0 overflow-hidden md:overflow-visible">
             
             {/* Mobile: Straight line (since cards are stacked) */}
             <div className="block md:hidden absolute inset-0 bg-white/5" />
             {!prefersReducedMotion && (
                <motion.div 
                  className="block md:hidden absolute top-0 w-full bg-gradient-to-b from-[#00F0FF] via-[#8A2BE2] to-[#FF00FF] origin-top shadow-[0_0_15px_rgba(138,43,226,0.6)]"
                  style={{ scaleY: pathLength, height: '100%' }}
                />
             )}

             {/* Desktop: Smooth meandering curved SVG */}
             <div className="hidden md:block absolute inset-0 pointer-events-none">
                <svg 
                  viewBox="0 0 600 1000" 
                  preserveAspectRatio="xMidYMin slice" 
                  className="w-full h-full drop-shadow-[0_0_15px_rgba(138,43,226,0.4)]"
                >
                    {/* Base faint track */}
                    <path
                        d="M 300 0 C 300 150, 100 150, 100 300 C 100 450, 500 450, 500 650 C 500 850, 300 850, 300 1000"
                        fill="none"
                        stroke="rgba(255,255,255,0.05)"
                        strokeWidth="4"
                    />
                    
                    {/* Drawn glowing path */}
                    {!prefersReducedMotion && (
                      <motion.path
                          d="M 300 0 C 300 150, 100 150, 100 300 C 100 450, 500 450, 500 650 C 500 850, 300 850, 300 1000"
                          fill="none"
                          stroke="url(#timeline-gradient)"
                          strokeWidth="4"
                          style={{ pathLength }}
                          strokeLinecap="round"
                      />
                    )}

                    <defs>
                        <linearGradient id="timeline-gradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#00F0FF" />
                            <stop offset="50%" stopColor="#8A2BE2" />
                            <stop offset="100%" stopColor="#FF00FF" />
                        </linearGradient>
                    </defs>
                </svg>
             </div>
          </div>

          <ol role="list" className="relative space-y-12 md:space-y-32 py-10">
            {steps.map((step, index) => {
              const isEven = index % 2 === 0;
              
              // Custom positions for desktop nodes to perfectly align with the bezier curve extrema
              let nodeLeftPos = '50%';
              if (index === 0) nodeLeftPos = 'calc(50% - 200px)'; // x=100 on the 600px viewBox
              else if (index === 1) nodeLeftPos = 'calc(50% + 200px)'; // x=500
              else if (index === 2) nodeLeftPos = '50%'; // x=300

              return (
                <li key={step.id} className="relative flex flex-col items-start md:items-center">
                  
                  {/* Central Node / Pulse - positioned exactly on the SVG curve for desktop, static left on mobile */}
                  <div 
                    className="absolute left-6 md:top-1/2 -translate-x-1/2 md:-translate-y-1/2 w-0 h-0 z-20 flex items-center justify-center transition-all duration-300"
                    style={{ left: window.innerWidth >= 768 ? nodeLeftPos : '1.5rem' }}
                  >
                    <motion.div 
                      initial={{ scale: 0, opacity: 0 }}
                      whileInView={{ scale: 1, opacity: 1 }}
                      viewport={{ once: false, amount: 0.5 }}
                      className="w-4 h-4 rounded-full bg-bg-primary border-2 border-[#8A2BE2] relative"
                    >
                      <motion.div 
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: [0, 1, 0] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                        className={`absolute inset-0 rounded-full shadow-[0_0_20px_${step.shadowColor}] bg-gradient-to-r ${step.gradient}`}
                      />
                    </motion.div>
                  </div>

                  {/* Desktop Layout Alternance: spacer for one side, content for the other */}
                  <div className={`hidden md:block w-1/2 ${isEven ? 'order-1 pr-16' : 'order-2 pl-16'}`} />

                  {/* Card Content container */}
                  <div className={`w-full md:w-1/2 pl-16 md:pl-0 ${isEven ? 'md:order-2 md:pl-16' : 'md:order-1 md:pr-16'}`}>
                    <motion.div
                      variants={cardVariants}
                      initial="hidden"
                      whileInView="visible"
                      viewport={{ once: false, amount: 0.25 }}
                      whileHover={!prefersReducedMotion ? { 
                        rotateX: isEven ? 2 : -2, 
                        rotateY: isEven ? -2 : 2,
                        y: -5,
                        boxShadow: `0 20px 40px ${step.shadowColor}`,
                        transition: { duration: 0.3 }
                      } : {}}
                      tabIndex={0}
                      className="group relative flex flex-col md:flex-row items-start gap-6 rounded-[2rem] border border-white/5 bg-white/5 dark:bg-bg-card/40 backdrop-blur-xl p-6 md:p-8 outline-none focus:ring-2 focus:ring-[#8A2BE2] transition-all [perspective:1000px] cursor-pointer"
                    >
                      {/* Icon Container with subtle glow on hover */}
                      <motion.div 
                        className="relative shrink-0"
                        whileHover={{ scale: 1.1 }}
                      >
                        <div className={`p-4 rounded-2xl bg-gradient-to-br ${step.gradient} relative z-10 shadow-lg`}>
                          {step.icon}
                        </div>
                        <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${step.gradient} blur-xl opacity-0 group-hover:opacity-70 transition-opacity duration-300`} />
                      </motion.div>

                      {/* Text Content */}
                      <motion.div variants={textContainerVariants} className="flex-1 pt-1 md:pt-2">
                        <motion.h3 
                          variants={textVariants}
                          className="font-outfit text-xl md:text-2xl font-bold text-text-primary mb-2"
                        >
                          {step.title}
                        </motion.h3>
                        <motion.p 
                          variants={textVariants}
                          className="text-text-secondary text-base leading-relaxed"
                        >
                          {step.description}
                        </motion.p>
                      </motion.div>

                    </motion.div>
                  </div>

                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </section>
  );
}
