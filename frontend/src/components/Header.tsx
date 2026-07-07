import React from 'react';
import { SupportedLanguage } from '../types.ts';
import { translations } from '../i18n.ts';
import { Languages } from 'lucide-react';

interface HeaderProps {
  currentTab: string;
  setTab: (tab: string) => void;
  lang: SupportedLanguage;
  setLang: (lang: SupportedLanguage) => void;
}

export default function Header({ currentTab, setTab, lang, setLang }: HeaderProps) {
  const t = translations[lang];

  const languagesList: { code: SupportedLanguage; label: string }[] = [
    { code: 'en', label: 'English' },
    { code: 'hi', label: 'हिंदी' },
    { code: 'ta', label: 'தமிழ்' },
    { code: 'bn', label: 'বাংলা' },
    { code: 'mr', label: 'मराठी' }
  ];

  return (
    <header className="sticky top-0 z-50 bg-navy-dark text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Branding Logo & Text */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setTab('home')}>
            <div className="relative flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full bg-white text-navy-dark">
              {/* Ashoka-inspired abstract wheel logo */}
              <svg className="w-8 h-8 animate-spin-slow text-navy-dark" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="2.5">
                <circle cx="50" cy="50" r="45" strokeDasharray="4 4" />
                <circle cx="50" cy="50" r="30" />
                <circle cx="50" cy="50" r="10" fill="currentColor" />
                {Array.from({ length: 24 }).map((_, i) => {
                  const angle = (i * 360) / 24;
                  return (
                    <line
                      key={i}
                      x1="50"
                      y1="50"
                      x2={50 + 30 * Math.cos((angle * Math.PI) / 180)}
                      y2={50 + 30 * Math.sin((angle * Math.PI) / 180)}
                    />
                  );
                })}
              </svg>
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="font-display font-extrabold text-xl tracking-wider tricolor-text bg-gradient-to-r from-saffron via-white to-green-bharat">
                  SMART BHARAT
                </span>
                <span className="bg-accent-teal text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow-sm glow-btn">
                  AI-Powered
                </span>
              </div>
              <p className="text-[11px] text-gray-300 font-medium tracking-tight">
                {t.subtitle}
              </p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex space-x-1">
            {[
              { id: 'home', label: t.navHome },
              { id: 'services', label: t.navServices },
              { id: 'complaints', label: t.navComplaints },
              { id: 'schemes', label: t.navSchemes }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setTab(tab.id)}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                  currentTab === tab.id
                    ? 'bg-accent-teal text-white shadow-sm'
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>

          {/* Language Switcher & Profile */}
          <div className="flex items-center space-x-4">
            <div className="relative group">
              <button className="flex items-center space-x-1 bg-gray-800 hover:bg-gray-700 px-3 py-1.5 rounded-lg text-sm font-medium border border-gray-700 transition duration-150">
                <Languages className="w-4 h-4 text-saffron" />
                <span className="hidden sm:inline">
                  {languagesList.find(l => l.code === lang)?.label || 'Language'}
                </span>
              </button>
              
              {/* Dropdown menu */}
              <div className="absolute right-0 mt-2 w-32 bg-white rounded-lg shadow-xl py-1 z-50 text-gray-800 border border-gray-100 hidden group-hover:block transition duration-200">
                {languagesList.map(item => (
                  <button
                    key={item.code}
                    onClick={() => setLang(item.code)}
                    className={`w-full text-left px-4 py-2 text-xs font-semibold hover:bg-gray-50 flex items-center justify-between ${
                      lang === item.code ? 'text-accent-teal bg-teal-50' : 'text-gray-700'
                    }`}
                  >
                    {item.label}
                    {lang === item.code && <span className="w-1.5 h-1.5 bg-accent-teal rounded-full"></span>}
                  </button>
                ))}
              </div>
            </div>

            {/* Profile Avatar */}
            <div className="flex items-center space-x-2 bg-gray-800/80 px-2.5 py-1.5 rounded-full border border-gray-700">
              <div className="w-6 h-6 rounded-full bg-accent-teal text-white flex items-center justify-center text-xs font-bold font-display shadow-inner">
                RK
              </div>
              <span className="text-xs font-bold text-gray-200 hidden sm:inline">Rajesh K.</span>
            </div>
          </div>
          
        </div>
      </div>

      {/* Tricolor Accent Underline */}
      <div className="h-1 w-full tricolor-underline"></div>
    </header>
  );
}
