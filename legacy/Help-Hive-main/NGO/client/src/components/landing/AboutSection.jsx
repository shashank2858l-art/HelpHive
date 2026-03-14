import React from 'react';
import { motion } from 'framer-motion';

export default function AboutSection() {
  return (
    <section id="about" className="relative w-full bg-bg-primary py-24 md:py-32 selection:bg-accent-blue/30 overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 -m-32 h-[500px] w-[500px] rounded-full bg-accent-blue/5 blur-[120px]" />
      <div className="absolute bottom-0 left-0 -m-32 h-[500px] w-[500px] rounded-full bg-accent-mint/5 blur-[120px]" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-center text-center">
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <h2 className="mb-4 font-outfit text-3xl font-bold tracking-tight text-text-primary sm:text-4xl md:text-5xl">
              About <span className="text-gradient">HelpHive</span>
            </h2>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            className="mt-8 grid gap-8 md:grid-cols-2 text-left"
          >
            <div className="rounded-2xl border border-black/5 bg-white/60 p-8 shadow-sm backdrop-blur-xl">
              <h3 className="mb-4 font-outfit text-xl font-bold text-text-primary">Our Mission</h3>
              <p className="text-lg leading-relaxed text-text-secondary">
                HelpHive is a dedicated platform designed to bridge the gap between resources, volunteers, and those in immediate need. We mobilize emergency relief teams instantly, coordinating vital supplies where they are needed most, the moment disaster strikes.
              </p>
            </div>

            <div className="rounded-2xl border border-black/5 bg-white/60 p-8 shadow-sm backdrop-blur-xl">
              <h3 className="mb-4 font-outfit text-xl font-bold text-text-primary">Our Vision</h3>
              <p className="text-lg leading-relaxed text-text-secondary">
                Empowering humanity through a united global network. By streamlining operations and reducing administrative overhead, we enable NGOs to save more lives. We are committed to building resilient communities equipped to handle crises effectively and compassionately.
              </p>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
