import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function CTASection() {
  return (
    <section className="py-24 relative overflow-hidden bg-bg-primary">
      <div className="max-w-5xl mx-auto px-6 md:px-12 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-white/80 backdrop-blur-xl p-12 md:p-16 rounded-[2.5rem] text-center relative overflow-hidden border border-black/5 shadow-2xl"
        >
          {/* Animated Background Gradients */}
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-accent-primary/10 rounded-full blur-[100px] translate-x-1/2 -translate-y-1/2 animate-pulse-glow" />
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-accent-secondary/10 rounded-full blur-[100px] -translate-x-1/2 translate-y-1/2 animate-pulse-glow" style={{ animationDelay: '2s' }} />
          
          <div className="relative z-10 max-w-2xl mx-auto flex flex-col items-center">
            <h2 className="font-outfit text-4xl md:text-5xl font-bold mb-6 text-text-primary leading-tight">
              Ready to uplevel your NGO operations?
            </h2>
            <p className="text-xl text-text-secondary mb-10 max-w-xl font-medium">
              Join hundreds of organizations saving time and maximizing their impact with HelpHive.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center w-full max-w-sm">
              <Link to="/register" className="btn-primary w-full flex items-center justify-center gap-2 group flex-1 !bg-none !bg-accent-primary hover:!bg-accent-primary/90">
                Get Started Now
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
