'use client';

import React, { useState } from 'react';
import { X, FileSpreadsheet, Download, Upload, CheckCircle2, AlertCircle } from 'lucide-react';
import { useBrandFlow } from '@/context/BrandFlowContext';

export default function ImportExportModal() {
  const { 
    isImportExportOpen, 
    setIsImportExportOpen, 
    refreshData, 
    showToast 
  } = useBrandFlow();

  const [importType, setImportType] = useState<'tasks' | 'posting'>('tasks');
  const [csvText, setCsvText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isImportExportOpen) return null;

  const handleExport = (type: 'tasks' | 'posting') => {
    window.open(`/api/export-import?type=${type}`, '_blank');
    showToast({ type: 'success', title: 'Export Generated', description: `Downloaded ${type} CSV.` });
  };

  const handleImport = async () => {
    if (!csvText.trim()) {
      alert('Please paste CSV content.');
      return;
    }

    setIsProcessing(true);
    try {
      const lines = csvText.trim().split('\n');
      if (lines.length < 2) {
        alert('CSV must contain a header row and at least one data row.');
        setIsProcessing(false);
        return;
      }

      const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
      const records = [];

      for (let i = 1; i < lines.length; i++) {
        const line = lines[i];
        if (!line.trim()) continue;
        
        // Simple comma parser accounting for quotes
        const values = line.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || line.split(',');
        const cleanValues = values.map(v => v.trim().replace(/^"|"$/g, ''));
        
        if (importType === 'tasks') {
          records.push({
            title: cleanValues[0] || 'Imported Task',
            brandName: cleanValues[1] || 'General',
            category: cleanValues[2] || 'General',
            priority: cleanValues[3] || 'Medium',
            status: cleanValues[4] || 'To Do',
            assigneeName: cleanValues[5] || 'Darsh',
            dueDate: cleanValues[6] || new Date(Date.now() + 86400000).toISOString(),
          });
        } else {
          records.push({
            title: cleanValues[0] || 'Imported Content',
            brandName: cleanValues[1] || 'Brand',
            contentType: cleanValues[2] || 'Reel',
            platform: cleanValues[3] || 'Instagram',
            scheduledDate: cleanValues[4] || new Date().toISOString().split('T')[0],
            scheduledTime: cleanValues[5] || '18:00',
            caption: cleanValues[6] || '',
          });
        }
      }

      const res = await fetch('/api/export-import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: importType, records }),
      });

      const json = await res.json();
      if (json.success) {
        await refreshData();
        showToast({ type: 'success', title: 'Import Successful', description: json.message });
        setCsvText('');
        setIsImportExportOpen(false);
      } else {
        alert(json.error || 'Import failed.');
      }
    } catch (e: any) {
      alert(`Parsing error: ${e.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-hover border border-surface-border w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between px-5 py-4 border-b border-surface-border bg-surface-subtle">
          <div className="flex items-center gap-2">
            <FileSpreadsheet size={18} className="text-brand-500" />
            <h2 className="text-sm font-bold text-slate-primary">Spreadsheet Hub (CSV / Excel)</h2>
          </div>
          <button 
            onClick={() => setIsImportExportOpen(false)}
            className="p-1 rounded-md text-slate-muted hover:text-slate-primary hover:bg-white transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        <div className="p-5 space-y-6">
          {/* Export Section */}
          <div>
            <h3 className="text-xs font-bold text-slate-primary uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Download size={14} className="text-brand-500" />
              Export Live Data
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => handleExport('tasks')}
                className="p-3 bg-surface-subtle hover:bg-brand-50 border border-surface-border hover:border-brand-200 rounded-lg text-left transition-all"
              >
                <div className="font-semibold text-xs text-slate-primary">Export All Tasks</div>
                <div className="text-[11px] text-slate-muted mt-0.5">Download full task ledger as CSV</div>
              </button>

              <button
                onClick={() => handleExport('posting')}
                className="p-3 bg-surface-subtle hover:bg-brand-50 border border-surface-border hover:border-brand-200 rounded-lg text-left transition-all"
              >
                <div className="font-semibold text-xs text-slate-primary">Export Posting Calendar</div>
                <div className="text-[11px] text-slate-muted mt-0.5">Download scheduled content & reels</div>
              </button>
            </div>
          </div>

          <div className="h-px bg-surface-border" />

          {/* Import Section */}
          <div>
            <h3 className="text-xs font-bold text-slate-primary uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Upload size={14} className="text-brand-500" />
              Import Content Calendar or Tasks
            </h3>

            <div className="space-y-3">
              <div className="flex gap-4 text-xs font-medium">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="importType"
                    checked={importType === 'tasks'}
                    onChange={() => setImportType('tasks')}
                  />
                  <span>Tasks Import</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="importType"
                    checked={importType === 'posting'}
                    onChange={() => setImportType('posting')}
                  />
                  <span>Posting Schedule Import</span>
                </label>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-muted mb-1">
                  Paste CSV content (Header + rows):
                </label>
                <textarea
                  rows={4}
                  placeholder={
                    importType === 'tasks'
                      ? 'Title,Brand,Category,Priority,Status,Assignee,DueDate\n"Autumn shoot raw selects","HOF","Data Sorting","Critical","To Do","Darsh","2026-10-21"'
                      : 'Title,Brand,ContentType,Platform,ScheduledDate,ScheduledTime,Caption\n"Festive Silk Reel","HOF","Reel","Instagram","2026-10-22","18:30","Heritage collection"'
                  }
                  value={csvText}
                  onChange={(e) => setCsvText(e.target.value)}
                  className="w-full text-xs font-mono px-3 py-2 bg-surface-subtle border border-surface-border rounded-lg text-slate-primary focus:outline-none focus:border-brand-500"
                />
              </div>

              <button
                type="button"
                disabled={isProcessing || !csvText.trim()}
                onClick={handleImport}
                className="w-full py-2 bg-brand-500 hover:bg-brand-600 text-white rounded-lg text-xs font-semibold shadow-sm transition-all disabled:opacity-50 flex items-center justify-center gap-1.5"
              >
                <Upload size={14} />
                <span>{isProcessing ? 'Importing...' : 'Parse & Import to Cloud Database'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
