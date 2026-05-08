import { supabase } from '../lib/supabase.js';

const rawApiUrl = import.meta.env.VITE_API_URL || '';
export const API_BASE_URL = rawApiUrl.replace(/\/+$/, '');

export class ApiError extends Error {
  constructor(message, status, payload) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.payload = payload;
  }
}

function buildUrl(endpoint) {
  if (!API_BASE_URL) {
    throw new ApiError('Missing VITE_API_URL environment variable.', 500);
  }

  const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${API_BASE_URL}${normalizedEndpoint}`;
}

export async function apiRequest(endpoint, options = {}) {
  const url = buildUrl(endpoint);

  try {
    const response = await fetch(url, {
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
      body: options.body ? JSON.stringify(options.body) : undefined,
    });

    const responseText = await response.text();
    let payload = null;
    if (responseText) {
      try {
        payload = JSON.parse(responseText);
      } catch {
        payload = { message: responseText };
      }
    }

    if (!response.ok) {
      throw new ApiError(
        payload?.error || payload?.message || `API request failed (${response.status})`,
        response.status,
        payload
      );
    }

    return payload;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    throw new ApiError('Network request failed. Please try again.', 0, error);
  }
}

export const quoteApi = {
  /**
   * Inserts into `service_requests` (matches supabase/migrations schema).
   * Photo files: uploaded to storage when possible; URLs stored in `photos` jsonb.
   */
  async submitQuoteRequest(formData, photoFiles = []) {
    const photoUrls = [];

    for (const file of photoFiles) {
      if (!file || !file.size) continue;
      try {
        const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
        const path = `web/${crypto.randomUUID()}-${safeName}`;
        const { error: upErr } = await supabase.storage.from('requests').upload(path, file, {
          contentType: file.type || 'image/jpeg',
          upsert: false,
        });
        if (upErr) {
          console.warn('Quote photo upload skipped:', upErr.message);
          continue;
        }
        const { data: pub } = supabase.storage.from('requests').getPublicUrl(path);
        if (pub?.publicUrl) photoUrls.push(pub.publicUrl);
      } catch (e) {
        console.warn('Quote photo upload failed:', e);
      }
    }

    const payload = {
      name: formData.name,
      phone: formData.phone,
      email: formData.email,
      address: formData.address,
      city: formData.city,
      zip: formData.zip,
      service_type: formData.service_type,
      urgency: formData.urgency || 'Normal',
      preferred_date: formData.preferred_date ? formData.preferred_date : null,
      description: formData.description,
      photos: photoUrls,
    };

    const { data, error } = await supabase
      .from('service_requests')
      .insert([payload])
      .select()
      .single();

    if (error) {
      throw new ApiError(error.message, 400, error);
    }

    return { success: true, data };
  },
  async getQuoteRequests() {
    const { data, error } = await supabase
      .from('service_requests')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw new ApiError(error.message, 400, error);
    }

    return data || [];
  },
  async deleteQuoteRequest(id) {
    const { error } = await supabase.from('service_requests').delete().eq('id', id);
    if (error) {
      console.error('[quoteApi.deleteQuoteRequest]', error);
      throw new ApiError(error.message, 400, error);
    }
  },

  /**
   * Admin Leads pipeline: update CRM stage (requires `status` column — see migrations).
   * @param {string} id
   * @param {'new'|'contacted'|'scheduled'|'completed'|'lost'} status
   */
  async updateServiceRequestStatus(id, status) {
    const { error } = await supabase.from('service_requests').update({ status }).eq('id', id);
    if (error) {
      throw new ApiError(error.message, 400, error);
    }
  },
};

/** Supabase Storage bucket for blog featured + inline images (see supabase/setup_blog_images_bucket.sql). */
export const BLOG_IMAGES_BUCKET = 'blog-images';

/**
 * @param {File} file
 * @param {string} slug - used in path; safe characters only
 * @returns {Promise<string>} public URL
 */
export async function uploadBlogFeaturedImage(file, slug) {
  if (!file || !file.size) {
    throw new ApiError('No file selected.', 400, null);
  }

  const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
  const safeExt = ['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(ext) ? ext : 'jpg';
  const safeSlug = String(slug || 'post')
    .replace(/[^a-zA-Z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 80) || 'post';
  const path = `blog-posts/${safeSlug}-${Date.now()}.${safeExt}`;

  const { error } = await supabase.storage.from(BLOG_IMAGES_BUCKET).upload(path, file, {
    contentType: file.type || `image/${safeExt === 'jpg' ? 'jpeg' : safeExt}`,
    upsert: false,
  });

  if (error) {
    console.error('[uploadBlogFeaturedImage]', error);
    throw new ApiError(error.message, 400, error);
  }

  const { data: pub } = supabase.storage.from(BLOG_IMAGES_BUCKET).getPublicUrl(path);
  if (!pub?.publicUrl) {
    throw new ApiError('Could not resolve public URL for upload.', 500, null);
  }

  return pub.publicUrl;
}

export const blogApi = {
  async getPosts() {
    const { data, error } = await supabase
      .from('blog_posts')
      .select('id, title, slug, content, excerpt, location, image_url, created_at')
      .order('created_at', { ascending: false });

    if (error) {
      throw new ApiError(error.message, 400, error);
    }

    return data || [];
  },
  async getPostBySlug(slug) {
    const { data, error } = await supabase
      .from('blog_posts')
      .select('id, title, slug, content, excerpt, location, image_url, created_at')
      .eq('slug', slug)
      .maybeSingle();

    if (error) {
      console.error('[blogApi.getPostBySlug]', error);
      throw new ApiError(error.message, 400, error);
    }

    if (!data) {
      throw new ApiError('Post not found.', 404, null);
    }

    return data;
  },
  async createPost(fields) {
    const title = String(fields.title ?? '').trim();
    const slug = String(fields.slug ?? '').trim();
    const content = String(fields.content ?? '').trim();

    if (!title) {
      throw new ApiError('Title is required.', 400, null);
    }
    if (!slug) {
      throw new ApiError('Slug is required.', 400, null);
    }
    if (!content) {
      throw new ApiError('Content is required.', 400, null);
    }

    const payload = {
      title,
      slug,
      content,
      excerpt: fields.excerpt != null && String(fields.excerpt).trim() ? String(fields.excerpt).trim() : null,
      location:
        fields.location != null && String(fields.location).trim() ? String(fields.location).trim() : null,
      image_url:
        fields.image_url != null && String(fields.image_url).trim() ? String(fields.image_url).trim() : null,
    };

    const { data, error } = await supabase.from('blog_posts').insert([payload]).select().single();

    if (error) {
      console.error('[blogApi.createPost]', error);
      throw new ApiError(error.message, 400, error);
    }

    return data;
  },
  async updatePost(id, fields) {
    const title = String(fields.title ?? '').trim();
    const slug = String(fields.slug ?? '').trim();
    const content = String(fields.content ?? '').trim();

    if (!title) {
      throw new ApiError('Title is required.', 400, null);
    }
    if (!slug) {
      throw new ApiError('Slug is required.', 400, null);
    }
    if (!content) {
      throw new ApiError('Content is required.', 400, null);
    }

    const payload = {
      title,
      slug,
      content,
      excerpt: fields.excerpt != null && String(fields.excerpt).trim() ? String(fields.excerpt).trim() : null,
      location:
        fields.location != null && String(fields.location).trim() ? String(fields.location).trim() : null,
      image_url:
        fields.image_url != null && String(fields.image_url).trim() ? String(fields.image_url).trim() : null,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase.from('blog_posts').update(payload).eq('id', id).select().single();

    if (error) {
      console.error('[blogApi.updatePost]', error);
      throw new ApiError(error.message, 400, error);
    }

    return data;
  },
  async deletePost(id) {
    const { error } = await supabase.from('blog_posts').delete().eq('id', id);
    if (error) {
      console.error('[blogApi.deletePost]', error);
      throw new ApiError(error.message, 400, error);
    }
  },
};

export const faqApi = {
  async getItems() {
    const { data, error } = await supabase
      .from('faq_items')
      .select('id, question, answer, created_at, updated_at')
      .order('created_at', { ascending: false });

    if (error) {
      throw new ApiError(error.message, 400, error);
    }

    return data || [];
  },
  async createItem(item) {
    const { data, error } = await supabase
      .from('faq_items')
      .insert([item])
      .select()
      .single();

    if (error) {
      throw new ApiError(error.message, 400, error);
    }

    return data;
  },
  async updateItem(id, updates) {
    const { data, error } = await supabase
      .from('faq_items')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new ApiError(error.message, 400, error);
    }

    return data;
  },
  async deleteItem(id) {
    const { error } = await supabase.from('faq_items').delete().eq('id', id);
    if (error) {
      throw new ApiError(error.message, 400, error);
    }
  },
};

export const pastWorkApi = {
  async getProjects({ includeHidden = false } = {}) {
    let baseQuery = supabase
      .from('gallery_images')
      .select('*')
      .order('created_at', { ascending: false });

    if (!includeHidden) {
      baseQuery = baseQuery.eq('is_published', true);
    }

    const { data, error } = await baseQuery;
    if (!error) {
      const rows = data || [];
      // Keep compatibility with older schemas where display_order/is_published may not exist.
      return rows.sort((a, b) => {
        const ao = Number(a?.display_order ?? 0);
        const bo = Number(b?.display_order ?? 0);
        if (ao !== bo) return ao - bo;
        return +new Date(b?.created_at || 0) - +new Date(a?.created_at || 0);
      });
    }

    // Final fallback: legacy minimal shape query.
    const { data: legacy, error: legacyError } = await supabase
      .from('gallery_images')
      .select('id, title, category, url, alt, created_at')
      .order('created_at', { ascending: false });

    if (legacyError) {
      throw new ApiError(legacyError.message, 400, legacyError);
    }

    return legacy || [];
  },

  async createProject(fields) {
    const payload = {
      title: String(fields.title ?? '').trim(),
      category: String(fields.category ?? '').trim(),
      location: fields.location != null && String(fields.location).trim() ? String(fields.location).trim() : null,
      caption: fields.caption != null && String(fields.caption).trim() ? String(fields.caption).trim() : null,
      url: String(fields.url ?? '').trim(),
      before_url: fields.before_url != null && String(fields.before_url).trim() ? String(fields.before_url).trim() : null,
      after_url: fields.after_url != null && String(fields.after_url).trim() ? String(fields.after_url).trim() : null,
      video_url: fields.video_url != null && String(fields.video_url).trim() ? String(fields.video_url).trim() : null,
      media_type: fields.media_type === 'video' ? 'video' : 'image',
      alt: fields.alt != null && String(fields.alt).trim() ? String(fields.alt).trim() : String(fields.title ?? '').trim(),
      is_featured: Boolean(fields.is_featured),
      has_google_review_overlay: Boolean(fields.has_google_review_overlay),
      display_order: Number.isFinite(Number(fields.display_order)) ? Number(fields.display_order) : 0,
      is_published: fields.is_published !== false,
    };

    if (!payload.title) throw new ApiError('Project title is required.', 400, null);
    if (!payload.category) throw new ApiError('Service type is required.', 400, null);
    if (!payload.url) throw new ApiError('Primary media path is required.', 400, null);

    const { data, error } = await supabase.from('gallery_images').insert([payload]).select().single();
    if (error) {
      throw new ApiError(error.message, 400, error);
    }
    return data;
  },

  async updateProject(id, fields) {
    const payload = {
      title: String(fields.title ?? '').trim(),
      category: String(fields.category ?? '').trim(),
      location: fields.location != null && String(fields.location).trim() ? String(fields.location).trim() : null,
      caption: fields.caption != null && String(fields.caption).trim() ? String(fields.caption).trim() : null,
      url: String(fields.url ?? '').trim(),
      before_url: fields.before_url != null && String(fields.before_url).trim() ? String(fields.before_url).trim() : null,
      after_url: fields.after_url != null && String(fields.after_url).trim() ? String(fields.after_url).trim() : null,
      video_url: fields.video_url != null && String(fields.video_url).trim() ? String(fields.video_url).trim() : null,
      media_type: fields.media_type === 'video' ? 'video' : 'image',
      alt: fields.alt != null && String(fields.alt).trim() ? String(fields.alt).trim() : String(fields.title ?? '').trim(),
      is_featured: Boolean(fields.is_featured),
      has_google_review_overlay: Boolean(fields.has_google_review_overlay),
      display_order: Number.isFinite(Number(fields.display_order)) ? Number(fields.display_order) : 0,
      is_published: fields.is_published !== false,
      updated_at: new Date().toISOString(),
    };

    if (!payload.title) throw new ApiError('Project title is required.', 400, null);
    if (!payload.category) throw new ApiError('Service type is required.', 400, null);
    if (!payload.url) throw new ApiError('Primary media path is required.', 400, null);

    const { data, error } = await supabase.from('gallery_images').update(payload).eq('id', id).select().single();
    if (error) {
      throw new ApiError(error.message, 400, error);
    }
    return data;
  },

  async deleteProject(id) {
    const { error } = await supabase.from('gallery_images').delete().eq('id', id);
    if (error) {
      throw new ApiError(error.message, 400, error);
    }
  },
};

export const reviewsApi = {
  async getAllForAdmin() {
    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw new ApiError(error.message, 400, error);
    }

    return data || [];
  },

  /** Public / anon: approved reviews only; featured first. */
  async getApprovedForPublic() {
    const { data, error } = await supabase
      .from('reviews')
      .select('id, customer_name, rating, review_text, city, service_type, featured, created_at')
      .eq('status', 'approved')
      .order('featured', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) {
      if (import.meta.env.DEV) {
        console.warn('[reviewsApi.getApprovedForPublic]', error.message);
      }
      return [];
    }

    return data || [];
  },

  async createReview(fields) {
    const payload = {
      customer_name: String(fields.customer_name ?? '').trim(),
      rating: Math.min(5, Math.max(1, Number(fields.rating) || 5)),
      review_text: String(fields.review_text ?? '').trim(),
      source: String(fields.source ?? 'manual').trim() || 'manual',
      city: fields.city != null && String(fields.city).trim() ? String(fields.city).trim() : null,
      service_type:
        fields.service_type != null && String(fields.service_type).trim()
          ? String(fields.service_type).trim()
          : null,
      status: ['approved', 'pending', 'hidden'].includes(fields.status) ? fields.status : 'approved',
      google_review_url:
        fields.google_review_url != null && String(fields.google_review_url).trim()
          ? String(fields.google_review_url).trim()
          : null,
      featured: Boolean(fields.featured),
      updated_at: new Date().toISOString(),
    };

    if (!payload.customer_name) throw new ApiError('Customer name is required.', 400, null);
    if (!payload.review_text) throw new ApiError('Review text is required.', 400, null);

    const { data, error } = await supabase.from('reviews').insert([payload]).select().single();
    if (error) {
      throw new ApiError(error.message, 400, error);
    }
    return data;
  },

  async updateReview(id, fields) {
    const payload = {
      customer_name: String(fields.customer_name ?? '').trim(),
      rating: Math.min(5, Math.max(1, Number(fields.rating) || 5)),
      review_text: String(fields.review_text ?? '').trim(),
      source: String(fields.source ?? 'manual').trim() || 'manual',
      city: fields.city != null && String(fields.city).trim() ? String(fields.city).trim() : null,
      service_type:
        fields.service_type != null && String(fields.service_type).trim()
          ? String(fields.service_type).trim()
          : null,
      status: ['approved', 'pending', 'hidden'].includes(fields.status) ? fields.status : 'approved',
      google_review_url:
        fields.google_review_url != null && String(fields.google_review_url).trim()
          ? String(fields.google_review_url).trim()
          : null,
      featured: Boolean(fields.featured),
      updated_at: new Date().toISOString(),
    };

    if (!payload.customer_name) throw new ApiError('Customer name is required.', 400, null);
    if (!payload.review_text) throw new ApiError('Review text is required.', 400, null);

    const { data, error } = await supabase.from('reviews').update(payload).eq('id', id).select().single();
    if (error) {
      throw new ApiError(error.message, 400, error);
    }
    return data;
  },

  async deleteReview(id) {
    const { error } = await supabase.from('reviews').delete().eq('id', id);
    if (error) {
      throw new ApiError(error.message, 400, error);
    }
  },

  async setReviewFeatured(id, featured) {
    const { error } = await supabase
      .from('reviews')
      .update({ featured: Boolean(featured), updated_at: new Date().toISOString() })
      .eq('id', id);
    if (error) {
      throw new ApiError(error.message, 400, error);
    }
  },

  async setReviewStatus(id, status) {
    if (!['approved', 'pending', 'hidden'].includes(status)) {
      throw new ApiError('Invalid status.', 400, null);
    }
    const { error } = await supabase
      .from('reviews')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id);
    if (error) {
      throw new ApiError(error.message, 400, error);
    }
  },

  async getReviewRequestSettings() {
    const { data, error } = await supabase.from('review_request_settings').select('*').eq('id', 1).maybeSingle();
    if (error) {
      throw new ApiError(error.message, 400, error);
    }
    return data || { id: 1, google_review_url: '', updated_at: null };
  },

  async saveReviewRequestSettings(google_review_url) {
    const row = {
      id: 1,
      google_review_url: String(google_review_url ?? '').trim(),
      updated_at: new Date().toISOString(),
    };
    const { error } = await supabase.from('review_request_settings').upsert(row, { onConflict: 'id' });
    if (error) {
      throw new ApiError(error.message, 400, error);
    }
  },
};

export const sitePagesApi = {
  /** Public: published row only, or null. */
  async getPublishedBySlug(slug) {
    const clean = String(slug || '').trim();
    if (!clean) return null;
    const { data, error } = await supabase
      .from('site_pages')
      .select('*')
      .eq('slug', clean)
      .eq('status', 'published')
      .maybeSingle();
    if (error) {
      if (import.meta.env.DEV) console.warn('[sitePagesApi.getPublishedBySlug]', error.message);
      return null;
    }
    return data ?? null;
  },

  /** Slugs for published CMS pages (for client-side route registration). */
  async getPublishedSlugs() {
    const { data, error } = await supabase.from('site_pages').select('slug').eq('status', 'published');
    if (error) {
      if (import.meta.env.DEV) console.warn('[sitePagesApi.getPublishedSlugs]', error.message);
      return [];
    }
    return (data || []).map((r) => r.slug).filter(Boolean);
  },

  async getAllForAdmin() {
    const { data, error } = await supabase
      .from('site_pages')
      .select('*')
      .order('updated_at', { ascending: false });
    if (error) {
      throw new ApiError(error.message, 400, error);
    }
    return data || [];
  },

  async createPage(fields) {
    const payload = {
      slug: String(fields.slug ?? '')
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9-]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, ''),
      title: String(fields.title ?? '').trim(),
      meta_title: fields.meta_title != null ? String(fields.meta_title).trim() || null : null,
      meta_description: fields.meta_description != null ? String(fields.meta_description).trim() || null : null,
      h1: fields.h1 != null ? String(fields.h1).trim() || null : null,
      excerpt: fields.excerpt != null ? String(fields.excerpt).trim() || null : null,
      content: fields.content != null ? String(fields.content) : '',
      page_type: String(fields.page_type ?? 'seo').trim() || 'seo',
      location: fields.location != null && String(fields.location).trim() ? String(fields.location).trim() : null,
      service_type:
        fields.service_type != null && String(fields.service_type).trim()
          ? String(fields.service_type).trim()
          : null,
      status: ['published', 'draft'].includes(fields.status) ? fields.status : 'draft',
      featured_image_url:
        fields.featured_image_url != null && String(fields.featured_image_url).trim()
          ? String(fields.featured_image_url).trim()
          : null,
      updated_at: new Date().toISOString(),
    };

    if (!payload.slug) throw new ApiError('Slug is required (letters, numbers, hyphens).', 400, null);
    if (!payload.title) throw new ApiError('Title is required.', 400, null);

    const { data, error } = await supabase.from('site_pages').insert([payload]).select().single();
    if (error) {
      if (error.code === '23505' || /duplicate|unique/i.test(error.message)) {
        throw new ApiError('That slug is already in use. Choose a different slug.', 400, error);
      }
      throw new ApiError(error.message, 400, error);
    }
    return data;
  },

  async updatePage(id, fields) {
    const payload = {
      slug: String(fields.slug ?? '')
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9-]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, ''),
      title: String(fields.title ?? '').trim(),
      meta_title: fields.meta_title != null ? String(fields.meta_title).trim() || null : null,
      meta_description: fields.meta_description != null ? String(fields.meta_description).trim() || null : null,
      h1: fields.h1 != null ? String(fields.h1).trim() || null : null,
      excerpt: fields.excerpt != null ? String(fields.excerpt).trim() || null : null,
      content: fields.content != null ? String(fields.content) : '',
      page_type: String(fields.page_type ?? 'seo').trim() || 'seo',
      location: fields.location != null && String(fields.location).trim() ? String(fields.location).trim() : null,
      service_type:
        fields.service_type != null && String(fields.service_type).trim()
          ? String(fields.service_type).trim()
          : null,
      status: ['published', 'draft'].includes(fields.status) ? fields.status : 'draft',
      featured_image_url:
        fields.featured_image_url != null && String(fields.featured_image_url).trim()
          ? String(fields.featured_image_url).trim()
          : null,
      updated_at: new Date().toISOString(),
    };

    if (!payload.slug) throw new ApiError('Slug is required.', 400, null);
    if (!payload.title) throw new ApiError('Title is required.', 400, null);

    const { data, error } = await supabase.from('site_pages').update(payload).eq('id', id).select().single();
    if (error) {
      if (error.code === '23505' || /duplicate|unique/i.test(error.message)) {
        throw new ApiError('That slug is already in use.', 400, error);
      }
      throw new ApiError(error.message, 400, error);
    }
    return data;
  },

  async setPageStatus(id, status) {
    if (!['published', 'draft'].includes(status)) {
      throw new ApiError('Invalid status.', 400, null);
    }
    const { error } = await supabase
      .from('site_pages')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id);
    if (error) {
      throw new ApiError(error.message, 400, error);
    }
  },

  async deletePage(id) {
    const { error } = await supabase.from('site_pages').delete().eq('id', id);
    if (error) {
      throw new ApiError(error.message, 400, error);
    }
  },
};

export const settingsApi = {
  async getSetting(key, fallbackValue = null) {
    const { data, error } = await supabase.from('settings').select('value').eq('key', key).maybeSingle();
    if (error) {
      throw new ApiError(error.message, 400, error);
    }
    return data?.value ?? fallbackValue;
  },

  async updateSetting(key, value) {
    const payload = {
      key: String(key),
      value: value ?? {},
      updated_at: new Date().toISOString(),
    };
    const { error } = await supabase.from('settings').upsert(payload, { onConflict: 'key' });
    if (error) {
      throw new ApiError(error.message, 400, error);
    }
  },
};

export const adminUsersApi = {
  /** Returns public.admins + auth.users email via security-definer RPC. */
  async listAdminUsers() {
    const { data, error } = await supabase.rpc('list_admin_users');
    if (error) {
      throw new ApiError(error.message, 400, error);
    }
    return data || [];
  },

  /** Looks up one auth user by email via security-definer RPC. */
  async findAuthUserByEmail(email) {
    const clean = String(email ?? '').trim();
    if (!clean) return null;
    const { data, error } = await supabase.rpc('find_auth_user_by_email', { p_email: clean });
    if (error) {
      throw new ApiError(error.message, 400, error);
    }
    return Array.isArray(data) && data.length > 0 ? data[0] : null;
  },

  async addAdmin(userId) {
    const { error } = await supabase.from('admins').insert([{ id: userId }]);
    if (error) {
      if (error.code === '23505' || /duplicate|unique/i.test(error.message)) {
        throw new ApiError('That user is already an admin.', 400, error);
      }
      throw new ApiError(error.message, 400, error);
    }
  },

  async removeAdmin(userId) {
    const { error } = await supabase.from('admins').delete().eq('id', userId);
    if (error) {
      throw new ApiError(error.message, 400, error);
    }
  },
};
