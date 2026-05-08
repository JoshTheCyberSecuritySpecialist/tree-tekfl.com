/* eslint-disable @typescript-eslint/no-explicit-any */
declare module '*/components/ScrollToTop' {
  import type { ComponentType } from 'react';
  const ScrollToTop: ComponentType;
  export default ScrollToTop;
}

declare module '*/services/api' {
  export class ApiError extends Error {}
  export const API_BASE_URL: string;
  export const quoteApi: any;
  export const blogApi: any;
  export const faqApi: any;
  export const pastWorkApi: any;
  export const reviewsApi: any;
  export const sitePagesApi: any;
  export const settingsApi: any;
  export const adminUsersApi: any;
  export const BLOG_IMAGES_BUCKET: string;
  export function apiRequest(endpoint: string, options?: any): Promise<any>;
  export function uploadBlogFeaturedImage(file: File, slug: string): Promise<string>;
}

declare module '*/services/auth' {
  export const ERR_ADMIN_NOT_IN_TABLE: string;
  export function loginAdmin(args: { email: string; password: string }): Promise<any>;
  export function logoutAdmin(): Promise<void>;
  export function getAdminAccess(): Promise<any>;
  export function getAdminSession(): Promise<any>;
  export function onAdminAuthChange(
    callback: (event: string, session: any) => void,
  ): () => void;
}
