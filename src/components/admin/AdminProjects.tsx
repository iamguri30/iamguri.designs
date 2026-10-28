import React, { useState } from 'react';
import { Project, Category, GalleryImage } from '../../types';
import { createProject, updateProject, deleteProject, uploadFileToStorage } from '../../services/db';

interface AdminProjectsProps {
  projects: Project[];
  categories: Category[];
  onRefreshData: () => Promise<void>;
}

export const AdminProjects: React.FC<AdminProjectsProps> = ({
  projects,
  categories,
  onRefreshData,
}) => {
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [previewingProject, setPreviewingProject] = useState<Project | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState<Partial<Project>>({
    title: '',
    slug: '',
    shortDescription: '',
    description: '',
    categoryId: '',
    tags: [],
    clientName: '',
    projectYear: new Date().getFullYear(),
    services: [],
    thumbnailUrl: '',
    coverImageUrl: '',
    galleryImages: [],
    projectUrl: '',
    featured: false,
    published: true,
    displayOrder: 1,
    seoTitle: '',
    seoDescription: '',
  });

  const [rawTags, setRawTags] = useState('');
  const [rawServices, setRawServices] = useState('');
  const [newGalleryUrl, setNewGalleryUrl] = useState('');
  const [newGalleryAlt, setNewGalleryAlt] = useState('');

  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
  };

  const startCreate = () => {
    setEditingProject(null);
    setFormData({
      title: '',
      slug: '',
      shortDescription: '',
      description: '',
      categoryId: categories[0]?.id || '',
      tags: [],
      clientName: '',
      projectYear: new Date().getFullYear(),
      services: [],
      thumbnailUrl: '',
      coverImageUrl: '',
      galleryImages: [],
      projectUrl: '',
      featured: false,
      published: true,
      displayOrder: projects.length + 1,
      seoTitle: '',
      seoDescription: '',
    });
    setRawTags('');
    setRawServices('');
    setIsCreating(true);
  };

  const startEdit = (p: Project) => {
    setIsCreating(false);
    setEditingProject(p);
    setFormData({ ...p });
    setRawTags(p.tags ? p.tags.join(', ') : '');
    setRawServices(p.services ? p.services.join(', ') : '');
  };

  const cancelEditor = () => {
    setIsCreating(false);
    setEditingProject(null);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, targetField: 'thumbnail' | 'cover' | 'gallery') => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(targetField);
    try {
      const downloadUrl = await uploadFileToStorage(file, 'projects');
      if (targetField === 'thumbnail') {
        setFormData(prev => ({ ...prev, thumbnailUrl: downloadUrl }));
      } else if (targetField === 'cover') {
        setFormData(prev => ({ ...prev, coverImageUrl: downloadUrl }));
      } else if (targetField === 'gallery') {
        setFormData(prev => ({
          ...prev,
          galleryImages: [...(prev.galleryImages || []), { url: downloadUrl, altText: file.name }]
        }));
      }
    } catch (err) {
      console.error('Upload failed:', err);
      alert('Failed to upload image file.');
    } finally {
      setUploadingImage(null);
    }
  };

  const handleAddGalleryImage = () => {
    if (!newGalleryUrl.trim()) return;
    const newItem: GalleryImage = {
      url: newGalleryUrl.trim(),
      altText: newGalleryAlt.trim() || undefined
    };
    setFormData(prev => ({
      ...prev,
      galleryImages: [...(prev.galleryImages || []), newItem]
    }));
    setNewGalleryUrl('');
    setNewGalleryAlt('');
  };

  const handleRemoveGalleryImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      galleryImages: prev.galleryImages?.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title?.trim()) {
      alert('Project Title is required.');
      return;
    }
    if (!formData.thumbnailUrl?.trim()) {
      alert('Thumbnail Image URL or upload is required.');
      return;
    }

    setSaving(true);
    try {
      const finalSlug = formData.slug?.trim() || generateSlug(formData.title);
      const parsedTags = rawTags
        .split(',')
        .map(t => t.trim())
        .filter(t => t.length > 0);
      const parsedServices = rawServices
        .split(',')
        .map(s => s.trim())
        .filter(s => s.length > 0);

      const payload: Omit<Project, 'id'> = {
        title: formData.title.trim(),
        slug: finalSlug,
        shortDescription: formData.shortDescription?.trim() || '',
        description: formData.description?.trim() || '',
        categoryId: formData.categoryId || '',
        tags: parsedTags,
        clientName: formData.clientName?.trim() || '',
        projectYear: Number(formData.projectYear) || new Date().getFullYear(),
        services: parsedServices,
        thumbnailUrl: formData.thumbnailUrl.trim(),
        coverImageUrl: formData.coverImageUrl?.trim() || formData.thumbnailUrl.trim(),
        galleryImages: formData.galleryImages || [],
        projectUrl: formData.projectUrl?.trim() || null,
        featured: Boolean(formData.featured),
        published: Boolean(formData.published),
        displayOrder: Number(formData.displayOrder) || 1,
        seoTitle: formData.seoTitle?.trim() || formData.title.trim(),
        seoDescription: formData.seoDescription?.trim() || formData.shortDescription?.trim() || '',
      };

      if (isCreating) {
        await createProject(payload);
      } else if (editingProject) {
        await updateProject(editingProject.id, payload);
      }

      await onRefreshData();
      cancelEditor();
    } catch (err) {
      console.error('Failed to save project:', err);
      alert('Error saving project: ' + String(err));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteProject(id);
      await onRefreshData();
      setDeleteConfirmId(null);
    } catch (err) {
      console.error('Failed to delete project:', err);
      alert('Error deleting project: ' + String(err));
    }
  };

  // Filtering
  const filtered = projects.filter(p => {
    const matchesQuery = p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.clientName && p.clientName.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCat = filterCategory === 'all' || p.categoryId === filterCategory;
    return matchesQuery && matchesCat;
  });

  return (
    <div>
      {/* Editor View (Add or Edit) */}
      {(isCreating || editingProject) ? (
        <div className="p-4 p-md-5 bg-surface-dark border border-subtle">
          <div className="d-flex justify-content-between align-items-center pb-4 mb-4 border-bottom border-subtle">
            <div>
              <span className="text-accent text-uppercase small" style={{ letterSpacing: '0.1em' }}>Project Editor</span>
              <h3 className="font-editorial text-white fs-3 mb-0">
                {isCreating ? 'Create New Showcase Project' : `Edit: ${editingProject?.title}`}
              </h3>
            </div>
            <button
              onClick={cancelEditor}
              className="btn btn-outline-editorial text-uppercase"
              style={{ fontSize: '0.78rem' }}
            >
              Cancel
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="row g-4">
              {/* Title */}
              <div className="col-md-8">
                <label className="form-label text-muted-custom text-uppercase small">Project Title *</label>
                <input
                  type="text"
                  className="form-control form-editorial-control"
                  placeholder="e.g. Aura Botanica Fine Fragrance"
                  value={formData.title || ''}
                  onChange={(e) => {
                    const title = e.target.value;
                    setFormData(prev => ({
                      ...prev,
                      title,
                      slug: isCreating ? generateSlug(title) : prev.slug
                    }));
                  }}
                  required
                />
              </div>

              {/* Slug */}
              <div className="col-md-4">
                <label className="form-label text-muted-custom text-uppercase small">URL Slug *</label>
                <input
                  type="text"
                  className="form-control form-editorial-control"
                  placeholder="aura-botanica"
                  value={formData.slug || ''}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  required
                />
              </div>

              {/* Category */}
              <div className="col-md-4">
                <label className="form-label text-muted-custom text-uppercase small">Category</label>
                <select
                  className="form-select form-editorial-control"
                  value={formData.categoryId || ''}
                  onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                >
                  <option value="">Uncategorized</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              {/* Client */}
              <div className="col-md-4">
                <label className="form-label text-muted-custom text-uppercase small">Client Name</label>
                <input
                  type="text"
                  className="form-control form-editorial-control"
                  placeholder="e.g. Aura Botanica Paris"
                  value={formData.clientName || ''}
                  onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                />
              </div>

              {/* Year */}
              <div className="col-md-4">
                <label className="form-label text-muted-custom text-uppercase small">Project Year</label>
                <input
                  type="number"
                  className="form-control form-editorial-control"
                  value={formData.projectYear || ''}
                  onChange={(e) => setFormData({ ...formData, projectYear: Number(e.target.value) })}
                />
              </div>

              {/* Short Description */}
              <div className="col-12">
                <label className="form-label text-muted-custom text-uppercase small">Short Description (Summary)</label>
                <input
                  type="text"
                  className="form-control form-editorial-control"
                  placeholder="Bespoke brand identity and packaging for luxury niche perfumery..."
                  value={formData.shortDescription || ''}
                  onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
                />
              </div>

              {/* Full Description / Brief */}
              <div className="col-12">
                <label className="form-label text-muted-custom text-uppercase small">Full Creative Brief & Case Study</label>
                <textarea
                  rows={5}
                  className="form-control form-editorial-control"
                  placeholder="Describe the design challenge, typographic choices, materials, and production outcome..."
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              {/* Tags */}
              <div className="col-md-6">
                <label className="form-label text-muted-custom text-uppercase small">Tags (comma separated)</label>
                <input
                  type="text"
                  className="form-control form-editorial-control"
                  placeholder="Branding, Luxury, Packaging, Foil"
                  value={rawTags}
                  onChange={(e) => setRawTags(e.target.value)}
                />
              </div>

              {/* Services Provided */}
              <div className="col-md-6">
                <label className="form-label text-muted-custom text-uppercase small">Services Delivered (comma separated)</label>
                <input
                  type="text"
                  className="form-control form-editorial-control"
                  placeholder="Brand Strategy, Packaging, Typography"
                  value={rawServices}
                  onChange={(e) => setRawServices(e.target.value)}
                />
              </div>

              {/* Thumbnail URL & Upload */}
              <div className="col-md-6">
                <label className="form-label text-muted-custom text-uppercase small">Thumbnail Image URL *</label>
                <input
                  type="text"
                  className="form-control form-editorial-control mb-2"
                  placeholder="https://..."
                  value={formData.thumbnailUrl || ''}
                  onChange={(e) => setFormData({ ...formData, thumbnailUrl: e.target.value })}
                  required
                />
                <div className="d-flex align-items-center gap-2">
                  <label className="btn btn-sm btn-outline-editorial text-uppercase m-0 cursor-pointer">
                    <i className="bi bi-cloud-arrow-up text-accent me-1"></i>
                    Upload via Cloudinary
                    <input
                      type="file"
                      accept="image/*"
                      className="d-none"
                      onChange={(e) => handleFileUpload(e, 'thumbnail')}
                    />
                  </label>
                  {uploadingImage === 'thumbnail' && (
                    <span className="small text-accent d-flex align-items-center gap-1">
                      <span className="spinner-border spinner-border-sm" role="status"></span>
                      <span>Uploading to Cloudinary...</span>
                    </span>
                  )}
                </div>
                {formData.thumbnailUrl && (
                  <div className="mt-2 border border-subtle overflow-hidden" style={{ width: '120px', height: '80px' }}>
                    <img src={formData.thumbnailUrl} alt="Thumbnail preview" className="w-100 h-100" style={{ objectFit: 'cover' }} />
                  </div>
                )}
              </div>

              {/* Cover Image URL & Upload */}
              <div className="col-md-6">
                <label className="form-label text-muted-custom text-uppercase small">Cover Hero Image URL</label>
                <input
                  type="text"
                  className="form-control form-editorial-control mb-2"
                  placeholder="https://... (defaults to thumbnail if empty)"
                  value={formData.coverImageUrl || ''}
                  onChange={(e) => setFormData({ ...formData, coverImageUrl: e.target.value })}
                />
                <div className="d-flex align-items-center gap-2">
                  <label className="btn btn-sm btn-outline-editorial text-uppercase m-0 cursor-pointer">
                    <i className="bi bi-cloud-arrow-up text-accent me-1"></i>
                    Upload Cover via Cloudinary
                    <input
                      type="file"
                      accept="image/*"
                      className="d-none"
                      onChange={(e) => handleFileUpload(e, 'cover')}
                    />
                  </label>
                  {uploadingImage === 'cover' && (
                    <span className="small text-accent d-flex align-items-center gap-1">
                      <span className="spinner-border spinner-border-sm" role="status"></span>
                      <span>Uploading to Cloudinary...</span>
                    </span>
                  )}
                </div>
                {formData.coverImageUrl && (
                  <div className="mt-2 border border-subtle overflow-hidden" style={{ width: '120px', height: '80px' }}>
                    <img src={formData.coverImageUrl} alt="Cover preview" className="w-100 h-100" style={{ objectFit: 'cover' }} />
                  </div>
                )}
              </div>

              {/* Gallery Images Builder */}
              <div className="col-12 pt-3 border-top border-subtle">
                <div className="d-flex justify-content-between align-items-center mb-1">
                  <label className="form-label text-muted-custom text-uppercase small mb-0">Gallery Images & Process Artifacts</label>
                  <span className="text-muted-custom small" style={{ fontSize: '0.72rem' }}>
                    <i className="bi bi-cloud-check text-accent me-1"></i> Cloudinary storage &amp; database persistence
                  </span>
                </div>
                <div className="row g-2 mb-3">
                  <div className="col-md-6">
                    <input
                      type="text"
                      className="form-control form-editorial-control"
                      placeholder="Image URL https://..."
                      value={newGalleryUrl}
                      onChange={(e) => setNewGalleryUrl(e.target.value)}
                    />
                  </div>
                  <div className="col-md-4">
                    <input
                      type="text"
                      className="form-control form-editorial-control"
                      placeholder="Alt text / Caption"
                      value={newGalleryAlt}
                      onChange={(e) => setNewGalleryAlt(e.target.value)}
                    />
                  </div>
                  <div className="col-md-2 d-flex gap-2">
                    <button
                      type="button"
                      onClick={handleAddGalleryImage}
                      className="btn btn-outline-editorial text-uppercase w-100"
                    >
                      Add URL
                    </button>
                    <label className="btn btn-outline-editorial text-uppercase m-0" title="Upload image file to Cloudinary">
                      <i className="bi bi-cloud-arrow-up text-accent"></i>
                      <input
                        type="file"
                        accept="image/*"
                        className="d-none"
                        onChange={(e) => handleFileUpload(e, 'gallery')}
                      />
                    </label>
                  </div>
                </div>

                {formData.galleryImages && formData.galleryImages.length > 0 && (
                  <div className="d-flex flex-wrap gap-3 p-3 bg-secondary-dark border border-subtle">
                    {formData.galleryImages.map((img, idx) => (
                      <div key={idx} className="position-relative border border-subtle bg-surface-dark" style={{ width: '120px' }}>
                        <img src={img.url} alt={img.altText || 'Gallery'} style={{ width: '120px', height: '80px', objectFit: 'cover' }} />
                        <button
                          type="button"
                          onClick={() => handleRemoveGalleryImage(idx)}
                          className="position-absolute top-0 end-0 bg-danger text-white border-0 p-1"
                          style={{ width: '22px', height: '22px', lineHeight: 1 }}
                        >
                          &times;
                        </button>
                        {img.altText && (
                          <div className="small text-truncate p-1 text-muted-custom" style={{ fontSize: '0.65rem' }}>
                            {img.altText}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* External URL */}
              <div className="col-md-4">
                <label className="form-label text-muted-custom text-uppercase small">Live Project Website URL</label>
                <input
                  type="text"
                  className="form-control form-editorial-control"
                  placeholder="https://brand-website.com"
                  value={formData.projectUrl || ''}
                  onChange={(e) => setFormData({ ...formData, projectUrl: e.target.value })}
                />
              </div>

              {/* Display Order */}
              <div className="col-md-4">
                <label className="form-label text-muted-custom text-uppercase small">Display Order</label>
                <input
                  type="number"
                  className="form-control form-editorial-control"
                  value={formData.displayOrder ?? 1}
                  onChange={(e) => setFormData({ ...formData, displayOrder: Number(e.target.value) })}
                />
              </div>

              {/* Toggles */}
              <div className="col-md-4 d-flex align-items-center gap-4 pt-4">
                <div className="form-check form-switch">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="publishedCheck"
                    checked={formData.published ?? true}
                    onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
                  />
                  <label className="form-check-label text-white small" htmlFor="publishedCheck">
                    Published
                  </label>
                </div>

                <div className="form-check form-switch">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="featuredCheck"
                    checked={formData.featured ?? false}
                    onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                  />
                  <label className="form-check-label text-white small" htmlFor="featuredCheck">
                    Featured Layout
                  </label>
                </div>
              </div>

              {/* SEO Title & Description */}
              <div className="col-md-6 pt-3 border-top border-subtle">
                <label className="form-label text-muted-custom text-uppercase small">SEO Title Tag</label>
                <input
                  type="text"
                  className="form-control form-editorial-control"
                  value={formData.seoTitle || ''}
                  onChange={(e) => setFormData({ ...formData, seoTitle: e.target.value })}
                />
              </div>

              <div className="col-md-6 pt-3 border-top border-subtle">
                <label className="form-label text-muted-custom text-uppercase small">SEO Meta Description</label>
                <input
                  type="text"
                  className="form-control form-editorial-control"
                  value={formData.seoDescription || ''}
                  onChange={(e) => setFormData({ ...formData, seoDescription: e.target.value })}
                />
              </div>

              {/* Actions */}
              <div className="col-12 pt-4 border-top border-subtle d-flex justify-content-end gap-3">
                <button
                  type="button"
                  onClick={cancelEditor}
                  className="btn btn-outline-editorial text-uppercase"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="btn btn-lime text-uppercase px-4 fw-semibold d-flex align-items-center gap-2"
                >
                  {saving ? (
                    <>
                      <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                      <span>Saving to Firestore...</span>
                    </>
                  ) : (
                    <>
                      <i className="bi bi-check-lg"></i>
                      <span>Save Project</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      ) : (
        /* List View */
        <div>
          {/* Top Bar */}
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 pb-4 mb-4 border-bottom border-subtle">
            <div>
              <h2 className="font-editorial text-white fs-3 mb-1">Portfolio Projects</h2>
              <p className="text-secondary-custom small mb-0">
                Manage, curate, and publish design showcases and case studies.
              </p>
            </div>

            <button
              onClick={startCreate}
              className="btn btn-lime text-uppercase fw-semibold d-flex align-items-center gap-2"
              style={{ fontSize: '0.82rem' }}
            >
              <i className="bi bi-plus-lg"></i>
              <span>Add New Project</span>
            </button>
          </div>

          {/* Search & Category Filter */}
          <div className="row g-3 mb-4">
            <div className="col-md-6">
              <div className="input-group">
                <span className="input-group-text bg-surface-dark border-subtle text-muted-custom">
                  <i className="bi bi-search"></i>
                </span>
                <input
                  type="text"
                  className="form-control form-editorial-control"
                  placeholder="Search projects by title or client..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <div className="col-md-6">
              <select
                className="form-select form-editorial-control"
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
              >
                <option value="all">All Categories ({projects.length})</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Table */}
          {filtered.length === 0 ? (
            <div className="p-5 text-center bg-surface-dark border border-subtle text-muted-custom">
              <i className="bi bi-folder-x fs-1 d-block mb-3 text-secondary-custom"></i>
              <h5 className="text-white font-editorial">No Projects Found</h5>
              <p className="small mb-4">No portfolio items match your filter criteria.</p>
              <button onClick={startCreate} className="btn btn-outline-editorial text-uppercase btn-sm">
                Create First Project
              </button>
            </div>
          ) : (
            <div className="table-responsive bg-surface-dark border border-subtle">
              <table className="table admin-table mb-0">
                <thead>
                  <tr>
                    <th style={{ width: '60px' }}>Order</th>
                    <th>Project</th>
                    <th>Category</th>
                    <th>Status</th>
                    <th>Featured</th>
                    <th className="text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((p) => {
                    const catName = categories.find(c => c.id === p.categoryId)?.name || '—';
                    return (
                      <tr key={p.id}>
                        <td className="text-muted-custom font-editorial fs-6">
                          {p.displayOrder ?? 0}
                        </td>
                        <td>
                          <div className="d-flex align-items-center gap-3">
                            <img
                              src={p.thumbnailUrl}
                              alt={p.title}
                              style={{ width: '48px', height: '48px', objectFit: 'cover' }}
                            />
                            <div>
                              <div className="text-white fw-semibold">{p.title}</div>
                              <div className="text-muted-custom small">
                                {p.clientName ? `${p.clientName} • ` : ''}{p.projectYear || ''}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className="badge bg-secondary-dark border border-subtle text-secondary-custom fw-normal">
                            {catName}
                          </span>
                        </td>
                        <td>
                          <span className={`badge ${p.published ? 'bg-secondary-dark border border-subtle text-accent' : 'bg-surface-dark text-muted-custom'}`}>
                            {p.published ? 'Published' : 'Draft'}
                          </span>
                        </td>
                        <td>
                          {p.featured && (
                            <span className="badge bg-accent text-dark fw-bold">
                              FEATURED
                            </span>
                          )}
                        </td>
                        <td className="text-end">
                          <div className="d-inline-flex gap-2">
                            <button
                              onClick={() => startEdit(p)}
                              className="btn btn-sm btn-outline-editorial py-1 px-2"
                              title="Edit project"
                            >
                              <i className="bi bi-pencil"></i>
                            </button>
                            <button
                              onClick={() => setDeleteConfirmId(p.id)}
                              className="btn btn-sm btn-outline-danger py-1 px-2 rounded-0 border-subtle"
                              title="Delete project"
                            >
                              <i className="bi bi-trash"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center p-3"
          style={{ backgroundColor: 'rgba(0,0,0,0.85)', zIndex: 1080 }}
        >
          <div className="bg-secondary-dark border border-subtle p-4 max-w-md w-100 text-light shadow-2xl">
            <h4 className="font-editorial text-white mb-2">Confirm Project Deletion</h4>
            <p className="text-secondary-custom small mb-4">
              Are you sure you want to delete this project? This will permanently remove its record and showcase from the database.
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
                Delete Permanently
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
