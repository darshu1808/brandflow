'use client';

import React, { useState } from 'react';
import { 
  Send, 
  Plus, 
  Calendar, 
  ExternalLink, 
  Trash2,
  FileSpreadsheet,
  Edit2,
  X,
  CheckCircle2,
  Sparkles,
  Video,
  Image as ImageIcon,
  Zap,
  Loader2
} from 'lucide-react';
import { useBrandFlow } from '@/context/BrandFlowContext';
import { ContentItem } from '@/lib/types';
import { formatDateKey, parseSheetRow } from '@/lib/postingUtils';

export default function PostingView() {
  const { 
    content, 
    brands, 
    activeBrandId, 
    createContent,
    updateContent,
    deleteContent,
    deleteContentByBrand,
    syncSheetLive,
    updateBrand,
    showToast 
  } = useBrandFlow();

  const visibleBrands = brands.filter(b => b.status !== 'archived');
  const [selectedBrandFilter, setSelectedBrandFilter] = useState<string>(activeBrandId);
  const [isAddPostOpen, setIsAddPostOpen] = useState(false);
  const [isImportSheetOpen, setIsImportSheetOpen] = useState(false);
  const [importBrandId, setImportBrandId] = useState(visibleBrands[0]?.id || 'b-1');
  const [overwriteExisting, setOverwriteExisting] = useState(true);
  const [pastedSheetData, setPastedSheetData] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const [isSyncingLiveId, setIsSyncingLiveId] = useState<string | null>(null);
  const [editingSheetBrand, setEditingSheetBrand] = useState<{ id: string; name: string; url: string } | null>(null);

  // New Post Form State
  const [postTitle, setPostTitle] = useState('');
  const [postBrandId, setPostBrandId] = useState(visibleBrands[0]?.id || 'b-1');
  const [postDate, setPostDate] = useState(formatDateKey(new Date()));
  const [postType, setPostType] = useState<'Reel' | 'Graphic' | 'Carousel' | 'Story'>('Reel');

  const todayStr = formatDateKey(new Date());

  // Real-time preview of parsed rows from pasted text
  const previewRows = pastedSheetData
    .split('\n')
    .map(line => parseSheetRow(line, new Date()))
    .filter((p): p is NonNullable<typeof p> => Boolean(p));

  // Filter content & sort: by scheduledDate first, then Unposted (0) on top, Posted (1) sinks to bottom
  const filteredContent = content.filter((c) => {
    if (activeBrandId !== 'all' && c.brandId !== activeBrandId) return false;
    if (selectedBrandFilter !== 'all' && c.brandId !== selectedBrandFilter) return false;
    return true;
  }).sort((a, b) => {
    const dateComp = a.scheduledDate.localeCompare(b.scheduledDate);
    if (dateComp !== 0) return dateComp;
    const aPosted = a.publishingStatus === 'Published' ? 1 : 0;
    const bPosted = b.publishingStatus === 'Published' ? 1 : 0;
    if (aPosted !== bPosted) return aPosted - bPosted;
    return a.title.localeCompare(b.title);
  });

  // 1-Click Live Sync from Google Sheet
  const handleLiveSync = async (brandIdToSync: string) => {
    setIsSyncingLiveId(brandIdToSync);
    try {
      await syncSheetLive(brandIdToSync, false);
    } finally {
      setIsSyncingLiveId(null);
    }
  };

  // Handle Sheet Import with Overwrite option (Paste Modal)
  const handleImportSheet = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pastedSheetData.trim()) return;

    setIsImporting(true);
    const targetBrand = visibleBrands.find(b => b.id === importBrandId) || visibleBrands[0];

    // If overwrite checked, clear this brand's existing posts first
    if (overwriteExisting) {
      await deleteContentByBrand(targetBrand.id);
    }

    const lines = pastedSheetData.trim().split('\n');
    let importedCount = 0;

    for (const line of lines) {
      const parsed = parseSheetRow(line, new Date());
      if (parsed) {
        await createContent({
          title: parsed.title,
          brandId: targetBrand.id,
          brandName: targetBrand.name,
          contentType: parsed.contentType,
          platform: 'Instagram',
          scheduledDate: parsed.date,
          scheduledTime: '06:00 PM',
          caption: 'Imported from Google Sheet',
          approvalStatus: 'Approved',
          publishingStatus: parsed.isPosted ? 'Published' : 'Scheduled',
          assignedPublisher: 'Me',
          assignedCreator: 'Content Team',
          version: 1
        });
        importedCount++;
      }
    }

    setIsImporting(false);
    setIsImportSheetOpen(false);
    setPastedSheetData('');
    showToast({
      type: 'success',
      title: 'Google Sheet Sync Complete! ✓',
      description: `Successfully captured ${importedCount} postings for ${targetBrand.name}.`
    });
  };

  // 1-Click Toggle "Mark as Posted"
  const handleTogglePosted = async (post: ContentItem) => {
    const isAlreadyPosted = post.publishingStatus === 'Published';
    await updateContent({
      id: post.id,
      publishingStatus: isAlreadyPosted ? 'Scheduled' : 'Published'
    });
    showToast({
      type: 'success',
      title: isAlreadyPosted ? 'Marked as Scheduled' : 'Marked as Posted! ✓',
      description: `"${post.title}" (${post.brandName})`
    });
  };

  // Delete All Posts for selected brand or all
  const handleDeleteAllPosts = async () => {
    const brandName = selectedBrandFilter === 'all' 
      ? 'ALL brands' 
      : visibleBrands.find(b => b.id === selectedBrandFilter)?.name || 'this brand';

    if (confirm(`Delete all scheduled postings for ${brandName}? This will clear them so you can re-paste fresh data from Google Sheet.`)) {
      await deleteContentByBrand(selectedBrandFilter);
    }
  };

  // Manual Add Post
  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!postTitle.trim()) return;

    const brandObj = visibleBrands.find(b => b.id === postBrandId) || visibleBrands[0];

    await createContent({
      title: postTitle.trim(),
      brandId: brandObj.id,
      brandName: brandObj.name,
      contentType: postType,
      platform: 'Instagram',
      scheduledDate: postDate,
      scheduledTime: '06:00 PM',
      caption: '',
      hashtags: '',
      approvalStatus: 'Approved',
      publishingStatus: 'Draft',
      assignedPublisher: 'Me',
      assignedCreator: 'Content Team',
      version: 1
    });

    setPostTitle('');
    setIsAddPostOpen(false);
    showToast({ type: 'success', title: 'Post Added', description: postTitle.trim() });
  };

  const handleSaveSheetUrl = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSheetBrand) return;

    await updateBrand({
      id: editingSheetBrand.id,
      postingSheetUrl: editingSheetBrand.url.trim()
    });

    showToast({ type: 'success', title: 'Google Sheet Link Saved', description: editingSheetBrand.name });
    setEditingSheetBrand(null);
  };

  return (
    <div className="space-y-6 pb-16 max-w-6xl mx-auto">
      {/* Top Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-obsidian-950 via-slate-900 to-indigo-950 text-white p-6 sm:p-7 border border-white/10 shadow-elevated">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 px-2.5 py-0.5 rounded-full border border-emerald-500/30 flex items-center gap-1">
                <Send size={12} />
                Posting Sync
              </span>
              <span className="text-xs text-slate-400">Google Sheet Dates, Reels & Graphics</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Posting Schedule & Google Sheet Sync
            </h1>
            <p className="text-xs text-slate-300 max-w-xl">
              Sync your monthly Google Sheets with Date, Type (Reel / Graphic) and Topic. 1-click &quot;Mark as Posted&quot; tracking.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => {
                const targetBrandId = selectedBrandFilter !== 'all' ? selectedBrandFilter : visibleBrands[0]?.id;
                if (targetBrandId) handleLiveSync(targetBrandId);
              }}
              disabled={isSyncingLiveId !== null}
              className="flex items-center gap-2 px-3.5 py-2.5 bg-gradient-to-r from-amber-500 to-emerald-600 hover:from-amber-400 hover:to-emerald-500 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-500/20 transition-all disabled:opacity-50"
              title="1-Click fetch and sync latest rows live from Google Sheet"
            >
              {isSyncingLiveId ? (
                <Loader2 size={15} className="animate-spin" />
              ) : (
                <Zap size={15} />
              )}
              <span>1-Click Live Sync</span>
            </button>

            <button
              onClick={() => setIsImportSheetOpen(true)}
              className="flex items-center gap-2 px-3.5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-500/25 transition-all"
            >
              <FileSpreadsheet size={15} />
              <span>Paste from Sheet</span>
            </button>

            <button
              onClick={() => setIsAddPostOpen(true)}
              className="flex items-center gap-2 px-3.5 py-2.5 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-xl text-xs font-bold transition-all backdrop-blur-sm"
            >
              <Plus size={15} />
              <span>Add Manually</span>
            </button>
          </div>
        </div>
      </div>

      {/* Brand Google Sheets Direct Link Section */}
      <div className="glass-card rounded-2xl border border-slate-200/90 p-5 space-y-3 shadow-subtle">
        <div className="flex items-center justify-between pb-2 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <FileSpreadsheet size={16} className="text-emerald-600" />
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Brand Google Sheets (Quick 1-Click Live Sync &amp; Open)
            </h3>
          </div>
          <span className="text-[11px] text-slate-400">Click ⚡ 1-Click Sync to fetch rows directly, or Open to view</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {visibleBrands.map((b) => {
            const sheetUrl = b.postingSheetUrl || `https://docs.google.com/spreadsheets/d/e/2PACX-example-${b.name.toLowerCase()}`;
            const isThisSyncing = isSyncingLiveId === b.id;

            return (
              <div 
                key={b.id}
                className="p-3 bg-white rounded-xl border border-slate-200 hover:border-emerald-300 shadow-2xs flex items-center justify-between gap-2 transition-all"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: b.brandColor }} />
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-slate-800 truncate">{b.name} Sheet</div>
                    <a 
                      href={sheetUrl} 
                      target="_blank" 
                      rel="noreferrer" 
                      className="text-[10px] text-emerald-600 font-semibold hover:underline flex items-center gap-1 mt-0.5"
                    >
                      <span>Open Sheet</span>
                      <ExternalLink size={10} />
                    </a>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <button
                    onClick={() => handleLiveSync(b.id)}
                    disabled={isThisSyncing}
                    className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-lg text-[10px] font-bold transition-all flex items-center gap-1 disabled:opacity-50"
                    title="1-Click fetch and sync postings directly from this Google Sheet"
                  >
                    {isThisSyncing ? (
                      <>
                        <Loader2 size={10} className="animate-spin text-emerald-600" />
                        <span>Syncing...</span>
                      </>
                    ) : (
                      <>
                        <Zap size={10} className="text-emerald-600" />
                        <span>1-Click Sync</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => setEditingSheetBrand({ id: b.id, name: b.name, url: b.postingSheetUrl || '' })}
                    className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                    title="Edit Google Sheet Link"
                  >
                    <Edit2 size={13} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Posts Schedule List */}
      <div className="glass-card rounded-2xl overflow-hidden shadow-card border border-slate-200">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Posting List ({filteredContent.length})
            </h3>
            <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
              {filteredContent.filter(c => c.publishingStatus !== 'Published').length} To Post
            </span>
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              {filteredContent.filter(c => c.publishingStatus === 'Published').length} Posted ✓
            </span>
            <span className="text-[11px] text-slate-400">• Sorted by Date</span>
          </div>

          <div className="flex items-center gap-2">
            {/* Brand Filter */}
            <select
              value={selectedBrandFilter}
              onChange={(e) => setSelectedBrandFilter(e.target.value)}
              className="text-xs font-semibold px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-slate-700 focus:outline-none shadow-2xs"
            >
              <option value="all">All Brands</option>
              {visibleBrands.map(b => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>

            {/* Delete All / Clear Brand Posts Button */}
            {filteredContent.length > 0 && (
              <button
                onClick={handleDeleteAllPosts}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold transition-colors"
                title="Delete all posts for selected brand"
              >
                <Trash2 size={13} />
                <span>Delete All</span>
              </button>
            )}
          </div>
        </div>

        <div className="divide-y divide-slate-100">
          {filteredContent.length === 0 ? (
            <div className="p-12 text-center text-xs text-slate-400 space-y-2">
              <div className="text-base">📅 No postings scheduled.</div>
              <p>Click <strong>&quot;Capture / Sync from Sheet&quot;</strong> above to copy-paste rows directly from your Google Sheet.</p>
            </div>
          ) : (
            filteredContent.map((post) => {
              const isPosted = post.publishingStatus === 'Published';
              const isToday = post.scheduledDate === todayStr;

              return (
                <div 
                  key={post.id}
                  className={`p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/70 transition-all ${
                    isPosted ? 'bg-emerald-50/20' : ''
                  }`}
                >
                  {/* Left: Date, Type, Brand, Title */}
                  <div className="flex items-start sm:items-center gap-3 flex-1 min-w-0">
                    {/* Date Block */}
                    <div className="w-24 flex-shrink-0 text-left font-mono">
                      <div className="text-xs font-bold text-slate-800 flex items-center gap-1">
                        <Calendar size={12} className="text-slate-400" />
                        <span>{post.scheduledDate}</span>
                      </div>
                      {isToday && (
                        <span className="text-[9px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded font-sans inline-block mt-0.5">
                          Today
                        </span>
                      )}
                    </div>

                    {/* Brand Badge */}
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200 flex-shrink-0">
                      {post.brandName}
                    </span>

                    {/* Content Type Badge */}
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg flex items-center gap-1 flex-shrink-0 ${
                      post.contentType === 'Reel'
                        ? 'bg-purple-100 text-purple-800 border border-purple-200'
                        : 'bg-indigo-100 text-indigo-800 border border-indigo-200'
                    }`}>
                      {post.contentType === 'Reel' ? <Video size={11} /> : <ImageIcon size={11} />}
                      <span>{post.contentType === 'Reel' ? 'Reel' : 'Graphic (LI)'}</span>
                    </span>

                    {/* Post Name / Topic */}
                    <div className="min-w-0 flex-1">
                      <div className={`text-xs truncate ${isPosted ? 'text-slate-500 line-through' : 'text-slate-900 font-bold'}`}>
                        {post.title}
                      </div>
                    </div>
                  </div>

                  {/* Right: Mark as Posted & Delete */}
                  <div className="flex items-center gap-2 self-end sm:self-center flex-shrink-0">
                    <button
                      onClick={() => handleTogglePosted(post)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                        isPosted
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200 hover:bg-emerald-200'
                          : 'bg-slate-900 hover:bg-slate-800 text-white shadow-xs'
                      }`}
                    >
                      <CheckCircle2 size={13} className={isPosted ? 'text-emerald-700' : 'text-slate-300'} />
                      <span>{isPosted ? 'Posted ✓' : 'Mark as Posted'}</span>
                    </button>

                    <button
                      onClick={() => deleteContent(post.id)}
                      className="p-1.5 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Delete post"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Google Sheet Smart Sync Modal */}
      {isImportSheetOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-elevated border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-emerald-50/50">
              <div className="flex items-center gap-2">
                <FileSpreadsheet size={18} className="text-emerald-600" />
                <h3 className="text-sm font-bold text-slate-900">Sync Data from Google Sheet</h3>
              </div>
              <button onClick={() => setIsImportSheetOpen(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleImportSheet} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Target Brand *</label>
                <select
                  value={importBrandId}
                  onChange={(e) => setImportBrandId(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl focus:outline-none bg-white font-medium"
                >
                  {visibleBrands.map(b => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              </div>

              {/* Overwrite Checkbox */}
              <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 bg-slate-50 p-2.5 rounded-xl border border-slate-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={overwriteExisting}
                  onChange={(e) => setOverwriteExisting(e.target.checked)}
                  className="rounded text-brand-600 focus:ring-brand-500"
                />
                <span>Clear & overwrite previous posts for this brand before importing</span>
              </label>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-slate-700">
                    Paste Columns from Google Sheet *
                  </label>
                  <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-mono">
                    Date • Reel/Graphic • Concept Name
                  </span>
                </div>
                <textarea
                  rows={6}
                  required
                  value={pastedSheetData}
                  onChange={(e) => setPastedSheetData(e.target.value)}
                  placeholder={`Example from your sheet:\n21-Oct\tLI - Pesto paneer\n22-Oct\tLI - Falafel\n23-Oct\tReel\tPizza preparation\n24-Oct\tGraphic\tFruit punch`}
                  className="w-full text-xs font-mono p-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 bg-slate-50 text-slate-800"
                />
                <p className="text-[11px] text-slate-500 mt-1.5 leading-relaxed">
                  💡 <strong>Tip:</strong> Dates support <code>21-Oct</code>, <code>21/10/2026</code>, <code>21st Oct</code>, or day <code>21</code>. Words recognized: <code>Reel</code>, <code>LI</code>, <code>Graphic</code>.
                </p>

                {/* Real-Time Live Preview of Parsed Rows */}
                {previewRows.length > 0 && (
                  <div className="bg-emerald-50/60 border border-emerald-200 rounded-xl p-3 space-y-2 mt-2">
                    <div className="flex items-center justify-between text-xs font-bold text-emerald-900">
                      <span className="flex items-center gap-1.5">
                        <CheckCircle2 size={14} className="text-emerald-600" />
                        {previewRows.length} Posts Detected
                      </span>
                      <span className="text-[10px] text-slate-500 font-normal">
                        Verified Date &amp; Format
                      </span>
                    </div>
                    <div className="max-h-36 overflow-y-auto divide-y divide-emerald-200/50 text-[11px] font-mono">
                      {previewRows.slice(0, 10).map((p, idx) => (
                        <div key={idx} className="py-1 flex items-center justify-between gap-2">
                          <span className="font-bold text-slate-800">{p.date}</span>
                          <span className={`px-1.5 py-0.2 rounded font-sans font-bold text-[9px] ${
                            p.contentType === 'Reel' ? 'bg-purple-100 text-purple-700' : 'bg-indigo-100 text-indigo-700'
                          }`}>
                            {p.contentType === 'Reel' ? '🎬 Reel' : '🖼️ Graphic (LI)'}
                          </span>
                          <span className="truncate flex-1 text-slate-700 font-sans">{p.title}</span>
                          {p.isPosted && (
                            <span className="text-[9px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.2 rounded flex-shrink-0">
                              Posted ✓
                            </span>
                          )}
                        </div>
                      ))}
                      {previewRows.length > 10 && (
                        <div className="text-[10px] text-slate-400 pt-1 text-center font-sans">
                          + {previewRows.length - 10} more rows ready to sync
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsImportSheetOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isImporting || !pastedSheetData.trim()}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-emerald-500/20 disabled:opacity-50 flex items-center gap-2"
                >
                  <FileSpreadsheet size={14} />
                  <span>{isImporting ? 'Syncing...' : 'Sync & Save Posts'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Manual Add Post Modal */}
      {isAddPostOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-elevated border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
              <h3 className="text-sm font-bold text-slate-900">Add Post to Schedule</h3>
              <button onClick={() => setIsAddPostOpen(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreatePost} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Brand *</label>
                <select
                  value={postBrandId}
                  onChange={(e) => setPostBrandId(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl focus:outline-none bg-white font-medium"
                >
                  {visibleBrands.map(b => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Content Type *</label>
                <select
                  value={postType}
                  onChange={(e: any) => setPostType(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl bg-white font-medium"
                >
                  <option value="Reel">🎬 Reel</option>
                  <option value="Graphic">🖼️ Graphic</option>
                  <option value="Carousel">🎠 Carousel</option>
                  <option value="Story">📱 Story</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Post Name / Topic *</label>
                <input
                  type="text"
                  required
                  value={postTitle}
                  onChange={(e) => setPostTitle(e.target.value)}
                  placeholder="e.g. Do minute mein banao"
                  className="w-full text-xs px-3.5 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Scheduled Date *</label>
                <input
                  type="date"
                  required
                  value={postDate}
                  onChange={(e) => setPostDate(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddPostOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-emerald-500/20"
                >
                  Add to Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Sheet URL Modal */}
      {editingSheetBrand && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-elevated border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
              <h3 className="text-sm font-bold text-slate-900">Google Sheet URL: {editingSheetBrand.name}</h3>
              <button onClick={() => setEditingSheetBrand(null)} className="p-1 text-slate-400 hover:text-slate-600">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveSheetUrl} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Google Sheet Link</label>
                <input
                  type="url"
                  required
                  value={editingSheetBrand.url}
                  onChange={(e) => setEditingSheetBrand({ ...editingSheetBrand, url: e.target.value })}
                  placeholder="https://docs.google.com/spreadsheets/d/..."
                  className="w-full text-xs px-3.5 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 font-mono"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingSheetBrand(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold transition-all"
                >
                  Save Link
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
