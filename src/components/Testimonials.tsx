import React from 'react';
import { Testimonial } from '../types';

interface TestimonialsProps {
  testimonials: Testimonial[];
}

export const Testimonials: React.FC<TestimonialsProps> = ({ testimonials }) => {
  // STRICT EMPTY CHECK:
  if (!testimonials || testimonials.length === 0) {
    return null;
  }

  return (
    <section id="testimonials" className="py-5 my-5 border-top border-subtle">
      <div className="container py-4">
        {/* Section Header */}
        <div className="row align-items-end mb-5 g-4">
          <div className="col-lg-6" data-aos="fade-up">
            <span className="hero-tag mb-2">Endorsements</span>
            <h2 className="font-editorial display-4 text-white mb-0">
              Trusted by Ambitious Creators & Founders
            </h2>
          </div>
          <div className="col-lg-6" data-aos="fade-up" data-aos-delay="100">
            <p className="text-secondary-custom fs-6 mb-0">
              Honest reflections from founders, publishing directors, and brand heads who engaged the studio to redefine their visual identity.
            </p>
          </div>
        </div>

        {/* Minimalist Editorial Testimonial Layout */}
        <div className="row g-4">
          {testimonials.map((t, idx) => (
            <div
              key={t.id}
              className="col-lg-4 col-md-6"
              data-aos="fade-up"
              data-aos-delay={idx * 100}
            >
              <div className="p-4 p-lg-5 bg-surface-dark border border-subtle h-100 d-flex flex-column justify-content-between">
                <div>
                  <div className="text-accent fs-3 mb-3 font-editorial">“</div>
                  <p className="text-secondary-custom fs-6 mb-4 leading-relaxed" style={{ fontStyle: 'italic' }}>
                    {t.testimonialText}
                  </p>
                </div>

                <div className="pt-3 border-top border-subtle d-flex align-items-center gap-3">
                  {t.avatarUrl && (
                    <img
                      src={t.avatarUrl}
                      alt={t.clientName}
                      className="rounded-circle border border-subtle"
                      style={{ width: '48px', height: '48px', objectFit: 'cover' }}
                      loading="lazy"
                    />
                  )}
                  <div>
                    <div className="text-white fw-semibold" style={{ fontSize: '0.95rem' }}>
                      {t.clientName}
                    </div>
                    <div className="text-muted-custom" style={{ fontSize: '0.78rem' }}>
                      {t.designation} {t.company ? `— ${t.company}` : ''}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
