import React, { useState, useEffect } from 'react';
import { BirthDetails, Language } from '../types/astrology';
import { UI_TRANSLATIONS } from '../utils/i18n';
import { X, Trash2, Calendar, MapPin, UserCheck, Plus } from 'lucide-react';

interface SavedProfilesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectProfile: (details: BirthDetails) => void;
  currentDetails: BirthDetails;
  language: Language;
}

const STORAGE_KEY = 'vedic_kundali_saved_profiles_v1';

export const SavedProfilesModal: React.FC<SavedProfilesModalProps> = ({
  isOpen,
  onClose,
  onSelectProfile,
  currentDetails,
  language,
}) => {
  const t = UI_TRANSLATIONS[language];
  const [profiles, setProfiles] = useState<BirthDetails[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setProfiles(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Failed to load saved profiles', e);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const saveCurrentProfile = () => {
    const newProfile: BirthDetails = {
      ...currentDetails,
      id: Date.now().toString(),
    };
    const updated = [newProfile, ...profiles];
    setProfiles(updated);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to save profile', e);
    }
  };

  const deleteProfile = (id?: string) => {
    if (!id) return;
    const updated = profiles.filter((p) => p.id !== id);
    setProfiles(updated);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to delete profile', e);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4">
      <div className="bg-slate-900 border border-amber-900/60 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative space-y-4">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Title */}
        <h3 className="text-lg font-serif font-bold text-amber-200">
          {t.savedKundalis}
        </h3>

        {/* Save Current Button */}
        <button
          onClick={saveCurrentProfile}
          className="w-full py-2.5 px-4 bg-amber-600/20 hover:bg-amber-600/30 border border-amber-500/50 text-amber-200 text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4 text-amber-400" />
          {t.saveProfile} ({currentDetails.name})
        </button>

        {/* Profiles List */}
        <div className="max-h-64 overflow-y-auto space-y-2 pr-1">
          {profiles.length > 0 ? (
            profiles.map((p) => (
              <div
                key={p.id}
                className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-3 flex items-center justify-between hover:border-amber-500/50 transition-colors"
              >
                <div>
                  <h4 className="text-sm font-bold text-slate-100">{p.name}</h4>
                  <div className="flex items-center gap-3 text-xs text-slate-400 mt-1 font-mono">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-amber-400" /> {p.dob} {p.tob}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-amber-400" /> {p.birthPlace}
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => {
                      onSelectProfile(p);
                      onClose();
                    }}
                    className="p-2 rounded-lg bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-700 text-emerald-300 text-xs font-bold"
                    title="Load Profile"
                  >
                    <UserCheck className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => deleteProfile(p.id)}
                    className="p-2 rounded-lg bg-rose-950/80 hover:bg-rose-900 border border-rose-700 text-rose-300 text-xs font-bold"
                    title="Delete Profile"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="p-6 text-center text-xs text-slate-400">
              No saved profiles yet. Click above to save the current birth details!
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
