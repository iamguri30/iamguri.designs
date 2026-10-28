import React from 'react';
import { SiteSettings } from '../types';

interface AboutProps {
  settings: SiteSettings | null;
}

export const About: React.FC<AboutProps> = ({ settings }) => {
  // STRICT EMPTY CHECK:
  if (!settings || (!settings.aboutText && !settings.aboutImageUrl && !settings.experienceYears)) {
    return null;
  }

  const bio = settings.aboutText;
  const portrait = settings.aboutImageUrl;
  const years = settings.experienceYears;
  const tools = settings.softwareTools && settings.softwareTools.length > 0
    ? settings.softwareTools
    : ['Adobe Illustrator', 'Photoshop', 'InDesign', 'Figma', 'After Effects', 'Cinema 4D'];
  const achievements = settings.achievements && settings.achievements.length > 0
    ? settings.achievements
    : [];

  return (
    <section id="about" className="py-5 my-5 border-top border-subtle">
      <div className="container py-4">
        <div className="row g-5 align-items-center">
          {/* Portrait Column */}
          {portrait && (
            <div className="col-lg-5" data-aos="fade-right">
              <div className="position-relative">
                <div
                  className="border border-subtle overflow-hidden position-relative bg-surface-dark"
                  style={{ aspectRatio: '3/4', maxHeight: '560px' }}
                >
                  <img
                    src={portrait}
                    alt={settings.designerName || 'Designer Portrait'}
                    className="w-100 h-100"
                    style={{ objectFit: 'cover' }}
                    loading="lazy"
                  />
                </div>
                {/* Float stat badge */}
                {years && (
                  <div
                    className="position-absolute bottom-0 end-0 bg-primary-dark p-4 border-top border-start border-subtle"
                    style={{ minWidth: '180px' }}
                  >
                    <div className="font-editorial text-accent display-4 fw-bold line-1" style={{ lineHeight: 1 }}>
                      {years}+
                    </div>
                    <div className="text-secondary-custom text-uppercase mt-2" style={{ fontSize: '0.75rem', letterSpacing: '0.1em' }}>
                      Years Design Practice
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Biography & Philosophy Column */}
          <div className={portrait ? 'col-lg-7' : 'col-lg-10 mx-auto'} data-aos="fade-left">
            <span className="hero-tag mb-2">Philosophy & Background</span>
            <h2 className="font-editorial display-4 text-white mb-4">
              Design is Not Decoration. It is Calculated Intention.
            </h2>

            {bio && (
              <div
                className="text-secondary-custom fs-5 mb-4 leading-relaxed"
                style={{ whiteSpace: 'pre-line' }}
              >
                {bio}
              </div>
            )}

            {/* Software and Tools */}
            {tools.length > 0 && (
              <div className="mb-4 pt-3 border-top border-subtle">
                <div className="text-uppercase text-muted-custom mb-3" style={{ fontSize: '0.75rem', letterSpacing: '0.1em' }}>
                  Core Toolkit & Capabilities
                </div>
                <div className="d-flex flex-wrap gap-2">
                  {tools.map((tool, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-2 bg-surface-dark border border-subtle text-white text-uppercase"
                      style={{ fontSize: '0.8rem', letterSpacing: '0.05em' }}
                    >
                      {tool}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Achievements & Recognition */}
            {achievements.length > 0 && (
              <div className="mb-4 pt-3 border-top border-subtle">
                <div className="text-uppercase text-muted-custom mb-3" style={{ fontSize: '0.75rem', letterSpacing: '0.1em' }}>
                  Selected Honors & Accolades
                </div>
                <ul className="list-unstyled mb-0 d-flex flex-column gap-2">
                  {achievements.map((ach, idx) => (
                    <li key={idx} className="d-flex align-items-center gap-2 text-secondary-custom">
                      <i className="bi bi-award text-accent"></i>
                      <span>{ach}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Downloadable CV / Portfolio Button */}
            {settings.cvUrl && (
              <div className="pt-4">
                <a
                  href={settings.cvUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-outline-editorial text-uppercase d-inline-flex align-items-center gap-2"
                >
                  <i className="bi bi-file-earmark-pdf text-accent fs-5"></i>
                  <span>Download Curriculum Vitae / PDF</span>
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
