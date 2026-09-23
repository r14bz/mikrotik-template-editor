import React, { useState } from 'react';
import { X, Sliders, Check, Palette, Phone, Type } from 'lucide-react';
import { VirtualFile } from '../types/hotspot';

interface VisualTweaksModalProps {
  isOpen: boolean;
  onClose: () => void;
  files: Record<string, VirtualFile>;
  onSaveFileContent: (path: string, content: string) => void;
}

export const VisualTweaksModal: React.FC<VisualTweaksModalProps> = ({
  isOpen,
  onClose,
  files,
  onSaveFileContent,
}) => {
  const [portalTitle, setPortalTitle] = useState('FLASHNET HOTSPOT');
  const [welcomeHeading, setWelcomeHeading] = useState('Selamat Datang di Hotspot');
  const [welcomeMessage, setWelcomeMessage] = useState('Silakan masukkan kode voucher atau akun member Anda untuk mulai browsing internet cepat.');
  const [waNumber, setWaNumber] = useState('6281234567890');
  const [accentColor, setAccentColor] = useState('#2563eb');
  const [appliedToast, setAppliedToast] = useState(false);

  if (!isOpen) return null;

  const colorPresets = [
    { name: 'Biru ISP', hex: '#2563eb' },
    { name: 'Hijau Emerald', hex: '#059669' },
    { name: 'Amber Kopi', hex: '#d97706' },
    { name: 'Ungu Cyber', hex: '#7c3aed' },
    { name: 'Merah Crimson', hex: '#dc2626' },
    { name: 'Cyan Neon', hex: '#0891b2' },
  ];

  const handleApply = () => {
    // 1. Update style.css primary color
    const cssFile = files['css/style.css'];
    if (cssFile) {
      let updatedCss = cssFile.content;
      // replace primary buttons, gradients, highlights with accentColor
      updatedCss = updatedCss.replace(/#2563eb/g, accentColor);
      updatedCss = updatedCss.replace(/#d97706/g, accentColor);
      onSaveFileContent('css/style.css', updatedCss);
    }

    // 2. Update login.html welcome text & whatsapp
    const loginFile = files['login.html'];
    if (loginFile) {
      let updatedHtml = loginFile.content;
      
      // Update welcome h1 if present
      updatedHtml = updatedHtml.replace(/<h1>(.*?)<\/h1>/gi, `<h1>${welcomeHeading}</h1>`);
      
      // Update whatsapp link if present
      if (waNumber) {
        updatedHtml = updatedHtml.replace(/wa\.me\/\d+/g, `wa.me/${waNumber.replace(/[^0-9]/g, '')}`);
      }

      onSaveFileContent('login.html', updatedHtml);
    }

    setAppliedToast(true);
    setTimeout(() => {
      setAppliedToast(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-emerald-400" />
            <h2 className="text-base font-bold text-white">Pengaturan Cepat Tampilan</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-4 text-xs overflow-y-auto max-h-[70vh]">
          {/* Welcome Heading */}
          <div>
            <label className="block font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
              <Type className="w-3.5 h-3.5 text-blue-400" />
              <span>Judul Sambutan (Heading):</span>
            </label>
            <input
              type="text"
              value={welcomeHeading}
              onChange={e => setWelcomeHeading(e.target.value)}
              placeholder="Contoh: Selamat Datang di Wi-Fi Cepat"
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500 text-xs"
            />
          </div>

          {/* WhatsApp Admin Phone */}
          <div>
            <label className="block font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-emerald-400" />
              <span>Nomor WhatsApp CS / Admin:</span>
            </label>
            <input
              type="text"
              value={waNumber}
              onChange={e => setWaNumber(e.target.value)}
              placeholder="Contoh: 6281234567890"
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500 text-xs font-mono"
            />
            <p className="text-[10px] text-slate-500 mt-1">Gunakan format internasional tanpa tanda plus (contoh: 6281xxx).</p>
          </div>

          {/* Accent Color Palette */}
          <div>
            <label className="block font-semibold text-slate-300 mb-2 flex items-center gap-1.5">
              <Palette className="w-3.5 h-3.5 text-amber-400" />
              <span>Warna Tema Utama (Primary Accent):</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {colorPresets.map(preset => (
                <button
                  key={preset.hex}
                  type="button"
                  onClick={() => setAccentColor(preset.hex)}
                  className={`flex items-center gap-2 p-2 rounded-lg border text-left transition-colors ${
                    accentColor === preset.hex
                      ? 'border-white bg-slate-850'
                      : 'border-slate-800 bg-slate-950 hover:border-slate-700'
                  }`}
                >
                  <span
                    className="w-4 h-4 rounded-full shrink-0 shadow-sm"
                    style={{ backgroundColor: preset.hex }}
                  ></span>
                  <span className="text-[11px] text-slate-300 font-medium truncate">{preset.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950 flex items-center justify-between">
          <span className="text-[11px] text-slate-500">
            Perubahan langsung diterapkan ke file template.
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3 py-1.5 text-xs text-slate-400 hover:text-white transition-colors"
            >
              Batal
            </button>
            <button
              onClick={handleApply}
              className="px-4 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg shadow-sm transition-colors flex items-center gap-1.5"
            >
              {appliedToast ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-300" />
                  <span>Terapkan Berhasil!</span>
                </>
              ) : (
                <span>Terapkan ke Template</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
