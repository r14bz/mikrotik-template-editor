import React, { useRef, useState } from 'react';
import { X, Upload, Copy, Check, Trash2, Image as ImageIcon, FileText } from 'lucide-react';
import { VirtualFile } from '../types/hotspot';
import { createAssetBlobUrl } from '../utils/assetResolver';

interface AssetManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  files: Record<string, VirtualFile>;
  onUploadAsset: (file: File, folderPath?: string) => void;
  onDeleteAsset: (path: string) => void;
}

export const AssetManagerModal: React.FC<AssetManagerModalProps> = ({
  isOpen,
  onClose,
  files,
  onUploadAsset,
  onDeleteAsset,
}) => {
  const [copiedPath, setCopiedPath] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Filter asset files: images, fonts, media
  const assetFiles = Object.values(files).filter(f => {
    const ext = f.name.split('.').pop()?.toLowerCase() || '';
    return ['png', 'jpg', 'jpeg', 'webp', 'gif', 'svg', 'ico', 'woff', 'woff2', 'ttf'].includes(ext);
  });

  const handleCopyTag = (path: string) => {
    const tag = `<img src="${path}" alt="Asset Logo">`;
    navigator.clipboard.writeText(tag);
    setCopiedPath(path);
    setTimeout(() => setCopiedPath(null), 2000);
  };

  const handleCopyPath = (path: string) => {
    navigator.clipboard.writeText(path);
    setCopiedPath(`path:${path}`);
    setTimeout(() => setCopiedPath(null), 2000);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onUploadAsset(file, 'assets');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900">
          <div className="flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-amber-400" />
            <h2 className="text-base font-bold text-white">Kelola Berkas Aset &amp; Gambar</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Bar */}
        <div className="p-3 bg-slate-950/60 border-b border-slate-800 flex items-center justify-between text-xs">
          <span className="text-slate-400">
            Ditemukan <strong className="text-white">{assetFiles.length}</strong> aset gambar/font dalam template
          </span>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-lg transition-colors"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Unggah Gambar Baru</span>
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*,.woff,.woff2,.ttf"
            className="hidden"
          />
        </div>

        {/* Asset Grid */}
        <div className="flex-1 overflow-y-auto p-4">
          {assetFiles.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <ImageIcon className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="text-sm">Belum ada file gambar atau logo di folder template.</p>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="mt-3 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded-lg transition-colors"
              >
                Unggah Logo Pertama Anda
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {assetFiles.map(asset => {
                const isSvg = asset.name.endsWith('.svg');
                const blobUrl = createAssetBlobUrl(asset);

                return (
                  <div
                    key={asset.path}
                    className="bg-slate-950 border border-slate-800 rounded-xl p-3 flex flex-col justify-between hover:border-slate-700 transition-colors"
                  >
                    {/* Thumbnail */}
                    <div className="h-28 bg-slate-900/80 rounded-lg flex items-center justify-center p-2 mb-2 border border-slate-850 overflow-hidden">
                      <img
                        src={blobUrl}
                        alt={asset.name}
                        className="max-h-full max-w-full object-contain"
                        onLoad={() => {
                          // Clean up blob url after load if needed
                        }}
                      />
                    </div>

                    {/* Metadata */}
                    <div className="mb-2">
                      <div className="text-xs font-semibold text-white truncate" title={asset.name}>
                        {asset.name}
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono truncate">
                        {asset.path}
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-1.5 pt-2 border-t border-slate-900">
                      <button
                        onClick={() => handleCopyTag(asset.path)}
                        className="flex-1 py-1 px-2 bg-slate-900 hover:bg-slate-850 text-slate-300 hover:text-white rounded text-[10px] font-medium transition-colors flex items-center justify-center gap-1"
                        title="Salin kode tag HTML <img>"
                      >
                        {copiedPath === asset.path ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-400" />
                            <span className="text-emerald-400">Tersalin</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3 text-slate-400" />
                            <span>Salin Tag &lt;img&gt;</span>
                          </>
                        )}
                      </button>

                      <button
                        onClick={() => handleCopyPath(asset.path)}
                        className="p-1 text-slate-400 hover:text-blue-400 hover:bg-slate-900 rounded"
                        title="Salin Relative Path"
                      >
                        <FileText className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => {
                          if (confirm(`Hapus aset "${asset.path}"?`)) {
                            onDeleteAsset(asset.path);
                          }
                        }}
                        className="p-1 text-slate-400 hover:text-rose-400 hover:bg-slate-900 rounded"
                        title="Hapus Aset"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Tip Footer */}
        <div className="p-3 bg-slate-950 border-t border-slate-800 text-[11px] text-slate-500">
          Tip: Dalam kode HTML/CSS, panggil aset menggunakan relative path seperti <code className="text-blue-400">src="assets/logo.svg"</code>. Preview browser akan otomatis menerjemahkannya secara langsung.
        </div>
      </div>
    </div>
  );
};
