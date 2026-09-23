/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useCallback, useEffect } from 'react';
import { VirtualFile, ViewMode, HotspotSimulationState } from './types/hotspot';
import { STARTER_TEMPLATES, StarterTemplate } from './data/defaultTemplates';
import { unpackZipFile, exportToZip, getMimeType } from './utils/zipHandler';
import { TopNavbar } from './components/TopNavbar';
import { FileTree } from './components/FileTree';
import { CodeEditor } from './components/CodeEditor';
import { LivePreview } from './components/LivePreview';
import { AssetManagerModal } from './components/AssetManagerModal';
import { VisualTweaksModal } from './components/VisualTweaksModal';
import { MikrotikCheatSheetModal } from './components/MikrotikCheatSheetModal';
import { TemplatePickerModal } from './components/TemplatePickerModal';
import { CheckCircle2, AlertCircle, Info, UploadCloud } from 'lucide-react';

export default function App() {
  // Load initial starter template
  const defaultTpl = STARTER_TEMPLATES[0];
  const [files, setFiles] = useState<Record<string, VirtualFile>>({ ...defaultTpl.files });
  const [currentTemplateId, setCurrentTemplateId] = useState<string>(defaultTpl.id);
  const [projectName, setProjectName] = useState<string>('FlashNet-Hotspot');

  // Editor states
  const [activeFile, setActiveFile] = useState<string>('login.html');
  const [openTabs, setOpenTabs] = useState<string[]>(['login.html', 'css/style.css', 'js/script.js']);
  const [activeHtmlPage, setActiveHtmlPage] = useState<string>('login.html');
  const [viewMode, setViewMode] = useState<ViewMode>('split');
  const [isFullscreenPreview, setIsFullscreenPreview] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  // MikroTik RouterOS Live Simulation parameters
  const [simulationState, setSimulationState] = useState<HotspotSimulationState>({
    routerIdentity: 'FlashNet-Hotspot',
    clientIp: '192.168.88.105',
    clientMac: '64:D1:54:3B:19:A2',
    simulatedError: 'invalid username or password',
    hasError: false,
    trialAllowed: true,
    username: 'user_voucher_89',
    uptime: '01:42:18',
    bytesIn: '34.2 MB',
    bytesOut: '142.8 MB',
    sessionTimeout: '03:17:42',
    linkLoginOnly: '#simulated-login',
    linkLogout: '#simulated-logout',
  });

  // Modals
  const [isAssetManagerOpen, setIsAssetManagerOpen] = useState(false);
  const [isVisualTweaksOpen, setIsVisualTweaksOpen] = useState(false);
  const [isCheatSheetOpen, setIsCheatSheetOpen] = useState(false);
  const [isTemplatePickerOpen, setIsTemplatePickerOpen] = useState(false);

  // Toast notifications
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);

  const showToast = useCallback((message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 3500);
  }, []);

  // Upload ZIP Handler
  const handleUploadZip = useCallback(async (file: File) => {
    try {
      showToast(`Mengekstrak file "${file.name}"...`, 'info');
      const unpackedFiles = await unpackZipFile(file);
      const fileKeys = Object.keys(unpackedFiles);

      if (fileKeys.length === 0) {
        showToast('File ZIP kosong atau format tidak sesuai.', 'error');
        return;
      }

      setFiles(unpackedFiles);
      setProjectName(file.name.replace(/\.zip$/i, ''));
      setCurrentTemplateId('custom');

      // Detect login.html or first html
      const primaryHtml = fileKeys.find(p => p.toLowerCase().endsWith('login.html')) ||
        fileKeys.find(p => p.toLowerCase().endsWith('.html')) ||
        fileKeys[0];

      setActiveFile(primaryHtml);
      setActiveHtmlPage(primaryHtml);
      setOpenTabs([primaryHtml]);

      showToast(`Berhasil memuat ${fileKeys.length} file template dari ZIP!`, 'success');
    } catch (err: any) {
      console.error(err);
      showToast(`Gagal membuka file ZIP: ${err.message || 'Format tidak valid'}`, 'error');
    }
  }, [showToast]);

  // Export ZIP Handler
  const handleExportZip = useCallback(async () => {
    try {
      const zipName = `${projectName.toLowerCase().replace(/\s+/g, '-')}-template.zip`;
      await exportToZip(files, zipName);
      showToast(`File ${zipName} berhasil diekspor dan diunduh!`, 'success');
    } catch (err: any) {
      console.error(err);
      showToast(`Gagal mengekspor ZIP: ${err.message}`, 'error');
    }
  }, [files, projectName, showToast]);

  // File Select
  const handleSelectFile = useCallback((path: string) => {
    setActiveFile(path);
    if (!openTabs.includes(path)) {
      setOpenTabs(prev => [...prev, path]);
    }
    if (path.endsWith('.html') || path.endsWith('.htm')) {
      setActiveHtmlPage(path);
    }
  }, [openTabs]);

  // Tab Close
  const handleCloseTab = useCallback((path: string) => {
    setOpenTabs(prev => {
      const filtered = prev.filter(p => p !== path);
      if (activeFile === path && filtered.length > 0) {
        setActiveFile(filtered[filtered.length - 1]);
      }
      return filtered;
    });
  }, [activeFile]);

  // Update File Content in Memory
  const handleFileContentChange = useCallback((path: string, newContent: string) => {
    setFiles(prev => {
      const target = prev[path];
      if (!target) return prev;
      return {
        ...prev,
        [path]: {
          ...target,
          content: newContent,
          lastModified: Date.now(),
        },
      };
    });
  }, []);

  // Create New File
  const handleCreateFile = useCallback((rawPath: string) => {
    const clean = rawPath.replace(/^\.?\//, '').trim();
    if (!clean) return;

    if (files[clean]) {
      showToast(`File "${clean}" sudah ada!`, 'error');
      handleSelectFile(clean);
      return;
    }

    const { mimeType, isBinary } = getMimeType(clean);
    const newFile: VirtualFile = {
      path: clean,
      name: clean.split('/').pop() || clean,
      content: clean.endsWith('.html') 
        ? `<!DOCTYPE html>\n<html>\n<head>\n  <title>$(identity)</title>\n  <link rel="stylesheet" href="css/style.css">\n</head>\n<body>\n  <h1>$(identity)</h1>\n</body>\n</html>`
        : clean.endsWith('.css')
        ? `/* Custom CSS */\n`
        : '',
      isBinary,
      mimeType,
      lastModified: Date.now(),
    };

    setFiles(prev => ({ ...prev, [clean]: newFile }));
    handleSelectFile(clean);
    showToast(`File "${clean}" berhasil dibuat!`, 'success');
  }, [files, handleSelectFile, showToast]);

  // Delete File
  const handleDeleteFile = useCallback((path: string) => {
    setFiles(prev => {
      const copy = { ...prev };
      delete copy[path];
      return copy;
    });
    handleCloseTab(path);
    showToast(`File "${path}" dihapus.`, 'info');
  }, [handleCloseTab, showToast]);

  // Rename File
  const handleRenameFile = useCallback((oldPath: string, newPath: string) => {
    const clean = newPath.replace(/^\.?\//, '').trim();
    if (!clean || clean === oldPath) return;

    setFiles(prev => {
      const copy = { ...prev };
      const file = copy[oldPath];
      if (!file) return prev;
      delete copy[oldPath];
      copy[clean] = {
        ...file,
        path: clean,
        name: clean.split('/').pop() || clean,
        lastModified: Date.now(),
      };
      return copy;
    });

    setOpenTabs(prev => prev.map(p => (p === oldPath ? clean : p)));
    if (activeFile === oldPath) setActiveFile(clean);
    if (activeHtmlPage === oldPath) setActiveHtmlPage(clean);
    showToast(`File diganti nama menjadi "${clean}".`, 'success');
  }, [activeFile, activeHtmlPage, showToast]);

  // Upload direct asset file (e.g. PNG, JPG, SVG)
  const handleUploadAsset = useCallback(async (file: File, targetFolder = 'assets') => {
    try {
      const { mimeType, isBinary } = getMimeType(file.name);
      const cleanPath = `${targetFolder}/${file.name}`;

      if (isBinary) {
        const buffer = await file.arrayBuffer();
        const binaryData = new Uint8Array(buffer);
        const virtualFile: VirtualFile = {
          path: cleanPath,
          name: file.name,
          content: '',
          binaryData,
          isBinary: true,
          mimeType,
          lastModified: Date.now(),
        };
        setFiles(prev => ({ ...prev, [cleanPath]: virtualFile }));
      } else {
        const text = await file.text();
        const virtualFile: VirtualFile = {
          path: cleanPath,
          name: file.name,
          content: text,
          isBinary: false,
          mimeType,
          lastModified: Date.now(),
        };
        setFiles(prev => ({ ...prev, [cleanPath]: virtualFile }));
      }

      showToast(`Aset "${file.name}" berhasil diunggah ke ${cleanPath}!`, 'success');
      handleSelectFile(cleanPath);
    } catch (err: any) {
      showToast(`Gagal mengunggah file: ${err.message}`, 'error');
    }
  }, [handleSelectFile, showToast]);

  // Select Starter Template
  const handleSelectTemplate = useCallback((template: StarterTemplate) => {
    setFiles({ ...template.files });
    setCurrentTemplateId(template.id);
    setProjectName(template.name.split(' ')[0]);
    setActiveFile('login.html');
    setActiveHtmlPage('login.html');
    setOpenTabs(['login.html', 'css/style.css']);
    showToast(`Template "${template.name}" dimuat!`, 'success');
  }, [showToast]);

  // Drag and Drop Global ZIP upload
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
      if (droppedFile.name.endsWith('.zip')) {
        handleUploadZip(droppedFile);
      } else if (['png', 'jpg', 'jpeg', 'webp', 'svg'].some(ext => droppedFile.name.toLowerCase().endsWith(ext))) {
        handleUploadAsset(droppedFile, 'assets');
      } else {
        showToast('Tarik & letakkan file .zip template atau gambar/logo.', 'info');
      }
    }
  };

  return (
    <div 
      className="flex flex-col h-screen w-screen bg-slate-950 text-slate-100 font-sans overflow-hidden select-none"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Drag & drop overlay indicator */}
      {isDragOver && (
        <div className="fixed inset-0 z-50 bg-blue-600/20 backdrop-blur-sm border-4 border-dashed border-blue-400 flex flex-col items-center justify-center pointer-events-none animate-in fade-in duration-150">
          <UploadCloud className="w-16 h-16 text-blue-400 mb-3 animate-bounce" />
          <div className="text-lg font-bold text-white">Lepaskan File ZIP Template MikroTik di Sini</div>
          <div className="text-xs text-blue-200 mt-1">Editor akan otomatis mengekstrak seluruh file &amp; aset</div>
        </div>
      )}

      {/* Global Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-2.5 rounded-xl shadow-2xl border text-xs font-medium flex items-center gap-2.5 animate-in slide-in-from-bottom-3 duration-200 bg-slate-900 border-slate-700 text-white">
          {toast.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
          {toast.type === 'error' && <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />}
          {toast.type === 'info' && <Info className="w-4 h-4 text-blue-400 shrink-0" />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Top Bar (Strict 3-zone contract) */}
      <TopNavbar
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onUploadZip={handleUploadZip}
        onExportZip={handleExportZip}
        onOpenFullscreenPreview={() => setIsFullscreenPreview(true)}
        onOpenVisualTweaks={() => setIsVisualTweaksOpen(true)}
        onOpenAssetManager={() => setIsAssetManagerOpen(true)}
        onOpenCheatSheet={() => setIsCheatSheetOpen(true)}
        onOpenTemplatePicker={() => setIsTemplatePickerOpen(true)}
        currentProjectName={projectName}
      />

      {/* Main Workspace Area */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left: File Tree Explorer (hidden in preview-only mode) */}
        {viewMode !== 'preview' && (
          <FileTree
            files={files}
            activeFile={activeFile}
            onSelectFile={handleSelectFile}
            onCreateFile={handleCreateFile}
            onDeleteFile={handleDeleteFile}
            onRenameFile={handleRenameFile}
            onUploadAsset={handleUploadAsset}
          />
        )}

        {/* Center: Code Editor */}
        {(viewMode === 'split' || viewMode === 'code') && (
          <CodeEditor
            files={files}
            activeFile={activeFile}
            openTabs={openTabs}
            onSelectFile={handleSelectFile}
            onCloseTab={handleCloseTab}
            onFileContentChange={handleFileContentChange}
            onInsertSnippet={snippet => {
              // handled inside CodeEditor
            }}
          />
        )}

        {/* Right: Responsive Live Preview with Asset Resolver */}
        {(viewMode === 'split' || viewMode === 'preview') && (
          <LivePreview
            files={files}
            simulationState={simulationState}
            onUpdateSimulation={setSimulationState}
            isFullscreen={false}
            onToggleFullscreen={() => setIsFullscreenPreview(true)}
            activeHtmlPage={activeHtmlPage}
            onSelectHtmlPage={page => {
              setActiveHtmlPage(page);
              handleSelectFile(page);
            }}
          />
        )}
      </div>

      {/* Fullscreen Preview Modal ("Tampilan Penuh" - as specifically requested) */}
      {isFullscreenPreview && (
        <LivePreview
          files={files}
          simulationState={simulationState}
          onUpdateSimulation={setSimulationState}
          isFullscreen={true}
          onToggleFullscreen={() => setIsFullscreenPreview(false)}
          activeHtmlPage={activeHtmlPage}
          onSelectHtmlPage={page => {
            setActiveHtmlPage(page);
            handleSelectFile(page);
          }}
        />
      )}

      {/* Asset Manager Modal */}
      <AssetManagerModal
        isOpen={isAssetManagerOpen}
        onClose={() => setIsAssetManagerOpen(false)}
        files={files}
        onUploadAsset={handleUploadAsset}
        onDeleteAsset={handleDeleteFile}
      />

      {/* Visual Quick Tweaks Modal */}
      <VisualTweaksModal
        isOpen={isVisualTweaksOpen}
        onClose={() => setIsVisualTweaksOpen(false)}
        files={files}
        onSaveFileContent={handleFileContentChange}
      />

      {/* Template Picker Modal */}
      <TemplatePickerModal
        isOpen={isTemplatePickerOpen}
        onClose={() => setIsTemplatePickerOpen(false)}
        onSelectTemplate={handleSelectTemplate}
        currentTemplateId={currentTemplateId}
      />

      {/* MikroTik Cheat Sheet & Winbox Guide */}
      <MikrotikCheatSheetModal
        isOpen={isCheatSheetOpen}
        onClose={() => setIsCheatSheetOpen(false)}
      />
    </div>
  );
}
