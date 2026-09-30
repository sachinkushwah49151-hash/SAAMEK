import React, { useState } from 'react';
import type { CitizenTab } from '../types';
import { submitCitizenReport } from '../services/saamekBackendService';
import {
  FilePlus,
  Send,
  MapPin,
  Camera,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Wind,
  CloudFog,
  Factory,
  Tractor,
  Droplets,
  HelpCircle,
  Clock,
  Sparkles,
  ShieldCheck,
  Building2,
  Phone,
  User,
  Image as ImageIcon,
} from 'lucide-react';

interface ReportIssueViewProps {
  onReportSubmitted: () => void;
  onNavigateTab: (tab: CitizenTab) => void;
}

// Preset verified Gwalior landmarks for quick location selection
const GWALIOR_LANDMARKS = [
  { name: 'Maharaj Bada, Lashkar', lat: 26.2045, lon: 78.1578 },
  { name: 'Phoolbagh / Railway Colony', lat: 26.2183, lon: 78.1828 },
  { name: 'City Center / Kailash Nagar', lat: 26.1963, lon: 78.1792 },
  { name: 'Thatipur Commercial Area', lat: 26.2167, lon: 78.2083 },
  { name: 'Morar Industrial Corridor', lat: 26.2289, lon: 78.2256 },
  { name: 'Gwalior Fort Heritage Zone', lat: 26.2307, lon: 78.1691 },
  { name: 'Transport Nagar / Bahodapur', lat: 26.2412, lon: 78.1485 },
];

const ISSUE_CATEGORIES = [
  {
    id: 'garbage_burning',
    label: 'Open Waste / Garbage Burning',
    icon: <Flame className="w-5 h-5" />,
    desc: 'Municipal solid waste, plastic, or leaves burning in public spaces',
    color: 'border-rose-300 bg-rose-50 text-rose-800',
  },
  {
    id: 'industrial_emission',
    label: 'Industrial Smoke / Emission',
    icon: <Factory className="w-5 h-5" />,
    desc: 'Dense black or chemical chimney discharge exceeding normal levels',
    color: 'border-slate-400 bg-slate-100 text-slate-800',
  },
  {
    id: 'crop_burning',
    label: 'Crop Stubble / Agricultural Fire',
    icon: <Tractor className="w-5 h-5" />,
    desc: 'Farm field residue fires causing extensive regional smoke haze',
    color: 'border-amber-400 bg-amber-50 text-amber-900',
  },
  {
    id: 'dust_storm',
    label: 'Construction / Road Dust',
    icon: <Wind className="w-5 h-5" />,
    desc: 'Uncovered demolition, building work, or unpaved road dust clouds',
    color: 'border-orange-300 bg-orange-50 text-orange-800',
  },
  {
    id: 'air_pollution_spike',
    label: 'Severe Smog / Haze',
    icon: <CloudFog className="w-5 h-5" />,
    desc: 'Heavy atmospheric smog reducing visibility and causing eye irritation',
    color: 'border-sky-300 bg-sky-50 text-sky-800',
  },
  {
    id: 'chemical_odor',
    label: 'Chemical Odor / Toxic Gas',
    icon: <AlertTriangle className="w-5 h-5" />,
    desc: 'Pungent or hazardous chemical stench detected in residential areas',
    color: 'border-purple-300 bg-purple-50 text-purple-900',
  },
];

export const ReportIssueView: React.FC<ReportIssueViewProps> = ({
  onReportSubmitted,
  onNavigateTab,
}) => {
  const [reportType, setReportType] = useState('garbage_burning');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [locationName, setLocationName] = useState('Maharaj Bada, Lashkar');
  const [latitude, setLatitude] = useState(26.2045);
  const [longitude, setLongitude] = useState(78.1578);
  const [citizenName, setCitizenName] = useState('');
  const [citizenContact, setCitizenContact] = useState('');
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [submittedReport, setSubmittedReport] = useState<any | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSelectLandmark = (landmark: typeof GWALIOR_LANDMARKS[0]) => {
    setLocationName(landmark.name);
    setLatitude(landmark.lat);
    setLongitude(landmark.lon);
  };

  const handleSimulatePhoto = () => {
    // Provide a sample verified image placeholder
    setImageUrl('https://images.unsplash.com/photo-1611273426858-450d8e3c9fce?auto=format&fit=crop&w=600&q=80');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      setErrorMessage('Please provide a title and detailed description of the incident.');
      return;
    }

    setSubmitting(true);
    setErrorMessage(null);

    try {
      const created = await submitCitizenReport({
        report_type: reportType,
        title: title.trim(),
        description: description.trim(),
        latitude,
        longitude,
        location_name: locationName.trim() || 'Gwalior, Madhya Pradesh',
        citizen_name: citizenName.trim() || 'Anonymous Citizen',
        citizen_contact: citizenContact.trim() || undefined,
        image_data: imageUrl || undefined,
      });

      setSubmittedReport(created);
    } catch (err: any) {
      console.error('Failed to submit report:', err);
      setErrorMessage(err?.message || 'Failed to submit report. Please verify connection.');
    } finally {
      setSubmitting(false);
    }
  };

  if (submittedReport) {
    return (
      <div className="max-w-2xl mx-auto bg-white rounded-2xl border border-slate-200 shadow-xl p-8 sm:p-10 text-center my-6 space-y-6">
        <div className="w-18 h-18 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto border-2 border-emerald-200 shadow-sm">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <div>
          <h2 className="text-2xl font-black text-slate-900 mb-1.5">
            Environmental Report Submitted Successfully!
          </h2>
          <p className="text-sm text-slate-500 max-w-md mx-auto">
            Your report has been received and indexed by the SAAMEK Gwalior Environmental Intelligence unit.
          </p>
        </div>

        <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 text-left space-y-2.5">
          <div className="flex justify-between items-center text-xs text-slate-500 border-b border-slate-200 pb-2.5">
            <span className="font-medium">Reference Report ID</span>
            <span className="font-mono font-bold text-[#003366] text-sm bg-sky-50 border border-sky-200 px-2 py-0.5 rounded">
              {submittedReport.report_id || submittedReport.id}
            </span>
          </div>
          <div className="flex justify-between items-center text-xs text-slate-600">
            <span>Incident Type</span>
            <span className="font-bold text-slate-900 capitalize">
              {submittedReport.report_type?.replace(/_/g, ' ')}
            </span>
          </div>
          <div className="flex justify-between items-center text-xs text-slate-600">
            <span>Reported Location</span>
            <span className="font-semibold text-slate-900">{submittedReport.location_name}</span>
          </div>
          <div className="flex justify-between items-center text-xs text-slate-600">
            <span>Current Status</span>
            <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[11px] font-bold border border-amber-300">
              Pending Verification
            </span>
          </div>
        </div>

        <div className="p-4 bg-sky-50/80 text-sky-950 rounded-xl text-xs flex items-start gap-3 text-left border border-sky-200">
          <ShieldCheck className="w-5 h-5 text-sky-700 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <strong>What happens next?</strong> SAAMEK automatically cross-references your report with real-time ground sensor readings (OpenAQ) and satellite thermal passes (NASA FIRMS). Official authorities will review evidence and initiate field response.
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          <button
            onClick={() => onNavigateTab('my-reports')}
            className="px-7 py-3 rounded-xl bg-[#003366] text-white font-bold text-sm shadow-md hover:bg-[#002244] transition-all cursor-pointer"
          >
            Track in My Reports
          </button>
          <button
            onClick={() => {
              setSubmittedReport(null);
              setTitle('');
              setDescription('');
              setImageUrl(null);
            }}
            className="px-6 py-3 rounded-xl bg-slate-100 text-slate-700 font-semibold text-sm hover:bg-slate-200 transition-all cursor-pointer border border-slate-200"
          >
            Submit Another Report
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* ===== HERO HEADER ===== */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0a1628] via-[#0f2744] to-[#0a1e3d] shadow-xl p-6 sm:p-8">
        <div className="flex items-center gap-3.5">
          <div className="p-3 bg-amber-400/20 text-amber-300 rounded-xl border border-amber-400/30">
            <FilePlus className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-white">
              Report an Environmental Incident
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-0.5">
              Gwalior Environmental Vigilance Portal • Direct transmission to Official Command Center
            </p>
          </div>
        </div>
      </div>

      {errorMessage && (
        <div className="p-4 bg-rose-50 border border-rose-300 text-rose-800 rounded-xl text-xs flex items-center gap-2.5">
          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Main Report Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-7">
        {/* 1. Category Selection */}
        <div className="space-y-3">
          <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider font-mono">
            1. Select Incident Type <span className="text-rose-500">*</span>
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {ISSUE_CATEGORIES.map((cat) => {
              const isSelected = reportType === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setReportType(cat.id)}
                  className={`p-4 rounded-xl border text-left flex items-start gap-3 transition-all cursor-pointer ${
                    isSelected
                      ? 'border-[#003366] bg-sky-50/70 ring-2 ring-[#003366]/20 shadow-xs'
                      : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
                  }`}
                >
                  <div
                    className={`p-2.5 rounded-xl shrink-0 ${
                      isSelected ? 'bg-[#003366] text-white shadow-2xs' : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {cat.icon}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900">{cat.label}</div>
                    <div className="text-[11px] text-slate-500 mt-1 leading-snug">{cat.desc}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. Incident Summary & Details */}
        <div className="space-y-4 pt-2 border-t border-slate-100">
          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-2 font-mono">
              2. Incident Title / Summary <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Thick smoke from open waste burning near market area"
              required
              className="w-full px-4 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#003366]/20 focus:border-[#003366] focus:bg-white transition-all"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-2 font-mono">
              Detailed Observation <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what you see: size of the smoke plume, burning materials, affected neighborhood, smell, duration, etc."
              required
              className="w-full px-4 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#003366]/20 focus:border-[#003366] focus:bg-white transition-all resize-none"
            />
          </div>
        </div>

        {/* 3. Location & Coordinates */}
        <div className="space-y-3.5 pt-2 border-t border-slate-100">
          <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider font-mono">
            3. Location Details (Gwalior, MP) <span className="text-rose-500">*</span>
          </label>

          {/* Quick Landmark Chips */}
          <div>
            <span className="text-[11px] text-slate-500 font-semibold">Quick Landmarks:</span>
            <div className="flex flex-wrap gap-1.5 mt-1.5">
              {GWALIOR_LANDMARKS.map((lm) => (
                <button
                  key={lm.name}
                  type="button"
                  onClick={() => handleSelectLandmark(lm)}
                  className={`text-[11px] px-3 py-1 rounded-full border transition-all cursor-pointer ${
                    locationName === lm.name
                      ? 'bg-[#003366] text-white border-[#003366] font-bold shadow-2xs'
                      : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                  }`}
                >
                  {lm.name.split(',')[0]}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-1">
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Area / Street Name
              </label>
              <input
                type="text"
                value={locationName}
                onChange={(e) => setLocationName(e.target.value)}
                placeholder="e.g. Phoolbagh Square"
                className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#003366]/20 focus:border-[#003366]"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Latitude (°N)
              </label>
              <input
                type="number"
                step="0.0001"
                value={latitude}
                onChange={(e) => setLatitude(parseFloat(e.target.value) || 26.2045)}
                className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white font-mono"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Longitude (°E)
              </label>
              <input
                type="number"
                step="0.0001"
                value={longitude}
                onChange={(e) => setLongitude(parseFloat(e.target.value) || 78.1578)}
                className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white font-mono"
              />
            </div>
          </div>
        </div>

        {/* 4. Photo Evidence (Optional) */}
        <div className="pt-2 border-t border-slate-100">
          <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-2 font-mono">
            4. Photo / Evidence (Optional)
          </label>
          <div className="border-2 border-dashed border-slate-300 rounded-2xl p-6 text-center bg-slate-50/60 hover:bg-slate-50 transition-all">
            {imageUrl ? (
              <div className="space-y-3">
                <img
                  src={imageUrl}
                  alt="Incident Preview"
                  className="max-h-52 mx-auto rounded-xl object-cover border border-slate-300 shadow-sm"
                />
                <button
                  type="button"
                  onClick={() => setImageUrl(null)}
                  className="text-xs text-rose-600 font-bold hover:underline cursor-pointer"
                >
                  Remove Photo
                </button>
              </div>
            ) : (
              <div className="space-y-2.5">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto border border-slate-200 shadow-2xs">
                  <Camera className="w-6 h-6 text-slate-500" />
                </div>
                <div className="text-xs text-slate-600 font-medium">
                  Attach photo of smoke, fire, or emission plume
                </div>
                <button
                  type="button"
                  onClick={handleSimulatePhoto}
                  className="px-4 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer shadow-2xs transition-all"
                >
                  + Attach Verification Sample Image
                </button>
              </div>
            )}
          </div>
        </div>

        {/* 5. Citizen Contact Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5 font-mono">
              Your Name (Optional)
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
              <input
                type="text"
                value={citizenName}
                onChange={(e) => setCitizenName(e.target.value)}
                placeholder="e.g. Ramesh Sharma"
                className="w-full pl-10 pr-3.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#003366]/20 focus:border-[#003366]"
              />
            </div>
          </div>
          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5 font-mono">
              Mobile Number (For updates)
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
              <input
                type="tel"
                value={citizenContact}
                onChange={(e) => setCitizenContact(e.target.value)}
                placeholder="e.g. 9876543210"
                className="w-full pl-10 pr-3.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#003366]/20 focus:border-[#003366]"
              />
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-3 border-t border-slate-100">
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3.5 px-5 rounded-xl bg-gradient-to-r from-[#003366] to-[#0a2747] hover:from-[#002852] hover:to-[#08203b] text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {submitting ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Transmitting to Government Command Center...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Submit Incident Report to Authorities
              </>
            )}
          </button>
          <div className="text-center text-[11px] text-slate-400 mt-2 font-mono">
            Protected under MP Environmental Protection Framework • Telemetry Correlation Enabled
          </div>
        </div>
      </form>
    </div>
  );
};
