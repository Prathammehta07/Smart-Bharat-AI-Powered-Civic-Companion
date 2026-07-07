import React from 'react';
import { SupportedLanguage } from '../types.ts';
import { translations } from '../i18n.ts';
import { ShieldCheck, Info } from 'lucide-react';

interface FooterProps {
  lang: SupportedLanguage;
  setLang: (lang: SupportedLanguage) => void;
}

export default function Footer({ lang, setLang }: FooterProps) {
  const t = translations[lang];

  const languagesList: { code: SupportedLanguage; label: string }[] = [
    { code: 'en', label: 'English' },
    { code: 'hi', label: 'हिंदी' },
    { code: 'ta', label: 'தமிழ்' },
    { code: 'bn', label: 'বাংলা' },
    { code: 'mr', label: 'मराठी' }
  ];

  return (
    <footer className="bg-navy-dark text-white border-t border-gray-800 mt-auto">
      {/* Multilingual Support strip */}
      <div className="bg-gray-900 py-3 border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
            <span className="inline-block w-2 h-2 rounded-full bg-saffron"></span>
            Multilingual Support / बहुभाषी सहायता:
          </span>
          <div className="flex flex-wrap gap-2">
            {languagesList.map(l => (
              <button
                key={l.code}
                onClick={() => setLang(l.code)}
                className={`px-3 py-1 rounded text-xs font-bold transition-all duration-150 ${
                  lang === l.code
                    ? 'bg-saffron text-navy-dark shadow'
                    : 'bg-gray-800 hover:bg-gray-700 text-gray-300'
                }`}
              >
                {l.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Footer Info */}
      <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center text-center md:text-left">
          
          {/* Taglines */}
          <div>
            <div className="flex items-center justify-center md:justify-start space-x-2">
              <span className="font-display font-bold text-sm tracking-wide tricolor-text bg-gradient-to-r from-saffron via-white to-green-bharat">
                SMART BHARAT
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-1">{t.tagline}</p>
            <p className="text-[10px] text-gray-500 mt-0.5">{t.themeLine}</p>
          </div>

          {/* Sources and Transparency */}
          <div className="flex flex-col items-center justify-center text-xs text-gray-400 space-y-1">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-green-bharat" />
              <span>{t.sourceText}</span>
            </div>
            <span className="text-[10px] text-gray-500">{t.lastUpdated}</span>
          </div>

          {/* Accessibility Info / Emblem placeholder */}
          <div className="text-xs text-gray-400 md:text-right flex flex-col items-center md:items-end justify-center">
            <span>Designed for digital inclusion & accessibility.</span>
            <span className="text-[10px] text-gray-500 mt-0.5">National Hackathon Project Submission</span>
          </div>

        </div>

        {/* Disclaimer Area */}
        <div className="border-t border-gray-800/80 mt-6 pt-4 text-center">
          <div className="inline-flex items-center gap-1.5 text-[10px] sm:text-xs text-gray-500 max-w-3xl mx-auto bg-gray-900/50 p-2.5 rounded-lg border border-gray-800">
            <Info className="w-4 h-4 text-saffron flex-shrink-0" />
            <p className="leading-relaxed text-left">{t.disclaimer}</p>
          </div>
        </div>

      </div>
    </footer>
  );
}
