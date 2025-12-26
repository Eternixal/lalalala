
import React from 'react';
import { AcademicResponse } from '../types';

interface ResponseDisplayProps {
  response: AcademicResponse;
}

export const ResponseDisplay: React.FC<ResponseDisplayProps> = ({ response }) => {
  const { title, type, summary, mainContent, academicNotes } = response;

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'pencarian jurnal': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'ringkasan jurnal': return 'bg-green-100 text-green-700 border-green-200';
      case 'laporan praktikum': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'penjelasan konsep': return 'bg-blue-100 text-blue-700 border-blue-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="p-6 md:p-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 border-b border-slate-100 pb-6">
          <h2 className="text-2xl font-bold font-serif text-slate-800">{title}</h2>
          <span className={`px-3 py-1 rounded-full text-xs font-semibold border uppercase tracking-wider w-fit ${getTypeColor(type)}`}>
            {type}
          </span>
        </div>

        {/* Summary */}
        <div className="mb-8">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            Ringkasan Singkat
          </h3>
          <p className="text-slate-700 leading-relaxed font-serif italic text-lg">
            {summary}
          </p>
        </div>

        {/* Main Content */}
        <div className="mb-8 space-y-6">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            Isi Utama
          </h3>
          <div className="prose prose-slate max-w-none text-slate-800 leading-relaxed whitespace-pre-wrap font-sans">
            {mainContent}
          </div>
        </div>

        {/* Academic Notes */}
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-5">
          <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
            Catatan Akademik
          </h3>
          <div className="text-sm text-slate-600 space-y-2 whitespace-pre-wrap">
            {academicNotes}
          </div>
        </div>
      </div>
    </div>
  );
};
