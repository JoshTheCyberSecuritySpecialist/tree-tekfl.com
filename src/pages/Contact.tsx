import { Phone, Mail, MapPin, Clock, ArrowRight } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import Section from '../components/Section';
import Card from '../components/Card';

export default function Contact() {
  const phone = import.meta.env.VITE_PHONE;
  const email = import.meta.env.VITE_EMAIL;
  const serviceArea = import.meta.env.VITE_SERVICE_AREA;

  return (
    <div>
      <PageHeader
        title="Contact TREE TEK"
        subtitle="Serving Central Florida • Port Orange • Daytona • Ormond • New Smyrna"
      />

      <Section variant="white">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-8">
                Get in Touch
              </h2>

              <div className="space-y-6">
                <div className="flex items-start">
                  <div className="bg-emerald-100 rounded-lg p-3 mr-4">
                    <Phone className="w-6 h-6 text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Phone</h3>
                    <a
                      href={`tel:${phone}`}
                      className="text-lg text-emerald-600 hover:text-emerald-700 font-semibold"
                    >
                      {phone}
                    </a>
                    <p className="text-sm text-gray-600 mt-1">
                      Available for emergency calls 24/7
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="bg-emerald-100 rounded-lg p-3 mr-4">
                    <Mail className="w-6 h-6 text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Email</h3>
                    <a
                      href={`mailto:${email}`}
                      className="text-lg text-emerald-600 hover:text-emerald-700"
                    >
                      {email}
                    </a>
                    <p className="text-sm text-gray-600 mt-1">
                      We'll respond within 24 hours
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="bg-emerald-100 rounded-lg p-3 mr-4">
                    <MapPin className="w-6 h-6 text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Service Area</h3>
                    <p className="text-gray-700">{serviceArea}</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="bg-emerald-100 rounded-lg p-3 mr-4">
                    <Clock className="w-6 h-6 text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Hours</h3>
                    <p className="text-gray-700">Monday - Saturday: 7:00 AM - 7:00 PM</p>
                    <p className="text-gray-700">Sunday: By appointment</p>
                    <p className="text-sm text-gray-600 mt-1">
                      Emergency services available 24/7
                    </p>
                  </div>
                </div>
              </div>

              <Card variant="gray" className="mt-8">
                <h3 className="font-semibold text-gray-900 mb-2 flex items-center">
                  <Clock className="w-5 h-5 text-emerald-600 mr-2" />
                  24/7 Emergency Service
                </h3>
                <p className="text-gray-700 mb-4">
                  Storm damage? Fallen tree? We're available around the clock for emergency tree services.
                </p>
                <a
                  href={`tel:${phone}`}
                  className="inline-block bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-lg shadow-emerald-900/20"
                >
                  Call for Emergency Service
                </a>
              </Card>
            </div>

            <Card variant="gray" className="h-full min-h-[400px] flex items-center justify-center">
              <div className="text-center">
                <MapPin className="w-16 h-16 text-emerald-600 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  Serving Central Florida
                </h3>
                <p className="text-gray-600 mb-6">
                  We proudly serve Port Orange, Daytona Beach, Ormond Beach, New Smyrna Beach, and surrounding areas.
                </p>
                <a
                  href="/quote"
                  className="inline-block bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 px-8 rounded-xl transition-all shadow-lg shadow-emerald-900/20"
                >
                  Request a Quote
                </a>
              </div>
            </Card>
          </div>
      </Section>

      <Section className="bg-cta-gradient animate-gradient text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'url(/treetek-logo.png)', backgroundSize: 'contain', backgroundPosition: 'center', backgroundRepeat: 'no-repeat' }}></div>
        <div className="relative max-w-4xl mx-auto text-center px-6 py-12">
          <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4 drop-shadow-lg">
            Ready to Get Started?
          </h2>
          <p className="text-lg md:text-xl text-emerald-50/90 mb-8">
            Contact us for a free, no-obligation quote
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <a
              href="/quote"
              className="inline-flex items-center justify-center gap-2 bg-white hover:bg-emerald-100 text-emerald-700 font-bold py-4 px-8 rounded-md shadow-xl transition-all hover:scale-105 animate-subtle-pulse"
            >
              Get a Free Quote
              <ArrowRight className="w-5 h-5" />
            </a>
            <a
              href={`tel:${phone}`}
              className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white border-2 border-white/30 font-bold py-4 px-8 rounded-md shadow-lg transition-all"
            >
              <Phone className="w-5 h-5" />
              {phone}
            </a>
          </div>
        </div>
      </Section>
    </div>
  );
}
