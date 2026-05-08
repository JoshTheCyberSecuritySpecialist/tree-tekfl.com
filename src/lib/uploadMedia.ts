import { supabase } from './supabase.js';

export const PAST_WORK_MEDIA_BUCKET = 'past-work-media';

type MediaKind = 'primary' | 'before' | 'after' | 'video';

const IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const VIDEO_TYPES = ['video/mp4', 'video/quicktime', 'video/webm'];

const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
const MAX_VIDEO_BYTES = 50 * 1024 * 1024;

export function slugify(value: string): string {
  return String(value || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80) || 'project';
}

function extFromFile(file: File): string {
  const ext = file.name.split('.').pop()?.toLowerCase();
  if (ext) return ext;
  if (file.type === 'image/jpeg') return 'jpg';
  if (file.type === 'image/png') return 'png';
  if (file.type === 'image/webp') return 'webp';
  if (file.type === 'video/mp4') return 'mp4';
  if (file.type === 'video/quicktime') return 'mov';
  if (file.type === 'video/webm') return 'webm';
  return 'bin';
}

export function validatePastWorkUpload(file: File, kind: MediaKind): string | null {
  if (kind === 'video') {
    if (!VIDEO_TYPES.includes(file.type)) {
      return 'Invalid video type. Allowed: mp4, mov, webm.';
    }
    if (file.size > MAX_VIDEO_BYTES) {
      return 'Video exceeds 50MB max size.';
    }
    return null;
  }

  if (!IMAGE_TYPES.includes(file.type)) {
    return 'Invalid image type. Allowed: jpg, jpeg, png, webp.';
  }
  if (file.size > MAX_IMAGE_BYTES) {
    return 'Image exceeds 10MB max size.';
  }
  return null;
}

export async function uploadPastWorkMedia(file: File, title: string, kind: MediaKind) {
  const validation = validatePastWorkUpload(file, kind);
  if (validation) throw new Error(validation);

  const projectSlug = slugify(title);
  const ext = extFromFile(file);
  const filename = `${projectSlug}-${kind}.${ext}`;
  const path = `past-work/${projectSlug}/${filename}`;

  const { error } = await supabase.storage.from(PAST_WORK_MEDIA_BUCKET).upload(path, file, {
    contentType: file.type,
    upsert: true,
  });

  if (error) throw new Error(error.message);

  const { data } = supabase.storage.from(PAST_WORK_MEDIA_BUCKET).getPublicUrl(path);
  if (!data?.publicUrl) throw new Error('Upload succeeded but public URL was not returned.');

  return { publicUrl: data.publicUrl, path };
}
