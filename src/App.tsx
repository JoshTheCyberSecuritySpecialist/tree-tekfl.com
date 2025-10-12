import { useEffect, useState } from 'react';
import Layout from './components/Layout';
import Home from './pages/Home';
import Services from './pages/Services';
import PastWork from './pages/PastWork';
import Quote from './pages/Quote';
import Social from './pages/Social';
import Contact from './pages/Contact';
import Admin from './pages/Admin';

function App() {
  const [currentPath, setCurrentPath] = useState(window.location.pathname);

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
    };

    window.addEventListener('popstate', handlePopState);

    const originalPushState = window.history.pushState;
    window.history.pushState = function (...args) {
      originalPushState.apply(window.history, args);
      setCurrentPath(window.location.pathname);
    };

    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.history.pushState = originalPushState;
    };
  }, []);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const anchor = target.closest('a');

      if (anchor && anchor.href) {
        const url = new URL(anchor.href);
        if (url.origin === window.location.origin && !anchor.target) {
          e.preventDefault();
          window.history.pushState({}, '', url.pathname + url.search);
          setCurrentPath(url.pathname);
          window.scrollTo(0, 0);
        }
      }
    };

    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  const renderPage = () => {
    if (currentPath.startsWith('/admin')) {
      return <Admin />;
    }

    switch (currentPath) {
      case '/':
        return <Home />;
      case '/services':
        return <Services />;
      case '/past-work':
        return <PastWork />;
      case '/quote':
        return <Quote />;
      case '/social':
        return <Social />;
      case '/contact':
        return <Contact />;
      default:
        return <Home />;
    }
  };

  if (currentPath.startsWith('/admin')) {
    return renderPage();
  }

  return <Layout>{renderPage()}</Layout>;
}

export default App;
