import React from 'react';

const PROCESS_STEPS = [
  {
    num: '01',
    title: 'Discovery & Investigation',
    description: 'We immerse ourselves in your brand history, competitive environment, client aspirations, and strategic goals to uncover unique narrative hooks.'
  },
  {
    num: '02',
    title: 'Strategy & Conceptual Arc',
    description: 'Defining core visual axes, architectural grids, typography pairings, and tonal moodboards before drawing a single vector.'
  },
  {
    num: '03',
    title: 'Design & Rigorous Refinement',
    description: 'Developing primary symbols, packaging mockups, color harmonies, and responsive applications with uncompromising attention to millimeter details.'
  },
  {
    num: '04',
    title: 'Production & Brand Delivery',
    description: 'Preparing comprehensive vector master suites, exact pre-press print specifications, foil stamp files, and digital design tokens for flawless launch.'
  }
];

export const Process: React.FC = () => {
  return (
    <section id="process" className="py-5 my-5 border-top border-subtle">
      <div className="container py-4">
        {/* Section Header */}
        <div className="row align-items-end mb-5 g-4">
          <div className="col-lg-6" data-aos="fade-up">
            <span className="hero-tag mb-2">Methodology</span>
            <h2 className="font-editorial display-4 text-white mb-0">
              How Vision Becomes Reality
            </h2>
          </div>
          <div className="col-lg-6" data-aos="fade-up" data-aos-delay="100">
            <p className="text-secondary-custom fs-6 mb-0">
              A structured four-phase design framework honed through a decade of international practice, balancing unrestrained artistic intuition with disciplined commercial clarity.
            </p>
          </div>
        </div>

        {/* Process Steps */}
        <div className="row g-4 pt-2">
          {PROCESS_STEPS.map((step, idx) => (
            <div
              key={idx}
              className="col-md-6 col-lg-3"
              data-aos="fade-up"
              data-aos-delay={idx * 100}
            >
              <div className="p-4 bg-surface-dark border border-subtle h-100 d-flex flex-column justify-content-between">
                <div>
                  <div className="process-step-num">{step.num}</div>
                  <h4 className="font-editorial text-white mb-3" style={{ fontSize: '1.25rem' }}>
                    {step.title}
                  </h4>
                  <p className="text-secondary-custom mb-0" style={{ fontSize: '0.9rem', lineHeight: '1.6' }}>
                    {step.description}
                  </p>
                </div>
                <div className="mt-4 pt-3 border-top border-subtle text-accent" style={{ fontSize: '0.75rem', letterSpacing: '0.1em' }}>
                  PHASE // {step.num}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
