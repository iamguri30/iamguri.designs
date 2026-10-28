import React, { useState } from 'react';
import { Testimonial } from '../../types';
import { createTestimonial, updateTestimonial, deleteTestimonial, uploadFileToStorage } from '../../services/db';

interface AdminTestimonialsProps {
  testimonials: Testimonial[];
  onRefreshData: () => Promise<void>;
}

export const AdminTestimonials: React.FC<AdminTestimonialsProps> = ({
  testimonials,
  onRefreshData,
}) => {
  const [editingT, setEditingT] = useState<Testimonial | null>(null);
  const [clientName, setClientName] = useState('');
  const [designation, setDesignation] = useState('');
  const [company, setCompany] = useState('');
  const [testimonialText, setTestimonialText] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [displayOrder, setDisplayOrder] = useState<number>(1);
  const [published, setPublished] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const startEdit = (t: Testimonial) => {
    setEditingT(t);
    setClientName(t.clientName);
    setDesignation(t.designation || '');
    setCompany(t.company || '');
    setTestimonialText(t.testimonialText);
    setAvatarUrl(t.avatarUrl || '');
    setDisplayOrder(t.displayOrder ?? 1);
    setPublished(t.published ?? true);
  };

  const resetForm = () => {
    setEditingT(null);
    setClientName('');
    setDesignation('');
    setCompany('');
    setTestimonialText('');
    setAvatarUrl('');
    setDisplayOrder(testimonials.length + 1);
    setPublished(true);
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingAvatar(true);
    try {
      const url = await uploadFileToStorage(file, 'testimonials');
      setAvatarUrl(url);
    } catch (err) {
      console.error('Failed to upload avatar:', err);
      alert('Failed to upload avatar image.');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName.trim() || !testimonialText.trim()) {
      alert('Client Name and Testimonial Text are required.');
      return;
    }

    setSaving(true);
    try {
      if (editingT) {
        await updateTestimonial(editingT.id, {
          clientName: clientName.trim(),
          designation: designation.trim(),
          company: company.trim(),
          testimonialText: testimonialText.trim(),
          avatarUrl: avatarUrl.trim() || null,
          displayOrder: Number(displayOrder) || 1,
          published
        });
      } else {
        await createTestimonial({
          clientName: clientName.trim(),
          designation: designation.trim(),
          company: company.trim(),
          testimonialText: testimonialText.trim(),
          avatarUrl: avatarUrl.trim() || null,
          displayOrder: Number(displayOrder) || testimonials.length + 1,
          published
        });
      }
      await onRefreshData();
      resetForm();
    } catch (err) {
      console.error('Failed to save testimonial:', err);
      alert('Error saving testimonial: ' + String(err));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteTestimonial(id);
      await onRefreshData();
      setDeleteId(null);
    } catch (err) {
      console.error('Failed to delete testimonial:', err);
      alert('Error deleting testimonial: ' + String(err));
    }
  };

  return (
    <div>
      <div className="pb-4 mb-4 border-bottom border-subtle">
        <h2 className="font-editorial text-white fs-3 mb-1">Client Testimonials & Endorsements</h2>
        <p className="text-secondary-custom small mb-0">
          Manage client quotes, recommendations, and founder endorsements.
        </p>
      </div>

      <div className="row g-4">
        {/* Form */}
        <div className="col-lg-5">
          <div className="p-4 bg-surface-dark border border-subtle">
            <h4 className="font-editorial text-white fs-5 mb-3">
              {editingT ? `Edit Endorsement: ${editingT.clientName}` : 'Add Testimonial'}
            </h4>

            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label text-muted-custom text-uppercase small">Client Name *</label>
                <input
                  type="text"
                  className="form-control form-editorial-control"
                  placeholder="e.g. Elena Rostova"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  required
                />
              </div>

              <div className="row g-2 mb-3">
                <div className="col-6">
                  <label className="form-label text-muted-custom text-uppercase small">Role / Designation</label>
                  <input
                    type="text"
                    className="form-control form-editorial-control"
                    placeholder="Founder & Creative Director"
                    value={designation}
                    onChange={(e) => setDesignation(e.target.value)}
                  />
                </div>
                <div className="col-6">
                  <label className="form-label text-muted-custom text-uppercase small">Company</label>
                  <input
                    type="text"
                    className="form-control form-editorial-control"
                    placeholder="Aura Botanica Paris"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                  />
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label text-muted-custom text-uppercase small">Testimonial Quote *</label>
                <textarea
                  rows={4}
                  className="form-control form-editorial-control"
                  placeholder="Share the client's direct feedback..."
                  value={testimonialText}
                  onChange={(e) => setTestimonialText(e.target.value)}
                  required
                />
              </div>

              {/* Avatar */}
              <div className="mb-3">
                <label className="form-label text-muted-custom text-uppercase small">Client Avatar / Photo URL</label>
                <input
                  type="text"
                  className="form-control form-editorial-control mb-2"
                  placeholder="https://..."
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                />
                <label className="btn btn-sm btn-outline-editorial text-uppercase m-0 cursor-pointer">
                  <i className="bi bi-upload text-accent me-1"></i>
                  Upload Avatar
                  <input
                    type="file"
                    accept="image/*"
                    className="d-none"
                    onChange={handleAvatarUpload}
                  />
                </label>
                {uploadingAvatar && <span className="spinner-border spinner-border-sm text-accent ms-2"></span>}
              </div>

              <div className="row g-3 mb-4">
                <div className="col-6">
                  <label className="form-label text-muted-custom text-uppercase small">Display Order</label>
                  <input
                    type="number"
                    className="form-control form-editorial-control"
                    value={displayOrder}
                    onChange={(e) => setDisplayOrder(Number(e.target.value))}
                  />
                </div>
                <div className="col-6 d-flex align-items-center pt-3">
                  <div className="form-check form-switch">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="testiPub"
                      checked={published}
                      onChange={(e) => setPublished(e.target.checked)}
                    />
                    <label className="form-check-label text-white small" htmlFor="testiPub">
                      Published
                    </label>
                  </div>
                </div>
              </div>

              <div className="d-flex justify-content-end gap-2">
                {editingT && (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="btn btn-outline-editorial text-uppercase btn-sm"
                  >
                    Cancel
                  </button>
                )}
                <button
                  type="submit"
                  disabled={saving}
                  className="btn btn-lime text-uppercase fw-semibold btn-sm px-3"
                >
                  {saving ? 'Saving...' : editingT ? 'Update Testimonial' : 'Save Testimonial'}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* List */}
        <div className="col-lg-7">
          <div className="table-responsive bg-surface-dark border border-subtle">
            <table className="table admin-table mb-0">
              <thead>
                <tr>
                  <th style={{ width: '50px' }}>Order</th>
                  <th>Client</th>
                  <th>Quote</th>
                  <th>Status</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {testimonials.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-4 text-muted-custom small">
                      No testimonials recorded yet.
                    </td>
                  </tr>
                ) : (
                  testimonials.map((t) => (
                    <tr key={t.id}>
                      <td className="text-muted-custom font-editorial">{t.displayOrder ?? 0}</td>
                      <td>
                        <div className="d-flex align-items-center gap-2">
                          {t.avatarUrl && (
                            <img
                              src={t.avatarUrl}
                              alt={t.clientName}
                              className="rounded-circle"
                              style={{ width: '32px', height: '32px', objectFit: 'cover' }}
                            />
                          )}
                          <div>
                            <div className="fw-semibold text-white">{t.clientName}</div>
                            <div className="text-muted-custom small">{t.company || t.designation || ''}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="text-secondary-custom small text-truncate" style={{ maxWidth: '240px' }}>
                          "{t.testimonialText}"
                        </div>
                      </td>
                      <td>
                        <span className={`badge ${t.published ? 'bg-secondary-dark border border-subtle text-accent' : 'bg-surface-dark text-muted-custom'}`}>
                          {t.published ? 'Active' : 'Hidden'}
                        </span>
                      </td>
                      <td className="text-end">
                        <div className="d-inline-flex gap-2">
                          <button
                            onClick={() => startEdit(t)}
                            className="btn btn-sm btn-outline-editorial py-1 px-2"
                            title="Edit"
                          >
                            <i className="bi bi-pencil"></i>
                          </button>
                          <button
                            onClick={() => setDeleteId(t.id)}
                            className="btn btn-sm btn-outline-danger py-1 px-2 rounded-0 border-subtle"
                            title="Delete"
                          >
                            <i className="bi bi-trash"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {deleteId && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center p-3"
          style={{ backgroundColor: 'rgba(0,0,0,0.85)', zIndex: 1080 }}
        >
          <div className="bg-secondary-dark border border-subtle p-4 max-w-md w-100 text-light shadow-2xl">
            <h4 className="font-editorial text-white mb-2">Delete Testimonial</h4>
            <p className="text-secondary-custom small mb-4">
              Are you sure you want to permanently delete this client endorsement?
            </p>
            <div className="d-flex justify-content-end gap-2">
              <button
                onClick={() => setDeleteId(null)}
                className="btn btn-sm btn-outline-editorial text-uppercase"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteId)}
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
