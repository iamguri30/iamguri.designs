import React, { useEffect } from 'react';
import { Project, Category } from '../types';

interface ProjectDetailModalProps {
  project: Project | null;
  allProjects: Project[];
  categories: Category[];
  onClose: () => void;
  onSelectProject: (project: Project) => void;
}

export const ProjectDetailModal: React.FC<ProjectDetailModalProps> = ({
  project,
  allProjects,
  categories,
  onClose,
  onSelectProject,
}) => {
  useEffect(() => {
    // Lock body scroll when modal is open
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  if (!project) return null;

  // Category name lookup
  const categoryName = categories.find(c => c.id === project.categoryId)?.name;

  // Navigation: prev / next published projects
  const currentIndex = allProjects.findIndex(p => p.id === project.id);
  const prevProject = currentIndex > 0 ? allProjects[currentIndex - 1] : null;
  const nextProject = currentIndex < allProjects.length - 1 ? allProjects[currentIndex + 1] : null;

  // Related projects (same category, different project)
  const relatedProjects = allProjects
    .filter(p => p.id !== project.id && p.categoryId === project.categoryId)
    .slice(0, 2);

  return (
    <div
      className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center"
      style={{
        zIndex: 1060,
        backgroundColor: 'var(--modal-backdrop)',
        backdropFilter: 'blur(12px)',
        overflowY: 'auto',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="position-relative w-100 max-w-5xl my-2 my-md-4 mx-2 mx-md-3 bg-secondary-dark border border-subtle shadow-2xl"
        style={{
          maxWidth: '1050px',
          maxHeight: '94vh',
          overflowY: 'auto',
          borderRadius: 0,
          color: 'var(--text-primary)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header / Sticky Bar */}
        <div className="sticky-top bg-secondary-dark border-bottom border-subtle d-flex justify-content-between align-items-center px-4 py-3 z-3">
          <div className="d-flex align-items-center gap-2">
            <span className="text-accent text-uppercase" style={{ fontSize: '0.75rem', letterSpacing: '0.1em', fontWeight: 600 }}>
              Project Case Study
            </span>
            {categoryName && (
              <>
                <span className="text-muted-custom">/</span>
                <span className="text-secondary-custom" style={{ fontSize: '0.8rem' }}>{categoryName}</span>
              </>
            )}
          </div>
          <button
            onClick={onClose}
            className="btn btn-outline-editorial p-2 d-flex align-items-center justify-content-center"
            style={{ width: '38px', height: '38px' }}
            aria-label="Close modal"
          >
            <i className="bi bi-x-lg"></i>
          </button>
        </div>

        {/* Hero Cover Image */}
        {(project.coverImageUrl || project.thumbnailUrl) && (
          <div className="w-100 position-relative bg-surface-dark overflow-hidden" style={{ maxHeight: '520px' }}>
            <img
              src={project.coverImageUrl || project.thumbnailUrl}
              alt={project.title}
              className="w-100 h-100"
              style={{ objectFit: 'cover', minHeight: '320px', maxHeight: '520px' }}
            />
          </div>
        )}

        <div className="p-4 p-md-5">
          {/* Title & Metadata Row */}
          <div className="row g-4 mb-5 pb-4 border-bottom border-subtle">
            <div className="col-lg-8">
              <h2 className="font-editorial display-5 text-white mb-3">
                {project.title}
              </h2>
              {project.shortDescription && (
                <p className="fs-5 text-secondary-custom leading-relaxed">
                  {project.shortDescription}
                </p>
              )}
            </div>

            {/* Project Details Sidebar */}
            <div className="col-lg-4">
              <div className="p-4 bg-surface-dark border border-subtle">
                <div className="d-flex flex-column gap-3" style={{ fontSize: '0.88rem' }}>
                  {project.clientName && (
                    <div>
                      <div className="text-muted-custom text-uppercase mb-1" style={{ fontSize: '0.72rem', letterSpacing: '0.08em' }}>Client</div>
                      <div className="text-white fw-semibold">{project.clientName}</div>
                    </div>
                  )}

                  {project.projectYear && (
                    <div>
                      <div className="text-muted-custom text-uppercase mb-1" style={{ fontSize: '0.72rem', letterSpacing: '0.08em' }}>Year</div>
                      <div className="text-white">{project.projectYear}</div>
                    </div>
                  )}

                  {categoryName && (
                    <div>
                      <div className="text-muted-custom text-uppercase mb-1" style={{ fontSize: '0.72rem', letterSpacing: '0.08em' }}>Category</div>
                      <div className="text-accent">{categoryName}</div>
                    </div>
                  )}

                  {project.services && project.services.length > 0 && (
                    <div>
                      <div className="text-muted-custom text-uppercase mb-1" style={{ fontSize: '0.72rem', letterSpacing: '0.08em' }}>Services</div>
                      <div className="d-flex flex-wrap gap-1 mt-1">
                        {project.services.map((s, idx) => (
                          <span key={idx} className="badge bg-secondary-dark border border-subtle text-secondary-custom fw-normal py-1 px-2">
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {project.projectUrl && (
                    <div className="pt-2">
                      <a
                        href={project.projectUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-sm btn-outline-editorial w-100 text-uppercase d-flex align-items-center justify-content-center gap-2"
                      >
                        <span>Visit Live Project</span>
                        <i className="bi bi-box-arrow-up-right"></i>
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Full Brief / Creative Process Description */}
          {project.description && (
            <div className="mb-5">
              <h4 className="font-editorial text-white mb-3" style={{ fontSize: '1.4rem' }}>
                Creative Direction & Outcome
              </h4>
              <div
                className="text-secondary-custom leading-relaxed"
                style={{ fontSize: '1.02rem', whiteSpace: 'pre-line' }}
              >
                {project.description}
              </div>
            </div>
          )}

          {/* Gallery Showcase */}
          {project.galleryImages && project.galleryImages.length > 0 && (
            <div className="mb-5">
              <h4 className="font-editorial text-white mb-4" style={{ fontSize: '1.4rem' }}>
                Project Imagery & Artifacts
              </h4>
              <div className="row g-4">
                {project.galleryImages.map((img, idx) => (
                  <div key={idx} className={idx % 3 === 0 ? 'col-12' : 'col-md-6'}>
                    <div className="border border-subtle bg-surface-dark overflow-hidden position-relative">
                      <img
                        src={img.url}
                        alt={img.altText || `${project.title} detail ${idx + 1}`}
                        className="w-100"
                        style={{ objectFit: 'cover', maxHeight: idx % 3 === 0 ? '550px' : '400px' }}
                        loading="lazy"
                      />
                      {img.altText && (
                        <div className="p-2 px-3 bg-primary-dark text-muted-custom" style={{ fontSize: '0.78rem' }}>
                          {img.altText}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tags */}
          {project.tags && project.tags.length > 0 && (
            <div className="d-flex flex-wrap align-items-center gap-2 mb-5 pt-3 border-top border-subtle">
              <span className="text-muted-custom" style={{ fontSize: '0.8rem' }}>Tags:</span>
              {project.tags.map((tag, idx) => (
                <span key={idx} className="badge bg-surface-dark border border-subtle text-secondary-custom fw-normal">
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Related Projects */}
          {relatedProjects.length > 0 && (
            <div className="mb-5 pt-4 border-top border-subtle">
              <h5 className="font-editorial text-white mb-4">Related Work</h5>
              <div className="row g-4">
                {relatedProjects.map((rel) => (
                  <div key={rel.id} className="col-md-6">
                    <div
                      className="p-3 bg-surface-dark border border-subtle cursor-pointer d-flex align-items-center gap-3"
                      style={{ cursor: 'pointer' }}
                      onClick={() => onSelectProject(rel)}
                    >
                      <img
                        src={rel.thumbnailUrl}
                        alt={rel.title}
                        style={{ width: '80px', height: '80px', objectFit: 'cover' }}
                      />
                      <div>
                        <div className="text-white fw-semibold mb-1">{rel.title}</div>
                        <div className="text-accent text-uppercase" style={{ fontSize: '0.75rem' }}>View Case Study &rarr;</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Previous / Next Project Navigation Bar */}
          <div className="d-flex justify-content-between align-items-center pt-4 border-top border-subtle">
            {prevProject ? (
              <button
                onClick={() => onSelectProject(prevProject)}
                className="btn btn-outline-editorial text-uppercase d-flex align-items-center gap-2"
                style={{ fontSize: '0.85rem' }}
              >
                <i className="bi bi-arrow-left"></i>
                <span className="d-none d-sm-inline">{prevProject.title}</span>
                <span className="d-inline d-sm-none">Prev</span>
              </button>
            ) : <div />}

            <button
              onClick={onClose}
              className="btn btn-lime text-uppercase px-4"
              style={{ fontSize: '0.82rem' }}
            >
              Back to Portfolio
            </button>

            {nextProject ? (
              <button
                onClick={() => onSelectProject(nextProject)}
                className="btn btn-outline-editorial text-uppercase d-flex align-items-center gap-2"
                style={{ fontSize: '0.85rem' }}
              >
                <span className="d-none d-sm-inline">{nextProject.title}</span>
                <span className="d-inline d-sm-none">Next</span>
                <i className="bi bi-arrow-right"></i>
              </button>
            ) : <div />}
          </div>
        </div>
      </div>
    </div>
  );
};
