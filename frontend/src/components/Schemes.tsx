import React, { useState } from 'react';
import { Scheme, SupportedLanguage } from '../types.ts';
import { translations } from '../i18n.ts';
import { ClipboardList, Sparkles, Check, ArrowRight, UserCheck, RotateCcw, AlertCircle } from 'lucide-react';

interface SchemesProps {
  lang: SupportedLanguage;
}

export default function Schemes({ lang }: SchemesProps) {
  const t = translations[lang];

  // Questionnaire state
  const [age, setAge] = useState<number | ''>('');
  const [occupation, setOccupation] = useState('Farmer');
  const [annualIncome, setAnnualIncome] = useState<number | ''>('');
  const [state, setState] = useState('Uttar Pradesh');
  const [gender, setGender] = useState('Male');
  
  // Results state
  const [loading, setLoading] = useState(false);
  const [matchedSchemes, setMatchedSchemes] = useState<Scheme[] | null>(null);

  // Checked documents state per scheme
  const [checkedSchemesDocs, setCheckedSchemesDocs] = useState<Record<string, Record<number, boolean>>>({});

  const toggleSchemeDoc = (schemeId: string, docIndex: number) => {
    setCheckedSchemesDocs(prev => {
      const schemeState = prev[schemeId] || {};
      return {
        ...prev,
        [schemeId]: {
          ...schemeState,
          [docIndex]: !schemeState[docIndex]
        }
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await fetch('/api/schemes/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          age: age === '' ? undefined : age,
          occupation,
          annualIncome: annualIncome === '' ? undefined : annualIncome,
          state,
          gender
        })
      });
      const data = await res.json();
      setMatchedSchemes(data);
    } catch (err) {
      console.error('Error fetching recommendations:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setMatchedSchemes(null);
    setCheckedSchemesDocs({});
    setAge('');
    setOccupation('Farmer');
    setAnnualIncome('');
    setState('Uttar Pradesh');
    setGender('Male');
  };

  const states = [
    'Uttar Pradesh', 'Maharashtra', 'West Bengal', 'Tamil Nadu', 
    'Bihar', 'Madhya Pradesh', 'Karnataka', 'Gujarat', 'Rajasthan', 'Other'
  ];

  return (
    <div className="max-w-4xl mx-auto">
      
      {/* Tab Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-display font-bold text-navy-dark flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-saffron" />
          {t.schemesForYouCard}
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          {t.schemesForYouDesc}
        </p>
      </div>

      {!matchedSchemes ? (
        /* Form view */
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sm:p-8">
          <h2 className="text-base font-bold text-navy-dark flex items-center gap-2 mb-6 pb-3 border-b border-gray-100">
            <ClipboardList className="w-5 h-5 text-accent-teal" />
            {t.personalQuizTitle}
          </h2>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            
            {/* Age */}
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                {t.ageLabel}
              </label>
              <input
                type="number"
                min="0"
                max="120"
                value={age}
                onChange={(e) => setAge(e.target.value === '' ? '' : parseInt(e.target.value))}
                placeholder="e.g. 32"
                className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-xs focus:ring-accent-teal focus:border-accent-teal"
              />
            </div>

            {/* Gender */}
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                {t.genderLabel}
              </label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-xs focus:ring-accent-teal focus:border-accent-teal"
              >
                <option value="Male">{t.male}</option>
                <option value="Female">{t.female}</option>
                <option value="Other">{t.otherGender}</option>
              </select>
            </div>

            {/* Occupation */}
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                {t.occupationLabel}
              </label>
              <select
                value={occupation}
                onChange={(e) => setOccupation(e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-xs focus:ring-accent-teal focus:border-accent-teal"
              >
                <option value="Farmer">{t.occupationFarmer}</option>
                <option value="Student">{t.occupationStudent}</option>
                <option value="Artisan">{t.occupationArtisan}</option>
                <option value="Unemployed Youth">{t.occupationUnemployed}</option>
                <option value="Small Business Owner">{t.occupationBusiness}</option>
                <option value="Other">{t.occupationOther}</option>
              </select>
            </div>

            {/* Income */}
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                {t.incomeLabel}
              </label>
              <input
                type="number"
                min="0"
                value={annualIncome}
                onChange={(e) => setAnnualIncome(e.target.value === '' ? '' : parseInt(e.target.value))}
                placeholder="e.g. 150000"
                className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-xs focus:ring-accent-teal focus:border-accent-teal"
              />
            </div>

            {/* State */}
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                {t.stateLabel}
              </label>
              <select
                value={state}
                onChange={(e) => setState(e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-xs focus:ring-accent-teal focus:border-accent-teal"
              >
                {states.map(st => (
                  <option key={st} value={st}>{st}</option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-2 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-accent-teal hover:bg-accent-teal-hover disabled:bg-gray-400 text-white font-bold rounded-lg text-xs transition duration-150 flex items-center justify-center gap-1.5 shadow"
              >
                {loading ? (
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                ) : (
                  <Sparkles className="w-3.5 h-3.5" />
                )}
                {t.matchButton}
              </button>
            </div>

          </form>
        </div>
      ) : (
        /* Results View */
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-navy-dark flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-accent-teal" />
              {t.matchedSchemesTitle} ({matchedSchemes.length})
            </h2>

            <button
              onClick={handleReset}
              className="inline-flex items-center gap-1 text-xs font-bold text-gray-500 hover:text-navy-dark bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-lg transition duration-150"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Retake Quiz
            </button>
          </div>

          {matchedSchemes.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center text-gray-500">
              <AlertCircle className="w-8 h-8 text-saffron mx-auto mb-2" />
              <p className="text-sm font-semibold">{t.noSchemesFound}</p>
            </div>
          ) : (
            <div className="space-y-6">
              {matchedSchemes.map((s, idx) => (
                <div
                  key={s.id}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 hover:border-accent-teal p-6 transition duration-200 relative overflow-hidden"
                >
                  {/* Rank badge */}
                  <span className="absolute right-0 top-0 bg-teal-50 text-accent-teal text-[10px] font-extrabold px-3 py-1 rounded-bl-lg border-l border-b border-teal-100">
                    MATCH RATING: {s.score}/6
                  </span>

                  <span className="text-[9px] font-extrabold uppercase px-2 py-0.5 bg-gray-100 text-gray-500 rounded">
                    {s.category}
                  </span>
                  
                  <h3 className="font-display font-bold text-lg text-navy-dark mt-2.5">
                    {s.title}
                  </h3>

                  <p className="text-xs text-gray-500 mt-2 leading-relaxed">
                    {s.description}
                  </p>

                  {/* Why it fits */}
                  <div className="mt-4 p-3 bg-teal-50/50 rounded-lg border border-teal-100/50 text-xs">
                    <span className="font-bold text-teal-800 block mb-0.5">{t.whyFitsLabel}</span>
                    <ul className="list-disc pl-4 text-teal-900 space-y-1">
                      {s.reasons?.map((r, i) => (
                        <li key={i}>{r}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Benefits */}
                  <div className="mt-4 text-xs text-gray-700">
                    <span className="font-extrabold text-navy-dark block mb-1">{t.benefitsLabel}</span>
                    <p className="bg-gray-50 p-3 rounded-lg border border-gray-150 font-medium text-gray-800 leading-relaxed">
                      {s.benefits}
                    </p>
                  </div>

                  {/* Documents required checklist */}
                  {s.documents && s.documents.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <span className="text-xs font-extrabold text-navy-dark uppercase block mb-2.5 tracking-wide">
                        {t.documentsNeeded}
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {s.documents.map((doc, i) => (
                          <label key={i} className="flex items-center gap-2 cursor-pointer p-2 hover:bg-gray-50 rounded-lg border border-gray-100 select-none">
                            <input
                              type="checkbox"
                              checked={!!(checkedSchemesDocs[s.id]?.[i])}
                              onChange={() => toggleSchemeDoc(s.id, i)}
                              className="w-3.5 h-3.5 rounded text-accent-teal border-gray-300 focus:ring-accent-teal cursor-pointer"
                            />
                            <span className={`text-[11px] font-medium transition duration-150 ${
                              checkedSchemesDocs[s.id]?.[i] ? 'line-through text-gray-400' : 'text-gray-600'
                            }`}>
                              {doc}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}

                </div>
              ))}
            </div>
          )}
        </div>
      )}

    </div>
  );
}
