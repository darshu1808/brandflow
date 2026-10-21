'use client';

import React, { useState } from 'react';
import { 
  X, 
  CheckCircle2, 
  AlertCircle, 
  ExternalLink, 
  MessageSquare, 
  History, 
  Film, 
  Share2, 
  Clock, 
  Check 
} from 'lucide-react';
import { useBrandFlow } from '@/context/BrandFlowContext';

export default function CreativeReviewModal() {
  const { 
    selectedReviewContentId, 
    setSelectedReviewContentId, 
    content, 
    approveContent, 
    requestChangesContent 
  } = useBrandFlow();

  const item = content.find(c => c.id === selectedReviewContentId);
  const [feedback, setFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!item) return null;

  const handleApprove = async () => {
    setIsSubmitting(true);
    await approveContent(item.id, feedback || 'Approved for social publishing.');
    setIsSubmitting(false);
    setSelectedReviewContentId(null);
  };

  const handleRequestChanges = async () => {
    if (!feedback.trim()) {
      alert('Please enter specific feedback for the editor or designer.');
      return;
    }
    setIsSubmitting(true);
    await requestChangesContent(item.id, feedback);
    setIsSubmitting(false);
    setSelectedReviewContentId(null);
  };

  const isVideo = item.contentType === 'Reel' || item.contentType === 'Short Video';

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-hover border border-surface-border w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-surface-border flex items-center justify-between bg-surface-subtle">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-brand-50 text-brand-600 rounded-lg">
              <Film size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-primary">{item.brandName}</span>
                <span className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full font-semibold">
                  v{item.version}
                </span>
                <span className="text-[10px] bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full font-semibold">
                  {item.approvalStatus}
                </span>
              </div>
              <h3 className="text-sm font-bold text-slate-primary mt-0.5">{item.title}</h3>
            </div>
          </div>

          <button
            onClick={() => setSelectedReviewContentId(null)}
            className="p-1.5 text-slate-muted hover:text-slate-primary rounded-md transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto flex-1 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column: Visual Preview */}
          <div className="space-y-4">
            <div className="rounded-xl overflow-hidden bg-slate-900 border border-surface-border aspect-[9/16] max-h-[420px] mx-auto flex items-center justify-center relative shadow-sm">
              {item.creativeFileUrl ? (
                isVideo ? (
                  <video 
                    src={item.creativeFileUrl} 
                    controls 
                    className="w-full h-full object-contain" 
                    playsInline 
                  />
                ) : (
                  <img 
                    src={item.creativeFileUrl} 
                    alt={item.title} 
                    className="w-full h-full object-cover" 
                  />
                )
              ) : (
                <div className="text-center p-6 text-slate-400">
                  <Film size={32} className="mx-auto mb-2 opacity-50" />
                  <p className="text-xs">Preview file hosted on external cloud drive</p>
                  {item.creativeLink && (
                    <a
                      href={item.creativeLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-3 inline-flex items-center gap-1.5 text-xs text-brand-400 hover:text-brand-300 underline font-medium"
                    >
                      <ExternalLink size={13} />
                      Open in Google Drive
                    </a>
                  )}
                </div>
              )}
            </div>

            {/* External Links */}
            <div className="flex flex-col gap-2">
              {item.creativeLink && (
                <a
                  href={item.creativeLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-2.5 bg-surface-subtle hover:bg-surface-muted rounded-lg border border-surface-border text-xs text-slate-primary transition-colors"
                >
                  <span className="flex items-center gap-2 truncate">
                    <ExternalLink size={14} className="text-brand-500 flex-shrink-0" />
                    <span className="truncate">Drive Asset: {item.creativeLink}</span>
                  </span>
                  <span className="text-[11px] text-brand-600 font-semibold flex-shrink-0">Open</span>
                </a>
              )}

              {item.whatsappSourceLink && (
                <a
                  href={item.whatsappSourceLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-2.5 bg-emerald-50 hover:bg-emerald-100 rounded-lg border border-emerald-200 text-xs text-emerald-800 transition-colors"
                >
                  <span className="flex items-center gap-2 truncate">
                    <Share2 size={14} className="text-emerald-600 flex-shrink-0" />
                    <span className="truncate">Original WhatsApp Message Reference</span>
                  </span>
                  <span className="text-[11px] text-emerald-700 font-semibold flex-shrink-0">View</span>
                </a>
              )}
            </div>
          </div>

          {/* Right Column: Metadata, History & Feedback Actions */}
          <div className="flex flex-col justify-between space-y-4">
            <div className="space-y-4">
              {/* Creator & Publishing schedule details */}
              <div className="p-3 bg-surface-subtle border border-surface-border rounded-xl space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-muted">Creator / Editor:</span>
                  <span className="font-semibold text-slate-primary">{item.assignedCreator}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-muted">Scheduled Publish:</span>
                  <span className="font-semibold text-slate-primary">
                    {item.scheduledDate} at {item.scheduledTime} ({item.platform})
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-muted">Assigned Publisher:</span>
                  <span className="font-semibold text-slate-primary">{item.assignedPublisher}</span>
                </div>
              </div>

              {/* Caption */}
              {item.caption && (
                <div>
                  <h4 className="text-xs font-bold text-slate-primary uppercase tracking-wider mb-1">
                    Caption & Copy
                  </h4>
                  <p className="text-xs text-slate-600 bg-surface-subtle p-3 rounded-lg border border-surface-border whitespace-pre-wrap leading-relaxed">
                    {item.caption}
                  </p>
                </div>
              )}

              {/* Review History */}
              <div>
                <h4 className="text-xs font-bold text-slate-primary uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <History size={13} className="text-slate-400" />
                  Review Decision History
                </h4>
                {(item.feedbackHistory || []).length === 0 ? (
                  <p className="text-xs text-slate-muted italic">Initial submission. No previous revision cycles.</p>
                ) : (
                  <div className="space-y-2">
                    {item.feedbackHistory?.map((fb, idx) => (
                      <div key={idx} className="p-2.5 bg-surface-subtle border border-surface-border rounded-lg text-xs">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-semibold text-slate-primary">
                            {fb.reviewer} • v{fb.version}
                          </span>
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                            fb.decision === 'Approved' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                          }`}>
                            {fb.decision}
                          </span>
                        </div>
                        <p className="text-slate-600 leading-relaxed">{fb.feedback}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Reviewer Feedback Input */}
              <div>
                <label className="block text-xs font-bold text-slate-primary uppercase tracking-wider mb-1.5">
                  Brand Manager Feedback / Revision Notes
                </label>
                <textarea
                  rows={3}
                  placeholder="e.g. Approved for 6:30 PM, or: Adjust color grading on transition at 00:04..."
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  className="w-full text-xs px-3 py-2 bg-surface-subtle border border-surface-border rounded-lg focus:outline-none focus:border-brand-500 text-slate-primary leading-relaxed"
                />
              </div>
            </div>

            {/* Decision Buttons */}
            <div className="pt-4 border-t border-surface-border flex items-center gap-3">
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleRequestChanges}
                className="flex-1 py-2.5 px-4 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5"
              >
                <AlertCircle size={15} />
                <span>Request Changes (v{item.version + 1})</span>
              </button>

              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleApprove}
                className="flex-1 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all flex items-center justify-center gap-1.5"
              >
                <CheckCircle2 size={15} />
                <span>Approve for Posting</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
