'use client';

import React, { useState } from 'react';
import { 
  Users, 
  Plus, 
  Mail, 
  Trash2, 
  CheckCircle2, 
  Clock, 
  MessageSquare,
  Sparkles,
  X,
  Check
} from 'lucide-react';
import { useBrandFlow } from '@/context/BrandFlowContext';
import { TeamMember, Department } from '@/lib/types';

export default function TeamView() {
  const { 
    team, 
    tasks, 
    brands, 
    createTeamMember, 
    deleteTeamMember,
    createTask,
    setSelectedTaskId,
    currentUser,
    showToast 
  } = useBrandFlow();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [activeDiscussMember, setActiveDiscussMember] = useState<TeamMember | null>(null);

  // New Colleague Form
  const [name, setName] = useState('');
  const [department, setDepartment] = useState<Department>('Content Team');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  // Quick Discussion Task Form
  const [discussTaskTitle, setDiscussTaskTitle] = useState('');
  const [discussTaskBrand, setDiscussTaskBrand] = useState(brands[0]?.id || 'b-1');

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    await createTeamMember({
      name: name.trim(),
      department,
      email: email.trim() || `${name.toLowerCase().replace(/\s+/g, '')}@brandflow.io`,
      phone: phone.trim(),
      role: 'content_team',
      assignedBrandIds: brands.map(b => b.id),
      avatar: `https://images.unsplash.com/photo-${1534528741775 + Math.floor(Math.random() * 500)}?w=150&auto=format&fit=crop&q=80`,
    });

    setName('');
    setEmail('');
    setPhone('');
    setIsAddModalOpen(false);
    showToast({ type: 'success', title: 'Colleague Added', description: name.trim() });
  };

  const handleDeleteMember = async (id: string, name: string) => {
    if (confirm(`Remove "${name}" from your collaborators list?`)) {
      await deleteTeamMember(id);
      showToast({ type: 'info', title: 'Colleague removed' });
    }
  };

  const handleAddDiscussionTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!discussTaskTitle.trim() || !activeDiscussMember) return;

    const brandObj = brands.find(b => b.id === discussTaskBrand) || brands[0];

    await createTask({
      title: `${discussTaskTitle.trim()} (Discuss w/ ${activeDiscussMember.name})`,
      description: `Coordination task with ${activeDiscussMember.name} (${activeDiscussMember.department})`,
      brandId: brandObj.id,
      brandName: brandObj.name,
      collaboratorName: activeDiscussMember.name,
      dueDate: new Date().toISOString().split('T')[0],
      priority: 'Medium',
      status: 'To Do',
      category: 'General',
      assigneeId: currentUser.id,
      assigneeName: currentUser.name,
      assignedById: currentUser.id,
      assignedByName: currentUser.name
    });

    setDiscussTaskTitle('');
    setActiveDiscussMember(null);
    showToast({ 
      type: 'success', 
      title: 'Discussion Task Added ✓', 
      description: `Tagged with ${activeDiscussMember.name}` 
    });
  };

  return (
    <div className="space-y-6 pb-16 max-w-6xl mx-auto">
      {/* Top Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-obsidian-950 via-slate-900 to-indigo-950 text-white p-6 sm:p-7 border border-white/10 shadow-elevated">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider bg-brand-500/20 text-brand-300 px-2.5 py-0.5 rounded-full border border-brand-500/30 flex items-center gap-1">
                <Users size={12} />
                Team & Collaborators
              </span>
              <span className="text-xs text-slate-400">{team.length} Team Members</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Collaborator Directory & Discussion Tasks
            </h1>
            <p className="text-xs text-slate-300 max-w-xl">
              Keep track of team colleagues, their departments, and easily tag tasks that require discussion or coordination with them (e.g. Discuss reel concepts with Isha).
            </p>
          </div>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold shadow-md shadow-brand-500/25 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
          >
            <Plus size={16} />
            <span>Add Colleague</span>
          </button>
        </div>
      </div>

      {/* Collaborators Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {team.map((member) => {
          // Find tasks where this member is the collaborator or assignee
          const linkedTasks = tasks.filter(t => 
            t.collaboratorName === member.name || 
            t.title.toLowerCase().includes(member.name.toLowerCase())
          );
          const activeTasks = linkedTasks.filter(t => t.status !== 'Done');

          return (
            <div
              key={member.id}
              className="glass-card rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-subtle p-5 flex flex-col justify-between transition-all"
            >
              <div className="space-y-3.5">
                {/* Header: Avatar, Name, Department & Delete */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <img 
                      src={member.avatar} 
                      alt={member.name}
                      className="w-12 h-12 rounded-xl object-cover border border-slate-200 shadow-2xs bg-white"
                    />
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">{member.name}</h3>
                      <span className="inline-block text-[10px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md mt-0.5 border border-slate-200">
                        {member.department}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDeleteMember(member.id, member.name)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                    title="Remove colleague"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>

                {/* Linked Discussion Tasks */}
                <div className="pt-2 border-t border-slate-100 space-y-2">
                  <div className="flex items-center justify-between text-[11px] text-slate-500">
                    <span className="font-semibold text-slate-700 flex items-center gap-1">
                      <MessageSquare size={12} className="text-purple-600" />
                      Tasks to Discuss ({activeTasks.length})
                    </span>
                    <button
                      onClick={() => setActiveDiscussMember(member)}
                      className="text-brand-600 font-bold hover:underline text-[10px]"
                    >
                      + Add Task
                    </button>
                  </div>

                  {activeTasks.length === 0 ? (
                    <div className="p-2.5 bg-slate-50 rounded-xl text-center text-[11px] text-slate-400 italic">
                      No pending discussions with {member.name}.
                    </div>
                  ) : (
                    <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1 custom-scrollbar">
                      {activeTasks.map(t => (
                        <div
                          key={t.id}
                          onClick={() => setSelectedTaskId(t.id)}
                          className="p-2 bg-slate-50 hover:bg-brand-50/50 rounded-lg border border-slate-200/80 text-xs cursor-pointer transition-colors"
                        >
                          <div className="font-medium text-slate-800 truncate">{t.title}</div>
                          <div className="text-[10px] text-slate-400 mt-0.5 flex items-center justify-between">
                            <span>{t.brandName}</span>
                            <span>{t.dueDate || 'Today'}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Action: Quick Discussion Task Trigger */}
              <div className="pt-3 border-t border-slate-100 mt-4">
                <button
                  onClick={() => setActiveDiscussMember(member)}
                  className="w-full py-2 px-3 bg-slate-100 hover:bg-brand-50 text-slate-700 hover:text-brand-700 rounded-xl text-xs font-semibold transition-all border border-slate-200 flex items-center justify-center gap-1.5"
                >
                  <Plus size={13} />
                  <span>Discuss Task with {member.name.split(' ')[0]}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Colleague Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-elevated border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
              <div className="flex items-center gap-2">
                <Users size={16} className="text-brand-600" />
                <h3 className="text-sm font-bold text-slate-900">Add Team Colleague</h3>
              </div>
              <button onClick={() => setIsAddModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddMember} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Colleague Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Esha Sharma"
                  className="w-full text-xs px-3.5 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Department *</label>
                <select
                  value={department}
                  onChange={(e: any) => setDepartment(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 border border-slate-300 rounded-xl focus:outline-none bg-white"
                >
                  <option value="Content Team">Content Team</option>
                  <option value="Project Management">Project Management</option>
                  <option value="Video Editing">Video Editing</option>
                  <option value="Graphic Design">Graphic Design</option>
                  <option value="Performance Marketing">Performance Marketing</option>
                  <option value="Brand Management">Brand Management</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Email (Optional)</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="esha@brandflow.io"
                  className="w-full text-xs px-3.5 py-2.5 border border-slate-300 rounded-xl focus:outline-none"
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
                  className="px-5 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-brand-500/20"
                >
                  Save Colleague
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Discussion Task Modal */}
      {activeDiscussMember && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-elevated border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
              <div className="flex items-center gap-2">
                <MessageSquare size={16} className="text-purple-600" />
                <h3 className="text-sm font-bold text-slate-900">
                  New Discussion Task w/ {activeDiscussMember.name}
                </h3>
              </div>
              <button onClick={() => setActiveDiscussMember(null)} className="p-1 text-slate-400 hover:text-slate-600">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddDiscussionTask} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Discussion Topic / Task Title *</label>
                <input
                  type="text"
                  required
                  value={discussTaskTitle}
                  onChange={(e) => setDiscussTaskTitle(e.target.value)}
                  placeholder={`e.g. Review reel hooks & captions for HOF`}
                  className="w-full text-xs px-3.5 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Brand *</label>
                <select
                  value={discussTaskBrand}
                  onChange={(e) => setDiscussTaskBrand(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 border border-slate-300 rounded-xl focus:outline-none bg-white"
                >
                  {brands.map(b => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              </div>

              <div className="p-3 bg-purple-50 rounded-xl border border-purple-100 text-[11px] text-purple-900">
                📌 This task will be added to your daily to-dos and tagged with {activeDiscussMember.name} ({activeDiscussMember.department}).
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveDiscussMember(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-purple-500/20"
                >
                  Add Discussion Task →
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
