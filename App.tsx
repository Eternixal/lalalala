
import React, { useState, useEffect, useRef } from 'react';
import { Sidebar } from './components/Sidebar';
import { Button } from './components/Button';
import { ResponseDisplay } from './components/ResponseDisplay';
import { ChatSession, ChatMessage, RequestType } from './types';
import { generateAcademicResponse, parseResponseText } from './services/geminiService';

const App: React.FC = () => {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Load sessions from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('cendekia_sessions');
    if (saved) {
      const parsed = JSON.parse(saved);
      setSessions(parsed);
      if (parsed.length > 0) setActiveSessionId(parsed[0].id);
    } else {
      handleNewSession();
    }
  }, []);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [sessions, isTyping]);

  const saveSessions = (updated: ChatSession[]) => {
    setSessions(updated);
    localStorage.setItem('cendekia_sessions', JSON.stringify(updated));
  };

  const handleNewSession = () => {
    const newSession: ChatSession = {
      id: Date.now().toString(),
      title: 'Diskusi Riset Baru',
      messages: [],
      updatedAt: Date.now()
    };
    const updated = [newSession, ...sessions];
    saveSessions(updated);
    setActiveSessionId(newSession.id);
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || !activeSessionId || isTyping) return;

    const currentInput = inputText;
    setInputText('');

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: currentInput,
      timestamp: Date.now()
    };

    const updatedSessions = sessions.map(s => {
      if (s.id === activeSessionId) {
        // If first message, use it as title
        const newTitle = s.messages.length === 0 
          ? (currentInput.length > 30 ? currentInput.substring(0, 30) + '...' : currentInput)
          : s.title;
        return {
          ...s,
          title: newTitle,
          messages: [...s.messages, userMsg],
          updatedAt: Date.now()
        };
      }
      return s;
    });

    saveSessions(updatedSessions);
    setIsTyping(true);

    try {
      const responseText = await generateAcademicResponse(currentInput);
      const parsed = parseResponseText(responseText);

      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: responseText,
        timestamp: Date.now(),
        parsedResponse: parsed
      };

      const finalSessions = sessions.map(s => {
        if (s.id === activeSessionId) {
          return {
            ...s,
            messages: [...s.messages, userMsg, aiMsg],
            updatedAt: Date.now()
          };
        }
        return s;
      });
      saveSessions(finalSessions);
    } catch (error) {
      console.error(error);
      const errorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "Mohon maaf, terjadi gangguan saat menghubungi repositori pengetahuan. Silakan coba beberapa saat lagi.",
        timestamp: Date.now()
      };
      const errorSessions = sessions.map(s => {
        if (s.id === activeSessionId) {
          return { ...s, messages: [...s.messages, userMsg, errorMsg] };
        }
        return s;
      });
      saveSessions(errorSessions);
    } finally {
      setIsTyping(false);
    }
  };

  const activeSession = sessions.find(s => s.id === activeSessionId);

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 font-sans selection:bg-blue-100 selection:text-blue-900">
      <Sidebar 
        sessions={sessions}
        activeSessionId={activeSessionId}
        onSelectSession={setActiveSessionId}
        onNewSession={handleNewSession}
      />

      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        {/* Header bar */}
        <header className="h-16 border-b border-slate-200 bg-white/80 backdrop-blur-md flex items-center justify-between px-8 z-10">
          <div className="flex items-center gap-3">
            <div className="bg-blue-50 text-blue-600 p-2 rounded-lg">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
            </div>
            <h2 className="font-semibold text-slate-800">{activeSession?.title || 'Memuat...'}</h2>
          </div>
          <div className="flex items-center gap-4">
             <div className="flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-700 border border-green-100 rounded-full text-xs font-medium">
               <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
               Model: Gemini Pro
             </div>
          </div>
        </header>

        {/* Chat Area */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 md:p-8 space-y-8 scroll-smooth">
          {activeSession?.messages.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center max-w-2xl mx-auto text-center space-y-6 opacity-80">
              <div className="w-20 h-20 bg-blue-100 text-blue-600 rounded-3xl flex items-center justify-center animate-bounce">
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.628.288a2 2 0 01-1.645.033l-2.257-.903a2 2 0 00-1.353.003l-1.92.548a2 2 0 00-1.428 1.92V19a2 2 0 002 2h14a2 2 0 002-2v-3.572a2 2 0 00-.572-1.414z" /></svg>
              </div>
              <h3 className="text-3xl font-serif font-bold text-slate-800">Bagaimana saya dapat membantu riset Anda hari ini?</h3>
              <p className="text-slate-500 text-lg leading-relaxed">
                Saya adalah CendekiaAI. Anda dapat meminta saya untuk mencari jurnal, meringkas literatur, 
                menyusun draf laporan praktikum, atau menjelaskan konsep ilmiah yang kompleks.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                {[
                  "Cari jurnal tentang mikroplastik di ekosistem laut",
                  "Jelaskan konsep Termodinamika Hukum Kedua",
                  "Ringkaskan artikel tentang AI dalam Pendidikan",
                  "Bantu draf laporan praktikum titrasi asam basa"
                ].map((hint, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setInputText(hint);
                    }}
                    className="p-4 bg-white border border-slate-200 rounded-xl hover:border-blue-400 hover:shadow-md transition-all text-sm text-slate-600 text-left"
                  >
                    "{hint}"
                  </button>
                ))}
              </div>
            </div>
          )}

          {activeSession?.messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[90%] md:max-w-[80%] ${msg.role === 'user' ? 'bg-blue-600 text-white rounded-2xl p-4' : 'w-full'}`}>
                {msg.role === 'user' ? (
                  <p className="leading-relaxed">{msg.content}</p>
                ) : (
                  msg.parsedResponse ? (
                    <ResponseDisplay response={msg.parsedResponse} />
                  ) : (
                    <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                      <p className="text-slate-700 whitespace-pre-wrap">{msg.content}</p>
                    </div>
                  )
                )}
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-white border border-slate-200 rounded-xl p-8 shadow-sm w-full animate-pulse">
                <div className="h-4 bg-slate-200 rounded w-1/4 mb-4"></div>
                <div className="h-10 bg-slate-100 rounded w-full mb-8"></div>
                <div className="space-y-3">
                  <div className="h-4 bg-slate-100 rounded w-full"></div>
                  <div className="h-4 bg-slate-100 rounded w-5/6"></div>
                  <div className="h-4 bg-slate-100 rounded w-4/6"></div>
                </div>
                <div className="mt-8 flex gap-2">
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce delay-150"></div>
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce delay-300"></div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="p-6 bg-slate-50 border-t border-slate-200">
          <form onSubmit={handleSendMessage} className="max-w-4xl mx-auto flex gap-4 items-end">
            <div className="flex-1 bg-white border border-slate-300 rounded-2xl shadow-sm focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 transition-all p-2">
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                placeholder="Ajukan pertanyaan riset atau permintaan akademik Anda di sini..."
                className="w-full bg-transparent border-none focus:ring-0 text-slate-700 resize-none max-h-40 p-3"
                rows={2}
              />
              <div className="flex justify-between items-center px-3 pb-2">
                <div className="flex gap-2">
                   <button type="button" className="text-slate-400 hover:text-blue-500 transition-colors p-1" title="Lampirkan Dokumen (Segera hadir)">
                     <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>
                   </button>
                </div>
                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">Shift + Enter untuk baris baru</span>
              </div>
            </div>
            <Button 
              type="submit" 
              className="h-14 w-14 rounded-2xl shadow-lg shadow-blue-500/20 flex-shrink-0"
              isLoading={isTyping}
            >
              {!isTyping && (
                <svg className="w-6 h-6 rotate-90" fill="currentColor" viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" /></svg>
              )}
            </Button>
          </form>
          <p className="text-center mt-3 text-[10px] text-slate-400 uppercase tracking-widest">
            Kecerdasan Buatan dapat melakukan kesalahan. Selalu verifikasi sumber utama secara mandiri.
          </p>
        </div>
      </main>
    </div>
  );
};

export default App;
