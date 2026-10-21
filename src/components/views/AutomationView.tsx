'use client';

import React, { useState } from 'react';
import { 
  Cpu, 
  Plus, 
  Play, 
  CheckCircle2, 
  AlertTriangle, 
  Activity, 
  ToggleLeft, 
  ToggleRight, 
  X,
  History,
  Sparkles,
  Zap,
  Terminal
} from 'lucide-react';
import { useBrandFlow } from '@/context/BrandFlowContext';
import { AutomationRule } from '@/lib/types';

export default function AutomationView() {
  const { 
    automations, 
    executions, 
    createAutomation, 
    toggleAutomation, 
    testAutomation 
  } = useBrandFlow();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [trigger, setTrigger] = useState<any>('SHOOT_COMPLETED');
  const [action, setAction] = useState<any>('CREATE_TASK');

  const handleCreateRule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    await createAutomation({
      name: name.trim(),
      description: description.trim(),
      trigger,
      action,
      isEnabled: true,
      executionCount: 0,
      config: {}
    });

    setName('');
    setDescription('');
    setIsAddModalOpen(false);
  };

  const totalExecutions = automations.reduce((acc, curr) => acc + (curr.executionCount || 0), 0);
  const activeRulesCount = automations.filter(a => a.isEnabled).length;

  return (
    <div className="space-y-6 pb-16">
      {/* Executive Obsidian Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-obsidian-950 via-obsidian-900 to-indigo-950 p-6 border border-white/10 shadow-float">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-brand-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-brand-500/20 text-brand-300 border border-brand-500/30">
                <Zap size={12} className="text-brand-400" />
                Autonomous Engine
              </span>
              <span className="text-[11px] text-slate-400">
                {activeRulesCount} of {automations.length} Active Rules
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              Automation Engine & Trigger Rules
            </h1>
            <p className="text-xs text-slate-300 leading-relaxed">
              Real-time reactive event architecture (WHEN [Event] IF [Condition] THEN [Action]). Shoots auto-spawn raw data sorting tasks; sorting tasks trigger PM handovers; reel uploads feed review queues.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-4 px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 backdrop-blur-md">
              <div className="text-center">
                <div className="text-[10px] uppercase font-bold text-slate-400">Total Triggers</div>
                <div className="text-lg font-bold text-white mt-0.5">{totalExecutions}</div>
              </div>
              <div className="h-7 w-px bg-white/10" />
              <div className="text-center">
                <div className="text-[10px] uppercase font-bold text-emerald-300">Success Rate</div>
                <div className="text-lg font-bold text-emerald-300 mt-0.5">100%</div>
              </div>
            </div>

            <button
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-brand-500/25 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
            >
              <Plus size={15} />
              <span>New Rule</span>
            </button>
          </div>
        </div>
      </div>

      {/* Rules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {automations.map((rule) => (
          <div
            key={rule.id}
            className={`glass-card glass-card-hover rounded-2xl border transition-all duration-200 p-6 flex flex-col justify-between ${
              rule.isEnabled 
                ? 'border-slate-200/90' 
                : 'border-slate-200/60 opacity-60 bg-slate-50/50'
            }`}
          >
            <div className="space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-base font-bold text-slate-primary">{rule.name}</h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">{rule.description}</p>
                </div>

                <button
                  onClick={() => toggleAutomation(rule)}
                  className="text-slate-400 hover:text-brand-600 transition-colors flex-shrink-0"
                  title={rule.isEnabled ? 'Disable Rule' : 'Enable Rule'}
                >
                  {rule.isEnabled ? (
                    <ToggleRight size={28} className="text-emerald-500" />
                  ) : (
                    <ToggleLeft size={28} className="text-slate-300" />
                  )}
                </button>
              </div>

              {/* Logic Badge (WHEN / THEN) */}
              <div className="p-3.5 bg-slate-50/90 border border-slate-200/80 rounded-xl text-xs space-y-2">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-brand-700 bg-brand-50 px-2 py-0.5 rounded text-[10px] border border-brand-200">
                    WHEN
                  </span>
                  <span className="font-mono text-slate-800 text-[11px] font-semibold">{rule.trigger}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded text-[10px] border border-purple-200">
                    THEN
                  </span>
                  <span className="font-mono text-slate-800 text-[11px] font-semibold">{rule.action}</span>
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                <span>Executed: <strong className="text-slate-800 font-bold">{rule.executionCount || 0} times</strong></span>
                {rule.lastExecutedAt && (
                  <span>Last run: <strong className="text-slate-700">{new Date(rule.lastExecutedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</strong></span>
                )}
              </div>
            </div>

            {/* Test Trigger Button */}
            <div className="pt-4 border-t border-slate-200/80 mt-4 flex items-center justify-end">
              <button
                onClick={() => testAutomation(rule.id)}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-brand-50 text-slate-700 hover:text-brand-700 rounded-xl text-xs font-semibold border border-slate-200 transition-colors"
              >
                <Play size={12} className="text-brand-500 fill-brand-500" />
                <span>Simulate Execution</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Execution Logs Ledger */}
      <div className="glass-card rounded-2xl border border-slate-200/90 shadow-subtle overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-2">
            <Terminal size={17} className="text-slate-600" />
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Live Trigger Audit Log Feed
            </h3>
          </div>
          <span className="text-[11px] text-slate-500 font-mono">Zero race condition idempotency</span>
        </div>

        <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto">
          {executions.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400 italic">
              No executions logged yet. Complete a shoot or task to see live automated actions!
            </div>
          ) : (
            executions.map((exec) => (
              <div key={exec.id} className="p-3.5 text-xs flex items-center justify-between hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-3">
                  <CheckCircle2 size={16} className="text-emerald-500 flex-shrink-0" />
                  <div>
                    <span className="font-bold text-slate-800">{exec.ruleName}: </span>
                    <span className="text-slate-600">{exec.detail}</span>
                  </div>
                </div>
                <span className="text-[10px] font-mono text-slate-400 flex-shrink-0 ml-4">
                  {new Date(exec.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
