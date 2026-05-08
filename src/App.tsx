import { lazy, Suspense, useEffect, useMemo, useState } from 'react';
import { Route, Routes } from 'react-router-dom';
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
