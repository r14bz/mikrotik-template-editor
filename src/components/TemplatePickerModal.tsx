import React from 'react';
import { X, Check, LayoutTemplate, ArrowRight } from 'lucide-react';
import { STARTER_TEMPLATES, StarterTemplate } from '../data/defaultTemplates';

interface TemplatePickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTemplate: (template: StarterTemplate) => void;
  currentTemplateId: string;
}

export const TemplatePickerModal: React.FC<TemplatePickerModalProps> = ({
  isOpen,
  onClose,
  onSelectTemplate,
  currentTemplateId,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <LayoutTemplate className="w-5 h-5 text-blue-400" />
            <h2 className="text-base font-bold text-white">Pilih Template Hotspot MikroTik</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Template List */}
        <div className="p-5 space-y-3 overflow-y-auto max-h-[70vh]">
          {STARTER_TEMPLATES.map(tpl => {
            const isCurrent = currentTemplateId === tpl.id;
            return (
              <div
                key={tpl.id}
                onClick={() => {
                  if (confirm(`Ganti workspace ke template "${tpl.name}"? File yang belum di-download akan digantikan.`)) {
                    onSelectTemplate(tpl);
                    onClose();
                  }
                }}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  isCurrent
                    ? 'bg-blue-950/40 border-blue-500/60 shadow-md'
                    : 'bg-slate-950 border-slate-800 hover:border-slate-700 hover:bg-slate-900/80'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-white">{tpl.name}</h3>
                      <span className="text-[10px] px-2 py-0.5 bg-blue-600/20 text-blue-400 border border-blue-500/30 rounded-full font-medium">
                        {tpl.badge}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">{tpl.description}</p>
                  </div>
                  {isCurrent ? (
                    <span className="flex items-center gap-1 text-xs text-blue-400 font-semibold shrink-0">
                      <Check className="w-4 h-4" />
                      Aktif
                    </span>
                  ) : (
                    <span className="text-xs text-slate-500 flex items-center gap-1 shrink-0 hover:text-white">
                      <span>Pilih</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-slate-900 text-[11px] text-slate-500">
                  <span>Kategori: <strong className="text-slate-400">{tpl.category}</strong></span>
                  <span>&bull;</span>
                  <span>{Object.keys(tpl.files).length} file template</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer info */}
        <div className="p-3 bg-slate-950 border-t border-slate-800 text-[11px] text-slate-500 text-center">
          Anda juga dapat mengunggah template kustom Anda sendiri kapan saja dengan tombol <strong>Upload ZIP</strong>.
        </div>
      </div>
    </div>
  );
};
