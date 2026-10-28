import React, { useState } from 'react';
import { Project, Inquiry, Category, Service, Testimonial, SiteSettings, HomepageSection } from '../../types';
import { auth } from '../../firebase';
import { logoutUser } from '../../services/auth';
import { AdminOverview } from './AdminOverview';
import { AdminProjects } from './AdminProjects';
import { AdminCategories } from './AdminCategories';
import { AdminServices } from './AdminServices';
import { AdminTestimonials } from './AdminTestimonials';
import { AdminInquiries } from './AdminInquiries';
import { AdminSettings } from './AdminSettings';

interface AdminDashboardProps {
  projects: Project[];
  inquiries: Inquiry[];
  categories: Category[];
  services: Service[];
  testimonials: Testimonial[];
  settings: SiteSettings | null;
  sections: HomepageSection[];
  onRefreshData: () => Promise<void>;
  onBackToPublic: () => void;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  projects,
  inquiries,
  categories,
  services,
  testimonials,
  settings,
  sections,
  onRefreshData,
  onBackToPublic,
  theme,
  onToggleTheme,
}) => {
  const [currentTab, setCurrentTab] = useState<string>('overview');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const currentUser = auth.currentUser;
  const newInquiriesCount = inquiries.filter(i => i.status === 'new').length;

  const handleLogout = async () => {
    try {
      await logoutUser();
      onBackToPublic();
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const navItems = [
    { id: 'overview', label: 'Overview', icon: 'bi-grid-1x2' },
    { id: 'projects', label: 'Projects', icon: 'bi-briefcase', badge: projects.length },
    { id: 'categories', label: 'Categories', icon: 'bi-tags', badge: categories.length },
    { id: 'services', label: 'Services', icon: 'bi-palette', badge: services.length },
    { id: 'testimonials', label: 'Testimonials', icon: 'bi-chat-quote', badge: testimonials.length },
    { id: 'inquiries', label: 'Inquiries', icon: 'bi-envelope-paper', alertBadge: newInquiriesCount > 0 ? newInquiriesCount : undefined },
    { id: 'settings', label: 'Site & Security', icon: 'bi-sliders' },
  ];

  return (
    <div className="d-flex min-vh-100 bg-primary-dark position-relative" style={{ color: 'var(--text-primary)' }}>
      {/* Mobile Backdrop Overlay */}
      {mobileMenuOpen && (
        <div
          className="admin-sidebar-backdrop d-lg-none"
          onClick={() => setMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Responsive Sidebar Drawer */}
      <aside
        className={`admin-sidebar d-flex flex-column justify-content-between position-fixed position-lg-sticky top-0 start-0 z-3 ${mobileMenuOpen ? 'sidebar-open' : ''}`}
      >
        <div>
          {/* Logo / Header */}
          <div className="p-4 border-bottom border-subtle d-flex justify-content-between align-items-center">
            <div>
              <div className="d-flex align-items-center gap-2">
                <span className="text-accent fs-4 font-editorial">/</span>
                <span className="fw-bold font-editorial fs-5" style={{ letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>
                  {settings?.designerName || 'Kaelen Vance'}
                </span>
              </div>
              <div className="text-muted-custom text-uppercase mt-1" style={{ fontSize: '0.68rem', letterSpacing: '0.12em' }}>
                Studio Admin Console
              </div>
            </div>

            {/* Mobile Close Button */}
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="btn btn-sm btn-outline-editorial d-lg-none p-1 px-2"
              aria-label="Close sidebar"
            >
              <i className="bi bi-x-lg"></i>
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="py-3">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setCurrentTab(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`admin-nav-item w-100 border-0 bg-transparent text-start ${currentTab === item.id ? 'active' : ''}`}
              >
                <i className={`bi ${item.icon} fs-5`}></i>
                <span className="flex-grow-1">{item.label}</span>
                {item.alertBadge && (
                  <span className="badge bg-accent text-dark rounded-pill px-2 py-1 small fw-bold">
                    {item.alertBadge}
                  </span>
                )}
                {item.badge !== undefined && !item.alertBadge && (
                  <span className="text-muted-custom small">{item.badge}</span>
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* Bottom Sidebar User Info */}
        <div className="p-3 border-top border-subtle bg-surface-dark">
          <div className="d-flex align-items-center gap-2 mb-2">
            <span className="availability-dot"></span>
            <span className="text-muted-custom small text-truncate" style={{ fontSize: '0.75rem' }}>
              {currentUser?.displayName || currentUser?.email || 'Authenticated Admin'}
            </span>
          </div>
          <div className="d-grid gap-2">
            <button
              onClick={onBackToPublic}
              className="btn btn-sm btn-outline-editorial text-uppercase"
              style={{ fontSize: '0.72rem' }}
            >
              <i className="bi bi-arrow-up-right me-1"></i>
              Public Website
            </button>
            <button
              onClick={handleLogout}
              className="btn btn-sm btn-outline-danger border-subtle text-uppercase"
              style={{ fontSize: '0.72rem' }}
            >
              <i className="bi bi-box-arrow-right me-1"></i>
              Sign Out
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-grow-1 d-flex flex-column min-vh-100" style={{ minWidth: 0, marginLeft: '0' }}>
        {/* Top Navbar */}
        <header className="p-3 px-3 px-md-4 bg-secondary-dark border-bottom border-subtle d-flex justify-content-between align-items-center sticky-top z-2">
          <div className="d-flex align-items-center gap-2 gap-md-3">
            {/* Hamburger Button for Mobile / Tablet */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="btn btn-sm btn-outline-editorial d-lg-none p-2 d-flex align-items-center justify-content-center"
              aria-label="Open sidebar navigation"
              style={{ width: '38px', height: '38px' }}
            >
              <i className="bi bi-list fs-5"></i>
            </button>

            <div className="d-none d-sm-block text-secondary-custom small">
              Connected: <span className="text-accent fw-semibold">Cloud Firestore</span>
            </div>
          </div>

          <div className="d-flex align-items-center gap-2 gap-md-3">
            {/* Theme Toggle Button */}
            <button
              onClick={onToggleTheme}
              className="btn-theme-toggle"
              title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
              aria-label="Toggle theme"
            >
              <i className={`bi ${theme === 'dark' ? 'bi-sun-fill text-warning' : 'bi-moon-stars-fill'}`}></i>
            </button>

            {/* Sync DB Button */}
            <button
              onClick={onRefreshData}
              className="btn btn-sm btn-outline-editorial text-uppercase d-flex align-items-center gap-1"
              style={{ fontSize: '0.75rem', padding: '0.45rem 0.75rem' }}
              title="Refresh database records"
            >
              <i className="bi bi-arrow-clockwise text-accent"></i>
              <span className="d-none d-md-inline">Sync DB</span>
            </button>

            {/* View Live Site Button */}
            <button
              onClick={onBackToPublic}
              className="btn btn-sm btn-lime text-uppercase fw-semibold d-flex align-items-center gap-1"
              style={{ fontSize: '0.75rem', padding: '0.45rem 0.85rem' }}
            >
              <span className="d-none d-sm-inline">Live Site</span>
              <i className="bi bi-arrow-up-right"></i>
            </button>
          </div>
        </header>

        {/* Tab Content Body */}
        <main className="p-3 p-md-4 p-xl-5 flex-grow-1">
          {currentTab === 'overview' && (
            <AdminOverview
              projects={projects}
              inquiries={inquiries}
              categories={categories}
              services={services}
              testimonials={testimonials}
              onNavigate={(tab) => setCurrentTab(tab)}
              onRefreshData={onRefreshData}
            />
          )}

          {currentTab === 'projects' && (
            <AdminProjects
              projects={projects}
              categories={categories}
              onRefreshData={onRefreshData}
            />
          )}

          {currentTab === 'categories' && (
            <AdminCategories
              categories={categories}
              projects={projects}
              onRefreshData={onRefreshData}
            />
          )}

          {currentTab === 'services' && (
            <AdminServices
              services={services}
              onRefreshData={onRefreshData}
            />
          )}

          {currentTab === 'testimonials' && (
            <AdminTestimonials
              testimonials={testimonials}
              onRefreshData={onRefreshData}
            />
          )}

          {currentTab === 'inquiries' && (
            <AdminInquiries
              inquiries={inquiries}
              onRefreshData={onRefreshData}
            />
          )}

          {currentTab === 'settings' && (
            <AdminSettings
              settings={settings}
              sections={sections}
              onRefreshData={onRefreshData}
            />
          )}
        </main>
      </div>
    </div>
  );
};
