import React from 'react';
import { SiteSettings } from '../types';

interface HeroProps {
  settings: SiteSettings | null;
  onExploreWork: () => void;
  onContactClick: () => void;
}

export const Hero: React.FC<HeroProps> = ({ settings, onExploreWork, onContactClick }) => {
  const headline = settings?.heroTitle || 'I Design Brands That Make You Impossible to Ignore.';
  const subtext = settings?.heroSubtitle || 'Award-winning creative director & graphic designer crafting high-impact visual identities, luxury packaging, and bespoke typographic systems.';
  const availability = settings?.availabilityStatus || 'Available for Selected Commissions';
  const heroImage = settings?.heroImageUrl;

  return (
    <section id="home" className="position-relative min-vh-100 d-flex align-items-center pt-5 pb-5">
      {/* Background ambient lighting */}
      <div
        className="position-absolute top-0 end-0 pointer-events-none"
        style={{
          width: '55vw',
          height: '55vh',
          background: 'radial-gradient(circle, rgba(198, 255, 77, 0.04) 0%, rgba(11, 11, 13, 0) 70%)',
          filter: 'blur(80px)',
          zIndex: 0,
        }}
      />

      <div className="container position-relative z-1 pt-5">
        <div className="row align-items-center g-5">
          {/* Text Column */}
          <div className={heroImage ? 'col-lg-7 col-xl-7' : 'col-lg-10 col-xl-9 mx-auto text-lg-start'}>
            {/* Availability Indicator */}
            <div data-aos="fade-down" className="d-inline-flex align-items-center gap-2 px-3 py-1 mb-4 border border-subtle bg-surface-dark">
              <span className="availability-dot"></span>
              <span className="text-secondary-custom text-uppercase" style={{ fontSize: '0.75rem', letterSpacing: '0.1em', fontWeight: 600 }}>
                {availability}
              </span>
            </div>

            {/* Sub-label */}
            <div data-aos="fade-up" data-aos-delay="100">
              <span className="hero-tag">Independent Graphic Designer & Art Director</span>
            </div>

            {/* Main Headline */}
            <h1
              data-aos="fade-up"
              data-aos-delay="200"
              className="hero-headline font-editorial text-white"
            >
              {headline.split(' ').map((word, index) => {
                // Highlight words like 'Brands' or 'Ignore' for editorial flair
                const lower = word.toLowerCase().replace(/[^a-z]/g, '');
                if (lower === 'brands' || lower === 'ignore') {
                  return (
                    <span key={index} className="text-accent fst-italic">
                      {word}{' '}
                    </span>
                  );
                }
                return word + ' ';
              })}
            </h1>

            {/* Supporting Paragraph */}
            <p
              data-aos="fade-up"
              data-aos-delay="300"
              className="hero-subtext mb-5"
            >
              {subtext}
            </p>

            {/* Action Buttons */}
            <div data-aos="fade-up" data-aos-delay="400" className="d-flex flex-wrap gap-3 align-items-center">
              <button
                onClick={onExploreWork}
                className="btn btn-lime text-uppercase fw-semibold d-inline-flex align-items-center gap-2"
              >
                <span>Explore My Work</span>
                <i className="bi bi-arrow-down-right"></i>
              </button>

              <button
                onClick={onContactClick}
                className="btn btn-outline-editorial text-uppercase d-inline-flex align-items-center gap-2"
              >
                <span>Let's Collaborate</span>
                <i className="bi bi-chat-text"></i>
              </button>
            </div>
          </div>

          {/* Optional Visual Artwork Column */}
          {heroImage && (
            <div className="col-lg-5 col-xl-5" data-aos="fade-left" data-aos-delay="300">
              <div className="position-relative">
                <div
                  className="position-relative overflow-hidden border border-subtle"
                  style={{
                    boxShadow: '0 25px 60px rgba(0,0,0,0.7)',
                    aspectRatio: '4/5',
                    maxHeight: '580px'
                  }}
                >
                  <img
                    src={heroImage}
                    alt={settings?.designerName || 'Graphic Designer'}
                    className="w-100 h-100"
                    style={{ objectFit: 'cover' }}
                    onError={(e) => {
                      // Hide image gracefully if broken
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                  {/* Subtle editorial watermark badge */}
                  <div
                    className="position-absolute bottom-0 start-0 p-3 bg-primary-dark border-top border-end border-subtle d-flex align-items-center gap-2"
                    style={{ fontSize: '0.75rem', letterSpacing: '0.08em' }}
                  >
                    <span className="text-accent fw-bold">PORTFOLIO</span>
                    <span className="text-muted-custom">|</span>
                    <span className="text-secondary-custom">CURATED SELECTION</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Scroll cue */}
        <div className="pt-5 mt-4 d-flex align-items-center gap-3 text-muted-custom" style={{ fontSize: '0.8rem', letterSpacing: '0.1em' }}>
          <i className="bi bi-mouse text-accent fs-5"></i>
          <span className="text-uppercase">Scroll to discover</span>
          <div className="flex-grow-1 border-bottom border-subtle" style={{ maxWidth: '120px' }}></div>
        </div>
      </div>
    </section>
  );
};
