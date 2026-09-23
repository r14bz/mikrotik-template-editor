import React, { useState, useRef, useEffect } from 'react';
import { 
  X, 
  Copy, 
  Check, 
  Search, 
  Sparkles, 
  FileCode, 
  Image as ImageIcon,
  Save,
  RotateCcw,
  Code
} from 'lucide-react';
import { VirtualFile } from '../types/hotspot';
import { createAssetBlobUrl } from '../utils/assetResolver';

interface CodeEditorProps {
  files: Record<string, VirtualFile>;
  activeFile: string;
  openTabs: string[];
  onSelectFile: (path: string) => void;
  onCloseTab: (path: string) => void;
  onFileContentChange: (path: string, content: string) => void;
  onInsertSnippet: (snippet: string) => void;
}

export const CodeEditor: React.FC<CodeEditorProps> = ({
  files,
  activeFile,
  openTabs,
  onSelectFile,
  onCloseTab,
  onFileContentChange,
}) => {
  const currentFile = files[activeFile];
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [copied, setCopied] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [binaryImageUrl, setBinaryImageUrl] = useState<string | null>(null);

  // Sync binary image URL
  useEffect(() => {
    if (currentFile?.isBinary) {
      const url = createAssetBlobUrl(currentFile);
      setBinaryImageUrl(url);
      return () => {
        try {
          URL.revokeObjectURL(url);
        } catch {
          // ignore
        }
      };
    } else {
      setBinaryImageUrl(null);
    }
  }, [currentFile]);

  // Handle Tab key indentation & Enter auto-indent
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (!textareaRef.current || !currentFile) return;

    if (e.key === 'Tab') {
      e.preventDefault();
      const start = textareaRef.current.selectionStart;
      const end = textareaRef.current.selectionEnd;
      const val = currentFile.content;

      // Insert 2 spaces
      const updated = val.substring(0, start) + '  ' + val.substring(end);
      onFileContentChange(activeFile, updated);

      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.selectionStart = textareaRef.current.selectionEnd = start + 2;
        }
      }, 0);
    }
  };

  const insertSnippet = (snippetText: string) => {
    if (!textareaRef.current || !currentFile || currentFile.isBinary) return;
    const start = textareaRef.current.selectionStart;
    const end = textareaRef.current.selectionEnd;
    const val = currentFile.content;
    const updated = val.substring(0, start) + snippetText + val.substring(end);
    onFileContentChange(activeFile, updated);

    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.selectionStart = textareaRef.current.selectionEnd = start + snippetText.length;
      }
    }, 0);
  };

  const handleCopyCode = () => {
    if (currentFile && !currentFile.isBinary) {
      navigator.clipboard.writeText(currentFile.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Line numbers calculation
  const lines = (currentFile?.content || '').split('\n');
  const lineCount = lines.length || 1;

  // MikroTik snippet buttons
  const mikrotikSnippets = [
    { label: '$(link-login-only)', code: '$(link-login-only)', tip: 'Action URL form login MikroTik' },
    { label: '$(error) alert', code: `$(if error)\n<div class="alert alert-danger">\n  <span>$(error)</span>\n</div>\n$(endif)`, tip: 'Blok kondisi peringatan error MikroTik' },
    { label: '$(identity)', code: '$(identity)', tip: 'Nama identitas router MikroTik' },
    { label: '$(ip) & $(mac)', code: 'IP: $(ip) | MAC: $(mac)', tip: 'Info IP & MAC address client' },
    { label: '$(trial) block', code: `$(if trial == 'yes')\n<a href="$(link-login-only)?dst=$(link-orig-esc)&username=T-$(mac-esc)">Coba Gratis</a>\n$(endif)`, tip: 'Tombol trial gratis' },
    { label: 'Form Input Voucher', code: `<div class="form-group">\n  <label>KODE VOUCHER</label>\n  <input type="text" name="username" placeholder="Masukkan voucher" required>\n  <input type="hidden" name="password">\n</div>`, tip: 'Snippet input kode voucher' },
  ];

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-950 overflow-hidden border-r border-slate-800">
      {/* Top Tab Bar */}
      <div className="h-10 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-2 select-none overflow-x-auto shrink-0">
        <div className="flex items-center gap-1 overflow-x-auto py-1">
          {openTabs.map(tabPath => {
            const isTabActive = activeFile === tabPath;
            const tabFile = files[tabPath];
            const name = tabPath.split('/').pop() || tabPath;

            return (
              <div
                key={tabPath}
                onClick={() => onSelectFile(tabPath)}
                className={`group flex items-center gap-1.5 px-3 py-1 text-xs rounded-md cursor-pointer border transition-colors ${
                  isTabActive
                    ? 'bg-slate-950 text-white border-slate-700 shadow-sm font-medium'
                    : 'bg-slate-900/60 text-slate-400 border-transparent hover:text-slate-200 hover:bg-slate-800/80'
                }`}
              >
                <FileCode className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                <span className="truncate max-w-[120px]">{name}</span>
                {openTabs.length > 1 && (
                  <button
                    onClick={e => {
                      e.stopPropagation();
                      onCloseTab(tabPath);
                    }}
                    className="p-0.5 rounded hover:bg-slate-800 text-slate-500 hover:text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Tutup Tab"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1 shrink-0 ml-2">
          <button
            onClick={() => setShowSearch(!showSearch)}
            className={`p-1.5 rounded transition-colors ${
              showSearch ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
            title="Cari Teks (Find)"
          >
            <Search className="w-3.5 h-3.5" />
          </button>
          {!currentFile?.isBinary && (
            <button
              onClick={handleCopyCode}
              className="flex items-center gap-1 px-2 py-1 text-xs text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors"
              title="Salin Isi Kode"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-[11px] text-emerald-400">Tersalin</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span className="text-[11px]">Salin</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Quick MikroTik Snippet Bar */}
      {!currentFile?.isBinary && (
        <div className="h-9 bg-slate-900/50 border-b border-slate-800/80 px-3 flex items-center gap-1.5 overflow-x-auto shrink-0 select-none text-[11px]">
          <span className="text-slate-500 font-semibold flex items-center gap-1 mr-1 shrink-0">
            <Sparkles className="w-3 h-3 text-amber-400" />
            <span>Sisipkan:</span>
          </span>
          {mikrotikSnippets.map((s, idx) => (
            <button
              key={idx}
              onClick={() => insertSnippet(s.code)}
              className="px-2 py-0.5 bg-slate-800/90 hover:bg-blue-600/30 text-slate-300 hover:text-blue-300 border border-slate-700/60 hover:border-blue-500/40 rounded transition-all whitespace-nowrap font-mono text-[11px]"
              title={s.tip}
            >
              {s.label}
            </button>
          ))}
        </div>
      )}

      {/* Search Bar Drawer */}
      {showSearch && !currentFile?.isBinary && (
        <div className="p-2 bg-slate-900 border-b border-slate-800 flex items-center gap-2">
          <Search className="w-3.5 h-3.5 text-slate-400 ml-1" />
          <input
            type="text"
            placeholder="Cari kata/variabel dalam file..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="flex-1 bg-slate-950 border border-slate-700 rounded px-2 py-1 text-xs text-white focus:outline-none focus:border-blue-500"
          />
          {searchQuery && (
            <span className="text-xs text-slate-400 font-mono">
              {(currentFile?.content.match(new RegExp(searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi')) || []).length} kecocokan
            </span>
          )}
          <button
            onClick={() => setShowSearch(false)}
            className="p-1 text-slate-400 hover:text-white"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Editor Surface */}
      <div className="flex-1 relative overflow-hidden flex">
        {currentFile?.isBinary ? (
          /* Binary Image/Asset Preview */
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-slate-950">
            <div className="p-6 bg-slate-900/60 rounded-2xl border border-slate-800 flex flex-col items-center max-w-md">
              {binaryImageUrl ? (
                <div className="max-h-64 max-w-full mb-4 p-4 bg-slate-950/80 rounded-xl border border-slate-800 flex items-center justify-center">
                  <img
                    src={binaryImageUrl}
                    alt={currentFile.name}
                    className="max-h-56 max-w-full object-contain rounded"
                  />
                </div>
              ) : (
                <ImageIcon className="w-16 h-16 text-slate-600 mb-4" />
              )}
              <div className="text-sm font-semibold text-white mb-1">{currentFile.name}</div>
              <div className="text-xs text-slate-400 font-mono mb-4">
                Path: <span className="text-blue-400">{currentFile.path}</span> &bull; {currentFile.mimeType}
              </div>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(`<img src="${currentFile.path}" alt="${currentFile.name}">`);
                  alert(`Tag HTML tersalin: <img src="${currentFile.path}" alt="${currentFile.name}">`);
                }}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium rounded-lg transition-colors"
              >
                Salin Tag &lt;img src="{currentFile.path}"&gt;
              </button>
            </div>
          </div>
        ) : (
          /* Text/Code Editor */
          <div className="flex-1 flex h-full overflow-hidden">
            {/* Line numbers column */}
            <div className="w-12 py-3 bg-slate-950 border-r border-slate-900 text-right pr-2 text-slate-600 font-mono text-xs select-none overflow-hidden shrink-0">
              {Array.from({ length: Math.min(lineCount, 800) }).map((_, i) => (
                <div key={i} className="leading-6 text-[11px]">
                  {i + 1}
                </div>
              ))}
            </div>

            {/* Code Input Area */}
            <div className="flex-1 relative h-full">
              <textarea
                ref={textareaRef}
                value={currentFile?.content || ''}
                onChange={e => onFileContentChange(activeFile, e.target.value)}
                onKeyDown={handleKeyDown}
                spellCheck={false}
                className="w-full h-full p-3 bg-slate-950 text-slate-100 font-mono text-xs leading-6 resize-none focus:outline-none overflow-auto selection:bg-blue-600/30 whitespace-pre"
                style={{ tabSize: 2 }}
                placeholder="Tulis kode template MikroTik di sini..."
              />
            </div>
          </div>
        )}
      </div>

      {/* Editor Status Bar */}
      <div className="h-6 bg-slate-900 border-t border-slate-800 px-3 flex items-center justify-between text-[11px] text-slate-500 font-mono select-none shrink-0">
        <div className="flex items-center gap-3">
          <span>{activeFile}</span>
          <span>&bull;</span>
          <span>{currentFile?.isBinary ? 'Binary Asset' : `${lineCount} Baris`}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-slate-400">UTF-8</span>
          <span>&bull;</span>
          <span className="text-emerald-400 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            Tersimpan Otomatis
          </span>
        </div>
      </div>
    </div>
  );
};
