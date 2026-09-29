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
      <div className="max-w-2xl mx-auto bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 text-center my-6">
        <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-200">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <h2 className="text-2xl font-bold text-slate-900 mb-1">
          Environmental Report Submitted Successfully!
        </h2>
        <p className="text-sm text-slate-500 mb-6">
          Your report has been received by the SAAMEK Gwalior Environmental Intelligence unit.
        </p>

        <div className="bg-slate-50 rounded-xl p-5 border border-slate-200 text-left mb-6 space-y-2">
          <div className="flex justify-between items-center text-xs text-slate-500 border-b border-slate-200 pb-2">
            <span>Reference Report ID</span>
            <span className="font-mono font-bold text-[#003366] text-sm">
              {submittedReport.report_id || submittedReport.id}
            </span>
          </div>
          <div className="flex justify-between items-center text-xs text-slate-600">
            <span>Incident Type</span>
            <span className="font-semibold text-slate-900 capitalize">
              {submittedReport.report_type?.replace(/_/g, ' ')}
            </span>
          </div>
          <div className="flex justify-between items-center text-xs text-slate-600">
            <span>Reported Location</span>
            <span className="font-semibold text-slate-900">{submittedReport.location_name}</span>
          </div>
          <div className="flex justify-between items-center text-xs text-slate-600">
            <span>Current Status</span>
            <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[11px] font-bold">
              Pending Verification
            </span>
          </div>
        </div>

        <div className="p-3.5 bg-blue-50 text-blue-900 rounded-lg text-xs flex items-start gap-2.5 text-left mb-6 border border-blue-100">
          <ShieldCheck className="w-4 h-4 text-[#003366] shrink-0 mt-0.5" />
          <div>
            <strong>What happens next?</strong> SAAMEK automatically correlates your report with real-time ground sensor readings (OpenAQ) and satellite passes (NASA FIRMS). An officer will triage and initiate field response if verified.
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => onNavigateTab('my-reports')}
            className="px-6 py-2.5 rounded-xl bg-[#003366] text-white font-bold text-sm shadow-sm hover:bg-[#002244] transition-all cursor-pointer"
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
            className="px-6 py-2.5 rounded-xl bg-slate-100 text-slate-800 font-semibold text-sm hover:bg-slate-200 transition-all cursor-pointer border border-slate-200"
          >
            Submit Another Report
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header Info */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2.5 rounded-xl bg-amber-50 text-amber-700 border border-amber-200">
            <FilePlus className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">
              Report an Environmental Incident
            </h1>
            <p className="text-xs text-slate-500">
              Gwalior Environmental Vigilance Portal • Direct submission to Government Command Center
            </p>
          </div>
        </div>
      </div>

      {errorMessage && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Main Report Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-6">
        {/* 1. Category Selection */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
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
                  className={`p-3.5 rounded-xl border text-left flex items-start gap-3 transition-all cursor-pointer ${
                    isSelected
                      ? 'border-[#003366] bg-blue-50/70 ring-2 ring-[#003366]/20'
                      : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
                  }`}
                >
                  <div
                    className={`p-2 rounded-lg shrink-0 ${
                      isSelected ? 'bg-[#003366] text-white' : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {cat.icon}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900">{cat.label}</div>
                    <div className="text-[11px] text-slate-500 mt-0.5 leading-tight">{cat.desc}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. Incident Summary & Details */}
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              2. Incident Title / Summary <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Thick smoke from open waste burning near market area"
              required
              className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#003366] focus:bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Detailed Observation <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what you see: size of the smoke plume, burning materials, affected neighborhood, smell, duration, etc."
              required
              className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#003366] focus:bg-white resize-none"
            />
          </div>
        </div>

        {/* 3. Location & Coordinates */}
        <div className="space-y-3">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
            3. Location Details (Gwalior, MP) <span className="text-rose-500">*</span>
          </label>

          {/* Quick Landmark Chips */}
          <div>
            <span className="text-[11px] text-slate-500 font-medium">Quick Landmarks:</span>
            <div className="flex flex-wrap gap-1.5 mt-1.5">
              {GWALIOR_LANDMARKS.map((lm) => (
                <button
                  key={lm.name}
                  type="button"
                  onClick={() => handleSelectLandmark(lm)}
                  className={`text-[11px] px-2.5 py-1 rounded-full border transition-all cursor-pointer ${
                    locationName === lm.name
                      ? 'bg-[#003366] text-white border-[#003366]'
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
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:ring-2 focus:ring-[#003366]"
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
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:bg-white font-mono"
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
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:bg-white font-mono"
              />
            </div>
          </div>
        </div>

        {/* 4. Photo Evidence (Optional) */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
            4. Photo / Evidence (Optional)
          </label>
          <div className="border-2 border-dashed border-slate-300 rounded-xl p-4 text-center bg-slate-50 hover:bg-slate-100/70 transition-all">
            {imageUrl ? (
              <div className="space-y-2">
                <img
                  src={imageUrl}
                  alt="Incident Preview"
                  className="max-h-48 mx-auto rounded-lg object-cover border border-slate-300 shadow-xs"
                />
                <button
                  type="button"
                  onClick={() => setImageUrl(null)}
                  className="text-xs text-rose-600 font-semibold hover:underline cursor-pointer"
                >
                  Remove Photo
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <Camera className="w-8 h-8 text-slate-400 mx-auto" />
                <div className="text-xs text-slate-600">
                  Attach photo of smoke, fire, or emission plume
                </div>
                <button
                  type="button"
                  onClick={handleSimulatePhoto}
                  className="px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer shadow-2xs"
                >
                  + Attach Sample Verification Photo
                </button>
              </div>
            )}
          </div>
        </div>

        {/* 5. Citizen Contact Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-200">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Your Name (Optional)
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={citizenName}
                onChange={(e) => setCitizenName(e.target.value)}
                placeholder="e.g. Ramesh Sharma"
                className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:bg-white"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Mobile Number (For updates)
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="tel"
                value={citizenContact}
                onChange={(e) => setCitizenContact(e.target.value)}
                placeholder="e.g. 9876543210"
                className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:bg-white"
              />
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 px-4 rounded-xl bg-[#003366] text-white font-bold text-sm shadow-md hover:bg-[#002244] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {submitting ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                Transmitting to Government Command Center...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Submit Incident Report to Authorities
              </>
            )}
          </button>
          <div className="text-center text-[11px] text-slate-400 mt-2">
            Protected under MP Environmental Protection Act • Real-time telemetry correlation enabled
          </div>
        </div>
      </form>
    </div>
  );
};
