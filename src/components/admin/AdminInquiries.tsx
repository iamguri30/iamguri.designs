import React, { useState } from 'react';
import { Inquiry } from '../../types';
import { updateInquiry, deleteInquiry } from '../../services/db';

interface AdminInquiriesProps {
  inquiries: Inquiry[];
  onRefreshData: () => Promise<void>;
}

export const AdminInquiries: React.FC<AdminInquiriesProps> = ({
  inquiries,
  onRefreshData,
}) => {
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [savingNotes, setSavingNotes] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const openDetails = (inq: Inquiry) => {
    setSelectedInquiry(inq);
    setAdminNotes(inq.adminNotes || '');
  };

  const closeDetails = () => {
    setSelectedInquiry(null);
    setAdminNotes('');
  };

  const handleStatusChange = async (inquiryId: string, newStatus: Inquiry['status']) => {
    try {
      await updateInquiry(inquiryId, { status: newStatus });
      await onRefreshData();
      if (selectedInquiry && selectedInquiry.id === inquiryId) {
        setSelectedInquiry(prev => prev ? { ...prev, status: newStatus } : null);
      }
    } catch (err) {
      console.error('Failed to update status:', err);
      alert('Error updating status: ' + String(err));
    }
  };

  const handleSaveNotes = async () => {
    if (!selectedInquiry) return;
    setSavingNotes(true);
    try {
      await updateInquiry(selectedInquiry.id, { adminNotes });
      await onRefreshData();
      setSelectedInquiry(prev => prev ? { ...prev, adminNotes } : null);
      alert('Internal notes saved successfully.');
    } catch (err) {
      console.error('Failed to save notes:', err);
      alert('Error saving notes: ' + String(err));
    } finally {
      setSavingNotes(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteInquiry(id);
      await onRefreshData();
      setDeleteConfirmId(null);
      if (selectedInquiry?.id === id) {
        closeDetails();
      }
    } catch (err) {
      console.error('Failed to delete inquiry:', err);
      alert('Error deleting inquiry: ' + String(err));
    }
  };

  const filtered = inquiries.filter(i => {
    const matchesStatus = statusFilter === 'all' || i.status === statusFilter;
    const matchesSearch = i.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      i.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (i.projectType && i.projectType.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesStatus && matchesSearch;
  });

  return (
    <div>
      <div className="pb-4 mb-4 border-bottom border-subtle">
        <h2 className="font-editorial text-white fs-3 mb-1">Client Inquiries & Briefs</h2>
        <p className="text-secondary-custom small mb-0">
          Review, manage status transitions, and store internal consultation notes.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="row g-3 mb-4">
        <div className="col-md-7">
          <div className="input-group">
            <span className="input-group-text bg-surface-dark border-subtle text-muted-custom">
              <i className="bi bi-search"></i>
            </span>
            <input
              type="text"
              className="form-control form-editorial-control"
              placeholder="Search by client name, email, or project type..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="col-md-5">
          <select
            className="form-select form-editorial-control"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Inquiries ({inquiries.length})</option>
            <option value="new">New ({inquiries.filter(i => i.status === 'new').length})</option>
            <option value="in_progress">In Progress ({inquiries.filter(i => i.status === 'in_progress').length})</option>
            <option value="completed">Completed ({inquiries.filter(i => i.status === 'completed').length})</option>
            <option value="archived">Archived ({inquiries.filter(i => i.status === 'archived').length})</option>
          </select>
        </div>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="p-5 text-center bg-surface-dark border border-subtle text-muted-custom">
          <i className="bi bi-inbox fs-1 d-block mb-3 text-secondary-custom"></i>
          <h5 className="text-white font-editorial">No Inquiries Found</h5>
          <p className="small mb-0">No inquiries match the current filter criteria.</p>
        </div>
      ) : (
        <div className="table-responsive bg-surface-dark border border-subtle">
          <table className="table admin-table mb-0">
            <thead>
              <tr>
                <th>Client</th>
                <th>Project Focus</th>
                <th>Budget</th>
                <th>Status</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((inq) => (
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
                  <td className="text-white font-editorial">{inq.estimatedBudget || '—'}</td>
                  <td>
                    <select
                      className="form-select form-select-sm form-editorial-control py-1 px-2"
                      style={{ width: '130px', fontSize: '0.75rem' }}
                      value={inq.status}
                      onChange={(e) => handleStatusChange(inq.id, e.target.value as Inquiry['status'])}
                    >
                      <option value="new">New</option>
                      <option value="in_progress">In Progress</option>
                      <option value="completed">Completed</option>
                      <option value="archived">Archived</option>
                    </select>
                  </td>
                  <td className="text-end">
                    <div className="d-inline-flex gap-2">
                      <button
                        onClick={() => openDetails(inq)}
                        className="btn btn-sm btn-outline-editorial py-1 px-3"
                        style={{ fontSize: '0.78rem' }}
                      >
                        Inspect Brief
                      </button>
                      <button
                        onClick={() => setDeleteConfirmId(inq.id)}
                        className="btn btn-sm btn-outline-danger py-1 px-2 rounded-0 border-subtle"
                        title="Delete inquiry"
                      >
                        <i className="bi bi-trash"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Details & Notes Modal */}
      {selectedInquiry && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center p-3"
          style={{ backgroundColor: 'rgba(0,0,0,0.85)', zIndex: 1070 }}
          onClick={(e) => { if (e.target === e.currentTarget) closeDetails(); }}
        >
          <div
            className="bg-secondary-dark border border-subtle p-4 p-md-5 max-w-2xl w-100 text-light shadow-2xl"
            style={{ maxWidth: '680px', maxHeight: '90vh', overflowY: 'auto' }}
          >
            <div className="d-flex justify-content-between align-items-start pb-3 mb-4 border-bottom border-subtle">
              <div>
                <span className="text-accent text-uppercase small" style={{ letterSpacing: '0.1em' }}>Client Submission</span>
                <h3 className="font-editorial text-white fs-4 mb-0">{selectedInquiry.name}</h3>
                <a href={`mailto:${selectedInquiry.email}`} className="text-secondary-custom small text-decoration-none">
                  {selectedInquiry.email}
                </a>
              </div>
              <button onClick={closeDetails} className="btn btn-outline-editorial btn-sm p-1 px-2">
                <i className="bi bi-x-lg"></i>
              </button>
            </div>

            <div className="row g-3 mb-4">
              <div className="col-6">
                <div className="p-3 bg-surface-dark border border-subtle">
                  <div className="text-muted-custom text-uppercase small" style={{ fontSize: '0.7rem' }}>Project Focus</div>
                  <div className="text-white fw-semibold mt-1">{selectedInquiry.projectType || 'General'}</div>
                </div>
              </div>
              <div className="col-6">
                <div className="p-3 bg-surface-dark border border-subtle">
                  <div className="text-muted-custom text-uppercase small" style={{ fontSize: '0.7rem' }}>Budget Range</div>
                  <div className="text-accent font-editorial fs-5 mt-1">{selectedInquiry.estimatedBudget || 'Flexible'}</div>
                </div>
              </div>
            </div>

            <div className="mb-4">
              <div className="text-muted-custom text-uppercase small mb-2" style={{ fontSize: '0.75rem', letterSpacing: '0.05em' }}>
                Client Project Message & Brief
              </div>
              <div className="p-3 bg-surface-dark border border-subtle text-secondary-custom leading-relaxed" style={{ whiteSpace: 'pre-line' }}>
                {selectedInquiry.message}
              </div>
            </div>

            {/* Internal Admin Notes */}
            <div className="mb-4 pt-3 border-top border-subtle">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <label className="form-label text-muted-custom text-uppercase small mb-0" style={{ fontSize: '0.75rem' }}>
                  Private Internal Admin Notes
                </label>
                <button
                  type="button"
                  onClick={handleSaveNotes}
                  disabled={savingNotes}
                  className="btn btn-sm btn-lime text-uppercase"
                  style={{ fontSize: '0.72rem' }}
                >
                  {savingNotes ? 'Saving...' : 'Save Notes'}
                </button>
              </div>
              <textarea
                rows={3}
                className="form-control form-editorial-control"
                placeholder="Record discovery call notes, proposal status, or timeline constraints..."
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
              />
            </div>

            <div className="d-flex justify-content-between align-items-center pt-3 border-top border-subtle">
              <div className="d-flex align-items-center gap-2">
                <span className="text-muted-custom small">Status:</span>
                <select
                  className="form-select form-select-sm form-editorial-control py-1"
                  value={selectedInquiry.status}
                  onChange={(e) => handleStatusChange(selectedInquiry.id, e.target.value as Inquiry['status'])}
                >
                  <option value="new">New</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="archived">Archived</option>
                </select>
              </div>

              <div className="d-flex gap-2">
                <a
                  href={`mailto:${selectedInquiry.email}?subject=RE: ${selectedInquiry.projectType || 'Project Inquiry'}`}
                  className="btn btn-sm btn-outline-editorial text-uppercase"
                >
                  <i className="bi bi-reply me-1"></i>
                  Reply via Email
                </a>
                <button
                  onClick={closeDetails}
                  className="btn btn-sm btn-lime text-uppercase"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteConfirmId && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center p-3"
          style={{ backgroundColor: 'rgba(0,0,0,0.85)', zIndex: 1080 }}
        >
          <div className="bg-secondary-dark border border-subtle p-4 max-w-md w-100 text-light shadow-2xl">
            <h4 className="font-editorial text-white mb-2">Delete Inquiry</h4>
            <p className="text-secondary-custom small mb-4">
              Are you sure you want to permanently delete this client inquiry?
            </p>
            <div className="d-flex justify-content-end gap-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="btn btn-sm btn-outline-editorial text-uppercase"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirmId)}
                className="btn btn-sm btn-danger text-uppercase rounded-0"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
