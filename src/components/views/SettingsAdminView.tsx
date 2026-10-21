'use client';

import React, { useState } from 'react';
import { 
  Settings, 
  Database, 
  Globe, 
  Shield, 
  Layers, 
  CheckCircle2, 
  AlertCircle, 
  Save, 
  Plus, 
  Trash2,
  ExternalLink,
  Key,
  Server
} from 'lucide-react';
import { useBrandFlow } from '@/context/BrandFlowContext';

export default function SettingsAdminView() {
  const { 
    settings, 
    updateSettings, 
    showToast 
  } = useBrandFlow();

  const [appName, setAppName] = useState(settings.appName || 'BrandFlow');
  const [timezone, setTimezone] = useState(settings.timezone || 'Asia/Kolkata');
  const [supabaseUrl, setSupabaseUrl] = useState(settings.supabaseUrl || '');
  const [supabaseAnonKey, setSupabaseAnonKey] = useState(settings.supabaseAnonKey || '');
  const [isTestingSupabase, setIsTestingSupabase] = useState(false);
  const [supabaseStatusMsg, setSupabaseStatusMsg] = useState<{ success: boolean; message: string } | null>(null);

  // Custom Categories & Priorities
  const [taskCategories, setTaskCategories] = useState<string[]>(settings.taskCategories || []);
  const [newCategory, setNewCategory] = useState('');

  const [priorities, setPriorities] = useState<string[]>(settings.priorities || []);
  const [newPriority, setNewPriority] = useState('');

  const handleSaveGeneral = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateSettings({
      appName,
      timezone,
      taskCategories,
      priorities,
    });
    showToast({ type: 'success', title: 'Configuration Saved', description: 'System preferences updated.' });
  };

  const handleTestSupabase = async () => {
    setIsTestingSupabase(true);
    setSupabaseStatusMsg(null);
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          testSupabase: true,
          supabaseUrl,
          supabaseAnonKey
        }),
      });
      const json = await res.json();
      setSupabaseStatusMsg(json);
      if (json.success) {
        showToast({ type: 'success', title: 'Connected!', description: json.message });
      } else {
        showToast({ type: 'error', title: 'Connection Issue', description: json.message });
      }
    } catch (e: any) {
      setSupabaseStatusMsg({ success: false, message: e.message });
    } finally {
      setIsTestingSupabase(false);
    }
  };

  const handleAddCategory = () => {
    if (!newCategory.trim() || taskCategories.includes(newCategory.trim())) return;
    setTaskCategories([...taskCategories, newCategory.trim()]);
    setNewCategory('');
  };

  const handleRemoveCategory = (cat: string) => {
    setTaskCategories(taskCategories.filter(c => c !== cat));
  };

  return (
    <div className="space-y-6 pb-16 max-w-4xl">
      {/* Executive Obsidian Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-obsidian-950 via-obsidian-900 to-indigo-950 p-6 border border-white/10 shadow-float">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-brand-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-brand-500/20 text-brand-300 border border-brand-500/30">
                <Server size={12} className="text-brand-400" />
                Cloud Infrastructure
              </span>
              <span className="text-[11px] text-slate-400">
                PostgreSQL & Custom Domain Ready
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              System Administration & Cloud Architecture
            </h1>
            <p className="text-xs text-slate-300 leading-relaxed">
              Configure multi-device cloud synchronization via Supabase PostgreSQL, map custom domains (e.g. app.mybrand.com), and tune operational timezones.
            </p>
          </div>
        </div>
      </div>

      {/* Cloud Database (Supabase PostgreSQL) Section */}
      <div className="glass-card rounded-2xl border border-slate-200/90 p-6 space-y-4">
        <div className="flex items-center justify-between pb-4 border-b border-slate-200">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-brand-50 rounded-xl text-brand-600">
              <Database size={18} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-primary">Cloud PostgreSQL Connection</h3>
              <p className="text-[11px] text-slate-muted">Sync data securely across browsers and devices</p>
            </div>
          </div>

          <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Zero-Config Local Ledger Active (Cloud-Ready)
          </span>
        </div>

        <p className="text-xs text-slate-600 leading-relaxed">
          BrandFlow runs automatically out-of-the-box using the server-side persistent JSON ledger at <code className="font-mono text-brand-700 bg-brand-50 px-1 py-0.5 rounded">data/brandflow_db.json</code>. Provide your Supabase PostgreSQL credentials below to enable live cloud syncing.
        </p>

        <div className="space-y-3.5 pt-2">
          <div>
            <label className="block text-xs font-semibold text-slate-primary mb-1">
              Supabase Project URL
            </label>
            <input
              type="text"
              placeholder="https://xyzcompany.supabase.co"
              value={supabaseUrl}
              onChange={(e) => setSupabaseUrl(e.target.value)}
              className="w-full text-xs font-mono px-3.5 py-2.5 bg-slate-50/80 border border-slate-300 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-primary mb-1">
              Supabase Anon / Service Role Key
            </label>
            <input
              type="password"
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
              value={supabaseAnonKey}
              onChange={(e) => setSupabaseAnonKey(e.target.value)}
              className="w-full text-xs font-mono px-3.5 py-2.5 bg-slate-50/80 border border-slate-300 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
            />
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={handleTestSupabase}
              disabled={isTestingSupabase}
              className="px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold shadow-md shadow-brand-500/20 transition-all disabled:opacity-50"
            >
              {isTestingSupabase ? 'Testing Live Connection...' : 'Test & Sync Supabase Connection'}
            </button>
          </div>

          {supabaseStatusMsg && (
            <div className={`p-3.5 rounded-xl text-xs flex items-center gap-2.5 ${
              supabaseStatusMsg.success ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
            }`}>
              {supabaseStatusMsg.success ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
              <span>{supabaseStatusMsg.message}</span>
            </div>
          )}

          <div className="p-3.5 bg-slate-50/80 border border-slate-200/80 rounded-xl text-[11px] text-slate-600 space-y-1">
            <div className="font-semibold text-slate-800">Production SQL Migrations:</div>
            <div>
              The complete relational schema with 12 tables, foreign keys, indexes, and RLS policies is ready in:
            </div>
            <code className="text-brand-600 font-mono bg-white px-2.5 py-1 rounded-lg border border-slate-200 block mt-1">
              supabase/migrations/001_brandflow_schema.sql
            </code>
          </div>
        </div>
      </div>

      {/* Custom Domain Configuration Guide */}
      <div className="glass-card rounded-2xl border border-slate-200/90 p-6 space-y-4">
        <div className="flex items-center gap-2.5 pb-4 border-b border-slate-200">
          <div className="p-2 bg-indigo-50 rounded-xl text-indigo-600">
            <Globe size={18} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-primary">Custom Domain & Public HTTPS Deployment</h3>
            <p className="text-[11px] text-slate-muted">How to map your domain to BrandFlow on Vercel</p>
          </div>
        </div>

        <div className="text-xs text-slate-600 space-y-3">
          <p>
            You can point any custom domain (e.g., <code className="font-mono bg-slate-100 text-brand-700 px-1.5 py-0.5 rounded font-semibold">app.mybrand.com</code>) to your cloud deployment.
          </p>

          <div className="p-4 bg-slate-50/80 rounded-xl border border-slate-200/80 space-y-2.5">
            <div className="font-semibold text-slate-800">Recommended DNS Configuration:</div>
            <div className="grid grid-cols-3 gap-2 font-mono text-[11px] p-3 bg-white rounded-lg border border-slate-200">
              <div><strong>Type:</strong> CNAME</div>
              <div><strong>Name:</strong> app</div>
              <div><strong>Value:</strong> cname.vercel-dns.com</div>
            </div>
            <div className="text-[11px] text-slate-500">
              Automatic SSL certificate renewal (HTTPS) is handled at no extra cost.
            </div>
          </div>
        </div>
      </div>

      {/* General Settings Form */}
      <form onSubmit={handleSaveGeneral} className="glass-card rounded-2xl border border-slate-200/90 p-6 space-y-5">
        <div className="flex items-center justify-between pb-4 border-b border-slate-200">
          <h3 className="text-sm font-bold text-slate-primary">Application General Preferences</h3>
          <button
            type="submit"
            className="flex items-center gap-1.5 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold shadow-md shadow-brand-500/20 transition-all"
          >
            <Save size={14} />
            <span>Save Settings</span>
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-primary mb-1">
              Application Name
            </label>
            <input
              type="text"
              value={appName}
              onChange={(e) => setAppName(e.target.value)}
              className="w-full text-xs px-3.5 py-2.5 bg-slate-50/80 border border-slate-300 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-primary mb-1">
              Operational Timezone
            </label>
            <select
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              className="w-full text-xs px-3.5 py-2.5 bg-slate-50/80 border border-slate-300 rounded-xl text-slate-800 focus:outline-none"
            >
              <option value="Asia/Kolkata">Asia/Kolkata (IST • UTC+05:30)</option>
              <option value="Asia/Dubai">Asia/Dubai (GST • UTC+04:00)</option>
              <option value="Europe/London">Europe/London (BST • UTC+01:00)</option>
              <option value="America/New_York">America/New_York (EDT • UTC-04:00)</option>
            </select>
          </div>
        </div>

        {/* Task Categories Manager */}
        <div>
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5">
            Configurable Task Categories ({taskCategories.length})
          </label>
          <div className="flex flex-wrap gap-2 mb-3">
            {taskCategories.map((cat) => (
              <span key={cat} className="inline-flex items-center gap-1.5 text-xs bg-white text-slate-700 px-3 py-1 rounded-lg border border-slate-200 shadow-2xs font-medium">
                <span>{cat}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveCategory(cat)}
                  className="text-slate-400 hover:text-rose-500 transition-colors ml-0.5"
                >
                  <Trash2 size={12} />
                </button>
              </span>
            ))}
          </div>

          <div className="flex gap-2 max-w-sm">
            <input
              type="text"
              placeholder="Add custom category..."
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              className="flex-1 text-xs px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-800 focus:outline-none focus:border-brand-500"
            />
            <button
              type="button"
              onClick={handleAddCategory}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors"
            >
              Add
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
