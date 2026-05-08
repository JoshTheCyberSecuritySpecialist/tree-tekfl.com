import { TreeDeciduous, Scissors, Truck, Cloud, Disc, Wind, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import Card from '../components/Card';
import PageHeader from '../components/PageHeader';
import SEO from '../components/SEO';
import Section from '../components/Section';
import { usePublicWorkspaceSettings } from '../lib/workspaceSettings';

const services = [
  {
    id: 'tree-removal',
    icon: TreeDeciduous,
    title: 'Tree Removal',
    description:
      'Professional tree removal in Port Orange and Volusia County for hazardous, declining, and high-risk trees near homes, driveways, and structures.',
    features: [
      'Hazard evaluation and removal planning',
      'Controlled lowering near structures',
      'Debris cleanup and site reset',
    ],
    image: '/images/tree-removal-premium-tree-tek.png',
    imageAlt: 'TREE TEK tree removal service in Port Orange Florida',
    fit: 'contain',
    href: '/tree-removal',
  },
  {
    id: 'trimming-pruning',
    icon: Scissors,
    title: 'Tree Trimming & Pruning',
    description:
      'Tree trimming and pruning services designed to improve canopy structure, storm resilience, and long-term tree health across waterfront and residential properties.',
    features: [
      'Crown shaping and selective thinning',
      'Deadwood and risk limb reduction',
      'Seasonal maintenance planning',
    ],
    image: '/images/Tree-Trimming-And-Pruning-Port-Orange-FL.png',
    imageAlt: 'TREE TEK tree trimming and pruning service in Port Orange Florida',
    fit: 'contain',
    href: '/tree-trimming',
  },
  {
    id: 'crane-work',
    icon: Truck,
    title: 'Crane Tree Work',
    description:
      'Crane-assisted tree removal for tight access tree removal, large canopy picks, and tree removal near homes where precision lifting is the safer option.',
    features: [
      'Operator and crew lift coordination',
      'Large section removal with control',
      'Protection-first setup and staging',
    ],
    image: '/images/crane-tree-work-port-orange-volusia-county-emergency-tree-service.png',
    imageAlt: 'TREE TEK crane service removing large tree in Port Orange, Central Florida',
    fit: 'contain',
    href: '/crane-tree-work',
  },
  {
    id: 'emergency-tree-service',
    icon: Cloud,
    title: 'Emergency Tree Service',
    description:
      '24/7 emergency tree service for immediate hazard response, wind damage tree removal, and urgent stabilization after severe weather events.',
    features: [
      'Rapid dispatch for active hazards',
      'Fallen and hanging limb removal',
      'Emergency-safe site clearing',
    ],
    image: '/images/volusia-county-emergency-tree-service-tree-tek-florida.png',
    imageAlt: 'TREE TEK emergency response to hurricane storm damage tree removal in Central Florida',
    fit: 'contain',
    href: '/emergency-tree-service',
  },
  {
    id: 'storm-cleanup',
    icon: Wind,
    title: 'Storm Cleanup',
    description:
      'Storm cleanup Port Orange FL homeowners trust for fallen limb removal, tree debris removal, and cleanup around driveways, roofs, pools, and waterfront access points.',
    features: [
      'Post-storm debris and access clearing',
      'Storm damaged tree removal support',
      'Waterfront storm cleanup planning',
    ],
    image: '/images/Storm-Cleanup-And-Wind-Damage-Removal-Port-Orange-FL.png',
    imageAlt: 'TREE TEK storm cleanup and wind damage removal in Port Orange Florida',
    fit: 'contain',
    href: '/storm-cleanup',
  },
  {
    id: 'stump-grinding',
    icon: Disc,
    title: 'Stump Grinding',
    description:
      'Stump grinding services that remove trip hazards, improve curb appeal, and prepare lawns and landscapes for restoration on residential and waterfront lots.',
    features: [
      'Below-grade grinding and cleanup',
      'Minimal surface disturbance methods',
      'Ready-for-replanting finish options',
    ],
    image: '/images/Stump-Grinding-Port-Orange-Waterfront-TREE-TEK.png',
    imageAlt: 'TREE TEK stump grinding at a waterfront property in Port Orange Florida',
    fit: 'contain',
    href: '/stump-grinding',
  },
];

const FALLBACK_SERVICE_IMAGE =
  '/images/daytona-beach-tree-removal-coastal-home-crane-service-volusia-county-florida.png';

export default function Services() {
  const { settings } = usePublicWorkspaceSettings();
  const ctaText = settings.site.cta_text || 'Request a Free Quote';

  return (
    <div>
      <SEO
        title="Tree Services — Removal, Trimming, Crane, Storm & Stump Grinding"
        description="TREE TEK offers tree removal, trimming & pruning, crane-assisted removal, 24/7 storm cleanup, and stump grinding across Volusia County and Central Florida. Licensed & insured. Request a free quote."
        keywords="tree services Florida, tree removal, stump grinding, crane tree service, storm cleanup, Volusia County tree company"
        path="/services"
      />
      <PageHeader
        title="Our Services"
        subtitle="Professional tree care across Central Florida"
      />

      <Section variant="gray" className="border-y border-gray-200">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-3 text-center">
            In-depth service pages
          </h2>
          <p className="text-gray-600 text-center mb-6 text-sm md:text-base">
            Open a dedicated guide for pricing factors, how we work, and FAQs — same crew, more detail.
          </p>
          <div className="flex flex-wrap justify-center gap-2 md:gap-3">
            <Link
              to="/tree-removal"
              className="inline-flex items-center rounded-lg bg-white px-4 py-2 text-sm font-semibold text-emerald-800 shadow border border-gray-100 hover:border-emerald-300 hover:bg-emerald-50 transition"
            >
              Tree removal
            </Link>
            <Link
              to="/tree-trimming"
              className="inline-flex items-center rounded-lg bg-white px-4 py-2 text-sm font-semibold text-emerald-800 shadow border border-gray-100 hover:border-emerald-300 hover:bg-emerald-50 transition"
            >
              Tree trimming
            </Link>
            <Link
              to="/stump-grinding"
              className="inline-flex items-center rounded-lg bg-white px-4 py-2 text-sm font-semibold text-emerald-800 shadow border border-gray-100 hover:border-emerald-300 hover:bg-emerald-50 transition"
            >
              Stump grinding
            </Link>
            <Link
              to="/emergency-tree-service"
              className="inline-flex items-center rounded-lg bg-white px-4 py-2 text-sm font-semibold text-emerald-800 shadow border border-gray-100 hover:border-emerald-300 hover:bg-emerald-50 transition"
            >
              Emergency service
            </Link>
            <Link
              to="/storm-cleanup"
              className="inline-flex items-center rounded-lg bg-white px-4 py-2 text-sm font-semibold text-emerald-800 shadow border border-gray-100 hover:border-emerald-300 hover:bg-emerald-50 transition"
            >
              Storm cleanup
            </Link>
            <Link
              to="/crane-tree-work"
              className="inline-flex items-center rounded-lg bg-white px-4 py-2 text-sm font-semibold text-emerald-800 shadow border border-gray-100 hover:border-emerald-300 hover:bg-emerald-50 transition"
            >
              Crane tree work
            </Link>
          </div>
          <p className="text-center mt-6 text-sm text-gray-600">
            Local guides:{' '}
            <Link to="/tree-removal-daytona-beach" className="text-emerald-700 font-semibold hover:underline">
              Daytona Beach
            </Link>
            {' · '}
            <Link to="/stump-grinding-port-orange" className="text-emerald-700 font-semibold hover:underline">
              Port Orange
            </Link>
            {' · '}
            <Link to="/emergency-tree-service-volusia-county" className="text-emerald-700 font-semibold hover:underline">
              Volusia County
            </Link>
          </p>
        </div>
      </Section>

      <Section variant="white">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8 md:mb-10 text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Professional Tree Services in Port Orange & Volusia County</h2>
            <p className="mt-2 text-gray-600 max-w-3xl mx-auto">
              Explore TREE TEK service pages for local guidance on crane-assisted tree removal, emergency response,
              trimming, storm cleanup, and property-focused care.
            </p>
          </div>
          <div className="grid gap-6 md:gap-7 md:grid-cols-2">
            {services.map((service) => {
            const Icon = service.icon;
            return (
              <section id={service.id} key={service.id} className="scroll-mt-24">
                <Card
                  className="h-full flex flex-col gap-5 md:gap-6 border border-[#DDE8E3] rounded-2xl shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="w-full overflow-hidden rounded-2xl shadow-xl border border-emerald-100 bg-white">
                    <img
                      src={service.image}
                      alt={service.imageAlt}
                      className={`w-full h-auto ${service.fit === 'cover' ? 'object-cover' : 'object-contain'} rounded-2xl mx-auto`}
                      loading="lazy"
                      width="1792"
                      height="1024"
                      onError={(e) => {
                        const img = e.currentTarget;
                        img.src = FALLBACK_SERVICE_IMAGE;
                      }}
                    />
                  </div>
                  <div>
                    <div className="bg-emerald-100 w-12 h-12 rounded-lg flex items-center justify-center mb-3">
                      <Icon className="w-6 h-6 text-emerald-700" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">{service.title}</h2>
                    <p className="text-gray-600 leading-relaxed mb-4">{service.description}</p>
                    <ul className="space-y-2 mb-5">
                      {service.features.map((feature) => (
                        <li key={feature} className="flex items-start">
                          <svg
                            className="w-5 h-5 text-emerald-600 mr-2.5 flex-shrink-0 mt-0.5"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                              clipRule="evenodd"
                            />
                          </svg>
                          <span className="text-sm text-gray-700">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <Link
                      to={service.href}
                      className="inline-flex items-center bg-emerald-700 hover:bg-emerald-600 text-white font-bold py-2.5 px-5 rounded-lg transition shadow-md"
                    >
                      View Service Page
                    </Link>
                  </div>
                </Card>
              </section>
            );
          })}
          </div>
        </div>
      </Section>

      <Section variant="white">
        <div id="daytona-beach" className="max-w-3xl mx-auto text-center scroll-mt-24">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">Service areas & deep dives</h2>
          <p className="text-gray-600 leading-relaxed">
            Planning{' '}
            <Link to="/tree-trimming-south-daytona" className="text-emerald-700 font-semibold hover:underline">
              tree trimming in South Daytona
            </Link>
            ,{' '}
            <Link to="/crane-tree-work" className="text-emerald-700 font-semibold hover:underline">
              crane tree work in Volusia County
            </Link>
            , or storm recovery? Start here, then see{' '}
            <Link to="/past-work" className="text-emerald-700 font-semibold hover:underline">
              past work photos
            </Link>{' '}
            or{' '}
            <Link to="/faq" className="text-emerald-700 font-semibold hover:underline">
              FAQs
            </Link>
            .
          </p>
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
          <Link
            to="/quote"
            className="inline-flex items-center gap-2 bg-white hover:bg-emerald-100 text-emerald-700 font-bold py-4 px-8 rounded-md text-lg shadow-xl transition-all hover:scale-105 animate-subtle-pulse"
          >
            {ctaText}
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </Section>
    </div>
  );
}
