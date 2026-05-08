import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Reset scroll on page navigation while preserving in-page hash navigation.
 */
export default function ScrollToTop() {
  const location = useLocation();

  useEffect(() => {
    if (location.hash) return;
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [location.pathname, location.hash]);

  return null;
}
