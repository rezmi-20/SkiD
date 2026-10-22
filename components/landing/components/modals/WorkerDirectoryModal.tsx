"use client";
import React, { useState } from 'react';
import { X, Search, MapPin, Star, ShieldCheck, CheckCircle2, Phone, ArrowRight } from 'lucide-react';
import { SKILLED_WORKERS } from '../../data/mockData';
import { SkilledWorker } from '../../types';
import { useLanguage } from '../../context/LanguageContext';

interface WorkerDirectoryModalProps {
  isOpen: boolean;
  initialQuery?: string;
  initialDistrict?: string;
  onClose: () => void;
  onHireWorker: (worker: SkilledWorker) => void;
}

export const WorkerDirectoryModal: React.FC<WorkerDirectoryModalProps> = ({
  isOpen,
  initialQuery = '',
  initialDistrict = 'All Dire Dawa',
  onClose,
  onHireWorker
}) => {
  const { language } = useLanguage();
  const [search, setSearch] = useState(initialQuery);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedDistrict, setSelectedDistrict] = useState(initialDistrict);

  if (!isOpen) return null;

  const categories = language === 'አማ' ? [
    { key: 'all', label: 'ሁሉም ሙያዎች' },
    { key: 'electrician', label: 'ኤሌክትሪሻን' },
    { key: 'plumber', label: 'ቧንቧ ሠራተኛ' },
    { key: 'painter', label: 'ቀለም ቀቢ' },
    { key: 'satellite_dish', label: 'የሳተላይት ዲሽ' },
    { key: 'house_finishing', label: 'የቤት ማጠናቀቂያ' }
  ] : language === 'ORO' ? [
    { key: 'all', label: 'Ogummaa Hunda' },
    { key: 'electrician', label: 'Elektiriikii' },
    { key: 'plumber', label: 'Ujummoo' },
    { key: 'painter', label: 'Halluu' },
    { key: 'satellite_dish', label: 'Saatiilaytii' },
    { key: 'house_finishing', label: 'Xumura Manaa' }
  ] : [
    { key: 'all', label: 'All Trades' },
    { key: 'electrician', label: 'Electricians' },
    { key: 'plumber', label: 'Plumbers' },
    { key: 'painter', label: 'Painters' },
    { key: 'satellite_dish', label: 'Satellite Dish' },
    { key: 'house_finishing', label: 'House Finishing' }
  ];

  const filteredWorkers = SKILLED_WORKERS.filter(worker => {
    const matchesCategory = selectedCategory === 'all' || worker.category === selectedCategory;
    const matchesSearch = !search ||
      worker.name.toLowerCase().includes(search.toLowerCase()) ||
      worker.trade.toLowerCase().includes(search.toLowerCase()) ||
      worker.skills.some(s => s.toLowerCase().includes(search.toLowerCase()));
    const matchesDistrict = selectedDistrict === 'All Dire Dawa' ||
      worker.location.toLowerCase().includes(selectedDistrict.toLowerCase().replace(' (kazira)', '')) ||
      worker.kebele.toLowerCase().includes(selectedDistrict.toLowerCase());

    return matchesCategory && matchesSearch && matchesDistrict;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in">
      <div className="bg-[#FAF9F5] border border-white/60 rounded-[32px] md:rounded-[40px] shadow-2xl w-full max-w-4xl max-h-[92vh] overflow-hidden flex flex-col relative">
        {/* Header */}
        <div className="p-6 md:p-8 border-b border-[#D9D7D0]/60 bg-white/70 flex items-center justify-between shrink-0">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              <span className="text-[11px] font-bold text-[#FF416C] uppercase tracking-widest font-mono">
                {language === 'አማ' ? 'በፋይዳ የተረጋገጠ ማውጫ' : language === 'ORO' ? "Galmee Faayidaan Mirkanaa'e" : 'Fayda-Verified Directory'}
              </span>
            </div>
            <h3 className="font-sans text-2xl font-bold text-[#1B1B1B]">
              {language === 'አማ' ? 'በድሬዳዋ የተካኑ ባለሙያዎችን ይፈልጉ' : language === 'ORO' ? "Ogeessota Ogummaa Dirre Dhawaatti Barbaadaa" : 'Find Skilled Workers in Dire Dawa'}
            </h3>
          </div>

          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-black/5 hover:bg-black/10 flex items-center justify-center text-[#1B1B1B] transition-colors"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Filters & Search Toolbar */}
        <div className="p-6 border-b border-[#D9D7D0]/50 bg-white/40 space-y-4 shrink-0">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 flex items-center gap-2 bg-white px-4 py-2.5 rounded-2xl border border-[#D9D7D0] shadow-2xs">
              <Search size={16} className="text-[#8C8880]" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder={
                  language === 'አማ'
                    ? 'በስም፣ በሙያ ወይም በክህሎት ይፈልጉ...'
                    : language === 'ORO'
                    ? 'Maqaa, ogummaa ykn dandeettiin barbaadaa...'
                    : 'Search by worker name, trade, or skill...'
                }
                className="w-full bg-transparent text-xs text-[#1B1B1B] focus:outline-none"
              />
            </div>
            <select
              value={selectedDistrict}
              onChange={e => setSelectedDistrict(e.target.value)}
              className="bg-white px-4 py-2.5 rounded-2xl border border-[#D9D7D0] text-xs font-semibold text-[#1B1B1B] shadow-2xs cursor-pointer focus:outline-none"
            >
              <option>All Dire Dawa</option>
              <option>Kezira</option>
              <option>Sabian</option>
              <option>Dechatu</option>
              <option>Taiwan Market</option>
              <option>Kebele 02</option>
              <option>Gende Kore</option>
            </select>
          </div>

          {/* Trade Filter Tabs */}
          <div className="flex flex-wrap gap-2">
            {categories.map(cat => (
              <button
                key={cat.key}
                onClick={() => setSelectedCategory(cat.key)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  selectedCategory === cat.key
                    ? 'bg-black text-white shadow-xs'
                    : 'bg-white hover:bg-black/5 text-[#1B1B1B] border border-[#D9D7D0]/60'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Workers List */}
        <div className="p-6 md:p-8 overflow-y-auto space-y-4">
          {filteredWorkers.length > 0 ? (
            filteredWorkers.map(worker => (
              <div
                key={worker.id}
                className="bg-white rounded-3xl p-5 sm:p-6 border border-[#D9D7D0]/60 shadow-xs hover:shadow-lg transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5"
              >
                <div className="flex items-start sm:items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-black/10 shrink-0">
                    <img
                      src={worker.avatar}
                      alt={worker.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-sans text-lg font-bold text-[#1B1B1B]">
                        {worker.name}
                      </h4>
                      {worker.faydaVerified && (
                        <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[10px] font-bold border border-blue-200 flex items-center gap-1">
                          <ShieldCheck size={11} /> Fayda Verified
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-[#8C8880] mt-0.5">
                      {worker.trade} · <MapPin size={11} className="inline text-[#FF416C]" /> {worker.location} ({worker.kebele})
                    </p>

                    <div className="flex items-center gap-2 mt-2">
                      <div className="flex items-center gap-1 text-amber-500 font-bold text-xs">
                        <Star size={13} className="fill-current" />
                        <span>{worker.rating}</span>
                      </div>
                      <span className="text-[#8C8880] text-xs">·</span>
                      <span className="text-xs text-[#8C8880] font-medium">{worker.completedJobs} jobs done</span>
                      <span className="text-[#8C8880] text-xs">·</span>
                      <span className="text-xs font-mono font-bold text-emerald-800">
                        From ETB {worker.startingRate.toLocaleString()}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-1 mt-2.5">
                      {worker.skills.map(s => (
                        <span key={s} className="text-[10px] bg-black/5 text-[#1B1B1B] px-2 py-0.5 rounded-md">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-t-0 border-black/5 gap-2 shrink-0">
                  <span className="text-[11px] font-mono text-[#8C8880] hidden sm:block">
                    {worker.faydaIdNumber}
                  </span>
                  <button
                    onClick={() => {
                      onClose();
                      onHireWorker(worker);
                    }}
                    className="px-5 py-2.5 rounded-full bg-black hover:bg-[#181818] text-white text-xs font-bold uppercase tracking-wider transition-all hover:scale-105 active:scale-95 flex items-center gap-1.5 shadow-sm"
                  >
                    <span>
                      {language === 'አማ' ? 'በውል ይቅጠሩ' : language === 'ORO' ? 'Waliigalteen Qacaraa' : 'Hire with Contract'}
                    </span>
                    <ArrowRight size={13} />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="py-12 text-center text-[#8C8880]">
              <p className="text-base font-semibold mb-1">No verified professionals found</p>
              <p className="text-xs">Try adjusting your trade filter or district search.</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 border-t border-[#D9D7D0]/60 bg-white/70 flex flex-wrap items-center justify-between gap-3 text-xs text-[#8C8880] shrink-0">
          <span>{filteredWorkers.length} workers available today in Dire Dawa</span>
          <div className="flex items-center gap-4">
            <a
              href="/client/search"
              className="font-bold text-black hover:text-[#00E575] transition-colors flex items-center gap-1"
            >
              Search All Live Workers &rarr;
            </a>
            <button onClick={onClose} className="font-semibold text-black hover:underline cursor-pointer">
              Close Directory
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

