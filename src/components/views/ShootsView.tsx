'use client';

import React, { useState } from 'react';
import { 
  Camera, 
  Plus, 
  MapPin, 
  Clock, 
  CheckCircle2, 
  Calendar, 
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  Users,
  Trash2,
  Edit2,
  Sparkles,
  Check,
  X
} from 'lucide-react';
import { useBrandFlow } from '@/context/BrandFlowContext';
import { Shoot, ShootStatus } from '@/lib/types';

export default function ShootsView() {
  const { 
    shoots, 
    brands, 
    activeBrandId, 
    createShoot,
    updateShoot, 
    deleteShoot,
    createTask,
    currentUser,
    showToast 
  } = useBrandFlow();

  // Selected Planning Month (defaults to current month: YYYY-MM)
  const [selectedMonthDate, setSelectedMonthDate] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });

  const [activeTabMode, setActiveTabMode] = useState<'quota' | 'all'>('quota');

  // Inline Schedule Form State for a specific brand slot
  const [activeSlotForm, setActiveSlotForm] = useState<{
    brandId: string;
    brandName: string;
    slotNum: number;
    shootId?: string;
  } | null>(null);

  const [formDate, setFormDate] = useState('');
  const [formTime, setFormTime] = useState('10:00 AM');
  const [formLocation, setFormLocation] = useState('');
  const [formTeam, setFormTeam] = useState('Kunal (Video), Pinky (PM)');

  const monthYearStr = selectedMonthDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const monthKey = `${selectedMonthDate.getFullYear()}-${String(selectedMonthDate.getMonth() + 1).padStart(2, '0')}`;

  const handlePrevMonth = () => {
    setSelectedMonthDate(new Date(selectedMonthDate.getFullYear(), selectedMonthDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setSelectedMonthDate(new Date(selectedMonthDate.getFullYear(), selectedMonthDate.getMonth() + 1, 1));
  };

  const openScheduleSlot = (brandId: string, brandName: string, slotNum: number, existingShoot?: Shoot) => {
    if (existingShoot) {
      setFormDate(existingShoot.shootDate);
      setFormTime(existingShoot.startTime || '10:00 AM');
      setFormLocation(existingShoot.location || '');
      setFormTeam(existingShoot.shootTeam || existingShoot.photographer || 'Kunal (Video)');
      setActiveSlotForm({ brandId, brandName, slotNum, shootId: existingShoot.id });
    } else {
      // Default to 10th or 20th of the month
      const defaultDay = slotNum === 1 ? '10' : '22';
      setFormDate(`${monthKey}-${defaultDay}`);
      setFormTime('10:00 AM');
      setFormLocation('Studio / Main Location');
      setFormTeam('Kunal (Video), Pinky (PM)');
      setActiveSlotForm({ brandId, brandName, slotNum });
    }
  };

  const handleSaveSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeSlotForm || !formDate) return;

    if (activeSlotForm.shootId) {
      // Update existing shoot
      await updateShoot({
        id: activeSlotForm.shootId,
        shootDate: formDate,
        startTime: formTime,
        location: formLocation,
        shootTeam: formTeam,
        status: 'Confirmed'
      });
      showToast({ type: 'success', title: 'Shoot Updated ✓', description: `${activeSlotForm.brandName} - Shoot #${activeSlotForm.slotNum}` });
    } else {
      // Create new shoot for this monthly slot
      const createdShoot = await createShoot({
        title: `${activeSlotForm.brandName} Monthly Shoot #${activeSlotForm.slotNum} (${monthYearStr})`,
        brandId: activeSlotForm.brandId,
        brandName: activeSlotForm.brandName,
        shootDate: formDate,
        startTime: formTime,
        endTime: '04:00 PM',
        month: monthKey,
        shootNumber: activeSlotForm.slotNum,
        location: formLocation,
        shootTeam: formTeam,
        photographer: formTeam,
        videographer: formTeam,
        brandManager: currentUser.name,
        projectManager: 'Pinky',
        status: 'Confirmed',
        contentTeam: ['Pinky', 'Kunal', 'Isha'],
        shootBrief: `Monthly Content Shoot #${activeSlotForm.slotNum} for ${activeSlotForm.brandName}`,
        shotList: ['Reel concepts', 'Product showcase', 'Team b-roll'],
        clientRequirements: 'Deliver 15 raw reels and b-roll dumps.',
        referenceFiles: [],
        notes: `Scheduled via Monthly Advance Planner for ${monthYearStr}`,
        rawDataLocation: `Google Drive / ${activeSlotForm.brandName} / Raw_${formDate.replace(/-/g, '_')}`
      });

      // Also create a linked task in the user's to-do list
      await createTask({
        title: `📸 Execute Shoot #${activeSlotForm.slotNum} for ${activeSlotForm.brandName} (${formLocation})`,
        description: `Call time: ${formTime}. Crew: ${formTeam}.`,
        brandId: activeSlotForm.brandId,
        brandName: activeSlotForm.brandName,
        dueDate: formDate,
        priority: 'High',
        status: 'To Do',
        category: 'Shoot',
        shootId: createdShoot?.id,
        assigneeId: currentUser.id,
        assigneeName: currentUser.name,
        assignedById: currentUser.id,
        assignedByName: currentUser.name
      });

      showToast({ 
        type: 'success', 
        title: 'Shoot Scheduled & Settled! ✓', 
        description: `Shoot #${activeSlotForm.slotNum} for ${activeSlotForm.brandName} added to calendar.` 
      });
    }

    setActiveSlotForm(null);
  };

  const handleDeleteShoot = async (id: string) => {
    if (confirm('Delete this scheduled shoot?')) {
      await deleteShoot(id);
      showToast({ type: 'info', title: 'Shoot deleted' });
    }
  };

  const filteredBrands = brands.filter(b => b.status !== 'archived' && (activeBrandId === 'all' || b.id === activeBrandId));

  return (
    <div className="space-y-6 pb-16 max-w-6xl mx-auto">
      {/* Top Banner: Advance Shoot Planner Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-obsidian-950 via-slate-900 to-purple-950 text-white p-6 sm:p-7 border border-white/10 shadow-elevated">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider bg-purple-500/20 text-purple-300 px-2.5 py-0.5 rounded-full border border-purple-500/30 flex items-center gap-1">
                <Camera size={12} />
                2 Shoots / Month Target
              </span>
              <span className="text-xs text-slate-400">Advance Production Planner</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Shoot Planning & Monthly Quotas
            </h1>
            <p className="text-xs text-slate-300 max-w-xl">
              Each brand requires 2 shoots per month. Review pending shoot quotas in advance, fill in the date, time, location, and team, and settle them straight into your daily tasks and calendar.
            </p>
          </div>

          {/* Month Navigator Controls */}
          <div className="flex items-center gap-2 bg-white/[0.08] p-1.5 rounded-xl border border-white/15 backdrop-blur-md">
            <button
              onClick={handlePrevMonth}
              className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
              title="Previous Month"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="text-xs font-bold text-white px-2.5 font-mono">
              {monthYearStr}
            </span>
            <button
              onClick={handleNextMonth}
              className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
              title="Next Month"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* View Mode Toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-semibold">
          <button
            onClick={() => setActiveTabMode('quota')}
            className={`px-3 py-1.5 rounded-lg transition-all ${activeTabMode === 'quota' ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'text-slate-500 hover:text-slate-900'}`}
          >
            Monthly Brand Quotas (2 Shoots/Mo)
          </button>
          <button
            onClick={() => setActiveTabMode('all')}
            className={`px-3 py-1.5 rounded-lg transition-all ${activeTabMode === 'all' ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'text-slate-500 hover:text-slate-900'}`}
          >
            All Scheduled Shoots List ({shoots.length})
          </button>
        </div>

        <span className="text-xs text-slate-500">
          Viewing: <strong className="text-slate-800">{monthYearStr}</strong>
        </span>
      </div>

      {activeTabMode === 'quota' ? (
        /* Monthly Quota Cards (2 Shoots per Brand) */
        <div className="space-y-5">
          {filteredBrands.map((brand) => {
            // Find shoots for this brand in the selected month
            const brandMonthShoots = shoots.filter(s => {
              if (s.brandId !== brand.id) return false;
              // Check if shoot date falls in this month
              if (s.shootDate && s.shootDate.startsWith(monthKey)) return true;
              if (s.month === monthKey) return true;
              return false;
            });

            // Target quota: 2 shoots per month
            const shoot1 = brandMonthShoots[0];
            const shoot2 = brandMonthShoots[1];

            return (
              <div 
                key={brand.id}
                className="glass-card rounded-2xl border border-slate-200/90 p-5 space-y-4 shadow-subtle"
              >
                {/* Brand Header */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                  <div className="flex items-center gap-3">
                    <span 
                      className="w-3 h-3 rounded-full flex-shrink-0" 
                      style={{ backgroundColor: brand.brandColor }} 
                    />
                    <div>
                      <h3 className="text-base font-bold text-slate-900">{brand.name}</h3>
                      <div className="text-[11px] text-slate-500">
                        Monthly Target: <strong>2 Shoots in {monthYearStr}</strong>
                      </div>
                    </div>
                  </div>

                  <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                    brandMonthShoots.length >= 2 
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' 
                      : brandMonthShoots.length === 1 
                      ? 'bg-blue-100 text-blue-800 border border-blue-200'
                      : 'bg-amber-100 text-amber-800 border border-amber-200'
                  }`}>
                    {brandMonthShoots.length} / 2 Shoots Scheduled
                  </span>
                </div>

                {/* 2 Shoot Quota Slots Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Shoot Slot #1 */}
                  <div className={`p-4 rounded-xl border transition-all ${
                    shoot1 
                      ? 'bg-white border-slate-200 shadow-2xs space-y-2' 
                      : 'bg-amber-500/10 border-amber-300 border-dashed space-y-3'
                  }`}>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                        <Camera size={13} className={shoot1 ? 'text-purple-600' : 'text-amber-700'} />
                        Shoot 1 of 2
                      </span>
                      {shoot1 ? (
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                          <Check size={11} />
                          Scheduled ✓
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-amber-800 bg-amber-200/80 px-2 py-0.5 rounded-full animate-pulse">
                          ⚠️ Shoot Pending!
                        </span>
                      )}
                    </div>

                    {shoot1 ? (
                      <div className="space-y-1 text-xs">
                        <div className="flex items-center justify-between pt-1">
                          <span className="text-slate-500">Date & Time:</span>
                          <span className="font-mono font-bold text-slate-800">{shoot1.shootDate} @ {shoot1.startTime}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500">Location:</span>
                          <span className="font-semibold text-slate-700 truncate max-w-[180px]">{shoot1.location || 'Studio'}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500">Crew / Team:</span>
                          <span className="font-medium text-slate-700 truncate max-w-[180px]">{shoot1.shootTeam || shoot1.photographer}</span>
                        </div>

                        <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 mt-2">
                          <button
                            onClick={() => openScheduleSlot(brand.id, brand.name, 1, shoot1)}
                            className="px-2.5 py-1 text-[11px] font-semibold text-slate-600 hover:text-brand-600 hover:bg-slate-50 rounded-lg transition-colors flex items-center gap-1"
                          >
                            <Edit2 size={11} />
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteShoot(shoot1.id)}
                            className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors"
                            title="Remove"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <p className="text-xs text-amber-800">
                          Shoot #1 for {brand.name} in {monthYearStr} has not been planned yet.
                        </p>
                        <button
                          onClick={() => openScheduleSlot(brand.id, brand.name, 1)}
                          className="mt-2.5 w-full py-2 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white rounded-lg text-xs font-bold shadow-xs transition-all flex items-center justify-center gap-1.5"
                        >
                          <Plus size={13} />
                          <span>Schedule Shoot #1 Now</span>
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Shoot Slot #2 */}
                  <div className={`p-4 rounded-xl border transition-all ${
                    shoot2 
                      ? 'bg-white border-slate-200 shadow-2xs space-y-2' 
                      : 'bg-amber-500/10 border-amber-300 border-dashed space-y-3'
                  }`}>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                        <Camera size={13} className={shoot2 ? 'text-purple-600' : 'text-amber-700'} />
                        Shoot 2 of 2
                      </span>
                      {shoot2 ? (
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                          <Check size={11} />
                          Scheduled ✓
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-amber-800 bg-amber-200/80 px-2 py-0.5 rounded-full">
                          Pending Shoot #2
                        </span>
                      )}
                    </div>

                    {shoot2 ? (
                      <div className="space-y-1 text-xs">
                        <div className="flex items-center justify-between pt-1">
                          <span className="text-slate-500">Date & Time:</span>
                          <span className="font-mono font-bold text-slate-800">{shoot2.shootDate} @ {shoot2.startTime}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500">Location:</span>
                          <span className="font-semibold text-slate-700 truncate max-w-[180px]">{shoot2.location || 'Studio'}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500">Crew / Team:</span>
                          <span className="font-medium text-slate-700 truncate max-w-[180px]">{shoot2.shootTeam || shoot2.photographer}</span>
                        </div>

                        <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 mt-2">
                          <button
                            onClick={() => openScheduleSlot(brand.id, brand.name, 2, shoot2)}
                            className="px-2.5 py-1 text-[11px] font-semibold text-slate-600 hover:text-brand-600 hover:bg-slate-50 rounded-lg transition-colors flex items-center gap-1"
                          >
                            <Edit2 size={11} />
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteShoot(shoot2.id)}
                            className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors"
                            title="Remove"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <p className="text-xs text-amber-800">
                          Second shoot for {brand.name} in {monthYearStr} is remaining.
                        </p>
                        <button
                          onClick={() => openScheduleSlot(brand.id, brand.name, 2)}
                          className="mt-2.5 w-full py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-bold shadow-xs transition-all flex items-center justify-center gap-1.5"
                        >
                          <Plus size={13} />
                          <span>Schedule Shoot #2 Now</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* All Scheduled Shoots List Table */
        <div className="glass-card rounded-2xl overflow-hidden shadow-card border border-slate-200">
          <div className="p-3.5 bg-slate-50 border-b border-slate-200 grid grid-cols-12 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            <div className="col-span-3">Brand & Title</div>
            <div className="col-span-2">Date & Time</div>
            <div className="col-span-3">Location</div>
            <div className="col-span-3">Crew / Shoot Team</div>
            <div className="col-span-1 text-right">Action</div>
          </div>

          <div className="divide-y divide-slate-100">
            {shoots.length === 0 ? (
              <div className="p-10 text-center text-xs text-slate-400">
                No shoots scheduled yet.
              </div>
            ) : (
              shoots.map((s) => (
                <div key={s.id} className="p-3.5 grid grid-cols-12 items-center text-xs hover:bg-slate-50/70">
                  <div className="col-span-3 font-semibold text-slate-900 truncate">
                    <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-brand-50 text-brand-700 mr-2">
                      {s.brandName}
                    </span>
                    {s.title}
                  </div>
                  <div className="col-span-2 font-mono text-slate-700">
                    {s.shootDate} ({s.startTime})
                  </div>
                  <div className="col-span-3 text-slate-600 truncate">
                    📍 {s.location || 'Studio'}
                  </div>
                  <div className="col-span-3 text-slate-600 truncate">
                    👥 {s.shootTeam || s.photographer || 'Production Crew'}
                  </div>
                  <div className="col-span-1 text-right">
                    <button
                      onClick={() => handleDeleteShoot(s.id)}
                      className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                      title="Delete shoot"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Settle Shoot Modal / Drawer */}
      {activeSlotForm && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-elevated border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
              <div className="flex items-center gap-2">
                <Camera size={16} className="text-purple-600" />
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Schedule Shoot #{activeSlotForm.slotNum} — {activeSlotForm.brandName}
                  </h3>
                  <p className="text-[11px] text-slate-500">{monthYearStr} Quota</p>
                </div>
              </div>
              <button 
                onClick={() => setActiveSlotForm(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveSlot} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Shoot Date *</label>
                  <input
                    type="date"
                    required
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Call Time *</label>
                  <input
                    type="text"
                    required
                    value={formTime}
                    onChange={(e) => setFormTime(e.target.value)}
                    placeholder="10:00 AM"
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Shoot Location (Where) *</label>
                <input
                  type="text"
                  required
                  value={formLocation}
                  onChange={(e) => setFormLocation(e.target.value)}
                  placeholder="e.g. Bandra Studio / Kitchen Set / Outdoor"
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Shoot Team (Who) *</label>
                <input
                  type="text"
                  required
                  value={formTeam}
                  onChange={(e) => setFormTeam(e.target.value)}
                  placeholder="e.g. Kunal (Videographer), Pinky (PM)"
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                />
              </div>

              <div className="p-3 bg-purple-50 rounded-xl border border-purple-100 text-[11px] text-purple-900">
                ✨ Once scheduled, this shoot is automatically booked into your daily to-dos and unified calendar.
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveSlotForm(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-purple-500/20"
                >
                  Confirm & Settle Shoot →
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
