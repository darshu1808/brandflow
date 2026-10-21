'use client';

import React, { useState } from 'react';
import { 
  PieChart, 
  BarChart3, 
  Download, 
  TrendingUp, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Calendar,
  Filter,
  Sparkles,
  ArrowUpRight
} from 'lucide-react';
import { useBrandFlow } from '@/context/BrandFlowContext';

export default function ReportsView() {
  const { 
    tasks, 
    brands, 
    team, 
    content, 
    shoots, 
    ads, 
    activeBrandId 
  } = useBrandFlow();

  const [dateRange, setDateRange] = useState<'today' | '7days' | '30days'>('7days');

  const filteredTasks = tasks.filter(t => activeBrandId === 'all' || t.brandId === activeBrandId);
  const completedTasks = filteredTasks.filter(t => t.status === 'Done');
  const pendingTasks = filteredTasks.filter(t => t.status !== 'Done' && t.status !== 'Cancelled');
  const overdueTasks = filteredTasks.filter(t => t.status !== 'Done' && t.dueDate < new Date().toISOString());

  const completionRate = filteredTasks.length > 0 
    ? Math.round((completedTasks.length / filteredTasks.length) * 100) 
    : 0;

  const handleExportCSV = () => {
    window.open('/api/export-import?type=tasks', '_blank');
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Executive Obsidian Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-obsidian-950 via-obsidian-900 to-indigo-950 p-6 border border-white/10 shadow-float">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-brand-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-brand-500/20 text-brand-300 border border-brand-500/30">
                <PieChart size={12} className="text-brand-400" />
                Operations Intelligence
              </span>
              <span className="text-[11px] text-slate-400">
                {brands.length} Brands Monitored
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              Executive Reports & Throughput Metrics
            </h1>
            <p className="text-xs text-slate-300 leading-relaxed">
              Track team delivery velocity, cross-brand completion percentages, SLA variance, and export raw data ledgers for client executive review.
            </p>
          </div>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-brand-500/25 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
          >
            <Download size={15} />
            <span>Export Analytics Ledger (CSV)</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="glass-card glass-card-hover p-5 rounded-2xl border border-slate-200/90 border-t-2 border-t-brand-500">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Total Throughput</div>
          <div className="text-2xl font-bold text-slate-primary">{filteredTasks.length} tasks</div>
          <div className="text-[11px] text-slate-500 mt-1">Across active pipelines</div>
        </div>

        <div className="glass-card glass-card-hover p-5 rounded-2xl border border-slate-200/90 border-t-2 border-t-emerald-500">
          <div className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider mb-1">Completion Rate</div>
          <div className="text-2xl font-bold text-emerald-600">{completionRate}%</div>
          <div className="text-[11px] text-emerald-700 mt-1">{completedTasks.length} delivered</div>
        </div>

        <div className="glass-card glass-card-hover p-5 rounded-2xl border border-slate-200/90 border-t-2 border-t-indigo-500">
          <div className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider mb-1">Active Pipeline</div>
          <div className="text-2xl font-bold text-indigo-600">{pendingTasks.length}</div>
          <div className="text-[11px] text-indigo-700 mt-1">Active assignments</div>
        </div>

        <div className="glass-card glass-card-hover p-5 rounded-2xl border border-slate-200/90 border-t-2 border-t-rose-500">
          <div className="text-[10px] font-bold text-rose-600 uppercase tracking-wider mb-1">Overdue Variance</div>
          <div className="text-2xl font-bold text-rose-600">{overdueTasks.length}</div>
          <div className="text-[11px] text-rose-700 mt-1">Exceeded target SLA</div>
        </div>
      </div>

      {/* Brand-Wise & Team-Wise Workload Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Brand Breakdown */}
        <div className="glass-card rounded-2xl border border-slate-200/90 p-6 space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Brand Portfolio Throughput Breakdown
            </h3>
            <span className="text-[11px] text-slate-400">Live Progress</span>
          </div>

          <div className="space-y-4">
            {brands.map((b) => {
              const bTasks = tasks.filter(t => t.brandId === b.id);
              const bDone = bTasks.filter(t => t.status === 'Done').length;
              const bTotal = bTasks.length;
              const pct = bTotal > 0 ? Math.round((bDone / bTotal) * 100) : 0;

              return (
                <div key={b.id} className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-slate-800 flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: b.brandColor }} />
                      {b.name}
                    </span>
                    <span className="text-slate-500 font-medium">
                      {bDone}/{bTotal} completed <strong className="text-slate-800 font-mono">({pct}%)</strong>
                    </span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200/80">
                    <div 
                      className="h-full rounded-full transition-all duration-300"
                      style={{ width: `${pct}%`, backgroundColor: b.brandColor }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Team Delivery Breakdown */}
        <div className="glass-card rounded-2xl border border-slate-200/90 p-6 space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Team Productivity & Delivery Ledger
            </h3>
            <span className="text-[11px] text-slate-400">{team.length} Members</span>
          </div>

          <div className="space-y-3">
            {team.map((m) => {
              const mTasks = tasks.filter(t => t.assigneeId === m.id);
              const mActive = mTasks.filter(t => t.status !== 'Done').length;
              const mDone = mTasks.filter(t => t.status === 'Done').length;

              return (
                <div key={m.id} className="flex items-center justify-between p-3 bg-slate-50/80 rounded-xl border border-slate-200/70 text-xs">
                  <div className="flex items-center gap-3">
                    <img src={m.avatar} alt={m.name} className="w-8 h-8 rounded-full object-cover border border-slate-200" />
                    <div>
                      <div className="font-bold text-slate-800">{m.name}</div>
                      <div className="text-[10px] text-slate-500 capitalize">{m.role.replace('_', ' ')}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-right">
                    <div>
                      <div className="text-[9px] text-slate-400 uppercase font-semibold">In Progress</div>
                      <div className="font-bold text-slate-800 mt-0.5">{mActive}</div>
                    </div>
                    <div>
                      <div className="text-[9px] text-emerald-600 uppercase font-semibold">Delivered</div>
                      <div className="font-bold text-emerald-700 mt-0.5">{mDone}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
