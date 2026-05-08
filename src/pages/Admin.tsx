import React, { ChangeEvent, FormEvent, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trash2 } from 'lucide-react';
import SEO from '../components/SEO';
import Section from '../components/Section';
import Card from '../components/Card';
import { blogApi, faqApi, pastWorkApi, quoteApi, uploadBlogFeaturedImage } from '../services/api';
import { isLikelyValidImageUrl, plainTextFromMarkdown } from '../lib/blogUtils';
import { uploadPastWorkMedia } from '../lib/uploadMedia';
import { logoutAdmin } from '../services/auth';
import { supabase } from '../lib/supabase';
import Sidebar from '../components/admin/Sidebar';
import Topbar from '../components/admin/Topbar';
import DashboardTab from '../components/admin/DashboardTab';
import LeadsTab from '../components/admin/LeadsTab';
import ReviewsTab from '../components/admin/ReviewsTab';
import MediaTab from '../components/admin/MediaTab';
import MediaLibraryPicker from '../components/admin/MediaLibraryPicker';
import PagesTab from '../components/admin/PagesTab';
import SettingsTab from '../components/admin/SettingsTab';
import StatsCards from '../components/admin/StatsCards';
import ProjectTable from '../components/admin/ProjectTable';
import type { AdminProjectRow } from '../components/admin/ProjectRow';
import ProjectForm, { ProjectFormState } from '../components/admin/ProjectForm';

// Admin CRUD is only reachable at /admin inside ProtectedRoute (admins table check).

type Tab = 'dashboard' | 'pastwork' | 'quotes' | 'leads' | 'reviews' | 'media' | 'pages' | 'settings' | 'blog' | 'faq';

interface QuoteRequest {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  zip: string;
  service_type: string;
  urgency: string;
  preferred_date: string | null;
  description: string;
  photos?: string[] | null;
  created_at: string;
}

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string | null;
  location?: string | null;
  image_url: string | null;
  created_at: string;
}

interface FaqItem {
  id: string;
  question: string;
  answer: string;
  created_at: string;
  updated_at: string;
}

class PastWorkAdminErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: unknown) {
    console.error('Past Work admin failed to load:', error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-4 font-medium">
          Past Work Admin failed to load
        </div>
      );
    }
    return this.props.children;
  }
}

type PastWorkProject = {
  id: string;
  title: string;
  category: string;
  location: string | null;
  caption: string | null;
  url: string;
  before_url: string | null;
  after_url: string | null;
  video_url: string | null;
  media_type: 'image' | 'video';
  alt: string;
  is_featured: boolean;
  has_google_review_overlay: boolean;
  display_order: number;
  is_published: boolean;
  created_at: string;
};

function adminPageTitle(tab: Tab): string {
  switch (tab) {
    case 'pastwork':
      return 'Past Work Manager';
    case 'quotes':
      return 'Quotes';
    case 'blog':
      return 'Blog Management';
    case 'faq':
      return 'FAQ Management';
    case 'dashboard':
      return 'Dashboard';
    case 'leads':
      return 'Leads';
    case 'reviews':
      return 'Reviews';
    case 'media':
      return 'Media Library';
    case 'pages':
      return 'Pages';
    case 'settings':
      return 'Settings';
    default:
      return 'Admin';
  }
}

export default function Admin() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>('pastwork');
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!cancelled) {
        setUserEmail(session?.user?.email ?? null);
      }
    })();
    const { data } = supabase.auth.onAuthStateChange(
      (_event: string, session: { user?: { email?: string | null } } | null) => {
      setUserEmail(session?.user?.email ?? null);
      },
    );
    return () => {
      cancelled = true;
      data.subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    try {
      await logoutAdmin();
      setActiveTab('pastwork');
      navigate('/admin/login', { replace: true });
    } catch (error) {
      console.error('Logout failed:', error);
      alert('Failed to logout. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <SEO title="Admin — TREE TEK" description="Admin dashboard." path="/admin" noindex />
      <Section variant="white">
        <div className="max-w-7xl mx-auto space-y-4">
          <Topbar
            title={adminPageTitle(activeTab)}
            subtitle="Manage projects, quotes, blog posts, and site content."
            userEmail={userEmail}
            onLogout={handleLogout}
          />
          <div className="grid grid-cols-1 lg:grid-cols-[240px,1fr] gap-4">
            <Sidebar active={activeTab} onChange={setActiveTab} />
            <div>
              {activeTab === 'quotes' && <RequestsTab />}
              {activeTab === 'pastwork' && (
                <PastWorkAdminErrorBoundary>
                  <PastWorkTab />
                </PastWorkAdminErrorBoundary>
              )}
              {activeTab === 'blog' && <BlogTab />}
              {activeTab === 'faq' && <FaqTab />}
              {activeTab === 'dashboard' ? <DashboardTab /> : null}
              {activeTab === 'leads' ? <LeadsTab /> : null}
              {activeTab === 'reviews' ? <ReviewsTab /> : null}
              {activeTab === 'media' ? <MediaTab /> : null}
              {activeTab === 'pages' ? <PagesTab /> : null}
              {activeTab === 'settings' ? <SettingsTab /> : null}
            </div>
          </div>
        </div>
      </Section>
    </div>
  );
}

function RequestsTab() {
  const [requests, setRequests] = useState<QuoteRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    fetchRequests();
  }, []);

  async function fetchRequests() {
    try {
      const data = await quoteApi.getQuoteRequests();
      setRequests(data);
    } catch (error) {
      console.error('Error fetching requests:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteRequest(request: QuoteRequest) {
    if (
      !confirm(
        'Are you sure you want to delete this quote request? This cannot be undone.',
      )
    ) {
      return;
    }
    setDeletingId(request.id);
    try {
      await quoteApi.deleteQuoteRequest(request.id);
      setRequests((prev) => prev.filter((r) => r.id !== request.id));
      alert('Quote request deleted.');
    } catch (error) {
      console.error('Error deleting quote request:', error);
      const msg = error instanceof Error ? error.message : 'Failed to delete quote request';
      alert(msg);
    } finally {
      setDeletingId(null);
    }
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-green-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {requests.length === 0 ? (
        <div className="bg-white rounded-lg p-8 text-center">
          <p className="text-gray-600">No service requests yet</p>
        </div>
      ) : (
        requests.map((request) => (
          <div key={request.id} className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-bold text-gray-900">{request.name}</h3>
                <p className="text-sm text-gray-500">
                  {new Date(request.created_at).toLocaleString()}
                </p>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-sm font-semibold ${
                  'bg-blue-100 text-blue-800'
                }`}
              >
                Quote Request
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-sm font-semibold text-gray-700">Contact</p>
                <p className="text-gray-900">{request.phone}</p>
                <p className="text-gray-900">{request.email}</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-700">Service & urgency</p>
                <p className="text-gray-900">{request.service_type}</p>
                <p className="text-gray-900">
                  <span className="font-medium">Urgency:</span> {request.urgency}
                </p>
                {request.preferred_date ? (
                  <p className="text-gray-700 text-sm mt-1">
                    Preferred date: {request.preferred_date}
                  </p>
                ) : null}
              </div>
            </div>

            <div className="mb-4">
              <p className="text-sm font-semibold text-gray-700 mb-2">Address</p>
              <p className="text-gray-900">
                {request.address}, {request.city} {request.zip}
              </p>
            </div>

            <div className="mb-4">
              <p className="text-sm font-semibold text-gray-700 mb-2">Description</p>
              <p className="text-gray-900 whitespace-pre-wrap">{request.description}</p>
            </div>

            {request.photos && Array.isArray(request.photos) && request.photos.length > 0 ? (
              <div className="mb-4">
                <p className="text-sm font-semibold text-gray-700 mb-2">Photos</p>
                <ul className="list-disc list-inside space-y-1 text-emerald-700">
                  {request.photos.map((url) => (
                    <li key={url}>
                      <a href={url} target="_blank" rel="noopener noreferrer" className="underline break-all">
                        {url}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            <div className="mt-6 pt-4 border-t border-gray-100">
              <button
                type="button"
                onClick={() => handleDeleteRequest(request)}
                disabled={deletingId === request.id}
                className="w-full sm:w-auto px-4 py-2.5 rounded-lg bg-red-600 text-white text-sm font-semibold hover:bg-red-700 disabled:opacity-60 transition"
              >
                {deletingId === request.id ? 'Deleting…' : 'Delete request'}
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

const PAST_WORK_EMPTY: ProjectFormState = {
  title: '',
  category: 'Tree Removal',
  location: '',
  caption: '',
  url: '',
  before_url: '',
  after_url: '',
  video_url: '',
  media_type: 'image' as 'image' | 'video',
  alt: '',
  is_featured: false,
  has_google_review_overlay: false,
  display_order: 0,
  is_published: true,
};

function isVideoPath(path: string): boolean {
  return /\.(mp4|webm|mov)$/i.test(path);
}

function isValidMediaPath(path: string): boolean {
  if (!path) return false;
  return path.startsWith('/images/') || path.startsWith('/videos/') || /^https?:\/\//i.test(path);
}

function PastWorkTab() {
  const [projects, setProjects] = useState<PastWorkProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [saving, setSaving] = useState(false);
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [sortBy, setSortBy] = useState<'newest' | 'display_order'>('newest');
  const [tablePage, setTablePage] = useState(1);
  const [showEditor, setShowEditor] = useState(false);
  const [previewUrl, setPreviewUrl] = useState('');
  const [uploadingMedia, setUploadingMedia] = useState<null | 'primary' | 'before' | 'after' | 'video'>(null);
  const [uploadNotice, setUploadNotice] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [formData, setFormData] = useState({ ...PAST_WORK_EMPTY });
  const [mediaPickerOpen, setMediaPickerOpen] = useState(false);
  const [mediaPickKind, setMediaPickKind] = useState<'primary' | 'before' | 'after'>('primary');

  useEffect(() => {
    fetchProjects();
  }, []);

  async function fetchProjects() {
    setLoadError('');
    try {
      const data = await pastWorkApi.getProjects({ includeHidden: true });
      setProjects((data as PastWorkProject[]) || []);
    } catch (error) {
      console.error('Error fetching past work projects:', error);
      const msg =
        error instanceof Error && error.message
          ? error.message
          : 'Failed to load past work projects.';
      setLoadError(msg);
      setProjects([]);
    } finally {
      setLoading(false);
    }
  }

  function resetForm() {
    setEditingProjectId(null);
    setFormData({ ...PAST_WORK_EMPTY });
    setShowEditor(false);
    setPreviewUrl('');
    setUploadNotice(null);
    setUploadingMedia(null);
  }

  function openCreate() {
    setEditingProjectId(null);
    setFormData({ ...PAST_WORK_EMPTY });
    setPreviewUrl('');
    setUploadNotice(null);
    setShowEditor(true);
  }

  function openEdit(project: PastWorkProject) {
    setEditingProjectId(project.id);
    setFormData({
      title: project.title,
      category: project.category || 'Tree Removal',
      location: project.location ?? '',
      caption: project.caption ?? '',
      url: project.url,
      before_url: project.before_url ?? '',
      after_url: project.after_url ?? '',
      video_url: project.video_url ?? '',
      media_type: project.media_type ?? (isVideoPath(project.video_url || project.url) ? 'video' : 'image'),
      alt: project.alt ?? '',
      is_featured: Boolean(project.is_featured),
      has_google_review_overlay: Boolean(project.has_google_review_overlay),
      display_order: Number(project.display_order ?? 0),
      is_published: project.is_published !== false,
    });
    setPreviewUrl(project.video_url || project.url || '');
    setUploadNotice(null);
    setShowEditor(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function openPastWorkMediaLibrary(kind: 'primary' | 'before' | 'after') {
    setMediaPickKind(kind);
    setMediaPickerOpen(true);
  }

  function applyPastWorkMediaLibraryUrl(url: string) {
    setFormData((prev) => {
      const next = { ...prev };
      if (mediaPickKind === 'primary') {
        next.url = url;
        next.media_type = 'image';
      }
      if (mediaPickKind === 'before') next.before_url = url;
      if (mediaPickKind === 'after') next.after_url = url;
      return next;
    });
    if (mediaPickKind === 'primary') {
      setPreviewUrl(url);
    }
    setMediaPickerOpen(false);
    setUploadNotice({ type: 'success', message: 'URL applied from media library.' });
  }

  async function handlePastWorkUpload(
    kind: 'primary' | 'before' | 'after' | 'video',
    file?: File,
  ) {
    if (!file) return;
    try {
      setUploadNotice(null);
      setUploadingMedia(kind);
      const title = formData.title.trim() || 'project';
      const { publicUrl } = await uploadPastWorkMedia(file, title, kind);
      setFormData((prev) => {
        const next = { ...prev };
        if (kind === 'primary') {
          next.url = publicUrl;
          if (file.type.startsWith('video/')) next.media_type = 'video';
        }
        if (kind === 'before') next.before_url = publicUrl;
        if (kind === 'after') next.after_url = publicUrl;
        if (kind === 'video') {
          next.video_url = publicUrl;
          next.media_type = 'video';
        }
        return next;
      });
      if (kind === 'primary' || kind === 'video') {
        setPreviewUrl(publicUrl);
      }
      setUploadNotice({ type: 'success', message: `${kind} media uploaded successfully.` });
    } catch (error) {
      const message = error instanceof Error ? error.message : `Failed to upload ${kind} media.`;
      setUploadNotice({ type: 'error', message });
    } finally {
      setUploadingMedia(null);
    }
  }

  async function saveProject() {
    setSaving(true);
    try {
      const payload = {
        ...formData,
        location: formData.location || null,
        caption: formData.caption || null,
        before_url: formData.before_url || null,
        after_url: formData.after_url || null,
        video_url: formData.video_url || null,
        alt: formData.alt || formData.title,
        imagePath: formData.url || null,
        beforeImagePath: formData.before_url || null,
        afterImagePath: formData.after_url || null,
        videoPath: formData.video_url || null,
      };

      if (editingProjectId) {
        await pastWorkApi.updateProject(editingProjectId, payload);
      } else {
        await pastWorkApi.createProject(payload);
      }

      await fetchProjects();
      resetForm();
      alert(editingProjectId ? 'Project updated.' : 'Project created.');
    } catch (error) {
      console.error('Error saving project:', error);
      const msg = error instanceof Error ? error.message : 'Failed to save project';
      alert(msg);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(project: PastWorkProject) {
    if (!confirm(`Delete "${project.title}"? This cannot be undone.`)) return;
    try {
      await pastWorkApi.deleteProject(project.id);
      setProjects((prev) => prev.filter((p) => p.id !== project.id));
      if (editingProjectId === project.id) resetForm();
      alert('Project deleted.');
    } catch (error) {
      console.error('Error deleting project:', error);
      alert(error instanceof Error ? error.message : 'Failed to delete project');
    }
  }

  const categories = useMemo(() => {
    const all = new Set(['All']);
    projects.forEach((p) => {
      if (p.category?.trim()) all.add(p.category);
    });
    return Array.from(all);
  }, [projects]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = projects.filter((p) => {
      if (filterCategory !== 'All' && p.category !== filterCategory) return false;
      if (!q) return true;
      return (
        p.title.toLowerCase().includes(q) ||
        (p.location || '').toLowerCase().includes(q)
      );
    });

    if (sortBy === 'display_order') {
      return [...list].sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0));
    }
    return [...list].sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at));
  }, [projects, search, filterCategory, sortBy]);

  useEffect(() => {
    setTablePage(1);
  }, [search, filterCategory, sortBy, projects.length]);

  const metrics = useMemo(() => {
    const total = projects.length;
    const featured = projects.filter((p) => p.is_featured && p.is_published !== false).length;
    const hidden = projects.filter((p) => p.is_published === false).length;
    const missingImages = projects.filter((p) => !p.url || !p.url.startsWith('/images/')).length;
    const normalizedMissing = projects.filter((p) => !isValidMediaPath(p.video_url || p.url || '')).length;
    return { total, featured, hidden, missingImages: normalizedMissing || missingImages };
  }, [projects]);

  const missingAssetRows = useMemo(() => {
    return projects
      .filter((p) => {
        const primary = p.video_url || p.url || '';
        const before = p.before_url || '';
        const after = p.after_url || '';
        const badPrimary = !isValidMediaPath(primary);
        const badBefore = Boolean(before) && !isValidMediaPath(before);
        const badAfter = Boolean(after) && !isValidMediaPath(after);
        return badPrimary || badBefore || badAfter;
      })
      .map((p) => {
        const expectedPrimary = p.media_type === 'video'
          ? (p.video_url?.trim() || p.url?.trim() || `/videos/${p.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.mp4`)
          : (p.url?.trim() || `/images/${p.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.jpg`);
        return {
          id: p.id,
          title: p.title,
          expectedPrimary,
          before: p.before_url || '',
          after: p.after_url || '',
        };
      });
  }, [projects]);

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-green-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {loadError ? (
        <Card className="p-4 border border-amber-300 bg-amber-50">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <p className="text-sm text-amber-900 font-medium">
              Past Work projects could not be fully loaded: {loadError}
            </p>
            <button
              type="button"
              onClick={fetchProjects}
              className="self-start sm:self-auto px-3 py-1.5 rounded-md bg-amber-700 text-white text-xs font-semibold hover:bg-amber-800"
            >
              Retry
            </button>
          </div>
        </Card>
      ) : null}

      <StatsCards
        total={metrics.total}
        featured={metrics.featured}
        published={projects.filter((p) => p.is_published !== false).length}
        hidden={metrics.hidden}
        missingMedia={metrics.missingImages}
      />

      <Card className="p-4 md:p-5">
        <div className="flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
          <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
            <input
              type="text"
              placeholder="Search by title or location"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
            />
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
            >
              {categories.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'newest' | 'display_order')}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
            >
              <option value="newest">Sort: Newest</option>
              <option value="display_order">Sort: Display order</option>
            </select>
          </div>
          <button
            onClick={openCreate}
            className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-emerald-600 text-white font-semibold hover:bg-emerald-700 transition"
          >
            Add Project
          </button>
        </div>
      </Card>

      <Card className="p-4 md:p-5">
        <h4 className="text-sm font-bold text-gray-900 mb-2">Media Path Helper</h4>
        <p className="text-xs text-gray-600 mb-3">
          Accepted: local public paths (`/images/...`, `/videos/...`) or Supabase public URLs (`https://...`).
        </p>
        {missingAssetRows.length === 0 ? (
          <p className="text-sm text-emerald-700 font-medium">All projects have valid public media paths.</p>
        ) : (
          <div className="space-y-2">
            {missingAssetRows.map((row) => (
              <div key={row.id} className="rounded-lg border border-amber-200 bg-amber-50 p-3">
                <p className="text-sm font-semibold text-gray-900">{row.title}</p>
                <p className="text-xs text-gray-700 mt-1 break-all">Primary: {row.expectedPrimary}</p>
                {row.before ? <p className="text-xs text-gray-700 break-all">Before: {row.before}</p> : null}
                {row.after ? <p className="text-xs text-gray-700 break-all">After: {row.after}</p> : null}
                <button
                  type="button"
                  onClick={() => navigator.clipboard?.writeText(row.expectedPrimary)}
                  className="mt-2 text-xs font-semibold text-emerald-700 hover:text-emerald-800"
                >
                  Copy primary path
                </button>
              </div>
            ))}
          </div>
        )}
      </Card>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr,380px] gap-4">
        <ProjectTable
          rows={filtered as AdminProjectRow[]}
          page={tablePage}
          pageSize={8}
          onPageChange={setTablePage}
          onEdit={(project) => openEdit(project as PastWorkProject)}
          onDelete={(project) => handleDelete(project as PastWorkProject)}
          onToggleFeatured={async (project) => {
            const nextValue = !project.is_featured;
            setProjects((prev) => prev.map((p) => (p.id === project.id ? { ...p, is_featured: nextValue } : p)));
            try {
              await pastWorkApi.updateProject(project.id, {
                ...(projects.find((p) => p.id === project.id) || project),
                is_featured: nextValue,
              });
            } catch (error) {
              setProjects((prev) => prev.map((p) => (p.id === project.id ? { ...p, is_featured: !nextValue } : p)));
              alert(error instanceof Error ? error.message : 'Failed to update featured status');
            }
          }}
          onTogglePublished={async (project) => {
            const nextValue = !project.is_published;
            setProjects((prev) => prev.map((p) => (p.id === project.id ? { ...p, is_published: nextValue } : p)));
            try {
              await pastWorkApi.updateProject(project.id, {
                ...(projects.find((p) => p.id === project.id) || project),
                is_published: nextValue,
              });
            } catch (error) {
              setProjects((prev) => prev.map((p) => (p.id === project.id ? { ...p, is_published: !nextValue } : p)));
              alert(error instanceof Error ? error.message : 'Failed to update publish status');
            }
          }}
        />

        {showEditor ? (
          <ProjectForm
            value={formData}
            previewUrl={previewUrl}
            saving={saving}
            uploadingMedia={uploadingMedia}
            notice={uploadNotice}
            onChange={setFormData}
            onSubmit={saveProject}
            onCancel={resetForm}
            onUpload={handlePastWorkUpload}
            onOpenMediaLibrary={(kind) => {
              if (kind === 'video') return;
              openPastWorkMediaLibrary(kind);
            }}
            isEdit={Boolean(editingProjectId)}
          />
        ) : (
          <Card className="p-6 text-center text-gray-600">
            <p className="font-semibold text-gray-800 mb-1">Project Creation Panel</p>
            <p className="text-sm mb-4">Click “Add Project” or edit an existing row.</p>
            <button
              type="button"
              onClick={openCreate}
              className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-emerald-600 text-white font-semibold hover:bg-emerald-700 transition"
            >
              Add Project
            </button>
          </Card>
        )}
      </div>

      <MediaLibraryPicker
        open={mediaPickerOpen}
        onClose={() => setMediaPickerOpen(false)}
        onSelect={applyPastWorkMediaLibraryUrl}
        title="Choose image from media library"
      />
    </div>
  );
}

function AdminBlogCardImage({ src, title }: { src: string; title: string }) {
  const [failed, setFailed] = useState(false);
  if (!isLikelyValidImageUrl(src) || failed) return null;
  return (
    <img
      src={src}
      alt={title}
      className="w-full h-48 object-cover"
      loading="lazy"
      decoding="async"
      onError={() => setFailed(true)}
    />
  );
}

const BLOG_FORM_EMPTY = {
  title: '',
  slug: '',
  content: '',
  excerpt: '',
  location: '',
  image_url: '',
};

function BlogTab() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [deletingPostId, setDeletingPostId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ ...BLOG_FORM_EMPTY });
  const [blogMediaPickerOpen, setBlogMediaPickerOpen] = useState(false);

  useEffect(() => {
    fetchPosts();
  }, []);

  async function fetchPosts() {
    try {
      const data = await blogApi.getPosts();
      setPosts(data);
    } catch (error) {
      console.error('Error fetching blog posts:', error);
    } finally {
      setLoading(false);
    }
  }

  function cancelEdit() {
    setEditingPostId(null);
    setFormData({ ...BLOG_FORM_EMPTY });
  }

  function startEdit(post: BlogPost) {
    setEditingPostId(post.id);
    setFormData({
      title: post.title,
      slug: post.slug,
      content: post.content,
      excerpt: post.excerpt ?? '',
      location: post.location ?? '',
      image_url: post.image_url ?? '',
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function handleFeaturedUpload(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingImage(true);
    try {
      const slugForPath = formData.slug.trim() || 'post';
      const url = await uploadBlogFeaturedImage(file, slugForPath);
      setFormData((f) => ({ ...f, image_url: url }));
    } catch (error) {
      console.error('Featured image upload failed:', error);
      const msg = error instanceof Error ? error.message : 'Upload failed';
      alert(msg);
    } finally {
      setUploadingImage(false);
      e.target.value = '';
    }
  }

  async function handleBlogSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);

    const payload = {
      title: formData.title,
      slug: formData.slug,
      content: formData.content,
      excerpt: formData.excerpt || null,
      location: formData.location || null,
      image_url: formData.image_url || null,
    };

    try {
      if (editingPostId) {
        await blogApi.updatePost(editingPostId, payload);
        cancelEdit();
        await fetchPosts();
        alert('Blog post updated.');
      } else {
        await blogApi.createPost(payload);
        setFormData({ ...BLOG_FORM_EMPTY });
        await fetchPosts();
        alert('Blog post created.');
      }
    } catch (error) {
      console.error('Error saving blog post:', error);
      const msg = error instanceof Error ? error.message : 'Failed to save blog post';
      alert(msg);
    } finally {
      setSaving(false);
    }
  }

  async function handleDeletePost(id: string) {
    if (
      !confirm(
        'Are you sure you want to delete this blog post? This cannot be undone.',
      )
    ) {
      return;
    }
    setDeletingPostId(id);
    try {
      await blogApi.deletePost(id);
      if (editingPostId === id) {
        cancelEdit();
      }
      setPosts((prev) => prev.filter((p) => p.id !== id));
      alert('Blog post deleted.');
    } catch (error) {
      console.error('Error deleting blog post:', error);
      const msg = error instanceof Error ? error.message : 'Failed to delete blog post';
      alert(msg);
    } finally {
      setDeletingPostId(null);
    }
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-green-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">
          {editingPostId ? 'Update Blog Post' : 'Create Blog Post'}
        </h3>
        <form onSubmit={handleBlogSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Title"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-lg"
            />
            <input
              type="text"
              placeholder="Slug (e.g. spring-tree-care-tips)"
              required
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-lg"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Excerpt (optional, plain text for list/SEO)"
              value={formData.excerpt}
              onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-lg"
            />
            <input
              type="text"
              placeholder="Location (optional, e.g. Volusia County)"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-2">Upload Featured Image</label>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              onChange={handleFeaturedUpload}
              disabled={uploadingImage || saving}
              className="block w-full text-sm text-gray-600 file:mr-4 file:rounded-lg file:border-0 file:bg-emerald-600 file:px-4 file:py-2 file:text-white file:font-semibold hover:file:bg-emerald-700"
            />
            <p className="text-xs text-gray-500 mt-1">
              Stored in Supabase Storage bucket <code className="bg-gray-100 px-1 rounded">blog-images</code>
              {uploadingImage ? ' — Uploading…' : ''}
            </p>
            <button
              type="button"
              onClick={() => setBlogMediaPickerOpen(true)}
              disabled={uploadingImage || saving}
              className="mt-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-900 hover:bg-emerald-100 disabled:opacity-50"
            >
              Browse media library
            </button>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-1">Featured image URL (optional)</label>
            <input
              type="url"
              placeholder="https://… or paste after upload"
              value={formData.image_url}
              onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            />
            {isLikelyValidImageUrl(formData.image_url) ? (
              <div className="mt-3 rounded-lg overflow-hidden border border-gray-200 max-w-md">
                <img
                  src={formData.image_url}
                  alt="Featured preview"
                  className="w-full h-40 object-cover"
                  onError={(ev) => {
                    ev.currentTarget.style.display = 'none';
                  }}
                />
              </div>
            ) : null}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-1">Blog Content (Markdown Supported)</label>
            <p className="text-xs text-gray-500 mb-2">
              Use Markdown for headings, lists, bold text, links, and images. Examples: <code># Heading</code>,{' '}
              <code>## Section</code>, <code>- bullet</code>, <code>**bold**</code>,{' '}
              <code>[text](url)</code>, <code>![alt](image-url)</code>
            </p>
            <textarea
              required
              rows={12}
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg font-mono text-sm"
              placeholder={'# Post title\n\nIntro paragraph.\n\n## Section\n- Point one\n- Point two\n\n**Bold** and [link](https://example.com)'}
            />
          </div>

          <div className="flex flex-col sm:flex-row flex-wrap gap-3">
            <button
              type="submit"
              disabled={saving || uploadingImage}
              className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-400 text-white font-bold py-2.5 px-6 rounded-lg transition"
            >
              {saving ? 'Saving…' : editingPostId ? 'Update Blog Post' : 'Create Blog Post'}
            </button>
            {editingPostId ? (
              <button
                type="button"
                onClick={cancelEdit}
                className="bg-gray-200 hover:bg-gray-300 text-gray-900 font-semibold py-2.5 px-6 rounded-lg transition"
              >
                Cancel Edit
              </button>
            ) : null}
          </div>
        </form>
      </div>

      <div className="space-y-4">
        {posts.map((post) => (
          <div key={post.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
            {post.image_url ? <AdminBlogCardImage src={post.image_url} title={post.title} /> : null}
            <div className="p-4">
              <h4 className="font-bold text-gray-900">{post.title}</h4>
              <p className="text-sm text-gray-600">{post.slug}</p>
              <p className="text-xs text-gray-500 mt-2">
                {(post.excerpt && post.excerpt.trim()) ||
                  plainTextFromMarkdown(post.content).slice(0, 180) ||
                  '—'}
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => startEdit(post)}
                  className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-gray-800 text-white text-sm font-semibold hover:bg-gray-900 transition"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => handleDeletePost(post.id)}
                  disabled={deletingPostId === post.id}
                  className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-semibold hover:bg-red-700 disabled:opacity-60 transition"
                >
                  <Trash2 className="w-4 h-4 shrink-0" />
                  {deletingPostId === post.id ? 'Deleting…' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <MediaLibraryPicker
        open={blogMediaPickerOpen}
        onClose={() => setBlogMediaPickerOpen(false)}
        onSelect={(url) => setFormData((f) => ({ ...f, image_url: url }))}
        title="Choose featured image from media library"
      />
    </div>
  );
}

function FaqTab() {
  const [items, setItems] = useState<FaqItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    question: '',
    answer: '',
  });

  useEffect(() => {
    fetchItems();
  }, []);

  async function fetchItems() {
    try {
      const data = await faqApi.getItems();
      setItems(data);
    } catch (error) {
      console.error('Error fetching FAQ items:', error);
      alert('Failed to load FAQ items');
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateOrUpdate(e: FormEvent) {
    e.preventDefault();
    setSaving(true);

    try {
      if (editingId) {
        await faqApi.updateItem(editingId, {
          question: formData.question,
          answer: formData.answer,
        });
      } else {
        await faqApi.createItem({
          question: formData.question,
          answer: formData.answer,
        });
      }

      setFormData({ question: '', answer: '' });
      setEditingId(null);
      await fetchItems();
      alert(editingId ? 'FAQ updated.' : 'FAQ created.');
    } catch (error) {
      console.error('Error saving FAQ item:', error);
      alert('Failed to save FAQ item');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this FAQ item?')) return;
    try {
      await faqApi.deleteItem(id);
      await fetchItems();
    } catch (error) {
      console.error('Error deleting FAQ item:', error);
      alert('Failed to delete FAQ item');
    }
  }

  function startEdit(item: FaqItem) {
    setEditingId(item.id);
    setFormData({
      question: item.question,
      answer: item.answer,
    });
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-green-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">
          {editingId ? 'Edit FAQ Item' : 'Create FAQ Item'}
        </h3>
        <form onSubmit={handleCreateOrUpdate} className="space-y-4">
          <input
            type="text"
            placeholder="Question"
            required
            value={formData.question}
            onChange={(e) => setFormData({ ...formData, question: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
          />
          <textarea
            placeholder="Answer"
            required
            rows={5}
            value={formData.answer}
            onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
          />
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={saving}
              className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-bold py-2 px-6 rounded-lg transition"
            >
              {saving ? 'Saving...' : editingId ? 'Update FAQ' : 'Create FAQ'}
            </button>
            {editingId ? (
              <button
                type="button"
                onClick={() => {
                  setEditingId(null);
                  setFormData({ question: '', answer: '' });
                }}
                className="bg-gray-200 hover:bg-gray-300 text-gray-900 font-semibold py-2 px-6 rounded-lg transition"
              >
                Cancel
              </button>
            ) : null}
          </div>
        </form>
      </div>

      <div className="space-y-4">
        {items.map((item) => (
          <div key={item.id} className="bg-white rounded-lg shadow-sm p-6">
            <h4 className="font-bold text-gray-900">{item.question}</h4>
            <p className="text-sm text-gray-600 mt-2 whitespace-pre-wrap">{item.answer}</p>
            <div className="flex gap-4 mt-4">
              <button
                onClick={() => startEdit(item)}
                className="text-blue-600 hover:text-blue-700 font-semibold text-sm"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(item.id)}
                className="text-red-600 hover:text-red-700 font-semibold text-sm flex items-center"
              >
                <Trash2 className="w-4 h-4 mr-1" />
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

