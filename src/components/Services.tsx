import React from 'react';
import { Service } from '../types';

interface ServicesProps {
  services: Service[];
  onBookService: (serviceTitle: string) => void;
}

export const Services: React.FC<ServicesProps> = ({ services, onBookService }) => {
  // STRICT EMPTY CHECK:
  if (!services || services.length === 0) {
    return null;
  }

  return (
    <section id="services" className="py-5 my-5 border-top border-subtle">
      <div className="container py-4">
        {/* Section Header */}
        <div className="row align-items-end mb-5 g-4">
          <div className="col-lg-6" data-aos="fade-up">
            <span className="hero-tag mb-2">Capabilities & Offerings</span>
            <h2 className="font-editorial display-4 text-white mb-0">
              Specialized Design Disciplines
            </h2>
          </div>
          <div className="col-lg-6" data-aos="fade-up" data-aos-delay="100">
            <p className="text-secondary-custom fs-6 mb-0">
              Tailored creative solutions designed to position brands with distinction, elevate market presence, and deliver cohesive aesthetic excellence across physical and digital touchpoints.
            </p>
          </div>
        </div>

        {/* Typographic Rows (No generic cards!) */}
        <div className="border-top border-subtle">
          {services.map((s, idx) => {
            const indexStr = String(idx + 1).padStart(2, '0');
            return (
              <div
                key={s.id}
                className="service-row-item"
                data-aos="fade-up"
                data-aos-delay={idx * 50}
              >
                <div className="row align-items-center g-4">
                  {/* Step Number */}
                  <div className="col-auto">
                    <span className="service-num">{indexStr}</span>
                  </div>

                  {/* Service Title */}
                  <div className="col-md-4 col-lg-4">
                    <h3 className="service-title mb-0">{s.title}</h3>
                  </div>

                  {/* Description */}
                  <div className="col-md-5 col-lg-5">
                    <p className="text-secondary-custom mb-0" style={{ fontSize: '0.95rem' }}>
                      {s.description}
                    </p>
                  </div>

                  {/* Price & Action */}
                  <div className="col-md-2 col-lg-2 text-md-end">
                    {s.startingPrice ? (
                      <div className="mb-2">
                        <span className="text-muted-custom" style={{ fontSize: '0.75rem', textTransform: 'uppercase' }}>From</span>
                        <div className="font-editorial text-white fw-bold fs-5">
                          ${s.startingPrice.toLocaleString()}
                        </div>
                      </div>
                    ) : (
                      <div className="text-muted-custom small mb-2">Bespoke Scope</div>
                    )}
                    <button
                      onClick={() => onBookService(s.title)}
                      className="btn btn-sm btn-outline-editorial text-uppercase"
                      style={{ fontSize: '0.75rem', padding: '0.35rem 0.75rem' }}
                    >
                      Inquire &rarr;
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
