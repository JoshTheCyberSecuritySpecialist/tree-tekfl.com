import { supabase } from './supabase.js';

export const MEDIA_LIBRARY_BUCKET = 'media';

const IMAGE_EXT = /\.(jpe?g|png|webp|gif)$/i;

export function isMediaLibraryImageName(name: string): boolean {
  if (!name || name.endsWith('/')) return false;
  return IMAGE_EXT.test(name);
}

export function sanitizeMediaFilename(name: string): string {
  const base = name.split(/[/\\]/).pop() || 'upload';
  return base.replace(/[^a-zA-Z0-9.-]/g, '_').slice(0, 120) || 'upload';
}

export function validateMediaLibraryImage(file: File): string | null {
  const okTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (!okTypes.includes(file.type)) {
    return 'Please use JPG, PNG, or WebP.';
  }
  if (file.size > 10 * 1024 * 1024) {
    return 'Image must be 10MB or smaller.';
  }
  return null;
}

export async function uploadMediaLibraryImage(file: File): Promise<{ path: string; publicUrl: string }> {
  const err = validateMediaLibraryImage(file);
  if (err) throw new Error(err);

  const path = `${Date.now()}-${sanitizeMediaFilename(file.name)}`;
  const { error } = await supabase.storage.from(MEDIA_LIBRARY_BUCKET).upload(path, file, {
    contentType: file.type || 'image/jpeg',
    upsert: false,
  });

  if (error) throw new Error(error.message);

  const { data } = supabase.storage.from(MEDIA_LIBRARY_BUCKET).getPublicUrl(path);
  if (!data?.publicUrl) throw new Error('Upload succeeded but public URL was not returned.');

  return { path, publicUrl: data.publicUrl };
}

export type MediaLibraryItem = {
  name: string;
  path: string;
  publicUrl: string;
  updatedAt: string | null;
};

export async function listMediaLibraryImages(limit = 100): Promise<MediaLibraryItem[]> {
  const { data, error } = await supabase.storage.from(MEDIA_LIBRARY_BUCKET).list('', {
    limit,
  });

  if (error) throw new Error(error.message);
  if (!data?.length) return [];

  const items: MediaLibraryItem[] = [];

  for (const file of data) {
    if (!file.name) continue;
    if (!isMediaLibraryImageName(file.name)) continue;

    const { data: pub } = supabase.storage.from(MEDIA_LIBRARY_BUCKET).getPublicUrl(file.name);
    if (!pub?.publicUrl) continue;

    items.push({
      name: file.name,
      path: file.name,
      publicUrl: pub.publicUrl,
      updatedAt: file.updated_at ?? null,
    });
  }

  items.sort((a, b) => {
    const ta = a.updatedAt ? +new Date(a.updatedAt) : 0;
    const tb = b.updatedAt ? +new Date(b.updatedAt) : 0;
    if (tb !== ta) return tb - ta;
    return b.name.localeCompare(a.name);
  });

  return items;
}

export async function deleteMediaLibraryObject(path: string): Promise<void> {
  const clean = path.replace(/^\/+/, '');
  if (!clean || clean.includes('..')) throw new Error('Invalid path.');
  const { error } = await supabase.storage.from(MEDIA_LIBRARY_BUCKET).remove([clean]);
  if (error) throw new Error(error.message);
}
