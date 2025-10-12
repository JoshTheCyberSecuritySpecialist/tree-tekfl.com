import { TreeDeciduous, Scissors, Truck, Cloud, Disc, ArrowRight } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import Section from '../components/Section';
import Card from '../components/Card';

const services = [
  {
    icon: TreeDeciduous,
    title: 'Tree Removal',
    description: 'Complete tree removal services for trees of any size. We safely remove dead, diseased, or hazardous trees from residential and commercial properties throughout Central Florida.',
    features: [
      'Safe removal of trees of any size',
      'Hazardous tree assessment',
      'Dead or diseased tree removal',
      'Complete debris cleanup',
      'Stump grinding available',
    ],
    image: '/images/past-work/tree-removal-central-florida-brush-clearing.jpg',
    imageAlt: 'TREE TEK performing complete tree removal and brush clearing in Central Florida',
  },
  {
    icon: Scissors,
    title: 'Trimming & Pruning',
    description: 'Professional tree trimming and pruning services to maintain the health, safety, and appearance of your trees. Regular maintenance helps prevent disease and storm damage.',
    features: [
      'Crown thinning and shaping',
      'Deadwood removal',
      'Health maintenance pruning',
      'Storm damage prevention',
      'Aesthetic tree shaping',
    ],
    image: '/images/past-work/bucket-truck-tree-service-new-smyrna-central-fl.jpg',
    imageAlt: 'TREE TEK bucket truck and wood chipper providing tree service in New Smyrna Beach, Central Florida',
  },
  {
    icon: Truck,
    title: 'Crane Work',
    description: 'Specialized crane-assisted tree removal for difficult-to-reach or hazardous situations. Our experienced team handles complex tree removal jobs safely and efficiently.',
    features: [
      'Large tree removal',
      'Difficult access situations',
      'Near-structure tree work',
      'Heavy lifting capability',
      'Minimal property impact',
    ],
    image: '/images/past-work/large-tree-removal-crane-service-port-orange-central-fl.jpg',
    imageAlt: 'TREE TEK crane service removing large tree in Port Orange, Central Florida',
  },
  {
    icon: Cloud,
    title: 'Storm Cleanup',
    description: '24/7 emergency response for storm-damaged trees. We quickly and safely remove fallen trees, hanging branches, and storm debris to restore safety to your property.',
    features: [
      '24/7 emergency availability',
      'Rapid response time',
      'Fallen tree removal',
      'Hanging branch elimination',
      'Complete debris removal',
    ],
    image: '/images/past-work/hurricane-storm-damage-tree-removal-central-florida.jpg',
    imageAlt: 'TREE TEK emergency response to hurricane storm damage tree removal in Central Florida',
  },
  {
    icon: Disc,
    title: 'Stump Grinding',
    description: 'Complete stump removal and grinding services. We eliminate unsightly stumps and roots, allowing you to reclaim your yard space for new landscaping or construction.',
    features: [
      'Complete stump removal',
      'Below-grade grinding',
      'Root removal',
      'Minimal lawn damage',
      'Debris cleanup included',
    ],
    image: '/images/past-work/log-hauling-mini-loader-tree-cleanup-central-fl.jpg',
    imageAlt: 'TREE TEK mini loader hauling logs and clearing stumps during tree cleanup in Central Florida',
  },
];

export default function Services() {
  return (
    <div>
      <PageHeader
        title="Our Services"
        subtitle="Professional tree care across Central Florida"
      />

      <Section variant="white">
        <div className="space-y-12">
          {services.map((service, index) => {
            const Icon = service.icon;
            return (
              <Card
                key={index}
                className={`flex flex-col ${
                  index % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'
                } gap-8 items-center`}
              >
                <div className="flex-1">
                  <div className="bg-emerald-100 w-16 h-16 rounded-lg flex items-center justify-center mb-4">
                    <Icon className="w-8 h-8 text-emerald-600" />
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">
                    {service.title}
                  </h2>
                  <p className="text-lg text-gray-600 mb-6">
                    {service.description}
                  </p>
                  <ul className="space-y-3 mb-6">
                    {service.features.map((feature, i) => (
                      <li key={i} className="flex items-start">
                        <svg
                          className="w-6 h-6 text-emerald-600 mr-3 flex-shrink-0 mt-0.5"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <a
                    href={`/quote?service=${encodeURIComponent(service.title)}`}
                    className="inline-block bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 px-8 rounded-xl transition-all shadow-lg shadow-emerald-900/20"
                  >
                    Request a Quote
                  </a>
                </div>

                <div className="flex-1">
                  <div className="rounded-lg overflow-hidden shadow-lg">
                    <img
                      src={service.image}
                      alt={service.imageAlt}
                      className="w-full h-full object-cover aspect-video"
                      loading="lazy"
                    />
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </Section>

      <Section className="bg-cta-gradient animate-gradient text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'url(/treetek-logo.png)', backgroundSize: 'contain', backgroundPosition: 'center', backgroundRepeat: 'no-repeat' }}></div>
        <div className="relative max-w-3xl mx-auto text-center px-6 py-12">
          <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4 drop-shadow-lg">
            Ready to Get Started?
          </h2>
          <p className="text-lg md:text-xl text-emerald-50/90 mb-8 max-w-2xl mx-auto">
            Contact us today for a free, no-obligation quote on any of our tree services
          </p>
          <a
            href="/quote"
            className="inline-flex items-center gap-2 bg-white hover:bg-emerald-100 text-emerald-700 font-bold py-4 px-8 rounded-md text-lg shadow-xl transition-all hover:scale-105 animate-subtle-pulse"
          >
            Get a Free Quote
            <ArrowRight className="w-5 h-5" />
          </a>
        </div>
      </Section>
    </div>
  );
}
