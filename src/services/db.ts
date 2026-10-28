import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  onSnapshot
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage, handleFirestoreError, OperationType } from '../firebase';
import { Project, Category, Service, Testimonial, Inquiry, SiteSettings, HomepageSection } from '../types';

// ========================
// SITE SETTINGS
// ========================
export async function getSiteSettings(): Promise<SiteSettings | null> {
  const path = 'siteSettings/general';
  try {
    const snap = await getDoc(doc(db, 'siteSettings', 'general'));
    if (!snap.exists()) return null;
    return snap.data() as SiteSettings;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

export async function updateSiteSettings(settings: Partial<SiteSettings>): Promise<void> {
  const path = 'siteSettings/general';
  try {
    await setDoc(doc(db, 'siteSettings', 'general'), {
      ...settings,
      updatedAt: serverTimestamp(),
    }, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// ========================
// HOMEPAGE SECTIONS
// ========================
export async function getHomepageSections(): Promise<HomepageSection[]> {
  const path = 'homepageSections';
  try {
    const snap = await getDocs(collection(db, 'homepageSections'));
    const list = snap.docs.map(d => ({ id: d.id, ...d.data() } as HomepageSection));
    return list.sort((a, b) => a.displayOrder - b.displayOrder);
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

export async function updateHomepageSection(id: string, sec: Partial<HomepageSection>): Promise<void> {
  const path = `homepageSections/${id}`;
  try {
    await setDoc(doc(db, 'homepageSections', id), {
      ...sec,
      updatedAt: serverTimestamp()
    }, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// ========================
// CATEGORIES
// ========================
export async function getCategories(): Promise<Category[]> {
  const path = 'categories';
  try {
    const snap = await getDocs(collection(db, 'categories'));
    const list = snap.docs.map(d => ({ id: d.id, ...d.data() } as Category));
    return list.sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

export async function createCategory(cat: Omit<Category, 'id'>): Promise<string> {
  const path = 'categories';
  try {
    const res = await addDoc(collection(db, 'categories'), {
      ...cat,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return res.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function updateCategory(id: string, cat: Partial<Category>): Promise<void> {
  const path = `categories/${id}`;
  try {
    await updateDoc(doc(db, 'categories', id), {
      ...cat,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function deleteCategory(id: string): Promise<void> {
  const path = `categories/${id}`;
  try {
    await deleteDoc(doc(db, 'categories', id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// ========================
// PROJECTS
// ========================
export async function getPublishedProjects(): Promise<Project[]> {
  const path = 'projects';
  try {
    const q = query(collection(db, 'projects'), where('published', '==', true));
    const snap = await getDocs(q);
    const list = snap.docs.map(d => ({ id: d.id, ...d.data() } as Project));
    // Sort client-side by displayOrder to prevent needing complex composite index if not yet built
    return list.sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

export async function getAllProjects(): Promise<Project[]> {
  const path = 'projects';
  try {
    const snap = await getDocs(collection(db, 'projects'));
    const list = snap.docs.map(d => ({ id: d.id, ...d.data() } as Project));
    return list.sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

export async function getProjectBySlug(slug: string): Promise<Project | null> {
  const path = 'projects';
  try {
    const q = query(collection(db, 'projects'), where('slug', '==', slug));
    const snap = await getDocs(q);
    if (snap.empty) return null;
    const docData = snap.docs[0];
    return { id: docData.id, ...docData.data() } as Project;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

export async function getProjectById(id: string): Promise<Project | null> {
  const path = `projects/${id}`;
  try {
    const snap = await getDoc(doc(db, 'projects', id));
    if (!snap.exists()) return null;
    return { id: snap.id, ...snap.data() } as Project;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

export async function createProject(p: Omit<Project, 'id'>): Promise<string> {
  const path = 'projects';
  try {
    const res = await addDoc(collection(db, 'projects'), {
      ...p,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return res.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function updateProject(id: string, p: Partial<Project>): Promise<void> {
  const path = `projects/${id}`;
  try {
    await updateDoc(doc(db, 'projects', id), {
      ...p,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function deleteProject(id: string): Promise<void> {
  const path = `projects/${id}`;
  try {
    await deleteDoc(doc(db, 'projects', id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// ========================
// SERVICES
// ========================
export async function getServices(onlyPublished: boolean = true): Promise<Service[]> {
  const path = 'services';
  try {
    const snap = await getDocs(collection(db, 'services'));
    let list = snap.docs.map(d => ({ id: d.id, ...d.data() } as Service));
    if (onlyPublished) {
      list = list.filter(s => s.published);
    }
    return list.sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

export async function createService(s: Omit<Service, 'id'>): Promise<string> {
  const path = 'services';
  try {
    const res = await addDoc(collection(db, 'services'), {
      ...s,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return res.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function updateService(id: string, s: Partial<Service>): Promise<void> {
  const path = `services/${id}`;
  try {
    await updateDoc(doc(db, 'services', id), {
      ...s,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function deleteService(id: string): Promise<void> {
  const path = `services/${id}`;
  try {
    await deleteDoc(doc(db, 'services', id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// ========================
// TESTIMONIALS
// ========================
export async function getTestimonials(onlyPublished: boolean = true): Promise<Testimonial[]> {
  const path = 'testimonials';
  try {
    const snap = await getDocs(collection(db, 'testimonials'));
    let list = snap.docs.map(d => ({ id: d.id, ...d.data() } as Testimonial));
    if (onlyPublished) {
      list = list.filter(t => t.published);
    }
    return list.sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

export async function createTestimonial(t: Omit<Testimonial, 'id'>): Promise<string> {
  const path = 'testimonials';
  try {
    const res = await addDoc(collection(db, 'testimonials'), {
      ...t,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return res.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function updateTestimonial(id: string, t: Partial<Testimonial>): Promise<void> {
  const path = `testimonials/${id}`;
  try {
    await updateDoc(doc(db, 'testimonials', id), {
      ...t,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function deleteTestimonial(id: string): Promise<void> {
  const path = `testimonials/${id}`;
  try {
    await deleteDoc(doc(db, 'testimonials', id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// ========================
// INQUIRIES
// ========================
export async function createInquiry(inquiry: {
  name: string;
  email: string;
  projectType?: string;
  estimatedBudget?: string;
  message: string;
}): Promise<string> {
  const path = 'inquiries';
  try {
    const res = await addDoc(collection(db, 'inquiries'), {
      ...inquiry,
      status: 'new',
      adminNotes: '',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return res.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function getInquiries(): Promise<Inquiry[]> {
  const path = 'inquiries';
  try {
    const snap = await getDocs(collection(db, 'inquiries'));
    const list = snap.docs.map(d => ({ id: d.id, ...d.data() } as Inquiry));
    return list.sort((a, b) => {
      const aTime = a.createdAt?.seconds ?? 0;
      const bTime = b.createdAt?.seconds ?? 0;
      return bTime - aTime;
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

export async function updateInquiry(id: string, data: Partial<Inquiry>): Promise<void> {
  const path = `inquiries/${id}`;
  try {
    await updateDoc(doc(db, 'inquiries', id), {
      ...data,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function deleteInquiry(id: string): Promise<void> {
  const path = `inquiries/${id}`;
  try {
    await deleteDoc(doc(db, 'inquiries', id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// ========================
// STORAGE UPLOAD HELPER
// ========================
export async function uploadFileToStorage(file: File, folder: string = 'portfolio'): Promise<string> {
  try {
    const cleanName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const storageRef = ref(storage, `${folder}/${Date.now()}_${cleanName}`);
    const snapshot = await uploadBytes(storageRef, file);
    return await getDownloadURL(snapshot.ref);
  } catch (err) {
    console.warn('Storage upload encountered an issue, falling back to base64 preview format for demonstration:', err);
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }
}

// ========================
// INITIAL SEEDING HELPER
// ========================
export async function seedStarterData(): Promise<void> {
  // 1. Site Settings
  await updateSiteSettings({
    designerName: 'Kaelen Vance',
    logoUrl: '',
    heroTitle: 'I Design Brands That Make You Impossible to Ignore.',
    heroSubtitle: 'Award-winning creative director & graphic designer crafting high-impact visual identities, luxury packaging, and bespoke typographic systems for world-class cultural and commercial brands.',
    heroImageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1400&q=85',
    aboutText: 'With over a decade of practice across Zurich, Tokyo, and New York, my work fuses modernist Swiss grid precision with visceral contemporary expression. I partner with founders, venture studios, and cultural institutions to build visual ecosystems that resonate on an emotional level and endure across decades.',
    aboutImageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1000&q=85',
    experienceYears: 11,
    softwareTools: ['Adobe Illustrator', 'Photoshop', 'InDesign', 'Figma', 'After Effects', 'Cinema 4D'],
    achievements: ['Tokyo Type Directors Club Annual Selection', 'Awwwards Site of the Day 2024', 'D&AD Wood Pencil Winner', 'Graphis Design Annual Platinum'],
    email: 'studio@kaelenvance.design',
    phone: '+1 (212) 847-9201',
    whatsapp: '+12128479201',
    availabilityStatus: 'Accepting projects for Q2 / Q3',
    cvUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    seoTitle: 'Kaelen Vance — Graphic Designer & Creative Director',
    seoDescription: 'Bespoke brand identities, editorial design, and packaging systems for ambitious brands worldwide.',
    socialLinks: {
      instagram: 'https://instagram.com',
      behance: 'https://behance.net',
      dribbble: 'https://dribbble.com',
      linkedin: 'https://linkedin.com',
      twitter: 'https://x.com'
    }
  });

  // 2. Homepage Sections Configuration
  const defaultSections: HomepageSection[] = [
    { id: 'hero', sectionKey: 'hero', title: 'Hero Section', enabled: true, displayOrder: 1 },
    { id: 'portfolio', sectionKey: 'portfolio', title: 'Selected Work', subtitle: 'Curated projects defining visual direction and identity', enabled: true, displayOrder: 2 },
    { id: 'about', sectionKey: 'about', title: 'Philosophy & Practice', subtitle: 'The mind and methodology behind the craft', enabled: true, displayOrder: 3 },
    { id: 'services', sectionKey: 'services', title: 'Specialized Capabilities', subtitle: 'Full-spectrum graphic design and brand architecture', enabled: true, displayOrder: 4 },
    { id: 'process', sectionKey: 'process', title: 'Creative Process', subtitle: 'From conceptual clarity to meticulous execution', enabled: true, displayOrder: 5 },
    { id: 'testimonials', sectionKey: 'testimonials', title: 'Endorsements', subtitle: 'What founders and creative leaders say', enabled: true, displayOrder: 6 },
    { id: 'contact', sectionKey: 'contact', title: "Let's Collaborate", subtitle: 'Have a project or vision? Let’s talk.', enabled: true, displayOrder: 7 },
  ];

  for (const s of defaultSections) {
    await updateHomepageSection(s.id, s);
  }

  // 3. Categories
  const catEntries: Array<Omit<Category, 'id'>> = [
    { name: 'Branding', slug: 'branding', description: 'Comprehensive brand identity and visual systems', displayOrder: 1 },
    { name: 'Packaging', slug: 'packaging', description: 'Luxury and sustainable physical product packaging', displayOrder: 2 },
    { name: 'Typography & Posters', slug: 'typography', description: 'Custom display typefaces and editorial poster series', displayOrder: 3 },
    { name: 'Editorial', slug: 'editorial', description: 'Art books, catalogues, and high-fashion publications', displayOrder: 4 },
    { name: 'Digital & UI', slug: 'digital', description: 'Art-directed digital experiences and design guidelines', displayOrder: 5 }
  ];

  const catMap: Record<string, string> = {};
  for (const c of catEntries) {
    const id = await createCategory(c);
    catMap[c.slug] = id;
  }

  // 4. Projects
  const initialProjects: Array<Omit<Project, 'id'>> = [
    {
      title: 'Aura Botanica Fine Fragrance',
      slug: 'aura-botanica',
      shortDescription: 'Complete visual identity, bespoke typographic logotype, and tactile glass packaging for Parisian niche perfumery.',
      description: 'Aura Botanica sought a visual presence that evokes raw botanical extraction paired with brutalist minimalist luxury. We designed custom embossed amber glass vessels, debossed cotton paper labels, and an understated editorial brand book reflecting centuries-old flora alchemy.',
      categoryId: catMap['packaging'] || '',
      tags: ['Branding', 'Packaging', 'Art Direction', 'Print'],
      clientName: 'Aura Botanica Paris',
      projectYear: 2024,
      services: ['Brand Strategy', 'Custom Typemark', 'Glass Bottle Design', 'Unboxing Architecture'],
      thumbnailUrl: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=1200&q=85',
      coverImageUrl: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=1600&q=85',
      galleryImages: [
        { url: 'https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&w=1200&q=85', altText: 'Perfume packaging box detail' },
        { url: 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&w=1200&q=85', altText: 'Bespoke bottle silhouette and label typography' }
      ],
      projectUrl: 'https://example.com',
      featured: true,
      published: true,
      displayOrder: 1,
      seoTitle: 'Aura Botanica — Fine Fragrance Brand Identity',
      seoDescription: 'Bespoke packaging and identity for luxury perfume house.'
    },
    {
      title: 'Monolith Architectural Monograph',
      slug: 'monolith-monograph',
      shortDescription: 'Oversized hardbound retrospective celebrating 25 years of brutalist concrete architecture in Scandinavia.',
      description: 'Conceived as a physical monument itself, this 480-page monograph features an unyielding grid system, black-foil stamping on raw linen, and dual-tone monochromatic printing that highlights the textures of raw board-formed concrete.',
      categoryId: catMap['editorial'] || '',
      tags: ['Editorial', 'Book Design', 'Grid Systems'],
      clientName: 'Nordic Architecture Press',
      projectYear: 2024,
      services: ['Editorial Layout', 'Typography System', 'Pre-Press Art Direction', 'Custom Slipcase'],
      thumbnailUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=1200&q=85',
      coverImageUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=1600&q=85',
      galleryImages: [
        { url: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=1200&q=85', altText: 'Monograph spreads and architectural photography' }
      ],
      featured: true,
      published: true,
      displayOrder: 2,
      seoTitle: 'Monolith Architectural Monograph — Editorial Design',
      seoDescription: 'Book design and typographic layout for Nordic Architecture Press.'
    },
    {
      title: 'Kanto Sound Systems Identity',
      slug: 'kanto-sound',
      shortDescription: 'Dynamic audio brand identity inspired by acoustic frequencies, wave interference patterns, and modular Swiss type.',
      description: 'A comprehensive branding system designed for high-fidelity audio equipment. Includes an animated acoustic logo mark that morphs based on live audio frequencies, accompanied by technical user manuals, anodized aluminum badge specifications, and digital storefront.',
      categoryId: catMap['branding'] || '',
      tags: ['Branding', 'Identity', 'Visual System', 'Motion'],
      clientName: 'Kanto Acoustics GmbH',
      projectYear: 2023,
      services: ['Brand Architecture', 'Audio Visualizer Design', 'Packaging System', 'Hardware Badging'],
      thumbnailUrl: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=1200&q=85',
      coverImageUrl: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=1600&q=85',
      galleryImages: [
        { url: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=1200&q=85', altText: 'Stationery and packaging collateral' }
      ],
      featured: true,
      published: true,
      displayOrder: 3,
      seoTitle: 'Kanto Sound Systems — Identity Design',
      seoDescription: 'Brand identity system for high-fidelity acoustic hardware.'
    },
    {
      title: 'Symphony 24 Exhibition Poster Series',
      slug: 'symphony-posters',
      shortDescription: 'Series of experimental screen-printed posters for the Vienna Contemporary Music Biennale.',
      description: 'Using fluorescent Pantone ink overlays and kinetic distortion typography, these silk-screened posters translate dissonant microtonal harmonies into physical graphic rhythm.',
      categoryId: catMap['typography'] || '',
      tags: ['Typography', 'Poster Design', 'Screenprint'],
      clientName: 'Vienna Biennale of Sound',
      projectYear: 2024,
      services: ['Custom Lettering', 'Poster Suite', 'Screenprinting Supervision'],
      thumbnailUrl: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=1200&q=85',
      coverImageUrl: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=1600&q=85',
      featured: false,
      published: true,
      displayOrder: 4,
      seoTitle: 'Symphony 24 Poster Series',
      seoDescription: 'Experimental screenprint posters for Vienna Biennale.'
    }
  ];

  for (const p of initialProjects) {
    await createProject(p);
  }

  // 5. Services
  const initialServices: Array<Omit<Service, 'id'>> = [
    {
      title: 'Brand Identity & Visual Systems',
      description: 'End-to-end identity design from strategic positioning and conceptual trademark design to complete guidelines, typography hierarchies, and scalable visual languages.',
      startingPrice: 4500,
      displayOrder: 1,
      published: true
    },
    {
      title: 'Luxury Packaging & Tactile Unboxing',
      description: 'Three-dimensional physical packaging engineering, material sourcing, structural die-cuts, foils, blind debossing, and sustainable unboxing experiences for consumer goods.',
      startingPrice: 3800,
      displayOrder: 2,
      published: true
    },
    {
      title: 'Editorial & Monograph Design',
      description: 'Comprehensive publication design, hardbound books, exhibition catalogues, and bespoke editorial layouts crafted with meticulous typographic rhythm and print finish oversight.',
      startingPrice: 3200,
      displayOrder: 3,
      published: true
    },
    {
      title: 'Custom Typography & Logotype Crafting',
      description: 'Unique display typefaces, custom drawn wordmarks, and tailored lettering designed to give brands an unmistakable signature silhouette that cannot be duplicated.',
      startingPrice: 2400,
      displayOrder: 4,
      published: true
    },
    {
      title: 'Digital Direction & Design Systems',
      description: 'Translating rich brand identities into fluid, art-directed web experiences, interactive micro-animations, and modular component design systems for engineering teams.',
      startingPrice: 4000,
      displayOrder: 5,
      published: true
    }
  ];

  for (const s of initialServices) {
    await createService(s);
  }

  // 6. Testimonials
  const initialTestimonials: Array<Omit<Testimonial, 'id'>> = [
    {
      clientName: 'Elena Rostova',
      designation: 'Founder & Creative Director',
      company: 'Aura Botanica Paris',
      testimonialText: 'Kaelen brought an artistic rigor that transformed our fragrance line into a collector’s piece. His attention to tactile finishes, weight, and typographical cadence is peerless.',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      published: true,
      displayOrder: 1
    },
    {
      clientName: 'Julian Hällström',
      designation: 'Publishing Director',
      company: 'Nordic Architecture Press',
      testimonialText: 'The monograph Kaelen designed won the Swedish Design Award this year. He does not simply place elements on a grid; he interrogates every line until the layout breathes.',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
      published: true,
      displayOrder: 2
    },
    {
      clientName: 'Marcus Vance',
      designation: 'Head of Product Design',
      company: 'Kanto Acoustics',
      testimonialText: 'Working with Kaelen felt like working with an architectural master. The dynamic acoustic identity he engineered gave our brand immediate authority in a crowded premium space.',
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
      published: true,
      displayOrder: 3
    }
  ];

  for (const t of initialTestimonials) {
    await createTestimonial(t);
  }
}
