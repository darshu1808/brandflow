'use client';

import React, { useState } from 'react';
import { X, Send } from 'lucide-react';
import { useBrandFlow } from '@/context/BrandFlowContext';
import { ContentType, SocialPlatform } from '@/lib/types';

export default function QuickAddPostModal() {
  const { 
    isQuickAddPostOpen, 
    setIsQuickAddPostOpen, 
    createContent, 
    brands, 
    team, 
    activeBrandId 
  } = useBrandFlow();

  const [title, setTitle] = useState('');
  const [brandId, setBrandId] = useState(activeBrandId === 'all' ? (brands[0]?.id || '') : activeBrandId);
  const [contentType, setContentType] = useState<ContentType>('Reel');
  const [platform, setPlatform] = useState<SocialPlatform>('Instagram');
  const [scheduledDate, setScheduledDate] = useState(new Date().toISOString().split('T')[0]);
  const [scheduledTime, setScheduledTime] = useState('18:30');
  const [caption, setCaption] = useState('');
  const [hashtags, setHashtags] = useState('');
  const [creativeLink, setCreativeLink] = useState('');
  const [assignedPublisher, setAssignedPublisher] = useState('Isha');
  const [assignedCreator, setAssignedCreator] = useState('Chandan');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isQuickAddPostOpen) return null;

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
      platform,
      scheduledDate,
      scheduledTime,
      caption: caption.trim(),
      hashtags: hashtags.trim(),
      creativeLink: creativeLink.trim(),
      approvalStatus: 'In Production',
      publishingStatus: 'Draft',
      assignedPublisher,
      assignedCreator,
      version: 1,
    });

    setIsSubmitting(false);
    setTitle('');
    setCaption('');
    setHashtags('');
    setCreativeLink('');
    setIsQuickAddPostOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-hover border border-surface-border w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between px-5 py-4 border-b border-surface-border bg-surface-subtle">
          <div className="flex items-center gap-2">
            <Send size={18} className="text-brand-500" />
            <h2 className="text-sm font-bold text-slate-primary">Schedule Social Media Content</h2>
          </div>
          <button 
            onClick={() => setIsQuickAddPostOpen(false)}
            className="p-1 rounded-md text-slate-muted hover:text-slate-primary hover:bg-white transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-primary mb-1">
              Content Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Royal Silk Lehengas Reel, Autumn Dessert Tasting Carousel..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full text-xs px-3 py-2 bg-surface-subtle border border-surface-border rounded-lg focus:outline-none focus:border-brand-500 text-slate-primary"
            />
          </div>

          {/* Brand & Content Type */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-primary mb-1">Brand</label>
              <select
                value={brandId}
                onChange={(e) => setBrandId(e.target.value)}
                className="w-full text-xs px-2.5 py-2 bg-surface-subtle border border-surface-border rounded-lg focus:outline-none focus:border-brand-500 text-slate-primary"
              >
                {brands.map(b => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-primary mb-1">Content Type</label>
              <select
                value={contentType}
                onChange={(e) => setContentType(e.target.value as ContentType)}
                className="w-full text-xs px-2.5 py-2 bg-surface-subtle border border-surface-border rounded-lg focus:outline-none focus:border-brand-500 text-slate-primary font-medium"
              >
                <option value="Reel">🎬 Reel (9:16)</option>
                <option value="Post">🖼️ Post / Graphic</option>
                <option value="Story">📱 Story</option>
                <option value="Carousel">📚 Carousel</option>
                <option value="Short Video">🎥 Short Video</option>
                <option value="Other">📄 Other</option>
              </select>
            </div>
          </div>

          {/* Platform & Date */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-primary mb-1">Platform</label>
              <select
                value={platform}
                onChange={(e) => setPlatform(e.target.value as SocialPlatform)}
                className="w-full text-xs px-2.5 py-2 bg-surface-subtle border border-surface-border rounded-lg focus:outline-none focus:border-brand-500 text-slate-primary"
              >
                <option value="Instagram">Instagram</option>
                <option value="Facebook">Facebook</option>
                <option value="LinkedIn">LinkedIn</option>
                <option value="YouTube">YouTube</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-primary mb-1">Scheduled Date</label>
              <input
                type="date"
                required
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                className="w-full text-xs px-2.5 py-2 bg-surface-subtle border border-surface-border rounded-lg focus:outline-none focus:border-brand-500 text-slate-primary"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-primary mb-1">Time</label>
              <input
                type="time"
                value={scheduledTime}
                onChange={(e) => setScheduledTime(e.target.value)}
                className="w-full text-xs px-2.5 py-2 bg-surface-subtle border border-surface-border rounded-lg focus:outline-none focus:border-brand-500 text-slate-primary"
              />
            </div>
          </div>

          {/* Creator & Publisher */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-primary mb-1">Assigned Creator / Editor</label>
              <select
                value={assignedCreator}
                onChange={(e) => setAssignedCreator(e.target.value)}
                className="w-full text-xs px-2.5 py-2 bg-surface-subtle border border-surface-border rounded-lg focus:outline-none focus:border-brand-500 text-slate-primary"
              >
                {team.map(m => (
                  <option key={m.id} value={m.name}>{m.name} ({m.department})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-primary mb-1">Assigned Publisher</label>
              <select
                value={assignedPublisher}
                onChange={(e) => setAssignedPublisher(e.target.value)}
                className="w-full text-xs px-2.5 py-2 bg-surface-subtle border border-surface-border rounded-lg focus:outline-none focus:border-brand-500 text-slate-primary"
              >
                {team.map(m => (
                  <option key={m.id} value={m.name}>{m.name} ({m.department})</option>
                ))}
              </select>
            </div>
          </div>

          {/* Caption */}
          <div>
            <label className="block text-xs font-semibold text-slate-primary mb-1">Draft Caption</label>
            <textarea
              rows={2}
              placeholder="Copywriting, opening hook, call to action..."
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              className="w-full text-xs px-3 py-2 bg-surface-subtle border border-surface-border rounded-lg focus:outline-none focus:border-brand-500 text-slate-primary"
            />
          </div>

          {/* Hashtags & Drive Link */}
          <div>
            <label className="block text-xs font-semibold text-slate-primary mb-1">Hashtags</label>
            <input
              type="text"
              placeholder="#BrandName #Autumn2026 #Festive #Luxury"
              value={hashtags}
              onChange={(e) => setHashtags(e.target.value)}
              className="w-full text-xs px-3 py-2 bg-surface-subtle border border-surface-border rounded-lg focus:outline-none focus:border-brand-500 text-slate-primary"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-primary mb-1">Drive / Video Cloud Link</label>
            <input
              type="url"
              placeholder="https://drive.google.com/file/d/... or Vimeo"
              value={creativeLink}
              onChange={(e) => setCreativeLink(e.target.value)}
              className="w-full text-xs px-3 py-2 bg-surface-subtle border border-surface-border rounded-lg focus:outline-none focus:border-brand-500 text-slate-primary"
            />
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-surface-border">
            <button
              type="button"
              onClick={() => setIsQuickAddPostOpen(false)}
              className="px-4 py-2 text-xs font-medium text-slate-muted hover:text-slate-primary transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-semibold bg-brand-500 hover:bg-brand-600 text-white rounded-lg shadow-sm transition-all disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : 'Add to Schedule'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
