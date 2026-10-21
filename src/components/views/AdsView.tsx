'use client';

import React, { useState } from 'react';
import { 
  BarChart3, 
  Plus, 
  CheckCircle2, 
  Calendar, 
  Clock, 
  Check, 
  Trash2,
  ExternalLink,
  Target,
  Sparkles,
  X,
  BellRing,
  ArrowRight
} from 'lucide-react';
import { useBrandFlow } from '@/context/BrandFlowContext';
import { AdCampaign } from '@/lib/types';

export default function AdsView() {
  const { 
    ads, 
    brands, 
    activeBrandId, 
    createAd, 
    updateAd,
    deleteAd,
    tasks,
    currentUser,
    showToast 
  } = useBrandFlow();

  const todayStr = new Date().toISOString().split('T')[0];
  const defaultEndStr = new Date(Date.now() + 9 * 86400000).toISOString().split('T')[0];

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedBrandFilter, setSelectedBrandFilter] = useState<string>(activeBrandId);

  // New Ad Campaign & Timeline Form
  const [campaignName, setCampaignName] = useState('');
  const [brandId, setBrandId] = useState(activeBrandId === 'all' ? (brands[0]?.id || '') : activeBrandId);
  const [platform, setPlatform] = useState<'Meta Ads' | 'Google Ads' | 'LinkedIn Ads' | 'YouTube Ads' | 'Other'>('Meta Ads');
  const [startDate, setStartDate] = useState(todayStr);
  const [endDate, setEndDate] = useState(defaultEndStr);
  const [budget, setBudget] = useState<string>('');
  const [objective, setObjective] = useState<string>('Leads / Conversions');
  const [notes, setNotes] = useState('');

  const filteredAds = ads.filter(a => {
    if (activeBrandId !== 'all' && a.brandId !== activeBrandId) return false;
    if (selectedBrandFilter !== 'all' && a.brandId !== selectedBrandFilter) return false;
    return true;
  });

  // Calculate live preview checkpoints based on duration
  const getCheckpointsPreview = (startStr: string, endStr: string) => {
    if (!startStr || !endStr) return { totalDays: 0, checkpoints: [] };
    const start = new Date(startStr);
    const end = new Date(endStr);
    const diffTime = Math.max(0, end.getTime() - start.getTime());
    const totalDays = Math.max(1, Math.round(diffTime / (1000 * 60 * 60 * 24)) + 1);

    let followUpCount = 1;
    if (totalDays <= 3) followUpCount = 1;
    else if (totalDays <= 5) followUpCount = 2;
    else if (totalDays <= 10) followUpCount = 3;
    else if (totalDays <= 20) followUpCount = 6;
    else followUpCount = Math.min(8, Math.ceil(totalDays / 4));

    const checkpoints: { dateStr: string; label: string; index: number }[] = [];
    const seen = new Set<string>();

    for (let i = 1; i <= followUpCount; i++) {
      const dayOffset = Math.round((i / followUpCount) * totalDays);
      const d = new Date(start);
      d.setDate(d.getDate() + (dayOffset - 1));
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const dateKey = `${y}-${m}-${day}`;

      if (!seen.has(dateKey)) {
        seen.add(dateKey);
        let label = `Follow-up #${i}`;
        if (i === 1) label = `Check #1: Initial Traction & CPL`;
        else if (i === followUpCount) label = `Check #${i}: Final Performance & ROI`;
        else if (i === Math.floor(followUpCount / 2)) label = `Check #${i}: Mid CTR & Creative`;
        else label = `Check #${i}: Performance Review`;

        checkpoints.push({ dateStr: dateKey, label, index: i });
      }
    }

    return { totalDays, checkpoints };
  };

  const preview = getCheckpointsPreview(startDate, endDate);

  const handleCreateAdCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!campaignName.trim() || !brandId) return;

    const brandObj = brands.find(b => b.id === brandId) || brands[0];

    const result = await createAd({
      name: campaignName.trim(),
      brandId: brandObj.id,
      brandName: brandObj.name,
      platform,
      budget: Number(budget) || 0,
      objective: objective as any,
      status: 'Active',
      startDate,
      endDate,
      campaignManager: currentUser.name,
      notes: notes.trim()
    });

    if (result) {
      setCampaignName('');
      setNotes('');
      setBudget('');
      setIsAddModalOpen(false);
      showToast({ 
        type: 'success', 
        title: 'Ad Campaign & Follow-ups Scheduled! 🚀', 
        description: `${preview.checkpoints.length} follow-up tasks auto-synced to Calendar & To-Do.` 
      });
    }
  };

  const handleMarkAnalyzed = async (ad: AdCampaign) => {
    const isDone = ad.status === 'Completed';
    await updateAd({
      id: ad.id,
      status: isDone ? 'Active' : 'Completed'
    });
    showToast({ 
      type: 'success', 
      title: isDone ? 'Campaign Re-activated' : 'Ad Campaign Completed ✓', 
      description: `${ad.brandName} - ${ad.name}` 
    });
  };

  const handleDeleteCampaign = async (id: string, name: string) => {
    if (confirm(`Delete campaign "${name}" and its associated follow-up tasks?`)) {
      await deleteAd(id);
      showToast({ type: 'info', title: 'Campaign Deleted', description: name });
    }
  };

  return (
    <div className="space-y-6 pb-16 max-w-5xl mx-auto">
      {/* Top Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-obsidian-950 via-slate-900 to-indigo-950 text-white p-6 sm:p-7 border border-white/10 shadow-elevated">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider bg-indigo-500/20 text-indigo-300 px-2.5 py-0.5 rounded-full border border-indigo-500/30 flex items-center gap-1">
                <BarChart3 size={12} />
                Ads Follow-up Engine
              </span>
              <span className="text-xs text-slate-400">Automated Performance Checkpoints</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Ads Follow-Up Schedule
            </h1>
            <p className="text-xs text-slate-300 max-w-xl">
              Schedule your ad campaign timeline. BrandFlow automatically calculates fundamental checkpoints (1-3 days: 1 check, 4-5 days: 2 checks, 6-10 days: 3 checks, 11-20 days: 6 checks) and auto-syncs them into your Daily To-Do list and Calendar.
            </p>
          </div>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-brand-600 hover:from-indigo-500 hover:to-brand-500 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-500/25 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
          >
            <Plus size={16} />
            <span>Launch Ad Follow-Up</span>
          </button>
        </div>
      </div>

      {/* Filter and Overview */}
      <div className="glass-card rounded-2xl overflow-hidden shadow-card border border-slate-200">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Active Campaigns & Checkpoints ({filteredAds.length})
            </h3>
          </div>

          <select
            value={selectedBrandFilter}
            onChange={(e) => setSelectedBrandFilter(e.target.value)}
            className="text-xs font-semibold px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-slate-700 focus:outline-none shadow-2xs"
          >
            <option value="all">All Brands</option>
            {brands.map(b => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>
        </div>

        <div className="divide-y divide-slate-100">
          {filteredAds.length === 0 ? (
            <div className="p-10 text-center text-xs text-slate-400">
              No ad campaigns scheduled. Click &quot;Launch Ad Follow-Up&quot; above to add one.
            </div>
          ) : (
            filteredAds.map((ad) => {
              const isDone = ad.status === 'Completed';
              const checkpoints = ad.analysisDates || [];

              return (
                <div 
                  key={ad.id}
                  className={`p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/80 transition-colors ${
                    isDone ? 'bg-slate-50/50 opacity-75' : ''
                  }`}
                >
                  <div className="flex items-start gap-3.5 min-w-0 flex-1">
                    <button
                      onClick={() => handleMarkAnalyzed(ad)}
                      className="text-slate-300 hover:text-emerald-500 transition-colors flex-shrink-0 mt-0.5"
                      title={isDone ? 'Mark Active' : 'Mark Completed'}
                    >
                      {isDone ? <CheckCircle2 size={20} className="text-emerald-500" /> : <div className="w-5 h-5 rounded-full border-2 border-slate-300 hover:border-indigo-500" />}
                    </button>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-1.5">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-brand-50 text-brand-700 border border-brand-200">
                          {ad.brandName}
                        </span>
                        <span className="text-[10px] font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                          {ad.platform}
                        </span>
                        <span className="text-[10px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                          📅 {ad.startDate} → {ad.endDate}
                        </span>
                        {isDone && (
                          <span className="text-[9px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">
                            Completed
                          </span>
                        )}
                      </div>

                      <div className={`text-sm font-bold ${isDone ? 'line-through text-slate-400' : 'text-slate-900'}`}>
                        {ad.name}
                      </div>

                      {/* Scheduled Checkpoints Badges */}
                      {checkpoints.length > 0 && (
                        <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1 mr-1">
                            <BellRing size={11} className="text-indigo-500" />
                            Checkpoints:
                          </span>
                          {checkpoints.map((cpDate, idx) => {
                            const isToday = cpDate === todayStr;
                            const isPast = cpDate < todayStr;
                            return (
                              <span
                                key={cpDate}
                                className={`text-[10px] font-semibold px-2 py-0.5 rounded-lg border flex items-center gap-1 ${
                                  isToday
                                    ? 'bg-amber-100 text-amber-800 border-amber-300 font-bold animate-pulse'
                                    : isPast
                                    ? 'bg-slate-100 text-slate-500 border-slate-200'
                                    : 'bg-indigo-50 text-indigo-700 border-indigo-200'
                                }`}
                              >
                                #{idx + 1}: {cpDate} {isToday && '🔥 Today'}
                              </span>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right Actions */}
                  <div className="flex items-center gap-2 flex-shrink-0 self-end md:self-center">
                    <button
                      onClick={() => handleMarkAnalyzed(ad)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                        isDone
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                          : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs'
                      }`}
                    >
                      <Check size={13} />
                      <span>{isDone ? 'Completed ✓' : 'Mark Done'}</span>
                    </button>

                    <button
                      onClick={() => handleDeleteCampaign(ad.id, ad.name)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Delete Campaign & Checkpoints"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Add Ad Campaign Modal with Timeline & Live Checkpoint Preview */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-elevated border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
              <div className="flex items-center gap-2">
                <BarChart3 size={16} className="text-indigo-600" />
                <h3 className="text-sm font-bold text-slate-900">Launch Ad Follow-Up Campaign</h3>
              </div>
              <button onClick={() => setIsAddModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateAdCampaign} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Campaign Name *</label>
                <input
                  type="text"
                  required
                  value={campaignName}
                  onChange={(e) => setCampaignName(e.target.value)}
                  placeholder="e.g. Diwal / Winter Meta Lead Campaign"
                  className="w-full text-xs px-3.5 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Brand *</label>
                  <select
                    value={brandId}
                    onChange={(e) => setBrandId(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl focus:outline-none bg-white"
                  >
                    {brands.map(b => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Platform</label>
                  <select
                    value={platform}
                    onChange={(e: any) => setPlatform(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl focus:outline-none bg-white"
                  >
                    <option value="Meta Ads">Meta Ads (FB/IG)</option>
                    <option value="Google Ads">Google Ads</option>
                    <option value="LinkedIn Ads">LinkedIn Ads</option>
                    <option value="YouTube Ads">YouTube Ads</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              {/* Start Date & End Date Inputs */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Start Date *</label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">End Date *</label>
                  <input
                    type="date"
                    required
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl focus:outline-none"
                  />
                </div>
              </div>

              {/* Live Follow-up Checkpoints Calculation Preview */}
              <div className="p-3.5 bg-indigo-50/60 rounded-xl border border-indigo-100 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-indigo-900 flex items-center gap-1.5">
                    <Sparkles size={14} className="text-indigo-600" />
                    ⚡ {preview.checkpoints.length} Follow-up Checkpoint{preview.checkpoints.length > 1 ? 's' : ''} Calculated
                  </span>
                  <span className="text-[11px] font-semibold text-indigo-600 bg-white px-2 py-0.5 rounded-full border border-indigo-200">
                    Duration: {preview.totalDays} Days
                  </span>
                </div>

                <div className="space-y-1 pt-1 max-h-32 overflow-y-auto pr-1 custom-scrollbar">
                  {preview.checkpoints.map(cp => (
                    <div key={cp.dateStr} className="flex items-center justify-between text-[11px] bg-white px-2.5 py-1 rounded-lg border border-indigo-100">
                      <span className="font-medium text-slate-700">{cp.label}</span>
                      <span className="font-bold text-indigo-700 font-mono">{cp.dateStr}</span>
                    </div>
                  ))}
                </div>

                <p className="text-[10px] text-indigo-500 pt-0.5">
                  ✓ Automatically synced to your Calendar, Daily Dashboard, and To-Do list on these exact dates.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Notes / Optimization Target (Optional)</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Target CPL under ₹40, monitor creatives CTR."
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl focus:outline-none"
                />
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
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-indigo-500/20"
                >
                  Confirm & Schedule →
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
