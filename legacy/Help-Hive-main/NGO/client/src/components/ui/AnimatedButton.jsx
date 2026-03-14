import { motion } from 'framer-motion';

const AnimatedButton = ({ children, className = '', ...props }) => (
  <motion.button
    whileHover={{ y: -2, scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
    className={`rounded-xl bg-accent-primary px-6 py-2.5 font-bold text-white shadow-xl shadow-accent-primary/20 transition-all duration-300 hover:shadow-accent-primary/30 ${className}`}
    {...props}
  >
    {children}
  </motion.button>
);

export default AnimatedButton;
