import { useState, useEffect, FormEvent } from 'react';
import { Upload, CheckCircle, AlertCircle } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import SEO from '../components/SEO';
import Section from '../components/Section';
import Card from '../components/Card';
import { quoteApi, ApiError } from '../services/api';
import { phoneToTel, usePublicWorkspaceSettings } from '../lib/workspaceSettings';

const serviceTypes = [
  'Tree Removal',
  'Trimming & Pruning',
  'Crane Work',
  'Storm Cleanup',
  'Stump Grinding',
];

export default function Quote() {
  const { settings } = usePublicWorkspaceSettings();
  const phone = settings.business.phone;
  const ctaText = settings.site.cta_text || 'Request a Free Quote';
  const telHref = `tel:${phoneToTel(phone)}`;

  const location = useLocation();
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    zip: '',
    service_type: '',
    urgency: 'Normal',
    preferred_date: '',
    description: '',
  });
  const [photos, setPhotos] = useState<File[]>([]);
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const service = params.get('service');
    if (service && serviceTypes.includes(service)) {
      setFormData((prev) => ({ ...prev, service_type: service }));
    }
  }, [location.search]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (photos.length + files.length > 5) {
      setErrorMessage('Maximum 5 photos allowed');
      return;
    }
    setPhotos((prev) => [...prev, ...files].slice(0, 5));
    setErrorMessage('');
  };

  const removePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setStatus('submitting');
    setErrorMessage('');

    try {
      const result = await quoteApi.submitQuoteRequest(formData, photos);

      if (!result?.success) {
        throw new Error('Failed to submit request');
      }

      setStatus('success');
      setFormData({
        name: '',
        phone: '',
        email: '',
        address: '',
        city: '',
        zip: '',
        service_type: '',
        urgency: 'Normal',
        preferred_date: '',
        description: '',
      });
      setPhotos([]);
    } catch (error) {
      console.error('Error submitting quote:', error);
      setStatus('error');
      const detail =
        error instanceof ApiError
          ? error.message
          : error instanceof Error
            ? error.message
            : 'Failed to submit request. Please try again or call us directly.';
      setErrorMessage(detail);
    }
  };

  if (status === 'success') {
    return (
      <div className="min-h-screen bg-hero animate-gradient flex items-center justify-center p-4 sm:p-6">
        <SEO
          title="Request Received — TREE TEK"
          description="Your TREE TEK service request was received. We will contact you at the number you provided."
          path="/quote"
        />
        <Card variant="glass" className="p-8 sm:p-10 max-w-lg w-full text-center shadow-xl border border-white/10">
          <CheckCircle
            className="w-16 h-16 text-emerald-400 mx-auto mb-5 drop-shadow-sm"
            aria-hidden
            strokeWidth={1.5}
          />
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-5 tracking-tight">
            Request Received Successfully
          </h1>
          <div className="text-left text-emerald-50/95 space-y-4 text-sm sm:text-base leading-relaxed">
            <p>Thank you for contacting TREE TEK.</p>
            <p>
              Your service request has been successfully submitted and is now under review by our team. A
              representative will contact you shortly at the phone number you provided to discuss your request
              and next steps.
            </p>
            <p>
              If your request is urgent or requires immediate attention, please call us directly at{' '}
              <a
                href={telHref}
                className="text-white font-semibold underline decoration-emerald-300/80 underline-offset-2 hover:text-emerald-100"
              >
                {phone}
              </a>
              .
            </p>
            <p className="text-emerald-100/90">We appreciate the opportunity to serve you.</p>
          </div>

          <div
            className="my-8 h-px w-full max-w-sm mx-auto bg-gradient-to-r from-transparent via-emerald-400/40 to-transparent"
            aria-hidden
          />

          <div className="text-left mb-8">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider text-center mb-4">
              What Happens Next
            </h2>
            <ul className="space-y-2.5 text-emerald-50/95 text-sm sm:text-base list-none">
              <li className="flex gap-2">
                <span className="text-emerald-400 font-bold mt-0.5">•</span>
                <span>We review your request</span>
              </li>
              <li className="flex gap-2">
                <span className="text-emerald-400 font-bold mt-0.5">•</span>
                <span>We may contact you for additional details</span>
              </li>
              <li className="flex gap-2">
                <span className="text-emerald-400 font-bold mt-0.5">•</span>
                <span>You’ll receive a quote or scheduling options</span>
              </li>
            </ul>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center items-stretch sm:items-center">
            <Link
              to="/"
              className="inline-flex justify-center bg-white hover:bg-emerald-50 text-emerald-800 font-bold py-3.5 px-6 rounded-xl transition-all shadow-md"
            >
              Return to Homepage
            </Link>
            <Link
              to="/quote"
              onClick={() => setStatus('idle')}
              className="inline-flex justify-center border-2 border-emerald-300/60 text-emerald-50 hover:bg-white/10 font-semibold py-3.5 px-6 rounded-xl transition-all"
            >
              Submit Another Request
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <SEO
        title="Free Tree Service Quote — Volusia County"
        description="Request a free quote for tree removal, trimming, stump grinding, crane work, or storm cleanup in Volusia County & Central Florida. Fast responses."
        keywords="tree quote Volusia County, free estimate tree removal, TREE TEK quote"
        path="/quote"
      />
      <PageHeader
        title={ctaText}
        subtitle="Tell us about your project and we'll respond quickly"
      />

      <Section variant="gray">
        <Card className="max-w-3xl mx-auto">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Name *
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Phone *
                </label>
                <input
                  type="tel"
                  name="phone"
                  required
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email *
              </label>
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Service Address *
              </label>
              <input
                type="text"
                name="address"
                required
                value={formData.address}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  City *
                </label>
                <input
                  type="text"
                  name="city"
                  required
                  value={formData.city}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  ZIP Code *
                </label>
                <input
                  type="text"
                  name="zip"
                  required
                  value={formData.zip}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:border-transparent"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Service Type *
                </label>
                <select
                  name="service_type"
                  required
                  value={formData.service_type}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:border-transparent"
                >
                  <option value="">Select a service</option>
                  {serviceTypes.map((service) => (
                    <option key={service} value={service}>
                      {service}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Urgency *
                </label>
                <select
                  name="urgency"
                  required
                  value={formData.urgency}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:border-transparent"
                >
                  <option value="Normal">Normal</option>
                  <option value="Emergency">Emergency</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Preferred Date (Optional)
              </label>
              <input
                type="date"
                name="preferred_date"
                value={formData.preferred_date}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                name="description"
                required
                rows={4}
                value={formData.description}
                onChange={handleChange}
                placeholder="Please describe the work you need done..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Upload Photos (Optional, max 5)
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-green-600 transition">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handlePhotoChange}
                  className="hidden"
                  id="photo-upload"
                />
                <label htmlFor="photo-upload" className="cursor-pointer">
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-600">Click to upload photos</p>
                  <p className="text-sm text-gray-500 mt-1">Up to 5 images</p>
                </label>
              </div>

              {photos.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-4">
                  {photos.map((photo, index) => (
                    <div key={index} className="relative">
                      <img
                        src={URL.createObjectURL(photo)}
                        alt={`Upload ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => removePhoto(index)}
                        className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-700"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {errorMessage && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start">
                <AlertCircle className="w-5 h-5 text-red-600 mr-3 flex-shrink-0 mt-0.5" />
                <p className="text-red-800">{errorMessage}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={status === 'submitting'}
              className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:bg-gray-400 text-white font-bold py-4 px-8 rounded-xl text-lg transition-all shadow-lg shadow-emerald-900/20"
            >
              {status === 'submitting' ? 'Submitting...' : 'Submit Request'}
            </button>
          </form>
        </Card>
      </Section>
    </div>
  );
}
