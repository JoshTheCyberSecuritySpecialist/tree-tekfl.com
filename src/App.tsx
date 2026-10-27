import { lazy, Suspense, useEffect, useMemo, useState } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { SEO_PAGE_SLUGS } from './data/seoPages';
import ScrollToTop from './components/ScrollToTop';
import SeoLandingPage from './pages/SeoLandingPage';
import { sitePagesApi } from './services/api';

const Layout = lazy(() => import('./components/Layout'));
const Home = lazy(() => import('./pages/Home'));
const Services = lazy(() => import('./pages/Services'));
const PastWork = lazy(() => import('./pages/PastWork'));
const Quote = lazy(() => import('./pages/Quote'));
const Social = lazy(() => import('./pages/Social'));
const Contact = lazy(() => import('./pages/Contact'));
const Faq = lazy(() => import('./pages/Faq'));
const Certifications = lazy(() => import('./pages/Certifications'));
const AdminLogin = lazy(() => import('./pages/AdminLogin'));
const Admin = lazy(() => import('./pages/Admin'));
const NotFound = lazy(() => import('./pages/NotFound'));
const BlogList = lazy(() => import('./pages/blog/BlogList'));
const BlogPost = lazy(() => import('./pages/blog/BlogPost'));
const ProtectedRoute = lazy(() => import('./components/ProtectedRoute'));

const LEGACY_SEO_REDIRECTS: Record<string, string> = {
  'tree-removal-daytona-beach': 'tree-removal-lake-mary',
  'tree-trimming-daytona-beach': 'tree-trimming-lake-mary',
  'stump-grinding-daytona-beach': 'stump-grinding-lake-mary',
  'emergency-tree-service-daytona-beach': 'emergency-tree-service-lake-mary',
  'tree-removal-port-orange': 'tree-removal-sanford',
  'tree-trimming-port-orange': 'tree-trimming-sanford',
  'stump-grinding-port-orange': 'stump-grinding-sanford',
  'emergency-tree-service-port-orange': 'emergency-tree-service-sanford',
  'tree-removal-south-daytona': 'tree-removal-longwood',
  'tree-trimming-south-daytona': 'tree-trimming-longwood',
  'stump-grinding-south-daytona': 'stump-grinding-longwood',
  'tree-service-volusia-county': 'tree-service-seminole-county',
  'tree-removal-volusia-county': 'tree-removal-seminole-county',
  'stump-grinding-volusia-county': 'stump-grinding-seminole-county',
  'emergency-tree-service-volusia-county': 'emergency-tree-service-seminole-county',
};

function App() {
  const [cmsSlugs, setCmsSlugs] = useState<string[]>([]);

  useEffect(() => {
    sitePagesApi.getPublishedSlugs().then(setCmsSlugs).catch(() => setCmsSlugs([]));
  }, []);

  const seoSlugs = useMemo(
    () => Array.from(new Set([...SEO_PAGE_SLUGS, ...cmsSlugs])),
    [cmsSlugs],
  );

  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-gray-700">Loading...</div>}>
      <ScrollToTop />
      <Routes>
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<ProtectedRoute><Admin /></ProtectedRoute>} />
        <Route path="/" element={<Layout><Home /></Layout>} />
        <Route path="/services" element={<Layout><Services /></Layout>} />
        <Route path="/past-work" element={<Layout><PastWork /></Layout>} />
        <Route path="/quote" element={<Layout><Quote /></Layout>} />
        <Route path="/social" element={<Layout><Social /></Layout>} />
        <Route path="/certifications" element={<Layout><Certifications /></Layout>} />
        <Route path="/contact" element={<Layout><Contact /></Layout>} />
        <Route path="/faq" element={<Layout><Faq /></Layout>} />
        <Route path="/blog" element={<Layout><BlogList /></Layout>} />
        <Route path="/blog/:slug" element={<Layout><BlogPost /></Layout>} />
        {Object.entries(LEGACY_SEO_REDIRECTS).map(([from, to]) => (
          <Route key={from} path={`/${from}`} element={<Navigate to={`/${to}`} replace />} />
        ))}
        {seoSlugs.map((slug) => (
          <Route
            key={slug}
            path={`/${slug}`}
            element={
              <Layout>
                <SeoLandingPage slug={slug} />
              </Layout>
            }
          />
        ))}
        <Route path="*" element={<Layout><NotFound /></Layout>} />
      </Routes>
    </Suspense>
  );
}

export default App;
