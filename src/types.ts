export interface GalleryImage {
  url: string;
  storagePath?: string;
  altText?: string;
}

export interface Project {
  id: string;
  title: string;
  slug: string;
  shortDescription?: string;
  description?: string;
  categoryId?: string;
  tags?: string[];
  clientName?: string;
  projectYear?: number;
  services?: string[];
  thumbnailUrl: string;
  coverImageUrl?: string;
  galleryImages?: GalleryImage[];
  projectUrl?: string | null;
  featured: boolean;
  published: boolean;
  displayOrder: number;
  seoTitle?: string;
  seoDescription?: string;
  createdAt?: any;
  updatedAt?: any;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  displayOrder: number;
  createdAt?: any;
  updatedAt?: any;
}

export interface SocialLinks {
  instagram?: string;
  behance?: string;
  dribbble?: string;
  linkedin?: string;
  twitter?: string;
}

export interface SiteSettings {
  designerName: string;
  logoUrl?: string;
  heroTitle?: string;
  heroSubtitle?: string;
  heroImageUrl?: string;
  aboutText?: string;
  aboutImageUrl?: string;
  experienceYears?: number;
  softwareTools?: string[];
  achievements?: string[];
  email?: string;
  phone?: string;
  whatsapp?: string;
  socialLinks?: SocialLinks;
  availabilityStatus?: string;
  cvUrl?: string;
  seoTitle?: string;
  seoDescription?: string;
  updatedAt?: any;
}

export interface Service {
  id: string;
  title: string;
  description: string;
  startingPrice?: number | null;
  displayOrder: number;
  published: boolean;
  createdAt?: any;
  updatedAt?: any;
}

export interface Testimonial {
  id: string;
  clientName: string;
  designation?: string;
  company?: string;
  testimonialText: string;
  avatarUrl?: string | null;
  published: boolean;
  displayOrder: number;
  createdAt?: any;
  updatedAt?: any;
}

export interface Inquiry {
  id: string;
  name: string;
  email: string;
  projectType?: string;
  estimatedBudget?: string;
  message: string;
  status: 'new' | 'in_progress' | 'completed' | 'archived';
  adminNotes?: string;
  createdAt?: any;
  updatedAt?: any;
}

export interface HomepageSection {
  id: string;
  sectionKey: 'hero' | 'portfolio' | 'about' | 'services' | 'process' | 'testimonials' | 'contact';
  title: string;
  subtitle?: string;
  description?: string;
  enabled: boolean;
  displayOrder: number;
  contentType?: string;
  configuration?: Record<string, any>;
  createdAt?: any;
  updatedAt?: any;
}
