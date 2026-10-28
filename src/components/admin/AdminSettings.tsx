import React, { useState, useEffect } from 'react';
import { SiteSettings, HomepageSection } from '../../types';
import { updateSiteSettings, updateHomepageSection, uploadFileToStorage } from '../../services/db';
import { auth } from '../../firebase';
import { updateAdminUsername, updateAdminPassword } from '../../services/auth';

interface AdminSettingsProps {
  settings: SiteSettings | null;
  sections: HomepageSection[];
  onRefreshData: () => Promise<void>;
}

export const AdminSettings: React.FC<AdminSettingsProps> = ({
  settings,
  sections,
  onRefreshData,
}) => {
  const [formData, setFormData] = useState<Partial<SiteSettings>>({
    designerName: '',
    logoUrl: '',
    heroTitle: '',
    heroSubtitle: '',
    heroImageUrl: '',
    aboutText: '',
    aboutImageUrl: '',
    experienceYears: 10,
    softwareTools: [],
    achievements: [],
    email: '',
    phone: '',
    whatsapp: '',
    socialLinks: {
      instagram: '',
      behance: '',
      dribbble: '',
      linkedin: '',
      twitter: ''
    },
    availabilityStatus: '',
    cvUrl: '',
    seoTitle: '',
    seoDescription: '',
  });

  const [rawTools, setRawTools] = useState('');
  const [rawAchievements, setRawAchievements] = useState('');
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'hero' | 'about' | 'contact' | 'sections' | 'seo' | 'account'>('profile');
  const [uploadingHero, setUploadingHero] = useState(false);
  const [uploadingAbout, setUploadingAbout] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Admin Account & Security State
  const currentUser = auth.currentUser;
  const [adminUsername, setAdminUsername] = useState(currentUser?.displayName || 'Administrator');
  const [updatingUsername, setUpdatingUsername] = useState(false);
  const [usernameSuccess, setUsernameSuccess] = useState<string | null>(null);
  const [usernameError, setUsernameError] = useState<string | null>(null);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswords, setShowPasswords] = useState(false);
  const [updatingPassword, setUpdatingPassword] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  useEffect(() => {
    if (settings) {
      setFormData(settings);
      setRawTools(settings.softwareTools ? settings.softwareTools.join(', ') : '');
      setRawAchievements(settings.achievements ? settings.achievements.join('\n') : '');
    }
  }, [settings]);

  useEffect(() => {
    if (currentUser?.displayName) {
      setAdminUsername(currentUser.displayName);
    }
  }, [currentUser]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, target: 'hero' | 'about') => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (target === 'hero') setUploadingHero(true);
    else setUploadingAbout(true);

    try {
      const url = await uploadFileToStorage(file, 'settings');
      if (target === 'hero') {
        setFormData(prev => ({ ...prev, heroImageUrl: url }));
      } else {
        setFormData(prev => ({ ...prev, aboutImageUrl: url }));
      }
    } catch (err) {
      console.error('File upload failed:', err);
      alert('Failed to upload image file.');
    } finally {
      setUploadingHero(false);
      setUploadingAbout(false);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveSuccess(false);

    try {
      const parsedTools = rawTools
        .split(',')
        .map(t => t.trim())
        .filter(t => t.length > 0);
      const parsedAchievements = rawAchievements
        .split('\n')
        .map(a => a.trim())
        .filter(a => a.length > 0);

      await updateSiteSettings({
        ...formData,
        softwareTools: parsedTools,
        achievements: parsedAchievements,
      });
      await onRefreshData();
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4000);
    } catch (err) {
      console.error('Failed to update settings:', err);
      alert('Error updating settings: ' + String(err));
    } finally {
      setSaving(false);
    }
  };

  const handleToggleSection = async (sec: HomepageSection) => {
    try {
      await updateHomepageSection(sec.id, { enabled: !sec.enabled });
      await onRefreshData();
    } catch (err) {
      console.error('Failed to update section:', err);
      alert('Error updating section: ' + String(err));
    }
  };

  const handleSectionOrder = async (sec: HomepageSection, newOrder: number) => {
    try {
      await updateHomepageSection(sec.id, { displayOrder: newOrder });
      await onRefreshData();
    } catch (err) {
      console.error('Failed to update section order:', err);
    }
  };

  // Admin Username Update Handler
  const handleUpdateAdminUsername = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminUsername.trim()) {
      setUsernameError('Please enter a valid username.');
      return;
    }
    setUpdatingUsername(true);
    setUsernameSuccess(null);
    setUsernameError(null);
    try {
      await updateAdminUsername(adminUsername.trim());
      setUsernameSuccess('Administrator username updated successfully!');
      setTimeout(() => setUsernameSuccess(null), 4000);
    } catch (err: any) {
      setUsernameError(err.message || 'Failed to update username.');
    } finally {
      setUpdatingUsername(false);
    }
  };

  // Admin Password Update Handler
  const handleUpdateAdminPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordSuccess(null);
    setPasswordError(null);

    if (newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('New password and confirmation do not match.');
      return;
    }

    setUpdatingPassword(true);
    try {
      await updateAdminPassword(newPassword, currentPassword || undefined);
      setPasswordSuccess('Administrator password changed successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPasswordSuccess(null), 4000);
    } catch (err: any) {
      setPasswordError(err.message || 'Failed to update password.');
    } finally {
      setUpdatingPassword(false);
    }
  };

  return (
    <div>
      <div className="pb-4 mb-4 border-bottom border-subtle">
        <h2 className="font-editorial fs-3 mb-1" style={{ color: 'var(--text-primary)' }}>Site Configuration & Admin Security</h2>
        <p className="text-secondary-custom small mb-0">
          Control website branding, typography copy, homepage sections, and administrator credentials.
        </p>
      </div>

      {saveSuccess && (
        <div className="alert alert-success bg-surface-dark border-accent text-accent rounded-0 p-3 mb-4 d-flex align-items-center gap-2">
          <i className="bi bi-check-circle fs-5"></i>
          <span>Settings successfully synchronized with Firestore!</span>
        </div>
      )}

      {/* Responsive Horizontal Tabs */}
      <div className="d-flex flex-nowrap overflow-auto gap-2 pb-3 mb-4 border-bottom border-subtle" style={{ WebkitOverflowScrolling: 'touch' }}>
        <button
          onClick={() => setActiveTab('profile')}
          className={`btn btn-sm ${activeTab === 'profile' ? 'btn-lime' : 'btn-outline-editorial'} text-uppercase flex-shrink-0`}
        >
          General & Brand
        </button>
        <button
          onClick={() => setActiveTab('hero')}
          className={`btn btn-sm ${activeTab === 'hero' ? 'btn-lime' : 'btn-outline-editorial'} text-uppercase flex-shrink-0`}
        >
          Hero Section
        </button>
        <button
          onClick={() => setActiveTab('about')}
          className={`btn btn-sm ${activeTab === 'about' ? 'btn-lime' : 'btn-outline-editorial'} text-uppercase flex-shrink-0`}
        >
          About & Bio
        </button>
        <button
          onClick={() => setActiveTab('contact')}
          className={`btn btn-sm ${activeTab === 'contact' ? 'btn-lime' : 'btn-outline-editorial'} text-uppercase flex-shrink-0`}
        >
          Contact & Social
        </button>
        <button
          onClick={() => setActiveTab('sections')}
          className={`btn btn-sm ${activeTab === 'sections' ? 'btn-lime' : 'btn-outline-editorial'} text-uppercase flex-shrink-0`}
        >
          Section Layouts
        </button>
        <button
          onClick={() => setActiveTab('seo')}
          className={`btn btn-sm ${activeTab === 'seo' ? 'btn-lime' : 'btn-outline-editorial'} text-uppercase flex-shrink-0`}
        >
          SEO & Metadata
        </button>
        <button
          onClick={() => setActiveTab('account')}
          className={`btn btn-sm ${activeTab === 'account' ? 'btn-lime' : 'btn-outline-editorial'} text-uppercase flex-shrink-0`}
        >
          <i className="bi bi-shield-lock me-1"></i>
          Admin Account & Security
        </button>
      </div>

      {/* TAB: Admin Account & Security (Username & Password fields) */}
      {activeTab === 'account' && (
        <div className="row g-4">
          {/* 1. Admin Username Form */}
          <div className="col-lg-6">
            <div className="p-4 bg-surface-dark border border-subtle h-100">
              <div className="d-flex align-items-center gap-2 mb-3">
                <i className="bi bi-person-badge text-accent fs-4"></i>
                <h4 className="font-editorial fs-5 mb-0" style={{ color: 'var(--text-primary)' }}>
                  Administrator Username
                </h4>
              </div>
              <p className="text-secondary-custom small mb-4">
                Update your administrative display name across the studio console and audit records.
              </p>

              {usernameSuccess && (
                <div className="alert alert-success rounded-0 border-0 py-2 small mb-3">
                  <i className="bi bi-check-circle me-1"></i> {usernameSuccess}
                </div>
              )}
              {usernameError && (
                <div className="alert alert-danger rounded-0 border-0 py-2 small mb-3">
                  <i className="bi bi-exclamation-triangle me-1"></i> {usernameError}
                </div>
              )}

              <form onSubmit={handleUpdateAdminUsername}>
                <div className="mb-3">
                  <label className="form-label text-muted-custom text-uppercase small" style={{ fontSize: '0.75rem' }}>
                    Current Email Address
                  </label>
                  <input
                    type="text"
                    disabled
                    className="form-control form-editorial-control opacity-75"
                    value={currentUser?.email || 'gk9192101@gmail.com'}
                  />
                  <div className="text-muted-custom mt-1" style={{ fontSize: '0.72rem' }}>
                    Primary administrative email credential.
                  </div>
                </div>

                <div className="mb-4">
                  <label className="form-label text-muted-custom text-uppercase small" style={{ fontSize: '0.75rem' }}>
                    Admin Username / Display Name *
                  </label>
                  <input
                    type="text"
                    className="form-control form-editorial-control"
                    placeholder="e.g. Studio Lead / Kaelen Vance"
                    value={adminUsername}
                    onChange={(e) => setAdminUsername(e.target.value)}
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={updatingUsername}
                  className="btn btn-lime text-uppercase fw-semibold btn-sm px-4 py-2"
                >
                  {updatingUsername ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-1" role="status"></span>
                      Saving Username...
                    </>
                  ) : (
                    'Save Username'
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* 2. Admin Password Form */}
          <div className="col-lg-6">
            <div className="p-4 bg-surface-dark border border-subtle h-100">
              <div className="d-flex align-items-center justify-content-between mb-3">
                <div className="d-flex align-items-center gap-2">
                  <i className="bi bi-key text-accent fs-4"></i>
                  <h4 className="font-editorial fs-5 mb-0" style={{ color: 'var(--text-primary)' }}>
                    Edit Administrator Password
                  </h4>
                </div>
                <button
                  type="button"
                  onClick={() => setShowPasswords(!showPasswords)}
                  className="btn btn-link p-0 text-muted-custom small text-decoration-none"
                  style={{ fontSize: '0.75rem' }}
                >
                  <i className={`bi ${showPasswords ? 'bi-eye-slash' : 'bi-eye'} me-1`}></i>
                  {showPasswords ? 'Hide' : 'Show'}
                </button>
              </div>
              <p className="text-secondary-custom small mb-4">
                Update your authentication password for direct email/password login to the admin panel.
              </p>

              {passwordSuccess && (
                <div className="alert alert-success rounded-0 border-0 py-2 small mb-3">
                  <i className="bi bi-check-circle me-1"></i> {passwordSuccess}
                </div>
              )}
              {passwordError && (
                <div className="alert alert-danger rounded-0 border-0 py-2 small mb-3">
                  <i className="bi bi-exclamation-triangle me-1"></i> {passwordError}
                </div>
              )}

              <form onSubmit={handleUpdateAdminPassword}>
                <div className="mb-3">
                  <label className="form-label text-muted-custom text-uppercase small" style={{ fontSize: '0.75rem' }}>
                    Current Password (If already set)
                  </label>
                  <input
                    type={showPasswords ? 'text' : 'password'}
                    className="form-control form-editorial-control"
                    placeholder="Current password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label text-muted-custom text-uppercase small" style={{ fontSize: '0.75rem' }}>
                    New Password * (Min. 6 characters)
                  </label>
                  <input
                    type={showPasswords ? 'text' : 'password'}
                    className="form-control form-editorial-control"
                    placeholder="••••••••••••"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    minLength={6}
                  />
                </div>

                <div className="mb-4">
                  <label className="form-label text-muted-custom text-uppercase small" style={{ fontSize: '0.75rem' }}>
                    Confirm New Password *
                  </label>
                  <input
                    type={showPasswords ? 'text' : 'password'}
                    className="form-control form-editorial-control"
                    placeholder="••••••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    minLength={6}
                  />
                </div>

                <button
                  type="submit"
                  disabled={updatingPassword}
                  className="btn btn-lime text-uppercase fw-semibold btn-sm px-4 py-2"
                >
                  {updatingPassword ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-1" role="status"></span>
                      Updating Password...
                    </>
                  ) : (
                    'Update Admin Password'
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Account Details & Metadata Card */}
          <div className="col-12">
            <div className="p-4 bg-surface-dark border border-subtle d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
              <div>
                <div className="text-muted-custom text-uppercase small" style={{ fontSize: '0.7rem' }}>Authorized Security Context</div>
                <div className="fw-semibold mt-1" style={{ color: 'var(--text-primary)' }}>
                  User UID: <span className="text-secondary-custom font-monospace small">{currentUser?.uid || 'N/A'}</span>
                </div>
                <div className="text-muted-custom small mt-1">
                  Auth Provider: <span className="text-accent">{currentUser?.providerData?.[0]?.providerId || 'firebase'}</span>
                </div>
              </div>

              <div className="badge bg-secondary-dark border border-subtle text-accent px-3 py-2 text-uppercase" style={{ letterSpacing: '0.08em' }}>
                <i className="bi bi-shield-check me-1"></i> Root Administrator
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Other Settings Forms */}
      {activeTab !== 'account' && (
        <form onSubmit={handleSaveSettings}>
          {/* TAB 1: General & Brand */}
          {activeTab === 'profile' && (
            <div className="p-4 bg-surface-dark border border-subtle">
              <h4 className="font-editorial fs-5 mb-3" style={{ color: 'var(--text-primary)' }}>Designer Brand Identity</h4>
              <div className="row g-4">
                <div className="col-md-6">
                  <label className="form-label text-muted-custom text-uppercase small">Designer Full Name *</label>
                  <input
                    type="text"
                    className="form-control form-editorial-control"
                    placeholder="e.g. Kaelen Vance"
                    value={formData.designerName || ''}
                    onChange={(e) => setFormData({ ...formData, designerName: e.target.value })}
                    required
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label text-muted-custom text-uppercase small">Custom Logo Image URL</label>
                  <input
                    type="text"
                    className="form-control form-editorial-control"
                    placeholder="https://... (leave blank to display stylish text mark)"
                    value={formData.logoUrl || ''}
                    onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label text-muted-custom text-uppercase small">Studio Availability Status</label>
                  <input
                    type="text"
                    className="form-control form-editorial-control"
                    placeholder="e.g. Accepting select commissions for Q2 / Q3"
                    value={formData.availabilityStatus || ''}
                    onChange={(e) => setFormData({ ...formData, availabilityStatus: e.target.value })}
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label text-muted-custom text-uppercase small">Curriculum Vitae / Portfolio PDF URL</label>
                  <input
                    type="text"
                    className="form-control form-editorial-control"
                    placeholder="https://.../portfolio.pdf"
                    value={formData.cvUrl || ''}
                    onChange={(e) => setFormData({ ...formData, cvUrl: e.target.value })}
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Hero Section */}
          {activeTab === 'hero' && (
            <div className="p-4 bg-surface-dark border border-subtle">
              <h4 className="font-editorial fs-5 mb-3" style={{ color: 'var(--text-primary)' }}>Hero Headline & Presence</h4>
              <div className="row g-4">
                <div className="col-12">
                  <label className="form-label text-muted-custom text-uppercase small">Primary Headline</label>
                  <input
                    type="text"
                    className="form-control form-editorial-control"
                    placeholder="I Design Brands That Make You Impossible to Ignore."
                    value={formData.heroTitle || ''}
                    onChange={(e) => setFormData({ ...formData, heroTitle: e.target.value })}
                  />
                </div>

                <div className="col-12">
                  <label className="form-label text-muted-custom text-uppercase small">Supporting Paragraph</label>
                  <textarea
                    rows={3}
                    className="form-control form-editorial-control"
                    placeholder="Award-winning creative director crafting high-impact visual systems..."
                    value={formData.heroSubtitle || ''}
                    onChange={(e) => setFormData({ ...formData, heroSubtitle: e.target.value })}
                  />
                </div>

                <div className="col-md-8">
                  <label className="form-label text-muted-custom text-uppercase small">Hero Visual Artwork / Portrait URL</label>
                  <input
                    type="text"
                    className="form-control form-editorial-control mb-2"
                    placeholder="https://... (clean typography-only layout renders if left blank)"
                    value={formData.heroImageUrl || ''}
                    onChange={(e) => setFormData({ ...formData, heroImageUrl: e.target.value })}
                  />
                  <label className="btn btn-sm btn-outline-editorial text-uppercase m-0 cursor-pointer">
                    <i className="bi bi-upload text-accent me-1"></i>
                    Upload Artwork File
                    <input
                      type="file"
                      accept="image/*"
                      className="d-none"
                      onChange={(e) => handleFileUpload(e, 'hero')}
                    />
                  </label>
                  {uploadingHero && <span className="spinner-border spinner-border-sm text-accent ms-2"></span>}
                </div>

                {formData.heroImageUrl && (
                  <div className="col-md-4">
                    <div className="border border-subtle overflow-hidden" style={{ maxHeight: '180px' }}>
                      <img src={formData.heroImageUrl} alt="Hero visual" className="w-100 h-100" style={{ objectFit: 'cover' }} />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: About & Bio */}
          {activeTab === 'about' && (
            <div className="p-4 bg-surface-dark border border-subtle">
              <h4 className="font-editorial fs-5 mb-3" style={{ color: 'var(--text-primary)' }}>About Biography & Experience</h4>
              <div className="row g-4">
                <div className="col-12">
                  <label className="form-label text-muted-custom text-uppercase small">Biography & Design Philosophy</label>
                  <textarea
                    rows={6}
                    className="form-control form-editorial-control"
                    placeholder="With over a decade of practice across Zurich, Tokyo, and New York..."
                    value={formData.aboutText || ''}
                    onChange={(e) => setFormData({ ...formData, aboutText: e.target.value })}
                  />
                </div>

                <div className="col-md-8">
                  <label className="form-label text-muted-custom text-uppercase small">Designer Portrait / Studio Image URL</label>
                  <input
                    type="text"
                    className="form-control form-editorial-control mb-2"
                    placeholder="https://..."
                    value={formData.aboutImageUrl || ''}
                    onChange={(e) => setFormData({ ...formData, aboutImageUrl: e.target.value })}
                  />
                  <label className="btn btn-sm btn-outline-editorial text-uppercase m-0 cursor-pointer">
                    <i className="bi bi-upload text-accent me-1"></i>
                    Upload Portrait File
                    <input
                      type="file"
                      accept="image/*"
                      className="d-none"
                      onChange={(e) => handleFileUpload(e, 'about')}
                    />
                  </label>
                  {uploadingAbout && <span className="spinner-border spinner-border-sm text-accent ms-2"></span>}
                </div>

                <div className="col-md-4">
                  <label className="form-label text-muted-custom text-uppercase small">Years of Practice</label>
                  <input
                    type="number"
                    className="form-control form-editorial-control"
                    value={formData.experienceYears ?? 10}
                    onChange={(e) => setFormData({ ...formData, experienceYears: Number(e.target.value) })}
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label text-muted-custom text-uppercase small">Core Toolkit & Software (comma separated)</label>
                  <input
                    type="text"
                    className="form-control form-editorial-control"
                    placeholder="Adobe Illustrator, Photoshop, InDesign, Figma, After Effects"
                    value={rawTools}
                    onChange={(e) => setRawTools(e.target.value)}
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label text-muted-custom text-uppercase small">Achievements & Awards (one per line)</label>
                  <textarea
                    rows={3}
                    className="form-control form-editorial-control"
                    placeholder="Tokyo Type Directors Club Selection&#10;Awwwards Site of the Day 2024"
                    value={rawAchievements}
                    onChange={(e) => setRawAchievements(e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: Contact & Social */}
          {activeTab === 'contact' && (
            <div className="p-4 bg-surface-dark border border-subtle">
              <h4 className="font-editorial fs-5 mb-3" style={{ color: 'var(--text-primary)' }}>Communication Channels & Social Networks</h4>
              <div className="row g-4">
                <div className="col-md-4">
                  <label className="form-label text-muted-custom text-uppercase small">Studio Email</label>
                  <input
                    type="email"
                    className="form-control form-editorial-control"
                    value={formData.email || ''}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>

                <div className="col-md-4">
                  <label className="form-label text-muted-custom text-uppercase small">Phone Number</label>
                  <input
                    type="text"
                    className="form-control form-editorial-control"
                    value={formData.phone || ''}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>

                <div className="col-md-4">
                  <label className="form-label text-muted-custom text-uppercase small">WhatsApp Number</label>
                  <input
                    type="text"
                    className="form-control form-editorial-control"
                    placeholder="+12128479201"
                    value={formData.whatsapp || ''}
                    onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                  />
                </div>

                <div className="col-md-4">
                  <label className="form-label text-muted-custom text-uppercase small">Instagram Profile URL</label>
                  <input
                    type="text"
                    className="form-control form-editorial-control"
                    placeholder="https://instagram.com/..."
                    value={formData.socialLinks?.instagram || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      socialLinks: { ...formData.socialLinks, instagram: e.target.value }
                    })}
                  />
                </div>

                <div className="col-md-4">
                  <label className="form-label text-muted-custom text-uppercase small">Behance Profile URL</label>
                  <input
                    type="text"
                    className="form-control form-editorial-control"
                    placeholder="https://behance.net/..."
                    value={formData.socialLinks?.behance || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      socialLinks: { ...formData.socialLinks, behance: e.target.value }
                    })}
                  />
                </div>

                <div className="col-md-4">
                  <label className="form-label text-muted-custom text-uppercase small">Dribbble Profile URL</label>
                  <input
                    type="text"
                    className="form-control form-editorial-control"
                    placeholder="https://dribbble.com/..."
                    value={formData.socialLinks?.dribbble || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      socialLinks: { ...formData.socialLinks, dribbble: e.target.value }
                    })}
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label text-muted-custom text-uppercase small">LinkedIn Profile URL</label>
                  <input
                    type="text"
                    className="form-control form-editorial-control"
                    placeholder="https://linkedin.com/in/..."
                    value={formData.socialLinks?.linkedin || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      socialLinks: { ...formData.socialLinks, linkedin: e.target.value }
                    })}
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label text-muted-custom text-uppercase small">X (Twitter) Profile URL</label>
                  <input
                    type="text"
                    className="form-control form-editorial-control"
                    placeholder="https://x.com/..."
                    value={formData.socialLinks?.twitter || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      socialLinks: { ...formData.socialLinks, twitter: e.target.value }
                    })}
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: Homepage Sections Management */}
          {activeTab === 'sections' && (
            <div className="p-4 bg-surface-dark border border-subtle">
              <h4 className="font-editorial fs-5 mb-2" style={{ color: 'var(--text-primary)' }}>Homepage Section Presence & Order</h4>
              <p className="text-secondary-custom small mb-4">
                Toggle sections on or off. When a section is disabled or has no valid content, it is automatically removed from the public page and navigation without deleting saved data.
              </p>

              <div className="table-responsive">
                <table className="table admin-table mb-0">
                  <thead>
                    <tr>
                      <th style={{ width: '80px' }}>Order</th>
                      <th>Section Name</th>
                      <th>Identifier</th>
                      <th>Visibility State</th>
                      <th className="text-end">Toggle</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sections.map((sec) => (
                      <tr key={sec.id}>
                        <td>
                          <input
                            type="number"
                            className="form-control form-control-sm form-editorial-control"
                            style={{ width: '65px' }}
                            value={sec.displayOrder}
                            onChange={(e) => handleSectionOrder(sec, Number(e.target.value))}
                          />
                        </td>
                        <td className="fw-semibold" style={{ color: 'var(--text-primary)' }}>{sec.title}</td>
                        <td className="text-muted-custom small">#{sec.sectionKey}</td>
                        <td>
                          <span className={`badge ${sec.enabled ? 'bg-secondary-dark border border-subtle text-accent' : 'bg-surface-dark text-muted-custom'}`}>
                            {sec.enabled ? 'Enabled' : 'Disabled'}
                          </span>
                        </td>
                        <td className="text-end">
                          <button
                            type="button"
                            onClick={() => handleToggleSection(sec)}
                            className={`btn btn-sm ${sec.enabled ? 'btn-outline-editorial' : 'btn-lime'} py-1 px-3`}
                            style={{ fontSize: '0.78rem' }}
                          >
                            {sec.enabled ? 'Disable' : 'Enable'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 6: SEO & Metadata */}
          {activeTab === 'seo' && (
            <div className="p-4 bg-surface-dark border border-subtle">
              <h4 className="font-editorial fs-5 mb-3" style={{ color: 'var(--text-primary)' }}>Search Engine Optimization</h4>
              <div className="row g-4">
                <div className="col-12">
                  <label className="form-label text-muted-custom text-uppercase small">SEO Title Tag</label>
                  <input
                    type="text"
                    className="form-control form-editorial-control"
                    placeholder="Kaelen Vance — Graphic Designer & Creative Director"
                    value={formData.seoTitle || ''}
                    onChange={(e) => setFormData({ ...formData, seoTitle: e.target.value })}
                  />
                </div>

                <div className="col-12">
                  <label className="form-label text-muted-custom text-uppercase small">Meta Description</label>
                  <textarea
                    rows={3}
                    className="form-control form-editorial-control"
                    placeholder="Bespoke brand identities, packaging design, and editorial monograph systems..."
                    value={formData.seoDescription || ''}
                    onChange={(e) => setFormData({ ...formData, seoDescription: e.target.value })}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Submit Bar */}
          <div className="pt-4 mt-4 border-top border-subtle d-flex justify-content-end">
            <button
              type="submit"
              disabled={saving}
              className="btn btn-lime text-uppercase px-5 py-3 fw-semibold d-flex align-items-center gap-2"
            >
              {saving ? (
                <>
                  <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                  <span>Saving Changes to Firestore...</span>
                </>
              ) : (
                <>
                  <i className="bi bi-check-lg fs-5"></i>
                  <span>Save Site Settings</span>
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
