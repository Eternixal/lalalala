
import React from 'react';
import { ChatSession } from '../types';

interface SidebarProps {
  sessions: ChatSession[];
  activeSessionId: string | null;
  onSelectSession: (id: string) => void;
  onNewSession: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  sessions,
  activeSessionId,
  onSelectSession,
  onNewSession
}) => {
  return (
    <div className="w-64 bg-slate-900 h-screen flex flex-col text-slate-300 border-r border-slate-800">
      <div className="p-4 flex items-center gap-2 mb-4">
        <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center font-bold text-white">C</div>
        <h1 className="text-xl font-bold text-white tracking-tight">CendekiaAI</h1>
      </div>

      <div className="px-4 mb-6">
        <button
          onClick={onNewSession}
          className="w-full flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-white py-2 px-4 rounded-lg border border-slate-700 transition-all text-sm"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
          Riset Baru
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-2 space-y-1">
        <div className="px-3 mb-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">Riwayat Riset</div>
        {sessions.length === 0 ? (
          <p className="px-3 py-4 text-sm text-slate-500 italic">Belum ada riwayat riset.</p>
        ) : (
          sessions.map((session) => (
            <button
              key={session.id}
              onClick={() => onSelectSession(session.id)}
              className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors flex flex-col gap-1 truncate ${
                activeSessionId === session.id
                  ? 'bg-blue-600/10 text-blue-400 border-l-2 border-blue-600'
                  : 'hover:bg-slate-800'
              }`}
            >
              <span className="font-medium truncate">{session.title}</span>
              <span className="text-[10px] text-slate-500">
                {new Date(session.updatedAt).toLocaleDateString('id-ID', { month: 'short', day: 'numeric' })}
              </span>
            </button>
          ))
        )}
      </div>

      <div className="p-4 border-t border-slate-800 text-xs text-slate-500">
        <p>&copy; 2024 CendekiaAI</p>
        <p>Edisi Peneliti Muda</p>
      </div>
    </div>
  );
};
