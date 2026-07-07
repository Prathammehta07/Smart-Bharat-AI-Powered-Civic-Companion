import React, { useState, useEffect } from 'react';
import { Complaint, SupportedLanguage } from '../types.ts';
import { translations } from '../i18n.ts';
import { FileText, MapPin, CheckCircle, AlertTriangle, Clock, RefreshCw, Send, CheckCircle2, ChevronRight, X, ArrowUpRight } from 'lucide-react';

interface ComplaintsProps {
  lang: SupportedLanguage;
  complaintsList: Complaint[];
  refreshComplaints: () => void;
}

export default function Complaints({ lang, complaintsList, refreshComplaints }: ComplaintsProps) {
  const t = translations[lang];

  // Form State
  const [category, setCategory] = useState('roads');
  const [description, setDescription] = useState('');
  const [locationText, setLocationText] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);

  // Filter State
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);

  // Status updating simulation for demo
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);

  const categories = [
    { id: 'roads', label: 'Roads & Potholes' },
    { id: 'sanitation', label: 'Sanitation & Garbage' },
    { id: 'water', label: 'Water Leakage / Supply' },
    { id: 'electricity', label: 'Electricity / Streetlights' },
    { id: 'public safety', label: 'Public Safety & Hazards' },
    { id: 'other', label: 'Other Civic Grievances' }
  ];

  // Submit Complaint
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description) return;
    
    try {
      setSubmitting(true);
      const res = await fetch('/api/complaints', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category,
          description,
          location_text: locationText,
          photo_url: photoUrl
        })
      });
      const data = await res.json();
      if (data.success) {
        setFormSuccess(data.complaintId);
        setDescription('');
        setLocationText('');
        setPhotoUrl('');
        refreshComplaints();
      }
    } catch (e) {
      console.error('Error submitting complaint:', e);
    } finally {
      setSubmitting(false);
    }
  };

  // Demo status simulator
  const handleSimulateStatus = async (complaintId: string, nextStatus: string) => {
    try {
      setUpdatingStatus(complaintId);
      let note = '';
      if (nextStatus === 'Under Review') note = 'Municipal Engineer visited site and confirmed report.';
      if (nextStatus === 'In Progress') note = 'Work order issued. Contractor has scheduled repair teams.';
      if (nextStatus === 'Resolved') note = 'Repair completed successfully. Visual evidence uploaded and approved.';

      const res = await fetch(`/api/complaints/${complaintId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus, note })
      });
      const data = await res.json();
      if (data.success) {
        refreshComplaints();
        // Update selected complaint in details modal if open
        if (selectedComplaint && selectedComplaint.id === complaintId) {
          const updated = complaintsList.find(c => c.id === complaintId);
          if (updated) {
            // Optimistically update the list locally first
            const newTimeline = [...selectedComplaint.timeline, { status: nextStatus, time: new Date().toISOString(), note }];
            setSelectedComplaint({ ...selectedComplaint, status: nextStatus as any, timeline: newTimeline });
          }
        }
      }
    } catch (e) {
      console.error('Error updating status:', e);
    } finally {
      setUpdatingStatus(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Submitted':
        return <span className="bg-blue-50 text-blue-700 border border-blue-100 text-[10px] font-bold px-2 py-0.5 rounded-full">{t.statusSubmitted}</span>;
      case 'Under Review':
        return <span className="bg-amber-50 text-amber-700 border border-amber-100 text-[10px] font-bold px-2 py-0.5 rounded-full">{t.statusReview}</span>;
      case 'In Progress':
        return <span className="bg-indigo-50 text-indigo-700 border border-indigo-100 text-[10px] font-bold px-2 py-0.5 rounded-full">{t.statusProgress}</span>;
      case 'Resolved':
        return <span className="bg-green-50 text-green-700 border border-green-100 text-[10px] font-bold px-2 py-0.5 rounded-full">{t.statusResolved}</span>;
      default:
        return null;
    }
  };

  const filteredComplaints = complaintsList.filter(c => {
    if (!statusFilter) return true;
    return c.status === statusFilter;
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      
      {/* LEFT COLUMN: Report form */}
      <div className="lg:col-span-1 space-y-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <h2 className="font-display font-bold text-lg text-navy-dark flex items-center gap-2 mb-4">
            <AlertTriangle className="w-5 h-5 text-saffron" />
            {t.complainFormTitle}
          </h2>

          {formSuccess ? (
            <div className="bg-teal-50 border border-teal-200 text-teal-800 p-4 rounded-xl text-center">
              <CheckCircle2 className="w-12 h-12 text-accent-teal mx-auto mb-2" />
              <h3 className="font-bold text-sm">{t.complaintSuccess}</h3>
              <p className="text-xs text-gray-500 mt-1">
                {t.complaintIdLabel}: <strong className="text-navy-dark">{formSuccess}</strong>
              </p>
              <button
                onClick={() => setFormSuccess(null)}
                className="mt-4 px-4 py-1.5 bg-accent-teal hover:bg-accent-teal-hover text-white text-xs font-bold rounded-lg transition"
              >
                File Another Complaint
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                  {t.complainCategory}
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-xs focus:ring-accent-teal focus:border-accent-teal"
                >
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                  {t.complainDesc}
                </label>
                <textarea
                  required
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder={t.complainPlaceholderDesc}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-xs focus:ring-accent-teal focus:border-accent-teal"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                  {t.complainLoc}
                </label>
                <div className="relative">
                  <MapPin className="absolute left-2.5 top-2.5 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    required
                    value={locationText}
                    onChange={(e) => setLocationText(e.target.value)}
                    placeholder={t.complainPlaceholderLoc}
                    className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-xs focus:ring-accent-teal focus:border-accent-teal"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                  {t.photoUpload}
                </label>
                <input
                  type="text"
                  value={photoUrl}
                  onChange={(e) => setPhotoUrl(e.target.value)}
                  placeholder={t.photoPlaceholder}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-xs focus:ring-accent-teal focus:border-accent-teal"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-2.5 bg-accent-teal hover:bg-accent-teal-hover disabled:bg-gray-400 text-white font-bold rounded-lg text-xs transition duration-150 flex items-center justify-center gap-1.5 shadow"
              >
                {submitting ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-3.5 h-3.5" />
                )}
                {t.submitComplaint}
              </button>
            </form>
          )}
        </div>
      </div>

      {/* RIGHT COLUMN: Complaint tracker dashboard */}
      <div className="lg:col-span-2 space-y-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-5 pb-4 border-b border-gray-100">
            <h2 className="font-display font-bold text-lg text-navy-dark flex items-center gap-2">
              <FileText className="w-5 h-5 text-accent-teal" />
              {t.myComplaintsTitle}
            </h2>

            {/* Filter */}
            <div className="flex gap-1 overflow-x-auto pb-1 sm:pb-0">
              {['', 'Submitted', 'Under Review', 'In Progress', 'Resolved'].map(filter => (
                <button
                  key={filter}
                  onClick={() => setStatusFilter(filter)}
                  className={`px-2.5 py-1 rounded-md text-[10px] font-bold whitespace-nowrap transition duration-150 ${
                    statusFilter === filter
                      ? 'bg-navy-dark text-white'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-500'
                  }`}
                >
                  {filter === '' ? t.filterAll : filter}
                </button>
              ))}
            </div>
          </div>

          {/* List of complaints */}
          {filteredComplaints.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-xs text-gray-400 font-medium">{t.noComplaints}</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100 max-h-[480px] overflow-y-auto pr-1">
              {filteredComplaints.map(c => (
                <div
                  key={c.id}
                  className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 group"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold text-navy-dark font-display">{c.id.toUpperCase()}</span>
                      {getStatusBadge(c.status)}
                      <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.2 bg-gray-100 text-gray-500 rounded">
                        {c.category}
                      </span>
                    </div>
                    <p className="text-xs text-gray-700 font-semibold mt-1.5 line-clamp-1 leading-snug">
                      {c.description}
                    </p>
                    <p className="text-[10px] text-gray-400 mt-1 flex items-center gap-1">
                      <MapPin className="w-3 h-3 flex-shrink-0" />
                      <span className="line-clamp-1">{c.location_text}</span>
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    {/* Simulation buttons (Only visible in Demo/Hackathon Mode) */}
                    {c.status !== 'Resolved' && (
                      <button
                        onClick={() => {
                          const statusOrder = ['Submitted', 'Under Review', 'In Progress', 'Resolved'];
                          const currIndex = statusOrder.indexOf(c.status);
                          if (currIndex !== -1 && currIndex < statusOrder.length - 1) {
                            handleSimulateStatus(c.id, statusOrder[currIndex + 1]);
                          }
                        }}
                        disabled={updatingStatus === c.id}
                        className="text-[9px] font-bold text-saffron bg-amber-50 border border-amber-100 hover:bg-amber-100 px-2 py-1 rounded transition duration-150 flex items-center gap-1"
                      >
                        <RefreshCw className={`w-2.5 h-2.5 ${updatingStatus === c.id ? 'animate-spin' : ''}`} />
                        Advance State
                      </button>
                    )}

                    <button
                      onClick={() => setSelectedComplaint(c)}
                      className="text-xs font-bold text-accent-teal hover:text-accent-teal-hover flex items-center gap-0.5 py-1 px-2 hover:bg-teal-50 rounded"
                    >
                      {t.viewDetails}
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Details Timeline Modal */}
      {selectedComplaint && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white rounded-xl shadow-2xl overflow-hidden flex flex-col relative animate-scale-up">
            
            {/* Modal Header */}
            <div className="bg-navy-dark text-white p-5 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase bg-accent-teal px-2 py-0.5 rounded">
                  {selectedComplaint.category}
                </span>
                <h3 className="font-display font-bold text-sm mt-1">
                  Ticket {selectedComplaint.id.toUpperCase()} Status Tracking
                </h3>
              </div>
              <button
                onClick={() => setSelectedComplaint(null)}
                className="p-1 hover:bg-gray-800 rounded-full transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 overflow-y-auto max-h-[400px] space-y-5">
              
              {/* Description summary */}
              <div>
                <span className="text-[10px] font-bold text-gray-400 uppercase">Complaint Description</span>
                <p className="text-xs text-gray-700 mt-1 font-semibold leading-relaxed">
                  {selectedComplaint.description}
                </p>
                <p className="text-[10px] text-gray-400 mt-1 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" />
                  {selectedComplaint.location_text}
                </p>
              </div>

              {/* photo preview if uploaded */}
              {selectedComplaint.photo_url && (
                <div className="rounded-lg overflow-hidden border border-gray-200">
                  <img src={selectedComplaint.photo_url} alt="complaint proof" className="w-full h-32 object-cover" />
                </div>
              )}

              {/* Status Indicator */}
              <div className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-lg">
                <span className="text-xs font-bold text-gray-500">Current Status:</span>
                {getStatusBadge(selectedComplaint.status)}
              </div>

              {/* Vertical Timeline */}
              <div>
                <h4 className="text-xs font-bold text-navy-dark uppercase mb-3">
                  {t.timelineTitle}
                </h4>
                <div className="relative pl-5 border-l border-gray-200 ml-2 space-y-4">
                  {selectedComplaint.timeline.map((evt, idx) => (
                    <div key={idx} className="relative">
                      {/* status dot */}
                      <span className={`absolute -left-[25px] top-1 w-2.5 h-2.5 rounded-full border-2 border-white ${
                        evt.status === 'Resolved' ? 'bg-green-600' :
                        evt.status === 'In Progress' ? 'bg-indigo-600' :
                        evt.status === 'Under Review' ? 'bg-amber-500' : 'bg-blue-500'
                      }`}></span>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-extrabold text-navy-dark">{evt.status}</span>
                          <span className="text-[10px] text-gray-400 font-medium">
                            {new Date(evt.time).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-[11px] text-gray-500 mt-0.5 leading-normal">
                          {evt.note}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Simulated Live Feedback controls for Judges */}
            <div className="p-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
              <span className="text-[9px] text-gray-400 font-bold uppercase flex items-center gap-1">
                <CheckCircle className="w-3 h-3 text-saffron" />
                Demo Simulator Panel
              </span>

              {selectedComplaint.status !== 'Resolved' ? (
                <button
                  onClick={() => {
                    const statusOrder = ['Submitted', 'Under Review', 'In Progress', 'Resolved'];
                    const currIndex = statusOrder.indexOf(selectedComplaint.status);
                    if (currIndex !== -1 && currIndex < statusOrder.length - 1) {
                      handleSimulateStatus(selectedComplaint.id, statusOrder[currIndex + 1]);
                    }
                  }}
                  className="px-3 py-1 bg-saffron hover:bg-amber-600 text-navy-dark text-[10px] font-bold rounded shadow-sm transition flex items-center gap-1"
                >
                  Advance Next Status State
                  <ChevronRight className="w-3 h-3" />
                </button>
              ) : (
                <span className="text-xs font-bold text-green-600 flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" /> Issue Closed
                </span>
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
