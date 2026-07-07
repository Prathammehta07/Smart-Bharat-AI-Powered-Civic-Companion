import React, { useState, useEffect } from 'react';
import Header from './components/Header.tsx';
import Footer from './components/Footer.tsx';
import HeroChat from './components/HeroChat.tsx';
import Services from './components/Services.tsx';
import Complaints from './components/Complaints.tsx';
import Schemes from './components/Schemes.tsx';
import { Complaint, SupportedLanguage } from './types.ts';
import { translations } from './i18n.ts';
import { FolderOpen, AlertTriangle, FileText, Sparkles, Building, Info, ShieldCheck, Heart } from 'lucide-react';

export default function App() {
  const [currentTab, setTab] = useState<string>('home');
  const [lang, setLang] = useState<SupportedLanguage>('en');
  const [complaintsList, setComplaintsList] = useState<Complaint[]>([]);
  const t = translations[lang];

  // Load complaints list from backend to sync state
  const fetchComplaints = async () => {
    try {
      const res = await fetch('/api/complaints');
      const data = await res.json();
      setComplaintsList(data);
    } catch (e) {
      console.error('Error fetching complaints:', e);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-[#F5F7FA] font-sans antialiased text-navy-dark">
      
      {/* Header component */}
      <Header currentTab={currentTab} setTab={setTab} lang={lang} setLang={setLang} />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {currentTab === 'home' && (
          <div className="space-y-8">
            
            {/* Hero Grid Section */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
              
              {/* Chat Widget Panel - Left Side */}
              <div className="lg:col-span-7 flex flex-col">
                <HeroChat lang={lang} onComplaintFiled={fetchComplaints} setTab={setTab} />
              </div>

              {/* Vector Illustration & Welcome Card - Right Side */}
              <div className="lg:col-span-5 bg-gradient-to-br from-navy-dark to-[#162f56] text-white rounded-2xl p-6 sm:p-8 flex flex-col justify-between shadow-lg relative overflow-hidden">
                {/* Background saffron/green subtle glows */}
                <div className="absolute top-0 right-0 w-48 h-48 bg-saffron/10 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-green-bharat/10 rounded-full blur-3xl"></div>
                
                <div>
                  <span className="text-[10px] font-extrabold uppercase bg-accent-teal text-white px-2.5 py-1 rounded shadow-sm">
                    {t.subtitle}
                  </span>
                  
                  <h1 className="font-display font-extrabold text-3xl sm:text-4xl mt-4 leading-tight">
                    {t.tagline}
                  </h1>
                  
                  <div className="w-16 h-1.5 tricolor-underline mt-4 rounded-full"></div>
                  
                  <p className="text-xs sm:text-sm text-gray-300 mt-4 leading-relaxed font-medium">
                    {t.themeLine} Welcome to the next-generation civic portal powered by Generative AI. Converse in your local language to resolve grievances, apply for cards, and locate schemes.
                  </p>
                </div>

                {/* India Gate Vector SVG Illustration */}
                <div className="my-6 flex justify-center items-center">
                  <svg className="w-36 h-36 text-saffron/80" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    {/* Arch outer boundary */}
                    <path d="M25 90 L25 45 Q25 40 30 40 L70 40 Q75 40 75 45 L75 90" />
                    {/* Arch inner opening */}
                    <path d="M40 90 L40 60 Q40 55 45 55 L55 55 Q60 55 60 60 L60 90" stroke="#138808" />
                    {/* Multi-layered top roof structures */}
                    <rect x="20" y="30" width="60" height="10" rx="1" fill="none" stroke="currentColor" />
                    <rect x="25" y="24" width="50" height="6" rx="1" fill="none" stroke="currentColor" />
                    <line x1="30" y1="24" x2="30" y2="20" />
                    <line x1="70" y1="24" x2="70" y2="20" />
                    <path d="M35 20 L65 20 Q68 20 68 18 L68 16 Q68 14 65 14 L35 14 Q32 14 32 16 L32 18 Q32 20 35 20 Z" />
                    
                    {/* Ashoka wheel emblem in the center of the arch top */}
                    <circle cx="50" cy="35" r="3" stroke="#138808" strokeWidth="1" />
                    
                    {/* Ground line */}
                    <line x1="10" y1="90" x2="90" y2="90" stroke="#138808" />
                    {/* Pillars decoration */}
                    <line x1="32" y1="45" x2="32" y2="90" stroke="currentColor" strokeWidth="1.5" />
                    <line x1="68" y1="45" x2="68" y2="90" stroke="currentColor" strokeWidth="1.5" />
                  </svg>
                </div>

                <div className="flex items-center gap-2.5 text-[11px] text-gray-300 bg-gray-900/40 p-3 rounded-xl border border-gray-800">
                  <Info className="w-4 h-4 text-saffron flex-shrink-0" />
                  <span>Simplify your communication with state authorities instantly.</span>
                </div>
              </div>

            </div>

            {/* Feature Cards Grid (4 panels) */}
            <div>
              <div className="flex items-center gap-2 mb-5">
                <Building className="w-5 h-5 text-accent-teal" />
                <h2 className="font-display font-bold text-lg text-navy-dark">
                  What would you like to do today?
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                
                {/* Popular Services Card */}
                <div className="bg-white rounded-xl shadow-xs border border-gray-200 p-5 hover:shadow-md transition flex flex-col justify-between">
                  <div>
                    <div className="w-10 h-10 rounded-lg bg-teal-50 text-accent-teal flex items-center justify-center mb-4">
                      <FolderOpen className="w-5 h-5" />
                    </div>
                    <h3 className="font-display font-bold text-base text-navy-dark">
                      {t.popularServicesCard}
                    </h3>
                    <p className="text-xs text-gray-500 mt-2 leading-relaxed">
                      {t.popularServicesDesc}
                    </p>
                  </div>
                  <button
                    onClick={() => setTab('services')}
                    className="w-full mt-5 py-2 bg-gray-50 hover:bg-gray-100 text-accent-teal font-bold rounded-lg text-xs transition flex items-center justify-center gap-1"
                  >
                    {t.exploreCTA}
                  </button>
                </div>

                {/* Report an Issue Card */}
                <div className="bg-white rounded-xl shadow-xs border border-gray-200 p-5 hover:shadow-md transition flex flex-col justify-between">
                  <div>
                    <div className="w-10 h-10 rounded-lg bg-amber-50 text-saffron flex items-center justify-center mb-4">
                      <AlertTriangle className="w-5 h-5" />
                    </div>
                    <h3 className="font-display font-bold text-base text-navy-dark">
                      {t.reportIssueCard}
                    </h3>
                    <p className="text-xs text-gray-500 mt-2 leading-relaxed">
                      {t.reportIssueDesc}
                    </p>
                  </div>
                  <button
                    onClick={() => setTab('complaints')}
                    className="w-full mt-5 py-2 bg-gray-50 hover:bg-gray-100 text-accent-teal font-bold rounded-lg text-xs transition flex items-center justify-center gap-1"
                  >
                    {t.fileCTA}
                  </button>
                </div>

                {/* Track Complaints Card */}
                <div className="bg-white rounded-xl shadow-xs border border-gray-200 p-5 hover:shadow-md transition flex flex-col justify-between">
                  <div>
                    <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4">
                      <FileText className="w-5 h-5" />
                    </div>
                    <h3 className="font-display font-bold text-base text-navy-dark">
                      {t.trackComplaintsCard}
                    </h3>
                    <p className="text-xs text-gray-500 mt-2 leading-relaxed">
                      {t.trackComplaintsDesc}
                    </p>
                  </div>
                  <button
                    onClick={() => setTab('complaints')}
                    className="w-full mt-5 py-2 bg-gray-50 hover:bg-gray-100 text-accent-teal font-bold rounded-lg text-xs transition flex items-center justify-center gap-1"
                  >
                    {t.trackCTA}
                  </button>
                </div>

                {/* Schemes for You Card */}
                <div className="bg-white rounded-xl shadow-xs border border-gray-200 p-5 hover:shadow-md transition flex flex-col justify-between">
                  <div>
                    <div className="w-10 h-10 rounded-lg bg-red-50 text-red-600 flex items-center justify-center mb-4">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <h3 className="font-display font-bold text-base text-navy-dark">
                      {t.schemesForYouCard}
                    </h3>
                    <p className="text-xs text-gray-500 mt-2 leading-relaxed">
                      {t.schemesForYouDesc}
                    </p>
                  </div>
                  <button
                    onClick={() => setTab('schemes')}
                    className="w-full mt-5 py-2 bg-gray-50 hover:bg-gray-100 text-accent-teal font-bold rounded-lg text-xs transition flex items-center justify-center gap-1"
                  >
                    {t.checkCTA}
                  </button>
                </div>

              </div>
            </div>

          </div>
        )}

        {/* Tab Routing render blocks */}
        {currentTab === 'services' && <Services lang={lang} />}
        
        {currentTab === 'complaints' && (
          <Complaints
            lang={lang}
            complaintsList={complaintsList}
            refreshComplaints={fetchComplaints}
          />
        )}
        
        {currentTab === 'schemes' && <Schemes lang={lang} />}

      </main>

      {/* Footer component */}
      <Footer lang={lang} setLang={setLang} />

    </div>
  );
}
