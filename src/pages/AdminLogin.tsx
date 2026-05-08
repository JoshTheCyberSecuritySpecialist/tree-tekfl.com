import { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../components/Card';
import SEO from '../components/SEO';
import { ERR_ADMIN_NOT_IN_TABLE, loginAdmin } from '../services/auth';

export default function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleAuth = async (e: FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setSubmitting(true);

    if (import.meta.env.DEV) {
      console.debug('[auth] login attempt', { email });
    }

    try {
      await loginAdmin({ email, password });
      navigate('/admin', { replace: true });
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('[auth] login error', error);
      }

      let message = 'Login failed.';

      if (error && typeof error === 'object' && 'message' in error) {
        const raw = String((error as { message: string }).message);

        if (raw === ERR_ADMIN_NOT_IN_TABLE) {
          message =
            'Your account signed in, but it is not in the admins list. In Supabase, add a row to public.admins with id = your user UUID (Authentication → Users).';
        } else if (
          /invalid login credentials|invalid email or password|email not confirmed/i.test(raw)
        ) {
          message = `${raw} — Check the email spelling (must match Supabase exactly), the password, and that the user exists under Authentication → Users. Reset the password in the dashboard if needed.`;
        } else {
          // Includes PostgrestError from admins query and other Supabase errors
          message = raw;
        }
      }

      setAuthError(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-hero animate-gradient flex items-center justify-center p-4">
      <SEO title="Admin Login — TREE TEK" description="Administrator sign-in." path="/admin/login" noindex />
      <Card variant="glass" className="p-8 max-w-md w-full">
        <h1 className="text-2xl font-bold text-white mb-6 text-center">
          Admin Portal
        </h1>
        <form onSubmit={handleAuth}>
          <label className="block text-sm font-semibold text-emerald-100 mb-2">
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 border border-white/20 bg-white/10 text-white placeholder-emerald-200 rounded-lg focus:ring-2 focus:ring-emerald-400 focus:border-transparent mb-4"
            placeholder="admin@email.com"
            required
          />
          <label className="block text-sm font-semibold text-emerald-100 mb-2">
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 border border-white/20 bg-white/10 text-white placeholder-emerald-200 rounded-lg focus:ring-2 focus:ring-emerald-400 focus:border-transparent mb-4"
            placeholder="Enter password"
            required
          />
          {authError ? <p className="text-red-200 mb-4 text-sm">{authError}</p> : null}
          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-white hover:bg-gray-50 disabled:bg-gray-200 text-emerald-700 font-bold py-3 rounded-xl transition-all"
          >
            {submitting ? 'Signing in & verifying access…' : 'Access Admin'}
          </button>
        </form>
      </Card>
    </div>
  );
}
