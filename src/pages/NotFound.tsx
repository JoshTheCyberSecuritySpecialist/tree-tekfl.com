import { Link, useLocation } from 'react-router-dom';
import SEO from '../components/SEO';

export default function NotFound() {
  const { pathname } = useLocation();

  return (
    <div className="max-w-3xl mx-auto px-6 py-16 text-center">
      <SEO
        title="Page Not Found — TREE TEK"
        description="This page could not be found."
        path={pathname}
        noindex
      />
      <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Page Not Found</h1>
      <p className="text-lg text-gray-600 mb-8">
        The page you are looking for does not exist or may have moved.
      </p>
      <Link
        to="/"
        className="inline-block bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 px-8 rounded-md shadow-lg transition-all"
      >
        Back to Home
      </Link>
    </div>
  );
}
