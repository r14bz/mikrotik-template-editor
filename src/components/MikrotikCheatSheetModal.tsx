import React, { useState } from 'react';
import { X, BookOpen, Copy, Check, Terminal, ExternalLink } from 'lucide-react';

interface MikrotikCheatSheetModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MikrotikCheatSheetModal: React.FC<MikrotikCheatSheetModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [copiedVar, setCopiedVar] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'variables' | 'winbox'>('variables');

  if (!isOpen) return null;

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedVar(text);
    setTimeout(() => setCopiedVar(null), 1800);
  };

  const variablesList = [
    { tag: '$(link-login-only)', desc: 'Action URL form POST login MikroTik. Wajib pada tag <form action="$(link-login-only)" method="post">.' },
    { tag: '$(error)', desc: 'Pesan kegagalan login (contoh: "invalid username or password", "simultaneous session limit reached").' },
    { tag: '$(if error) ... $(endif)', desc: 'Blok logika kondisional: konten di dalamnya hanya tampil jika terjadi error saat login.' },
    { tag: '$(identity)', desc: 'Nama identitas router MikroTik (System Identity). Sangat cocok untuk judul hotspot dinamis.' },
    { tag: '$(ip)', desc: 'Alamat IP lokal perangkat user yang terhubung ke jaringan hotspot.' },
    { tag: '$(mac)', desc: 'Alamat fisik kartu jaringan (MAC address) perangkat client user.' },
    { tag: '$(mac-esc)', desc: 'Alamat MAC client dalam format aman URL (misal: 64-D1-54-3B-19-A2).' },
    { tag: '$(username)', desc: 'Nama user atau kode voucher yang sedang aktif (pada status.html).' },
    { tag: '$(uptime)', desc: 'Lama waktu user telah terhubung ke internet (contoh: "01:25:34").' },
    { tag: '$(bytes-in-nice)', desc: 'Jumlah data upload yang diformat ramah baca (contoh: "14.2 MB").' },
    { tag: '$(bytes-out-nice)', desc: 'Jumlah data download yang diformat ramah baca (contoh: "158.4 MB").' },
    { tag: '$(session-timeout)', desc: 'Sisa batas durasi waktu online sebelum koneksi terputus.' },
    { tag: '$(trial)', desc: 'Bernilai "yes" jika opsi coba gratis (free trial) diaktifkan di Server Profile.' },
    { tag: '$(link-logout)', desc: 'Link URL untuk memutus sesi koneksi internet (digunakan di status.html).' },
    { tag: '$(link-orig)', desc: 'URL website yang mula-mula ingin dibuka oleh user sebelum dialihkan ke portal.' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl max-h-[85vh] shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-indigo-400" />
            <h2 className="text-base font-bold text-white">Panduan Variabel &amp; Pasang MikroTik</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="flex border-b border-slate-800 bg-slate-950 px-4 pt-2">
          <button
            onClick={() => setActiveTab('variables')}
            className={`pb-2 px-3 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === 'variables'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Daftar Variabel RouterOS $(...)
          </button>
          <button
            onClick={() => setActiveTab('winbox')}
            className={`pb-2 px-3 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === 'winbox'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Cara Pasang di Winbox MikroTik
          </button>
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-5 text-xs">
          {activeTab === 'variables' ? (
            <div className="space-y-2">
              <p className="text-slate-400 mb-4">
                RouterOS MikroTik secara otomatis mengganti kode tag <code className="text-blue-400 font-mono">$(nama-variabel)</code> dengan data nyata pengguna saat portal dibuka. Klik variabel di bawah untuk menyalin:
              </p>
              <div className="grid grid-cols-1 gap-2">
                {variablesList.map(v => (
                  <div
                    key={v.tag}
                    onClick={() => handleCopy(v.tag)}
                    className="p-2.5 bg-slate-950 border border-slate-800 rounded-xl hover:border-slate-700 cursor-pointer flex items-center justify-between group transition-colors"
                  >
                    <div className="pr-4">
                      <div className="font-mono font-semibold text-blue-400 text-xs flex items-center gap-2">
                        <span>{v.tag}</span>
                      </div>
                      <div className="text-slate-400 text-[11px] mt-0.5 leading-relaxed">
                        {v.desc}
                      </div>
                    </div>
                    <button
                      className="p-1 text-slate-500 group-hover:text-white transition-colors shrink-0"
                      title="Salin"
                    >
                      {copiedVar === v.tag ? (
                        <Check className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-4 text-slate-300">
              <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-emerald-400" />
                  <span>4 Langkah Mudah Memasang Template ke Router MikroTik</span>
                </h3>

                <ol className="list-decimal pl-5 space-y-3 text-xs leading-relaxed text-slate-300">
                  <li>
                    <strong className="text-white">Download ZIP:</strong> Tekan tombol <span className="px-1.5 py-0.5 bg-blue-600/30 text-blue-300 rounded font-mono">Download ZIP</span> di pojok kanan atas aplikasi ini, lalu ekstrak file ZIP tersebut di komputer Anda (misal jadi folder bernama <code className="text-amber-400">hotspot-baru</code>).
                  </li>
                  <li>
                    <strong className="text-white">Buka Winbox:</strong> Hubungkan ke router MikroTik Anda, lalu buka menu <span className="text-white font-semibold">Files</span> di menu bar sebelah kiri.
                  </li>
                  <li>
                    <strong className="text-white">Upload Folder:</strong> Tarik (drag &amp; drop) folder <code className="text-amber-400">hotspot-baru</code> langsung ke jendela Files Winbox.
                  </li>
                  <li>
                    <strong className="text-white">Terapkan di Server Profile:</strong> Buka menu <span className="text-white font-semibold">IP</span> &rarr; <span className="text-white font-semibold">Hotspot</span> &rarr; tab <span className="text-white font-semibold">Server Profiles</span>. Klik dua kali profile hotspot Anda (misal <code>hsprof1</code>), pada kolom <strong className="text-emerald-400">HTML Directory</strong> pilih nama folder yang baru Anda upload (<code className="text-amber-400">hotspot-baru</code>). Klik <span className="text-white font-semibold">Apply</span> dan <span className="text-white font-semibold">OK</span>.
                  </li>
                </ol>
              </div>

              <div className="p-3 bg-blue-950/30 border border-blue-800/40 rounded-xl text-[11px] text-blue-300">
                <strong>Tips Penting:</strong> Pastikan file <code className="text-white">login.html</code>, <code className="text-white">css/style.css</code>, dan folder <code className="text-white">assets/</code> tetap berada dalam struktur direktori yang sama saat diupload ke MikroTik agar seluruh gambar dan styling terpanggil dengan sempurna.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
