import { motion } from 'framer-motion';

const PageHeader = ({ title, subtitle, action }) => (
  <motion.div
    initial={{ opacity: 0, y: 14 }}
    animate={{ opacity: 1, y: 0 }}
    className="mb-6 flex flex-wrap items-center justify-between gap-3"
  >
    <div>
      <h1 className="font-outfit text-3xl font-bold text-text-primary md:text-4xl">{title}</h1>
      <p className="text-sm font-semibold text-text-tertiary mt-1">{subtitle}</p>
    </div>
    {action}
  </motion.div>
);

export default PageHeader;
