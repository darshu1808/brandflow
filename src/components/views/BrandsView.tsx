'use client';

import React, { useState } from 'react';
import { 
  Briefcase, 
  Plus, 
  ExternalLink, 
  Share2, 
  FolderOpen, 
  Camera, 
  Trash2,
  FileSpreadsheet,
  X,
  Sparkles,
  ArrowUpRight
} from 'lucide-react';
import { useBrandFlow } from '@/context/BrandFlowContext';
import { Brand } from '@/lib/types';

export default function BrandsView() {
  const { 
    brands, 
    shoots, 
    content, 
    tasks,
    createBrand, 
    archiveBrand,
    activeBrandId,
    setActiveBrandId,
    setActiveTab,
    showToast 
  } = useBrandFlow();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New Brand Form State
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [tagline, setTagline] = useState('');
  const [postingSheetUrl, setPostingSheetUrl] = useState('');
  const [driveFolderUrl, setDriveFolderUrl] = useState('');
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [brandColor, setBrandColor] = useState('#6366F1');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddBrand = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    await createBrand({
      name: name.trim(),
      code: code.trim().toUpperCase() || name.substring(0, 3).toUpperCase(),
      tagline: tagline.trim(),
      brandColor: brandColor || '#6366F1',
      clientName: clientName.trim(),
      clientPhone: clientPhone.trim(),
      postingSheetUrl: postingSheetUrl.trim() || undefined,
      driveFolderUrl: driveFolderUrl.trim() || undefined,
      monthlyShootTarget: 2,
      managerId: 'me',
      managerName: 'Darsh'
    });

    setIsSubmitting(false);
    setIsAddModalOpen(false);
    setName('');
    setCode('');
    setTagline('');
    setPostingSheetUrl('');
    setDriveFolderUrl('');
    setClientName('');
    setClientPhone('');
    showToast({ type: 'success', title: 'Brand Workspace Created', description: name.trim() });
  };

  const visibleBrands = brands.filter(b => b.status !== 'archived');

  const handleDeleteBrand = async (id: string, name: string) => {
    if (confirm(`Delete brand "${name}"? This will permanently remove this brand.`)) {
      await archiveBrand(id);
    }
  };

  return (
    <div className="space-y-6 pb-16 max-w-6xl mx-auto">
      {/* Top Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-obsidian-950 via-slate-900 to-indigo-950 text-white p-6 sm:p-7 border border-white/10 shadow-elevated">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider bg-brand-500/20 text-brand-300 px-2.5 py-0.5 rounded-full border border-brand-500/30 flex items-center gap-1">
                <Briefcase size={12} />
                Client Portfolios
              </span>
              <span className="text-xs text-slate-400">{visibleBrands.length} Brands</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Brand Workspaces & Spreadsheets
            </h1>
            <p className="text-xs text-slate-300 max-w-xl">
              Clean, lightweight workspaces for each client brand. Quick links to their Google Sheets, shared Drive folders, and monthly 2-shoot quota targets.
            </p>
          </div>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold shadow-md shadow-brand-500/25 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
          >
            <Plus size={16} />
            <span>Add Brand</span>
          </button>
        </div>
      </div>

      {/* Brand Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {visibleBrands.map((b) => {
          const brandTasks = tasks.filter(t => t.brandId === b.id && t.status !== 'Done');
          const brandShoots = shoots.filter(s => s.brandId === b.id && s.status !== 'Completed');
          const isCurrentActive = activeBrandId === b.id;

          const sheetLink = b.postingSheetUrl || `https://docs.google.com/spreadsheets/d/e/2PACX-example-${b.name.toLowerCase()}`;

          return (
            <div
              key={b.id}
              className={`glass-card rounded-2xl border transition-all duration-200 overflow-hidden flex flex-col justify-between ${
                isCurrentActive 
                  ? 'ring-2 ring-brand-500/60 shadow-lg shadow-brand-500/10 border-brand-500' 
                  : 'border-slate-200 hover:border-slate-300 shadow-2xs'
              }`}
            >
              {/* Brand Accent Color Bar */}
              <div 
                className="h-1.5 w-full"
                style={{ backgroundColor: b.brandColor }}
              />

              <div className="p-5 space-y-4">
                {/* Brand Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <img 
                      src={b.logo} 
                      alt={b.name} 
                      className="w-12 h-12 rounded-xl object-cover border border-slate-200 shadow-xs bg-white p-0.5"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-bold text-slate-900">{b.name}</h3>
                        {isCurrentActive && (
                          <span className="text-[9px] font-bold uppercase tracking-wider bg-brand-50 text-brand-700 px-1.5 py-0.5 rounded border border-brand-200">
                            Active
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-400 line-clamp-1">{b.tagline || 'Brand Workspace'}</div>
                    </div>
                  </div>

                  <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-lg bg-slate-100 text-slate-700 border border-slate-200">
                    {b.code}
                  </span>
                </div>

                {/* Direct Links: Google Sheet & Drive */}
                <div className="space-y-2 pt-1">
                  <a
                    href={sheetLink}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full flex items-center justify-between p-2.5 bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-200 rounded-xl text-xs font-semibold text-emerald-900 transition-colors"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <FileSpreadsheet size={15} className="text-emerald-600 flex-shrink-0" />
                      <span className="truncate">Open Google Sheet</span>
                    </div>
                    <ExternalLink size={12} className="text-emerald-700 flex-shrink-0" />
                  </a>

                  {b.driveFolderUrl && (
                    <a
                      href={b.driveFolderUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="w-full flex items-center justify-between p-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 transition-colors"
                    >
                      <div className="flex items-center gap-2 truncate">
                        <FolderOpen size={14} className="text-brand-500 flex-shrink-0" />
                        <span className="truncate">Drive Assets</span>
                      </div>
                      <ExternalLink size={12} className="text-slate-400 flex-shrink-0" />
                    </a>
                  )}
                </div>

                {/* Monthly Shoot Quota & Active Load */}
                <div className="grid grid-cols-2 gap-2 text-center text-xs p-2.5 bg-slate-50 rounded-xl border border-slate-200/80">
                  <div>
                    <div className="text-[10px] text-purple-700 font-semibold uppercase">Monthly Shoots</div>
                    <div className="font-bold text-slate-800 text-sm mt-0.5">2 / Month</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-brand-700 font-semibold uppercase">Pending Tasks</div>
                    <div className="font-bold text-slate-800 text-sm mt-0.5">{brandTasks.length} active</div>
                  </div>
                </div>

                {/* Client Contact Info if provided */}
                {b.clientName && (
                  <div className="text-[11px] text-slate-500 pt-1">
                    Client: <strong className="text-slate-700">{b.clientName}</strong>
                    {b.clientPhone && <span className="font-mono text-slate-600"> • {b.clientPhone}</span>}
                  </div>
                )}
              </div>

              {/* Card Footer: Set Active Brand & Delete */}
              <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs">
                <button
                  onClick={() => {
                    setActiveBrandId(b.id);
                    setActiveTab('dashboard');
                  }}
                  className="font-bold text-brand-600 hover:text-brand-800 flex items-center gap-1 transition-colors"
                >
                  <span>Select Brand</span>
                  <ArrowUpRight size={13} />
                </button>

                <button
                  onClick={() => handleDeleteBrand(b.id, b.name)}
                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                  title="Delete brand"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Brand Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-elevated border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
              <div className="flex items-center gap-2">
                <Briefcase size={16} className="text-brand-600" />
                <h3 className="text-sm font-bold text-slate-900">Add Brand Workspace</h3>
              </div>
              <button onClick={() => setIsAddModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddBrand} className="p-6 space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Brand Name *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. HOF / Acme"
                    className="w-full text-xs px-3.5 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Code</label>
                  <input
                    type="text"
                    maxLength={5}
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="HOF"
                    className="w-full text-xs px-3.5 py-2.5 border border-slate-300 rounded-xl focus:outline-none uppercase font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Google Sheet URL (Content & Schedule)</label>
                <input
                  type="url"
                  value={postingSheetUrl}
                  onChange={(e) => setPostingSheetUrl(e.target.value)}
                  placeholder="https://docs.google.com/spreadsheets/d/..."
                  className="w-full text-xs px-3.5 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Google Drive Folder URL</label>
                <input
                  type="url"
                  value={driveFolderUrl}
                  onChange={(e) => setDriveFolderUrl(e.target.value)}
                  placeholder="https://drive.google.com/..."
                  className="w-full text-xs px-3.5 py-2.5 border border-slate-300 rounded-xl focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Client Contact Name</label>
                  <input
                    type="text"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    placeholder="e.g. Mr. Sharma"
                    className="w-full text-xs px-3.5 py-2.5 border border-slate-300 rounded-xl focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Phone</label>
                  <input
                    type="text"
                    value={clientPhone}
                    onChange={(e) => setClientPhone(e.target.value)}
                    placeholder="+91 ..."
                    className="w-full text-xs px-3.5 py-2.5 border border-slate-300 rounded-xl focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Brand Color</label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={brandColor}
                    onChange={(e) => setBrandColor(e.target.value)}
                    className="w-9 h-9 p-0.5 rounded-lg border border-slate-300 cursor-pointer"
                  />
                  <div className="flex gap-2">
                    {['#3156D3', '#D97706', '#10B981', '#EC4899', '#8B5CF6'].map(col => (
                      <button
                        key={col}
                        type="button"
                        onClick={() => setBrandColor(col)}
                        className="w-6 h-6 rounded-full border border-black/10 hover:scale-110 transition-transform"
                        style={{ backgroundColor: col }}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-brand-500/20 disabled:opacity-50"
                >
                  Create Workspace
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
