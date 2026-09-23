import React, { useState } from 'react';
import { 
  FileCode, 
  FileText, 
  Folder, 
  FolderOpen, 
  Image as ImageIcon, 
  Plus, 
  Trash2, 
  Edit3, 
  Upload, 
  Check, 
  X,
  FileSpreadsheet
} from 'lucide-react';
import { VirtualFile } from '../types/hotspot';
import { getMimeType } from '../utils/zipHandler';

interface FileTreeProps {
  files: Record<string, VirtualFile>;
  activeFile: string;
  onSelectFile: (path: string) => void;
  onCreateFile: (path: string) => void;
  onDeleteFile: (path: string) => void;
  onRenameFile: (oldPath: string, newPath: string) => void;
  onUploadAsset: (file: File, folderPath?: string) => void;
}

export const FileTree: React.FC<FileTreeProps> = ({
  files,
  activeFile,
  onSelectFile,
  onCreateFile,
  onDeleteFile,
  onRenameFile,
  onUploadAsset,
}) => {
  const [openFolders, setOpenFolders] = useState<Record<string, boolean>>({
    '': true,
    'css': true,
    'js': true,
    'assets': true,
    'img': true,
  });
  const [isCreatingFile, setIsCreatingFile] = useState(false);
  const [newFileName, setNewFileName] = useState('');
  const [editingPath, setEditingPath] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const assetInputRef = React.useRef<HTMLInputElement>(null);

  // Toggle folder open/closed
  const toggleFolder = (folder: string) => {
    setOpenFolders(prev => ({ ...prev, [folder]: !prev[folder] }));
  };

  // Group files into folder structure
  const filePaths = Object.keys(files).sort((a, b) => {
    // Put root files first, then alphabetized
    return a.localeCompare(b);
  });

  const folders = new Set<string>();
  filePaths.forEach(path => {
    const parts = path.split('/');
    if (parts.length > 1) {
      folders.add(parts.slice(0, -1).join('/'));
    }
  });

  // Get file icon based on extension and Mikrotik role
  const getFileIcon = (path: string) => {
    const ext = path.split('.').pop()?.toLowerCase();
    if (path === 'login.html') {
      return <FileCode className="w-4 h-4 text-emerald-400 shrink-0" />;
    }
    if (path === 'status.html') {
      return <FileCode className="w-4 h-4 text-blue-400 shrink-0" />;
    }
    if (path === 'error.html') {
      return <FileCode className="w-4 h-4 text-rose-400 shrink-0" />;
    }
    if (ext === 'html' || ext === 'htm') {
      return <FileCode className="w-4 h-4 text-amber-400 shrink-0" />;
    }
    if (ext === 'css') {
      return <FileSpreadsheet className="w-4 h-4 text-cyan-400 shrink-0" />;
    }
    if (ext === 'js') {
      return <FileText className="w-4 h-4 text-yellow-400 shrink-0" />;
    }
    if (['png', 'jpg', 'jpeg', 'webp', 'gif', 'svg', 'ico'].includes(ext || '')) {
      return <ImageIcon className="w-4 h-4 text-purple-400 shrink-0" />;
    }
    return <FileText className="w-4 h-4 text-slate-400 shrink-0" />;
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = newFileName.trim();
    if (clean) {
      onCreateFile(clean);
      setNewFileName('');
      setIsCreatingFile(false);
    }
  };

  const handleRenameSubmit = (oldPath: string) => {
    const clean = renameValue.trim();
    if (clean && clean !== oldPath) {
      onRenameFile(oldPath, clean);
    }
    setEditingPath(null);
  };

  const handleAssetFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onUploadAsset(file);
      if (assetInputRef.current) {
        assetInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="w-64 bg-slate-950 border-r border-slate-800 flex flex-col h-full select-none shrink-0 text-slate-300">
      {/* File Tree Header */}
      <div className="h-10 px-3 border-b border-slate-800/80 flex items-center justify-between">
        <span className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">
          Berkas Template
        </span>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsCreatingFile(true)}
            className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white transition-colors"
            title="Tambah Berkas Baru"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => assetInputRef.current?.click()}
            className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white transition-colors"
            title="Unggah Aset (Gambar/Logo/CSS)"
          >
            <Upload className="w-3.5 h-3.5" />
          </button>
          <input
            type="file"
            ref={assetInputRef}
            onChange={handleAssetFileChange}
            accept="image/*,text/css,application/javascript"
            className="hidden"
          />
        </div>
      </div>

      {/* New File Inline Prompt */}
      {isCreatingFile && (
        <form onSubmit={handleCreateSubmit} className="p-2 border-b border-slate-800 bg-slate-900">
          <div className="text-[10px] text-slate-400 font-medium mb-1">
            Nama file (contoh: radvert.html atau css/custom.css):
          </div>
          <div className="flex items-center gap-1">
            <input
              type="text"
              autoFocus
              value={newFileName}
              onChange={e => setNewFileName(e.target.value)}
              placeholder="nama_file.html"
              className="flex-1 bg-slate-950 border border-slate-700 rounded px-2 py-1 text-xs text-white focus:outline-none focus:border-blue-500"
            />
            <button
              type="submit"
              className="p-1 bg-blue-600 hover:bg-blue-500 text-white rounded"
              title="Buat"
            >
              <Check className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setIsCreatingFile(false)}
              className="p-1 bg-slate-800 hover:bg-slate-700 text-slate-400 rounded"
              title="Batal"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>
      )}

      {/* File Tree List */}
      <div className="flex-1 overflow-y-auto p-1.5 space-y-0.5">
        {filePaths.map(path => {
          const file = files[path];
          const isSelected = activeFile === path;
          const isEditing = editingPath === path;
          const isCoreLogin = path === 'login.html';
          const isCoreStatus = path === 'status.html';

          if (isEditing) {
            return (
              <div key={path} className="flex items-center gap-1 px-2 py-1 bg-slate-900 rounded">
                <input
                  type="text"
                  autoFocus
                  value={renameValue}
                  onChange={e => setRenameValue(e.target.value)}
                  className="flex-1 bg-slate-950 border border-slate-700 rounded px-1.5 py-0.5 text-xs text-white"
                  onKeyDown={e => {
                    if (e.key === 'Enter') handleRenameSubmit(path);
                    if (e.key === 'Escape') setEditingPath(null);
                  }}
                />
                <button
                  onClick={() => handleRenameSubmit(path)}
                  className="p-1 text-emerald-400 hover:text-emerald-300"
                >
                  <Check className="w-3 h-3" />
                </button>
                <button
                  onClick={() => setEditingPath(null)}
                  className="p-1 text-slate-400 hover:text-slate-300"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            );
          }

          return (
            <div
              key={path}
              onClick={() => onSelectFile(path)}
              className={`group flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs cursor-pointer transition-colors ${
                isSelected
                  ? 'bg-blue-600/20 text-blue-300 font-medium'
                  : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
              }`}
            >
              <div className="flex items-center gap-2 min-w-0 truncate">
                {getFileIcon(path)}
                <span className="truncate">{path}</span>
                {isCoreLogin && (
                  <span className="text-[9px] px-1 py-0.2 bg-emerald-500/10 text-emerald-400 rounded shrink-0">
                    UTAMA
                  </span>
                )}
                {isCoreStatus && (
                  <span className="text-[9px] px-1 py-0.2 bg-blue-500/10 text-blue-400 rounded shrink-0">
                    STATUS
                  </span>
                )}
              </div>

              {/* Action buttons on hover */}
              <div className="hidden group-hover:flex items-center gap-1 shrink-0 ml-1">
                <button
                  onClick={e => {
                    e.stopPropagation();
                    setEditingPath(path);
                    setRenameValue(path);
                  }}
                  className="p-1 hover:text-blue-400 transition-colors"
                  title="Ganti Nama"
                >
                  <Edit3 className="w-3 h-3" />
                </button>
                {/* Don't let user accidentally delete login.html */}
                {!isCoreLogin && (
                  <button
                    onClick={e => {
                      e.stopPropagation();
                      if (confirm(`Hapus berkas "${path}"?`)) {
                        onDeleteFile(path);
                      }
                    }}
                    className="p-1 hover:text-rose-400 transition-colors"
                    title="Hapus"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* MikroTik Helper Footer */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-950/40 text-[11px] text-slate-500">
        <div className="font-semibold text-slate-400 mb-1 flex items-center justify-between">
          <span>Struktur Hotspot</span>
          <span className="text-[10px] font-mono text-blue-400">{Object.keys(files).length} berkas</span>
        </div>
        <p className="text-[11px] leading-relaxed">
          File <code className="text-emerald-400">login.html</code> adalah halaman portal utama saat user menghubungkan WiFi.
        </p>
      </div>
    </div>
  );
};
