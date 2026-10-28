import React, { useState } from 'react';
import { SiteSettings } from '../types';
import { createInquiry } from '../services/db';

interface ContactProps {
  settings: SiteSettings | null;
  presetService?: string;
  onOpenAdmin: () => void;
}

export const Contact: React.FC<ContactProps> = ({ settings, presetService, onOpenAdmin }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    projectType: presetService || 'Brand Identity',
    estimatedBudget: '$5k - $10k',
    message: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      setErrorMessage('Please fill in your name, email, and project message.');
      return;
    }

    setSubmitting(true);
    setErrorMessage(null);

    try {
      await createInquiry({
        name: formData.name.trim(),
        email: formData.email.trim(),
        projectType: formData.projectType,
        estimatedBudget: formData.estimatedBudget,
        message: formData.message.trim(),
      });
      setSubmitted(true);
      setFormData({
        name: '',
        email: '',
        projectType: 'Brand Identity',
        estimatedBudget: '$5k - $10k',
        message: ''
      });
    } catch (err: any) {
      console.error('Failed to submit inquiry:', err);
      setErrorMessage('Unable to send inquiry at this moment. Please email directly or try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const email = settings?.email || 'studio@kaelenvance.design';
  const phone = settings?.phone || '+1 (212) 847-9201';
  const whatsapp = settings?.whatsapp;
  const social = settings?.socialLinks;

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <section id="contact" className="py-5 mt-5 border-top border-subtle bg-secondary-dark">
      <div className="container py-5">
        <div className="row g-5">
          {/* Left Column: Direct Info & Editorial Contact Statement */}
          <div className="col-lg-5" data-aos="fade-up">
            <span className="hero-tag mb-2">Initiate Collaboration</span>
            <h2 className="font-editorial display-4 text-white mb-4">
              Have a Project in Mind? Let's Shape It Together.
            </h2>
            <p className="text-secondary-custom fs-5 mb-5 leading-relaxed">
              Whether you are an established enterprise preparing for a complete brand redesign or an emerging venture launching a signature product, I am available for select high-caliber commissions.
            </p>

            <div className="d-flex flex-column gap-4 border-top border-subtle pt-4">
              {/* Email */}
              <div>
                <div className="text-muted-custom text-uppercase mb-1" style={{ fontSize: '0.75rem', letterSpacing: '0.1em' }}>Direct Inquiries</div>
                <a href={`mailto:${email}`} className="text-white text-decoration-none fs-5 font-editorial hover-accent">
                  {email}
                </a>
              </div>

              {/* Phone */}
              {phone && (
                <div>
                  <div className="text-muted-custom text-uppercase mb-1" style={{ fontSize: '0.75rem', letterSpacing: '0.1em' }}>Telephone / Studio</div>
                  <div className="text-secondary-custom">{phone}</div>
                </div>
              )}

              {/* WhatsApp direct chat */}
              {whatsapp && (
                <div>
                  <div className="text-muted-custom text-uppercase mb-1" style={{ fontSize: '0.75rem', letterSpacing: '0.1em' }}>Instant Messaging</div>
                  <a
                    href={`https://wa.me/${whatsapp.replace(/[^0-9]/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-sm btn-outline-editorial text-uppercase d-inline-flex align-items-center gap-2 mt-1"
                  >
                    <i className="bi bi-whatsapp text-accent"></i>
                    <span>Chat on WhatsApp</span>
                  </a>
                </div>
              )}

              {/* Social Channels */}
              {social && (
                <div className="pt-2">
                  <div className="text-muted-custom text-uppercase mb-2" style={{ fontSize: '0.75rem', letterSpacing: '0.1em' }}>Social Archives</div>
                  <div className="d-flex flex-wrap gap-3 fs-5">
                    {social.instagram && (
                      <a href={social.instagram} target="_blank" rel="noopener noreferrer" className="text-secondary-custom hover-accent" aria-label="Instagram">
                        <i className="bi bi-instagram"></i>
                      </a>
                    )}
                    {social.behance && (
                      <a href={social.behance} target="_blank" rel="noopener noreferrer" className="text-secondary-custom hover-accent" aria-label="Behance">
                        <i className="bi bi-behance"></i>
                      </a>
                    )}
                    {social.dribbble && (
                      <a href={social.dribbble} target="_blank" rel="noopener noreferrer" className="text-secondary-custom hover-accent" aria-label="Dribbble">
                        <i className="bi bi-dribbble"></i>
                      </a>
                    )}
                    {social.linkedin && (
                      <a href={social.linkedin} target="_blank" rel="noopener noreferrer" className="text-secondary-custom hover-accent" aria-label="LinkedIn">
                        <i className="bi bi-linkedin"></i>
                      </a>
                    )}
                    {social.twitter && (
                      <a href={social.twitter} target="_blank" rel="noopener noreferrer" className="text-secondary-custom hover-accent" aria-label="X / Twitter">
                        <i className="bi bi-twitter-x"></i>
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Inquiries Form */}
          <div className="col-lg-7" data-aos="fade-up" data-aos-delay="150">
            <div className="p-4 p-md-5 bg-surface-dark border border-subtle">
              <h3 className="font-editorial text-white mb-2 fs-3">Send a Project Brief</h3>
              <p className="text-secondary-custom small mb-4">
                Please share preliminary details regarding your brand, timing, and intended deliverables.
              </p>

              {submitted ? (
                <div className="p-4 border border-subtle bg-secondary-dark text-center my-4">
                  <i className="bi bi-check-circle text-accent display-4 d-block mb-3"></i>
                  <h4 className="font-editorial text-white mb-2">Inquiry Transmitted Successfully</h4>
                  <p className="text-secondary-custom mb-4">
                    Thank you for reaching out. I personally review all client briefs and respond within 24 to 48 business hours.
                  </p>
                  <button
                    onClick={() => setSubmitted(false)}
                    className="btn btn-sm btn-outline-editorial text-uppercase"
                  >
                    Submit Another Brief
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} noValidate>
                  {errorMessage && (
                    <div className="alert alert-danger rounded-0 border-0 py-2 small mb-4" role="alert">
                      {errorMessage}
                    </div>
                  )}

                  <div className="row g-4">
                    {/* Name */}
                    <div className="col-md-6">
                      <label className="form-label text-muted-custom text-uppercase small" style={{ letterSpacing: '0.05em' }}>
                        Your Full Name *
                      </label>
                      <input
                        type="text"
                        className="form-control form-editorial-control"
                        placeholder="e.g. Katherine Thorne"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                      />
                    </div>

                    {/* Email */}
                    <div className="col-md-6">
                      <label className="form-label text-muted-custom text-uppercase small" style={{ letterSpacing: '0.05em' }}>
                        Your Email Address *
                      </label>
                      <input
                        type="email"
                        className="form-control form-editorial-control"
                        placeholder="e.g. katherine@studio.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                      />
                    </div>

                    {/* Project Type */}
                    <div className="col-md-6">
                      <label className="form-label text-muted-custom text-uppercase small" style={{ letterSpacing: '0.05em' }}>
                        Project Focus
                      </label>
                      <select
                        className="form-select form-editorial-control"
                        value={formData.projectType}
                        onChange={(e) => setFormData({ ...formData, projectType: e.target.value })}
                      >
                        <option value="Brand Identity">Brand Identity & Visual System</option>
                        <option value="Luxury Packaging">Luxury Packaging & Unboxing</option>
                        <option value="Editorial Design">Editorial & Monograph Publication</option>
                        <option value="Custom Typography">Custom Typography & Logotype</option>
                        <option value="Digital Experience">Digital Experience & UI Direction</option>
                        <option value="Other">Other Bespoke Requirement</option>
                      </select>
                    </div>

                    {/* Estimated Budget */}
                    <div className="col-md-6">
                      <label className="form-label text-muted-custom text-uppercase small" style={{ letterSpacing: '0.05em' }}>
                        Estimated Budget Range
                      </label>
                      <select
                        className="form-select form-editorial-control"
                        value={formData.estimatedBudget}
                        onChange={(e) => setFormData({ ...formData, estimatedBudget: e.target.value })}
                      >
                        <option value="Under $5k">Under $5,000</option>
                        <option value="$5k - $10k">$5,000 – $10,000</option>
                        <option value="$10k - $25k">$10,000 – $25,000</option>
                        <option value="$25k+">$25,000+</option>
                      </select>
                    </div>

                    {/* Message */}
                    <div className="col-12">
                      <label className="form-label text-muted-custom text-uppercase small" style={{ letterSpacing: '0.05em' }}>
                        Project Scope & Timeline *
                      </label>
                      <textarea
                        rows={5}
                        className="form-control form-editorial-control"
                        placeholder="Tell me about your brand, upcoming milestone dates, and key challenges..."
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        required
                      />
                    </div>

                    {/* Submit Button */}
                    <div className="col-12 pt-2">
                      <button
                        type="submit"
                        disabled={submitting}
                        className="btn btn-lime text-uppercase fw-semibold w-100 py-3 d-flex align-items-center justify-content-center gap-2"
                      >
                        {submitting ? (
                          <>
                            <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                            <span>Transmitting Brief to Firestore...</span>
                          </>
                        ) : (
                          <>
                            <span>Transmit Project Inquiry</span>
                            <i className="bi bi-arrow-right"></i>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>

        {/* Footer Area */}
        <div className="mt-5 pt-5 border-top border-subtle d-flex flex-column flex-md-row justify-content-between align-items-center gap-4 text-muted-custom" style={{ fontSize: '0.85rem' }}>
          <div>
            &copy; {new Date().getFullYear()} {settings?.designerName || 'Kaelen Vance'}. All rights reserved.
          </div>

          <div className="d-flex align-items-center gap-4">
            <button
              onClick={onOpenAdmin}
              className="btn btn-link text-muted-custom text-decoration-none p-0 d-flex align-items-center gap-1 hover-accent"
              style={{ fontSize: '0.82rem' }}
            >
              <i className="bi bi-lock"></i>
              <span>Admin Studio Portal</span>
            </button>

            <button
              onClick={scrollToTop}
              className="btn btn-link text-muted-custom text-decoration-none p-0 d-flex align-items-center gap-1 hover-accent"
              style={{ fontSize: '0.82rem' }}
            >
              <span>Back to Top</span>
              <i className="bi bi-arrow-up"></i>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
