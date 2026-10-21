'use client';

import React, { useState } from 'react';
import { X, Camera, Plus, Trash2 } from 'lucide-react';
import { useBrandFlow } from '@/context/BrandFlowContext';

export default function QuickAddShootModal() {
  const { 
    isQuickAddShootOpen, 
    setIsQuickAddShootOpen, 
    createShoot, 
    brands, 
    activeBrandId 
  } = useBrandFlow();

  const [title, setTitle] = useState('');
  const [brandId, setBrandId] = useState(activeBrandId === 'all' ? (brands[0]?.id || '') : activeBrandId);
  const [shootDate, setShootDate] = useState(new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0]);
  const [startTime, setStartTime] = useState('11:00');
  const [endTime, setEndTime] = useState('18:00');
  const [location, setLocation] = useState('');
  const [photographer, setPhotographer] = useState('');
  const [videographer, setVideographer] = useState('');
  const [rawDataLocation, setRawDataLocation] = useState('Google Drive / Raw Footage');
  const [shootBrief, setShootBrief] = useState('');
  const [shotList, setShotList] = useState<string[]>([]);
  const [newShot, setNewShot] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isQuickAddShootOpen) return null;

  const handleAddShot = () => {
    if (!newShot.trim()) return;
    setShotList(prev => [...prev, newShot.trim()]);
    setNewShot('');
  };

  const handleRemoveShot = (index: number) => {
    setShotList(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !brandId || !location.trim()) return;

    setIsSubmitting(true);
    const selectedBrand = brands.find(b => b.id === brandId);

    await createShoot({
      title: title.trim(),
      brandId,
      brandName: selectedBrand?.name || 'Brand',
      shootDate,
      startTime,
      endTime,
      location: location.trim(),
      photographer: photographer.trim(),
      videographer: videographer.trim(),
      rawDataLocation: rawDataLocation.trim(),
      shootBrief: shootBrief.trim(),
      shotList,
      status: 'Planned',
    });

    setIsSubmitting(false);
    setTitle('');
    setLocation('');
    setShootBrief('');
    setShotList([]);
    setIsQuickAddShootOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-hover border border-surface-border w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between px-5 py-4 border-b border-surface-border bg-surface-subtle">
          <div className="flex items-center gap-2">
            <Camera size={18} className="text-amber-500" />
            <h2 className="text-sm font-bold text-slate-primary">Schedule New Brand Shoot</h2>
          </div>
          <button 
            onClick={() => setIsQuickAddShootOpen(false)}
            className="p-1 rounded-md text-slate-muted hover:text-slate-primary hover:bg-white transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-primary mb-1">
              Shoot Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. HOF Festive Lehengas Shoot, Lafayette New Menu..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full text-xs px-3 py-2 bg-surface-subtle border border-surface-border rounded-lg focus:outline-none focus:border-brand-500 text-slate-primary"
            />
          </div>

          {/* Brand & Location */}
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
              <label className="block text-xs font-semibold text-slate-primary mb-1">
                Location <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="Studio 9, Bandra West / Cafe Indiranagar"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full text-xs px-3 py-2 bg-surface-subtle border border-surface-border rounded-lg focus:outline-none focus:border-brand-500 text-slate-primary"
              />
            </div>
          </div>

          {/* Date & Times */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-primary mb-1">Shoot Date</label>
              <input
                type="date"
                required
                value={shootDate}
                onChange={(e) => setShootDate(e.target.value)}
                className="w-full text-xs px-2.5 py-2 bg-surface-subtle border border-surface-border rounded-lg focus:outline-none focus:border-brand-500 text-slate-primary"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-primary mb-1">Start Time</label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full text-xs px-2.5 py-2 bg-surface-subtle border border-surface-border rounded-lg focus:outline-none focus:border-brand-500 text-slate-primary"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-primary mb-1">End Time</label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full text-xs px-2.5 py-2 bg-surface-subtle border border-surface-border rounded-lg focus:outline-none focus:border-brand-500 text-slate-primary"
              />
            </div>
          </div>

          {/* Photographer & Videographer */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-primary mb-1">Photographer</label>
              <input
                type="text"
                placeholder="Vikram Studios / Freelancer"
                value={photographer}
                onChange={(e) => setPhotographer(e.target.value)}
                className="w-full text-xs px-3 py-2 bg-surface-subtle border border-surface-border rounded-lg focus:outline-none focus:border-brand-500 text-slate-primary"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-primary mb-1">Videographer</label>
              <input
                type="text"
                placeholder="Rohan Sharma / In-house"
                value={videographer}
                onChange={(e) => setVideographer(e.target.value)}
                className="w-full text-xs px-3 py-2 bg-surface-subtle border border-surface-border rounded-lg focus:outline-none focus:border-brand-500 text-slate-primary"
              />
            </div>
          </div>

          {/* Raw Data Storage Location */}
          <div>
            <label className="block text-xs font-semibold text-slate-primary mb-1">
              Raw Footage Storage Destination
            </label>
            <input
              type="text"
              placeholder="e.g. Google Drive: /Raw Footage/Brand_Oct2026 or NAS Server"
              value={rawDataLocation}
              onChange={(e) => setRawDataLocation(e.target.value)}
              className="w-full text-xs px-3 py-2 bg-surface-subtle border border-surface-border rounded-lg focus:outline-none focus:border-brand-500 text-slate-primary"
            />
            <p className="text-[10px] text-slate-muted mt-1">
              When this shoot is marked Completed, BrandFlow will automatically trigger the Data Sorting workflow pointing editors to this destination.
            </p>
          </div>

          {/* Shoot Brief */}
          <div>
            <label className="block text-xs font-semibold text-slate-primary mb-1">Creative Brief & Moodboard</label>
            <textarea
              rows={2}
              placeholder="Lighting style, key angles, target reel hooks..."
              value={shootBrief}
              onChange={(e) => setShootBrief(e.target.value)}
              className="w-full text-xs px-3 py-2 bg-surface-subtle border border-surface-border rounded-lg focus:outline-none focus:border-brand-500 text-slate-primary"
            />
          </div>

          {/* Shot List */}
          <div>
            <label className="block text-xs font-semibold text-slate-primary mb-1.5">Shot List Items</label>
            <div className="space-y-1 mb-2">
              {shotList.map((shot, i) => (
                <div key={i} className="flex items-center justify-between text-xs bg-surface-subtle px-2.5 py-1.5 rounded border border-surface-border">
                  <span className="text-slate-primary">{i + 1}. {shot}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveShot(i)}
                    className="text-slate-muted hover:text-rose-500"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Add shot requirement (e.g. 360 spin with silk drape)..."
                value={newShot}
                onChange={(e) => setNewShot(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddShot(); } }}
                className="flex-1 text-xs px-3 py-1.5 bg-surface-subtle border border-surface-border rounded-lg focus:outline-none focus:border-brand-500 text-slate-primary"
              />
              <button
                type="button"
                onClick={handleAddShot}
                className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-lg transition-colors flex items-center gap-1"
              >
                <Plus size={13} />
                <span>Add Shot</span>
              </button>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-surface-border">
            <button
              type="button"
              onClick={() => setIsQuickAddShootOpen(false)}
              className="px-4 py-2 text-xs font-medium text-slate-muted hover:text-slate-primary transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-semibold bg-amber-500 hover:bg-amber-600 text-white rounded-lg shadow-sm transition-all disabled:opacity-50"
            >
              {isSubmitting ? 'Scheduling...' : 'Schedule Shoot'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
