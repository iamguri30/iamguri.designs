import React, { useState } from 'react';
import { Category, Project } from '../../types';
import { createCategory, updateCategory, deleteCategory } from '../../services/db';

interface AdminCategoriesProps {
  categories: Category[];
  projects: Project[];
  onRefreshData: () => Promise<void>;
}

export const AdminCategories: React.FC<AdminCategoriesProps> = ({
  categories,
  projects,
  onRefreshData,
}) => {
  const [editingCat, setEditingCat] = useState<Category | null>(null);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [displayOrder, setDisplayOrder] = useState<number>(1);
  const [saving, setSaving] = useState(false);
  const [deleteConfirmCat, setDeleteConfirmCat] = useState<Category | null>(null);

  const generateSlug = (text: string) => {
    return text.toLowerCase().trim().replace(/[^a-z0-9 -]/g, '').replace(/\s+/g, '-');
  };

  const handleNameChange = (val: string) => {
    setName(val);
    if (!editingCat) {
      setSlug(generateSlug(val));
    }
  };

  const startEdit = (c: Category) => {
    setEditingCat(c);
    setName(c.name);
    setSlug(c.slug);
    setDescription(c.description || '');
    setDisplayOrder(c.displayOrder ?? 1);
  };

  const resetForm = () => {
    setEditingCat(null);
    setName('');
    setSlug('');
    setDescription('');
    setDisplayOrder(categories.length + 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setSaving(true);
    try {
      const finalSlug = slug.trim() || generateSlug(name);
      if (editingCat) {
        await updateCategory(editingCat.id, {
          name: name.trim(),
          slug: finalSlug,
          description: description.trim(),
          displayOrder: Number(displayOrder) || 1
        });
      } else {
        await createCategory({
          name: name.trim(),
          slug: finalSlug,
          description: description.trim(),
          displayOrder: Number(displayOrder) || categories.length + 1
        });
      }
      await onRefreshData();
      resetForm();
    } catch (err) {
      console.error('Failed to save category:', err);
      alert('Error saving category: ' + String(err));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (cat: Category) => {
    try {
      await deleteCategory(cat.id);
      await onRefreshData();
      setDeleteConfirmCat(null);
    } catch (err) {
      console.error('Failed to delete category:', err);
      alert('Error deleting category: ' + String(err));
    }
  };

  return (
    <div>
      <div className="pb-4 mb-4 border-bottom border-subtle">
        <h2 className="font-editorial text-white fs-3 mb-1">Portfolio Categories</h2>
        <p className="text-secondary-custom small mb-0">
          Organize creative disciplines (Branding, Packaging, Editorial, Typography, etc.).
        </p>
      </div>

      <div className="row g-4">
        {/* Form Column */}
        <div className="col-lg-5">
          <div className="p-4 bg-surface-dark border border-subtle">
            <h4 className="font-editorial text-white fs-5 mb-3">
              {editingCat ? `Edit Category: ${editingCat.name}` : 'Add New Category'}
            </h4>

            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label text-muted-custom text-uppercase small">Category Name *</label>
                <input
                  type="text"
                  className="form-control form-editorial-control"
                  placeholder="e.g. Luxury Packaging"
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  required
                />
              </div>

              <div className="mb-3">
                <label className="form-label text-muted-custom text-uppercase small">Slug *</label>
                <input
                  type="text"
                  className="form-control form-editorial-control"
                  placeholder="e.g. luxury-packaging"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  required
                />
              </div>

              <div className="mb-3">
                <label className="form-label text-muted-custom text-uppercase small">Description</label>
                <textarea
                  rows={3}
                  className="form-control form-editorial-control"
                  placeholder="Brief note on this discipline..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <div className="mb-4">
                <label className="form-label text-muted-custom text-uppercase small">Display Order</label>
                <input
                  type="number"
                  className="form-control form-editorial-control"
                  value={displayOrder}
                  onChange={(e) => setDisplayOrder(Number(e.target.value))}
                />
              </div>

              <div className="d-flex justify-content-end gap-2">
                {editingCat && (
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
                  {saving ? 'Saving...' : editingCat ? 'Update Category' : 'Create Category'}
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
                  <th style={{ width: '60px' }}>Order</th>
                  <th>Name</th>
                  <th>Slug</th>
                  <th>Projects</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {categories.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-4 text-muted-custom small">
                      No categories created yet.
                    </td>
                  </tr>
                ) : (
                  categories.map((c) => {
                    const projectCount = projects.filter(p => p.categoryId === c.id).length;
                    return (
                      <tr key={c.id}>
                        <td className="text-muted-custom font-editorial">{c.displayOrder ?? 0}</td>
                        <td className="fw-semibold text-white">{c.name}</td>
                        <td className="text-muted-custom small">{c.slug}</td>
                        <td>
                          <span className="badge bg-secondary-dark border border-subtle text-accent">
                            {projectCount} projects
                          </span>
                        </td>
                        <td className="text-end">
                          <div className="d-inline-flex gap-2">
                            <button
                              onClick={() => startEdit(c)}
                              className="btn btn-sm btn-outline-editorial py-1 px-2"
                              title="Edit"
                            >
                              <i className="bi bi-pencil"></i>
                            </button>
                            <button
                              onClick={() => setDeleteConfirmCat(c)}
                              className="btn btn-sm btn-outline-danger py-1 px-2 rounded-0 border-subtle"
                              title="Delete"
                            >
                              <i className="bi bi-trash"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Delete Confirmation */}
      {deleteConfirmCat && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center p-3"
          style={{ backgroundColor: 'rgba(0,0,0,0.85)', zIndex: 1080 }}
        >
          <div className="bg-secondary-dark border border-subtle p-4 max-w-md w-100 text-light shadow-2xl">
            <h4 className="font-editorial text-white mb-2">Delete Category: {deleteConfirmCat.name}</h4>
            {projects.filter(p => p.categoryId === deleteConfirmCat.id).length > 0 && (
              <div className="alert alert-warning rounded-0 border-0 py-2 small mb-3">
                <i className="bi bi-exclamation-triangle me-1"></i>
                Notice: {projects.filter(p => p.categoryId === deleteConfirmCat.id).length} project(s) currently reference this category. They will become uncategorized.
              </div>
            )}
            <p className="text-secondary-custom small mb-4">
              Are you sure you want to permanently delete this category?
            </p>
            <div className="d-flex justify-content-end gap-2">
              <button
                onClick={() => setDeleteConfirmCat(null)}
                className="btn btn-sm btn-outline-editorial text-uppercase"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirmCat)}
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
