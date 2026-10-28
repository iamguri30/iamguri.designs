import React, { useState, useMemo } from 'react';
import { Project, Category } from '../types';
import { ProjectDetailModal } from './ProjectDetailModal';

interface PortfolioProps {
  projects: Project[];
  categories: Category[];
}

export const Portfolio: React.FC<PortfolioProps> = ({ projects, categories }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [visibleCount, setVisibleCount] = useState<number>(6);

  // STRICT EMPTY CHECK:
  // If no published projects exist, do not render this section at all!
  if (!projects || projects.length === 0) {
    return null;
  }

  // Filter projects based on selected category
  const filteredProjects = useMemo(() => {
    if (selectedCategory === 'all') return projects;
    return projects.filter(p => p.categoryId === selectedCategory);
  }, [projects, selectedCategory]);

  const displayedProjects = filteredProjects.slice(0, visibleCount);
  const hasMore = visibleCount < filteredProjects.length;

  // Split into primary featured and secondary grid
  const featuredProjects = displayedProjects.filter(p => p.featured);
  const regularProjects = displayedProjects.filter(p => !p.featured);

  const getCategoryName = (catId?: string) => {
    return categories.find(c => c.id === catId)?.name || 'Design';
  };

  return (
    <section id="work" className="py-5 my-5 border-top border-subtle">
      <div className="container py-4">
        {/* Section Header */}
        <div className="row align-items-end mb-5 g-4">
          <div className="col-lg-6" data-aos="fade-up">
            <span className="hero-tag mb-2">Curated Portfolio</span>
            <h2 className="font-editorial display-4 text-white mb-0">
              Selected Works & Case Studies
            </h2>
          </div>
          <div className="col-lg-6" data-aos="fade-up" data-aos-delay="100">
            <p className="text-secondary-custom fs-6 mb-0">
              A bespoke collection of brand identities, physical packaging, bespoke typography, and editorial direction crafted for discerning clients across the globe.
            </p>
          </div>
        </div>

        {/* Category Filters Bar */}
        {categories.length > 0 && (
          <div className="d-flex flex-wrap gap-2 pb-4 mb-5 border-bottom border-subtle overflow-auto" data-aos="fade-up">
            <button
              onClick={() => { setSelectedCategory('all'); setVisibleCount(6); }}
              className={`portfolio-filter-btn ${selectedCategory === 'all' ? 'active' : ''}`}
            >
              All Projects ({projects.length})
            </button>
            {categories.map((cat) => {
              const count = projects.filter(p => p.categoryId === cat.id).length;
              if (count === 0) return null; // Hide empty category filter buttons!
              return (
                <button
                  key={cat.id}
                  onClick={() => { setSelectedCategory(cat.id); setVisibleCount(6); }}
                  className={`portfolio-filter-btn ${selectedCategory === cat.id ? 'active' : ''}`}
                >
                  {cat.name} ({count})
                </button>
              );
            })}
          </div>
        )}

        {/* 1. Featured Large Full-Width / Split Showcases */}
        {featuredProjects.map((proj, idx) => {
          const isEven = idx % 2 === 0;
          return (
            <div
              key={proj.id}
              className="featured-project-row mb-5"
              data-aos="fade-up"
              onClick={() => setSelectedProject(proj)}
              style={{ cursor: 'pointer' }}
            >
              <div className="row align-items-center g-5">
                {/* Visual */}
                <div className={`col-lg-7 ${isEven ? 'order-lg-1' : 'order-lg-2'}`}>
                  <div className="project-editorial-card overflow-hidden">
                    <div className="project-image-wrap" style={{ aspectRatio: '16/10' }}>
                      <img
                        src={proj.coverImageUrl || proj.thumbnailUrl}
                        alt={proj.title}
                        loading="lazy"
                        className="w-100 h-100"
                        style={{ objectFit: 'cover' }}
                      />
                    </div>
                  </div>
                </div>

                {/* Details */}
                <div className={`col-lg-5 ${isEven ? 'order-lg-2' : 'order-lg-1'}`}>
                  <div className="p-lg-4">
                    <div className="d-flex align-items-center gap-3 mb-3">
                      <span className="project-meta-pill">Featured Work</span>
                      <span className="text-muted-custom">•</span>
                      <span className="text-secondary-custom" style={{ fontSize: '0.85rem' }}>
                        {getCategoryName(proj.categoryId)}
                      </span>
                      {proj.projectYear && (
                        <>
                          <span className="text-muted-custom">•</span>
                          <span className="text-muted-custom" style={{ fontSize: '0.85rem' }}>{proj.projectYear}</span>
                        </>
                      )}
                    </div>

                    <h3 className="font-editorial display-6 text-white mb-3">
                      {proj.title}
                    </h3>

                    {proj.shortDescription && (
                      <p className="text-secondary-custom mb-4 leading-relaxed" style={{ fontSize: '1.02rem' }}>
                        {proj.shortDescription}
                      </p>
                    )}

                    <div className="d-inline-flex align-items-center gap-2 text-accent fw-semibold text-uppercase" style={{ fontSize: '0.85rem', letterSpacing: '0.08em' }}>
                      <span>Explore Case Study</span>
                      <i className="bi bi-arrow-right"></i>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {/* 2. Asymmetrical Secondary Projects Grid */}
        {regularProjects.length > 0 && (
          <div className="row g-4 mt-2">
            {regularProjects.map((proj, idx) => (
              <div
                key={proj.id}
                className={idx % 3 === 0 ? 'col-lg-8' : 'col-lg-4 col-md-6'}
                data-aos="fade-up"
                data-aos-delay={(idx % 3) * 100}
              >
                <div
                  className="project-editorial-card h-100 p-0"
                  onClick={() => setSelectedProject(proj)}
                >
                  <div
                    className="project-image-wrap"
                    style={{ aspectRatio: idx % 3 === 0 ? '16/9' : '4/3' }}
                  >
                    <img
                      src={proj.thumbnailUrl}
                      alt={proj.title}
                      loading="lazy"
                      className="w-100 h-100"
                      style={{ objectFit: 'cover' }}
                    />
                  </div>
                  <div className="p-4">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <span className="text-accent text-uppercase" style={{ fontSize: '0.75rem', letterSpacing: '0.08em' }}>
                        {getCategoryName(proj.categoryId)}
                      </span>
                      {proj.projectYear && (
                        <span className="text-muted-custom" style={{ fontSize: '0.8rem' }}>{proj.projectYear}</span>
                      )}
                    </div>
                    <h4 className="font-editorial text-white fs-4 mb-2">
                      {proj.title}
                    </h4>
                    {proj.shortDescription && (
                      <p className="text-secondary-custom line-clamp-2 small mb-3">
                        {proj.shortDescription}
                      </p>
                    )}
                    <div className="text-accent text-uppercase d-flex align-items-center gap-1" style={{ fontSize: '0.8rem', fontWeight: 600 }}>
                      <span>View Project</span>
                      <i className="bi bi-arrow-up-right"></i>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Load More Button */}
        {hasMore && (
          <div className="text-center pt-5 mt-4" data-aos="fade-up">
            <button
              onClick={() => setVisibleCount(prev => prev + 6)}
              className="btn btn-outline-editorial text-uppercase px-5 py-3"
            >
              Load More Projects ({filteredProjects.length - visibleCount} remaining)
            </button>
          </div>
        )}
      </div>

      {/* Project Detail Modal */}
      {selectedProject && (
        <ProjectDetailModal
          project={selectedProject}
          allProjects={projects}
          categories={categories}
          onClose={() => setSelectedProject(null)}
          onSelectProject={(p) => setSelectedProject(p)}
        />
      )}
    </section>
  );
};
