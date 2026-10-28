/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import AOS from 'aos';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from './firebase';
import { checkIsUserAdmin } from './services/auth';
import {
  getSiteSettings,
  getPublishedProjects,
  getAllProjects,
  getCategories,
  getServices,
  getTestimonials,
  getInquiries,
  getHomepageSections,
  seedStarterData,
} from './services/db';
import { Project, Category, Service, Testimonial, Inquiry, SiteSettings, HomepageSection } from './types';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { Portfolio } from './components/Portfolio';
import { About } from './components/About';
import { Services } from './components/Services';
import { Process } from './components/Process';
import { Testimonials } from './components/Testimonials';
import { Contact } from './components/Contact';
import { AdminLogin } from './components/AdminLogin';
import { AdminDashboard } from './components/admin/AdminDashboard';

export default function App() {
  // Navigation & View state
  const [viewMode, setViewMode] = useState<'public' | 'admin'>('public');
  const [activeSection, setActiveSection] = useState<string>('home');
  const [contactPresetService, setContactPresetService] = useState<string | undefined>(undefined);

  // Theme State (Dark / Light)
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    const saved = localStorage.getItem('studio_portfolio_theme');
    return (saved === 'light' || saved === 'dark') ? saved : 'dark';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    document.body.setAttribute('data-theme', theme);
    localStorage.setItem('studio_portfolio_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  // Authentication State
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [authLoading, setAuthLoading] = useState<boolean>(true);

  // Database Data
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [sections, setSections] = useState<HomepageSection[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [allProjects, setAllProjects] = useState<Project[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [dataLoading, setDataLoading] = useState<boolean>(true);

  // Track Auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        const adminStatus = await checkIsUserAdmin(user);
        setIsAdmin(adminStatus);
        if (adminStatus) {
          loadDatabaseData(true);
        }
      } else {
        setIsAdmin(false);
      }
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Fetch all database records (public for all, admin-only when authenticated)
  const loadDatabaseData = useCallback(async (currentIsAdmin?: boolean) => {
    setDataLoading(true);
    const adminCheck = typeof currentIsAdmin === 'boolean' ? currentIsAdmin : isAdmin;
    try {
      // 1. Load public collections accessible to all visitors
      const [
        fetchedSettings,
        fetchedSections,
        publishedProjects,
        cats,
        servs,
        testis,
      ] = await Promise.all([
        getSiteSettings(),
        getHomepageSections(),
        getPublishedProjects(),
        getCategories(),
        getServices(!adminCheck), // If admin, load all services; if public, load published only
        getTestimonials(!adminCheck), // If admin, load all testimonials; if public, load published only
      ]);

      setSettings(fetchedSettings);
      setSections(fetchedSections);
      setProjects(publishedProjects);
      setCategories(cats);
      setServices(servs);
      setTestimonials(testis);

      // 2. Load admin-restricted collections (all draft/published projects & client inquiries)
      if (adminCheck) {
        try {
          const [allProjs, inqs] = await Promise.all([
            getAllProjects(),
            getInquiries()
          ]);
          setAllProjects(allProjs);
          setInquiries(inqs);
        } catch (adminErr) {
          console.warn('Could not load admin collections:', adminErr);
        }
      } else {
        setAllProjects(publishedProjects);
        setInquiries([]);
      }
    } catch (err) {
      console.error('Error fetching database collections:', err);
    } finally {
      setDataLoading(false);
    }
  }, [isAdmin]);

  useEffect(() => {
    loadDatabaseData();
  }, [loadDatabaseData]);

  // Initialize AOS
  useEffect(() => {
    AOS.init({
      duration: 800,
      easing: 'ease-out-cubic',
      once: true,
      offset: 40,
    });
  }, []);

  // Refresh AOS on dynamic data changes
  useEffect(() => {
    if (!dataLoading) {
      setTimeout(() => {
        AOS.refresh();
      }, 150);
    }
  }, [dataLoading, projects, viewMode]);

  // Check URL hash / path for /admin
  useEffect(() => {
    if (window.location.hash === '#admin' || window.location.pathname === '/admin') {
      setViewMode('admin');
    }
  }, []);

  // Scroll spy for active navbar section
  useEffect(() => {
    if (viewMode !== 'public') return;
    const handleScroll = () => {
      const sectionIds = ['home', 'work', 'about', 'services', 'process', 'testimonials', 'contact'];
      const scrollPosition = window.scrollY + 200;
      for (const id of sectionIds) {
        const element = document.getElementById(id);
        if (element) {
          const top = element.offsetTop;
          const height = element.offsetHeight;
          if (scrollPosition >= top && scrollPosition < top + height) {
            setActiveSection(id);
            break;
          }
        }
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [viewMode]);

  // Helper: Is a section enabled in homepageSections?
  const isSectionEnabled = (key: string): boolean => {
    const sec = sections.find(s => s.sectionKey === key);
    // If sections config not loaded yet, default to true
    if (!sec) return true;
    return sec.enabled;
  };

  // STRICT EMPTY-DATA VALIDATION:
  // Calculate which sections have valid content and are enabled
  const availableSections = {
    portfolio: projects.length > 0 && isSectionEnabled('portfolio'),
    about: Boolean(settings?.aboutText || settings?.aboutImageUrl) && isSectionEnabled('about'),
    services: services.length > 0 && isSectionEnabled('services'),
    process: isSectionEnabled('process'),
    testimonials: testimonials.length > 0 && isSectionEnabled('testimonials'),
    contact: isSectionEnabled('contact'),
  };

  // Smooth scroll handler
  const handleScrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleBookService = (serviceTitle: string) => {
    setContactPresetService(serviceTitle);
    handleScrollToSection('contact');
  };

  // Loading Screen
  if (dataLoading && projects.length === 0 && !settings) {
    return (
      <div className="min-vh-100 bg-primary-dark d-flex flex-column align-items-center justify-content-center text-light">
        <div className="spinner-border text-accent mb-3" style={{ width: '2.5rem', height: '2.5rem' }} role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <div className="font-editorial text-secondary-custom fs-5" style={{ letterSpacing: '0.05em' }}>
          Connecting to Studio Database...
        </div>
      </div>
    );
  }

  // Admin View
  if (viewMode === 'admin') {
    if (authLoading) {
      return (
        <div className="min-vh-100 bg-primary-dark d-flex align-items-center justify-content-center text-light">
          <span className="spinner-border text-accent"></span>
        </div>
      );
    }

    if (!currentUser || !isAdmin) {
      return (
        <AdminLogin
          theme={theme}
          onToggleTheme={toggleTheme}
          onSuccess={async () => {
            setIsAdmin(true);
            await loadDatabaseData(true);
          }}
          onCancel={() => setViewMode('public')}
        />
      );
    }

    return (
      <AdminDashboard
        projects={allProjects.length > 0 ? allProjects : projects}
        inquiries={inquiries}
        categories={categories}
        services={services}
        testimonials={testimonials}
        settings={settings}
        sections={sections}
        onRefreshData={() => loadDatabaseData(true)}
        onBackToPublic={() => setViewMode('public')}
        theme={theme}
        onToggleTheme={toggleTheme}
      />
    );
  }

  // Public Portfolio View
  return (
    <div className="bg-primary-dark min-vh-100 position-relative" style={{ color: 'var(--text-primary)' }}>
      {/* Dynamic Navbar */}
      <Navbar
        settings={settings}
        availableSections={availableSections}
        onOpenAdmin={() => setViewMode('admin')}
        activeSection={activeSection}
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      <main>
        {/* Hero Section */}
        {isSectionEnabled('hero') && (
          <Hero
            settings={settings}
            onExploreWork={() => handleScrollToSection(availableSections.portfolio ? 'work' : 'about')}
            onContactClick={() => handleScrollToSection('contact')}
          />
        )}

        {/* Selected Work / Portfolio Section (strictly hidden if no published projects exist!) */}
        {availableSections.portfolio && (
          <Portfolio
            projects={projects}
            categories={categories}
          />
        )}

        {/* About Section (strictly hidden if no about info exists!) */}
        {availableSections.about && (
          <About settings={settings} />
        )}

        {/* Services Section (strictly hidden if no services exist!) */}
        {availableSections.services && (
          <Services
            services={services}
            onBookService={handleBookService}
          />
        )}

        {/* Process Section */}
        {availableSections.process && (
          <Process />
        )}

        {/* Testimonials Section (strictly hidden if no testimonials exist!) */}
        {availableSections.testimonials && (
          <Testimonials testimonials={testimonials} />
        )}

        {/* Contact Section */}
        {availableSections.contact && (
          <Contact
            settings={settings}
            presetService={contactPresetService}
            onOpenAdmin={() => setViewMode('admin')}
          />
        )}
      </main>
    </div>
  );
}
