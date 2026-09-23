import React, { useRef } from 'react';
import { 
  Upload, 
  Download, 
  Maximize2, 
  Sliders, 
  BookOpen, 
  Image as ImageIcon,
  FolderSync,
  Code2,
  Eye,
  Columns
} from 'lucide-react';
import { ViewMode } from '../types/hotspot';

interface TopNavbarProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  onUploadZip: (file: File) => void;
  onExportZip: () => void;
  onOpenFullscreenPreview: () => void;
  onOpenVisualTweaks: () => void;
  onOpenAssetManager: () => void;
  onOpenCheatSheet: () => void;
  onOpenTemplatePicker: () => void;
  currentProjectName: string;
}

export const TopNavbar: React.FC<TopNavbarProps> = ({
  viewMode,
  onViewModeChange,
  onUploadZip,
  onExportZip,
  onOpenFullscreenPreview,
  onOpenVisualTweaks,
  onOpenAssetManager,
  onOpenCheatSheet,
  onOpenTemplatePicker,
  currentProjectName,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onUploadZip(file);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <header className="h-14 border-b border-slate-800 bg-slate-900/90 backdrop-blur-md px-4 flex items-center justify-between z-30 shrink-0 select-none">
      {/* Zone 1: Single text element wordmark */}
      <div className="flex items-center gap-3">
        <a 
          href="/" 
          className="text-base font-bold tracking-tight text-white flex items-center gap-2 hover:opacity-90 transition-opacity"
          title="MikroTik Captive Portal Studio"
        >
          <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-sm font-black text-xs">
            MT
          </div>
          <span>MikroTik Hotspot Studio</span>
        </a>
        <span className="hidden sm:inline-block text-xs text-slate-500 font-mono border-l border-slate-800 pl-3">
          {currentProjectName}
        </span>
      </div>

      {/* Zone 2: Navigation / Workspace Action buttons */}
      <nav className="hidden md:flex items-center gap-1 bg-slate-950/60 p-1 rounded-lg border border-slate-800">
        <button
          onClick={() => onViewModeChange('split')}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
            viewMode === 'split'
              ? 'bg-slate-800 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
          title="Split View (Editor & Live Preview)"
        >
          <Columns className="w-3.5 h-3.5" />
          <span>Split</span>
        </button>
        <button
          onClick={() => onViewModeChange('code')}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
            viewMode === 'code'
              ? 'bg-slate-800 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
          title="Code Editor Only"
        >
          <Code2 className="w-3.5 h-3.5" />
          <span>Editor</span>
        </button>
        <button
          onClick={() => onViewModeChange('preview')}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
            viewMode === 'preview'
              ? 'bg-slate-800 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200'
          }`}
          title="Live Preview Only"
        >
          <Eye className="w-3.5 h-3.5" />
          <span>Preview</span>
        </button>
      </nav>

      {/* Zone 3: Primary actions (Upload ZIP, Download ZIP, Tools) */}
      <div className="flex items-center gap-2">
        <button
          onClick={onOpenTemplatePicker}
          className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-800 rounded-lg border border-slate-700/60 transition-colors"
          title="Pilih Template Bawaan"
        >
          <FolderSync className="w-3.5 h-3.5 text-blue-400" />
          <span className="hidden lg:inline">Template</span>
        </button>

        <button
          onClick={onOpenAssetManager}
          className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-800 rounded-lg border border-slate-700/60 transition-colors"
          title="Kelola Asset (Gambar, Logo, SVG)"
        >
          <ImageIcon className="w-3.5 h-3.5 text-amber-400" />
          <span className="hidden lg:inline">Assets</span>
        </button>

        <button
          onClick={onOpenVisualTweaks}
          className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-800 rounded-lg border border-slate-700/60 transition-colors"
          title="Ubah Nama Hotspot, Logo & Warna secara Visual"
        >
          <Sliders className="w-3.5 h-3.5 text-emerald-400" />
          <span className="hidden xl:inline">Ubah Cepat</span>
        </button>

        <button
          onClick={onOpenCheatSheet}
          className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-800 rounded-lg border border-slate-700/60 transition-colors"
          title="Panduan Variabel MikroTik RouterOS"
        >
          <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
          <span className="hidden xl:inline">Variabel MT</span>
        </button>

        {/* Hidden File Input for ZIP upload */}
        <input 
          type="file" 
          ref={fileInputRef}
          accept=".zip" 
          onChange={handleFileChange}
          className="hidden" 
        />

        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors whitespace-nowrap"
          title="Unggah file .zip template dari komputer Anda"
        >
          <Upload className="w-3.5 h-3.5 text-blue-400" />
          <span>Upload ZIP</span>
        </button>

        <button
          onClick={onExportZip}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg shadow-sm shadow-blue-600/30 transition-colors whitespace-nowrap"
          title="Download template siap pakai untuk Winbox MikroTik"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Download ZIP</span>
        </button>

        <button
          onClick={onOpenFullscreenPreview}
          className="p-1.5 text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-800 rounded-lg border border-slate-700/60 transition-colors ml-1"
          title="Tampilan Penuh (Fullscreen Preview)"
        >
          <Maximize2 className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
