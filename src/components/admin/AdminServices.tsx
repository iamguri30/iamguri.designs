import React, { useState } from 'react';
import { Service } from '../../types';
import { createService, updateService, deleteService } from '../../services/db';

interface AdminServicesProps {
  services: Service[];
  onRefreshData: () => Promise<void>;
}

export const AdminServices: React.FC<AdminServicesProps> = ({
  services,
  onRefreshData,
}) => {
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startingPrice, setStartingPrice] = useState<string>('');
  const [displayOrder, setDisplayOrder] = useState<number>(1);
  const [published, setPublished] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const startEdit = (s: Service) => {
    setEditingService(s);
    setTitle(s.title);
    setDescription(s.description);
    setStartingPrice(s.startingPrice ? String(s.startingPrice) : '');
    setDisplayOrder(s.displayOrder ?? 1);
    setPublished(s.published ?? true);
  };

  const resetForm = () => {
    setEditingService(null);
    setTitle('');
    setDescription('');
    setStartingPrice('');
    setDisplayOrder(services.length + 1);
    setPublished(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      alert('Title and Description are required.');
      return;
    }

    setSaving(true);
    try {
      const priceNum = startingPrice ? Number(startingPrice) : null;
      if (editingService) {
        await updateService(editingService.id, {
          title: title.trim(),
          description: description.trim(),
          startingPrice: priceNum,
          displayOrder: Number(displayOrder) || 1,
          published
        });
      } else {
        await createService({
          title: title.trim(),
          description: description.trim(),
          startingPrice: priceNum,
          displayOrder: Number(displayOrder) || services.length + 1,
          published
        });
      }
      await onRefreshData();
      resetForm();
    } catch (err) {
      console.error('Failed to save service:', err);
      alert('Error saving service: ' + String(err));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteService(id);
      await onRefreshData();
      setDeleteId(null);
    } catch (err) {
      console.error('Failed to delete service:', err);
      alert('Error deleting service: ' + String(err));
    }
  };

  return (
    <div>
      <div className="pb-4 mb-4 border-bottom border-subtle">
        <h2 className="font-editorial text-white fs-3 mb-1">Design Services & Offerings</h2>
        <p className="text-secondary-custom small mb-0">
          Configure disciplines, deliverables, and starting investment tiers displayed on the public site.
        </p>
      </div>

      <div className="row g-4">
        {/* Form Column */}
        <div className="col-lg-5">
          <div className="p-4 bg-surface-dark border border-subtle">
            <h4 className="font-editorial text-white fs-5 mb-3">
              {editingService ? `Edit Service: ${editingService.title}` : 'Add New Service Offering'}
            </h4>

            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label text-muted-custom text-uppercase small">Service Title *</label>
                <input
                  type="text"
                  className="form-control form-editorial-control"
                  placeholder="e.g. Brand Identity & Visual Systems"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              <div className="mb-3">
                <label className="form-label text-muted-custom text-uppercase small">Description *</label>
                <textarea
                  rows={4}
                  className="form-control form-editorial-control"
                  placeholder="Explain scope, deliverables, and methodology..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                />
              </div>

              <div className="row g-3 mb-3">
                <div className="col-6">
                  <label className="form-label text-muted-custom text-uppercase small">Starting Price ($ USD)</label>
                  <input
                    type="number"
                    className="form-control form-editorial-control"
                    placeholder="e.g. 4500"
                    value={startingPrice}
                    onChange={(e) => setStartingPrice(e.target.value)}
                  />
                </div>

                <div className="col-6">
                  <label className="form-label text-muted-custom text-uppercase small">Display Order</label>
                  <input
                    type="number"
                    className="form-control form-editorial-control"
                    value={displayOrder}
                    onChange={(e) => setDisplayOrder(Number(e.target.value))}
                  />
                </div>
              </div>

              <div className="form-check form-switch mb-4">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="servicePublished"
                  checked={published}
                  onChange={(e) => setPublished(e.target.checked)}
                />
                <label className="form-check-label text-white small" htmlFor="servicePublished">
                  Published on public website
                </label>
              </div>

              <div className="d-flex justify-content-end gap-2">
                {editingService && (
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
                  {saving ? 'Saving...' : editingService ? 'Update Service' : 'Add Service'}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* List Column */}
        <div className="col-lg-7">
          <div className="table-responsive bg-surface-dark border border-subtle">
            <table className="table admin-table mb-0">
              <thead>
                <tr>
                  <th style={{ width: '50px' }}>Order</th>
                  <th>Service</th>
                  <th>Starting Price</th>
                  <th>Status</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {services.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-4 text-muted-custom small">
                      No services configured yet.
                    </td>
                  </tr>
                ) : (
                  services.map((s) => (
                    <tr key={s.id}>
                      <td className="text-muted-custom font-editorial">{s.displayOrder ?? 0}</td>
                      <td>
                        <div className="fw-semibold text-white">{s.title}</div>
                        <div className="text-muted-custom small text-truncate" style={{ maxWidth: '280px' }}>
                          {s.description}
                        </div>
                      </td>
                      <td className="text-white font-editorial">
                        {s.startingPrice ? `$${s.startingPrice.toLocaleString()}` : 'Bespoke'}
                      </td>
                      <td>
                        <span className={`badge ${s.published ? 'bg-secondary-dark border border-subtle text-accent' : 'bg-surface-dark text-muted-custom'}`}>
                          {s.published ? 'Active' : 'Hidden'}
                        </span>
                      </td>
                      <td className="text-end">
                        <div className="d-inline-flex gap-2">
                          <button
                            onClick={() => startEdit(s)}
                            className="btn btn-sm btn-outline-editorial py-1 px-2"
                            title="Edit"
                          >
                            <i className="bi bi-pencil"></i>
                          </button>
                          <button
                            onClick={() => setDeleteId(s.id)}
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

      {/* Delete confirmation */}
      {deleteId && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center p-3"
          style={{ backgroundColor: 'rgba(0,0,0,0.85)', zIndex: 1080 }}
        >
          <div className="bg-secondary-dark border border-subtle p-4 max-w-md w-100 text-light shadow-2xl">
            <h4 className="font-editorial text-white mb-2">Delete Service</h4>
            <p className="text-secondary-custom small mb-4">
              Are you sure you want to permanently delete this service offering?
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
