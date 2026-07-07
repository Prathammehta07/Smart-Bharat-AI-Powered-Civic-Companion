import React, { useState, useRef, useEffect } from 'react';
import { Message, SupportedLanguage } from '../types.ts';
import { translations } from '../i18n.ts';
import { Send, Sparkles, MessageSquare, Maximize2, Minimize2, Wrench, AlertCircle, RefreshCw } from 'lucide-react';

interface HeroChatProps {
  lang: SupportedLanguage;
  onComplaintFiled: () => void;
  setTab: (tab: string) => void;
}

export default function HeroChat({ lang, onComplaintFiled, setTab }: HeroChatProps) {
  const t = translations[lang];
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'model',
      content: translations[lang].welcomeChat
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  // Track tool executions for visual feedback
  const [activeTool, setActiveTool] = useState<{ name: string; result: any } | null>(null);

  const chatEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading, activeTool]);

  // Synchronize initial welcome message on language change
  useEffect(() => {
    if (messages.length === 1 && messages[0].role === 'model') {
      setMessages([{ role: 'model', content: translations[lang].welcomeChat }]);
    }
  }, [lang]);

  const promptChips = [
    { text: 'How to get a Birth Certificate?', key: 'birth' },
    { text: 'Documents required for PM Awas Yojana?', key: 'pmay' },
    { text: 'Check status of complaint cmp-002', key: 'status' },
    { text: 'I want to report a water leak', key: 'leak' }
  ];

  const handleSendMessage = async (text: string) => {
    if (!text.trim() || loading) return;

    const userMsg: Message = { role: 'user', content: text };
    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setLoading(true);
    setActiveTool(null);

    try {
      // Package conversation history (excluding the first welcome message if it's default)
      const chatHistory = messages
        .filter((_, idx) => idx > 0 || messages[0].content !== translations[lang].welcomeChat)
        .map(m => ({ role: m.role, content: m.content }));

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          history: chatHistory,
          lang
        })
      });

      const data = await res.json();
      
      // If a tool was executed, log it for visual transparency
      if (data.toolCalled) {
        setActiveTool({ name: data.toolCalled, result: data.toolResult });
        
        // If a complaint was conversationally filed, refresh database
        if (data.toolCalled === 'fileComplaint' && data.toolResult?.success) {
          onComplaintFiled();
        }
      }

      setMessages(prev => [
        ...prev,
        { role: 'model', content: data.reply || 'I am processing your request.' }
      ]);
    } catch (e) {
      console.error('Chat error:', e);
      setMessages(prev => [
        ...prev,
        { role: 'model', content: 'Connection issue. Please verify the backend is running.' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleChipClick = (chipText: string) => {
    handleSendMessage(chipText);
  };

  // Convert raw message text markdown-like symbols to HTML elements safely
  const formatMessageText = (text: string) => {
    // Basic Markdown formatting helper
    return text.split('\n').map((line, i) => {
      let formattedLine = line
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/`([^`]+)`/g, '<code class="bg-gray-100 text-red-600 px-1 rounded">$1</code>');

      // Detect list item
      if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
        return (
          <li key={i} className="ml-4 list-disc text-xs" dangerouslySetInnerHTML={{ __html: formattedLine.substring(2) }} />
        );
      }
      return (
        <p key={i} className="text-xs min-h-[1rem]" dangerouslySetInnerHTML={{ __html: formattedLine }} />
      );
    });
  };

  return (
    <div 
      className={`bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col transition-all duration-300 ${
        isFullscreen 
          ? 'fixed inset-4 z-50 shadow-2xl h-[calc(100vh-32px)] md:max-w-4xl md:mx-auto' 
          : 'h-[500px]'
      }`}
    >
      {/* Widget Header */}
      <div className="bg-navy-dark text-white px-4 py-3.5 rounded-t-xl flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-bharat rounded-full animate-ping"></div>
          <Sparkles className="w-4 h-4 text-saffron" />
          <h2 className="font-display font-bold text-sm">Smart Bharat Assistant</h2>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-[10px] text-gray-300 bg-gray-800 font-semibold px-2 py-0.5 rounded">
            Gemini GenAI
          </span>
          <button 
            onClick={() => setIsFullscreen(!isFullscreen)} 
            className="p-1 hover:bg-gray-800 rounded transition text-gray-300 hover:text-white"
            title={isFullscreen ? 'Collapse chat' : 'Expand chat to full screen'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Messages Window */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 chat-scroll">
        {messages.map((m, idx) => (
          <div
            key={idx}
            className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-3 text-xs leading-relaxed shadow-xs ${
                m.role === 'user'
                  ? 'bg-accent-teal text-white rounded-tr-none'
                  : 'bg-white text-gray-800 border border-gray-200 rounded-tl-none font-medium'
              }`}
            >
              {m.role === 'model' && (
                <span className="text-[9px] font-extrabold text-saffron uppercase block mb-1">
                  Bharat AI
                </span>
              )}
              <div className="space-y-1.5">{formatMessageText(m.content)}</div>
            </div>
          </div>
        ))}

        {/* Loading Bubble */}
        {loading && (
          <div className="flex justify-start items-center space-x-2 animate-pulse">
            <div className="bg-white border border-gray-200 rounded-2xl rounded-tl-none px-4 py-3 shadow-xs">
              <span className="text-[9px] font-extrabold text-saffron uppercase block mb-1">
                Bharat AI
              </span>
              <div className="flex items-center space-x-1.5 py-1">
                <span className="w-2 h-2 bg-accent-teal rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                <span className="w-2 h-2 bg-accent-teal rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                <span className="w-2 h-2 bg-accent-teal rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
              </div>
            </div>
          </div>
        )}

        {/* Dynamic Tool Invocation Banner (GenAI Wow factor) */}
        {activeTool && (
          <div className="bg-teal-50 border border-teal-200 text-teal-800 rounded-lg p-3 text-[11px] flex items-start gap-2.5 animate-slide-up shadow-xs">
            <Wrench className="w-4 h-4 text-accent-teal mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-bold flex items-center gap-1">
                AI Companion triggered function call:
                <code className="bg-teal-100 text-teal-900 px-1 rounded">{activeTool.name}</code>
              </p>
              {activeTool.name === 'fileComplaint' && activeTool.result?.success && (
                <div className="mt-1 flex items-center gap-2">
                  <span>Filed complaint Ticket ID: <strong>{activeTool.result.complaintId}</strong></span>
                  <button 
                    onClick={() => setTab('complaints')}
                    className="text-[10px] text-accent-teal hover:underline font-extrabold"
                  >
                    Track Progress &rarr;
                  </button>
                </div>
              )}
              {activeTool.name === 'recommendSchemes' && activeTool.result?.recommendations && (
                <div className="mt-1 flex items-center gap-2">
                  <span>Found {activeTool.result.recommendations.length} matched schemes.</span>
                  <button 
                    onClick={() => setTab('schemes')}
                    className="text-[10px] text-accent-teal hover:underline font-extrabold"
                  >
                    View Recommended Schemes &rarr;
                  </button>
                </div>
              )}
              {activeTool.name === 'searchServices' && activeTool.result?.results && (
                <div className="mt-1 flex items-center gap-2">
                  <span>Found {activeTool.result.results.length} related services.</span>
                  <button 
                    onClick={() => setTab('services')}
                    className="text-[10px] text-accent-teal hover:underline font-extrabold"
                  >
                    Explore Services Directory &rarr;
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Suggested Prompt Chips */}
      {messages.length === 1 && !loading && (
        <div className="px-4 py-2 border-t border-gray-100 bg-white">
          <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wide block mb-1.5">
            {t.suggestedPrompts}
          </span>
          <div className="flex flex-wrap gap-1.5">
            {promptChips.map((chip, idx) => (
              <button
                key={idx}
                onClick={() => handleChipClick(chip.text)}
                className="text-[10px] font-semibold bg-gray-50 hover:bg-gray-150 border border-gray-200 hover:border-gray-300 text-gray-600 rounded-full px-2.5 py-1 text-left transition duration-150"
              >
                {chip.text}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage(inputText);
        }}
        className="p-3 border-t border-gray-200 flex items-center gap-2 bg-white rounded-b-xl"
      >
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={t.inputPlaceholder}
          disabled={loading}
          className="flex-1 px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-accent-teal focus:bg-white transition duration-150"
        />
        <button
          type="submit"
          disabled={!inputText.trim() || loading}
          className="p-2 bg-accent-teal hover:bg-accent-teal-hover disabled:bg-gray-200 text-white rounded-lg transition duration-150 flex items-center justify-center shadow-xs"
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
}
