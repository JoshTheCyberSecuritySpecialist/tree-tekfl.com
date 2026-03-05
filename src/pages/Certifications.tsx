import { Award, ExternalLink, Shield } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import Section from '../components/Section';
import Card from '../components/Card';

export default function Certifications() {
  return (
    <div>
      <PageHeader
        title="Certifications & Accreditations"
        subtitle="Licensed, Certified, and Committed to Excellence"
      />

      <Section variant="white">
        <div className="max-w-4xl mx-auto space-y-12">
          <Card className="border-2 border-emerald-500">
            <div className="flex items-center gap-3 mb-6">
              <Award className="w-8 h-8 text-emerald-600" />
              <h2 className="text-3xl font-bold text-gray-900">ISA Certified Arborist</h2>
            </div>

            <div className="space-y-3 mb-8">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <span className="font-semibold text-gray-700">Arborist:</span>
                <span className="text-gray-900">Andrew Cleaver</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <span className="font-semibold text-gray-700">Certification Number:</span>
                <span className="text-gray-900 font-mono">FL-299436A</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <span className="font-semibold text-gray-700">Valid Through:</span>
                <span className="text-gray-900">June 30, 2029</span>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-6">
              <p className="text-gray-700 leading-relaxed">
                ISA Certified Arborists are individuals who have achieved a level of knowledge in the art and
                science of tree care through experience and by passing a comprehensive examination developed
                by some of the nation's leading experts on tree care. This certification demonstrates our
                commitment to professional tree care and ongoing education in arboriculture.
              </p>
            </div>
          </Card>

          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="text-center mb-6">
              <img
                src="/images/ISA_Certs.jpeg"
                alt="ISA Certified Arborist certificate for Andrew Cleaver (FL-299436A)"
                className="mx-auto rounded-lg shadow-md max-w-full w-full sm:max-w-[900px]"
              />
              <p className="text-sm text-gray-600 mt-4 italic">
                Official ISA Certified Arborist Credential
              </p>
            </div>
          </div>

          <Card className="border-2 border-blue-500">
            <div className="flex items-center gap-3 mb-6">
              <Shield className="w-8 h-8 text-blue-600" />
              <h2 className="text-3xl font-bold text-gray-900">BBB Accredited Business</h2>
            </div>

            <p className="text-gray-700 leading-relaxed mb-6">
              TreeTek Tree Services is proud to be a Better Business Bureau Accredited Business committed
              to professionalism, transparency, and customer satisfaction. Our BBB accreditation demonstrates
              our dedication to ethical business practices and quality service.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 items-center">
              <div className="bg-blue-50 rounded-lg p-6 flex items-center justify-center flex-shrink-0">
                <Shield className="w-16 h-16 text-blue-600" />
              </div>

              <a
                href="https://www.bbb.org/"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-md shadow-lg transition-all flex items-center gap-2 w-full sm:w-auto justify-center"
              >
                View Our BBB Accreditation
                <ExternalLink className="w-5 h-5" />
              </a>
            </div>
          </Card>

          <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-lg p-8 text-center">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Trust the Professionals
            </h3>
            <p className="text-gray-700 mb-6 max-w-2xl mx-auto">
              Our certifications and accreditations mean you're working with trained, qualified professionals
              who prioritize safety, quality, and customer satisfaction in every job.
            </p>
            <a
              href="tel:+13212829795"
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-4 px-8 rounded-md shadow-lg transition-all inline-block"
            >
              Call Now: (321) 282-9795
            </a>
          </div>
        </div>
      </Section>
    </div>
  );
}
