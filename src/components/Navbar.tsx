import React, { useState, useEffect } from 'react';
import { SiteSettings } from '../types';

interface NavbarProps {
  settings: SiteSettings | null;
  availableSections: {
    portfolio: boolean;
    about: boolean;
    services: boolean;
    process: boolean;
    testimonials: boolean;
    contact: boolean;
  };
  onOpenAdmin: () => void;
  activeSection: string;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  settings,
  availableSections,
  onOpenAdmin,
  activeSection,
  theme,
  onToggleTheme,
}) => {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollTo = (id: string) => {
    setMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const designerName = settings?.designerName || 'Kaelen Vance';

  return (
    <nav className={`navbar navbar-expand-lg navbar-editorial fixed-top ${scrolled ? 'py-2 shadow-sm' : 'py-3'}`}>
      <div className="container">
        {/* Brand / Logo */}
        <a
          href="#home"
          onClick={(e) => { e.preventDefault(); scrollTo('home'); }}
          className="navbar-brand d-flex align-items-center gap-2 text-decoration-none fw-bold fs-4"
          style={{ letterSpacing: '-0.02em', color: 'var(--text-primary)' }}
        >
          {settings?.logoUrl ? (
            <img src={settings.logoUrl} alt={designerName} style={{ height: '32px', objectFit: 'contain' }} />
          ) : (
            <span className="font-editorial d-flex align-items-center gap-2">
              <span className="text-accent">/</span> {designerName}
            </span>
          )}
        </a>

        {/* Right side mobile controls: Theme button + Hamburger toggle */}
        <div className="d-flex align-items-center gap-2 d-lg-none">
          <button
            onClick={onToggleTheme}
            className="btn-theme-toggle"
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
            aria-label="Toggle visual theme"
          >
            <i className={`bi ${theme === 'dark' ? 'bi-sun-fill text-warning' : 'bi-moon-stars-fill'}`}></i>
          </button>

          <button
            className="navbar-toggler border-0 p-1"
            type="button"
            aria-label="Toggle navigation"
            onClick={() => setMenuOpen(!menuOpen)}
            style={{ boxShadow: 'none', color: 'var(--text-primary)' }}
          >
            <i className={`bi ${menuOpen ? 'bi-x-lg text-accent' : 'bi-list'} fs-2`}></i>
          </button>
        </div>

        {/* Navbar links (dynamically rendered based on available sections) */}
        <div className={`collapse navbar-collapse ${menuOpen ? 'show bg-surface-dark p-3 mt-3 border border-subtle shadow-lg' : ''}`}>
          <ul className="navbar-nav ms-auto mb-2 mb-lg-0 align-items-lg-center gap-lg-1">
            <li className="nav-item">
              <button
                className={`nav-link btn btn-link ${activeSection === 'home' ? 'active' : ''}`}
                onClick={() => scrollTo('home')}
              >
                Home
              </button>
            </li>

            {availableSections.portfolio && (
              <li className="nav-item">
                <button
                  className={`nav-link btn btn-link ${activeSection === 'work' ? 'active' : ''}`}
                  onClick={() => scrollTo('work')}
                >
                  Work
                </button>
              </li>
            )}

            {availableSections.about && (
              <li className="nav-item">
                <button
                  className={`nav-link btn btn-link ${activeSection === 'about' ? 'active' : ''}`}
                  onClick={() => scrollTo('about')}
                >
                  About
                </button>
              </li>
            )}

            {availableSections.services && (
              <li className="nav-item">
                <button
                  className={`nav-link btn btn-link ${activeSection === 'services' ? 'active' : ''}`}
                  onClick={() => scrollTo('services')}
                >
                  Services
                </button>
              </li>
            )}

            {availableSections.process && (
              <li className="nav-item">
                <button
                  className={`nav-link btn btn-link ${activeSection === 'process' ? 'active' : ''}`}
                  onClick={() => scrollTo('process')}
                >
                  Process
                </button>
              </li>
            )}

            {availableSections.testimonials && (
              <li className="nav-item">
                <button
                  className={`nav-link btn btn-link ${activeSection === 'testimonials' ? 'active' : ''}`}
                  onClick={() => scrollTo('testimonials')}
                >
                  Testimonials
                </button>
              </li>
            )}

            {availableSections.contact && (
              <li className="nav-item">
                <button
                  className={`nav-link btn btn-link ${activeSection === 'contact' ? 'active' : ''}`}
                  onClick={() => scrollTo('contact')}
                >
                  Contact
                </button>
              </li>
            )}

            {/* Desktop Theme Toggle Button */}
            <li className="nav-item ms-lg-2 d-none d-lg-block">
              <button
                onClick={onToggleTheme}
                className="btn-theme-toggle"
                title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
                aria-label="Toggle theme"
              >
                <i className={`bi ${theme === 'dark' ? 'bi-sun-fill text-warning' : 'bi-moon-stars-fill'}`}></i>
              </button>
            </li>

            {/* Quick Admin access button */}
            <li className="nav-item ms-lg-2 mt-2 mt-lg-0">
              <button
                className="btn btn-sm btn-outline-editorial px-3 py-2 text-uppercase d-flex align-items-center gap-2"
                onClick={onOpenAdmin}
                title="Admin Dashboard Management"
                style={{ fontSize: '0.8rem' }}
              >
                <i className="bi bi-shield-lock text-accent"></i>
                <span>Admin</span>
              </button>
            </li>

            {/* Let's Talk CTA */}
            {availableSections.contact && (
              <li className="nav-item ms-lg-2 mt-2 mt-lg-0">
                <button
                  className="btn btn-lime btn-sm px-3 py-2 text-uppercase fw-semibold"
                  onClick={() => scrollTo('contact')}
                  style={{ fontSize: '0.82rem' }}
                >
                  Let's Talk
                </button>
              </li>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
};
