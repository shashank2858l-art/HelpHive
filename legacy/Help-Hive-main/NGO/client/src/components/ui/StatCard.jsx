import { motion } from 'framer-motion';

const StatCard = ({ title, value, icon: Icon, colorClass }) => (
  <motion.div
    initial={{ opacity: 0, y: 24 }}
    animate={{ opacity: 1, y: 0 }}
    whileHover={{ y: -4 }}
    className="rounded-2xl border border-black/5 bg-white shadow-sm p-6 transition-all duration-300 hover:shadow-xl"
  >
    <div className="mb-4 flex items-center justify-between">
      <p className="text-sm font-semibold text-text-tertiary uppercase tracking-wider">{title}</p>
      <div className={`rounded-xl p-2.5 ${colorClass.replace('-700', '-500')} shadow-soft`}>
        <Icon className="h-5 w-5 text-white" />
      </div>
    </div>
    <p className="text-3xl font-bold text-text-primary">{value}</p>
  </motion.div>
);

export default StatCard;
