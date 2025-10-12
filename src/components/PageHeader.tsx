import { motion } from 'framer-motion';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
}

export default function PageHeader({ title, subtitle }: PageHeaderProps) {
  return (
    <section className="relative overflow-hidden py-14 md:py-18 bg-hero animate-gradient">
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/10"></div>
      <div className="relative max-w-4xl mx-auto px-6 text-center">
        <motion.h1
          className="text-4xl md:text-5xl lg:text-6xl font-bold text-white/95 mb-4 tracking-tight drop-shadow-[0_1px_0_rgba(0,0,0,0.25)]"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          {title}
        </motion.h1>
        {subtitle && (
          <motion.p
            className="text-lg md:text-xl text-emerald-200 leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
          >
            {subtitle}
          </motion.p>
        )}
      </div>
    </section>
  );
}
