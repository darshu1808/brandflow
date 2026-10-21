'use client';

import React, { useState } from 'react';
import { 
  GitFork, 
  Plus, 
  Trash2, 
  ArrowDown, 
  CheckCircle2, 
  ShieldCheck, 
  Clock, 
  Layers, 
  Save, 
  AlertCircle,
  Copy,
  Users,
  ChevronUp,
  ChevronDown,
  Sparkles,
  Workflow as WorkflowIcon
} from 'lucide-react';
import { useBrandFlow } from '@/context/BrandFlowContext';
import { Workflow, WorkflowStage } from '@/lib/types';

export default function WorkflowsView() {
  const { 
    workflows, 
    createWorkflow, 
    updateWorkflow, 
    team, 
    showToast 
  } = useBrandFlow();

  const [activeWorkflowId, setActiveWorkflowId] = useState<string>(workflows[0]?.id || '');
  const activeWf = workflows.find(w => w.id === activeWorkflowId) || workflows[0];

  const [stages, setStages] = useState<WorkflowStage[]>(activeWf?.stages || []);
  const [newStageName, setNewStageName] = useState('');
  const [newStageRole, setNewStageRole] = useState('content_team');
  const [newStageAction, setNewStageAction] = useState<'task' | 'review' | 'approval_gate' | 'publishing' | 'handover'>('task');
  const [isSaving, setIsSaving] = useState(false);

  // Sync stages when active workflow changes
  React.useEffect(() => {
    if (activeWf) {
      setStages(activeWf.stages || []);
    }
  }, [activeWf]);

  const handleAddStage = () => {
    if (!newStageName.trim()) return;

    const newStage: WorkflowStage = {
      id: `stg-${Date.now()}`,
      name: newStageName.trim(),
      order: stages.length + 1,
      responsibleRole: newStageRole,
      defaultAssigneeName: team.find(t => t.role === newStageRole)?.name || 'Team Member',
      actionType: newStageAction,
      dueDaysFromPrevious: 1,
      autoTriggerNext: true
    };

    setStages([...stages, newStage]);
    setNewStageName('');
  };

  const handleRemoveStage = (id: string) => {
    const updated = stages.filter(s => s.id !== id).map((s, idx) => ({
      ...s,
      order: idx + 1
    }));
    setStages(updated);
  };

  const handleMoveStage = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === stages.length - 1) return;

    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const reordered = [...stages];
    const temp = reordered[index];
    reordered[index] = reordered[targetIndex];
    reordered[targetIndex] = temp;

    const withOrder = reordered.map((s, idx) => ({ ...s, order: idx + 1 }));
    setStages(withOrder);
  };

  const handleSaveWorkflow = async () => {
    if (!activeWf) return;
    setIsSaving(true);
    await updateWorkflow({
      id: activeWf.id,
      stages,
    });
    setIsSaving(false);
  };

  const handleCreateNewWorkflowPreset = async (presetType: string) => {
    let name = 'Custom Marketing Pipeline';
    let category: 'Shoot to Publish' | 'Design Request' | 'Ad Campaign' | 'Custom' = 'Custom';
    let sampleStages: WorkflowStage[] = [];

    if (presetType === 'creative_director') {
      name = 'Creative Director End-to-End Campaign';
      category = 'Custom';
      sampleStages = [
        { id: `s1-${Date.now()}`, name: 'Strategy & Brand Identity Alignment', order: 1, responsibleRole: 'brand_manager', defaultAssigneeName: 'Darsh', actionType: 'task', dueDaysFromPrevious: 1, autoTriggerNext: true },
        { id: `s2-${Date.now()}`, name: 'Creative Brief Formulation', order: 2, responsibleRole: 'brand_manager', defaultAssigneeName: 'Darsh', actionType: 'task', dueDaysFromPrevious: 1, autoTriggerNext: true },
        { id: `s3-${Date.now()}`, name: 'Production Assignment (Editor & Designer)', order: 3, responsibleRole: 'project_manager', defaultAssigneeName: 'Pinky', actionType: 'handover', dueDaysFromPrevious: 1, autoTriggerNext: true },
        { id: `s4-${Date.now()}`, name: 'Creative Director Review & Grading Signoff', order: 4, responsibleRole: 'brand_manager', defaultAssigneeName: 'Darsh', actionType: 'review', dueDaysFromPrevious: 1, autoTriggerNext: true },
        { id: `s5-${Date.now()}`, name: 'Client Approval Gate', order: 5, responsibleRole: 'brand_manager', defaultAssigneeName: 'Darsh', actionType: 'approval_gate', dueDaysFromPrevious: 1, autoTriggerNext: true },
        { id: `s6-${Date.now()}`, name: 'Final Multi-Channel Delivery', order: 6, responsibleRole: 'content_team', defaultAssigneeName: 'Isha', actionType: 'publishing', dueDaysFromPrevious: 1, autoTriggerNext: false }
      ];
    }

    const created = await createWorkflow({
      name,
      category,
      stages: sampleStages,
      description: 'Dynamic user-defined workflow configured through Admin UI without code changes.'
    });

    if (created) {
      setActiveWorkflowId(created.id);
    }
  };

  const getActionBadge = (action: string) => {
    switch (action) {
      case 'approval_gate':
        return <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-500/10 text-rose-700 border border-rose-500/20">Approval Gate</span>;
      case 'review':
        return <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/10 text-amber-700 border border-amber-500/20">Review</span>;
      case 'handover':
        return <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-500/10 text-blue-700 border border-blue-500/20">Handover</span>;
      case 'publishing':
        return <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-700 border border-emerald-500/20">Publishing</span>;
      default:
        return <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-500/10 text-purple-700 border border-purple-500/20">Task</span>;
    }
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Executive Obsidian Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-obsidian-950 via-obsidian-900 to-purple-950/80 p-6 sm:p-7 border border-white/10 shadow-float">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-purple-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-purple-500/20 text-purple-300 border border-purple-500/30">
                <WorkflowIcon size={12} className="text-purple-400" />
                Pipeline Architect
              </span>
              <span className="text-[11px] text-slate-400">
                Active Version v{activeWf?.version || 1}
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              Dynamic Workflow Engine & Visual Builder
            </h1>
            <p className="text-xs text-slate-300 leading-relaxed">
              Reconfigure operational stages, roles, approval gates, and automatic handovers on the fly without changing a single line of application source code.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => handleCreateNewWorkflowPreset('creative_director')}
              className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-purple-500/25 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
            >
              <Plus size={15} />
              <span>+ Creative Director Pipeline</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Workflow Builder Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Column: Workflow Selector */}
        <div className="glass-card rounded-2xl border border-slate-200/90 p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Pipelines ({workflows.length})
            </h3>
            <span className="text-[10px] font-mono text-purple-600 font-bold">Configured</span>
          </div>

          <div className="space-y-2">
            {workflows.map((wf) => (
              <button
                key={wf.id}
                onClick={() => setActiveWorkflowId(wf.id)}
                className={`w-full text-left p-3.5 rounded-xl border text-xs transition-all ${
                  activeWorkflowId === wf.id
                    ? 'bg-purple-50/90 border-purple-300 text-purple-950 font-semibold shadow-sm ring-1 ring-purple-400/30'
                    : 'bg-white border-slate-200/70 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold truncate text-slate-900">{wf.name}</span>
                  <span className="text-[10px] bg-white border border-slate-200 px-1.5 py-0.5 rounded font-mono font-bold text-slate-700">
                    v{wf.version}
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 line-clamp-1">{wf.category}</div>
                <div className="text-[10px] text-purple-600 font-medium mt-1">
                  {wf.stages?.length || 0} sequential stages
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Right 3 Columns: Visual Pipeline Editor */}
        <div className="lg:col-span-3 glass-card rounded-2xl border border-slate-200/90 p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-slate-200">
            <div>
              <div className="flex items-center gap-2.5">
                <h3 className="text-base font-bold text-slate-primary">{activeWf?.name}</h3>
                <span className="text-xs font-mono font-bold bg-purple-100 text-purple-800 px-2.5 py-0.5 rounded-full border border-purple-200">
                  Version v{activeWf?.version}
                </span>
              </div>
              <p className="text-xs text-slate-muted mt-1">{activeWf?.description}</p>
            </div>

            <button
              onClick={handleSaveWorkflow}
              disabled={isSaving}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold shadow-md shadow-purple-500/20 transition-all disabled:opacity-50"
            >
              <Save size={14} />
              <span>{isSaving ? 'Publishing Version...' : 'Save & Publish v' + ((activeWf?.version || 1) + 1)}</span>
            </button>
          </div>

          {/* Visual Stages Sequence */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Sequential Stage Architecture ({stages.length})
              </h4>
              <span className="text-[11px] text-slate-400">Automatic triggers enabled</span>
            </div>

            <div className="space-y-3">
              {stages.map((stage, idx) => (
                <div key={stage.id} className="relative group">
                  <div className="p-4 bg-white border border-slate-200/80 rounded-xl flex items-center justify-between gap-4 hover:border-purple-300 shadow-2xs hover:shadow-subtle transition-all">
                    <div className="flex items-center gap-3.5 flex-1 min-w-0">
                      <div className="w-8 h-8 rounded-xl bg-purple-600 text-white text-xs font-bold flex items-center justify-center flex-shrink-0 shadow-sm shadow-purple-500/30">
                        {stage.order}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-xs text-slate-900 truncate flex items-center gap-2">
                          <span>{stage.name}</span>
                          {getActionBadge(stage.actionType)}
                        </div>
                        <div className="flex items-center gap-3 text-[11px] text-slate-500 mt-1">
                          <span>
                            Role: <strong className="text-slate-700 capitalize font-medium">{stage.responsibleRole.replace('_', ' ')}</strong>
                          </span>
                          <span>•</span>
                          <span>
                            Default Assignee: <strong className="text-slate-700 font-medium">{stage.defaultAssigneeName || 'Auto-assigned'}</strong>
                          </span>
                          <span>•</span>
                          <span>
                            Lead Time: <strong className="text-slate-700 font-medium">+{stage.dueDaysFromPrevious || 1} day</strong>
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Stage Controls */}
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleMoveStage(idx, 'up')}
                        disabled={idx === 0}
                        title="Move Up"
                        className="p-1.5 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg disabled:opacity-30 transition-colors"
                      >
                        <ChevronUp size={16} />
                      </button>
                      <button
                        onClick={() => handleMoveStage(idx, 'down')}
                        disabled={idx === stages.length - 1}
                        title="Move Down"
                        className="p-1.5 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg disabled:opacity-30 transition-colors"
                      >
                        <ChevronDown size={16} />
                      </button>
                      <button
                        onClick={() => handleRemoveStage(stage.id)}
                        title="Delete Stage"
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors ml-1"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>

                  {/* Flow Connector Arrow between stages */}
                  {idx < stages.length - 1 && (
                    <div className="flex justify-center -my-1 relative z-10 pointer-events-none">
                      <div className="w-5 h-5 rounded-full bg-slate-100 border border-slate-300 flex items-center justify-center text-slate-400">
                        <ArrowDown size={11} />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Add New Stage Drawer/Form */}
          <div className="p-4 bg-slate-50/80 rounded-xl border border-slate-200 space-y-3">
            <h5 className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Plus size={14} className="text-purple-600" />
              <span>Append Stage to Pipeline</span>
            </h5>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-[10px] font-semibold text-slate-500 uppercase mb-1">Stage Title</label>
                <input
                  type="text"
                  value={newStageName}
                  onChange={(e) => setNewStageName(e.target.value)}
                  placeholder="e.g. Sound Design & Audio Normalization"
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-slate-500 uppercase mb-1">Responsible Role</label>
                <select
                  value={newStageRole}
                  onChange={(e) => setNewStageRole(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                >
                  <option value="brand_manager">Brand Manager</option>
                  <option value="project_manager">Project Manager</option>
                  <option value="content_team">Content Team (Editor)</option>
                  <option value="ad_manager">Ad Manager</option>
                  <option value="client">Client</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-slate-500 uppercase mb-1">Action Type</label>
                <select
                  value={newStageAction}
                  onChange={(e: any) => setNewStageAction(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                >
                  <option value="task">Production Task</option>
                  <option value="review">Creative Review</option>
                  <option value="approval_gate">Client Approval Gate</option>
                  <option value="handover">Team Handover</option>
                  <option value="publishing">Publish Live</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end pt-1">
              <button
                type="button"
                onClick={handleAddStage}
                disabled={!newStageName.trim()}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-bold transition-all disabled:opacity-40"
              >
                Add Stage
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
