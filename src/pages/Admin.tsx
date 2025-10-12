import { useState, useEffect } from 'react';
import { supabase, ServiceRequest, GalleryImage, SocialPost } from '../lib/supabase';
import { Upload, Trash2, CreditCard as Edit2, X, Check } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import Section from '../components/Section';
import Card from '../components/Card';

type Tab = 'requests' | 'gallery' | 'social';

export default function Admin() {
  const [authenticated, setAuthenticated] = useState(false);
  const [key, setKey] = useState('');
  const [activeTab, setActiveTab] = useState<Tab>('requests');

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    const adminKey = import.meta.env.VITE_ADMIN_KEY || 'treetek-portal-2025';
    if (key === adminKey) {
      setAuthenticated(true);
    } else {
      alert('Invalid key');
    }
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlKey = params.get('key');
    const adminKey = import.meta.env.VITE_ADMIN_KEY || 'treetek-portal-2025';
    if (urlKey === adminKey) {
      setAuthenticated(true);
      setKey(urlKey);
    }
  }, []);

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-hero animate-gradient flex items-center justify-center p-4">
        <Card variant="glass" className="p-8 max-w-md w-full">
          <h1 className="text-2xl font-bold text-white mb-6 text-center">
            Admin Portal
          </h1>
          <form onSubmit={handleAuth}>
            <label className="block text-sm font-semibold text-emerald-100 mb-2">
              Access Key
            </label>
            <input
              type="password"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              className="w-full px-4 py-3 border border-white/20 bg-white/10 text-white placeholder-emerald-200 rounded-lg focus:ring-2 focus:ring-emerald-400 focus:border-transparent mb-4"
              placeholder="Enter admin key"
            />
            <button
              type="submit"
              className="w-full bg-white hover:bg-gray-50 text-emerald-700 font-bold py-3 rounded-xl transition-all"
            >
              Access Admin
            </button>
          </form>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader
        title="Admin Dashboard"
        subtitle="Manage requests, gallery, and social posts"
      />

      <Section variant="white">
        <Card className="mb-6">
          <div className="flex border-b">
            <button
              onClick={() => setActiveTab('requests')}
              className={`flex-1 py-4 px-6 font-semibold transition ${
                activeTab === 'requests'
                  ? 'bg-emerald-50 text-emerald-600 border-b-2 border-emerald-600'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              Service Requests
            </button>
            <button
              onClick={() => setActiveTab('gallery')}
              className={`flex-1 py-4 px-6 font-semibold transition ${
                activeTab === 'gallery'
                  ? 'bg-emerald-50 text-emerald-600 border-b-2 border-emerald-600'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              Gallery Management
            </button>
            <button
              onClick={() => setActiveTab('social')}
              className={`flex-1 py-4 px-6 font-semibold transition ${
                activeTab === 'social'
                  ? 'bg-emerald-50 text-emerald-600 border-b-2 border-emerald-600'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              Social Posts
            </button>
          </div>
        </Card>

        {activeTab === 'requests' && <RequestsTab />}
        {activeTab === 'gallery' && <GalleryTab />}
        {activeTab === 'social' && <SocialTab />}
      </Section>
    </div>
  );
}

function RequestsTab() {
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRequests();
  }, []);

  async function fetchRequests() {
    try {
      const { data, error } = await supabase
        .from('service_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRequests(data || []);
    } catch (error) {
      console.error('Error fetching requests:', error);
    } finally {
      setLoading(false);
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
                  request.urgency === 'Emergency'
                    ? 'bg-red-100 text-red-800'
                    : 'bg-blue-100 text-blue-800'
                }`}
              >
                {request.urgency}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-sm font-semibold text-gray-700">Contact</p>
                <p className="text-gray-900">{request.phone}</p>
                <p className="text-gray-900">{request.email}</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-700">Location</p>
                <p className="text-gray-900">{request.address}</p>
                <p className="text-gray-900">
                  {request.city}, {request.zip}
                </p>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-700">Service Type</p>
                <p className="text-gray-900">{request.service_type}</p>
              </div>
              {request.preferred_date && (
                <div>
                  <p className="text-sm font-semibold text-gray-700">Preferred Date</p>
                  <p className="text-gray-900">
                    {new Date(request.preferred_date).toLocaleDateString()}
                  </p>
                </div>
              )}
            </div>

            <div className="mb-4">
              <p className="text-sm font-semibold text-gray-700 mb-2">Description</p>
              <p className="text-gray-900">{request.description}</p>
            </div>

            {request.photos && request.photos.length > 0 && (
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-2">Photos</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {request.photos.map((photo, index) => (
                    <a
                      key={index}
                      href={photo}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block"
                    >
                      <img
                        src={photo}
                        alt={`Photo ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg hover:opacity-75 transition"
                      />
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
}

function GalleryTab() {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    alt: '',
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    fetchImages();
  }, []);

  async function fetchImages() {
    try {
      const { data, error } = await supabase
        .from('gallery_images')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setImages(data || []);
    } catch (error) {
      console.error('Error fetching images:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedFile) return;

    setUploading(true);
    try {
      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('gallery')
        .upload(filePath, selectedFile);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('gallery')
        .getPublicUrl(filePath);

      const { error: insertError } = await supabase
        .from('gallery_images')
        .insert([
          {
            title: formData.title,
            category: formData.category,
            alt: formData.alt,
            url: publicUrl,
          },
        ]);

      if (insertError) throw insertError;

      setFormData({ title: '', category: '', alt: '' });
      setSelectedFile(null);
      fetchImages();
      alert('Image uploaded successfully!');
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Failed to upload image');
    } finally {
      setUploading(false);
    }
  }

  async function handleDelete(id: string, url: string) {
    if (!confirm('Are you sure you want to delete this image?')) return;

    try {
      const path = url.split('/').pop();
      if (path) {
        await supabase.storage.from('gallery').remove([path]);
      }

      const { error } = await supabase
        .from('gallery_images')
        .delete()
        .eq('id', id);

      if (error) throw error;
      fetchImages();
    } catch (error) {
      console.error('Error deleting image:', error);
      alert('Failed to delete image');
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
        <h3 className="text-lg font-bold text-gray-900 mb-4">Upload New Image</h3>
        <form onSubmit={handleUpload} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
              placeholder="Category"
              required
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-lg"
            />
            <input
              type="text"
              placeholder="Alt text"
              required
              value={formData.alt}
              onChange={(e) => setFormData({ ...formData, alt: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-lg"
            />
          </div>
          <div className="flex gap-4">
            <input
              type="file"
              accept="image/*"
              required
              onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
              className="flex-1"
            />
            <button
              type="submit"
              disabled={uploading}
              className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-bold py-2 px-6 rounded-lg transition"
            >
              {uploading ? 'Uploading...' : 'Upload'}
            </button>
          </div>
        </form>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {images.map((image) => (
          <div key={image.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
            <img src={image.url} alt={image.alt} className="w-full h-48 object-cover" />
            <div className="p-4">
              <h4 className="font-bold text-gray-900">{image.title}</h4>
              <p className="text-sm text-gray-600">{image.category}</p>
              <p className="text-xs text-gray-500 mt-2">{image.alt}</p>
              <button
                onClick={() => handleDelete(image.id, image.url)}
                className="mt-4 text-red-600 hover:text-red-700 font-semibold text-sm flex items-center"
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

function SocialTab() {
  const [posts, setPosts] = useState<SocialPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    platform: 'instagram' as 'instagram' | 'facebook',
    url: '',
    caption: '',
    is_published: true,
  });

  useEffect(() => {
    fetchPosts();
  }, []);

  async function fetchPosts() {
    try {
      const { data, error } = await supabase
        .from('social_posts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPosts(data || []);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    try {
      const { error } = await supabase.from('social_posts').insert([formData]);

      if (error) throw error;

      setFormData({
        platform: 'instagram',
        url: '',
        caption: '',
        is_published: true,
      });
      fetchPosts();
      alert('Post added successfully!');
    } catch (error) {
      console.error('Error adding post:', error);
      alert('Failed to add post');
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this post?')) return;

    try {
      const { error } = await supabase.from('social_posts').delete().eq('id', id);

      if (error) throw error;
      fetchPosts();
    } catch (error) {
      console.error('Error deleting post:', error);
      alert('Failed to delete post');
    }
  }

  async function togglePublish(id: string, currentStatus: boolean) {
    try {
      const { error } = await supabase
        .from('social_posts')
        .update({ is_published: !currentStatus })
        .eq('id', id);

      if (error) throw error;
      fetchPosts();
    } catch (error) {
      console.error('Error updating post:', error);
      alert('Failed to update post');
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
        <h3 className="text-lg font-bold text-gray-900 mb-4">Add New Post</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <select
              value={formData.platform}
              onChange={(e) =>
                setFormData({ ...formData, platform: e.target.value as 'instagram' | 'facebook' })
              }
              className="px-4 py-2 border border-gray-300 rounded-lg"
            >
              <option value="instagram">Instagram</option>
              <option value="facebook">Facebook</option>
            </select>
            <input
              type="url"
              placeholder="Post URL"
              required
              value={formData.url}
              onChange={(e) => setFormData({ ...formData, url: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-lg"
            />
          </div>
          <textarea
            placeholder="Caption"
            rows={3}
            value={formData.caption}
            onChange={(e) => setFormData({ ...formData, caption: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
          />
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="published"
              checked={formData.is_published}
              onChange={(e) => setFormData({ ...formData, is_published: e.target.checked })}
              className="w-4 h-4"
            />
            <label htmlFor="published" className="text-gray-700">
              Publish immediately
            </label>
          </div>
          <button
            type="submit"
            className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded-lg transition"
          >
            Add Post
          </button>
        </form>
      </div>

      <div className="space-y-4">
        {posts.map((post) => (
          <div key={post.id} className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <span className="inline-block bg-gray-100 px-3 py-1 rounded-full text-sm font-semibold text-gray-700 capitalize">
                  {post.platform}
                </span>
                <span
                  className={`ml-2 inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                    post.is_published ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {post.is_published ? 'Published' : 'Draft'}
                </span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => togglePublish(post.id, post.is_published)}
                  className="text-blue-600 hover:text-blue-700"
                >
                  {post.is_published ? 'Unpublish' : 'Publish'}
                </button>
                <button
                  onClick={() => handleDelete(post.id)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
            <p className="text-gray-700 mb-2">{post.caption}</p>
            <a
              href={post.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-green-600 hover:underline text-sm"
            >
              View Original Post →
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}
