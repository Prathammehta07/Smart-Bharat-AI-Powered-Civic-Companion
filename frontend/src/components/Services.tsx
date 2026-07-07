import React, { useState, useEffect } from 'react';
import { Service, SupportedLanguage } from '../types.ts';
import { translations } from '../i18n.ts';
import { Search, FolderOpen, ArrowRight, Clock, ExternalLink, X, FileText, CheckCircle2 } from 'lucide-react';

interface ServicesProps {
  lang: SupportedLanguage;
}

export default function Services({ lang }: ServicesProps) {
  const t = translations[lang];
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [checkedDocs, setCheckedDocs] = useState<boolean[]>([]);

  useEffect(() => {
    if (selectedService) {
      setCheckedDocs(new Array(selectedService.documents.length).fill(false));
    }
  }, [selectedService]);

  const toggleDoc = (index: number) => {
    setCheckedDocs(prev => {
      const next = [...prev];
      next[index] = !next[index];
      return next;
    });
  };

  // Fetch Services from backend
  useEffect(() => {
    async function loadServices() {
      try {
        setLoading(true);
        const url = `/api/services?category=${encodeURIComponent(selectedCategory)}&query=${encodeURIComponent(searchQuery)}`;
        const res = await fetch(url);
        const data = await res.json();
        setServices(data);
      } catch (e) {
        console.error('Error fetching services:', e);
      } finally {
        setLoading(false);
      }
    }
    loadServices();
  }, [searchQuery, selectedCategory]);

  const categories = [
    { id: '', label: t.allCategories },
    { id: 'Identity Documents', label: 'Identity Documents' },
    { id: 'Welfare Services', label: 'Welfare Services' },
    { id: 'Municipal Services', label: 'Municipal Services' },
    { id: 'Employment & Transport', label: 'Employment & Transport' }
  ];

  return (
    <div className="relative">
      
      {/* Header Area */}
      <div className="mb-6">
        <h1 className="text-2xl font-display font-bold text-navy-dark flex items-center gap-2">
          <FolderOpen className="w-6 h-6 text-accent-teal" />
          Government Services Directory
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Search requirements, eligibility, process steps and direct official links for essential services.
        </p>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6 bg-white p-4 rounded-xl shadow-sm border border-gray-200">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder={t.searchServices}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent-teal transition duration-150"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1 md:pb-0">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition duration-150 ${
                selectedCategory === cat.id
                  ? 'bg-navy-dark text-white shadow-sm'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Services Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-4 border-accent-teal border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : services.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl shadow-sm border border-gray-100">
          <p className="text-gray-500 text-sm">No services found matching your criteria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map(s => (
            <div
              key={s.id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 hover:border-accent-teal hover:shadow-md transition-all duration-200 p-5 flex flex-col justify-between"
            >
              <div>
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 bg-teal-50 text-accent-teal rounded-full border border-teal-100">
                  {s.category}
                </span>
                <h3 className="font-display font-bold text-base text-navy-dark mt-2.5 leading-snug">
                  {s.title}
                </h3>
                <p className="text-xs text-gray-500 mt-2 line-clamp-3 leading-relaxed">
                  {s.description}
                </p>
              </div>

              <div className="mt-5 pt-4 border-t border-gray-100 flex items-center justify-between">
                <span className="text-[11px] text-gray-400 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {s.avg_processing_days} {t.days}
                </span>

                <button
                  onClick={() => setSelectedService(s)}
                  className="inline-flex items-center gap-1 text-xs font-bold text-accent-teal hover:text-accent-teal-hover transition duration-150"
                >
                  {t.exploreCTA}
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Slide-over details panel */}
      {selectedService && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-black/40 backdrop-blur-xs flex justify-end">
          <div className="w-full max-w-2xl bg-white h-full shadow-2xl overflow-y-auto flex flex-col relative animate-slide-in">
            
            {/* Slide Header */}
            <div className="bg-navy-dark text-white p-6 sticky top-0 z-10 flex items-start justify-between">
              <div>
                <span className="text-[10px] font-extrabold uppercase bg-accent-teal px-2 py-0.5 rounded">
                  {selectedService.category}
                </span>
                <h2 className="font-display font-bold text-xl mt-2">
                  {selectedService.title}
                </h2>
              </div>
              <button
                onClick={() => setSelectedService(null)}
                className="p-1.5 hover:bg-gray-800 rounded-full transition duration-150"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Slide Content */}
            <div className="p-6 space-y-6 flex-1">
              
              {/* Description */}
              <div>
                <p className="text-sm text-gray-600 leading-relaxed bg-gray-50 p-4 rounded-xl border border-gray-100">
                  {selectedService.description}
                </p>
              </div>

              {/* Processing Time */}
              <div className="flex items-center gap-2 text-xs bg-teal-50 border border-teal-100 text-teal-800 p-3 rounded-lg">
                <Clock className="w-4 h-4 text-accent-teal" />
                <strong>{t.avgTime}:</strong> {selectedService.avg_processing_days} {t.days}
              </div>

              {/* Eligibility */}
              <div>
                <h4 className="text-xs font-extrabold text-navy-dark uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-accent-teal" />
                  {t.eligibility}
                </h4>
                <ul className="space-y-2">
                  {selectedService.eligibility.map((el, i) => (
                    <li key={i} className="text-xs text-gray-600 flex items-start gap-2">
                      <span className="w-1.5 h-1.5 bg-accent-teal rounded-full mt-1.5 flex-shrink-0"></span>
                      <span>{el}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Required Documents */}
              <div>
                <h4 className="text-xs font-extrabold text-navy-dark uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-saffron" />
                  {t.documentsNeeded}
                </h4>
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-150 space-y-2">
                  {selectedService.documents.map((doc, i) => (
                    <label key={i} className="flex items-center gap-3 cursor-pointer hover:bg-gray-100/50 p-1.5 rounded-lg select-none transition duration-100">
                      <input
                        type="checkbox"
                        checked={checkedDocs[i] || false}
                        onChange={() => toggleDoc(i)}
                        className="w-4 h-4 rounded text-accent-teal focus:ring-accent-teal border-gray-300 cursor-pointer"
                      />
                      <span className={`text-xs font-medium transition duration-150 ${checkedDocs[i] ? 'line-through text-gray-400' : 'text-gray-700'}`}>
                        {doc}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Steps Guide */}
              <div>
                <h4 className="text-xs font-extrabold text-navy-dark uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <ArrowRight className="w-4 h-4 text-accent-teal" />
                  {t.processSteps}
                </h4>
                <div className="relative pl-6 border-l-2 border-dashed border-gray-200 ml-3 space-y-5">
                  {selectedService.steps.map((step, i) => (
                    <div key={i} className="relative">
                      {/* Step Number Dot */}
                      <span className="absolute -left-[31px] top-0 w-6 h-6 rounded-full bg-navy-dark text-white flex items-center justify-center text-[10px] font-bold">
                        {i + 1}
                      </span>
                      <p className="text-xs text-gray-600 leading-relaxed">{step}</p>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Portal Action Link */}
            <div className="p-4 border-t border-gray-100 bg-gray-50 flex items-center justify-between sticky bottom-0 z-10">
              <span className="text-[10px] text-gray-400 font-semibold uppercase">
                {t.sourceText}
              </span>
              <a
                href={selectedService.portal_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-accent-teal hover:bg-accent-teal-hover text-white text-xs font-bold rounded-lg shadow-sm transition duration-150"
              >
                {t.visitPortal}
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
