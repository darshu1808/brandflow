'use client';

import React, { useState } from 'react';
import { X, Share2, UploadCloud, Link as LinkIcon } from 'lucide-react';
import { useBrandFlow } from '@/context/BrandFlowContext';
import { ContentType } from '@/lib/types';

export default function WhatsAppSubmitModal() {
  const { 
    isWhatsAppSubmitOpen, 
    setIsWhatsAppSubmitOpen, 
    createContent, 
    brands, 
    currentUser, 
    activeBrandId 
  } = useBrandFlow();

  const [brandId, setBrandId] = useState(activeBrandId === 'all' ? (brands[0]?.id || '') : activeBrandId);
  const [title, setTitle] = useState('');
  const [contentType, setContentType] = useState<ContentType>('Reel');
  const [driveLink, setDriveLink] = useState('');
  const [whatsappSourceLink, setWhatsappSourceLink] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isWhatsAppSubmitOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !brandId) return;

    setIsSubmitting(true);
    const selectedBrand = brands.find(b => b.id === brandId);

    await createContent({
      title: title.trim(),
      brandId,
      brandName: selectedBrand?.name || 'Brand',
      contentType,
      platform: 'Instagram',
      scheduledDate: new Date().toISOString().split('T')[0],
      scheduledTime: '19:00',
      caption: notes.trim(),
      creativeLink: driveLink.trim(),
      whatsappSourceLink: whatsappSourceLink.trim() || selectedBrand?.whatsappGroupUrl || '',
      approvalStatus: 'Submitted for Review',
      publishingStatus: 'Draft',
      assignedCreator: currentUser.name,
      assignedPublisher: 'Isha',
      version: 1,
      reviewNotes: notes.trim(),
    });

    setIsSubmitting(false);
    setTitle('');
    setDriveLink('');
    setWhatsappSourceLink('');
    setNotes('');
    setIsWhatsAppSubmitOpen(false);
  };

  const selectedBrand = brands.find(b => b.id === brandId);

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-hover border border-surface-border w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between px-5 py-4 border-b border-surface-border bg-emerald-50">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-emerald-600 text-white rounded-lg">
              <Share2 size={16} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-emerald-950">Team Creative Submission Portal</h2>
              <p className="text-[11px] text-emerald-700">Submit completed reels, graphics or WhatsApp drafts for review</p>
            </div>
          </div>
          <button 
            onClick={() => setIsWhatsAppSubmitOpen(false)}
            className="p-1 rounded-md text-emerald-700 hover:text-emerald-950 hover:bg-emerald-100 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Brand */}
          <div>
            <label className="block text-xs font-semibold text-slate-primary mb-1">Target Brand</label>
            <select
              value={brandId}
              onChange={(e) => setBrandId(e.target.value)}
              className="w-full text-xs px-2.5 py-2 bg-surface-subtle border border-surface-border rounded-lg focus:outline-none focus:border-brand-500 text-slate-primary font-medium"
            >
              {brands.map(b => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
            {selectedBrand?.whatsappGroupUrl && (
              <p className="text-[11px] text-slate-muted mt-1 flex items-center gap-1">
                <span>Associated Brand Group:</span>
                <a href={selectedBrand.whatsappGroupUrl} target="_blank" rel="noreferrer" className="text-emerald-600 underline">
                  WhatsApp Group Link
                </a>
              </p>
            )}
          </div>

          {/* Title & Type */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-primary mb-1">
                Content Title <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Silk Lehengas Reel Cut #1"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full text-xs px-3 py-2 bg-surface-subtle border border-surface-border rounded-lg focus:outline-none focus:border-brand-500 text-slate-primary"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-primary mb-1">Creative Type</label>
              <select
                value={contentType}
                onChange={(e) => setContentType(e.target.value as ContentType)}
                className="w-full text-xs px-2.5 py-2 bg-surface-subtle border border-surface-border rounded-lg focus:outline-none focus:border-brand-500 text-slate-primary"
              >
                <option value="Reel">🎬 Reel (9:16)</option>
                <option value="Post">🖼️ Graphic Post</option>
                <option value="Story">📱 Story</option>
                <option value="Carousel">📚 Carousel</option>
                <option value="Short Video">🎥 Short Video</option>
              </select>
            </div>
          </div>

          {/* Cloud Asset Link */}
          <div>
            <label className="block text-xs font-semibold text-slate-primary mb-1">
              Google Drive / Cloud File Link <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                type="url"
                required
                placeholder="https://drive.google.com/file/d/... or Dropbox"
                value={driveLink}
                onChange={(e) => setDriveLink(e.target.value)}
                className="w-full text-xs px-3 py-2 pl-8 bg-surface-subtle border border-surface-border rounded-lg focus:outline-none focus:border-brand-500 text-slate-primary"
              />
              <LinkIcon size={14} className="absolute left-2.5 top-2.5 text-slate-400" />
            </div>
          </div>

          {/* WhatsApp Message Reference */}
          <div>
            <label className="block text-xs font-semibold text-slate-primary mb-1">
              WhatsApp Message Reference / Source Link (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Chat link or message timestamp: 'Sent in HOF group at 10:15 AM'"
              value={whatsappSourceLink}
              onChange={(e) => setWhatsappSourceLink(e.target.value)}
              className="w-full text-xs px-3 py-2 bg-surface-subtle border border-surface-border rounded-lg focus:outline-none focus:border-brand-500 text-slate-primary"
            />
          </div>

          {/* Submission Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-primary mb-1">Notes for Brand Manager</label>
            <textarea
              rows={2}
              placeholder="Audio synced to beat. Color graded in Rec.709. Please check pacing..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full text-xs px-3 py-2 bg-surface-subtle border border-surface-border rounded-lg focus:outline-none focus:border-brand-500 text-slate-primary"
            />
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-[11px] text-slate-600">
            <span className="font-semibold text-slate-800">Automated Action:</span> Submitting this form automatically queues a Creative Review task for Brand Manager <strong>Darsh</strong> and generates review activity notifications.
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-surface-border">
            <button
              type="button"
              onClick={() => setIsWhatsAppSubmitOpen(false)}
              className="px-4 py-2 text-xs font-medium text-slate-muted hover:text-slate-primary transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-sm transition-all disabled:opacity-50"
            >
              {isSubmitting ? 'Submitting...' : 'Submit for Review'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
