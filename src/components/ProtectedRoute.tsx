import { ReactNode, useCallback, useEffect, useRef, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { getAdminAccess, onAdminAuthChange } from '../services/auth';

interface ProtectedRouteProps {
  children: ReactNode;
}

type BlockState =
  | null
  | { kind: 'query_error'; message: string }
  | { kind: 'not_admin' };

/**
 * Waits for auth via getUser() (see auth service), then checks public.admins with maybeSingle().
 * Surfaces Supabase query errors separately from "not in admins" (user exists, query ok, no row).
 */
export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [block, setBlock] = useState<BlockState>(null);
  const gateSeq = useRef(0);

  const refreshGate = useCallback(async () => {
    const id = ++gateSeq.current;
    setLoading(true);
    setBlock(null);

    try {
      const access = await getAdminAccess();

      if (id !== gateSeq.current) {
        return;
      }

      switch (access.type) {
        case 'admin':
          setIsAuthenticated(true);
          setBlock(null);
          break;
        case 'no_user':
          setIsAuthenticated(false);
          setBlock(null);
          break;
        case 'query_error':
          setIsAuthenticated(false);
          setBlock({
            kind: 'query_error',
            message: access.error.message || String(access.error),
          });
          break;
        case 'not_admin':
          setIsAuthenticated(false);
          setBlock({ kind: 'not_admin' });
          break;
        default:
          setIsAuthenticated(false);
          setBlock(null);
      }
    } catch {
      if (id !== gateSeq.current) {
        return;
      }
      setIsAuthenticated(false);
      setBlock({
        kind: 'query_error',
        message: 'Could not verify admin access. Please try again.',
      });
    } finally {
      if (id === gateSeq.current) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    const unsubscribe = onAdminAuthChange((event) => {
      if (import.meta.env.DEV) {
        console.debug('[ProtectedRoute] auth event:', event);
      }

      if (event === 'SIGNED_OUT') {
        gateSeq.current += 1;
        setIsAuthenticated(false);
        setBlock(null);
        setLoading(false);
        return;
      }

      void refreshGate();
    });

    void refreshGate();

    return () => {
      unsubscribe();
    };
  }, [refreshGate]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3 text-gray-700 bg-gray-50">
        <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-emerald-600 border-t-transparent" />
        <p className="text-sm font-medium text-gray-600">Verifying admin access…</p>
      </div>
    );
  }

  if (block?.kind === 'query_error') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-6 bg-gray-50 text-gray-800">
        <p className="text-center max-w-md text-red-700 font-medium">Admin check failed (database)</p>
        <p className="text-center max-w-lg text-sm text-gray-600 whitespace-pre-wrap">{block.message}</p>
        <div className="flex gap-3 flex-wrap justify-center">
          <button
            type="button"
            onClick={() => void refreshGate()}
            className="px-4 py-2 rounded-lg bg-emerald-600 text-white font-semibold hover:bg-emerald-700"
          >
            Retry
          </button>
          <Link
            to="/admin/login"
            className="px-4 py-2 rounded-lg border border-gray-300 font-semibold text-gray-700 hover:bg-gray-100"
          >
            Back to login
          </Link>
        </div>
      </div>
    );
  }

  if (block?.kind === 'not_admin') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-6 bg-gray-50 text-gray-800">
        <p className="text-center max-w-md">
          Your account is signed in, but it is not in the admins list. Ask a project owner to add your user id to{' '}
          <code className="text-sm bg-gray-200 px-1 rounded">public.admins</code>.
        </p>
        <Link to="/admin/login" className="text-emerald-700 font-semibold hover:underline">
          Back to login
        </Link>
      </div>
    );
  }

  if (isAuthenticated) {
    return <>{children}</>;
  }

  return <Navigate to="/admin/login" replace />;
}
