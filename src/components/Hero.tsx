import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface HeroProps {
  children: ReactNode;
}

export default function Hero({ children }: HeroProps) {
  return (
    <section className="relative overflow-hidden py-20 md:py-28 bg-hero animate-gradient text-center">
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/10"></div>
      <div className="relative max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        {children}
      </div>
    </section>
  );
}

interface HeroLogoProps {
  src: string;
  alt: string;
}

export function HeroLogo({ src, alt }: HeroLogoProps) {
  return (
    <motion.div
      className="relative max-w-xl mx-auto mb-12"
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 1, ease: "easeOut" }}
    >
      <div className="glass glow-center p-4 sm:p-6">
        <motion.img
          src={src}
          alt={alt}
          className="w-full h-auto mx-auto"
          initial={{ scale: 0.95 }}
          animate={{ scale: 1 }}
          transition={{
            duration: 2,
            repeat: Infinity,
            repeatType: "reverse",
            ease: "easeInOut"
          }}
        />
      </div>
    </motion.div>
  );
}

interface HeroContentProps {
  children: ReactNode;
}

export function HeroContent({ children }: HeroContentProps) {
  return (
    <motion.div
      className="max-w-4xl mx-auto"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.9, delay: 0.2, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}
