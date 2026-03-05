import { Shield, Clock, Phone, CheckCircle, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';
import Section from '../components/Section';
import Card from '../components/Card';

export default function Home() {
  const serviceArea = import.meta.env.VITE_SERVICE_AREA;
  const phone = '(321) 282-9795';

  return (
    <div>
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0 bg-center bg-contain bg-no-repeat opacity-[0.38]"
          style={{ backgroundImage: 'url(/treetek-logo.png)' }}
        ></div>
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/40 via-emerald-800/35 to-emerald-700/30"></div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-32 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9 }}
          >
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight tracking-tight drop-shadow-[0_3px_6px_rgba(0,0,0,0.4)]">
              Complete Tree Services<br />& Stump Grinding
            </h1>

            <p className="text-lg sm:text-xl md:text-2xl text-white mb-10 font-semibold leading-relaxed drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]">
              Serving Central Florida • Port Orange • Daytona • New Smyrna
            </p>

            <div className="flex flex-wrap justify-center gap-4 mb-12">
              <motion.div
                className="flex items-center bg-white/95 backdrop-blur-sm px-5 py-3 rounded-xl shadow-lg border border-white/50"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.3 }}
              >
                <Shield className="w-6 h-6 text-emerald-700 mr-2.5" />
                <span className="font-bold text-gray-900 text-base sm:text-lg">Licensed & Insured</span>
              </motion.div>
              <motion.div
                className="flex items-center bg-white/95 backdrop-blur-sm px-5 py-3 rounded-xl shadow-lg border border-white/50"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.4 }}
              >
                <Clock className="w-6 h-6 text-emerald-700 mr-2.5" />
                <span className="font-bold text-gray-900 text-base sm:text-lg">24/7 Emergency Service</span>
              </motion.div>
            </div>

            <motion.div
              className="flex flex-col sm:flex-row justify-center gap-5"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.5 }}
            >
              <a
                href="/quote"
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-4 px-10 rounded-md shadow-lg transition-all duration-300 transform hover:scale-105"
              >
                Request a Free Quote
              </a>
              <a
                href="tel:3212829795"
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-4 px-10 rounded-md shadow-lg transition-all duration-300 transform hover:scale-105 flex items-center justify-center"
              >
                <Phone className="w-5 h-5 mr-3" />
                Call Now
              </a>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <Section variant="white">
        <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-12">
          Our Services
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { title: 'Tree Removal', desc: 'Safe and efficient removal of trees of any size' },
            { title: 'Trimming & Pruning', desc: 'Professional tree maintenance and health care' },
            { title: 'Crane Work', desc: 'Specialized crane-assisted tree services' },
            { title: 'Storm Cleanup', desc: '24/7 emergency storm damage response' },
            { title: 'Stump Grinding', desc: 'Complete stump removal and grinding services' },
          ].map((service, index) => (
            <Card key={index} variant="gray">
              <CheckCircle className="w-12 h-12 text-emerald-600 mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">{service.title}</h3>
              <p className="text-gray-600 mb-4">{service.desc}</p>
              <a
                href={`/quote?service=${encodeURIComponent(service.title)}`}
                className="text-emerald-600 hover:text-emerald-700 font-semibold inline-flex items-center"
              >
                Get a Quote →
              </a>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <a
            href="/services"
            className="inline-block bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 px-8 rounded-md shadow-lg transition-all"
          >
            View All Services
          </a>
        </div>
      </Section>

      <Section variant="gray">
        <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-4">
          Serving Central Florida
        </h2>
        <p className="text-xl text-center text-gray-600 mb-12">
          {serviceArea}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div>
            <div className="text-4xl font-bold text-emerald-600 mb-2">10+</div>
            <p className="text-gray-700">Years Experience</p>
          </div>
          <div>
            <div className="text-4xl font-bold text-emerald-600 mb-2">500+</div>
            <p className="text-gray-700">Jobs Completed</p>
          </div>
          <div>
            <div className="text-4xl font-bold text-emerald-600 mb-2">100%</div>
            <p className="text-gray-700">Customer Satisfaction</p>
          </div>
        </div>
      </Section>

      <Section className="bg-emergency animate-gradient text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/20 to-transparent"></div>
        <div className="relative max-w-4xl mx-auto bg-gradient-to-br from-black/30 to-transparent rounded-xl shadow-xl p-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-3 mb-3">
                <AlertTriangle className="w-8 h-8 text-red-400 animate-pulse" />
                <h2 className="text-2xl md:text-3xl font-extrabold text-white drop-shadow-[0_3px_6px_rgba(0,0,0,0.5)]">
                  Need Emergency Tree Service?
                </h2>
              </div>
              <p className="text-lg text-white font-medium drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]">
                Available 24/7 for storm damage and fallen trees
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 shrink-0">
              <a
                href="tel:3212829795"
                className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-md shadow-lg transition-all flex items-center justify-center whitespace-nowrap animate-pulse-ring"
              >
                <Phone className="w-5 h-5 mr-2" />
                (321) 282-9795
              </a>
            </div>
          </div>
        </div>
      </Section>
    </div>
  );
}
