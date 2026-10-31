export interface Project {
  id: string;
  wixId?: string;
  title: string;
  slug: string;
  category: 'custom' | 'web-design' | 'full-stack' | 'wix-migration' | 'ecommerce';
  shortDescription?: string;
  fullDescription: string;
  tags: string[];
  coverImageUrl: string;
  altText?: string;
  projectUrl?: string;
  featured?: boolean;
  sortOrder?: number;
  createdAt?: string;
}

export interface Inquiry {
  id?: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  projectType: string;
  budgetRange?: string;
  timeline?: string;
  message: string;
  location?: string;
  ipAddress?: string;
  sourceUrl?: string;
  status?: string;
  createdAt?: string;
}

export interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  coverImageUrl?: string;
  readTime: number;
  tags: string[];
  published?: boolean;
  publishedAt: string;
  createdAt?: string;
}
