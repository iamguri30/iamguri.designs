import React, { useState } from 'react';
import { Project, Inquiry, Category, Service, Testimonial } from '../../types';
import { seedStarterData, updateInquiry, updateProject } from '../../services/db';

interface AdminOverviewProps {
  projects: Project[];
  inquiries: Inquiry[];
  categories: Category[];
  services: Service[];
  testimonials: Testimonial[];
  onNavigate: (tab: string) => void;
  onRefreshData: () => Promise<void>;
}

export const AdminOverview: React.FC<AdminOverviewProps> = ({
  projects,
  inquiries,
  categories,
  services,
  testimonials,
  onNavigate,
  onRefreshData,
}) => {
  const [seeding, setSeeding] = useState(false);
  const [seedSuccess, setSeedSuccess] = useState(false);

  const publishedCount = projects.filter(p => p.published).length;
  const draftCount = projects.filter(p => !p.published).length;
  const newInquiriesCount = inquiries.filter(i => i.status === 'new').length;

  const handleSeed = async () => {
    if (!window.confirm('Populate the Firestore database with curated portfolio projects, categories, services, and site settings?')) {
      return;
    }
    setSeeding(true);
    setSeedSuccess(false);
    try {
      await seedStarterData();
      await onRefreshData();
      setSeedSuccess(true);
      setTimeout(() => setSeedSuccess(false), 6000);
    } catch (err) {
      console.error('Seeding error:', err);
      alert('Seeding error: ' + String(err));
    } finally {
      setSeeding(false);
    }
  };

  const handleTogglePublish = async (p: Project) => {
    try {
      await updateProject(p.id, { published: !p.published });
      await onRefreshData();
    } catch (err) {
      console.error('Failed to toggle publish status:', err);
    }
  };

  const handleUpdateInquiryStatus = async (inquiryId: string, status: Inquiry['status']) => {
    try {
      await updateInquiry(inquiryId, { status });
      await onRefreshData();
    } catch (err) {
      console.error('Failed to update inquiry status:', err);
    }
  };

  return (
    <div>
      {/* Top Banner & Seed Action */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 pb-4 mb-4 border-bottom border-subtle">
        <div>
          <h2 className="font-editorial text-white fs-3 mb-1">Studio Overview & Metrics</h2>
          <p className="text-secondary-custom small mb-0">
            Real-time synchronization with Firestore database collections.
          </p>
        </div>

        <div className="d-flex align-items-center gap-2">
          <button
            onClick={handleSeed}
            disabled={seeding}
            className="btn btn-outline-editorial text-uppercase d-flex align-items-center gap-2"
            style={{ fontSize: '0.8rem' }}
            title="Seed initial showcase projects, categories, services, and testimonials"
          >
            {seeding ? (
              <>
                <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                <span>Seeding Firestore...</span>
              </>
            ) : (
              <>
                <i className="bi bi-cloud-arrow-up text-accent"></i>
                <span>Seed Starter Portfolio Data</span>
              </>
            )}
          </button>
        </div>
      </div>

      {seedSuccess && (
        <div className="alert alert-success bg-surface-dark border-accent text-accent rounded-0 p-3 mb-4 d-flex align-items-center gap-2">
          <i className="bi bi-check-circle fs-5"></i>
          <span>Database successfully populated with showcase portfolio projects, services, categories, and settings!</span>
        </div>
      )}

      {/* Metrics Grid */}
      <div className="row g-3 mb-5">
        <div className="col-sm-6 col-xl-3" onClick={() => onNavigate('projects')} style={{ cursor: 'pointer' }}>
          <div className="admin-stat-card">
            <div className="d-flex justify-content-between align-items-start mb-2">
              <span className="text-muted-custom text-uppercase small" style={{ letterSpacing: '0.05em' }}>Published Works</span>
              <i className="bi bi-eye text-accent fs-5"></i>
            </div>
            <div className="admin-stat-number text-accent">{publishedCount}</div>
            <div className="text-muted-custom small mt-2">{draftCount} drafts in progress</div>
          </div>
        </div>

        <div className="col-sm-6 col-xl-3" onClick={() => onNavigate('inquiries')} style={{ cursor: 'pointer' }}>
          <div className="admin-stat-card">
            <div className="d-flex justify-content-between align-items-start mb-2">
              <span className="text-muted-custom text-uppercase small" style={{ letterSpacing: '0.05em' }}>Client Inquiries</span>
              <i className="bi bi-envelope-paper text-accent fs-5"></i>
            </div>
            <div className="admin-stat-number">{inquiries.length}</div>
            <div className="text-accent small mt-2">{newInquiriesCount} new submissions</div>
          </div>
        </div>

        <div className="col-sm-6 col-xl-3" onClick={() => onNavigate('services')} style={{ cursor: 'pointer' }}>
          <div className="admin-stat-card">
            <div className="d-flex justify-content-between align-items-start mb-2">
              <span className="text-muted-custom text-uppercase small" style={{ letterSpacing: '0.05em' }}>Active Services</span>
              <i className="bi bi-palette text-accent fs-5"></i>
            </div>
            <div className="admin-stat-number">{services.length}</div>
            <div className="text-muted-custom small mt-2">{categories.length} portfolio categories</div>
          </div>
        </div>

        <div className="col-sm-6 col-xl-3" onClick={() => onNavigate('testimonials')} style={{ cursor: 'pointer' }}>
          <div className="admin-stat-card">
            <div className="d-flex justify-content-between align-items-start mb-2">
              <span className="text-muted-custom text-uppercase small" style={{ letterSpacing: '0.05em' }}>Testimonials</span>
              <i className="bi bi-chat-quote text-accent fs-5"></i>
            </div>
            <div className="admin-stat-number">{testimonials.length}</div>
            <div className="text-muted-custom small mt-2">Client endorsements</div>
          </div>
        </div>
      </div>

      <div className="row g-4">
        {/* Recent Inquiries */}
        <div className="col-lg-6">
          <div className="p-4 bg-surface-dark border border-subtle h-100">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h4 className="font-editorial text-white fs-5 mb-0">Recent Client Inquiries</h4>
              <button
                onClick={() => onNavigate('inquiries')}
                className="btn btn-sm btn-link text-accent text-decoration-none p-0"
                style={{ fontSize: '0.8rem' }}
              >
                View All &rarr;
              </button>
            </div>

            {inquiries.length === 0 ? (
              <div className="text-muted-custom py-4 text-center small">
                No inquiries submitted yet. Form submissions will appear here in real-time.
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table admin-table mb-0">
                  <thead>
                    <tr>
                      <th>Client</th>
                      <th>Focus</th>
                      <th>Status</th>
                      <th className="text-end">Quick Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {inquiries.slice(0, 5).map((inq) => (
                      <tr key={inq.id}>
                        <td>
                          <div className="fw-semibold text-white">{inq.name}</div>
                          <div className="text-muted-custom small">{inq.email}</div>
                        </td>
                        <td>
                          <span className="badge bg-secondary-dark border border-subtle text-secondary-custom fw-normal">
                            {inq.projectType || 'General'}
                          </span>
                        </td>
                        <td>
                          <span className={`badge ${inq.status === 'new' ? 'bg-accent' : 'bg-secondary-dark border border-subtle text-muted-custom'}`}>
                            {inq.status}
                          </span>
                        </td>
                        <td className="text-end">
                          <button
                            onClick={() => handleUpdateInquiryStatus(inq.id, inq.status === 'new' ? 'in_progress' : 'completed')}
                            className="btn btn-sm btn-outline-editorial py-1 px-2"
                            style={{ fontSize: '0.72rem' }}
                          >
                            {inq.status === 'new' ? 'Mark Progress' : 'Complete'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Recent Projects */}
        <div className="col-lg-6">
          <div className="p-4 bg-surface-dark border border-subtle h-100">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h4 className="font-editorial text-white fs-5 mb-0">Portfolio Highlights</h4>
              <button
                onClick={() => onNavigate('projects')}
                className="btn btn-sm btn-link text-accent text-decoration-none p-0"
                style={{ fontSize: '0.8rem' }}
              >
                Manage Projects &rarr;
              </button>
            </div>

            {projects.length === 0 ? (
              <div className="text-muted-custom py-4 text-center small">
                No projects found. Click "Seed Starter Portfolio Data" or create a new project.
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table admin-table mb-0">
                  <thead>
                    <tr>
                      <th>Project</th>
                      <th>Year</th>
                      <th>Status</th>
                      <th className="text-end">Visibility</th>
                    </tr>
                  </thead>
                  <tbody>
                    {projects.slice(0, 5).map((p) => (
                      <tr key={p.id}>
                        <td>
                          <div className="d-flex align-items-center gap-3">
                            <img
                              src={p.thumbnailUrl}
                              alt={p.title}
                              style={{ width: '38px', height: '38px', objectFit: 'cover' }}
                            />
                            <div>
                              <div className="text-white fw-semibold">{p.title}</div>
                              <div className="text-muted-custom small">{p.clientName || 'Self-initiated'}</div>
                            </div>
                          </div>
                        </td>
                        <td className="text-secondary-custom small">{p.projectYear || '—'}</td>
                        <td>
                          <span className={`badge ${p.published ? 'bg-secondary-dark border border-subtle text-accent' : 'bg-surface-dark text-muted-custom'}`}>
                            {p.published ? 'Published' : 'Draft'}
                          </span>
                        </td>
                        <td className="text-end">
                          <button
                            onClick={() => handleTogglePublish(p)}
                            className="btn btn-sm btn-outline-editorial py-1 px-2"
                            style={{ fontSize: '0.72rem' }}
                          >
                            {p.published ? 'Unpublish' : 'Publish'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
